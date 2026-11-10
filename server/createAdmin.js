import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Cần khai báo ADMIN_EMAIL và ADMIN_PASSWORD trong server/.env.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('ADMIN_EMAIL không hợp lệ.');
  }
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD phải có ít nhất 8 ký tự.');
  }

  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pawcare_db');
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email đã tồn tại. Không tạo hoặc thay đổi tài khoản hiện có.');
  }

  const admin = await User.create({
    name: process.env.ADMIN_NAME?.trim() || 'Quản trị viên',
    email,
    password,
    role: 'ADMIN',
    title: 'Quản trị viên hệ thống',
  });
  console.log(`[Admin] Đã tạo tài khoản quản trị: ${admin.email}`);
};

createAdmin()
  .catch((error) => {
    console.error(`[Admin] Không thể tạo tài khoản: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
