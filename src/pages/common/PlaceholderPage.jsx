import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { Breadcrumb, Button, Card, CardHeader, CardTitle, CardContent } from '../../components/common';

export const PlaceholderPage = ({
  title = 'Tính năng',
  description = 'Khu vực quản lý và vận hành',
  category = 'Tính năng',
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: category },
          { label: title },
        ]}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Quay lại
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => alert(`Tính năng ${title} sẽ được triển khai đầy đủ trong các bước tiếp theo!`)}
          >
            Thực hiện thao tác
          </Button>
        </div>
      </div>

      {/* Content Preview Box */}
      <Card>
        <CardHeader>
          <CardTitle>Khung làm việc: {title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-primary-600 flex items-center justify-center mb-4 border border-sky-100">
              <Construction className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Nền tảng giao diện đã sẵn sàng
            </h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Trang <span className="font-semibold text-slate-700">{title}</span> đã được cấu hình trong hệ thống routing và phân quyền (RBAC). Các thành phần UI chuyên sâu và nghiệp vụ chi tiết sẽ được tích hợp tại bước tiếp theo theo đúng kiến trúc Clean Architecture.
            </p>

            <div className="mt-6 w-full rounded-xl bg-slate-50 p-4 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Đã kết nối Role-Based Route và Sidebar Navigation</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Áp dụng Design System & Components đồng bộ</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Sẵn sàng kết nối API Service và State Machine</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
