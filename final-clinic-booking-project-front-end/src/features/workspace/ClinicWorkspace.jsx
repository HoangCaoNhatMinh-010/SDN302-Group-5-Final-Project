import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api/client';
import useAuthStore from '@/stores/authStore';

const roleNames = {
  PATIENT: 'Bệnh nhân',
  RECEPTIONIST: 'Lễ tân',
  DOCTOR: 'Bác sĩ',
  MANAGER: 'Quản lý',
  ADMIN: 'Quản trị viên',
};

const navigation = {
  PATIENT: [
    ['overview', 'Tổng quan'],
    ['booking', 'Đặt lịch khám'],
    ['appointments', 'Lịch hẹn của tôi'],
    ['payments', 'Thanh toán'],
    ['profile', 'Hồ sơ cá nhân'],
    ['consents', 'Quyền riêng tư'],
    ['notifications', 'Thông báo'],
  ],
  RECEPTIONIST: [
    ['overview', 'Tổng quan'],
    ['calendar', 'Lịch tiếp nhận'],
    ['checkin', 'Check-in'],
    ['queue', 'Hàng đợi'],
    ['booking', 'Đặt lịch hộ'],
    ['appointments', 'Lịch hẹn'],
    ['payments', 'Thanh toán'],
    ['notifications', 'Thông báo'],
  ],
  DOCTOR: [
    ['overview', 'Tổng quan'],
    ['calendar', 'Lịch làm việc'],
    ['block-time', 'Khóa khung giờ'],
    ['clinical', 'Khám bệnh'],
    ['notifications', 'Thông báo'],
  ],
  MANAGER: [
    ['overview', 'Tổng quan'],
    ['calendar', 'Lịch khám'],
    ['schedules', 'Tạo lịch bác sĩ'],
    ['services', 'Dịch vụ'],
    ['staff', 'Nhân sự'],
    ['reports', 'Báo cáo'],
    ['payments', 'Thanh toán'],
    ['notifications', 'Thông báo'],
  ],
  ADMIN: [
    ['overview', 'Tổng quan'],
    ['users', 'Tài khoản & vai trò'],
    ['audit', 'Audit log'],
    ['reports', 'Báo cáo'],
    ['services', 'Dịch vụ'],
    ['payments', 'Thanh toán'],
    ['notifications', 'Thông báo'],
  ],
};

const sectionTitles = {
  overview: 'Tổng quan',
  booking: 'Đặt lịch khám',
  appointments: 'Lịch hẹn',
  payments: 'Thanh toán',
  profile: 'Hồ sơ cá nhân',
  consents: 'Quyền riêng tư',
  notifications: 'Thông báo',
  calendar: 'Lịch khám',
  checkin: 'Tiếp nhận bệnh nhân',
  queue: 'Hàng đợi khám',
  clinical: 'Hồ sơ khám bệnh',
  schedules: 'Tạo lịch bác sĩ',
  'block-time': 'Khóa khung giờ',
  services: 'Quản lý dịch vụ',
  staff: 'Quản lý nhân sự',
  users: 'Tài khoản và phân quyền',
  audit: 'Nhật ký hệ thống',
  reports: 'Báo cáo hoạt động',
};

const today = new Date().toLocaleDateString('en-CA');

