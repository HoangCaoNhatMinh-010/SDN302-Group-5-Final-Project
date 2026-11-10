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

### Sáu vai trò và trang tổng quan

| Role chuẩn | Nhãn hiển thị | Trang tổng quan |
|---|---|---|
| `PET_OWNER` | Khách hàng (Chủ thú cưng) | `/pet-owner/dashboard` |
| `RECEPTIONIST` | Nhân viên tiếp đón (Lễ tân) | `/receptionist/dashboard` |
| `GROOMER` | Chuyên viên Spa & Grooming | `/groomer/dashboard` |
| `VET_DOCTOR` | Bác sĩ chuyên khoa thú y | `/vet-doctor/dashboard` |
| `MANAGER` | Chủ cửa hàng / Quản lý | `/manager/dashboard` |
| `ADMIN` | Quản trị viên hệ thống (Admin) | `/admin/dashboard` |

Chỉ sáu giá trị trên được chấp nhận làm role tài khoản trong frontend, API và collection `users`. Nếu database còn role cũ, hãy sao lưu và sửa thủ công các giá trị `users.role` theo hướng dẫn kiểm thử. Backend sẽ từ chối khởi động nếu tìm thấy role ngoài danh sách chuẩn; project không tự sửa dữ liệu và không kèm script migration role. Collection `staff` có các vai trò nghiệp vụ riêng theo schema cửa hàng (`GROOMER`, `VET`, `MANAGER`,...) và không bị thay đổi. Admin có thể tạo tài khoản nhân viên tại **Quản trị → Quản lý nhân viên**. Tài khoản chủ thú cưng đăng ký qua trang **Đăng ký**.

Các URL trình duyệt ở `localhost:5173` được nhóm theo sáu tiền tố role. API ở `localhost:5000` hiện có chức năng cho `/api/v1/pet-owner/...`, `/api/v1/groomer/...` và `/api/v1/admin/...`; backend chưa có API nghiệp vụ riêng cho lễ tân, bác sĩ thú y hoặc quản lý. `/api/v1/groomer` cung cấp dữ liệu công khai về dịch vụ, groomer và khung giờ cho luồng đặt lịch, không phải API dashboard đăng nhập của groomer. Frontend mới gọi `/api/v1/pet-owner/pets`, `/api/v1/groomer/services` và `/api/v1/admin/groomers`; các URL API cũ như `/api/v1/doctors`, `/api/v1/family-members`, `/api/v1/pet-owner/family-members` và `/api/v1/admin/doctors` vẫn được giữ làm bí danh tương thích.

Các vai trò có trang tổng quan và quyền truy cập theo role; một số trang vận hành vẫn là khung giao diện/placeholder. Đặc biệt, lịch khám và hồ sơ y tế của bác sĩ thú y chưa kết nối API đọc/ghi `medical_notes` hoặc lịch hẹn thú y. Không dùng các trang đó như hồ sơ y tế thật. Luồng đặt lịch trực tuyến hiện tại dành riêng cho Spa & Grooming; bác sĩ thú y không xuất hiện như nhân viên grooming.

## Cấu trúc dữ liệu MongoDB

Các trang chủ thú cưng dùng tiền tố URL `/pet-owner` (ví dụ `/pet-owner/dashboard`, `/pet-owner/pets`, `/pet-owner/services`). Các đường dẫn cũ như `/patient/...`, `/doctor/...`, `/veterinarian/...`, `/pet-owner/family` và `/pet-owner/specialties` được chuyển hướng sang đường dẫn chuẩn để không làm hỏng bookmark.

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
| `medical_notes` | Ghi chú y tế hiện có; được giữ nguyên nhưng chưa được đọc/ghi bởi giao diện bác sĩ thú y. |

Ứng dụng còn dùng collection `users` cho đăng nhập, phân quyền và tài khoản quản trị; collection này không nằm trong bộ dữ liệu cửa hàng nêu trên. Tài khoản đăng ký **không tự động nhận quyền truy cập** hồ sơ chủ nuôi đã nhập, kể cả khi email hoặc số điện thoại trùng khớp. Tài khoản có hồ sơ trùng sẽ ở trạng thái chờ xác minh; quản trị viên chỉ liên kết sau khi cửa hàng xác minh khách hàng tại **Quản trị → Phân quyền RBAC → Xác minh / liên kết**. Tài khoản không khớp hồ sơ hiện có sẽ nhận một hồ sơ chủ nuôi mới. Cơ chế này tránh cấp quyền vào dữ liệu thú cưng/lịch hẹn cho người chỉ biết thông tin liên hệ.

