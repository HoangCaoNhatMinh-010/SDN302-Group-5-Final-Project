# PawCare Studio — Hệ thống Chăm sóc, Spa & Đặt lịch Thú Cưng

Dự án Hệ thống Đặt lịch Chăm sóc, Spa & Quản lý Cửa hàng Thú Cưng **PawCare Studio** (Frontend React + Backend Node.js/Express & MongoDB), tích hợp thanh toán **PayOS** (phí giữ chỗ 100 VNĐ/lịch hẹn), xác thực **Gmail OTP**, đăng nhập **Google**, nhắn tin cửa hàng và tư vấn **Gemini AI**.

---

## Tài khoản đăng nhập theo từng Actor (Vai trò)

Đăng nhập tại trang **`/login`** (hoặc `http://localhost:5173/login`) bằng Email / Số điện thoại và Mật khẩu bên dưới:

| Vai trò (Actor) | Tên hiển thị | Email | Số điện thoại | Mật khẩu | Trang sau khi đăng nhập |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Khách hàng (Chủ thú cưng)** (`PATIENT`) | Nguyễn Văn Minh | `minh.nguyen@example.com` | `0901234567` | `password123` | `/patient/dashboard` |
| **Khách hàng** (`PATIENT`) | Lê Thu Hương | `huong.le@example.com` | `0908112233` | `password123` | `/patient/dashboard` |
| **Khách hàng** (`PATIENT`) | Trần Anh Tuấn | `tuan.tran@example.com` | `0912998877` | `password123` | `/patient/dashboard` |
| **Lễ tân & Thu ngân** (`RECEPTIONIST`) | Trần Thị Lan | `lan.tran@pawcare.vn` | `0912345678` | `password123` | `/receptionist/dashboard` |
| **Chuyên viên Spa / Thú y** (`DOCTOR`) | Chuyên viên Mai Anh | `maianh.groomer@pawcare.vn` | `0923456789` | `password123` | `/doctor/dashboard` |
| **Quản lý cửa hàng** (`CLINIC_MANAGER`) | Nguyễn Hoàng Nam | `nam.nguyen@pawcare.vn` | `0945678901` | `password123` | `/manager/dashboard` |

### Lưu ý đăng nhập & đăng ký khác
- **Đăng ký tài khoản mới (`/register`)**: Yêu cầu nhập thông tin và **xác thực mã OTP 6 chữ số gửi về Gmail** trước khi kích hoạt tài khoản.
- **Đăng nhập bằng Google**: Hỗ trợ chọn/nhập Gmail trực tiếp trên giao diện đăng nhập & đăng ký.
- **Đăng nhập qua OTP Email (`/otp-login`)** & **Quên mật khẩu (`/forgot-password`)**: Gửi mã OTP 6 chữ số qua SMTP Gmail.
- **Cổng Nhân viên 2FA (`/staff-2fa`)**: Hỗ trợ xác thực 2 bước cho nhân sự nội bộ (mã 2FA test: `123456`).

---

## Tạo tài khoản Quản trị viên (`ADMIN`)

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

Đăng nhập trên giao diện bằng email và mật khẩu vừa cấu hình. Lệnh `npm run seed` sẽ xóa và tạo lại dữ liệu mẫu; nếu chạy seed với các biến môi trường trên, tài khoản admin cũng được tạo lại.

Các trang quản trị yêu cầu JWT hợp lệ và role `ADMIN`.

---

## Cấu trúc Dự án
- **Frontend (`/src`)**: React 19, Vite, Tailwind CSS, React Router v7, Lucide Icons, Recharts.
- **Backend (`/server`)**: Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt, Nodemailer (SMTP Gmail), PayOS SDK, Gemini API.

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
