import { Router } from "express";
import { authorize, authenticate, currentUser } from "../lib/auth";
import { audit } from "../lib/audit";
import { HttpError, assertObjectId, isValidDate } from "../lib/errors";
import { notify } from "../lib/notifications";
import { requireString } from "../lib/validate";
import { APPOINTMENT_STATUSES, Appointment, AppointmentStatus } from "../models/Appointment";
import { DoctorProfile } from "../models/DoctorProfile";
import { Schedule } from "../models/Schedule";
import { Service } from "../models/Service";
import { User, UserDocument } from "../models/User";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  const user = currentUser(req);
  const filter: Record<string, unknown> = {};
  if (user.role === "PATIENT") {
    filter.patient = user._id;
  } else if (user.role === "DOCTOR") {
    const profile = user.doctorProfile ?? (await DoctorProfile.findOne({ user: user._id }))?._id;
    if (!profile) {
      throw new HttpError(404, "Tài khoản chưa có hồ sơ bác sĩ.", "DOCTOR_PROFILE_NOT_FOUND");
    }
    filter.doctor = profile;
  }
  if (typeof req.query.date === "string") {
    if (!isValidDate(req.query.date)) {
      throw new HttpError(400, "Ngày không hợp lệ.", "INVALID_DATE");
    }
    const start = new Date(`${req.query.date}T00:00:00+07:00`);
    const end = new Date(`${req.query.date}T23:59:59.999+07:00`);
    filter.slotStart = { $gte: start, $lte: end };
  }
  if (req.query.status !== undefined) {
    if (
      typeof req.query.status !== "string" ||
      !APPOINTMENT_STATUSES.some((status) => status === req.query.status)
    ) {
      throw new HttpError(400, "Trạng thái lịch hẹn không hợp lệ.", "INVALID_STATUS");
    }
    filter.status = req.query.status;
  }
  const appointments = await Appointment.find(filter)
    .populate({ path: "patient", select: "name phone email" })
    .populate({
      path: "doctor",
      populate: [{ path: "user", select: "name" }, { path: "specialty", select: "name" }],
    })
    .populate({ path: "service", select: "name price durationMinutes" })
    .populate({ path: "schedule", select: "date" })
    .sort({ slotStart: 1 });
  res.json({ items: appointments });
});

router.post("/", authenticate, authorize("PATIENT", "RECEPTIONIST"), async (req, res) => {
  const scheduleId = requireString(req.body.scheduleId, "Lịch khám", 24);
  const slotStart = new Date(String(req.body.slotStart));
  assertObjectId(scheduleId, "Lịch khám");
  if (Number.isNaN(slotStart.getTime()) || slotStart <= new Date()) {
    throw new HttpError(400, "Giờ khám không hợp lệ hoặc đã qua.", "INVALID_SLOT");
  }
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    throw new HttpError(404, "Không tìm thấy lịch khám.", "SCHEDULE_NOT_FOUND");
  }
  const user = currentUser(req);
  let patient = user;
  if (user.role === "RECEPTIONIST") {
    const patientId = requireString(req.body.patientId, "Bệnh nhân", 24);
    assertObjectId(patientId, "Bệnh nhân");
    const selectedPatient = await User.findOne({ _id: patientId, role: "PATIENT", active: true });
    if (!selectedPatient) {
      throw new HttpError(404, "Không tìm thấy bệnh nhân đang hoạt động.", "PATIENT_NOT_FOUND");
    }
    patient = selectedPatient;
  }
  let serviceId: string | undefined;
  if (req.body.serviceId !== undefined && req.body.serviceId !== "") {
    serviceId = requireString(req.body.serviceId, "Dịch vụ", 24);
    assertObjectId(serviceId, "Dịch vụ");
    const service = await Service.findOne({ _id: serviceId, active: true });
    if (!service) {
      throw new HttpError(404, "Không tìm thấy dịch vụ đang hoạt động.", "SERVICE_NOT_FOUND");
    }
  }
  const slot = schedule.slots.find((item) => item.startAt.getTime() === slotStart.getTime());
  if (!slot || slot.status !== "AVAILABLE") {
    throw new HttpError(409, "Khung giờ này vừa được đặt hoặc không còn trống.", "SLOT_UNAVAILABLE");
  }

  const reserved = await Schedule.findOneAndUpdate(
    {
      _id: schedule._id,
      slots: { $elemMatch: { startAt: slotStart, status: "AVAILABLE" } },
    },
    { $set: { "slots.$.status": "BOOKED" } },
    { new: true }
  );
  if (!reserved) {
    throw new HttpError(409, "Khung giờ này vừa được đặt.", "SLOT_UNAVAILABLE");
  }

  let appointment;
  try {
    appointment = await Appointment.create({
      patient: patient._id,
      doctor: schedule.doctor,
      schedule: schedule._id,
      ...(serviceId && { service: serviceId }),
      slotStart,
      reason: typeof req.body.reason === "string" ? req.body.reason.trim().slice(0, 1000) : undefined,
      status: "CONFIRMED",
    });
  } catch (error) {
    const existing = await Appointment.exists({ schedule: schedule._id, slotStart });
    if (!existing) {
      await Schedule.updateOne(
        { _id: schedule._id, slots: { $elemMatch: { startAt: slotStart, status: "BOOKED" } } },
        { $set: { "slots.$.status": "AVAILABLE" } }
      );
    }
    throw error;
  }

  const warnings: string[] = [];
  try {
    const doctor = await DoctorProfile.findById(schedule.doctor).populate<{ user: UserDocument }>("user");
    await notify(
      patient._id,
      "Đặt lịch thành công",
      "Lịch khám của bạn đã được xác nhận lúc <%= time %>.",
      { time: slotStart.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) }
    );
    if (doctor?.user?._id) {
      await notify(
        doctor.user._id,
        "Lịch khám mới",
        "Bạn có bệnh nhân mới lúc <%= time %>.",
        { time: slotStart.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) }
      );
    }
  } catch (error) {
    console.error("Appointment notification could not be saved:", error);
    warnings.push("Lịch đã được đặt nhưng chưa thể lưu thông báo.");
  }
  try {
    await audit(user._id, "BOOK", "APPOINTMENT", appointment.id, {
      patientId: String(patient._id),
    });
  } catch (error) {
    console.error("Appointment audit record could not be saved:", error);
    warnings.push("Lịch đã được đặt nhưng chưa thể ghi audit log.");
  }
  res.status(201).json({ appointment, warnings });
});

