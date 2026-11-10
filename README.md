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

### Tạo tài khoản quản trị viên

Đặt các thông tin sau trong `server/.env` (không đưa mật khẩu vào Git):
```env
ADMIN_NAME=Quản trị viên
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=thay-bang-mat-khau-manh-tu-8-ky-tu
```

Khi MongoDB đang chạy, từ thư mục `server`, tạo tài khoản admin mà không xóa dữ liệu hiện có:
```bash
npm run create-admin
```

Đăng nhập trên giao diện bằng email và mật khẩu vừa cấu hình. Nút đăng nhập demo không cấp quyền admin thực. Lệnh `npm run seed` sẽ xóa và tạo lại dữ liệu mẫu; nếu chạy seed với các biến môi trường trên, tài khoản admin cũng được tạo lại.

Các trang quản trị yêu cầu JWT hợp lệ và role `ADMIN`. Dịch vụ/chuyên khoa có CRUD; cấu hình slot, chính sách, consent và nhắc hẹn hiện có thể được tạo, sửa, bật/tắt và lưu trong MongoDB, nhưng chưa được áp dụng vào quy trình đặt lịch, thu thập consent hoặc gửi nhắc hẹn. Mục tích hợp chỉ lưu metadata cấu hình, chưa tự kết nối HIS/LIS và từ chối các trường bí mật. Báo cáo dùng số liệu tổng hợp trực tiếp từ người dùng, lịch hẹn và chuyên khoa.

### Tài khoản Bệnh nhân Demo
- **Email**: `minh.nguyen@example.com` hoặc **SĐT**: `0901234567`
- **Mật khẩu**: `password123`
- **Mã OTP thử nghiệm**: `123456`