export default function ClinicWorkspace() {
  const { user, isAuthenticated, login, logout, updateUser, token } = useAuthStore();
  const [section, setSection] = useState('overview');
  const [authMode, setAuthMode] = useState('otp');
  const [authBusy, setAuthBusy] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', phone: '', password: '', code: '' });
  const [otpRequested, setOtpRequested] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState({});
  const [doctorId, setDoctorId] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [bookingDate, setBookingDate] = useState(today);
  const [availability, setAvailability] = useState({ scheduleId: '', slots: [] });
  const [selectedSlot, setSelectedSlot] = useState('');
  const [saving, setSaving] = useState(false);

  const navItems = useMemo(() => navigation[user?.role] ?? [], [user?.role]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    apiClient.get('/auth/me')
      .then(({ user: current }) => updateUser(current))
      .catch(() => logout());
  }, [isAuthenticated, token, updateUser, logout]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    let active = true;
    async function loadSection() {
      setLoading(true);
      try {
        const next = {};
        if (section === 'overview' || ['appointments', 'calendar', 'checkin', 'queue', 'clinical'].includes(section)) {
          const params = section === 'checkin' ? { status: 'CONFIRMED' } : undefined;
          const result = await apiClient.get('/appointments', { params });
          next.appointments = result.items;
        }
        if (section === 'booking' || section === 'schedules' || section === 'services') {
          const [doctors, specialties, services] = await Promise.all([
            apiClient.get('/doctors'),
            apiClient.get('/specialties'),
            apiClient.get('/services'),
          ]);
          next.doctors = doctors.items;
          next.specialties = specialties.items;
          next.services = services.items;
        }
        if (section === 'booking' && user.role === 'RECEPTIONIST') {
          const patients = await apiClient.get('/users', { params: { role: 'PATIENT' } });
          next.patients = patients.items;
        }
        if (
          section === 'staff' ||
          section === 'users' ||
          (section === 'overview' && ['MANAGER', 'ADMIN'].includes(user.role))
        ) {
          const result = await apiClient.get('/users');
          next.users = result.items;
        }
        if (section === 'staff' || section === 'users') {
          const [specialties, doctors] = await Promise.all([
            apiClient.get('/specialties'),
            apiClient.get('/doctors'),
          ]);
          next.specialties = specialties.items;
          next.doctors = doctors.items;
        }
        if (section === 'services') {
          const result = await apiClient.get('/specialties');
          next.specialties = result.items;
        }
        if (section === 'reports' || section === 'overview') {
          if (['MANAGER', 'ADMIN'].includes(user.role)) {
            next.report = await apiClient.get('/reports/summary');
          }
        }
        if (section === 'audit') {
          const result = await apiClient.get('/audit');
          next.audit = result.items;
        }
        if (section === 'payments') {
          const result = await apiClient.get('/payments');
          next.payments = result.items;
        }
        if (section === 'notifications') {
          const result = await apiClient.get('/notifications');
          next.notifications = result.items;
        }
        if (section === 'consents') {
          const result = await apiClient.get('/consents');
          next.consents = result.items;
        }
        if (section === 'profile') {
          const result = await apiClient.get('/auth/me');
          next.profile = result.user;
        }
        if (section === 'schedules') {
          const result = await apiClient.get('/users', { params: { role: 'DOCTOR' } });
          next.users = result.items;
        }
        if (section === 'block-time') {
          const result = await apiClient.get('/schedules');
          next.schedules = result.items;
        }
        if (active) setData(next);
      } catch (error) {
        if (active) toast.error(error.message || 'Không thể tải dữ liệu.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadSection();
    return () => {
      active = false;
    };
  }, [section, isAuthenticated, user, refreshKey]);

  useEffect(() => {
    if (!doctorId || !bookingDate) {
      setAvailability({ scheduleId: '', slots: [] });
      setSelectedSlot('');
      return;
    }
    let active = true;
    apiClient.get('/schedules/availability', { params: { doctorId, date: bookingDate } })
      .then((result) => {
        if (!active) return;
        setAvailability(result);
        setSelectedSlot('');
      })
      .catch((error) => {
        if (active) toast.error(error.message || 'Không thể tải khung giờ.');
      });
    return () => {
      active = false;
    };
  }, [doctorId, bookingDate]);

  async function handleOtpRequest(event) {
    event.preventDefault();
    setAuthBusy(true);
    try {
      const result = await apiClient.post('/auth/otp/request', { phone: authForm.phone });
      setOtpRequested(true);
      setAuthNotice(result.developmentCode
        ? `Mã OTP thử nghiệm: ${result.developmentCode}`
        : result.message);
    } catch (error) {
      toast.error(error.message || 'Không thể yêu cầu mã xác thực.');
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleOtpVerify(event) {
    event.preventDefault();
    setAuthBusy(true);
    try {
      const result = await apiClient.post('/auth/otp/verify', {
        phone: authForm.phone,
        code: authForm.code,
      });
      login(result);
      setSection('overview');
    } catch (error) {
      toast.error(error.message || 'Mã xác thực không hợp lệ.');
    } finally {
      setAuthBusy(false);
    }
  }

  async function handlePasswordAuth(event) {
    event.preventDefault();
    setAuthBusy(true);
    try {
      const result = authMode === 'register'
        ? await apiClient.post('/auth/register', {
            name: authForm.name,
            phone: authForm.phone,
            password: authForm.password,
          })
        : await apiClient.post('/auth/login', {
            phone: authForm.phone,
            password: authForm.password,
          });
      login(result);
      setSection('overview');
    } catch (error) {
      toast.error(error.message || 'Không thể đăng nhập.');
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleLogout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      toast.error(error.message || 'Không thể kết thúc phiên trên máy chủ.');
    } finally {
      logout();
    }
  }

  async function bookAppointment(event) {
    event.preventDefault();
    if (!availability.scheduleId || !selectedSlot) {
      toast.error('Hãy chọn một khung giờ còn trống.');
      return;
    }
    setSaving(true);
    try {
      const result = await apiClient.post('/appointments', {
        scheduleId: availability.scheduleId,
        slotStart: selectedSlot,
        reason: event.currentTarget.reason.value,
        ...(serviceId && { serviceId }),
        ...(user.role === 'RECEPTIONIST' && { patientId }),
      });
      toast.success(result.warnings?.length ? result.warnings[0] : 'Đặt lịch thành công.');
      setSection('appointments');
    } catch (error) {
      toast.error(error.message || 'Không thể đặt lịch.');
    } finally {
      setSaving(false);
    }
  }

  async function performAction(action, successMessage) {
    try {
      await action();
      toast.success(successMessage);
      setRefreshKey((current) => current + 1);
    } catch (error) {
      toast.error(error.message || 'Thao tác không thành công.');
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <AuthScreen
        mode={authMode}
        setMode={(mode) => {
          setAuthMode(mode);
          setOtpRequested(false);
          setAuthNotice('');
        }}
        form={authForm}
        setForm={setAuthForm}
        otpRequested={otpRequested}
        notice={authNotice}
        busy={authBusy}
        onOtpRequest={handleOtpRequest}
        onOtpVerify={handleOtpVerify}
        onPasswordAuth={handlePasswordAuth}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">+</div>
          <div><strong>CarePoint</strong><span>Clinic management</span></div>
        </div>
        <div className="sidebar-caption">MENU CHÍNH</div>
        <nav className="side-nav" aria-label="Điều hướng chính">
          {navItems.map(([key, label]) => (
            <button
              className={section === key ? 'nav-item active' : 'nav-item'}
              key={key}
              onClick={() => setSection(key)}
            >
              <span className="nav-dot" />{label}
            </button>
          ))}
        </nav>
        <div className="sidebar-help">
          <span className="help-icon">?</span>
          <strong>Cần hỗ trợ?</strong>
          <span>Liên hệ bộ phận quản trị phòng khám.</span>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div>
            <div className="eyebrow">HỆ THỐNG QUẢN LÝ PHÒNG KHÁM</div>
            <h1>{sectionTitles[section] || 'Phòng khám'}</h1>
          </div>
          <div className="account">
            <div className="avatar">{user.name?.slice(0, 1)?.toUpperCase() || 'U'}</div>
            <div className="account-copy"><strong>{user.name}</strong><span>{roleNames[user.role]}</span></div>
            <button className="button button-quiet" onClick={handleLogout}>Đăng xuất</button>
          </div>
        </header>

        <main className="content">
          {loading && <div className="loading-bar" aria-label="Đang tải dữ liệu" />}
          {section === 'overview' && (
            <Overview
              user={user}
              appointments={data.appointments || []}
              users={data.users || []}
              report={data.report}
              open={setSection}
            />
          )}
          {section === 'booking' && ['PATIENT', 'RECEPTIONIST'].includes(user.role) && (
            <BookingPanel
              doctors={data.doctors || []}
              services={data.services || []}
              patients={data.patients || []}
              role={user.role}
              patientId={patientId}
              setPatientId={setPatientId}
              serviceId={serviceId}
              setServiceId={setServiceId}
              specialties={data.specialties || []}
              doctorId={doctorId}
              setDoctorId={setDoctorId}
              specialtyId={specialtyId}
              setSpecialtyId={setSpecialtyId}
              date={bookingDate}
              setDate={setBookingDate}
              availability={availability}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              onSubmit={bookAppointment}
              saving={saving}
            />
          )}
          {['appointments', 'calendar', 'checkin', 'queue', 'clinical'].includes(section) && (
            <AppointmentsPanel
              appointments={data.appointments || []}
              section={section}
              role={user.role}
              onAction={performAction}
            />
          )}
          {section === 'profile' && <ProfilePanel profile={data.profile || user} onAction={performAction} />}
          {section === 'consents' && <ConsentPanel items={data.consents || []} onAction={performAction} />}
          {section === 'notifications' && <NotificationPanel items={data.notifications || []} onAction={performAction} />}
          {section === 'services' && (
            <ServicesPanel items={data.services || []} specialties={data.specialties || []} onAction={performAction} />
          )}
          {section === 'schedules' && (
            <SchedulePanel
              doctors={data.doctors || []}
              users={data.users || []}
              onAction={performAction}
            />
          )}
          {section === 'block-time' && <BlockTimePanel schedules={data.schedules || []} onAction={performAction} />}
          {(section === 'staff' || section === 'users') && (
            <UsersPanel
              users={data.users || []}
              doctors={data.doctors || []}
              specialties={data.specialties || []}
              admin={user.role === 'ADMIN'}
              section={section}
              onAction={performAction}
            />
          )}
          {section === 'reports' && <ReportsPanel report={data.report} />}
          {section === 'audit' && <AuditPanel items={data.audit || []} />}
          {section === 'payments' && <PaymentsPanel items={data.payments || []} role={user.role} onAction={performAction} />}
        </main>
      </div>
    </div>
  );
}

function AuthScreen({ mode, setMode, form, setForm, otpRequested, notice, busy, onOtpRequest, onOtpVerify, onPasswordAuth }) {
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand auth-brand">
          <div className="brand-mark">+</div>
          <div><strong>CarePoint</strong><span>Clinic management</span></div>
        </div>
        <div className="auth-kicker">CHĂM SÓC SỨC KHỎE TOÀN DIỆN</div>
        <h1>Chào mừng bạn</h1>
        <p className="muted">Đăng nhập để quản lý lịch khám và hồ sơ sức khỏe.</p>
        <div className="auth-tabs">
          <button className={mode === 'otp' ? 'selected' : ''} onClick={() => setMode('otp')}>Bệnh nhân · OTP</button>
          <button className={mode === 'staff' ? 'selected' : ''} onClick={() => setMode('staff')}>Nhân viên</button>
          <button className={mode === 'register' ? 'selected' : ''} onClick={() => setMode('register')}>Đăng ký</button>
        </div>

        {mode === 'otp' ? (
          otpRequested ? (
            <form className="form-stack" onSubmit={onOtpVerify}>
              <label>Mã xác thực<input inputMode="numeric" autoComplete="one-time-code" value={form.code} onChange={set('code')} required maxLength={6} /></label>
              {notice && <p className="notice">{notice}</p>}
              <button className="button button-primary" disabled={busy}>{busy ? 'Đang xác thực…' : 'Xác nhận mã'}</button>
              <button type="button" className="text-button" onClick={() => setMode('otp')}>Quay lại</button>
            </form>
          ) : (
            <form className="form-stack" onSubmit={onOtpRequest}>
              <label>Số điện thoại<input type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} required placeholder="090..." /></label>
              <p className="fine-print">Mã xác thực có hiệu lực trong thời gian ngắn. Tích hợp SMS cần cấu hình nhà cung cấp.</p>
              <button className="button button-primary" disabled={busy}>{busy ? 'Đang gửi…' : 'Gửi mã xác thực'}</button>
            </form>
          )
        ) : (
          <form className="form-stack" onSubmit={onPasswordAuth}>
            {mode === 'register' && <label>Họ và tên<input value={form.name} onChange={set('name')} required /></label>}
            <label>Số điện thoại<input type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} required placeholder="090..." /></label>
            <label>Mật khẩu<input type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={form.password} onChange={set('password')} required minLength={mode === 'register' ? 10 : 1} /></label>
            {mode === 'register' && <p className="fine-print">Mật khẩu cần ít nhất 10 ký tự.</p>}
            <button className="button button-primary" disabled={busy}>{busy ? 'Đang xử lý…' : mode === 'register' ? 'Tạo tài khoản bệnh nhân' : 'Đăng nhập'}</button>
          </form>
        )}
        <p className="auth-footer">Dữ liệu sức khỏe chỉ được hiển thị cho người dùng có quyền phù hợp.</p>
      </section>
      <div className="auth-decoration"><div className="pulse-ring" /><div className="cross-large">+</div></div>
    </main>
  );
}

function Overview({ user, appointments, users, report, open }) {
  const role = user.role;
  const patientAppointments = appointments.filter((item) => item.status !== 'CANCELLED');
  const counts = report?.appointmentsByStatus || [];
  return (
    <div className="page-stack">
      <section className="welcome-panel">
        <div><span className="eyebrow light">XIN CHÀO, {roleNames[role]?.toUpperCase()}</span><h2>{user.name}</h2><p>Đây là bảng điều khiển hoạt động của phòng khám hôm nay.</p></div>
        {role === 'PATIENT' && <button className="button button-white" onClick={() => open('booking')}>Đặt lịch khám mới <span>→</span></button>}
      </section>
      <div className="stats-grid">
        {role === 'PATIENT' ? (
          <>
            <Stat title="Lịch hẹn sắp tới" value={patientAppointments.length} detail="Lịch hẹn không bị hủy" tone="blue" />
            <Stat title="Vai trò tài khoản" value="Bệnh nhân" detail={user.phone} tone="green" />
            <Stat title="Thông tin cá nhân" value={user.address ? 'Đã cập nhật' : 'Cần bổ sung'} detail="Hồ sơ sức khỏe cá nhân" tone="amber" />
          </>
        ) : role === 'MANAGER' || role === 'ADMIN' ? (
          <>
            <Stat title="Tổng lịch khám" value={report?.totalAppointments ?? '—'} detail="Trong khoảng báo cáo hiện tại" tone="blue" />
            <Stat title="Bệnh nhân" value={report?.activePatients ?? '—'} detail="Tài khoản đang hoạt động" tone="green" />
            <Stat title="Bác sĩ" value={report?.activeDoctors ?? '—'} detail="Hồ sơ bác sĩ hoạt động" tone="amber" />
          </>
        ) : (
          <>
            <Stat title="Lịch hẹn" value={appointments.length} detail="Danh sách theo quyền truy cập" tone="blue" />
            <Stat title="Lượt cần tiếp nhận" value={appointments.filter((item) => item.status === 'CONFIRMED').length} detail="Chờ check-in" tone="amber" />
            <Stat title="Tài khoản" value={roleNames[role]} detail={user.name} tone="green" />
          </>
        )}
      </div>
      {(role === 'MANAGER' || role === 'ADMIN') && <div className="card"><h3>Trạng thái lượt khám</h3><div className="status-summary">{counts.map((item) => <span key={item._id}><b>{item.count}</b>{item._id}</span>)}</div></div>}
      <div className="card">
        <div className="card-heading"><div><h3>{role === 'PATIENT' ? 'Lịch hẹn gần đây' : 'Hoạt động cần chú ý'}</h3><p className="muted">Dữ liệu được cập nhật trực tiếp từ máy chủ.</p></div><button className="text-button" onClick={() => open(role === 'PATIENT' ? 'appointments' : 'calendar')}>Xem danh sách →</button></div>
        {role === 'PATIENT' ? <AppointmentsList items={appointments.slice(0, 4)} role={role} onAction={() => {}} /> : (
          <div className="quick-links">
            <button onClick={() => open(role === 'DOCTOR' ? 'clinical' : 'checkin')}>Mở danh sách lịch khám <span>→</span></button>
            {(role === 'MANAGER' || role === 'ADMIN') && <button onClick={() => open(role === 'ADMIN' ? 'users' : 'staff')}>Quản lý người dùng <span>→</span></button>}
          </div>
        )}
      </div>
      {(role === 'MANAGER' || role === 'ADMIN') && <div className="muted small-note">Đang quản lý {users.length} tài khoản người dùng.</div>}
    </div>
  );
}

function Stat({ title, value, detail, tone }) {
  return <article className={`stat-card ${tone}`}><div className="stat-icon">{tone === 'blue' ? '▤' : tone === 'green' ? '✓' : '◷'}</div><span>{title}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function BookingPanel({ doctors, services, patients, role, patientId, setPatientId, serviceId, setServiceId, specialties, doctorId, setDoctorId, specialtyId, setSpecialtyId, date, setDate, availability, selectedSlot, setSelectedSlot, onSubmit, saving }) {
  const visibleDoctors = specialtyId ? doctors.filter((doctor) => idOf(doctor.specialty) === specialtyId) : doctors;
  return (
    <form className="page-stack" onSubmit={onSubmit}>
      <div className="section-intro"><h2>Chọn bác sĩ và khung giờ</h2><p>Khung giờ sẽ được giữ chỗ an toàn khi bạn xác nhận đặt lịch.</p></div>
      <div className="card form-grid">
        {role === 'RECEPTIONIST' && <label>Bệnh nhân<select value={patientId} onChange={(event) => setPatientId(event.target.value)} required><option value="">Chọn bệnh nhân</option>{patients.map((patient) => <option value={patient._id} key={patient._id}>{patient.name} · {patient.phone}</option>)}</select></label>}
        <label>Chuyên khoa<select value={specialtyId} onChange={(event) => { setSpecialtyId(event.target.value); setDoctorId(''); }}><option value="">Tất cả chuyên khoa</option>{specialties.map((item) => <option value={item._id} key={item._id}>{item.name}</option>)}</select></label>
        <label>Bác sĩ<select value={doctorId} onChange={(event) => setDoctorId(event.target.value)} required><option value="">Chọn bác sĩ</option>{visibleDoctors.map((doctor) => <option value={doctor._id} key={doctor._id}>{doctor.user?.name} · {doctor.specialty?.name}</option>)}</select></label>
        <label>Ngày khám<input type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} required /></label>
        <label>Dịch vụ<select value={serviceId} onChange={(event) => setServiceId(event.target.value)}><option value="">Không chọn dịch vụ</option>{services.map((service) => <option value={service._id} key={service._id}>{service.name} · {Number(service.price).toLocaleString('vi-VN')} ₫</option>)}</select></label>
      </div>
      <div className="card">
        <div className="card-heading"><div><h3>Khung giờ còn trống</h3><p className="muted">Múi giờ Việt Nam (UTC+7)</p></div></div>
        {availability.slots.length ? <div className="slot-grid">{availability.slots.map((slot) => {
          const value = new Date(slot.startAt).toISOString();
          const label = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(slot.startAt));
          return <button type="button" className={selectedSlot === value ? 'slot selected' : 'slot'} key={value} onClick={() => setSelectedSlot(value)}>{label}</button>;
        })}</div> : <EmptyState text={doctorId ? 'Ngày này chưa có khung giờ trống.' : 'Chọn bác sĩ để xem giờ khám.'} />}
      </div>
      <div className="card form-stack">
        <label>Lý do khám<textarea name="reason" rows="3" maxLength="1000" placeholder="Mô tả ngắn triệu chứng hoặc nhu cầu khám" /></label>
        <button className="button button-primary" disabled={saving || !selectedSlot}>{saving ? 'Đang đặt lịch…' : 'Xác nhận đặt lịch'}</button>
      </div>
    </form>
  );
}

