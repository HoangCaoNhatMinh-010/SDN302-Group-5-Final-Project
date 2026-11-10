import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment.js';
import { Doctor } from '../models/Doctor.js';
import { FamilyMember } from '../models/FamilyMember.js';
import { Notification } from '../models/Notification.js';

/**
 * @desc   Lấy danh sách lịch hẹn của khách hàng hiện tại
 * @route  GET /api/v1/appointments/my-appointments
 * @access Private (Patient)
 */
export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user.id || req.user._id;
    const appointments = await Appointment.find({ patientId })
      .populate('doctorId', 'name specialty avatar room rating title')
      .populate('familyMemberId', 'name relationship petType breed weight')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Lấy chi tiết 1 lịch hẹn
 * @route  GET /api/v1/appointments/:id
 * @access Private
 */
export const getAppointmentById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'ID lịch hẹn không hợp lệ' });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: req.user.id || req.user._id,
    })
      .populate('doctorId')
      .populate('familyMemberId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch hẹn' });
    }

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Đặt lịch khám/spa mới cho thú cưng
 * @route  POST /api/v1/appointments
 * @access Private (Patient)
 */
export const createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      date,
      time,
      type = 'Combo Tắm & Spa',
      symptoms = '',
      notes = '',
      isForFamilyMember = true,
      familyMemberId = null,
    } = req.body;

    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn chuyên viên chăm sóc' });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ngày đến tiệm' });
    }
    if (!time) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn khung giờ hẹn' });
    }

    let doctor = null;
    if (mongoose.Types.ObjectId.isValid(doctorId)) {
      doctor = await Doctor.findById(doctorId);
    }
    if (!doctor) {
      doctor = await Doctor.findOne();
    }
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Chuyên viên không tồn tại' });
    }

    let patientName = req.user.name;
    let petName = 'Bé cưng';
    let petBreed = 'Chưa rõ';

    if (familyMemberId && mongoose.Types.ObjectId.isValid(familyMemberId)) {
      const familyMember = await FamilyMember.findById(familyMemberId);
      if (familyMember) {
        patientName = familyMember.name;
        petName = familyMember.name;
        petBreed = familyMember.breed || familyMember.relationship || 'Pet';
      }
    }

    const appointment = await Appointment.create({
      patientId: req.user.id || req.user._id,
      patientName,
      petName,
      petBreed,
      isForFamilyMember: true,
      familyMemberId: familyMemberId && mongoose.Types.ObjectId.isValid(familyMemberId) ? familyMemberId : null,
      doctorId: doctor._id,
      doctorName: doctor.name,
      specialty: doctor.specialty || type,
      room: doctor.room || 'Bàn Grooming - PawCare Studio',
      date,
      time,
      status: 'CONFIRMED',
      type,
      symptoms,
      notes,
    });

    // Tạo thông báo cho chủ thú cưng
    await Notification.create({
      userId: req.user.id || req.user._id,
      title: 'Đặt lịch chăm sóc thành công 🐾',
      message: `Lịch hẹn [${appointment.code}] cho bé ${petName} với ${doctor.name} lúc ${time} ngày ${date} đã được xác nhận.`,
      type: 'appointment',
    });

    return res.status(201).json({
      success: true,
      message: 'Đặt lịch chăm sóc thú cưng thành công! 🐾',
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Hủy lịch hẹn chăm sóc thú cưng
 * @route  PUT /api/v1/appointments/:id/cancel
 * @access Private (Patient)
 */
export const cancelAppointment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'ID lịch hẹn không hợp lệ' });
    }

    const { cancelReason = 'Chủ nuôi bận việc đột xuất' } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: req.user.id || req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Lịch hẹn không tồn tại' });
    }

    if (appointment.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Không thể hủy lịch khám đã hoàn thành' });
    }

    appointment.status = 'CANCELLED';
    appointment.cancelReason = cancelReason;
    await appointment.save();

    // Tạo thông báo
    await Notification.create({
      userId: req.user.id || req.user._id,
      title: 'Hủy lịch chăm sóc thú cưng',
      message: `Lịch hẹn [${appointment.code}] ngày ${appointment.date} đã được hủy thành công.`,
      type: 'appointment',
    });

    return res.status(200).json({
      success: true,
      message: 'Đã hủy lịch hẹn chăm sóc thành công!',
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
