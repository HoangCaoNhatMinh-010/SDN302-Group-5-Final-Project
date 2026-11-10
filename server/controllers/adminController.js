import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import AdminSetting, { ADMIN_SETTING_SECTIONS } from '../models/AdminSetting.js';
import Appointment from '../models/Appointment.js';
import AuditLog from '../models/AuditLog.js';
import Staff from '../models/Staff.js';
import Owner from '../models/Owner.js';
import Specialty from '../models/Service.js';
import User, { USER_ROLES } from '../models/User.js';

const STAFF_ROLES = USER_ROLES.filter((role) => role !== 'PET_OWNER');
const ALL_ROLES = USER_ROLES;
const SERVICE_SPECIES = { 'Chó': 'dog', 'Mèo': 'cat', 'Khác': 'rabbit', dog: 'dog', cat: 'cat', rabbit: 'rabbit' };
const STAFF_ROLE_BY_USER_ROLE = {
  GROOMER: 'GROOMER',
  VET_DOCTOR: 'VET',
  RECEPTIONIST: 'RECEPTIONIST',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
};
const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const writeAuditLog = async (actor, { action, category, target, details = '' }) => {
  await AuditLog.create({
    actor_id: actor._id,
    actor_type: 'STAFF',
    action,
    entity_type: category,
    changes: {
      actorName: actor.name,
      actorEmail: actor.email,
      target,
      details,
    },
  });
};