function AppointmentsPanel({ appointments, section, role, onAction }) {
  const title = section === 'checkin' ? 'Lịch hẹn chờ tiếp nhận' : section === 'queue' ? 'Hàng đợi khám' : section === 'clinical' ? 'Lượt khám của bác sĩ' : 'Lịch hẹn';
  return <div className="card"><div className="card-heading"><div><h2>{title}</h2><p className="muted">Lịch hẹn được lọc theo tài khoản và vai trò.</p></div></div><AppointmentsList items={appointments} role={role} onAction={onAction} /></div>;
}

function AppointmentsList({ items, role, onAction }) {
  if (!items.length) return <EmptyState text="Chưa có lịch hẹn." />;
  return <div className="appointment-list">{items.map((item) => {
    const patient = item.patient?.name || 'Bệnh nhân';
    const doctor = item.doctor?.user?.name || item.doctor?.name || 'Bác sĩ';
    const time = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(item.slotStart));
    return (
      <article className="appointment-row" key={item._id}>
        <div className="date-tile"><strong>{new Intl.DateTimeFormat('vi-VN', { day: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(item.slotStart))}</strong><span>{new Intl.DateTimeFormat('vi-VN', { month: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(item.slotStart))}</span></div>
        <div className="appointment-main"><strong>{role === 'PATIENT' ? doctor : patient}</strong><span>{time} · {item.service?.name || item.doctor?.specialty?.name || item.reason || 'Khám tại phòng khám'}</span></div>
        <Status status={item.status} />
        <div className="row-actions">
          {role === 'PATIENT' && item.status === 'CONFIRMED' && <button className="text-button" onClick={() => onAction(() => apiClient.post(`/appointments/${item._id}/cancel`, { reason: 'Người bệnh yêu cầu hủy' }), 'Đã hủy lịch hẹn.')}>Hủy lịch</button>}
          {role === 'PATIENT' && item.status !== 'CANCELLED' && <button className="text-button" onClick={() => onAction(() => apiClient.post('/payments', { appointmentId: item._id }), 'Đã tạo yêu cầu thanh toán.')}>Thanh toán</button>}
          {role === 'RECEPTIONIST' && item.status === 'CONFIRMED' && <button className="button button-small" onClick={() => onAction(() => apiClient.patch(`/appointments/${item._id}/status`, { status: 'CHECKED_IN' }), 'Đã check-in bệnh nhân.')}>Check-in</button>}
          {role === 'DOCTOR' && item.status === 'CHECKED_IN' && <button className="button button-small" onClick={() => onAction(() => apiClient.patch(`/appointments/${item._id}/status`, { status: 'IN_CONSULTATION' }), 'Đã bắt đầu lượt khám.')}>Bắt đầu khám</button>}
          {role === 'DOCTOR' && ['CHECKED_IN', 'IN_CONSULTATION'].includes(item.status) && <ClinicalNoteForm appointment={item} onAction={onAction} />}
        </div>
      </article>
    );
  })}</div>;
}

function ClinicalNoteForm({ appointment, onAction }) {
  return <details className="clinical-form"><summary>Ghi hồ sơ</summary><form className="form-stack compact-form" onSubmit={(event) => { event.preventDefault(); const values = new FormData(event.currentTarget); onAction(() => apiClient.patch(`/appointments/${appointment._id}/clinical-notes`, { diagnosis: values.get('diagnosis'), notes: values.get('notes'), prescription: values.get('prescription') }), 'Đã lưu hồ sơ khám.'); }}><input name="diagnosis" placeholder="Chẩn đoán" /><textarea name="notes" placeholder="Ghi chú lâm sàng" rows="2" /><textarea name="prescription" placeholder="Đơn thuốc / chỉ định" rows="2" /><button className="button button-small">Lưu và hoàn tất</button></form></details>;
}

function Status({ status }) {
  const labels = { CONFIRMED: 'Đã xác nhận', CHECKED_IN: 'Đã tiếp nhận', IN_CONSULTATION: 'Đang khám', COMPLETED: 'Hoàn tất', CANCELLED: 'Đã hủy', NO_SHOW: 'Vắng mặt', PENDING: 'Chờ thanh toán', PAID: 'Đã thanh toán', FAILED: 'Thất bại', REFUNDED: 'Đã hoàn tiền' };
  return <span className={`status status-${status?.toLowerCase()}`}>{labels[status] || status}</span>;
}

function ProfilePanel({ profile, onAction }) {
  return <div className="card narrow-card"><div className="card-heading"><div><h2>Thông tin cá nhân</h2><p className="muted">Cập nhật hồ sơ của bạn.</p></div></div><form className="form-stack" onSubmit={(event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); if (!values.dateOfBirth) delete values.dateOfBirth; if (!values.gender) delete values.gender; onAction(async () => { const result = await apiClient.patch('/profile', values); useAuthStore.getState().updateUser(result.user); }, 'Đã cập nhật hồ sơ.'); }}><label>Họ và tên<input name="name" defaultValue={profile.name || ''} required /></label><label>Email<input name="email" type="email" defaultValue={profile.email || ''} /></label><label>Ngày sinh<input name="dateOfBirth" type="date" defaultValue={profile.dateOfBirth?.slice(0, 10) || ''} /></label><label>Giới tính<select name="gender" defaultValue={profile.gender || ''}><option value="">Chưa chọn</option><option value="FEMALE">Nữ</option><option value="MALE">Nam</option><option value="OTHER">Khác</option></select></label><label>Địa chỉ<input name="address" defaultValue={profile.address || ''} /></label><button className="button button-primary">Lưu hồ sơ</button></form></div>;
}

