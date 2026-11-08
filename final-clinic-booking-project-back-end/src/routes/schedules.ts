import { Router } from "express";
import { authorize, authenticate, currentUser } from "../lib/auth";
import { audit } from "../lib/audit";
import { HttpError, assertObjectId, isValidDate } from "../lib/errors";
import { requireString } from "../lib/validate";
import { Appointment } from "../models/Appointment";
import { DoctorProfile } from "../models/DoctorProfile";
import { Schedule, ScheduleSlot } from "../models/Schedule";

const router = Router();

router.get("/availability", async (req, res) => {
  const doctorId = requireString(req.query.doctorId, "Bác sĩ", 24);
  const date = requireString(req.query.date, "Ngày", 10);
  assertObjectId(doctorId, "Bác sĩ");
  if (!isValidDate(date) || date < new Date().toISOString().slice(0, 10)) {
    throw new HttpError(400, "Ngày khám không hợp lệ hoặc đã qua.", "INVALID_DATE");
  }
  const schedule = await Schedule.findOne({ doctor: doctorId, date });
  const slots = schedule?.slots.filter((slot) => slot.status === "AVAILABLE" && slot.startAt > new Date()) ?? [];
  res.json({ scheduleId: schedule?.id ?? null, slots });
});

router.get("/", authenticate, async (req, res) => {
  const query: Record<string, unknown> = {};
  const requestedDate = typeof req.query.date === "string" ? req.query.date : undefined;
  if (requestedDate) {
    if (!isValidDate(requestedDate)) {
      throw new HttpError(400, "Ngày không hợp lệ.", "INVALID_DATE");
    }
    query.date = requestedDate;
  }

  const user = currentUser(req);
  if (user.role === "DOCTOR") {
    const profile = user.doctorProfile ?? (await DoctorProfile.findOne({ user: user._id }))?._id;
    if (!profile) {
      throw new HttpError(404, "Tài khoản chưa có hồ sơ bác sĩ.", "DOCTOR_PROFILE_NOT_FOUND");
    }
    query.doctor = profile;
  } else if (user.role === "PATIENT") {
    throw new HttpError(403, "Bệnh nhân xem lịch trống qua /schedules/availability.", "FORBIDDEN");
  } else if (typeof req.query.doctorId === "string") {
    assertObjectId(req.query.doctorId, "Bác sĩ");
    query.doctor = req.query.doctorId;
  }

  const schedules = await Schedule.find(query)
    .populate({ path: "doctor", populate: [{ path: "user", select: "name" }, { path: "specialty", select: "name" }] })
    .sort({ date: 1 });
  res.json({ items: schedules });
});

router.post("/", authenticate, authorize("DOCTOR", "RECEPTIONIST", "MANAGER", "ADMIN"), async (req, res) => {
  const doctorId = typeof req.body.doctorId === "string" ? req.body.doctorId : "";
  const date = requireString(req.body.date, "Ngày", 10);
  const startTime = requireString(req.body.startTime, "Giờ bắt đầu", 5);
  const endTime = requireString(req.body.endTime, "Giờ kết thúc", 5);
  const intervalMinutes = Number(req.body.intervalMinutes ?? 30);
  assertObjectId(doctorId, "Bác sĩ");
  if (
    !isValidDate(date) ||
    date < new Date().toISOString().slice(0, 10) ||
    !/^\d{2}:\d{2}$/.test(startTime) ||
    !/^\d{2}:\d{2}$/.test(endTime) ||
    !Number.isInteger(intervalMinutes) ||
    intervalMinutes < 5 ||
    intervalMinutes > 240
  ) {
    throw new HttpError(400, "Ngày, khung giờ hoặc thời lượng không hợp lệ.", "VALIDATION_ERROR");
  }

  const doctor = await DoctorProfile.findById(doctorId);
  if (!doctor || !doctor.active) {
    throw new HttpError(404, "Không tìm thấy bác sĩ đang hoạt động.", "DOCTOR_NOT_FOUND");
  }
  const user = currentUser(req);
  if (user.role === "DOCTOR" && String(doctor.user) !== String(user._id)) {
    throw new HttpError(403, "Bác sĩ chỉ được tạo lịch của mình.", "FORBIDDEN");
  }

  const timezone = "+07:00";
  const start = new Date(`${date}T${startTime}:00${timezone}`);
  const end = new Date(`${date}T${endTime}:00${timezone}`);
  const now = new Date();
  if (end <= start || start <= now) {
    throw new HttpError(400, "Thời gian kết thúc phải sau thời gian bắt đầu và trong tương lai.", "INVALID_TIME_RANGE");
  }

  const slots: ScheduleSlot[] = [];
  for (let cursor = start.getTime(); cursor + intervalMinutes * 60_000 <= end.getTime(); cursor += intervalMinutes * 60_000) {
    slots.push({
      startAt: new Date(cursor),
      endAt: new Date(cursor + intervalMinutes * 60_000),
      status: "AVAILABLE",
    });
  }
  if (slots.length === 0) {
    throw new HttpError(400, "Khung giờ không tạo được slot khám.", "EMPTY_SCHEDULE");
  }

  const schedule = await Schedule.create({
    doctor: doctor._id,
    date,
    slots,
    note: typeof req.body.note === "string" ? req.body.note.trim() : undefined,
    createdBy: user._id,
  });
  await audit(user._id, "CREATE", "SCHEDULE", schedule.id, { date, slotCount: slots.length });
  res.status(201).json({ schedule });
});

