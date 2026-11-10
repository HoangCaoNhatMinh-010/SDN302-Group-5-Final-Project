import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';
import { Specialty } from '../models/Specialty.js';
import { Appointment } from '../models/Appointment.js';
import { AdminSetting, ADMIN_SETTING_SECTIONS } from '../models/AdminSetting.js';
import { AuditLog } from '../models/AuditLog.js';

const STAFF_ROLES = ['DOCTOR', 'RECEPTIONIST', 'CLINIC_MANAGER', 'ADMIN'];
const ALL_ROLES = ['PATIENT', ...STAFF_ROLES];

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const writeAuditLog = async (actor, { action, category, target, details = '' }) => {
  await AuditLog.create({
    actorId: actor._id,
    actorName: actor.name,
    actorEmail: actor.email,
    action,
    category,
    target,
    details,
  });
};

const ensureValidObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createHttpError(400, 'Mã tài nguyên không hợp lệ.');
  }
};

const ensureCanChangeAdmin = async (target, actorId, update) => {
  const changesAdminAccess =
    target.role === 'ADMIN' &&
    ((update.role && update.role !== 'ADMIN') || update.isActive === false);

  if (!changesAdminAccess) return;
  if (target._id.equals(actorId)) {
    throw createHttpError(400, 'Bạn không thể tự hạ quyền hoặc vô hiệu hóa tài khoản admin của mình.');
  }

  const activeAdminCount = await User.countDocuments({ role: 'ADMIN', isActive: true });
  if (activeAdminCount <= 1) {
    throw createHttpError(400, 'Không thể vô hiệu hóa hoặc hạ quyền admin đang hoạt động cuối cùng.');
  }
};

const validateSettingPayload = (body) => {
  const { name, description = '', config = {}, enabled = true } = body;
  if (typeof name !== 'string' || !name.trim()) {
    throw createHttpError(400, 'Tên cấu hình không được để trống.');
  }
  if (name.trim().length > 120 || description.length > 1000) {
    throw createHttpError(400, 'Tên hoặc mô tả cấu hình vượt quá độ dài cho phép.');
  }
  if (typeof description !== 'string') {
    throw createHttpError(400, 'Mô tả cấu hình không hợp lệ.');
  }
  if (config === null || typeof config !== 'object' || Array.isArray(config)) {
    throw createHttpError(400, 'Nội dung cấu hình phải là một đối tượng JSON.');
  }
  if (JSON.stringify(config).length > 20000) {
    throw createHttpError(400, 'Cấu hình vượt quá dung lượng 20 KB.');
  }
  if (typeof enabled !== 'boolean') {
    throw createHttpError(400, 'Trạng thái cấu hình không hợp lệ.');
  }
  return { name: name.trim(), description: description.trim(), config, enabled };
};

const rejectIntegrationSecrets = (section, config) => {
  if (section !== 'integrations') return;
  const containsSecret = (value) => {
    if (!value || typeof value !== 'object') return false;
    return Object.entries(value).some(([key, child]) =>
      /(password|secret|token|credential|api[_-]?key)/i.test(key) || containsSecret(child)
    );
  };
  if (containsSecret(config)) {
    throw createHttpError(400, 'Không lưu mật khẩu, token, API key hoặc thông tin bí mật trong cấu hình tích hợp.');
  }
};

export const getAdminSummary = async (req, res, next) => {
  try {
    const [users, specialtyCount, appointmentCount, auditCount, recentAuditLogs] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Specialty.countDocuments(),
      Appointment.countDocuments(),
      AuditLog.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      AuditLog.find().sort({ createdAt: -1 }).limit(8),
    ]);

    res.json({
      success: true,
      data: {
        usersByRole: users,
        specialtyCount,
        appointmentCount,
        auditCount,
        recentAuditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminReports = async (req, res, next) => {
  try {
    const [usersByRole, appointmentsByStatus, appointmentCount, specialtyCount] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Appointment.countDocuments(),
      Specialty.countDocuments(),
    ]);
    res.json({
      success: true,
      data: { usersByRole, appointmentsByStatus, appointmentCount, specialtyCount },
    });
  } catch (error) {
    next(error);
  }
};

export const listAdminUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role && ALL_ROLES.includes(req.query.role)) {
      filter.role = req.query.role;
    }
    if (req.query.q) {
      const query = escapeRegex(String(req.query.q).trim().slice(0, 100));
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
      ];
    }
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const createAdminUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, title } = req.body;
    if (typeof name !== 'string' || !name.trim()) {
      throw createHttpError(400, 'Họ và tên không được để trống.');
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw createHttpError(400, 'Email không hợp lệ.');
    }
    if (typeof password !== 'string' || password.length < 8) {
      throw createHttpError(400, 'Mật khẩu khởi tạo phải có ít nhất 8 ký tự.');
    }
    if (!STAFF_ROLES.includes(role)) {
      throw createHttpError(400, 'Vai trò nhân viên không hợp lệ.');
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: typeof phone === 'string' && phone.trim() ? phone.trim() : undefined,
      password,
      role,
      title: typeof title === 'string' && title.trim() ? title.trim() : role,
    });
    await writeAuditLog(req.user, {
      action: 'CREATE_USER',
      category: 'staff',
      target: user.email,
      details: `Tạo tài khoản với vai trò ${user.role}`,
    });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error.code === 11000) {
      return next(createHttpError(409, 'Email hoặc số điện thoại đã được sử dụng.'));
    }
    next(error);
  }
};

