import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { Button, Input, Card, CardContent } from '../../components/common';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên của bạn';
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!phoneRegex.test(formData.phone.trim().replace(/\s+/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (gồm 10 số, ví dụ: 0901234567)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Định dạng email không hợp lệ (ví dụ: ten@example.com)';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có độ dài tối thiểu 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const res = await authService.register(formData);
      setSuccessInfo(res);
      toast.success('Đăng ký tài khoản Bệnh nhân thành công!');
    } catch (err) {
      setErrors({ form: err.message || 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.' });
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
          Đăng ký tài khoản Bệnh nhân
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Tạo tài khoản để chủ động đặt lịch khám và quản lý hồ sơ y tế gia đình
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <Card className="shadow-modal border-slate-200">
          <CardContent className="p-6 sm:p-8">
            {successInfo ? (
              <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Đăng ký thành công!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Tài khoản của bạn đã được khởi tạo trong môi trường mô phỏng với vai trò{' '}
                  <span className="font-semibold text-primary-700">Bệnh nhân</span>. Mã bệnh nhân dự kiến:{' '}
                  <span className="font-mono font-bold text-slate-800">{successInfo.user.patientCode}</span>.
                </p>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-500 text-left space-y-1">
                  <div>• Họ tên: <span className="font-medium text-slate-800">{successInfo.user.name}</span></div>
                  <div>• Email: <span className="font-medium text-slate-800">{successInfo.user.email}</span></div>
                  <div>• Số điện thoại: <span className="font-medium text-slate-800">{successInfo.user.phone}</span></div>
                  <div className="pt-1 text-[11px] text-amber-700">
                    * Lưu ý: Đây là hệ thống thử nghiệm mô phỏng frontend (Mock mode), dữ liệu chưa lưu vào cơ sở dữ liệu thật.
                  </div>
                </div>

                <div className="pt-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/login')}
                  >
                    Chuyển đến màn hình Đăng nhập
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.form && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errors.form}</span>
                  </div>
                )}

                <Input
                  label="Họ và tên"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Minh"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  error={errors.fullName}
                  leftIcon={<User className="w-4 h-4" />}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Số điện thoại"
                    required
                    placeholder="Ví dụ: 0901234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={errors.phone}
                    leftIcon={<Phone className="w-4 h-4" />}
                  />

                  <Input
                    label="Địa chỉ Email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    leftIcon={<Mail className="w-4 h-4" />}
                  />
                </div>

                {/* Password field */}
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
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Ít nhất 6 ký tự"
                      className={`
                        block w-full rounded-lg border text-sm transition-colors duration-150
                        pl-10 pr-10 py-2 text-slate-800 placeholder-slate-400 bg-white
                        ${errors.password ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-primary-500'}
                        focus:outline-none focus:ring-4 focus:ring-primary-500/20
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password}</p>}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Xác nhận mật khẩu
                    <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Nhập lại mật khẩu"
                      className={`
                        block w-full rounded-lg border text-sm transition-colors duration-150
                        pl-10 pr-10 py-2 text-slate-800 placeholder-slate-400 bg-white
                        ${errors.confirmPassword ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-primary-500'}
                        focus:outline-none focus:ring-4 focus:ring-primary-500/20
                      `}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>
                      Tôi đồng ý với{' '}
                      <span className="text-primary-600 hover:underline">Điều khoản dịch vụ</span>{' '}
                      và{' '}
                      <span className="text-primary-600 hover:underline">Chính sách quyền riêng tư</span>{' '}
                      của phòng khám MedCare Plus.
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.agreeTerms}</p>
                  )}
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
                    Hoàn tất đăng ký tài khoản
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Link back to login */}
        <p className="mt-5 text-center text-xs text-slate-600">
          Đã có tài khoản khám bệnh?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-800 transition-colors hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};
