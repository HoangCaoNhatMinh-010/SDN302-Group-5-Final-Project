import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_LABELS } from '../../utils/constants';
import { Button } from '../../components/common';

export const ForbiddenPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const getDashboardPath = () => {
    switch (role) {
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
        return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-modal p-8 text-center animate-in zoom-in-95 duration-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 mb-5">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 mb-2">
          Mã lỗi: 403
        </span>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">403</h1>
        
        <p className="mt-2 text-base font-semibold text-slate-800">
          Bạn không có quyền truy cập trang này.
        </p>
        
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          Tài khoản của bạn hiện có vai trò{' '}
          <span className="font-semibold text-slate-700">{ROLE_LABELS[role] || role}</span> và không được cấp quyền xem nội dung này. Vui lòng quay lại Tổng quan hoặc chuyển sang vai trò phù hợp.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="primary"
            leftIcon={<Home className="w-4 h-4" />}
            onClick={() => navigate(getDashboardPath())}
          >
            Quay lại Dashboard
          </Button>
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(-1)}
          >
            Quay lại trang trước
          </Button>
        </div>
      </div>
    </div>
  );
};
