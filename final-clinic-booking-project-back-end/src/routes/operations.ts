import { Router } from "express";
import { authorize, authenticate, currentUser } from "../lib/auth";
import { audit } from "../lib/audit";
import { HttpError, assertObjectId, isValidDate } from "../lib/errors";
import { requirePhone, requirePositiveNumber, requireString } from "../lib/validate";
import { Appointment } from "../models/Appointment";
import { AuditLog } from "../models/AuditLog";
import { ConsentRecord } from "../models/ConsentRecord";
import { DoctorProfile } from "../models/DoctorProfile";
import { Notification } from "../models/Notification";
import { Payment } from "../models/Payment";
import { Service } from "../models/Service";
import { User, USER_ROLES, UserDocument, UserRole } from "../models/User";

const router = Router();

router.get("/users", authenticate, authorize("RECEPTIONIST", "MANAGER", "ADMIN"), async (req, res) => {
  const filter: { role?: UserRole } = {};
  if (req.query.role !== undefined) {
    if (typeof req.query.role !== "string") {
      throw new HttpError(400, "Vai trò tìm kiếm không hợp lệ.", "VALIDATION_ERROR");
    }
    const role = USER_ROLES.find((candidate) => candidate === req.query.role);
    if (!role) {
      throw new HttpError(400, "Vai trò tìm kiếm không hợp lệ.", "VALIDATION_ERROR");
    }
    filter.role = role;
  }
  const items = await User.find(filter).select("name phone email role active createdAt").sort({ createdAt: -1 });
  res.json({ items });
});

router.post("/users", authenticate, authorize("MANAGER", "ADMIN"), async (req, res) => {
  const name = requireString(req.body.name, "Tên", 120);
  const phone = requirePhone(req.body.phone);
  const password = requireString(req.body.password, "Mật khẩu", 128);
  const role = requireString(req.body.role, "Vai trò", 30) as UserRole;
  if (!USER_ROLES.includes(role) || role === "PATIENT") {
    throw new HttpError(400, "Vai trò nhân viên không hợp lệ.", "INVALID_ROLE");
  }
  if (password.length < 10) {
    throw new HttpError(400, "Mật khẩu cần có ít nhất 10 ký tự.", "WEAK_PASSWORD");
  }
  const user = new User({
    name,
    phone,
    email: typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : undefined,
    role,
  });
  await User.register(user, password);
  await audit(currentUser(req)._id, "CREATE", "USER", user.id, { role });
  res.status(201).json({ user: safeUser(user) });
});

router.patch("/users/:id", authenticate, authorize("MANAGER", "ADMIN"), async (req, res) => {
  assertObjectId(req.params.id, "Tài khoản");
  const target = await User.findById(req.params.id);
  if (!target) {
    throw new HttpError(404, "Không tìm thấy tài khoản.", "NOT_FOUND");
  }
  const actor = currentUser(req);
  if (req.body.role !== undefined) {
    const role = requireString(req.body.role, "Vai trò", 30) as UserRole;
    if (!USER_ROLES.includes(role) || (actor.role !== "ADMIN" && role === "ADMIN")) {
      throw new HttpError(403, "Không được phép gán vai trò này.", "ROLE_CHANGE_FORBIDDEN");
    }
    if (target.role === "ADMIN" && actor.role !== "ADMIN") {
      throw new HttpError(403, "Chỉ admin mới có thể thay đổi tài khoản admin.", "ROLE_CHANGE_FORBIDDEN");
    }
    target.role = role;
  }
  if (req.body.active !== undefined) {
    if (typeof req.body.active !== "boolean") {
      throw new HttpError(400, "Trạng thái tài khoản không hợp lệ.", "VALIDATION_ERROR");
    }
    target.active = req.body.active;
    if (!target.active) {
      target.authVersion += 1;
    }
  }
  await target.save();
  await audit(actor._id, "UPDATE", "USER", target.id, { role: target.role, active: target.active });
  res.json({ user: safeUser(target) });
});