function ConsentPanel({ items, onAction }) {
  return <div className="card"><div className="card-heading"><div><h2>Quản lý quyền riêng tư</h2><p className="muted">Ghi nhận đồng ý theo loại và phiên bản điều khoản.</p></div></div><button className="button button-primary" onClick={() => onAction(() => apiClient.post('/consents', { type: 'HEALTH_DATA_PROCESSING', version: '1.0' }), 'Đã ghi nhận sự đồng ý.')}>Đồng ý xử lý dữ liệu sức khỏe · v1.0</button><div className="simple-list">{items.map((item) => <div key={item._id}><strong>{item.type}</strong><span>Phiên bản {item.version} · {new Date(item.acceptedAt).toLocaleDateString('vi-VN')}</span></div>)}</div></div>;
}

function NotificationPanel({ items, onAction }) {
  return <div className="card"><div className="card-heading"><div><h2>Thông báo của bạn</h2><p className="muted">Tin nhắn hệ thống trong ứng dụng.</p></div></div>{items.length ? <div className="simple-list">{items.map((item) => <div key={item._id} className={item.readAt ? '' : 'unread'}><strong>{item.title}</strong><span>{item.message}</span><small>{new Date(item.createdAt).toLocaleString('vi-VN')}</small>{!item.readAt && <button className="text-button" onClick={() => onAction(() => apiClient.patch(`/notifications/${item._id}/read`), 'Đã đánh dấu đã đọc.')}>Đánh dấu đã đọc</button>}</div>)}</div> : <EmptyState text="Bạn chưa có thông báo." />}</div>;
}