const toAuditLogDto = (log) => ({
  id: log._id.toString(),
  action: log.action,
  actorName: log.changes?.actorName || log.actor_type || 'Hệ thống',
  actorEmail: log.changes?.actorEmail || '',
  target: log.changes?.target || log.entity_type,
  details: log.changes?.details || '',
  createdAt: log.created_at,
});

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
  if (typeof description !== 'string') {
    throw createHttpError(400, 'Mô tả cấu hình không hợp lệ.');
  }
  if (name.trim().length > 120 || description.length > 1000) {
    throw createHttpError(400, 'Tên hoặc mô tả cấu hình vượt quá độ dài cho phép.');
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
    const groomingServiceIds = await Specialty.distinct('_id', { category: 'grooming' });
    const [users, staffByRole, ownerCount, specialtyCount, appointmentCount, auditCount, recentAuditLogs] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Staff.aggregate([{ $match: { is_active: true, deleted_at: null } }, { $group: { _id: '$role', count: { $sum: 1 } } }]),
      Owner.countDocuments({ is_active: true, deleted_at: null }),
      Specialty.countDocuments({ category: 'grooming', is_active: true, deleted_at: null }),
      Appointment.countDocuments({ service_id: { $in: groomingServiceIds } }),
      AuditLog.countDocuments({
        created_at: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      AuditLog.find().sort({ created_at: -1 }).limit(8),
    ]);

    res.json({
      success: true,
      data: {
        usersByRole: users,
        staffByRole,
        ownerCount,
        specialtyCount,
        appointmentCount,
        auditCount,
        recentAuditLogs: recentAuditLogs.map(toAuditLogDto),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminReports = async (req, res, next) => {
  try {
    const groomingServiceIds = await Specialty.distinct('_id', { category: 'grooming' });
    const groomingAppointments = { service_id: { $in: groomingServiceIds } };
    const [usersByRole, staffByRole, ownerCount, appointmentsByStatus, appointmentCount, specialtyCount] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Staff.aggregate([{ $match: { is_active: true, deleted_at: null } }, { $group: { _id: '$role', count: { $sum: 1 } } }]),
      Owner.countDocuments({ is_active: true, deleted_at: null }),
      Appointment.aggregate([
        { $match: groomingAppointments },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Appointment.countDocuments(groomingAppointments),
      Specialty.countDocuments({ category: 'grooming', is_active: true, deleted_at: null }),
    ]);
    res.json({
      success: true,
      data: { usersByRole, staffByRole, ownerCount, appointmentsByStatus, appointmentCount, specialtyCount },
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
    if (typeof phone !== 'string' || !/^0\d{9}$/.test(phone.trim())) {
      throw createHttpError(400, 'Số điện thoại nhân viên phải gồm 10 chữ số và bắt đầu bằng 0.');
    }
    if (typeof password !== 'string' || password.length < 8) {
      throw createHttpError(400, 'Mật khẩu khởi tạo phải có ít nhất 8 ký tự.');
    }
    if (!STAFF_ROLES.includes(role)) {
      throw createHttpError(400, 'Vai trò nhân viên không hợp lệ.');
    }

    const cleanPhone = phone.trim();
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      password,
      role,
      title: typeof title === 'string' && title.trim() ? title.trim() : role,
    });
    try {
      await Staff.findOneAndUpdate(
        { phone: cleanPhone },
        {
          $set: {
            full_name: name.trim(),
            email: email.trim().toLowerCase(),
            password_hash: await bcrypt.hash(password, 12),
            role: STAFF_ROLE_BY_USER_ROLE[role],
            is_active: true,
            deleted_at: null,
          },
          $setOnInsert: { service_ids: [] },
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      throw error;
    }
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
    const user = await User.findById(req.params.id).select('+password');
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
    const previousPhone = user.phone;
    const nextPhone = update.phone ?? previousPhone;
    const nextRole = update.role ?? user.role;
    if (STAFF_ROLE_BY_USER_ROLE[nextRole] && !nextPhone) {
      throw createHttpError(400, 'Tài khoản nhân viên cần có số điện thoại hợp lệ.');
    }
    if (nextPhone && nextPhone !== previousPhone && await Staff.exists({ phone: nextPhone })) {
      throw createHttpError(409, 'Số điện thoại này đã được gán cho một hồ sơ nhân viên khác.');
    }
    Object.assign(user, update, { role: nextRole });
    await user.save();
    const existingStaff = previousPhone
      ? await Staff.findOne({ phone: previousPhone })
      : null;
    const nextStaffRole = STAFF_ROLE_BY_USER_ROLE[nextRole];
    if (nextStaffRole && nextPhone) {
      const staffData = {
        phone: nextPhone,
        full_name: user.name,
        email: user.email,
        password_hash: user.password,
        role: nextStaffRole,
        is_active: user.isActive,
        deleted_at: null,
      };
      if (existingStaff) {
        Object.assign(existingStaff, staffData);
        if (nextStaffRole !== 'GROOMER') existingStaff.service_ids = [];
        await existingStaff.save();
      } else {
        await Staff.create({ ...staffData, service_ids: [] });
      }
    } else if (existingStaff) {
      existingStaff.is_active = false;
      existingStaff.deleted_at = new Date();
      await existingStaff.save();
    }
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

export const listAdminOwners = async (req, res, next) => {
  try {
    const filter = { is_active: true, deleted_at: null };
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      const query = escapeRegex(req.query.search.trim().slice(0, 100));
      filter.$or = [
        { full_name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
      ];
    }
    const owners = await Owner.find(filter)
      .select('full_name email phone')
      .sort({ full_name: 1 })
      .limit(100);
    res.json({
      success: true,
      data: owners.map((owner) => ({
        id: owner._id.toString(),
        fullName: owner.full_name,
        email: owner.email,
        phone: owner.phone,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const linkAdminUserOwner = async (req, res, next) => {
  try {
    ensureValidObjectId(req.params.id);
    if (!mongoose.isValidObjectId(req.body.ownerId)) {
      throw createHttpError(400, 'Mã hồ sơ chủ thú cưng không hợp lệ.');
    }

    const [user, owner] = await Promise.all([
      User.findById(req.params.id),
      Owner.findOne({
        _id: req.body.ownerId,
        is_active: true,
        deleted_at: null,
      }),
    ]);
    if (!user || user.role !== 'PET_OWNER') {
      throw createHttpError(404, 'Không tìm thấy tài khoản khách hàng cần liên kết.');
    }
    if (!owner) throw createHttpError(404, 'Hồ sơ chủ thú cưng không tồn tại hoặc đã bị vô hiệu hóa.');

    const existingLink = await User.findOne({
      ownerId: owner._id,
      _id: { $ne: user._id },
    }).select('_id');
    if (existingLink) {
      throw createHttpError(409, 'Hồ sơ chủ thú cưng đã được liên kết với một tài khoản khác.');
    }

    user.ownerId = owner._id;
    user.ownerLinkStatus = 'LINKED';
    await user.save();
    await writeAuditLog(req.user, {
      action: 'LINK_OWNER_ACCOUNT',
      category: 'owners',
      target: user.email,
      details: `Liên kết tài khoản với hồ sơ chủ thú cưng ${owner._id.toString()} sau khi cửa hàng xác minh.`,
    });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getRoleSummary = async (req, res, next) => {
  try {
    const rawCounts = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    const counts = ALL_ROLES.map((role) => ({
      _id: role,
      count: rawCounts.find((item) => item._id === role)?.count || 0,
    }));
    res.json({ success: true, data: { roles: ALL_ROLES, counts } });
  } catch (error) {
    next(error);
  }
};

export const listAdminSpecialties = async (req, res, next) => {
  try {
    const specialties = await Specialty.find({ category: 'grooming', deleted_at: null }).sort({ display_order: 1, name: 1 });
    res.json({ success: true, data: specialties });
  } catch (error) {
    next(error);
  }
};

export const listAdminGroomers = async (req, res, next) => {
  try {
    const groomers = await Staff.find({ role: 'GROOMER', deleted_at: null })
      .select('-password_hash')
      .populate({
      path: 'service_ids',
      match: { category: 'grooming', deleted_at: null },
      })
      .sort({ full_name: 1 });
    res.json({ success: true, data: groomers });
  } catch (error) {
    next(error);
  }
};

const validateGroomerPayload = async (body, existingStaff = null) => {
  const fields = ['name', 'specialty', 'email', 'phone', 'title', 'department', 'room', 'bio'];
  const values = {};
  for (const field of fields) {
    if (body[field] === undefined && existingStaff) continue;
    const existingValue = field === 'name'
      ? existingStaff?.full_name
      : field === 'specialty'
        ? existingStaff?.service_ids?.find((service) => service?.category === 'grooming')?.name
        : existingStaff?.[field];
    const value = body[field] ?? existingValue ?? '';
    if (typeof value !== 'string') throw createHttpError(400, `Thông tin ${field} không hợp lệ.`);
    values[field] = value.trim();
  }
  if (!values.name || !values.specialty) {
    throw createHttpError(400, 'Tên chuyên viên và dịch vụ phụ trách không được để trống.');
  }
  if (!/^0\d{9}$/.test(values.phone)) {
    throw createHttpError(400, 'Số điện thoại chuyên viên phải gồm 10 chữ số và bắt đầu bằng 0.');
  }
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    throw createHttpError(400, 'Email chuyên viên không hợp lệ.');
  }
  const service = await Specialty.findOne({
    name: values.specialty,
    category: 'grooming',
    is_active: true,
    deleted_at: null,
  });
  if (!service) throw createHttpError(400, 'Dịch vụ grooming được chọn không tồn tại.');

  for (const field of ['experienceYears']) {
    const value = body[field] ?? existingStaff?.experience_years ?? 0;
    if (!Number.isFinite(Number(value)) || Number(value) < 0) {
      throw createHttpError(400, `Trường ${field} phải là số không âm.`);
    }
    values.experience_years = Number(value);
  }
  const preservedServiceIds = existingStaff
    ? await Specialty.find({
      _id: { $in: existingStaff.service_ids.map((service) => service?._id || service) },
      category: { $ne: 'grooming' },
    }).distinct('_id')
    : [];
  return {
    full_name: values.name,
    role: 'GROOMER',
    service_ids: [...preservedServiceIds, service._id],
    email: values.email,
    phone: values.phone,
    password_hash: existingStaff?.password_hash
      || await bcrypt.hash(randomBytes(32).toString('hex'), 12),
    has_vet_license: false,
    is_active: existingStaff?.is_active ?? true,
    deleted_at: null,
  };
};

export const createAdminGroomer = async (req, res, next) => {
  try {
    const values = await validateGroomerPayload(req.body);
    const groomer = await Staff.create(values);
    await writeAuditLog(req.user, {
      action: 'CREATE_GROOMER',
      category: 'staff',
      target: groomer.full_name,
    });
    res.status(201).json({ success: true, data: groomer });
  } catch (error) {
    next(error);
  }
};

export const updateAdminGroomer = async (req, res, next) => {
  try {
    ensureValidObjectId(req.params.id);
    const groomer = await Staff.findById(req.params.id).populate('service_ids');
    if (!groomer) throw createHttpError(404, 'Không tìm thấy hồ sơ chuyên viên.');
    if (groomer.role !== 'GROOMER') throw createHttpError(404, 'Không tìm thấy hồ sơ chuyên viên grooming.');
    const values = await validateGroomerPayload(req.body, groomer);
    Object.assign(groomer, values);
    await groomer.save();
    await writeAuditLog(req.user, {
      action: 'UPDATE_GROOMER',
      category: 'staff',
      target: groomer.full_name,
    });
    res.json({ success: true, data: groomer });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminGroomer = async (req, res, next) => {
  try {
    ensureValidObjectId(req.params.id);
    const groomer = await Staff.findById(req.params.id);
    if (!groomer) throw createHttpError(404, 'Không tìm thấy hồ sơ chuyên viên.');
    if (groomer.role !== 'GROOMER') throw createHttpError(404, 'Không tìm thấy hồ sơ chuyên viên grooming.');
    if (await Appointment.exists({ staff_id: groomer._id })) {
      throw createHttpError(409, 'Không thể xóa chuyên viên đã được gán cho lịch hẹn.');
    }
    groomer.is_active = false;
    groomer.deleted_at = new Date();
    await groomer.save();
    await writeAuditLog(req.user, {
      action: 'DELETE_GROOMER',
      category: 'staff',
      target: groomer.full_name,
    });
    res.json({ success: true, message: 'Đã xóa hồ sơ chuyên viên.' });
  } catch (error) {
    next(error);
  }
};

export const createAdminSpecialty = async (req, res, next) => {
  try {
    const {
      name,
      description = '',
      price = 0,
      durationMinutes = 60,
      species = ['Chó', 'Mèo', 'Khác'],
      room = '',
      icon = 'Activity',
    } = req.body;
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 120) {
      throw createHttpError(400, 'Tên dịch vụ/chuyên khoa không được để trống.');
    }
    if (typeof description !== 'string' || typeof room !== 'string' || typeof icon !== 'string') {
      throw createHttpError(400, 'Thông tin dịch vụ/chuyên khoa không hợp lệ.');
    }
    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      throw createHttpError(400, 'Giá dịch vụ phải là số không âm.');
    }
    if (!Number.isInteger(Number(durationMinutes)) || Number(durationMinutes) < 15) {
      throw createHttpError(400, 'Thời lượng dịch vụ phải từ 15 phút trở lên.');
    }
    if (!Array.isArray(species) || species.some((item) => !SERVICE_SPECIES[item])) {
      throw createHttpError(400, 'Danh sách loài áp dụng không hợp lệ.');
    }
    const specialty = await Specialty.create({
      name: name.trim(),
      category: 'grooming',
      description,
      price: Number(price),
      duration_minutes: Number(durationMinutes),
      species: species.map((item) => SERVICE_SPECIES[item]),
      allow_online_booking: true,
      requires_vet_license: false,
      is_active: true,
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
    if (specialty.category !== 'grooming') throw createHttpError(404, 'Không tìm thấy dịch vụ grooming.');
    const { name, description, price, durationMinutes, species, room, icon } = req.body;
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim() || name.trim().length > 120) {
        throw createHttpError(400, 'Tên dịch vụ/chuyên khoa không hợp lệ.');
      }
      if (name.trim() !== specialty.name) {
        const [groomer, appointment] = await Promise.all([
          Staff.exists({ service_ids: specialty._id }),
          Appointment.exists({ service_id: specialty._id }),
        ]);
        if (groomer || appointment) {
          throw createHttpError(409, 'Không thể đổi tên dịch vụ đang được chuyên viên hoặc lịch hẹn sử dụng.');
        }
      }
      specialty.name = name.trim();
    }
    if (description !== undefined) {
      if (typeof description !== 'string') throw createHttpError(400, 'Mô tả dịch vụ không hợp lệ.');
      specialty.description = description;
    }
    if (room !== undefined) {
      if (typeof room !== 'string') throw createHttpError(400, 'Khu vực phục vụ không hợp lệ.');
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
    if (durationMinutes !== undefined) {
      if (!Number.isInteger(Number(durationMinutes)) || Number(durationMinutes) < 15) {
        throw createHttpError(400, 'Thời lượng dịch vụ phải từ 15 phút trở lên.');
      }
      specialty.duration_minutes = Number(durationMinutes);
    }
    if (species !== undefined) {
      if (!Array.isArray(species) || species.some((item) => !SERVICE_SPECIES[item])) {
        throw createHttpError(400, 'Danh sách loài áp dụng không hợp lệ.');
      }
      specialty.species = species.map((item) => SERVICE_SPECIES[item]);
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
    if (specialty.category !== 'grooming') throw createHttpError(404, 'Không tìm thấy dịch vụ grooming.');
    const [groomer, appointment] = await Promise.all([
      Staff.exists({ service_ids: specialty._id }),
      Appointment.exists({ service_id: specialty._id }),
    ]);
    if (groomer || appointment) {
      throw createHttpError(409, 'Không thể xóa dịch vụ đang được chuyên viên hoặc lịch hẹn sử dụng.');
    }
    specialty.is_active = false;
    specialty.deleted_at = new Date();
    await specialty.save();
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
      filter.entity_type = req.query.category.trim();
    }
    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const query = escapeRegex(req.query.q.trim().slice(0, 100));
      filter.$or = [
        { action: { $regex: query, $options: 'i' } },
        { entity_type: { $regex: query, $options: 'i' } },
        { 'changes.actorName': { $regex: query, $options: 'i' } },
        { 'changes.actorEmail': { $regex: query, $options: 'i' } },
        { 'changes.target': { $regex: query, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      AuditLog.find(filter).sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit),
      AuditLog.countDocuments(filter),
    ]);
    res.json({ success: true, data: { items: items.map(toAuditLogDto), total, page, limit } });
  } catch (error) {
    next(error);
  }
};
