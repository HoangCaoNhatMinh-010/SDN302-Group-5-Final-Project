import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { FamilyMember } from './models/FamilyMember.js';
import { Doctor } from './models/Doctor.js';
import { Specialty } from './models/Specialty.js';
import { Appointment } from './models/Appointment.js';
import { Notification } from './models/Notification.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medcare_db');
    console.log('[Seed] Đã kết nối MongoDB thành công');

    // Xóa dữ liệu cũ
    await User.deleteMany();
    await FamilyMember.deleteMany();
    await Doctor.deleteMany();
    await Specialty.deleteMany();
    await Appointment.deleteMany();
    await Notification.deleteMany();
    console.log('[Seed] Đã làm sạch dữ liệu cũ');

    // 1. Tạo tài khoản Bệnh nhân Demo
    const patientUser = await User.create({
      name: 'Nguyễn Văn Minh',
      email: 'minh.nguyen@example.com',
      phone: '0901234567',
      password: 'password123', // sẽ được hash tự động qua pre('save')
      role: 'PATIENT',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      title: 'Bệnh nhân',
      patientCode: 'BN-2026-0892',
      dateOfBirth: '15/08/1990',
      gender: 'Nam',
      address: 'Quận 1, TP. Hồ Chí Minh',
    });
    console.log('[Seed] Đã tạo Bệnh nhân mẫu:', patientUser.email);

    // 2. Tạo Hồ sơ Người thân mẫu cho bệnh nhân
    const familyMembers = await FamilyMember.insertMany([
      {
        patientId: patientUser._id,
        name: 'Nguyễn Văn Hùng',
        dateOfBirth: '10/02/1958',
        gender: 'Nam',
        relationship: 'Bố',
        phone: '0903 111 222',
        address: 'Quận 1, TP. Hồ Chí Minh',
        idCard: '079058001234',
        note: 'Có tiền sử cao huyết áp, cần tái khám định kỳ',
      },
      {
        patientId: patientUser._id,
        name: 'Lê Thị Ngọc Ánh',
        dateOfBirth: '22/04/1992',
        gender: 'Nữ',
        relationship: 'Vợ/chồng',
        phone: '0908 333 444',
        address: 'Quận 1, TP. Hồ Chí Minh',
        idCard: '079192005678',
        note: 'Dị ứng với thuốc kháng sinh nhóm penicillin',
      },
      {
        patientId: patientUser._id,
        name: 'Nguyễn Ngọc Bảo An',
        dateOfBirth: '05/11/2018',
        gender: 'Nữ',
        relationship: 'Con',
        phone: '0901 234 567',
        address: 'Quận 1, TP. Hồ Chí Minh',
        idCard: 'BHYT-TE-8899',
        note: 'Sổ tiêm chủng đầy đủ',
      },
    ]);
    console.log('[Seed] Đã tạo', familyMembers.length, 'người thân');

    // 3. Tạo Chuyên khoa mẫu
    const specialties = await Specialty.insertMany([
      { name: 'Nội tổng quát', description: 'Chăm sóc và điều trị các bệnh nội khoa tổng quát', price: 200000, room: 'Phòng 204' },
      { name: 'Tai Mũi Họng', description: 'Khám và nội soi điều trị các bệnh tai mũi họng', price: 250000, room: 'Phòng 102' },
      { name: 'Da liễu', description: 'Tư vấn và điều trị chuyên sâu về da và thẩm mỹ y khoa', price: 300000, room: 'Phòng 301' },
      { name: 'Tim mạch', description: 'Đo điện tim, siêu âm Doppler và quản lý bệnh tim mạch', price: 350000, room: 'Phòng 206' },
    ]);
    console.log('[Seed] Đã tạo', specialties.length, 'chuyên khoa');

    // 4. Tạo Bác sĩ mẫu
    const doctors = await Doctor.insertMany([
      {
        name: 'BS. Nguyễn Minh Anh',
        specialty: 'Nội tổng quát',
        email: 'bs.minhanh@medcare.vn',
        phone: '0923 456 789',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80',
        title: 'Bác sĩ chuyên khoa I',
        department: 'Khoa Khám bệnh',
        room: 'Phòng 204 - Tầng 2',
        experienceYears: 10,
        rating: 4.9,
        consultationFee: 200000,
      },
      {
        name: 'BS. Lê Thị Mai',
        specialty: 'Tai Mũi Họng',
        email: 'bs.mai@medcare.vn',
        phone: '0933 111 222',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
        title: 'Thạc sĩ, Bác sĩ',
        department: 'Khoa Tai Mũi Họng',
        room: 'Phòng 102 - Tầng 1',
        experienceYears: 7,
        rating: 4.8,
        consultationFee: 250000,
      },
      {
        name: 'BS. Trần Đức Hòa',
        specialty: 'Da liễu',
        email: 'bs.hoa@medcare.vn',
        phone: '0944 222 333',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&q=80',
        title: 'Bác sĩ chuyên khoa II',
        department: 'Khoa Da Liễu',
        room: 'Phòng 301 - Tầng 3',
        experienceYears: 12,
        rating: 5.0,
        consultationFee: 300000,
      },
      {
        name: 'BS. Vũ Thùy Dung',
        specialty: 'Tim mạch',
        email: 'bs.dung@medcare.vn',
        phone: '0955 333 444',
        avatar: 'https://images.unsplash.com/photo-1594824813576-96bca4fa82fd?auto=format&fit=crop&w=150&q=80',
        title: 'Tiến sĩ, Bác sĩ',
        department: 'Khoa Tim Mạch',
        room: 'Phòng 206 - Tầng 2',
        experienceYears: 15,
        rating: 4.9,
        consultationFee: 350000,
      },
    ]);
    console.log('[Seed] Đã tạo', doctors.length, 'bác sĩ');

    // 5. Tạo Lịch hẹn khám mẫu cho bệnh nhân
    const appointments = await Appointment.insertMany([
      {
        code: 'APT-1001',
        patientId: patientUser._id,
        patientName: patientUser.name,
        doctorId: doctors[0]._id,
        doctorName: doctors[0].name,
        specialty: doctors[0].specialty,
        room: doctors[0].room,
        date: '06/10/2026',
        time: '08:30 - 09:00',
        status: 'CONFIRMED',
        type: 'Khám định kỳ',
        symptoms: 'Kiểm tra sức khỏe tổng quát định kỳ hàng năm',
      },
      {
        code: 'APT-1002',
        patientId: patientUser._id,
        patientName: familyMembers[1].name,
        isForFamilyMember: true,
        familyMemberId: familyMembers[1]._id,
        doctorId: doctors[1]._id,
        doctorName: doctors[1].name,
        specialty: doctors[1].specialty,
        room: doctors[1].room,
        date: '08/10/2026',
        time: '09:00 - 09:30',
        status: 'WAITING',
        type: 'Khám mới',
        symptoms: 'Đau họng, khàn tiếng kéo dài',
      },
      {
        code: 'APT-1003',
        patientId: patientUser._id,
        patientName: familyMembers[0].name,
        isForFamilyMember: true,
        familyMemberId: familyMembers[0]._id,
        doctorId: doctors[0]._id,
        doctorName: doctors[0].name,
        specialty: doctors[0].specialty,
        room: doctors[0].room,
        date: '12/10/2026',
        time: '09:30 - 10:00',
        status: 'CONFIRMED',
        type: 'Tái khám',
        symptoms: 'Tái khám huyết áp và đo lại đường huyết',
      },
    ]);
    console.log('[Seed] Đã tạo', appointments.length, 'lịch hẹn mẫu');

    // 6. Tạo Thông báo mẫu cho bệnh nhân
    const notifications = await Notification.insertMany([
      {
        userId: patientUser._id,
        title: 'Lịch khám sắp diễn ra',
        message: 'Bạn có lịch khám lúc 08:30 ngày mai với BS. Nguyễn Minh Anh tại phòng 204.',
        type: 'appointment',
        read: false,
      },
      {
        userId: patientUser._id,
        title: 'Check-in thành công',
        message: 'Hồ sơ người thân đã được đồng bộ với hệ thống tiếp đón của phòng khám.',
        type: 'checkin',
        read: false,
      },
      {
        userId: patientUser._id,
        title: 'Thông báo hệ thống MedCare',
        message: 'Hệ thống đã nâng cấp phiên bản mới giúp đặt lịch trực tuyến nhanh chóng hơn.',
        type: 'system',
        read: true,
      },
    ]);
    console.log('[Seed] Đã tạo', notifications.length, 'thông báo mẫu');

    console.log('\n=============================================');
    console.log('✅ KHỞI TẠO DỮ LIỆU BAN ĐẦU (SEED) HOÀN TẤT!');
    console.log(`Tài khoản Bệnh nhân Demo:`);
    console.log(`- Email: ${patientUser.email}`);
    console.log(`- SĐT: ${patientUser.phone}`);
    console.log(`- Password: password123`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi nạp seed data:', error);
    process.exit(1);
  }
};

seedData();