function ServicesPanel({ items, specialties, onAction }) {
  return <div className="page-stack"><div className="card"><div className="card-heading"><div><h2>Dịch vụ khám</h2><p className="muted">Tạo hoặc cập nhật danh mục dịch vụ.</p></div></div><div className="simple-list">{items.map((item) => <div key={item._id}><strong>{item.name}</strong><span>{item.description} · {Number(item.price).toLocaleString('vi-VN')} ₫ · {item.durationMinutes} phút</span></div>)}</div><form className="inline-form" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); onAction(async () => { await apiClient.post('/services', Object.fromEntries(values)); form.reset(); }, 'Đã thêm dịch vụ.'); }}><input name="name" placeholder="Tên dịch vụ" required /><input name="price" type="number" min="0" placeholder="Giá (VND)" required /><input name="durationMinutes" type="number" min="5" placeholder="Phút" required /><input name="description" placeholder="Mô tả" /><button className="button button-primary">Thêm dịch vụ</button></form></div><div className="card"><h3>Chuyên khoa</h3><div className="tag-list">{specialties.map((item) => <span key={item._id}>{item.name}</span>)}</div><form className="inline-form" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); onAction(async () => { await apiClient.post('/specialties', Object.fromEntries(values)); form.reset(); }, 'Đã thêm chuyên khoa.'); }}><input name="name" placeholder="Tên chuyên khoa mới" required /><input name="description" placeholder="Mô tả" /><button className="button button-secondary">Thêm chuyên khoa</button></form></div></div>;
}

