import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROLES, ROLE_LABELS } from '../../utils/constants';
import { DEMO_USERS } from '../../data/mockData';
import { Button, Input, Card, CardContent } from '../../components/common';

export const Staff2FAPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1); // 1: Staff credentials, 2: 2FA OTP code
  const [email, setEmail] = useState(DEMO_USERS[ROLES.DOCTOR].email);
  const [password, setPassword] = useState('123456');
  const [twoFactorCode, setTwoFactorCode] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [staffInfo, setStaffInfo] = useState(null);

  // Staff roles to quick pick for testing
  const staffRoleKeys = [
    ROLES.RECEPTIONIST,
    ROLES.DOCTOR,
    ROLES.ADMIN,
    ROLES.CLINIC_MANAGER,
  ];

  const handleSelectStaff = (r) => {
    const user = DEMO_USERS[r];
    setEmail(user.email);
    setPassword('123456');
    setError('');
  };

  // Step 1: Verify staff credentials
  const handleVerifyCredentials = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // First verify credentials without 2FA
      const cleanEmail = email.trim().toLowerCase();

      // Check if patient
      if (cleanEmail === DEMO_USERS[ROLES.PATIENT].email.toLowerCase()) {
        throw new Error(
          'Tài khoản Bệnh nhân không được phép sử dụng Cổng bảo mật 2FA của Nhân viên phòng khám.'
        );
      }

      const matchedStaffRole = staffRoleKeys.find(
        (r) => DEMO_USERS[r].email.toLowerCase() === cleanEmail
      );

      if (!matchedStaffRole) {
        throw new Error(
          'Không tìm thấy nhân sự với email này. Vui lòng kiểm tra lại email của Lễ tân, Bác sĩ, Quản trị viên hoặc Quản lý.'
        );
      }

      if (password.length < 6) {
        throw new Error('Mật khẩu nhân viên phải chứa ít nhất 6 ký tự.');
      }

      const user = DEMO_USERS[matchedStaffRole];
      setStaffInfo(user);
      setStep(2);
      toast.info(`Đã gửi mã xác thực 2FA demo (123456) đến thiết bị của ${user.name}`);
    } catch (err) {
      setError(err.message || 'Xác thực thông tin nhân viên không thành công.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify 2FA code and login
  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await authService.loginStaffWith2FA(email, password, twoFactorCode);
      login(res.user);
      toast.success(
        `Xác thực 2FA thành công! Chào mừng ${res.user.name} (${ROLE_LABELS[res.user.role]}).`
      );

      // Redirect to correct staff role dashboard
      const staffDashboardMap = {
        [ROLES.RECEPTIONIST]: '/receptionist/dashboard',
        [ROLES.DOCTOR]: '/doctor/dashboard',
        [ROLES.ADMIN]: '/admin/dashboard',
        [ROLES.CLINIC_MANAGER]: '/manager/dashboard',
      };
      navigate(staffDashboardMap[res.user.role] || '/');
    } catch (err) {
      setError(err.message || 'Mã xác thực 2FA không chính xác.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Security Shield Icon */}
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </Link>

        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          Cổng Xác Thực 2FA Nhân Viên
        </h2>
        <p className="mt-1 text-xs text-indigo-200">
          Khu vực bảo mật cao dành riêng cho Bác sĩ, Lễ tân & Cán bộ Quản lý
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <Card className="shadow-2xl border-slate-800 bg-slate-900/90 backdrop-blur-md text-slate-100">
          <CardContent className="p-6 sm:p-8">
            {/* Quick Demo Staff selector in Step 1 */}
            {step === 1 && (
              <div className="mb-5 pb-4 border-b border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-2">
                  Tài khoản nhân sự mẫu (Demo):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {staffRoleKeys.map((r) => {
                    const u = DEMO_USERS[r];
                    const isSelected = email === u.email;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleSelectStaff(r)}
                        className={`text-left p-2 rounded-lg border text-xs transition-colors ${
                          isSelected
                            ? 'bg-indigo-950/80 border-indigo-500 text-white ring-1 ring-indigo-500'
                            : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-semibold truncate">{ROLE_LABELS[r]}</div>
                        <div className="text-[10px] text-slate-400 truncate">{u.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {step === 1 ? (
              /* STEP 1: Staff Email & Password */
              <form onSubmit={handleVerifyCredentials} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email nội bộ nhân viên
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      required
                      placeholder="bs.minhanh@medcare.vn"
                      className="block w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mật khẩu bảo vệ
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      required
                      placeholder="••••••••"
                      className="block w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 border-indigo-500"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Tiếp tục đến bước 2FA
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại trang Đăng nhập chung</span>
                  </Link>
                </div>
              </form>
            ) : (
              /* STEP 2: Enter 2FA Code */
              <form onSubmit={handleVerify2FA} className="space-y-4 animate-in fade-in">
                {/* Staff banner */}
                <div className="rounded-lg bg-indigo-950/60 border border-indigo-700/60 p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-800 flex items-center justify-center font-bold text-white text-xs">
                    {staffInfo?.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{staffInfo?.name}</div>
                    <div className="text-[11px] text-indigo-300">
                      {ROLE_LABELS[staffInfo?.role]} • {staffInfo?.department || 'Phòng khám'}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-emerald-950/50 border border-emerald-800 p-3 text-xs text-emerald-300">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Mã xác thực 2FA mô phỏng (Demo Code):</span>
                  </div>
                  <div className="mt-1 text-sm font-mono font-bold text-emerald-100 tracking-widest">
                    123456
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mã bảo mật 2FA (6 chữ số)
                    <span className="text-rose-400 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => {
                      setTwoFactorCode(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="123456"
                    className="block w-full text-center font-mono text-xl tracking-[0.4em] rounded-lg border border-slate-700 bg-slate-800 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 border-indigo-500"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Xác thực 2FA & Đăng nhập
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={() => {
                      setStep(1);
                      setError('');
                    }}
                  >
                    Quay lại bước trước
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
