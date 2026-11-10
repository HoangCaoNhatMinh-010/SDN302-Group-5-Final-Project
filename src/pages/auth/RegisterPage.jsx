import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  PawPrint,
  ShieldCheck,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, Input, Card, CardContent } from '../../components/common';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1); // 1: Fill registration form -> 2: Verify 6-digit Gmail OTP
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [otpCode, setOtpCode] = useState('');
  const [otpMeta, setOtpMeta] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (error) setError('');
  };

  // Bước 1: Kiểm tra thông tin & gửi mã OTP về Gmail
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.sendRegisterOtp(formData);
      if (response.success) {
        setOtpMeta(response);
        setStep(2);
        setCountdown(60);
        setOtpCode(response.fallbackOtp || '');
        toast.success(
          response.emailSent
            ? `Đã gửi mã xác thực 6 số tới ${response.targetEmail}`
            : 'Đã tạo mã xác thực tài khoản!'
        );
      }
    } catch (err) {
      setError(err.message || 'Không thể gửi mã xác thực Gmail. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi lại mã OTP mới
  const handleResendOtp = async () => {
    if (countdown > 0 || isLoading) return;
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.sendRegisterOtp(formData);
      if (response.success) {
        setOtpMeta(response);
        setCountdown(60);
        if (response.fallbackOtp) setOtpCode(response.fallbackOtp);
        toast.success(`Đã gửi lại mã OTP mới tới ${response.targetEmail}`);
      }
    } catch (err) {
      setError(err.message || 'Không thể gửi lại mã OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 2: Xác nhận mã OTP & Tạo tài khoản
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP đã được gửi đến Gmail của bạn.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register({
        ...formData,
        otpCode: cleanOtp,
      });
      if (response.success) {
        login(response.user, response.token);
        toast.success('Xác thực Gmail và đăng ký tài khoản thành công!');
        navigate('/patient/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-teal-50/30 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* Header Brand Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-teal-600 text-white shadow-lg shadow-primary-500/20 transition-transform group-hover:scale-105">
            <PawPrint className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            PawCare <span className="text-primary-600">Studio</span>
          </span>
        </Link>

        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Đăng ký tài khoản thành viên
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {step === 1
            ? 'Điền thông tin cá nhân và xác thực Gmail để kích hoạt tài khoản'
            : 'Nhập mã xác thực 6 chữ số vừa được gửi đến hộp thư Gmail của bạn'}
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-modal border-slate-200/90">
          <CardContent className="p-6 sm:p-8">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {step > 1 ? '✓' : '1'}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    step === 1 ? 'text-slate-900' : 'text-emerald-700'
                  }`}
                >
                  Thông tin tài khoản
                </span>
              </div>
              <span className="text-slate-300">→</span>
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === 2
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  2
                </span>
                <span
                  className={`text-xs font-semibold ${
                    step === 2 ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  Xác thực Gmail
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {step === 1 ? (
              <>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <Input
                    label="Họ và tên"
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={handleChange('fullName')}
                    leftIcon={<User className="w-4 h-4" />}
                  />

                  <Input
                    label="Số điện thoại"
                    type="tel"
                    required
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    leftIcon={<Phone className="w-4 h-4" />}
                  />

                  <Input
                    label="Địa chỉ Email (Gmail)"
                    type="email"
                    required
                    placeholder="tenban@gmail.com"
                    value={formData.email}
                    onChange={handleChange('email')}
                    leftIcon={<Mail className="w-4 h-4" />}
                    helperText="Hệ thống sẽ gửi mã OTP 6 chữ số đến email này để xác thực."
                  />

                  {/* Password */}
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
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleChange('password')}
                        placeholder="Tối thiểu 6 ký tự"
                        className="block w-full rounded-lg border border-slate-300 pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/15 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Xác nhận mật khẩu <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={formData.confirmPassword}
                        onChange={handleChange('confirmPassword')}
                        placeholder="Nhập lại mật khẩu"
                        className="block w-full rounded-lg border border-slate-300 pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/15 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={handleChange('agreeTerms')}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed">
                        Tôi đồng ý với{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toast.info('Điều khoản dịch vụ & Chính sách bảo mật PawCare Studio');
                          }}
                          className="text-primary-600 hover:underline font-medium"
                        >
                          Điều khoản dịch vụ
                        </button>{' '}
                        và{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toast.info('Thông tin cá nhân và hồ sơ thú cưng được bảo mật tuyệt đối.');
                          }}
                          className="text-primary-600 hover:underline font-medium"
                        >
                          Chính sách quyền riêng tư
                        </button>
                        .
                      </span>
                    </label>
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
                      Tiếp tục &amp; Gửi mã xác thực Gmail
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
                      Hoặc đăng ký nhanh bằng
                    </span>
                  </div>
                </div>

                <GoogleSignInButton text="Đăng ký nhanh với Google" />
              </>
            ) : (
              /* Bước 2: Xác thực OTP Gmail */
              <form onSubmit={handleVerifyAndRegister} className="space-y-4 animate-in fade-in">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      {otpMeta?.emailSent
                        ? 'Mã OTP đã được gửi đến Gmail của bạn!'
                        : 'Đã tạo mã OTP xác thực'}
                    </span>
                  </div>
                  <p className="text-[12px] text-emerald-700 leading-relaxed">
                    Vui lòng kiểm tra hộp thư đến (hoặc mục Thư rác / Spam) của địa chỉ{' '}
                    <strong className="text-emerald-950">{otpMeta?.targetEmail || formData.email}</strong>.
                    Mã có hiệu lực trong <strong>{otpMeta?.expiresMinutes || 10} phút</strong>.
                  </p>
                  {otpMeta?.fallbackOtp && (
                    <p className="pt-1 font-mono font-bold text-amber-800">
                      Mã OTP: {otpMeta.fallbackOtp}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nhập mã OTP xác thực Gmail (6 chữ số){' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      autoFocus
                      value={otpCode}
                      onChange={(e) => {
                        setOtpCode(e.target.value.replace(/\D/g, ''));
                        if (error) setError('');
                      }}
                      placeholder="••••••"
                      className="block w-full text-center font-mono text-2xl tracking-[0.45em] rounded-xl border border-slate-300 py-3 bg-white text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/15 font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Chưa nhận được email?</span>
                  {countdown > 0 ? (
                    <span className="font-medium text-slate-400">
                      Gửi lại sau {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="font-semibold text-primary-600 hover:text-primary-800 hover:underline flex items-center gap-1"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Gửi lại mã OTP
                    </button>
                  )}
                </div>

                <div className="pt-2 space-y-2.5">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isLoading}
                    leftIcon={<ShieldCheck className="w-4 h-4" />}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Xác thực Gmail &amp; Tạo tài khoản
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-slate-600"
                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setStep(1);
                      setError('');
                    }}
                  >
                    Quay lại sửa thông tin đăng ký
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Link back to Login */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Đã có tài khoản thành viên?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};