router.get("/:id", authenticate, async (req, res) => {
  assertObjectId(req.params.id, "Lịch hẹn");
  const appointment = await Appointment.findById(req.params.id)
    .populate({ path: "patient", select: "name phone email dateOfBirth gender address" })
    .populate({
      path: "doctor",
      populate: [{ path: "user", select: "name" }, { path: "specialty", select: "name" }],
    })
    .populate({ path: "service", select: "name price durationMinutes" })
  if (!appointment) {
    throw new HttpError(404, "Không tìm thấy lịch hẹn.", "NOT_FOUND");
  }
  await assertAppointmentAccess(req, appointment.patient, appointment.doctor);
  res.json({ appointment });
});

router.post("/:id/cancel", authenticate, async (req, res) => {
  assertObjectId(req.params.id, "Lịch hẹn");
  const user = currentUser(req);
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    throw new HttpError(404, "Không tìm thấy lịch hẹn.", "NOT_FOUND");
  }
  const isOwner = String(appointment.patient) === String(user._id);
  if (!isOwner && !["RECEPTIONIST", "MANAGER", "ADMIN"].includes(user.role)) {
    throw new HttpError(403, "Bạn không có quyền hủy lịch này.", "FORBIDDEN");
  }
  if (appointment.status !== "CONFIRMED" || appointment.slotStart.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
    throw new HttpError(409, "Chỉ có thể hủy lịch đã xác nhận trước giờ khám ít nhất 24 tiếng.", "CANCELLATION_WINDOW_CLOSED");
  }
  const cancelledAt = new Date();
  const cancelled = await Appointment.findOneAndUpdate(
    {
      _id: appointment._id,
      status: "CONFIRMED",
      slotStart: { $gt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    },
    {
      $set: {
        status: "CANCELLED",
        cancelledAt,
        cancellationReason: typeof req.body.reason === "string" ? req.body.reason.trim().slice(0, 500) : undefined,
      },
    },
    { new: true }
  );
  if (!cancelled) {
    throw new HttpError(409, "Lịch hẹn vừa được cập nhật hoặc đã quá thời gian hủy.", "CANCELLATION_WINDOW_CLOSED");
  }
  await Schedule.updateOne(
    { _id: appointment.schedule, slots: { $elemMatch: { startAt: appointment.slotStart, status: "BOOKED" } } },
    { $set: { "slots.$.status": "AVAILABLE" } }
  );
  await audit(user._id, "CANCEL", "APPOINTMENT", cancelled.id);
  res.json({ appointment: cancelled });
});