export const updateAdminUser = async (req, res, next) => {
  try {
    ensureValidObjectId(req.params.id);
    const user = await User.findById(req.params.id);
    if (!user) throw createHttpError(404, 'Không tìm thấy người dùng.');

    const update = {};
    for (const field of ['name', 'email', 'phone', 'title']) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== 'string') {
          throw createHttpError(400, `Trường ${field} không hợp lệ.`);
        }
        update[field] = req.body[field].trim();
      }
    }
    if (update.name !== undefined && !update.name) {
      throw createHttpError(400, 'Họ và tên không được để trống.');
    }
    if (update.email !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(update.email)) {
        throw createHttpError(400, 'Email không hợp lệ.');
      }
      update.email = update.email.toLowerCase();
    }
    if (update.phone === '') update.phone = undefined;

    if (req.body.role !== undefined) {
      if (!ALL_ROLES.includes(req.body.role)) {
        throw createHttpError(400, 'Vai trò không hợp lệ.');
      }
      update.role = req.body.role;
    }
    if (req.body.isActive !== undefined) {
      if (typeof req.body.isActive !== 'boolean') {
        throw createHttpError(400, 'Trạng thái tài khoản không hợp lệ.');
      }
      update.isActive = req.body.isActive;
    }

    await ensureCanChangeAdmin(user, req.user._id, update);
    Object.assign(user, update);
    await user.save();
    await writeAuditLog(req.user, {
      action: 'UPDATE_USER',
      category: update.role ? 'rbac' : 'staff',
      target: user.email,
      details: Object.keys(update).join(', '),
    });
    res.json({ success: true, data: user });
  } catch (error) {
    if (error.code === 11000) {
      return next(createHttpError(409, 'Email hoặc số điện thoại đã được sử dụng.'));
    }
    next(error);
  }
};

export const getRoleSummary = async (req, res, next) => {
  try {
    const counts = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    res.json({ success: true, data: { roles: ALL_ROLES, counts } });
  } catch (error) {
    next(error);
  }
};

export const listAdminSpecialties = async (req, res, next) => {
  try {
    const specialties = await Specialty.find().sort({ name: 1 });
    res.json({ success: true, data: specialties });
  } catch (error) {
    next(error);
  }
};

export const listAdminDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });
    res.json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
};

const validateDoctorPayload = async (body, existingDoctor = null) => {
  const fields = ['name', 'specialty', 'email', 'phone', 'title', 'department', 'room', 'bio'];
  const values = {};
  for (const field of fields) {
    if (body[field] === undefined && existingDoctor) continue;
    const value = body[field] ?? existingDoctor?.[field] ?? '';
    if (typeof value !== 'string') throw createHttpError(400, `Thông tin ${field} không hợp lệ.`);
    values[field] = value.trim();
  }
  if (!values.name || !values.specialty) {
    throw createHttpError(400, 'Tên bác sĩ và chuyên khoa không được để trống.');
  }
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    throw createHttpError(400, 'Email bác sĩ không hợp lệ.');
  }
  const specialtyExists = await Specialty.exists({ name: values.specialty });
  if (!specialtyExists) throw createHttpError(400, 'Chuyên khoa được chọn không tồn tại.');

  for (const field of ['experienceYears', 'consultationFee']) {
    const value = body[field] ?? existingDoctor?.[field] ?? 0;
    if (!Number.isFinite(Number(value)) || Number(value) < 0) {
      throw createHttpError(400, `Trường ${field} phải là số không âm.`);
    }
    values[field] = Number(value);
  }
  return values;
};