Tên collection được chỉ định rõ trong các model (ví dụ `pets`, `services`, `staff`); chúng không còn được ánh xạ sang tên Mongoose mặc định như `familymembers`, `specialties` hoặc `doctors`. Các collection `payments` và `medical_notes` được giữ nguyên nhưng hiện chưa có giao diện nghiệp vụ tương ứng.

Các model trong `server/models` đều dùng ES modules và được import trực tiếp bởi nơi sử dụng; không còn phụ thuộc vào thư mục `server/compat`. `User` và `AdminSetting` cũng là model riêng trong `server/models`, lần lượt dùng collections `users` và `admin_settings`. Danh sách role và các khu vực cấu hình quản trị được export ngay từ các model tương ứng. Các schema và tên collection hiện có được giữ nguyên. Mã giao diện được nhóm theo thư mục role chuẩn như `src/pages/pet-owner`, `src/pages/receptionist`, `src/pages/groomer`, `src/pages/vet-doctor`, `src/pages/manager` và `src/pages/admin`; các controller/API tương ứng cũng dùng tên pet/groomer. Tên model và trường dữ liệu hiện có như `Staff`, `patientCode` được giữ nguyên khi cần tương thích với collection hiện hữu. Khi quản trị viên tạo tài khoản nhân viên, ứng dụng đồng bộ hồ sơ nhân viên vào `staff`. Các collection phụ còn gồm `notifications` và `audit_logs`; thông báo được lưu nội bộ, không gửi SMS/Zalo/push ra ngoài.

### Dữ liệu hiện có và an toàn khi chạy

- Ứng dụng kết nối đến database ghi trong `MONGODB_URI`; nó **không nhập các file JSON tự động**. Các file export là bản sao dữ liệu, không phải lệnh migration.
- Bộ JSON được đặt tên theo database `test_pet_booking_database`; bảo đảm URI trỏ đúng database này trước khi chạy backend. Không chia sẻ hoặc đưa `server/.env` lên Git vì file đó chứa thông tin xác thực.
- Hãy thử nghiệm trên một database riêng đã được tạo từ bản sao. Nếu cần nhập các file JSON, xác minh database và collection đích trước; không ghi đè collection đang có.
- Backend tắt việc tự tạo index của Mongoose khi kết nối, và không gọi `Model.init()` lúc khởi động. Vì vậy, chạy server không tự tạo/xóa index; nếu cần áp dụng index trong model, hãy kiểm tra dữ liệu/index hiện có và chạy kế hoạch migration riêng trên bản sao trước.
- Tài khoản trong `owners` không có thông tin đăng nhập ứng dụng. Chủ thú cưng cần đăng ký tài khoản trong ứng dụng. Hồ sơ nhân viên sẵn có trong `staff` không tự có tài khoản đăng nhập; quản trị viên cần tạo tài khoản qua màn hình **Quản lý nhân viên**. Tài khoản nhân viên cần số điện thoại hợp lệ 10 chữ số bắt đầu bằng `0`; hồ sơ đăng nhập và nhân viên được lưu riêng trong `users` và `staff`.
- Đăng nhập OTP/SMS, 2FA nhân viên và khôi phục mật khẩu đang tắt cho đến khi cấu hình nhà cung cấp xác minh thật. Không có mã OTP hoặc mã đặt lại mật khẩu dùng chung.

## Tài khoản Khách hàng / Chủ nuôi Demo:
- Email: minh.nguyen@example.com
- SĐT: 0901234567
- Password: 123456

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

## Danh sách các tài khoản demo
   Vai trò     |         Email           |     SĐT (Nếu có)     |   Mật khẩu
  Khách hàng     minh.nguyen@example.com   0901234567             123456
(Chủ thú cưng)




## Chức năng chính

- Quản lý hồ sơ thú cưng và lưu ý khi chăm sóc.
- Xem dịch vụ grooming, nhân viên và khung giờ theo ca; tạo và theo dõi lịch hẹn.
- Giữ nguyên các bản ghi thú y/lưu trú có trong database nhưng không đưa chúng vào luồng đặt lịch grooming.
- Phân quyền sáu vai trò với trang tổng quan riêng; một số nghiệp vụ vận hành, lịch khám và hồ sơ y tế vẫn là placeholder/chưa có API.

Một số trang vận hành nâng cao và quy trình thanh toán/ghi chú y tế chưa được tích hợp hoàn chỉnh.