router.patch("/profile", authenticate, async (req, res) => {
  const user = currentUser(req);
  if (req.body.name !== undefined) {
    user.name = requireString(req.body.name, "Tên", 120);
  }
  if (req.body.email !== undefined) {
    user.email = typeof req.body.email === "string" && req.body.email.trim()
      ? req.body.email.trim().toLowerCase()
      : undefined;
  }
  if (req.body.address !== undefined) {
    user.address = requireString(req.body.address, "Địa chỉ", 500);
  }
  if (req.body.gender !== undefined) {
    if (!["FEMALE", "MALE", "OTHER"].includes(req.body.gender)) {
      throw new HttpError(400, "Giới tính không hợp lệ.", "VALIDATION_ERROR");
    }
    user.gender = req.body.gender;
  }
  if (req.body.dateOfBirth !== undefined) {
    const dateOfBirth = new Date(String(req.body.dateOfBirth));
    if (Number.isNaN(dateOfBirth.getTime()) || dateOfBirth > new Date()) {
      throw new HttpError(400, "Ngày sinh không hợp lệ.", "VALIDATION_ERROR");
    }
    user.dateOfBirth = dateOfBirth;
  }
  await user.save();
  res.json({ user: safeUser(user) });
});

router.get("/roles", authenticate, authorize("ADMIN"), (_req, res) => {
  res.json({ items: USER_ROLES });
});

router.get("/audit", authenticate, authorize("ADMIN"), async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const items = await AuditLog.find()
    .populate({ path: "actor", select: "name phone role" })
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json({ items });
});

