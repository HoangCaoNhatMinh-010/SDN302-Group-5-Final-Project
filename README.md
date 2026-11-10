# PawCare Studio - Ứng dụng đặt lịch chăm sóc thú cưng

Ứng dụng hỗ trợ khách hàng đặt lịch tắm, spa, vệ sinh và grooming cho thú cưng tại cửa hàng; quản lý hồ sơ thú cưng, lịch hẹn, dịch vụ và đội ngũ chăm sóc. Luồng đặt lịch trực tuyến chỉ hiển thị dịch vụ grooming, không hiển thị dịch vụ thú y hoặc lưu trú.

## Công nghệ

- **Frontend**: React 19, Vite, Tailwind CSS, React Router, Lucide Icons, Recharts.
- **Backend**: Node.js, Express, MongoDB/Mongoose, JWT, bcrypt.

## Chạy ứng dụng

### Frontend

Từ thư mục dự án:

```bash
npm install
npm run dev
```

Vite chạy tại `http://localhost:5173`. Kiểm tra bản build bằng `npm run build`.

### Backend

Tạo `server/.env` từ `server/.env.example`. Đặt `MONGODB_URI` thành URI MongoDB của bạn, bao gồm tên database, và đặt `JWT_SECRET` thành chuỗi ngẫu nhiên tối thiểu 32 ký tự. Máy chủ sẽ không khởi động nếu thiếu cấu hình này. `MONGO_URI` cũ vẫn được chấp nhận nếu `MONGODB_URI` chưa được đặt.

```bash
cd server
npm install
npm run dev
```

API chỉ bắt đầu lắng nghe sau khi kết nối MongoDB thành công. API chạy mặc định tại `http://localhost:5000`; `/api/health` trả trạng thái MongoDB thực tế.

## Cấu trúc dữ liệu MongoDB

Ứng dụng ánh xạ các model vào các collection đã có:

| Collection | Mục đích trong ứng dụng |
|---|---|
| `owners` | Hồ sơ chủ thú cưng; liên kết với tài khoản đăng nhập trong `users`. |
| `pets` | Thú cưng, chủ sở hữu, loài, cân nặng, dị ứng và lưu ý chăm sóc. |
| `services` | Dịch vụ cùng giá, thời lượng, tiền đặt cọc và khả năng đặt trực tuyến. |
| `staff` | Nhân viên và dịch vụ được phân công; luồng đặt lịch chỉ chọn nhân viên grooming. |
| `staff_shifts` | Ca làm việc dùng để tính khung giờ có thể đặt. |
| `appointments` | Lịch hẹn tham chiếu chủ, thú cưng, dịch vụ và nhân viên; lưu ảnh chụp thông tin tại thời điểm đặt. |
| `payments` | Dữ liệu thanh toán hiện có; giao diện thanh toán chưa được tích hợp. |
| `medical_notes` | Ghi chú y tế hiện có; không được dùng để hiển thị hoặc đặt dịch vụ thú y trong luồng grooming. |

Ứng dụng còn dùng collection `users` cho đăng nhập, phân quyền và tài khoản quản trị; collection này không nằm trong bộ dữ liệu cửa hàng nêu trên. Tài khoản đăng ký **không tự động nhận quyền truy cập** hồ sơ chủ nuôi đã nhập, kể cả khi email hoặc số điện thoại trùng khớp. Tài khoản có hồ sơ trùng sẽ ở trạng thái chờ xác minh; quản trị viên chỉ liên kết sau khi cửa hàng xác minh khách hàng tại **Quản trị → Phân quyền RBAC → Xác minh / liên kết**. Tài khoản không khớp hồ sơ hiện có sẽ nhận một hồ sơ chủ nuôi mới. Cơ chế này tránh cấp quyền vào dữ liệu thú cưng/lịch hẹn cho người chỉ biết thông tin liên hệ.

Tên collection được chỉ định rõ trong các model (ví dụ `pets`, `services`, `staff`); chúng không còn được ánh xạ sang tên Mongoose mặc định như `familymembers`, `specialties` hoặc `doctors`. Các collection `payments` và `medical_notes` được giữ nguyên nhưng hiện chưa có giao diện nghiệp vụ tương ứng.

### Dữ liệu hiện có và an toàn khi chạy

- Ứng dụng kết nối đến database ghi trong `MONGODB_URI`; nó **không nhập các file JSON tự động**. Các file export là bản sao dữ liệu, không phải lệnh migration.
- Không dùng tùy chọn `--drop`, không xóa collection và không chạy dữ liệu seed trên database cửa hàng. `npm run seed` và `npm run seed:test-users` hiện bị vô hiệu hóa để tránh ghi đè hoặc làm bẩn dữ liệu đã nhập.
- Hãy thử nghiệm trên một database riêng đã được tạo từ bản sao. Nếu cần nhập các file JSON, xác minh database và collection đích trước; không ghi đè collection đang có.
- Khi backend khởi động, Mongoose có thể tạo các index được khai báo trong model. Ứng dụng không tự xóa index cũ; hãy sao lưu và kiểm tra trên database thử nghiệm trước khi vận hành dữ liệu thật.
- Tài khoản trong `owners` không có thông tin đăng nhập ứng dụng. Chủ thú cưng cần đăng ký tài khoản trong ứng dụng; tài khoản nhân viên trong collection `staff` hiện phục vụ phân công lịch, chưa tự động trở thành tài khoản đăng nhập `users`.
- Đăng nhập OTP/SMS, 2FA nhân viên và khôi phục mật khẩu đang tắt cho đến khi cấu hình nhà cung cấp xác minh thật. Không có mã OTP hoặc mã đặt lại mật khẩu dùng chung.

## Tạo tài khoản quản trị

Thiết lập trong `server/.env`:

```env
ADMIN_NAME=Quản trị viên
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=thay-bang-mat-khau-manh-tu-8-ky-tu
```

Khi đã xác nhận `MONGODB_URI` trỏ đến đúng database, thực hiện trong thư mục `server`:

```bash
npm run create-admin
```

Lệnh này tạo tài khoản quản trị trong collection `users`, không xóa dữ liệu. Không dùng mật khẩu ví dụ ở môi trường thật.

## Chức năng chính

- Quản lý hồ sơ thú cưng và lưu ý khi chăm sóc.
- Xem dịch vụ grooming, nhân viên và khung giờ theo ca; tạo và theo dõi lịch hẹn.
- Giữ nguyên các bản ghi thú y/lưu trú có trong database nhưng không đưa chúng vào luồng đặt lịch grooming.
- Giao diện vận hành cho nhân viên cửa hàng và quản trị viên.

Một số trang vận hành nâng cao và quy trình thanh toán/ghi chú y tế chưa được tích hợp hoàn chỉnh.
