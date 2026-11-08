import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Smartphone,
  ShieldCheck,
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
import { DEMO_USERS } from '../../data/mockData';
import { ROLES } from '../../utils/constants';
import { Button, Input, Card, CardContent } from '../../components/common';

export const OtpLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const demoPatientPhone = DEMO_USERS[ROLES.PATIENT].phone;

  const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter OTP
  const [phone, setPhone] = useState(demoPatientPhone);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Step 1 -> Request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.requestOtp(phone);
      setStep(2);
      setCountdown(45);
      setOtp('123456'); // Pre-fill or make easy for reviewer
      toast.info('Mã xác thực OTP demo: 123456');
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
      await authService.requestOtp(phone);
      setCountdown(45);
      toast.success('Đã gửi lại mã OTP (Demo: 123456)');
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
      const res = await authService.verifyOtpAndLogin(phone, otp);
      login(res.user);
      toast.success(`Đăng nhập thành công! Chào mừng ${res.user.name}.`);
      navigate('/patient/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Mã xác thực không hợp lệ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/40 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-primary-600 text-white shadow-lg shadow-teal-500/25 transition-transform group-hover:scale-105">
            <Smartphone className="w-6 h-6" />
          </div>
        </Link>

        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Đăng nhập bằng mã OTP
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Xác thực tức thì qua tin nhắn SMS mà không cần nhớ mật khẩu
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
                    step === 1
                      ? 'bg-teal-600 text-white'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  1
                </span>
                <span className={`text-xs font-semibold ${step === 1 ? 'text-teal-900' : 'text-slate-500'}`}>
                  Nhập số điện thoại
                </span>
              </div>
              <span className="text-slate-300">→</span>
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === 2
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-400'
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
              /* STEP 1: Phone input */
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="rounded-lg bg-teal-50/70 border border-teal-200 p-3 text-xs text-teal-800 flex items-start gap-2">
                  <Info className="w-4 h-4 flex-shrink-0 text-teal-600 mt-0.5" />
                  <div>
                    Số điện thoại Bệnh nhân mẫu trong hệ thống:{' '}
                    <span className="font-bold">{demoPatientPhone}</span> (Nguyễn Văn Minh).
                  </div>
                </div>

                <Input
                  label="Số điện thoại của bạn"
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) setError('');
                  }}
                  leftIcon={<Smartphone className="w-4 h-4" />}
                  placeholder="Ví dụ: 0901 234 567"
                  helperText="Mã OTP gồm 6 chữ số sẽ được gửi tới số này."
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
                    Gửi mã xác thực OTP
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
              /* STEP 2: Enter OTP code */
              <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Mã OTP thử nghiệm (Demo Code):</span>
                  </div>
                  <div className="mt-1 text-sm font-mono font-bold text-emerald-950 tracking-widest">
                    123456
                  </div>
                  <p className="mt-0.5 text-[11px] text-emerald-700">
                    Đã gửi đến số <span className="font-semibold">{phone}</span>
                  </p>
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
                    placeholder="123456"
                    className="block w-full text-center font-mono text-xl tracking-[0.4em] rounded-lg border border-slate-300 py-2.5 bg-white text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/20 font-bold"
                  />
                </div>

                {/* Resend button & countdown */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Chưa nhận được mã?</span>
                  {countdown > 0 ? (
                    <span className="font-medium text-slate-400">
                      Gửi lại sau {countdown}s
                    </span>
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
                    Đổi số điện thoại khác
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
