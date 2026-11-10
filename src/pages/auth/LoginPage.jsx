import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { ROLES, ROLE_LABELS } from '../../utils/constants';
import { Button, Input, Card, CardContent } from '../../components/common';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const getDashboardPath = (targetRole) => {
    switch (targetRole) {
      case ROLES.PET_OWNER:
        return '/pet-owner/dashboard';
      case ROLES.RECEPTIONIST:
        return '/receptionist/dashboard';
      case ROLES.GROOMER:
        return '/groomer/dashboard';
      case ROLES.VET_DOCTOR:
        return '/vet-doctor/dashboard';
      case ROLES.ADMIN:
        return '/admin/dashboard';
      case ROLES.MANAGER:
        return '/manager/dashboard';
      default:
        return '/pet-owner/dashboard';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await authService.login(identifier, password);
      const user = login(result.user);
      toast.success(`Chào mừng ${user.name} (${ROLE_LABELS[user.role] || user.role})!`);

      const destination = location.state?.from?.pathname || getDashboardPath(user.role);
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
        {/* Pet Care Logo */}
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-rose-500 to-primary-600 text-white shadow-lg shadow-amber-500/25 transition-transform group-hover:scale-105 text-2xl">
            🐾
          </div>
        </Link>

        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          PawCare <span className="text-primary-600">Studio</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Cửa hàng Chăm sóc, Spa & Làm đẹp Thú Cưng Chuyên Nghiệp
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <Card className="shadow-modal border-slate-200">
          <CardContent className="p-6 sm:p-8">
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

            <p className="mt-5 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
              Đăng nhập OTP/SMS và 2FA sẽ khả dụng sau khi cửa hàng cấu hình nhà cung cấp xác minh.
            </p>
          </CardContent>
        </Card>

        {/* Register Prompt */}
        <p className="mt-5 text-center text-xs text-slate-600">
          Chưa có tài khoản khách hàng PawCare?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary-600 hover:text-primary-800 transition-colors hover:underline"
          >
            Đăng ký tài khoản mới ngay
          </Link>
        </p>

        {/* Footer info */}
        <p className="mt-4 text-center text-[11px] text-slate-400">
          PawCare Studio &copy; 2026. Hệ thống đặt lịch chăm sóc thú cưng.
        </p>
      </div>
    </div>
  );
};
