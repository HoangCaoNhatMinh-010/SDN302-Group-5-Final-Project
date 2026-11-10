import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment.js';
import { Doctor } from '../models/Doctor.js';
import { FamilyMember } from '../models/FamilyMember.js';
import { Notification } from '../models/Notification.js';
import { Specialty } from '../models/Specialty.js';
import { StaffShift } from '../models/StaffShift.js';
import { resolveOwner } from '../utils/resolveOwner.js';

const isValidBookingDate = (date) => {
  if (typeof date !== 'string' || !/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return null;
  const [day, month, year] = date.split('/').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day
    ? parsed
    : null;
};

const parseBookingTime = (time) => {
  if (typeof time !== 'string') return null;
  const match = time.match(/^([01]\d|2[0-3]):([0-5]\d) - ([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  const startMinutes = Number(match[1]) * 60 + Number(match[2]);
  const endMinutes = Number(match[3]) * 60 + Number(match[4]);
  return endMinutes > startMinutes ? { startMinutes, endMinutes } : null;
};

const formatMinute = (minute) => `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
const dayEnd = (date) => new Date(date.getTime() + 24 * 60 * 60 * 1000);
const activeStatuses = ['REQUESTED', 'AWAITING_DEPOSIT', 'CONFIRMED', 'IN_PROGRESS', 'PENDING', 'WAITING'];
const populateAppointment = (query) => query
  .populate('staff_id', 'full_name role')
  .populate('pet_id', 'name species breed weight_kg special_notes')
  .populate('service_id', 'name price duration_minutes category');

export const getMyAppointments = async (req, res) => {
  try {
    const owner = await resolveOwner(req.user);
    const groomingServiceIds = await Specialty.distinct('_id', { category: 'grooming' });
    const appointments = await populateAppointment(
      Appointment.find({ owner_id: owner._id, service_id: { $in: groomingServiceIds } })
        .sort({ appointment_date: -1, start_time: -1 })
    );
    return res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'ID lịch hẹn không hợp lệ' });
    }
    const owner = await resolveOwner(req.user);
    const groomingServiceIds = await Specialty.distinct('_id', { category: 'grooming' });
    const appointment = await populateAppointment(
      Appointment.findOne({
        _id: req.params.id,
        owner_id: owner._id,
        service_id: { $in: groomingServiceIds },
      })
    );
    if (!appointment) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch hẹn' });
    return res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, serviceId, familyMemberId, careNotes, symptoms, notes = '' } = req.body;
    if (![doctorId, familyMemberId, serviceId].every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn thú cưng, dịch vụ và chuyên viên hợp lệ.' });
    }
    const bookingDate = isValidBookingDate(date);
    if (!bookingDate) return res.status(400).json({ success: false, message: 'Ngày hẹn không hợp lệ (DD/MM/YYYY).' });
    const today = new Date();
    const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    if (bookingDate.getTime() < todayUtc) {
      return res.status(400).json({ success: false, message: 'Ngày hẹn phải từ hôm nay trở đi.' });
    }
    const requestedRange = parseBookingTime(time);
    if (!requestedRange || requestedRange.startMinutes % 30 !== 0) {
      return res.status(400).json({ success: false, message: 'Khung giờ hẹn không hợp lệ.' });
    }

    const owner = await resolveOwner(req.user);
    const [staff, service, pet] = await Promise.all([
      Doctor.findOne({ _id: doctorId, role: 'GROOMER', is_active: true, deleted_at: null }),
      Specialty.findOne({
        _id: serviceId,
        category: 'grooming',
        is_active: true,
        deleted_at: null,
        allow_online_booking: true,
        requires_vet_license: false,
      }),
      FamilyMember.findOne({
        _id: familyMemberId,
        owner_id: owner._id,
        is_active: true,
        deleted_at: null,
      }),
    ]);
    if (!staff) return res.status(404).json({ success: false, message: 'Chuyên viên grooming không tồn tại hoặc đang ngừng hoạt động.' });
    if (!service) return res.status(404).json({ success: false, message: 'Dịch vụ spa/grooming không tồn tại hoặc không nhận đặt trực tuyến.' });
    if (!pet) return res.status(404).json({ success: false, message: 'Không tìm thấy thú cưng thuộc tài khoản của bạn.' });
    if (!staff.service_ids.some((id) => id.toString() === service._id.toString())) {
      return res.status(400).json({ success: false, message: 'Chuyên viên chưa được phân công dịch vụ đã chọn.' });
    }

    const endMinute = requestedRange.startMinutes + service.duration_minutes;
    if (endMinute > 24 * 60) return res.status(400).json({ success: false, message: 'Thời lượng dịch vụ vượt quá cuối ngày.' });

    const shifts = await StaffShift.find({
      staff_id: staff._id,
      work_date: { $gte: bookingDate, $lt: dayEnd(bookingDate) },
      is_blocked: false,
    });
    const isWithinShift = shifts.some((shift) => {
      const start = Number(shift.start_time.slice(0, 2)) * 60 + Number(shift.start_time.slice(3, 5));
      const end = Number(shift.end_time.slice(0, 2)) * 60 + Number(shift.end_time.slice(3, 5));
      return requestedRange.startMinutes >= start && endMinute <= end;
    });
    if (!isWithinShift) {
      return res.status(400).json({ success: false, message: 'Khung giờ đã chọn nằm ngoài ca làm việc của chuyên viên.' });
    }

    const existing = await Appointment.find({
      staff_id: staff._id,
      appointment_date: { $gte: bookingDate, $lt: dayEnd(bookingDate) },
      status: { $in: activeStatuses },
    }).select('start_time end_time');
    const overlaps = existing.some((appointment) => {
      const start = Number(appointment.start_time.slice(0, 2)) * 60 + Number(appointment.start_time.slice(3, 5));
      const end = Number(appointment.end_time.slice(0, 2)) * 60 + Number(appointment.end_time.slice(3, 5));
      return requestedRange.startMinutes < end && endMinute > start;
    });
    if (overlaps) {
      return res.status(409).json({ success: false, message: 'Khung giờ vừa được khách khác đặt. Vui lòng chọn giờ khác.' });
    }

    const startTime = formatMinute(requestedRange.startMinutes);
    const endTime = formatMinute(endMinute);
    const dateKey = bookingDate.toISOString().slice(0, 10);
    const reservationKeys = Array.from(
      { length: Math.ceil(endMinute / 30) - Math.floor(requestedRange.startMinutes / 30) },
      (_, index) => `${staff._id}:${dateKey}:${Math.floor(requestedRange.startMinutes / 30) * 30 + index * 30}`
    );
    const depositRequired = service.deposit_amount || 0;
    const appointment = await Appointment.create({
      owner_id: owner._id,
      pet_id: pet._id,
      service_id: service._id,
      staff_id: staff._id,
      appointment_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      status: depositRequired > 0 ? 'AWAITING_DEPOSIT' : 'CONFIRMED',
      owner_snapshot: { full_name: owner.full_name, phone: owner.phone },
      pet_snapshot: {
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        allergies: pet.allergies,
        special_notes: pet.special_notes,
      },
      service_snapshot: {
        name: service.name,
        price: service.price,
        duration_minutes: service.duration_minutes,
        requires_vet_license: service.requires_vet_license,
      },
      customer_notes: careNotes || symptoms || notes || pet.special_notes || '',
      deposit_required: depositRequired,
      deposit_status: depositRequired > 0 ? 'PENDING' : 'NONE',
      slot_key: `${staff._id}:${dateKey}:${requestedRange.startMinutes}`,
      reservation_keys: reservationKeys,
      requested_at: new Date(),
      confirmed_at: depositRequired > 0 ? undefined : new Date(),
      created_by: { owner_id: owner._id, source: 'online' },
    });
    const savedAppointment = await populateAppointment(Appointment.findById(appointment._id));

    await Notification.create({
      userId: req.user.id || req.user._id,
      title: depositRequired > 0 ? 'Yêu cầu đặt lịch đã được ghi nhận 🐾' : 'Đặt lịch chăm sóc thành công 🐾',
      message: `Lịch hẹn cho bé ${pet.name} với ${staff.full_name} lúc ${startTime} ngày ${date} đã được ghi nhận.`,
      type: 'appointment',
    });

    return res.status(201).json({
      success: true,
      message: depositRequired > 0
        ? 'Yêu cầu đã ghi nhận; cần xác nhận tiền cọc trước khi lịch được xác nhận.'
        : 'Đặt lịch chăm sóc thú cưng thành công! 🐾',
      data: savedAppointment,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.reservation_keys) {
      return res.status(409).json({ success: false, message: 'Khung giờ vừa được khách khác đặt. Vui lòng chọn giờ khác.' });
    }
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'ID lịch hẹn không hợp lệ' });
    }
    const owner = await resolveOwner(req.user);
    const groomingServiceIds = await Specialty.distinct('_id', { category: 'grooming' });
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      owner_id: owner._id,
      service_id: { $in: groomingServiceIds },
    });
    if (!appointment) return res.status(404).json({ success: false, message: 'Lịch hẹn không tồn tại' });
    if (['COMPLETED', 'CANCELLED', 'CANCELLED_EARLY', 'CANCELLED_LATE', 'NO_SHOW', 'REJECTED'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: 'Lịch này không thể hủy ở trạng thái hiện tại.' });
    }

    const appointmentTime = appointment.appointment_date.getTime();
    const cancellationStatus = appointmentTime - Date.now() >= 24 * 60 * 60 * 1000
      ? 'CANCELLED_EARLY'
      : 'CANCELLED_LATE';
    appointment.status = cancellationStatus;
    appointment.customer_notes = req.body.cancelReason || 'Khách hàng yêu cầu hủy lịch.';
    appointment.reservation_keys = undefined;
    await appointment.save();

    await Notification.create({
      userId: req.user.id || req.user._id,
      title: 'Đã hủy lịch chăm sóc thú cưng',
      message: `Lịch hẹn ngày ${appointment.appointment_date.toLocaleDateString('en-GB', { timeZone: 'UTC' })} đã được hủy.`,
      type: 'appointment',
    });
    return res.status(200).json({
      success: true,
      message: 'Đã hủy lịch hẹn chăm sóc thú cưng.',
      data: await populateAppointment(Appointment.findById(appointment._id)),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
