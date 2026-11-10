import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Smartphone } from 'lucide-react';
import { Card, CardContent } from '../../components/common';

export const OtpLoginPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/40 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white">
        <Smartphone className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Đăng nhập bằng OTP</h1>
    </div>
    <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
      <Card>
        <CardContent className="space-y-4 p-6 text-center">
          <p role="status" className="text-sm text-slate-600">
            Đăng nhập OTP tạm thời chưa khả dụng vì cửa hàng chưa cấu hình nhà cung cấp SMS. Hãy dùng mật khẩu tài khoản.
          </p>
          <Link to="/login" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </CardContent>
      </Card>
    </div>
  </div>
);
