# Hướng dẫn khởi chạy và kiểm thử PawCare Studio

Tài liệu này hướng dẫn cài đặt, chạy và kiểm thử riêng frontend và backend của ứng dụng đặt lịch chăm sóc thú cưng. Project dùng React/Vite cho giao diện, Express/Mongoose cho API và MongoDB cho dữ liệu.

> **Cảnh báo dữ liệu:** Các thao tác đăng ký, sửa hồ sơ, thêm thú cưng, đặt/hủy lịch, đánh dấu thông báo đã đọc và tạo tài khoản quản trị đều có thể ghi vào MongoDB. Chỉ kiểm thử nghiệp vụ có ghi trên database thử nghiệm riêng hoặc bản sao đã được xác nhận. Không dùng database cửa hàng thật để chạy thử.

## 1. Yêu cầu trước khi bắt đầu

- Node.js tương thích với Vite 8 (khuyến nghị Node.js `22.12` trở lên) và npm.
- MongoDB đã chạy và thông tin kết nối hợp lệ. Bộ JSON được cung cấp có tên database `test_pet_booking_database`; đối chiếu database đích trước khi khởi chạy.
- VS Code hoặc terminal PowerShell.
- Hai cửa sổ terminal riêng để chạy frontend và backend cùng lúc.

Kiểm tra phiên bản:

```powershell
node --version
npm --version
```

Chuyển đến thư mục project (thay đường dẫn cho phù hợp với máy):

```powershell
Set-Location 'D:\duong-dan\SDN302-Group-5-Final-Project'
```

## 2. Cài dependency

### Frontend

Tại thư mục gốc project:

```powershell
npm install
```

### Backend

Mở terminal thứ hai, tại thư mục gốc project:

```powershell
Set-Location 'D:\duong-dan\SDN302-Group-5-Final-Project\server'
npm install
```

Không chạy `npm install` trong các thư mục JSON export. Không cần cài MongoDB package riêng; backend đã khai báo Mongoose trong `server/package.json`.

## 3. Cấu hình backend

Backend đọc cấu hình từ `server/.env`. Nếu chưa có file này, tạo từ file mẫu:

```powershell
Set-Location 'D:\duong-dan\SDN302-Group-5-Final-Project\server'
Copy-Item '.env.example' '.env'
```

Mở `server/.env` và tự điền giá trị phù hợp trên máy:

