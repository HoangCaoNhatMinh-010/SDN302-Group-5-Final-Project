import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { authService } from '../../services/authService';
import { Button, Input, Card, CardContent } from '../../components/common';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Vui lòng nhập email hoặc số điện thoại của bạn');
      return;
    }

    setIsLoading(true);
    try {
      await authService.requestPasswordReset(identifier);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Không thể gửi yêu cầu đặt lại mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-500/25 transition-transform group-hover:scale-105">
            <KeyRound className="w-6 h-6" />
          </div>
        </Link>

        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Quên mật khẩu?
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Nhập email hoặc số điện thoại để nhận hướng dẫn khôi phục mật khẩu
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-modal border-slate-200">
          <CardContent className="p-6 sm:p-8">
            {success ? (
              <div className="text-center py-4 space-y-4 animate-in fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Yêu cầu đã được tiếp nhận</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Trong môi trường thử nghiệm (Demo), hệ thống đã tạo mã khôi phục cho tài khoản liên kết với{' '}
                  <span className="font-semibold text-slate-800">{identifier}</span>.
                </p>

                <div className="pt-2 space-y-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => navigate('/reset-password')}
                  >
                    Tiến hành Đặt lại mật khẩu mới
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full"
                    onClick={() => navigate('/login')}
                  >
                    Quay về trang Đăng nhập
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <Input
                  label="Email hoặc Số điện thoại"
                  type="text"
                  placeholder="Ví dụ: minh.nguyen@example.com hoặc 0901234567"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  leftIcon={<Mail className="w-4 h-4" />}
                  helperText="Hệ thống sẽ xác minh tài khoản và gửi liên kết đặt lại mật khẩu."
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Gửi yêu cầu khôi phục
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-primary-600 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại trang Đăng nhập</span>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
