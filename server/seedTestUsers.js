import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';

dotenv.config();

const COUNT = 50;
const TEST_PASSWORD = 'TestUser2026!';

const seedTestUsers = async () => {
  await mongoose.connect(
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medcare_db'
  );

  let created = 0;

  for (let i = 1; i <= COUNT; i += 1) {
    const number = String(i).padStart(3, '0');
    const email = `test.patient${number}@example.com`;

    if (await User.exists({ email })) continue;

    await User.create({
      name: `Bệnh nhân kiểm thử ${number}`,
      email,
      phone: `099${String(i).padStart(8, '0')}`,
      password: TEST_PASSWORD,
      role: 'PATIENT',
      patientCode: `TEST-BN-${number}`,
      title: 'Bệnh nhân kiểm thử',
      dateOfBirth: '01/01/2000',
      gender: 'Khác',
      address: 'Tài khoản kiểm thử local',
    });

    created += 1;
  }

  console.log(`Đã tạo thêm ${created} tài khoản bệnh nhân kiểm thử.`);
};

seedTestUsers()
  .catch((error) => {
    console.error('Không thể tạo tài khoản kiểm thử:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });



  