```env
PORT=5000
MONGODB_URI=<MongoDB URI có tên database đúng>
JWT_SECRET=<chuỗi ngẫu nhiên bí mật dài ít nhất 32 ký tự>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

- `MONGODB_URI` phải trỏ đúng database bạn định dùng. Không dán URI có username/password vào README, chat, ảnh chụp màn hình hoặc Git.
- `JWT_SECRET` phải là bí mật riêng, ít nhất 32 ký tự. Không dùng chuỗi mẫu trong `.env.example`.
- Nếu `MONGODB_URI` chưa được đặt, backend có hỗ trợ biến cũ `MONGO_URI`; không nên khai báo cả hai giá trị khác nhau.
- Không đưa `server/.env` lên Git. `.gitignore` đã loại `.env` khỏi Git; chỉ chia sẻ file `.env.example` đã bỏ thông tin bí mật.
- Không dùng các lệnh seed để khởi tạo database cửa hàng. `npm run seed` và `npm run seed:test-users` không phải lệnh kiểm thử của project và hiện không được cung cấp trong scripts.

Trước khi chạy, xác nhận MongoDB đang hoạt động và tên database trong URI là chính xác. Project **không tự nhập** các file trong `ThuMucChuaDatabaseChoMongoDB`.

### Chuyển role tài khoản hiện có sang sáu role chuẩn

Phiên bản này chỉ chấp nhận sáu giá trị role trong collection `users`: `PET_OWNER`, `RECEPTIONIST`, `GROOMER`, `VET_DOCTOR`, `MANAGER`, `ADMIN`. Project không có script migration và không tự sửa dữ liệu. Nếu database còn role cũ, hãy sửa thủ công trước khi chạy backend; backend sẽ báo lỗi và từ chối khởi động nếu phát hiện role ngoài danh sách.

1. Dừng backend, tạo bản sao lưu database và xác nhận `server/.env` trỏ đúng database.
2. Trong MongoDB Compass, mở đúng database và collection `users`. Lọc theo từng role cũ, kiểm tra các tài khoản khớp, rồi sửa trường `role` thành role chuẩn tương ứng:

   | Role cũ trong `users.role` | Role mới |
   |---|---|
   | `PATIENT` | `PET_OWNER` |
   | `DOCTOR`, `STAFF` | `GROOMER` — chỉ chọn cho tài khoản thực sự là nhân viên grooming |
   | `VET`, `VETERINARIAN` | `VET_DOCTOR` |
   | `CLINIC_MANAGER` | `MANAGER` |

   Chỉ cập nhật tài khoản đã xác minh đúng vai trò; không gán `ADMIN` để thay thế một role cũ. Không sửa role trong collection `staff`: các role hồ sơ nhân viên dùng enum riêng.
3. Kiểm tra lại collection `users`, bảo đảm mọi tài khoản chỉ dùng sáu role chuẩn nêu trên.
4. Khởi động backend và kiểm thử đăng nhập, dashboard, RBAC và danh sách người dùng. Không cần chỉnh dữ liệu nếu collection `users` vốn đã chỉ chứa role chuẩn.

## 4. Khởi chạy ứng dụng

### 4.1 Chạy backend

Trong terminal backend, tại thư mục `server`:

```powershell
npm run dev
```

Hoặc chạy chế độ start:

```powershell
npm start
```

Khi kết nối thành công, API mặc định lắng nghe tại `http://localhost:5000`. Nếu backend dừng và báo lỗi cấu hình, kiểm tra `MONGODB_URI`, khả năng truy cập MongoDB và `JWT_SECRET`. Không gửi nguyên văn thông báo nếu trong đó có thông tin nhạy cảm.

Kiểm tra health endpoint bằng PowerShell:

```powershell
Invoke-RestMethod 'http://localhost:5000/api/health'
```

Kết quả bình thường có `status: online` và `database: connected`. Nếu cổng 5000 đang được ứng dụng khác sử dụng, đổi `PORT` trong `server/.env`; khi đổi cổng, cập nhật `server/vite.config.js` proxy để frontend tiếp tục gọi đúng backend.

### 4.2 Chạy frontend

Trong terminal frontend, tại thư mục gốc project:

```powershell
npm run dev
```

Mở địa chỉ:

```text
http://localhost:5173
```

Vite proxy chuyển các request `/api` sang backend ở `http://localhost:5000`; thông thường không cần cấu hình CORS hoặc URL API riêng cho môi trường phát triển.

Để dừng mỗi tiến trình, chọn terminal tương ứng và nhấn `Ctrl+C`.

## 5. Kiểm thử frontend

### 5.1 Kiểm tra production build

Tại thư mục gốc:

```powershell
npm run build
```

Build thành công khi Vite kết thúc với thông báo build hoàn tất và mã thoát bằng 0. Thư mục `dist` là đầu ra sinh tự động, không phải mã nguồn cần chỉnh sửa.

Có thể xem trước bản build sau khi build thành công:

```powershell
npm run preview
```

Vite sẽ in URL preview vào terminal. Dừng preview bằng `Ctrl+C`.

### 5.2 Chạy lint frontend

```powershell
npm run lint
```

Lệnh này chạy Oxlint. Project có thể trả về thành công nhưng vẫn liệt kê cảnh báo; xem tên file và dòng trong output để phân biệt cảnh báo với lỗi. Chỉ coi lint thất bại khi command trả mã thoát khác 0 hoặc báo lỗi chặn kiểm tra.

### 5.3 Kiểm tra thủ công trên trình duyệt

Với cả frontend và backend đang chạy:

1. Mở `http://localhost:5173`, xác nhận trang render và không có lỗi nghiêm trọng trong DevTools Console.
2. Mở trang đăng nhập/đăng ký; kiểm tra validation trường bắt buộc và thông báo lỗi. **Không tạo tài khoản trên database cửa hàng trong lúc thử.**
3. Với tài khoản thử nghiệm đã được tạo riêng, đăng nhập và kiểm tra điều hướng theo vai trò.
4. Kiểm tra trang dịch vụ và đội ngũ: danh sách chỉ bao gồm dịch vụ grooming và nhân viên đủ điều kiện phục vụ grooming.
5. Kiểm tra danh sách hồ sơ thú cưng và lịch hẹn. Nếu tài khoản đang chờ cửa hàng xác minh, giao diện cần báo trạng thái chờ và chặn xem/thao tác hồ sơ.
6. Kiểm tra trang thông báo; nếu chưa có thông báo, danh sách rỗng là kết quả hợp lệ. Không được thay thế bằng dữ liệu demo khi API lỗi.
7. Mở DevTools → Network, lọc `/api`, xác nhận request dùng URL localhost, phản hồi có cấu trúc JSON và không trả lỗi ngoài dự kiến.
8. Thử co/giãn cửa sổ để rà soát bố cục desktop/mobile.

Thao tác gửi biểu mẫu đặt lịch, chỉnh sửa hồ sơ, thêm thú cưng hoặc đánh dấu thông báo đã đọc sẽ ghi database. Chỉ thực hiện ở môi trường thử nghiệm.

### 5.4 Kiểm thử sáu vai trò

Mỗi nhân viên cần tài khoản riêng do Admin tạo tại **Quản trị → Quản lý nhân viên**; tài khoản chủ thú cưng đăng ký từ trang đăng ký. Tạo một tài khoản thử nghiệm cho từng role, đăng nhập riêng và kiểm tra điều hướng đến đúng dashboard dưới đây:

| Role chuẩn | Nhãn hiển thị | Dashboard | Phạm vi kiểm thử |
|---|---|---|---|
| `PET_OWNER` | Khách hàng (Chủ thú cưng) | `/pet-owner/dashboard` | Hồ sơ thú cưng và đặt lịch grooming; quyền hồ sơ phụ thuộc liên kết owner đã xác minh. |
| `RECEPTIONIST` | Nhân viên tiếp đón (Lễ tân) | `/receptionist/dashboard` | Dashboard tiếp đón; các màn hình lịch/check-in còn là khung giao diện. |
| `GROOMER` | Chuyên viên Spa & Grooming | `/groomer/dashboard` | Dashboard và lịch chăm sóc grooming; không dùng như vai trò bác sĩ thú y. |
| `VET_DOCTOR` | Bác sĩ chuyên khoa thú y | `/vet-doctor/dashboard` | Xác nhận dashboard và các trang lịch khám/hồ sơ y tế hiện thông báo giới hạn tích hợp; API y tế chưa được triển khai. |
| `MANAGER` | Chủ cửa hàng / Quản lý | `/manager/dashboard` | Dashboard quản lý; các trang quản lý nâng cao hiện là khung giao diện. |
| `ADMIN` | Quản trị viên hệ thống (Admin) | `/admin/dashboard` | Quản lý người dùng, tạo nhân viên, phân quyền và nhật ký theo quyền admin. |

Đảm bảo đã sửa thủ công role ở mục 3 nếu database từng dùng role cũ. Role hồ sơ nhân viên trong collection `staff` vẫn dùng enum riêng của schema. Với từng tài khoản, thử mở trực tiếp dashboard của role khác. Kết quả mong đợi là bị chặn/đưa tới trang không có quyền; sau đó truy cập lại dashboard đúng role. Nếu cần kiểm tra quyền API quản trị, gọi endpoint quản trị bằng token của role không phải Admin và xác nhận `403`. Các màn hình placeholder không đồng nghĩa nghiệp vụ đã được triển khai; không nhập hoặc dựa vào dữ liệu y tế giả như dữ liệu khám thật.

## 6. Kiểm thử backend

