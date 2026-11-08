# Hướng dẫn chạy Clinic Booking

## Yêu cầu

- Node.js 20.19+ (khuyến nghị Node.js 22 LTS)
- MongoDB chạy local hoặc MongoDB Atlas

## Khởi động backend

Mở terminal tại `final-clinic-booking-project-back-end`:

```powershell
npm install
Copy-Item .env.example .env
```

Chỉnh `.env`: đặt `MONGODB_URI`, hai secret ngẫu nhiên khác nhau cho `SESSION_SECRET` và `JWT_SECRET`, `FRONTEND_ORIGIN=http://localhost:5173`, cùng `ADMIN_PHONE` và `ADMIN_PASSWORD` riêng của bạn. Không commit file `.env`.

Tạo dữ liệu ban đầu và tài khoản quản trị:

```powershell
npm run seed
npm run dev (Hoặc: node dist/server.js)
```

API: `http://localhost:8080/api`; kiểm tra kết nối tại `http://localhost:8080/api/health`.

## Khởi động frontend

Mở terminal khác tại `final-clinic-booking-project-front-end`:

```powershell
npm install
Copy-Item .env.example .env
npm run dev 
(Hoặc: Set-Location 'Thư mục cha chứa phần front-end\final-clinic-booking-project-front-end'
& 'Thư mục cha chứa nodejs\nodejs\node.exe' .\node_modules\vite\bin\vite.js)
```

Vite chạy tại `http://localhost:5173` và proxy `/api` sang backend. Có thể dùng `VITE_API_URL` là `/api` cho proxy local hoặc URL API đã triển khai khi chạy production.

## Thiết lập và luồng sử dụng

1. Đăng nhập bằng số điện thoại và mật khẩu admin đã khai báo trong `.env`.
2. Tạo tài khoản quản lý, lễ tân, bác sĩ; tạo chuyên khoa và hồ sơ/phí khám cho từng bác sĩ.
3. Quản lý tạo lịch khám và các slot còn trống.
4. Bệnh nhân đăng ký/đăng nhập, chọn bác sĩ/ngày/slot và đặt lịch.
5. Lễ tân tiếp nhận bệnh nhân; bác sĩ cập nhật chẩn đoán, ghi chú và đơn thuốc; quản lý xem báo cáo.

Trong môi trường development, khi `EXPOSE_OTP_IN_RESPONSE=true`, endpoint yêu cầu OTP trả mã kiểm thử trong response. Cấu hình này tự bị tắt trong production. Hiện tại chưa cấu hình nhà cung cấp SMS/email, cổng thanh toán, hoặc dịch vụ bảo hiểm; xem backend README trước khi triển khai các tích hợp đó.

## Kiểm tra frontend

```powershell
npm run build
npm run lint
```

## Lệnh backend

```powershell
npm run typecheck
npm run build
```
## Tài khoản mẫu
*Thuộc bệnh nhân: 
1. 
Họ và tên: Jake Grims
SĐT: 0900123456
Mật khẩu: A1b2c3d4e5!
2. 

*Thuộc quản lý: 

*Thuộc bác sĩ: 

*Thuộc lễ tân: 


