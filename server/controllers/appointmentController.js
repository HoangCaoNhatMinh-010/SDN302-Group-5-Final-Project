import { Appointment } from '../models/Appointment.js';
import { Doctor } from '../models/Doctor.js';
import { FamilyMember } from '../models/FamilyMember.js';
import { Notification } from '../models/Notification.js';

/**
 * @desc   Lấy danh sách lịch hẹn của bệnh nhân hiện tại
 * @route  GET /api/v1/appointments/my-appointments
 * @access Private (Patient)
 */
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate('doctorId', 'name specialty avatar room')
      .populate('familyMemberId', 'name relationship')
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
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: req.user.id,
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
 * @desc   Đặt lịch khám mới (cho bản thân hoặc người thân)
 * @route  POST /api/v1/appointments
 * @access Private (Patient)
 */
export const createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      date,
      time,
      type = 'Khám mới',
      symptoms = '',
      notes = '',
      isForFamilyMember = false,
      familyMemberId = null,
    } = req.body;

    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn bác sĩ khám' });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ngày khám' });
    }
    if (!time) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn khung giờ khám' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Bác sĩ không tồn tại' });
    }

    let patientName = req.user.name;
    if (isForFamilyMember && familyMemberId) {
      const familyMember = await FamilyMember.findOne({
        _id: familyMemberId,
        patientId: req.user.id,
      });
      if (familyMember) {
        patientName = familyMember.name;
      }
    }

    const appointment = await Appointment.create({
      patientId: req.user.id,
      patientName,
      isForFamilyMember,
      familyMemberId: isForFamilyMember ? familyMemberId : null,
      doctorId: doctor._id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      room: doctor.room,
      date,
      time,
      status: 'CONFIRMED',
      type,
      symptoms,
      notes,
    });

    // Tạo thông báo cho bệnh nhân
    await Notification.create({
      userId: req.user.id,
      title: 'Đặt lịch khám thành công',
      message: `Lịch khám [${appointment.code}] với ${doctor.name} vào lúc ${time} ngày ${date} đã được xác nhận.`,
      type: 'appointment',
    });

    return res.status(201).json({
      success: true,
      message: 'Đặt lịch khám thành công!',
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Hủy lịch hẹn khám
 * @route  PUT /api/v1/appointments/:id/cancel
 * @access Private (Patient)
 */
export const cancelAppointment = async (req, res) => {
  try {
    const { cancelReason = 'Bệnh nhân bận việc đột xuất' } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: req.user.id,
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
      userId: req.user.id,
      title: 'Hủy lịch khám',
      message: `Lịch khám [${appointment.code}] ngày ${appointment.date} đã được hủy thành công.`,
      type: 'appointment',
    });

    return res.status(200).json({
      success: true,
      message: 'Đã hủy lịch hẹn khám thành công!',
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