router.get("/reports/summary", authenticate, authorize("MANAGER", "ADMIN"), async (req, res) => {
  if (
    (typeof req.query.from === "string" && !isValidDate(req.query.from)) ||
    (typeof req.query.to === "string" && !isValidDate(req.query.to))
  ) {
    throw new HttpError(400, "Khoảng ngày báo cáo không hợp lệ.", "INVALID_DATE_RANGE");
  }
  const start = typeof req.query.from === "string" ? new Date(`${req.query.from}T00:00:00+07:00`) : new Date(new Date().setHours(0, 0, 0, 0));
  const end = typeof req.query.to === "string" ? new Date(`${req.query.to}T23:59:59.999+07:00`) : new Date();
  if (end < start) {
    throw new HttpError(400, "Khoảng ngày báo cáo không hợp lệ.", "INVALID_DATE_RANGE");
  }
  const [total, byStatus, activePatients, activeDoctors] = await Promise.all([
    Appointment.countDocuments({ slotStart: { $gte: start, $lte: end } }),
    Appointment.aggregate([
      { $match: { slotStart: { $gte: start, $lte: end } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    User.countDocuments({ role: "PATIENT", active: true }),
    DoctorProfile.countDocuments({ active: true }),
  ]);
  res.json({ totalAppointments: total, appointmentsByStatus: byStatus, activePatients, activeDoctors });
});

router.get("/notifications", authenticate, async (req, res) => {
  const items = await Notification.find({ recipient: currentUser(req)._id }).sort({ createdAt: -1 }).limit(100);
  res.json({ items });
});

router.patch("/notifications/:id/read", authenticate, async (req, res) => {
  assertObjectId(req.params.id, "Thông báo");
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: currentUser(req)._id },
    { $set: { readAt: new Date() } },
    { new: true }
  );
  if (!notification) {
    throw new HttpError(404, "Không tìm thấy thông báo.", "NOT_FOUND");
  }
  res.json({ notification });
});

router.get("/consents", authenticate, async (req, res) => {
  const items = await ConsentRecord.find({ user: currentUser(req)._id }).sort({ acceptedAt: -1 });
  res.json({ items });
});

router.post("/consents", authenticate, async (req, res) => {
  const type = requireString(req.body.type, "Loại đồng ý", 80);
  const version = requireString(req.body.version, "Phiên bản điều khoản", 40);
  const user = currentUser(req);
  const record = await ConsentRecord.create({ user: user._id, type, version });
  await audit(user._id, "ACCEPT_CONSENT", "CONSENT", record.id, { type, version });
  res.status(201).json({ consent: record });
});

router.post("/payments", authenticate, authorize("PATIENT"), async (req, res) => {
  const appointmentId = requireString(req.body.appointmentId, "Lịch hẹn", 24);
  assertObjectId(appointmentId, "Lịch hẹn");
  const user = currentUser(req);
  const appointment = await Appointment.findOne({ _id: appointmentId, patient: user._id });
  if (!appointment || appointment.status === "CANCELLED") {
    throw new HttpError(404, "Không tìm thấy lịch hẹn có thể thanh toán.", "APPOINTMENT_NOT_FOUND");
  }
  const existing = await Payment.findOne({ appointment: appointment._id });
  if (existing) {
    res.json({ payment: existing });
    return;
  }
  const [doctor, service] = await Promise.all([
    DoctorProfile.findById(appointment.doctor),
    appointment.service ? Service.findById(appointment.service) : Promise.resolve(null),
  ]);
  const amount = service?.price ?? doctor?.consultationFee;
  if (amount === undefined || amount <= 0) {
    throw new HttpError(409, "Chưa cấu hình phí khám cho bác sĩ.", "CONSULTATION_FEE_NOT_CONFIGURED");
  }
  const payment = await Payment.create({
    appointment: appointment._id,
    patient: user._id,
    amount,
    currency: "VND",
    status: "PENDING",
    provider: "MANUAL",
  });
  await audit(user._id, "CREATE_PAYMENT_INTENT", "PAYMENT", payment.id);
  res.status(201).json({ payment });
});

router.get("/payments", authenticate, authorize("PATIENT", "RECEPTIONIST", "MANAGER", "ADMIN"), async (req, res) => {
  const user = currentUser(req);
  const filter = user.role === "PATIENT" ? { patient: user._id } : {};
  const items = await Payment.find(filter).populate({ path: "appointment", select: "slotStart status" }).sort({ createdAt: -1 });
  res.json({ items });
});

router.patch("/payments/:id/record", authenticate, authorize("RECEPTIONIST", "MANAGER", "ADMIN"), async (req, res) => {
  assertObjectId(req.params.id, "Thanh toán");
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    throw new HttpError(404, "Không tìm thấy thanh toán.", "NOT_FOUND");
  }
  if (payment.status !== "PENDING") {
    throw new HttpError(409, "Chỉ ghi nhận được thanh toán đang chờ.", "INVALID_PAYMENT_STATE");
  }
  payment.status = "PAID";
  payment.provider = "MANUAL";
  payment.providerReference =
    typeof req.body.reference === "string" ? req.body.reference.trim().slice(0, 100) : undefined;
  payment.paidAt = new Date();
  await payment.save();
  await audit(currentUser(req)._id, "RECORD_PAYMENT", "PAYMENT", payment.id);
  res.json({ payment });
});

router.patch("/payments/:id/refund", authenticate, authorize("MANAGER", "ADMIN"), async (req, res) => {
  assertObjectId(req.params.id, "Thanh toán");
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    throw new HttpError(404, "Không tìm thấy thanh toán.", "NOT_FOUND");
  }
  if (payment.status !== "PAID") {
    throw new HttpError(409, "Chỉ hoàn tiền cho giao dịch đã thanh toán.", "INVALID_PAYMENT_STATE");
  }
  payment.status = "REFUNDED";
  await payment.save();
  await audit(currentUser(req)._id, "REFUND_PAYMENT", "PAYMENT", payment.id);
  res.json({ payment });
});

function safeUser(user: UserDocument) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    active: user.active,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    address: user.address,
  };
}

export default router;
