# SDN302-Group-5-Final-Project - MedCare Clinic System

Dự án Hệ thống Đặt lịch Khám và Quản lý Phòng khám Đa khoa MedCare (Frontend React + Backend Node.js/Express & MongoDB).

## Cấu trúc Dự án
- **Frontend (`/`)**: React 19, Vite, Tailwind CSS, React Router v7, Lucide Icons, Recharts.
- **Backend (`/server`)**: Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt, CORS.

## Hướng dẫn Khởi chạy

### 1. Cài đặt & Chạy Frontend
```bash
# Cài đặt dependencies
npm install

# Khởi chạy dev server (cổng 5173)
npm run dev

# Build dự án
npm run build
```

### 2. Cài đặt & Chạy Backend
```bash
cd server

# Cài đặt dependencies
npm install

# Khởi tạo dữ liệu mẫu vào MongoDB
npm run seed

# Chạy server API (cổng 5000)
npm run dev
# hoặc
npm start
```

### Tài khoản Bệnh nhân Demo
- **Email**: `minh.nguyen@example.com` hoặc **SĐT**: `0901234567`
- **Mật khẩu**: `password123`
- **Mã OTP thử nghiệm**: `123456`
