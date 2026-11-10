import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { FamilyMember } from './models/FamilyMember.js';
import { Doctor } from './models/Doctor.js';
import { Specialty } from './models/Specialty.js';
import { Appointment } from './models/Appointment.js';
import { Notification } from './models/Notification.js';
import { AdminSetting } from './models/AdminSetting.js';
import { AuditLog } from './models/AuditLog.js';

dotenv.config();

const seedData = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;

    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medcare_db');
    console.log('[Seed] Đã kết nối MongoDB thành công');

    // Làm sạch dữ liệu cũ
    await User.deleteMany();
    await FamilyMember.deleteMany();
    await Doctor.deleteMany();
    await Specialty.deleteMany();
    await Appointment.deleteMany();
    await Notification.deleteMany();
    await AdminSetting.deleteMany();
    await AuditLog.deleteMany();
    console.log('[Seed] Đã làm sạch dữ liệu cũ');

    // 1. Tạo các tài khoản Khách hàng / Chủ nuôi mẫu
    const users = await User.create([
      {
        name: 'Nguyễn Văn Minh',
        email: 'minh.nguyen@example.com',
        phone: '0901234567',
        password: 'password123',
        role: 'PATIENT',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        title: 'Khách hàng thân thiết (VIP)',
        patientCode: 'PAW-VIP-0892',
        dateOfBirth: '15/08/1990',
        gender: 'Nam',
        address: 'Số 123 Đường Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh',
      },
      {
        name: 'Lê Thu Hương',
        email: 'huong.le@example.com',
        phone: '0908112233',
        password: 'password123',
        role: 'PATIENT',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        title: 'Khách hàng Gold',
        patientCode: 'PAW-GOLD-1104',
        dateOfBirth: '20/03/1995',
        gender: 'Nữ',
        address: 'Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
      },
      {
        name: 'Trần Anh Tuấn',
        email: 'tuan.tran@example.com',
        phone: '0912998877',
        password: 'password123',
        role: 'PATIENT',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        title: 'Khách hàng mới',
        patientCode: 'PAW-NEW-2351',
        dateOfBirth: '12/11/1992',
        gender: 'Nam',
        address: 'Quận Bình Thạnh, TP. Hồ Chí Minh',
      },
      {
        name: 'Trần Thị Lan',
        email: 'lan.tran@pawcare.vn',
        phone: '0912345678',
        password: 'password123',
        role: 'RECEPTIONIST',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
        title: 'Tiếp đón & Thu ngân Cửa hàng',
      },
      {
        name: 'Chuyên viên Mai Anh',
        email: 'maianh.groomer@pawcare.vn',
        phone: '0923456789',
        password: 'password123',
        role: 'DOCTOR',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        title: 'Master Groomer (Hạng A Quốc tế)',
      },
      {
        name: 'Nguyễn Hoàng Nam',
        email: 'nam.nguyen@pawcare.vn',
        phone: '0945678901',
        password: 'password123',
        role: 'CLINIC_MANAGER',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
        title: 'Cửa hàng trưởng (Store Manager)',
      },
    ]);
    const mainCustomer = users[0];
    console.log('[Seed] Đã tạo', users.length, 'tài khoản người dùng');

    // Tạo tài khoản admin nếu có cấu hình
    if (adminEmail && adminPassword) {
      const adminUser = await User.create({
        name: process.env.ADMIN_NAME?.trim() || 'Quản trị viên',
        email: adminEmail,
        password: adminPassword,
        role: 'ADMIN',
        title: 'Quản trị viên hệ thống',
      });
      console.log('[Seed] Đã tạo tài khoản quản trị:', adminUser.email);
    }

    // 2. Tạo Hồ sơ Thú cưng đa dạng phong phú
    const pets = await FamilyMember.insertMany([
      {
        patientId: mainCustomer._id,
        name: 'Milo',
        relationship: 'Chó',
        petType: 'Chó',
        breed: 'Poodle lông xoăn trắng',
        weight: 3.2,
        dateOfBirth: '15/05/2024',
        gender: 'Đực',
        phone: mainCustomer.phone,
        address: mainCustomer.address,
        idCard: 'TAG-MILO-01',
        note: 'Bé rất ngoan, thích sấy phồng tai và tỉa gấu Teddy tròn mặt.',
      },
      {
        patientId: mainCustomer._id,
        name: 'Bông Bông',
        relationship: 'Mèo',
        petType: 'Mèo',
        breed: 'Mèo Anh lông ngắn (British Shorthair)',
        weight: 4.5,
        dateOfBirth: '10/01/2025',
        gender: 'Cái',
        phone: mainCustomer.phone,
        address: mainCustomer.address,
        idCard: 'TAG-BONG-02',
        note: 'Bé hơi nhát nước, cần dùng dầu tắm dịu nhẹ hữu cơ và thao tác nhẹ nhàng.',
      },
      {
        patientId: mainCustomer._id,
        name: 'LuLu',
        relationship: 'Chó',
        petType: 'Chó',
        breed: 'Corgi mông to chân ngắn',
        weight: 10.8,
        dateOfBirth: '20/11/2023',
        gender: 'Đực',
        phone: mainCustomer.phone,
        address: mainCustomer.address,
        idCard: 'TAG-LULU-03',
        note: 'Đã tiêm phòng 7 bệnh đầy đủ, cần cạo lông đệm chân và vệ sinh tai kỹ.',
      },
      {
        patientId: mainCustomer._id,
        name: 'Bơ Bơ',
        relationship: 'Chó',
        petType: 'Chó',
        breed: 'Golden Retriever lông vàng kim',
        weight: 27.5,
        dateOfBirth: '05/03/2023',
        gender: 'Đực',
        phone: mainCustomer.phone,
        address: mainCustomer.address,
        idCard: 'TAG-BO-04',
        note: 'Rất thích nước, thích chải lông xả rụng và sấy kỹ lớp lông lót.',
      },
      {
        patientId: mainCustomer._id,
        name: 'Kem',
        relationship: 'Chó',
        petType: 'Chó',
        breed: 'Phốc Sóc (Pomeranian)',
        weight: 2.3,
        dateOfBirth: '18/08/2024',
        gender: 'Cái',
        phone: mainCustomer.phone,
        address: mainCustomer.address,
        idCard: 'TAG-KEM-05',
        note: 'Lông tơ mịn, cần dùng dưỡng ẩm và cắt tỉa búp bê bồng bềnh.',
      },
    ]);
    console.log('[Seed] Đã tạo', pets.length, 'hồ sơ bé thú cưng');

    // 3. Tạo Danh mục Gói dịch vụ của Cửa hàng
    const specialties = await Specialty.insertMany([
      {
        name: 'Combo Tắm & Spa Toàn diện',
        description: 'Tắm nước ấm thảo dược, sấy phồng lông, vắt tuyến hôi, vệ sinh tai, cắt mài móng.',
        price: 180000,
        room: 'Bàn Spa 01 - Khu Tắm Sấy',
        icon: 'Sparkles',
      },
      {
        name: 'Cắt tỉa & Tạo kiểu Thời trang',
        description: 'Cắt tỉa form gấu Teddy, phong cách Hàn Quốc búp bê, cạo lông mùa hè giải nhiệt.',
        price: 280000,
        room: 'Bàn Grooming 02 - Khu Cắt Tỉa',
        icon: 'Scissors',
      },
      {
        name: 'Vệ sinh chuyên sâu & Nhổ lông tai',
        description: 'Làm sạch kẽ chân, cạo lông đệm chân, cạo viền bụng, vệ sinh tai và khử mùi hôi miệng.',
        price: 120000,
        room: 'Bàn Chăm Sóc 03',
        icon: 'HeartHandshake',
      },
      {
        name: 'Khám sức khỏe & Tiêm phòng Thú y',
        description: 'Bác sĩ thú y kiểm tra lâm sàng, tiêm phòng dại & 7 bệnh, sổ giun và tư vấn dinh dưỡng.',
        price: 250000,
        room: 'Phòng Thú Y Tiệm',
        icon: 'Stethoscope',
      },
      {
        name: 'Khách sạn Thú cưng / Lưu trú',
        description: 'Phòng điều hòa 24/7, camera theo dõi trực tiếp, chế độ dinh dưỡng hạt + pate cao cấp.',
        price: 200000,
        room: 'Khu Pet Hotel VIP',
        icon: 'Home',
      },
      {
        name: 'Nhuộm lông thời trang an toàn',
        description: 'Nhuộm tai và đuôi bằng màu nhuộm chiết xuất thực vật 100% không độc hại cho thú cưng.',
        price: 150000,
        room: 'Bàn Tạo Kiểu 04',
        icon: 'Palette',
      },
    ]);
    console.log('[Seed] Đã tạo', specialties.length, 'gói dịch vụ thú cưng');

    // 4. Tạo Đội ngũ Chuyên viên Grooming & Bác sĩ Thú y
    const doctors = await Doctor.insertMany([
      {
        name: 'Chuyên viên Mai Anh',
        specialty: 'Cắt tỉa & Tạo kiểu Thời trang',
        email: 'maianh.groomer@pawcare.vn',
        phone: '0923 456 789',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        title: 'Master Groomer (Chứng chỉ Quốc tế Hạng A)',
        department: 'Tổ Grooming & Làm đẹp Thú cưng',
        room: 'Bàn Grooming 01 - Lầu 1',
        experienceYears: 6,
        rating: 5.0,
        consultationFee: 280000,
        bio: 'Hơn 6 năm chuyên tạo kiểu form Teddy, phong cách tròn mặt búp bê cho Poodle, Bichon, Pom.',
      },
      {
        name: 'Bác sĩ Thú y Đức Hòa',
        specialty: 'Khám sức khỏe & Tiêm phòng Thú y',
        email: 'bs.hoaduc@pawcare.vn',
        phone: '0933 111 222',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&q=80',
        title: 'Bác sĩ Thú Y Thường trực',
        department: 'Bộ phận Y tế & Tiêm chủng Cửa hàng',
        room: 'Phòng Thú Y - Tầng Trệt',
        experienceYears: 8,
        rating: 4.9,
        consultationFee: 250000,
        bio: 'Tốt nghiệp ĐH Nông Lâm khoa Thú y, chuyên khám nội khoa và tiêm phòng an toàn cho chó mèo.',
      },
      {
        name: 'Chuyên viên Ngọc Hân',
        specialty: 'Combo Tắm & Spa Toàn diện',
        email: 'ngochan.spa@pawcare.vn',
        phone: '0944 222 333',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
        title: 'Chuyên viên Spa & Dưỡng lông Thú cưng',
        department: 'Tổ Spa & Thư giãn',
        room: 'Khu Tắm Sấy Thảo Dược - Tầng Trệt',
        experienceYears: 4,
        rating: 4.9,
        consultationFee: 180000,
        bio: 'Chuyên gia xoa bóp thư giãn, phục hồi lông xơ rối và tắm nước ấm thảo dược cho thú cưng.',
      },
      {
        name: 'Chuyên viên Quốc Bảo',
        specialty: 'Vệ sinh chuyên sâu & Nhổ lông tai',
        email: 'quocbao@pawcare.vn',
        phone: '0955 333 444',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        title: 'Kỹ thuật viên Chăm sóc Thú cưng',
        department: 'Tổ Vệ sinh & Chăm sóc móng/tai',
        room: 'Bàn Chăm Sóc 03',
        experienceYears: 5,
        rating: 4.8,
        consultationFee: 120000,
        bio: 'Rất kiên nhẫn với các bé chó mèo nhát người hoặc khó cắt móng.',
      },
      {
        name: 'Chuyên viên Thùy Dung',
        specialty: 'Khách sạn Thú cưng / Lưu trú',
        email: 'thuydung.hotel@pawcare.vn',
        phone: '0966 555 666',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
        title: 'Quản lý Dịch vụ Pet Hotel & Daycare',
        department: 'Bộ phận Lưu trú & Chăm sóc Ban ngày',
        room: 'Khu Pet Hotel VIP - Lầu 2',
        experienceYears: 5,
        rating: 4.9,
        consultationFee: 200000,
        bio: 'Theo dõi dinh dưỡng, chế độ vận động và cập nhật hình ảnh bé mỗi ngày cho chủ nuôi qua tin nhắn.',
      },
    ]);
    console.log('[Seed] Đã tạo', doctors.length, 'chuyên viên thú cưng');

    // 5. Tạo nhiều Lịch hẹn chăm sóc thú cưng ở các trạng thái thực tế
    const appointments = await Appointment.insertMany([
      {
        code: 'PET-2026-101',
        patientId: mainCustomer._id,
        patientName: 'Nguyễn Văn Minh',
        petName: 'Milo',
        petBreed: 'Poodle lông xoăn trắng',
        isForFamilyMember: true,
        familyMemberId: pets[0]._id,
        doctorId: doctors[0]._id,
        doctorName: doctors[0].name,
        specialty: 'Cắt tỉa & Tạo kiểu Thời trang',
        room: 'Bàn Grooming 01 - Lầu 1',
        date: '11/11/2026',
        time: '09:30 - 10:30',
        status: 'CONFIRMED',
        type: 'Cắt tỉa form Teddy tròn mặt',
        price: 280000,
        bookingFee: 100,
        paymentStatus: 'PAID',
        paymentMethod: 'PAYOS',
        symptoms: 'Lông tai dài, cần tỉa gọn mặt tròn búp bê và xịt dưỡng thơm.',
      },
      {
        code: 'PET-2026-102',
        patientId: mainCustomer._id,
        patientName: 'Nguyễn Văn Minh',
        petName: 'Bông Bông',
        petBreed: 'Mèo Anh lông ngắn',
        isForFamilyMember: true,
        familyMemberId: pets[1]._id,
        doctorId: doctors[2]._id,
        doctorName: doctors[2].name,
        specialty: 'Combo Tắm & Spa Toàn diện',
        room: 'Khu Tắm Sấy Thảo Dược - Tầng Trệt',
        date: '12/11/2026',
        time: '14:30 - 15:30',
        status: 'WAITING',
        type: 'Tắm thảo dược khử mùi + Sấy phồng',
        price: 180000,
        bookingFee: 100,
        paymentStatus: 'UNPAID',
        paymentMethod: 'PAYOS',
        symptoms: 'Bé cần tắm khử mùi và cạo lông đệm chân nhẹ nhàng.',
      },
      {
        code: 'PET-2026-103',
        patientId: mainCustomer._id,
        patientName: 'Nguyễn Văn Minh',
        petName: 'LuLu',
        petBreed: 'Corgi mông to chân ngắn',
        isForFamilyMember: true,
        familyMemberId: pets[2]._id,
        doctorId: doctors[1]._id,
        doctorName: doctors[1].name,
        specialty: 'Khám sức khỏe & Tiêm phòng Thú y',
        room: 'Phòng Thú Y - Tầng Trệt',
        date: '18/11/2026',
        time: '10:30 - 11:30',
        status: 'CONFIRMED',
        type: 'Tiêm nhắc lại vắc xin 7 bệnh',
        price: 250000,
        bookingFee: 100,
        paymentStatus: 'PAID',
        paymentMethod: 'PAYOS',
        symptoms: 'Đến lịch tiêm nhắc vắc xin định kỳ hàng năm.',
      },
      {
        code: 'PET-2026-104',
        patientId: mainCustomer._id,
        patientName: 'Nguyễn Văn Minh',
        petName: 'Bơ Bơ',
        petBreed: 'Golden Retriever lông vàng kim',
        isForFamilyMember: true,
        familyMemberId: pets[3]._id,
        doctorId: doctors[2]._id,
        doctorName: doctors[2].name,
        specialty: 'Combo Tắm & Spa Toàn diện',
        room: 'Bàn Spa Lớn 01',
        date: '05/11/2026',
        time: '15:30 - 16:30',
        status: 'COMPLETED',
        type: 'Combo Tắm xả lông rụng & Sấy phồng',
        price: 180000,
        bookingFee: 100,
        paymentStatus: 'PAID',
        paymentMethod: 'PAYOS',
        symptoms: 'Đã hoàn tất tắm sấy sạch sẽ, bé rất ngoan.',
      },
      {
        code: 'PET-2026-105',
        patientId: mainCustomer._id,
        patientName: 'Nguyễn Văn Minh',
        petName: 'Kem',
        petBreed: 'Phốc Sóc (Pomeranian)',
        isForFamilyMember: true,
        familyMemberId: pets[4]._id,
        doctorId: doctors[0]._id,
        doctorName: doctors[0].name,
        specialty: 'Cắt tỉa & Tạo kiểu Thời trang',
        room: 'Bàn Grooming 01',
        date: '02/11/2026',
        time: '09:30 - 10:30',
        status: 'COMPLETED',
        type: 'Tỉa form búp bê bồng bềnh',
        price: 280000,
        bookingFee: 100,
        paymentStatus: 'PAID',
        paymentMethod: 'PAYOS',
        symptoms: 'Đã cắt tỉa form búp bê xinh xắn, chủ đã đón bé về.',
      },
      {
        code: 'PET-2026-106',
        patientId: mainCustomer._id,
        patientName: 'Nguyễn Văn Minh',
        petName: 'LuLu',
        petBreed: 'Corgi mông to chân ngắn',
        isForFamilyMember: true,
        familyMemberId: pets[2]._id,
        doctorId: doctors[3]._id,
        doctorName: doctors[3].name,
        specialty: 'Vệ sinh chuyên sâu & Nhổ lông tai',
        room: 'Bàn Chăm Sóc 03',
        date: '28/10/2026',
        time: '16:30 - 17:30',
        status: 'CANCELLED',
        type: 'Vệ sinh tai móng',
        price: 120000,
        symptoms: 'Chủ bận việc đột xuất.',
        cancelReason: 'Chủ nuôi bận công tác đột xuất nên dời lịch.',
      },
    ]);
    console.log('[Seed] Đã tạo', appointments.length, 'lịch hẹn chăm sóc thú cưng');

    // 6. Tạo Thông báo mẫu chân thực
    const notifications = await Notification.insertMany([
      {
        userId: mainCustomer._id,
        title: 'Nhắc lịch Spa Thú cưng sắp tới 🐾',
        message: 'Bé Milo có lịch hẹn Combo Tắm & Cắt tỉa Teddy lúc 09:00 ngày mai tại PawCare Pet Spa!',
        type: 'appointment',
        read: false,
      },
      {
        userId: mainCustomer._id,
        title: 'Hoàn tất dịch vụ cho bé Bông Bông 🐱',
        message: 'Bé Bông Bông đã được tắm sạch thơm và sấy phồng lông xinh xắn. Bạn có thể đến đón bé!',
        type: 'checkin',
        read: false,
      },
      {
        userId: mainCustomer._id,
        title: 'Ưu đãi thành viên PawCare Club 🎉',
        message: 'Giảm 15% gói Combo Tắm & Cắt tỉa cho thú cưng khi đặt lịch trước 2 ngày trong tuần này.',
        type: 'system',
        read: true,
      },
      {
        userId: mainCustomer._id,
        title: 'Nhắc hẹn tiêm vắc xin định kỳ 🩺',
        message: 'Bé LuLu sắp đến lịch tiêm phòng mũi nhắc vắc xin 7 bệnh. Vui lòng đặt lịch với bác sĩ!',
        type: 'appointment',
        read: false,
      },
    ]);
    console.log('[Seed] Đã tạo', notifications.length, 'thông báo mẫu');

    console.log('\n=============================================');
    console.log('✅ KHỞI TẠO DỮ LIỆU ĐẦY ĐỦ CHO PAWCARE THÀNH CÔNG!');
    console.log(`Tài khoản Khách hàng / Chủ nuôi Demo:`);
    console.log(`- Email: ${mainCustomer.email}`);
    console.log(`- SĐT: ${mainCustomer.phone}`);
    console.log(`- Password: password123 (hoặc 123456)`);
    console.log(`Số lượng Thú cưng: ${pets.length}`);
    console.log(`Số lượng Dịch vụ: ${specialties.length}`);
    console.log(`Số lượng Chuyên viên: ${doctors.length}`);
    console.log(`Số lượng Lịch hẹn: ${appointments.length}`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi nạp seed data:', error);
    process.exit(1);
  }
};

seedData();