router.post("/:id/block-slot", authenticate, authorize("DOCTOR", "RECEPTIONIST", "MANAGER", "ADMIN"), async (req, res) => {
  assertObjectId(req.params.id, "Lịch");
  const startAt = new Date(String(req.body.startAt));
  if (Number.isNaN(startAt.getTime())) {
    throw new HttpError(400, "Thời gian slot không hợp lệ.", "INVALID_SLOT");
  }
  const schedule = await Schedule.findById(req.params.id);
  if (!schedule) {
    throw new HttpError(404, "Không tìm thấy lịch.", "NOT_FOUND");
  }
  const user = currentUser(req);
  if (user.role === "DOCTOR") {
    const profile = user.doctorProfile ?? (await DoctorProfile.findOne({ user: user._id }))?._id;
    if (!profile || String(schedule.doctor) !== String(profile)) {
      throw new HttpError(403, "Bác sĩ chỉ được khóa lịch của mình.", "FORBIDDEN");
    }
  }
  const updated = await Schedule.findOneAndUpdate(
    {
      _id: schedule._id,
      slots: { $elemMatch: { startAt, status: "AVAILABLE" } },
    },
    { $set: { "slots.$.status": "BLOCKED" } },
    { new: true }
  );
  if (!updated) {
    throw new HttpError(409, "Slot không tồn tại hoặc đã có bệnh nhân đặt.", "SLOT_UNAVAILABLE");
  }
  await audit(user._id, "BLOCK_SLOT", "SCHEDULE", schedule.id, { startAt: startAt.toISOString() });
  res.json({ schedule: updated });
});

router.delete("/:id", authenticate, authorize("RECEPTIONIST", "MANAGER", "ADMIN"), async (req, res) => {
  assertObjectId(req.params.id, "Lịch");
  const schedule = await Schedule.findById(req.params.id);
  if (!schedule) {
    throw new HttpError(404, "Không tìm thấy lịch.", "NOT_FOUND");
  }
  if (schedule.slots.some((slot) => slot.status === "BOOKED")) {
    throw new HttpError(409, "Không thể xóa lịch có lượt khám đã đặt.", "SCHEDULE_HAS_BOOKINGS");
  }
  const deleted = await Schedule.findOneAndDelete({
    _id: schedule._id,
    slots: { $not: { $elemMatch: { status: "BOOKED" } } },
  });
  if (!deleted) {
    throw new HttpError(409, "Lịch vừa được cập nhật hoặc đã có lượt khám được đặt.", "SCHEDULE_HAS_BOOKINGS");
  }
  await audit(currentUser(req)._id, "DELETE", "SCHEDULE", req.params.id);
  res.status(204).end();
});

export default router;