### 6.1 Kiểm tra cú pháp JavaScript

Tại thư mục gốc project:

```powershell
$files = Get-ChildItem -LiteralPath 'server' -Recurse -Filter '*.js' |
  Where-Object { $_.FullName -notmatch '\\node_modules\\' }
$failed = $false
foreach ($file in $files) {
  node --check $file.FullName
  if ($LASTEXITCODE -ne 0) {
    Write-Output "Syntax error: $($file.FullName)"
    $failed = $true
  }
}
if ($failed) { exit 1 } else { Write-Output "Backend syntax OK ($($files.Count) files)" }
```

### 6.2 Kiểm tra health API

```powershell
Invoke-RestMethod 'http://localhost:5000/api/health'
```

Endpoint này báo trạng thái API và kết nối database; nó không thay thế kiểm thử nghiệp vụ.

### 6.3 Kiểm tra bảo vệ API không cần đăng nhập

API hồ sơ thú cưng và lịch hẹn cần bearer token. Kiểm tra request không có token phải bị từ chối:

```powershell
try {
  Invoke-RestMethod 'http://localhost:5000/api/v1/pet-owner/pets'
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

Kết quả mong đợi là `401`. Gọi API không token không tạo dữ liệu.

### 6.4 Smoke test các endpoint đọc công khai

Các endpoint dịch vụ, nhân viên grooming và khung giờ có thể kiểm tra bằng GET:

```powershell
Invoke-RestMethod 'http://localhost:5000/api/v1/groomer/specialties'
Invoke-RestMethod 'http://localhost:5000/api/v1/groomer'
```

Kiểm tra danh sách trả về không bao gồm dịch vụ `vet` hoặc `boarding`. Để kiểm tra khung giờ, thay `<STAFF_ID>` và ngày theo định dạng `DD/MM/YYYY` bằng dữ liệu hợp lệ của môi trường thử nghiệm:

```powershell
Invoke-RestMethod 'http://localhost:5000/api/v1/groomer/<STAFF_ID>/available-slots?date=15/12/2026&durationMinutes=60'
```

Đây là thao tác đọc. Không dùng ID hoặc thông tin cá nhân của khách hàng trong báo cáo công khai.

### 6.5 Kiểm thử xác thực và nghiệp vụ

Thực hiện qua giao diện hoặc API client riêng trên database thử nghiệm:

1. Đăng ký tài khoản dùng thông tin thử nghiệm.
2. Nếu email hoặc số điện thoại trùng với chủ nuôi đã import, xác nhận tài khoản ở trạng thái chờ liên kết; không được truy cập thú cưng/lịch hẹn cho đến khi admin xác minh.
3. Thử một thông tin không khớp trên database dùng riêng; xác nhận hệ thống tạo liên kết chủ nuôi đúng theo thiết kế.
4. Sau khi admin liên kết thủ công, kiểm tra API thú cưng chỉ trả dữ liệu thuộc hồ sơ chủ nuôi đã liên kết.
5. Thử đặt lịch với ngày đã qua, dịch vụ không hoạt động, nhân viên không được phân công hoặc khung giờ ngoài ca: request cần bị từ chối.
6. Thử đặt lịch trong ca còn trống; chỉ làm trên dữ liệu thử vì thao tác này tạo document `appointments` và `notifications`.
7. Thử đặt trùng giờ cho cùng nhân viên; request sau phải nhận conflict và không tạo lịch trùng.
8. Hủy lịch thử nghiệm và xác nhận trạng thái lịch thay đổi; thao tác hủy cũng ghi database.
9. Đăng nhập bằng vai trò không phải admin và gọi route quản trị; kết quả mong đợi là `403`.

Tài khoản owner trong collection `owners` không tự có tài khoản đăng nhập. Tài khoản đăng nhập nằm trong collection `users`; hồ sơ nhân viên có thể tồn tại riêng trong `staff`. Khi tạo nhân viên qua **Quản trị → Quản lý nhân viên**, ứng dụng đồng bộ tài khoản vào `users` và hồ sơ phân công vào `staff`. Số điện thoại nhân viên phải gồm 10 chữ số, bắt đầu bằng `0`.

### 6.6 Tình trạng test tự động

Hiện `package.json` gốc và `server/package.json` không khai báo script `test`; project cũng không có file `*.test.*` hoặc `*.spec.*` được phát hiện. Vì vậy:

- Không chạy `npm test` với kỳ vọng có suite tự động; sẽ không có test script tương ứng.
- Dùng `npm run build`, `npm run lint`, kiểm tra cú pháp backend và smoke test thủ công/API ở các mục trên.
- Nếu bổ sung test tự động, dùng database test tách biệt và thiết lập rõ việc tạo/xóa dữ liệu test trước khi chạy.

## 7. Các endpoint chính

Sau khi đăng nhập chủ thú cưng, trang tổng quan ở `/pet-owner/dashboard`; hồ sơ thú cưng và dịch vụ ở `/pet-owner/pets` và `/pet-owner/services`. Các URL cũ `/patient/...`, `/doctor/...`, `/veterinarian/...`, `/pet-owner/family` và `/pet-owner/specialties` chỉ được giữ để chuyển hướng sang URL chuẩn.

Tất cả API bắt đầu bằng `/api/v1`, ngoại trừ health endpoint. Các API theo role hiện có là `/api/v1/pet-owner/...`, `/api/v1/groomer/...` và `/api/v1/admin/...`. Backend chưa có endpoint nghiệp vụ riêng cho lễ tân, bác sĩ thú y hoặc quản lý; các giao diện này hiện là dashboard/placeholder. `/api/v1/groomer` cung cấp dữ liệu công khai về dịch vụ/groomer dùng cho đặt lịch, không phải API dashboard cho nhân viên. Frontend gọi các endpoint chuẩn `/api/v1/pet-owner/pets`, `/api/v1/groomer/services` và `/api/v1/admin/groomers`; các endpoint `/api/v1/family-members`, `/api/v1/pet-owner/family-members`, `/api/v1/doctors` và `/api/v1/admin/doctors` vẫn là bí danh tương thích.

| Phương thức | Endpoint | Đăng nhập | Mục đích |
|---|---|---:|---|
| `GET` | `/api/health` | Không | Tình trạng API và MongoDB |
| `POST` | `/api/v1/auth/register` | Không | Đăng ký khách hàng; có thể tạo `users` và `owners` |
| `POST` | `/api/v1/auth/login` | Không | Đăng nhập bằng email/số điện thoại và mật khẩu |
| `GET` | `/api/v1/auth/me` | Có | Đọc tài khoản hiện tại |
| `GET` | `/api/v1/groomer/services` | Không | Danh sách dịch vụ grooming |
| `GET` | `/api/v1/groomer` | Không | Danh sách nhân viên grooming |
| `GET` | `/api/v1/groomer/:id/available-slots` | Không | Khung giờ theo ca và lịch hiện có |
| `GET/POST` | `/api/v1/pet-owner/pets` | Chủ thú cưng | Đọc/tạo hồ sơ thú cưng |
| `GET` | `/api/v1/pet-owner/appointments/my-appointments` | Chủ thú cưng | Đọc lịch hẹn của chủ nuôi |
| `POST` | `/api/v1/pet-owner/appointments` | Chủ thú cưng | Đặt lịch; ghi database |
| `PUT` | `/api/v1/pet-owner/appointments/:id/cancel` | Chủ thú cưng | Hủy lịch; ghi database |
| `GET` | `/api/v1/notifications` | Có | Đọc thông báo |
| `PUT` | `/api/v1/notifications/read-all` hoặc `/api/v1/notifications/:id/read` | Có | Đánh dấu thông báo đã đọc |
| `/api/v1/admin/*` | Nhiều phương thức | Admin | Quản trị người dùng, dịch vụ, nhân viên và cấu hình |

OTP/SMS và khôi phục mật khẩu đang trả trạng thái chưa khả dụng cho đến khi tích hợp nhà cung cấp xác minh thật.

## 8. Tạo tài khoản quản trị

Chỉ tạo tài khoản admin trong database thử nghiệm hoặc sau khi đã xác nhận rõ database đích. Thêm các biến dưới đây vào `server/.env` (tự đặt mật khẩu mạnh, không dùng giá trị minh họa):

```env
ADMIN_NAME=Quản trị viên
ADMIN_EMAIL=<email quản trị>
ADMIN_PASSWORD=<mật khẩu mạnh tối thiểu 8 ký tự>
```

Tại thư mục `server`, chạy:

```powershell
npm run create-admin
```

Lệnh này kết nối MongoDB và tạo một document trong `users`. Nếu email đã tồn tại, lệnh không thay đổi tài khoản đó. Lệnh này không tạo hoặc thay đổi document trong `staff`.

## 9. Xử lý sự cố thường gặp

### `MONGODB_URI must be configured`

- Kiểm tra file đúng vị trí `server/.env`.
- Bảo đảm có `MONGODB_URI` hoặc biến tương thích cũ `MONGO_URI`.
- Không chép nguyên URI vào nơi công khai để nhờ kiểm tra.

### Lỗi kết nối MongoDB hoặc API không khởi động

- Kiểm tra MongoDB/Atlas đang hoạt động và máy có quyền truy cập mạng.
- Kiểm tra hostname, tên database và quyền user database trong `.env`.
- Kiểm tra backend log; che username, password, hostname nhạy cảm trước khi chia sẻ.

### Thiếu `JWT_SECRET` hoặc secret quá ngắn

Đặt `JWT_SECRET` riêng dài ít nhất 32 ký tự trong `server/.env`, sau đó khởi động lại backend. Không dùng ví dụ trong `.env.example` cho môi trường thực tế.

### Frontend mở được nhưng request `/api` lỗi

- Xác nhận backend đang chạy ở cổng 5000.
- Gọi `http://localhost:5000/api/health` trực tiếp.
- Xem terminal Vite/backend và DevTools → Network.
- Nếu đổi cổng API, đồng bộ `server/vite.config.js` proxy.

### Cổng 5173 hoặc 5000 đã được sử dụng

Đóng tiến trình project đang chạy hoặc đổi cổng tương ứng. Nếu đổi cổng backend, nhớ cập nhật target proxy trong `server/vite.config.js`.

### Dữ liệu UI trống hoặc tài khoản chờ xác minh

- Dữ liệu export không tự được nạp vào database.
- Kiểm tra `MONGODB_URI` trỏ tới đúng database và collection.
- Tài khoản trùng hồ sơ owner cần nhân viên cửa hàng xác minh trước khi liên kết; không bỏ qua bước này để “sửa” lỗi quyền truy cập.

## 10. Checklist trước khi trình diễn

- [ ] Backend và MongoDB đã được xác nhận dùng database thử nghiệm.
- [ ] `server/.env` có URI đúng và secret JWT đủ mạnh, không bị commit/chia sẻ.
- [ ] `GET /api/health` cho biết API và database đã sẵn sàng.
- [ ] Frontend chạy được trên `http://localhost:5173`.
- [ ] `npm run build`, `npm run lint` và kiểm tra cú pháp backend đã được chạy.
- [ ] Dịch vụ/nhân viên hiển thị trong luồng đặt lịch là grooming.
- [ ] Đã kiểm tra điều hướng và chặn truy cập theo cả sáu vai trò; các trang placeholder được phân biệt với nghiệp vụ/API đã hoàn thiện.
- [ ] Tài khoản bác sĩ thú y chỉ dùng kiểm tra giao diện; không xem `/vet-doctor/medical-notes` như hồ sơ y tế thật.
- [ ] Tài khoản trùng hồ sơ owner được xử lý theo quy trình xác minh thủ công.
- [ ] Không chạy seed, import, reset hoặc xóa dữ liệu trên database cửa hàng.
- [ ] Đã chuẩn bị tài khoản và dữ liệu thử nghiệm, không dùng thông tin khách hàng thật khi trình chiếu.
