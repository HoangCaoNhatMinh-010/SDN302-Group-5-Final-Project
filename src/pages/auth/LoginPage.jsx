import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  PawPrint,
  ArrowRight,
  KeyRound,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { ROLES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { Button, Input, Card, CardContent } from '../../components/common';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';

const ROLE_DASHBOARD_MAP = {
  [ROLES.PATIENT]: '/patient/dashboard',
  [ROLES.RECEPTIONIST]: '/receptionist/dashboard',
  [ROLES.DOCTOR]: '/doctor/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.CLINIC_MANAGER]: '/manager/dashboard',
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(identifier, password);
      if (response.success) {
        login(response.user, response.token);
        toast.success(`Chào mừng trở lại, ${response.user.name}!`);

        const targetRoute =
          location.state?.from?.pathname ||
          ROLE_DASHBOARD_MAP[response.user.role] ||
          '/patient/dashboard';
        navigate(targetRoute, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-teal-50/30 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* Header Brand Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link to="/" className="inline-flex items-center gap-3 mb-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-teal-600 text-white shadow-lg shadow-primary-500/25 transition-transform group-hover:scale-105">
            <PawPrint className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
              PawCare <span className="text-primary-600">Studio</span>
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Hệ thống Chăm sóc &amp; Spa Thú Cưng
            </p>
          </div>
        </Link>
        <h2 className="mt-2 text-lg font-bold text-slate-800">
          Đăng nhập tài khoản
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Đặt lịch Spa, theo dõi hồ sơ bé cưng và nhận tư vấn từ chuyên viên
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-[440px] px-4 sm:px-0">
        <Card className="shadow-modal border-slate-200/90">
          <CardContent className="p-6 sm:p-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email hoặc Số điện thoại"
                type="text"
                autoComplete="username"
                placeholder="Ví dụ: tenban@gmail.com hoặc 0901234567"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError('');
                }}
                required
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Nhập mật khẩu của bạn"
                    className="block w-full rounded-lg border border-slate-300 pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-xs text-slate-600">Ghi nhớ đăng nhập</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <div className="pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Đăng nhập
                </Button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400 font-medium">
                  Hoặc đăng nhập nhanh với
                </span>
              </div>
            </div>

            {/* Google Sign-In */}
            <GoogleSignInButton text="Đăng nhập bằng Google" />

            {/* Alternative Auth Links */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
              <Link
                to="/otp-login"
                className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-primary-600 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                <span>Đăng nhập qua OTP Email</span>
              </Link>

              <Link
                to="/staff-2fa"
                className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                <span>Cổng Nhân viên (2FA)</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Register Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
          >
            Đăng ký &amp; xác thực Gmail ngay
          </Link>
        </p>

        <p className="mt-3 text-center text-[11px] text-slate-400">
          PawCare Studio © 2026. Hệ thống Chăm sóc &amp; Đặt lịch Spa Thú Cưng.
        </p>
      </div>
    </div>
  );
};