function SchedulePanel({ doctors, users, onAction }) {
  const doctorProfiles = doctors;
  return <div className="card narrow-card"><div className="card-heading"><div><h2>Tạo lịch khám</h2><p className="muted">Tạo các khung giờ theo múi giờ Việt Nam.</p></div></div><form className="form-stack" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form)); onAction(async () => { await apiClient.post('/schedules', { ...values, intervalMinutes: Number(values.intervalMinutes) }); form.reset(); }, 'Đã tạo lịch khám.'); }}><label>Bác sĩ<select name="doctorId" required defaultValue=""><option value="" disabled>Chọn bác sĩ</option>{doctorProfiles.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.user?.name || 'Bác sĩ'}</option>)}</select></label><label>Ngày<input name="date" type="date" min={today} required /></label><div className="form-grid"><label>Bắt đầu<input name="startTime" type="time" required /></label><label>Kết thúc<input name="endTime" type="time" required /></label></div><label>Khoảng cách slot (phút)<input name="intervalMinutes" type="number" min="5" max="240" defaultValue="30" required /></label><label>Ghi chú<input name="note" /></label><button className="button button-primary">Tạo lịch</button></form>{!doctorProfiles.length && <p className="notice">Cần tạo tài khoản và hồ sơ bác sĩ trước. {users.length} tài khoản bác sĩ hiện có.</p>}</div>;
}

