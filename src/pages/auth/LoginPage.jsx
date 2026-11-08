import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  User,
  Stethoscope,
  Headphones,
  Sliders,
  Building,
  Eye,
  EyeOff,
  Smartphone,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { ROLES, ROLE_LABELS } from '../../utils/constants';
import { DEMO_USERS } from '../../data/mockData';
import { Button, Input, Card, CardContent } from '../../components/common';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [identifier, setIdentifier] = useState(DEMO_USERS[ROLES.PATIENT].email);
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeDemoRole, setActiveDemoRole] = useState(ROLES.PATIENT);

  const roleIcons = {
    [ROLES.PATIENT]: <User className="w-4 h-4 text-sky-600" />,
    [ROLES.RECEPTIONIST]: <Headphones className="w-4 h-4 text-teal-600" />,
    [ROLES.DOCTOR]: <Stethoscope className="w-4 h-4 text-blue-600" />,
    [ROLES.ADMIN]: <Sliders className="w-4 h-4 text-purple-600" />,
    [ROLES.CLINIC_MANAGER]: <Building className="w-4 h-4 text-amber-600" />,
  };

  const getDashboardPath = (targetRole) => {
    switch (targetRole) {
      case ROLES.PATIENT:
        return '/patient/dashboard';
      case ROLES.RECEPTIONIST:
        return '/receptionist/dashboard';
      case ROLES.DOCTOR:
        return '/doctor/dashboard';
      case ROLES.ADMIN:
        return '/admin/dashboard';
      case ROLES.CLINIC_MANAGER:
        return '/manager/dashboard';
      default:
        return '/patient/dashboard';
    }
  };

  // Quick switch filling form with demo credentials
  const handleSelectDemoAccount = (r) => {
    setActiveDemoRole(r);
    setIdentifier(DEMO_USERS[r].email);
    setPassword('123456');
    setErrorMessage('');
  };

  // Direct 1-click Demo Login
  const handleDirectDemoLogin = (r) => {
    if (r === ROLES.ADMIN) {
      setErrorMessage('Đăng nhập admin cần tài khoản có thật trong cơ sở dữ liệu. Hãy dùng ADMIN_EMAIL và ADMIN_PASSWORD đã cấu hình cho máy chủ.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      login(r);
      setIsLoading(false);
      toast.success(`Đăng nhập thành công với vai trò: ${ROLE_LABELS[r]}`);
      const destination = getDashboardPath(r);
      navigate(destination, { replace: true });
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await authService.login(identifier, password);
      login(result.user);
      toast.success(`Chào mừng ${result.user.name} (${ROLE_LABELS[result.user.role]})!`);

      const destination = location.state?.from?.pathname || getDashboardPath(result.user.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Clinic Logo */}
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-500/25 transition-transform group-hover:scale-105">
            <svg
              className="w-7 h-7 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
            </svg>
          </div>
        </Link>

        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          MedCare <span className="text-primary-600">Plus</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Hệ thống đặt lịch khám & quản lý vận hành phòng khám
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <Card className="shadow-modal border-slate-200">
          <CardContent className="p-6 sm:p-8">
            {/* 1. Clearly Labeled Demo Accounts Panel */}
            <div className="mb-6 pb-5 border-b border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Bảng tài khoản mẫu (Demo Login)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Chọn để điền thông tin</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.values(ROLES).map((r, index) => {
                  const isSelected = activeDemoRole === r;
                  const user = DEMO_USERS[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleSelectDemoAccount(r)}
                      onDoubleClick={() => handleDirectDemoLogin(r)}
                      className={`
                        flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all text-xs
                        ${
                          isSelected
                            ? 'bg-primary-50/90 border-primary-500 ring-2 ring-primary-500/20 text-primary-900 font-semibold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }
                      `}
                    >
                      <div className="p-1 rounded-md bg-white border border-slate-200 shadow-xs flex-shrink-0">
                        {roleIcons[r]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold flex items-center gap-1">
                          <span>{index + 1}. {ROLE_LABELS[r]}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{user.name}</div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
              {activeDemoRole === ROLES.ADMIN && (
                <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  Tài khoản admin cần được tạo trong MongoDB bằng cấu hình ADMIN_EMAIL/ADMIN_PASSWORD; tài khoản demo không có quyền gọi API quản trị.
                </p>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  label="Email hoặc Số điện thoại"
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  required
                  leftIcon={<Mail className="w-4 h-4" />}
                  placeholder="minh.nguyen@example.com hoặc 0901234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mật khẩu
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    required
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-800 transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Đăng nhập vào hệ thống
                </Button>
              </div>
            </form>

            {/* Other Authentication Methods */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs">
              <Link
                to="/otp-login"
                className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-primary-600 transition-colors"
              >
                <Smartphone className="w-4 h-4 text-teal-600" />
                <span>Đăng nhập nhanh qua OTP SMS</span>
              </Link>

              <Link
                to="/staff-2fa"
                className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-primary-600 transition-colors"
              >
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span>Cổng xác thực 2FA cho Nhân viên</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Register Prompt */}
        <p className="mt-5 text-center text-xs text-slate-600">
          Chưa có tài khoản Bệnh nhân?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary-600 hover:text-primary-800 transition-colors hover:underline"
          >
            Đăng ký tài khoản mới ngay
          </Link>
        </p>

        {/* Footer info */}
        <p className="mt-4 text-center text-[11px] text-slate-400">
          MedCare Plus Clinic System &copy; 2026. Môi trường kiểm thử Frontend (Mock Services).
        </p>
      </div>
    </div>
  );
};