export const createAdminDoctor = async (req, res, next) => {
  try {
    const values = await validateDoctorPayload(req.body);
    const doctor = await Doctor.create(values);
    await writeAuditLog(req.user, {
      action: 'CREATE_DOCTOR',
      category: 'staff',
      target: doctor.name,
    });
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

export const updateAdminDoctor = async (req, res, next) => {
  try {
    ensureValidObjectId(req.params.id);
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) throw createHttpError(404, 'Không tìm thấy hồ sơ bác sĩ.');
    const values = await validateDoctorPayload(req.body, doctor);
    Object.assign(doctor, values);
    await doctor.save();
    await writeAuditLog(req.user, {
      action: 'UPDATE_DOCTOR',
      category: 'staff',
      target: doctor.name,
    });
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminDoctor = async (req, res, next) => {
  try {
    ensureValidObjectId(req.params.id);
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) throw createHttpError(404, 'Không tìm thấy hồ sơ bác sĩ.');
    if (await Appointment.exists({ doctorId: doctor._id })) {
      throw createHttpError(409, 'Không thể xóa bác sĩ đã được gán cho lịch hẹn.');
    }
    await doctor.deleteOne();
    await writeAuditLog(req.user, {
      action: 'DELETE_DOCTOR',
      category: 'staff',
      target: doctor.name,
    });
    res.json({ success: true, message: 'Đã xóa hồ sơ bác sĩ.' });
  } catch (error) {
    next(error);
  }
};

export const createAdminSpecialty = async (req, res, next) => {
  try {
    const { name, description = '', price = 0, room = '', icon = 'Activity' } = req.body;
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 120) {
      throw createHttpError(400, 'Tên dịch vụ/chuyên khoa không được để trống.');
    }
    if (typeof description !== 'string' || typeof room !== 'string' || typeof icon !== 'string') {
      throw createHttpError(400, 'Thông tin dịch vụ/chuyên khoa không hợp lệ.');
    }
    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      throw createHttpError(400, 'Giá dịch vụ phải là số không âm.');
    }
    const specialty = await Specialty.create({
      name: name.trim(),
      description,
      price: Number(price),
      room,
      icon,
    });
    await writeAuditLog(req.user, {
      action: 'CREATE_SPECIALTY',
      category: 'services',
      target: specialty.name,
    });
    res.status(201).json({ success: true, data: specialty });
  } catch (error) {
    if (error.code === 11000) {
      return next(createHttpError(409, 'Tên chuyên khoa/dịch vụ đã tồn tại.'));
    }
    next(error);
  }
};

export const updateAdminSpecialty = async (req, res, next) => {
  try {
    ensureValidObjectId(req.params.id);
    const specialty = await Specialty.findById(req.params.id);
    if (!specialty) throw createHttpError(404, 'Không tìm thấy chuyên khoa/dịch vụ.');
    const { name, description, price, room, icon } = req.body;
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim() || name.trim().length > 120) {
        throw createHttpError(400, 'Tên dịch vụ/chuyên khoa không hợp lệ.');
      }
      if (name.trim() !== specialty.name) {
        const [doctor, appointment] = await Promise.all([
          Doctor.exists({ specialty: specialty.name }),
          Appointment.exists({ specialty: specialty.name }),
        ]);
        if (doctor || appointment) {
          throw createHttpError(409, 'Không thể đổi tên chuyên khoa đang được bác sĩ hoặc lịch hẹn sử dụng.');
        }
      }
      specialty.name = name.trim();
    }
    if (description !== undefined) {
      if (typeof description !== 'string') throw createHttpError(400, 'Mô tả dịch vụ không hợp lệ.');
      specialty.description = description;
    }
    if (room !== undefined) {
      if (typeof room !== 'string') throw createHttpError(400, 'Phòng khám không hợp lệ.');
      specialty.room = room;
    }
    if (icon !== undefined) {
      if (typeof icon !== 'string') throw createHttpError(400, 'Biểu tượng không hợp lệ.');
      specialty.icon = icon;
    }
    if (price !== undefined) {
      if (!Number.isFinite(Number(price)) || Number(price) < 0) {
        throw createHttpError(400, 'Giá dịch vụ phải là số không âm.');
      }
      specialty.price = Number(price);
    }
    await specialty.save();
    await writeAuditLog(req.user, {
      action: 'UPDATE_SPECIALTY',
      category: 'services',
      target: specialty.name,
    });
    res.json({ success: true, data: specialty });
  } catch (error) {
    if (error.code === 11000) {
      return next(createHttpError(409, 'Tên chuyên khoa/dịch vụ đã tồn tại.'));
    }
    next(error);
  }
};

