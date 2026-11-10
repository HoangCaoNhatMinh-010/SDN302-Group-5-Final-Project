import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Smartphone,
  Mail,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, Input, Card, CardContent } from '../../components/common';

export const OtpLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1); // 1: Enter email/phone, 2: Enter OTP
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [otpInfo, setOtpInfo] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Step 1 -> Request OTP via Gmail SMTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await authService.requestOtp(identifier);
      setOtpInfo(res);
      setStep(2);
      setCountdown(60);
      if (res.fallbackOtp) {
        setOtp(res.fallbackOtp);
      } else {
        setOtp('');
      }
      toast.success(res.message || 'Đã gửi mã OTP qua Email!');
    } catch (err) {
      setError(err.message || 'Không thể gửi mã OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    setIsLoading(true);
    try {
      const res = await authService.requestOtp(identifier);
      setOtpInfo(res);
      setCountdown(60);
      toast.success('Đã gửi lại mã OTP mới vào email của bạn!');
    } catch (err) {
      setError(err.message || 'Không thể gửi lại mã OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 -> Verify OTP and login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await authService.verifyOtpAndLogin(identifier, otp);
      login(res.user, res.token);
      toast.success(`Đăng nhập thành công! Chào mừng ${res.user.name}.`);
      navigate('/patient/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Mã xác thực OTP không hợp lệ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/40 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-primary-600 text-white shadow-lg shadow-teal-500/25 transition-transform group-hover:scale-105">
            <Mail className="w-6 h-6" />
          </div>
        </Link>

        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Đăng nhập bằng mã OTP Email
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Nhận mã xác thực 6 số gửi trực tiếp về hộp thư Gmail của bạn
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-modal border-slate-200">
          <CardContent className="p-6 sm:p-8">
            {/* Step progress pills */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === 1 ? 'bg-teal-600 text-white' : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  1
                </span>
                <span className={`text-xs font-semibold ${step === 1 ? 'text-teal-900' : 'text-slate-500'}`}>
                  Nhập Email / SĐT
                </span>
              </div>
              <span className="text-slate-300">→</span>
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === 2 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  2
                </span>
                <span className={`text-xs font-semibold ${step === 2 ? 'text-teal-900' : 'text-slate-400'}`}>
                  Nhập mã OTP
                </span>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="rounded-lg bg-teal-50/70 border border-teal-200 p-3 text-xs text-teal-800 flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 text-teal-600 mt-0.5" />
                  <div>
                    Nhập <strong>Email</strong> (hoặc SĐT đã đăng ký). Hệ thống sẽ gửi mã OTP 6 chữ số thật qua SMTP Gmail (hiệu lực 10 phút).
                  </div>
                </div>

                <Input
                  label="Email hoặc Số điện thoại của bạn"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError('');
                  }}
                  leftIcon={<Mail className="w-4 h-4" />}
                  placeholder="Ví dụ: tenban@gmail.com hoặc 0901234567"
                  helperText="Mã xác thực gồm 6 chữ số sẽ được gửi qua Gmail liên kết với tài khoản của bạn."
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Gửi mã xác thực OTP qua Email
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-teal-700 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại đăng nhập bằng mật khẩu</span>
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      {otpInfo?.emailSent
                        ? 'Đã gửi mã OTP 6 số tới hộp thư Gmail!'
                        : 'Đã khởi tạo mã xác thực OTP'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-700">
                    Email nhận mã: <span className="font-semibold">{otpInfo?.targetEmail || identifier}</span> (Hiệu lực {otpInfo?.expiresMinutes || 10} phút)
                  </p>
                  {otpInfo?.fallbackOtp && (
                    <p className="mt-1 text-xs font-mono font-bold text-amber-800">
                      Mã OTP tạm: {otpInfo.fallbackOtp}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Mã xác thực OTP (6 số)
                    <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="••••••"
                    className="block w-full text-center font-mono text-xl tracking-[0.4em] rounded-lg border border-slate-300 py-2.5 bg-white text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/20 font-bold"
                  />
                </div>

                {/* Resend button & countdown */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Chưa nhận được mã?</span>
                  {countdown > 0 ? (
                    <span className="font-medium text-slate-400">Gửi lại sau {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="font-medium text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3" />
                      Gửi lại mã OTP
                    </button>
                  )}
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    type="submit"
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Xác thực & Đăng nhập
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setStep(1);
                      setError('');
                    }}
                  >
                    Đổi Email / SĐT khác
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