router.patch("/:id/status", authenticate, authorize("RECEPTIONIST", "DOCTOR", "MANAGER", "ADMIN"), async (req, res) => {
  assertObjectId(req.params.id, "Lịch hẹn");
  const status = requireString(req.body.status, "Trạng thái", 30) as AppointmentStatus;
  const allowed: AppointmentStatus[] = ["CHECKED_IN", "IN_CONSULTATION", "COMPLETED", "NO_SHOW"];
  if (!allowed.includes(status)) {
    throw new HttpError(400, "Trạng thái không hợp lệ cho thao tác này.", "INVALID_STATUS");
  }
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    throw new HttpError(404, "Không tìm thấy lịch hẹn.", "NOT_FOUND");
  }
  const user = currentUser(req);
  if (user.role === "DOCTOR") {
    const profile = user.doctorProfile ?? (await DoctorProfile.findOne({ user: user._id }))?._id;
    if (!profile || String(appointment.doctor) !== String(profile)) {
      throw new HttpError(403, "Bác sĩ chỉ được cập nhật lịch của mình.", "FORBIDDEN");
    }
  }
  if (
    (user.role === "RECEPTIONIST" && !["CHECKED_IN", "NO_SHOW"].includes(status)) ||
    (user.role === "DOCTOR" && !["IN_CONSULTATION", "COMPLETED", "NO_SHOW"].includes(status))
  ) {
    throw new HttpError(403, "Vai trò của bạn không được phép đặt trạng thái này.", "FORBIDDEN");
  }
  const transitions: Record<AppointmentStatus, AppointmentStatus[]> = {
    CONFIRMED: ["CHECKED_IN", "NO_SHOW"],
    CHECKED_IN: ["IN_CONSULTATION", "NO_SHOW"],
    IN_CONSULTATION: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: [],
  };
  if (!transitions[appointment.status].includes(status)) {
    throw new HttpError(409, `Không thể chuyển từ ${appointment.status} sang ${status}.`, "INVALID_STATUS_TRANSITION");
  }
  const updated = await Appointment.findOneAndUpdate(
    { _id: appointment._id, status: appointment.status },
    { $set: { status, ...(status === "CHECKED_IN" && { checkedInAt: new Date() }) } },
    { new: true }
  );
  if (!updated) {
    throw new HttpError(409, "Lịch hẹn vừa được cập nhật. Tải lại trước khi thử lại.", "APPOINTMENT_CHANGED");
  }
  await audit(user._id, "STATUS_CHANGE", "APPOINTMENT", updated.id, { status });
  res.json({ appointment: updated });
});

router.patch("/:id/clinical-notes", authenticate, authorize("DOCTOR"), async (req, res) => {
  assertObjectId(req.params.id, "Lịch hẹn");
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    throw new HttpError(404, "Không tìm thấy lịch hẹn.", "NOT_FOUND");
  }
  const user = currentUser(req);
  const profile = user.doctorProfile ?? (await DoctorProfile.findOne({ user: user._id }))?._id;
  if (!profile || String(appointment.doctor) !== String(profile)) {
    throw new HttpError(403, "Bác sĩ chỉ được cập nhật hồ sơ khám của mình.", "FORBIDDEN");
  }
  if (!["CHECKED_IN", "IN_CONSULTATION"].includes(appointment.status)) {
    throw new HttpError(409, "Chỉ có thể ghi hồ sơ cho lượt khám đang tiếp nhận.", "APPOINTMENT_NOT_ACTIVE");
  }
  const updated = await Appointment.findOneAndUpdate(
    { _id: appointment._id, doctor: profile, status: { $in: ["CHECKED_IN", "IN_CONSULTATION"] } },
    {
      $set: {
        diagnosis: typeof req.body.diagnosis === "string" ? req.body.diagnosis.trim().slice(0, 2000) : "",
        clinicalNotes: typeof req.body.notes === "string" ? req.body.notes.trim().slice(0, 5000) : "",
        prescription: typeof req.body.prescription === "string" ? req.body.prescription.trim().slice(0, 5000) : "",
        status: "COMPLETED",
      },
    },
    { new: true }
  );
  if (!updated) {
    throw new HttpError(409, "Lịch hẹn vừa được cập nhật. Tải lại trước khi thử lại.", "APPOINTMENT_CHANGED");
  }
  await audit(user._id, "WRITE_CLINICAL_NOTES", "APPOINTMENT", updated.id);
  res.json({ appointment: updated });
});

async function assertAppointmentAccess(
  req: Parameters<typeof authenticate>[0],
  patient: unknown,
  doctor: unknown
): Promise<void> {
  const user = currentUser(req);
  if (["RECEPTIONIST", "MANAGER", "ADMIN"].includes(user.role)) {
    return;
  }
  const patientId = documentId(patient);
  const doctorId = documentId(doctor);
  if (user.role === "PATIENT" && patientId === String(user._id)) {
    return;
  }
  if (user.role === "DOCTOR") {
    const profile = user.doctorProfile ?? (await DoctorProfile.findOne({ user: user._id }))?._id;
    if (profile && doctorId === String(profile)) {
      return;
    }
  }
  throw new HttpError(403, "Bạn không có quyền xem lịch hẹn này.", "FORBIDDEN");
}

function documentId(value: unknown): string {
  if (value && typeof value === "object" && "_id" in value) {
    return String(value._id);
  }
  return String(value);
}

export default router;