function BlockTimePanel({ schedules, onAction }) {
  const slots = schedules.flatMap((schedule) => schedule.slots
    .filter((slot) => slot.status === 'AVAILABLE' && new Date(slot.startAt) > new Date())
    .map((slot) => ({ schedule, slot })));
  return <div className="card"><div className="card-heading"><div><h2>Khóa khung giờ khám</h2><p className="muted">Chỉ khóa được slot đang trống; slot đã đặt không thể bị ghi đè.</p></div></div>{slots.length ? <div className="simple-list">{slots.map(({ schedule, slot }) => <div className="block-time-row" key={`${schedule._id}-${slot.startAt}`}><strong>{new Date(slot.startAt).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' })}</strong><button className="button button-small" onClick={() => onAction(() => apiClient.post(`/schedules/${schedule._id}/block-slot`, { startAt: slot.startAt }), 'Đã khóa khung giờ.')}>Khóa slot</button></div>)}</div> : <EmptyState text="Không có lịch hoặc khung giờ trống trong ngày." />}</div>;
}

function PaymentsPanel({ items, role, onAction }) {
  return <div className="card"><div className="card-heading"><div><h2>Thanh toán</h2><p className="muted">Các khoản online hiển thị Pending cho đến khi cổng thanh toán được tích hợp hoặc nhân viên xác nhận giao dịch.</p></div></div>{items.length ? <div className="simple-list">{items.map((payment) => <div className="payment-row" key={payment._id}><div><strong>{Number(payment.amount).toLocaleString('vi-VN')} {payment.currency}</strong><span>{payment.appointment?.slotStart ? new Date(payment.appointment.slotStart).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Lịch khám'} · {payment.provider}</span></div><Status status={payment.status} />{payment.status === 'PENDING' && ['RECEPTIONIST', 'MANAGER', 'ADMIN'].includes(role) && <button className="button button-small" onClick={() => onAction(() => apiClient.patch(`/payments/${payment._id}/record`, {}), 'Đã ghi nhận thanh toán.')}>Xác nhận đã thu</button>}{payment.status === 'PAID' && ['MANAGER', 'ADMIN'].includes(role) && <button className="text-button" onClick={() => onAction(() => apiClient.patch(`/payments/${payment._id}/refund`, {}), 'Đã ghi nhận hoàn tiền.')}>Hoàn tiền</button>}</div>)}</div> : <EmptyState text="Chưa có thanh toán." />}</div>;
}

function UsersPanel({ users, doctors, specialties, admin, section, onAction }) {
  return <div className="page-stack"><div className="card"><div className="card-heading"><div><h2>{section === 'staff' ? 'Tài khoản nhân sự' : 'Tài khoản và phân quyền'}</h2><p className="muted">Quyền được kiểm tra lại tại API trong mọi thao tác.</p></div></div><div className="table-wrap"><table><thead><tr><th>Người dùng</th><th>Số điện thoại</th><th>Vai trò</th><th>Trạng thái</th>{admin && <th>Thao tác</th>}</tr></thead><tbody>{users.map((item) => <tr key={item._id}><td>{item.name}</td><td>{item.phone}</td><td>{roleNames[item.role] || item.role}</td><td><span className={item.active ? 'active-label' : 'inactive-label'}>{item.active ? 'Hoạt động' : 'Đã khóa'}</span></td>{admin && <td><select aria-label={`Vai trò của ${item.name}`} value={item.role} onChange={(event) => onAction(() => apiClient.patch(`/users/${item._id}`, { role: event.target.value }), 'Đã cập nhật vai trò.')}><option value="PATIENT">Bệnh nhân</option><option value="RECEPTIONIST">Lễ tân</option><option value="DOCTOR">Bác sĩ</option><option value="MANAGER">Quản lý</option><option value="ADMIN">Admin</option></select></td>}</tr>)}</tbody></table></div></div>
    {section === 'staff' && <div className="card"><h3>Tạo tài khoản nhân viên</h3><form className="inline-form" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); onAction(async () => { await apiClient.post('/users', Object.fromEntries(values)); form.reset(); }, 'Đã tạo tài khoản.'); }}><input name="name" placeholder="Họ tên" required /><input name="phone" placeholder="Số điện thoại" required /><input name="password" type="password" minLength="10" placeholder="Mật khẩu (tối thiểu 10 ký tự)" required /><select name="role"><option value="RECEPTIONIST">Lễ tân</option><option value="DOCTOR">Bác sĩ</option><option value="MANAGER">Quản lý</option></select><button className="button button-primary">Tạo tài khoản</button></form><p className="fine-print">Tài khoản bác sĩ cần thêm hồ sơ chuyên khoa và phí khám trước khi tạo lịch.</p></div>}
    {section === 'staff' && users.some((item) => item.role === 'DOCTOR') && <DoctorProfileForm users={users} specialties={specialties} onAction={onAction} />}
    {section === 'staff' && doctors.length > 0 && <p className="notice">Đã cấu hình {doctors.length} hồ sơ bác sĩ.</p>}
  </div>;
}

function DoctorProfileForm({ users, specialties, onAction }) {
  const accounts = users.filter((item) => item.role === 'DOCTOR');
  return <div className="card"><h3>Hồ sơ bác sĩ</h3><form className="inline-form" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); onAction(async () => { await apiClient.post('/doctors', Object.fromEntries(values)); form.reset(); }, 'Đã tạo hồ sơ bác sĩ.'); }}><select name="userId" required defaultValue=""><option value="" disabled>Chọn tài khoản</option>{accounts.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select><select name="specialtyId" required defaultValue=""><option value="" disabled>Chuyên khoa</option>{specialties.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select><input name="yearsOfExperience" type="number" min="0" placeholder="Số năm kinh nghiệm" /><input name="consultationFee" type="number" min="0" placeholder="Phí khám (VND)" /><input name="biography" placeholder="Giới thiệu" /><button className="button button-primary">Tạo hồ sơ</button></form></div>;
}

function ReportsPanel({ report }) {
  if (!report) return <div className="card"><EmptyState text="Không thể tải dữ liệu báo cáo." /></div>;
  return <div className="page-stack"><div className="stats-grid"><Stat title="Tổng lịch khám" value={report.totalAppointments} detail="Khoảng thời gian hiện tại" tone="blue" /><Stat title="Bệnh nhân hoạt động" value={report.activePatients} detail="Tài khoản đang hoạt động" tone="green" /><Stat title="Bác sĩ hoạt động" value={report.activeDoctors} detail="Hồ sơ đã được cấu hình" tone="amber" /></div><div className="card"><h3>Phân bố trạng thái</h3><div className="status-summary">{report.appointmentsByStatus.map((item) => <span key={item._id}><b>{item.count}</b>{item._id}</span>)}</div></div></div>;
}

function AuditPanel({ items }) {
  return <div className="card"><div className="card-heading"><div><h2>Nhật ký hoạt động</h2><p className="muted">Chỉ quản trị viên mới xem được audit log.</p></div></div><div className="simple-list">{items.map((item) => <div key={item._id}><strong>{item.action} · {item.resource}</strong><span>{item.actor?.name || 'Tài khoản'} · {new Date(item.createdAt).toLocaleString('vi-VN')}</span></div>)}</div>{!items.length && <EmptyState text="Chưa có bản ghi." />}</div>;
}

function EmptyState({ text }) {
  return <div className="empty-state"><span>◌</span><p>{text}</p></div>;
}

function idOf(value) {
  return typeof value === 'string' ? value : value?._id;
}
