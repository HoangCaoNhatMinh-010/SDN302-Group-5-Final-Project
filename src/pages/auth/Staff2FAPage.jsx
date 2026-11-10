import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '../../components/common';

export const Staff2FAPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
    <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-white">Xác thực nhân viên</h1>
    </div>
    <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
      <Card className="border-slate-800 bg-slate-900/90 text-slate-100">
        <CardContent className="space-y-4 p-6 text-center">
          <p role="status" className="text-sm text-slate-300">
            Đăng nhập 2FA chưa được cấu hình. Tài khoản nhân viên cần được tạo trong collection users; không dùng mã xác thực mẫu.
          </p>
          <Link to="/login" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500">
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </CardContent>
      </Card>
    </div>
  </div>
);
