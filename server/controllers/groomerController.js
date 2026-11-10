import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Staff from '../models/Staff.js';
import Service from '../models/Service.js';
import StaffShift from '../models/StaffShift.js';

const parseTimeRange = (time) => {
  const match = typeof time === 'string'
    ? time.match(/^([01]\d|2[0-3]):([0-5]\d) - ([01]\d|2[0-3]):([0-5]\d)$/)
    : null;
  if (!match) return null;
  const startMinute = Number(match[1]) * 60 + Number(match[2]);
  const endMinute = Number(match[3]) * 60 + Number(match[4]);
  return endMinute > startMinute ? { startMinute, endMinute } : null;
};

const formatMinute = (minute) => `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

const getDateRange = (value) => {
  if (typeof value !== 'string' || !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null;
  const [day, month, year] = value.split('/').map(Number);
  const start = new Date(Date.UTC(year, month - 1, day));
  if (start.getUTCFullYear() !== year || start.getUTCMonth() !== month - 1 || start.getUTCDate() !== day) return null;
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
};

const activeStaffFilter = { role: 'GROOMER', is_active: true, deleted_at: null };
const activeServiceFilter = {
  category: 'grooming',
  is_active: true,
  deleted_at: null,
  allow_online_booking: true,
  requires_vet_license: false,
};

export const getAllGroomers = async (req, res) => {
  try {
    const filter = { ...activeStaffFilter };
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      filter.full_name = new RegExp(req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }
    const serviceFilter = req.query.service || req.query.specialty;
    if (typeof serviceFilter === 'string' && serviceFilter.trim()) {
      const service = await Service.findOne({
        ...activeServiceFilter,
        name: new RegExp(serviceFilter.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
      });
      if (!service) return res.status(200).json({ success: true, count: 0, data: [] });
      filter.service_ids = service._id;
    }
    const groomers = await Staff.find(filter).populate({
      path: 'service_ids',
      match: activeServiceFilter,
    }).sort({ full_name: 1 });
    const visibleGroomers = groomers.filter((groomer) => groomer.service_ids.length > 0);
    return res.status(200).json({ success: true, count: visibleGroomers.length, data: visibleGroomers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getGroomerById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'ID chuyên viên không hợp lệ' });
    }
    const groomer = await Staff.findOne({ _id: req.params.id, ...activeStaffFilter }).populate({
      path: 'service_ids',
      match: activeServiceFilter,
    });
    if (!groomer || !groomer.service_ids.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chuyên viên grooming đang hoạt động' });
    }
    return res.status(200).json({ success: true, data: groomer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID chuyên viên không hợp lệ' });
    }
    const dateRange = getDateRange(req.query.date);
    if (!dateRange) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ngày hợp lệ (DD/MM/YYYY)' });
    }
    const groomer = await Staff.findOne({ _id: req.params.id, ...activeStaffFilter });
    if (!groomer) return res.status(404).json({ success: false, message: 'Chuyên viên grooming không tồn tại' });

    const [shifts, bookedAppointments] = await Promise.all([
      StaffShift.find({
        staff_id: groomer._id,
        work_date: { $gte: dateRange.start, $lt: dateRange.end },
      }).sort({ start_time: 1 }),
      Appointment.find({
        staff_id: groomer._id,
        appointment_date: { $gte: dateRange.start, $lt: dateRange.end },
        status: { $in: ['REQUESTED', 'AWAITING_DEPOSIT', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'PENDING', 'WAITING'] },
      }).select('start_time end_time'),
    ]);

    const duration = Number.parseInt(req.query.durationMinutes, 10);
    const durationMinutes = Number.isInteger(duration) && duration > 0 ? duration : 60;
    const shiftSlots = shifts
      .filter((shift) => !shift.is_blocked)
      .flatMap((shift) => {
        const range = parseTimeRange(`${shift.start_time} - ${shift.end_time}`);
        if (!range) return [];
        const slots = [];
        for (let startMinute = Math.ceil(range.startMinute / 30) * 30; startMinute + durationMinutes <= range.endMinute; startMinute += 30) {
          const endMinute = startMinute + durationMinutes;
          const hasOverlap = bookedAppointments.some((appointment) => {
            const start = Number(appointment.start_time.slice(0, 2)) * 60 + Number(appointment.start_time.slice(3, 5));
            const end = Number(appointment.end_time.slice(0, 2)) * 60 + Number(appointment.end_time.slice(3, 5));
            return startMinute < end && endMinute > start;
          });
          slots.push({
            time: `${formatMinute(startMinute)} - ${formatMinute(endMinute)}`,
            isAvailable: !hasOverlap,
          });
        }
        return slots;
      });

    return res.status(200).json({
      success: true,
      date: req.query.date,
      groomerId: groomer._id,
      groomerName: groomer.full_name,
      doctorId: groomer._id,
      doctorName: groomer.full_name,
      slots: shiftSlots,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find(activeServiceFilter).sort({ display_order: 1, name: 1 });
    return res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
