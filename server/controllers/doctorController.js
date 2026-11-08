import { Doctor } from '../models/Doctor.js';
import { Specialty } from '../models/Specialty.js';
import { Appointment } from '../models/Appointment.js';

/**
 * @desc   Lấy danh sách bác sĩ (hỗ trợ tìm kiếm và lọc chuyên khoa)
 * @route  GET /api/v1/doctors
 * @access Public
 */
export const getAllDoctors = async (req, res) => {
  try {
    const { specialty, search } = req.query;
    let query = {};

    if (specialty) {
      query.specialty = new RegExp(specialty, 'i');
    }

    if (search) {
      query.name = new RegExp(search, 'i');
    }

    const doctors = await Doctor.find(query);

    return res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Lấy chi tiết 1 bác sĩ
 * @route  GET /api/v1/doctors/:id
 * @access Public
 */
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bác sĩ' });
    }

    return res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Lấy danh sách các slot khám khả dụng của bác sĩ theo ngày
 * @route  GET /api/v1/doctors/:id/available-slots
 * @access Public
 */
export const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query; // DD/MM/YYYY
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Bác sĩ không tồn tại' });
    }

    // Tìm các lịch hẹn đã đặt của bác sĩ vào ngày này
    const bookedAppointments = await Appointment.find({
      doctorId: doctor._id,
      date,
      status: { $in: ['CONFIRMED', 'WAITING', 'IN_PROGRESS'] },
    }).select('time');

    const bookedTimes = bookedAppointments.map((a) => a.time);

    // Tính slot khả dụng
    const slots = doctor.timeSlots.map((time) => ({
      time,
      isAvailable: !bookedTimes.includes(time),
    }));

    return res.status(200).json({
      success: true,
      date: date || 'Hôm nay',
      doctorId: doctor._id,
      doctorName: doctor.name,
      slots,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Lấy danh sách chuyên khoa & dịch vụ
 * @route  GET /api/v1/specialties
 * @access Public
 */
export const getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find();
    return res.status(200).json({
      success: true,
      count: specialties.length,
      data: specialties,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

