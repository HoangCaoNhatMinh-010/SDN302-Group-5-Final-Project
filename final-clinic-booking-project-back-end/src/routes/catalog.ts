import { Router } from "express";
import { authorize, authenticate, currentUser } from "../lib/auth";
import { audit } from "../lib/audit";
import { HttpError } from "../lib/errors";
import { assertObjectId } from "../lib/errors";
import { requirePositiveNumber, requireString } from "../lib/validate";
import { DoctorProfile } from "../models/DoctorProfile";
import { Service } from "../models/Service";
import { Specialty } from "../models/Specialty";
import { User } from "../models/User";

const router = Router();

router.get("/specialties", async (_req, res) => {
  res.json({ items: await Specialty.find({ active: true }).sort({ name: 1 }) });
});

router.get("/doctors", async (req, res) => {
  const filter: Record<string, unknown> = { active: true };
  if (typeof req.query.specialty === "string" && req.query.specialty) {
    assertObjectId(req.query.specialty, "Chuyên khoa");
    filter.specialty = req.query.specialty;
  }
  const doctors = await DoctorProfile.find(filter)
    .populate({ path: "user", select: "name" })
    .populate({ path: "specialty", select: "name description" })
    .sort({ consultationFee: 1 });
  res.json({ items: doctors });
});

router.get("/doctors/:id", async (req, res) => {
  assertObjectId(req.params.id, "Bác sĩ");
  const doctor = await DoctorProfile.findOne({ _id: req.params.id, active: true })
    .populate({ path: "user", select: "name" })
    .populate({ path: "specialty", select: "name description" });
  if (!doctor) {
    throw new HttpError(404, "Không tìm thấy bác sĩ.", "NOT_FOUND");
  }
  res.json({ doctor });
});

router.get("/services", async (_req, res) => {
  res.json({ items: await Service.find({ active: true }).sort({ name: 1 }) });
});

router.post("/specialties", authenticate, authorize("MANAGER", "ADMIN"), async (req, res) => {
  const specialty = await Specialty.create({
    name: requireString(req.body.name, "Tên chuyên khoa", 100),
    description: typeof req.body.description === "string" ? req.body.description.trim() : undefined,
  });
  await audit(currentUser(req)._id, "CREATE", "SPECIALTY", specialty.id);
  res.status(201).json({ specialty });
});

router.patch("/specialties/:id", authenticate, authorize("MANAGER", "ADMIN"), async (req, res) => {
  assertObjectId(req.params.id, "Chuyên khoa");
  const specialty = await Specialty.findByIdAndUpdate(
    req.params.id,
    {
      ...(req.body.name !== undefined && { name: requireString(req.body.name, "Tên chuyên khoa", 100) }),
      ...(req.body.description !== undefined && { description: String(req.body.description).trim() }),
      ...(req.body.active !== undefined && { active: Boolean(req.body.active) }),
    },
    { new: true, runValidators: true }
  );
  if (!specialty) {
    throw new HttpError(404, "Không tìm thấy chuyên khoa.", "NOT_FOUND");
  }
  await audit(currentUser(req)._id, "UPDATE", "SPECIALTY", specialty.id);
  res.json({ specialty });
});

router.post("/services", authenticate, authorize("MANAGER", "ADMIN"), async (req, res) => {
  const service = await Service.create({
    name: requireString(req.body.name, "Tên dịch vụ", 120),
    description: typeof req.body.description === "string" ? req.body.description.trim() : undefined,
    price: requirePositiveNumber(req.body.price, "Giá"),
    durationMinutes: requirePositiveNumber(req.body.durationMinutes, "Thời lượng", 5),
  });
  await audit(currentUser(req)._id, "CREATE", "SERVICE", service.id);
  res.status(201).json({ service });
});

router.patch("/services/:id", authenticate, authorize("MANAGER", "ADMIN"), async (req, res) => {
  assertObjectId(req.params.id, "Dịch vụ");
  const updates = {
    ...(req.body.name !== undefined && { name: requireString(req.body.name, "Tên dịch vụ", 120) }),
    ...(req.body.description !== undefined && { description: String(req.body.description).trim() }),
    ...(req.body.price !== undefined && { price: requirePositiveNumber(req.body.price, "Giá") }),
    ...(req.body.durationMinutes !== undefined && {
      durationMinutes: requirePositiveNumber(req.body.durationMinutes, "Thời lượng", 5),
    }),
    ...(req.body.active !== undefined && { active: Boolean(req.body.active) }),
  };
  const service = await Service.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!service) {
    throw new HttpError(404, "Không tìm thấy dịch vụ.", "NOT_FOUND");
  }
  await audit(currentUser(req)._id, "UPDATE", "SERVICE", service.id);
  res.json({ service });
});

router.post("/doctors", authenticate, authorize("MANAGER", "ADMIN"), async (req, res) => {
  const userId = requireString(req.body.userId, "Tài khoản bác sĩ", 24);
  const specialtyId = requireString(req.body.specialtyId, "Chuyên khoa", 24);
  assertObjectId(userId, "Tài khoản");
  assertObjectId(specialtyId, "Chuyên khoa");
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, "Không tìm thấy tài khoản.", "NOT_FOUND");
  }
  const specialty = await Specialty.findById(specialtyId);
  if (!specialty || !specialty.active) {
    throw new HttpError(400, "Chuyên khoa không tồn tại hoặc đang bị khóa.", "INVALID_SPECIALTY");
  }
  user.role = "DOCTOR";
  const profile = await DoctorProfile.create({
    user: user._id,
    specialty: specialty._id,
    biography: typeof req.body.biography === "string" ? req.body.biography.trim() : undefined,
    yearsOfExperience: requirePositiveNumber(req.body.yearsOfExperience ?? 0, "Số năm kinh nghiệm"),
    consultationFee: requirePositiveNumber(req.body.consultationFee ?? 0, "Phí khám"),
  });
  user.doctorProfile = profile._id;
  await user.save();
  await audit(currentUser(req)._id, "CREATE", "DOCTOR_PROFILE", profile.id);
  res.status(201).json({ doctor: profile });
});

export default router;