export const deleteAdminSpecialty = async (req, res, next) => {
  try {
    ensureValidObjectId(req.params.id);
    const specialty = await Specialty.findById(req.params.id);
    if (!specialty) throw createHttpError(404, 'Không tìm thấy chuyên khoa/dịch vụ.');
    const [doctor, appointment] = await Promise.all([
      Doctor.exists({ specialty: specialty.name }),
      Appointment.exists({ specialty: specialty.name }),
    ]);
    if (doctor || appointment) {
      throw createHttpError(409, 'Không thể xóa chuyên khoa đang được bác sĩ hoặc lịch hẹn sử dụng.');
    }
    await specialty.deleteOne();
    await writeAuditLog(req.user, {
      action: 'DELETE_SPECIALTY',
      category: 'services',
      target: specialty.name,
    });
    res.json({ success: true, message: 'Đã xóa dịch vụ/chuyên khoa.' });
  } catch (error) {
    next(error);
  }
};

export const listAdminSettings = async (req, res, next) => {
  try {
    const { section } = req.params;
    if (!ADMIN_SETTING_SECTIONS.includes(section)) {
      throw createHttpError(404, 'Nhóm cấu hình không hợp lệ.');
    }
    const settings = await AdminSetting.find({ section }).sort({ name: 1 });
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const createAdminSetting = async (req, res, next) => {
  try {
    const { section } = req.params;
    if (!ADMIN_SETTING_SECTIONS.includes(section)) {
      throw createHttpError(404, 'Nhóm cấu hình không hợp lệ.');
    }
    const values = validateSettingPayload(req.body);
    rejectIntegrationSecrets(section, values.config);
    const setting = await AdminSetting.create({
      ...values,
      section,
      updatedBy: req.user._id,
    });
    await writeAuditLog(req.user, {
      action: 'CREATE_SETTING',
      category: section,
      target: setting.name,
    });
    res.status(201).json({ success: true, data: setting });
  } catch (error) {
    if (error.code === 11000) {
      return next(createHttpError(409, 'Tên cấu hình đã tồn tại trong mục này.'));
    }
    next(error);
  }
};

export const updateAdminSetting = async (req, res, next) => {
  try {
    const { section, id } = req.params;
    if (!ADMIN_SETTING_SECTIONS.includes(section)) {
      throw createHttpError(404, 'Nhóm cấu hình không hợp lệ.');
    }
    ensureValidObjectId(id);
    const setting = await AdminSetting.findOne({ _id: id, section });
    if (!setting) throw createHttpError(404, 'Không tìm thấy cấu hình.');
    const values = validateSettingPayload(req.body);
    rejectIntegrationSecrets(section, values.config);
    Object.assign(setting, values, { updatedBy: req.user._id });
    await setting.save();
    await writeAuditLog(req.user, {
      action: 'UPDATE_SETTING',
      category: section,
      target: setting.name,
    });
    res.json({ success: true, data: setting });
  } catch (error) {
    if (error.code === 11000) {
      return next(createHttpError(409, 'Tên cấu hình đã tồn tại trong mục này.'));
    }
    next(error);
  }
};

export const deleteAdminSetting = async (req, res, next) => {
  try {
    const { section, id } = req.params;
    if (!ADMIN_SETTING_SECTIONS.includes(section)) {
      throw createHttpError(404, 'Nhóm cấu hình không hợp lệ.');
    }
    ensureValidObjectId(id);
    const setting = await AdminSetting.findOneAndDelete({ _id: id, section });
    if (!setting) throw createHttpError(404, 'Không tìm thấy cấu hình.');
    await writeAuditLog(req.user, {
      action: 'DELETE_SETTING',
      category: section,
      target: setting.name,
    });
    res.json({ success: true, message: 'Đã xóa cấu hình.' });
  } catch (error) {
    next(error);
  }
};

export const getAdminAuditLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
    const filter = {};
    if (typeof req.query.category === 'string' && req.query.category.trim()) {
      filter.category = req.query.category.trim();
    }
    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const query = escapeRegex(req.query.q.trim().slice(0, 100));
      filter.$or = [
        { action: { $regex: query, $options: 'i' } },
        { actorName: { $regex: query, $options: 'i' } },
        { actorEmail: { $regex: query, $options: 'i' } },
        { target: { $regex: query, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      AuditLog.countDocuments(filter),
    ]);
    res.json({ success: true, data: { items, total, page, limit } });
  } catch (error) {
    next(error);
  }
};
