import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Scissors,
  Heart,
  Check,
  CalendarPlus,
  Clock,
  MapPin,
  Tag,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { groomerService } from '../../services/groomerService';
import {
  Breadcrumb,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  LoadingState,
} from '../../components/common';

export const PetServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const res = await groomerService.getAllServices();
        setServices(res.data || []);
      } catch (err) {
        console.error('Lỗi tải danh mục dịch vụ:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <Breadcrumb
        items={[
          { label: 'Trang chủ', path: '/pet-owner/dashboard' },
          { label: 'Bảng giá & Dịch vụ Spa Thú Cưng' },
        ]}
      />

      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-primary-600 p-6 sm:p-7 text-white shadow-elevated">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm mb-2">
          <span>🐾 Bảng giá Dịch vụ Niêm yết</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Dịch vụ Spa & Grooming Thú Cưng Chuyên Nghiệp</h1>
        <p className="mt-1 text-sm text-amber-50 max-w-2xl">
          Quy trình chuẩn hóa an toàn, sử dụng 100% sữa tắm và tinh chất dưỡng lông hữu cơ cao cấp, không gây cay mắt và kích ứng da cho thú cưng.
        </p>
      </div>

      {isLoading ? (
        <LoadingState text="Đang tải danh sách dịch vụ..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {services.map((service, index) => (
            <Card
              key={service.id || service._id || index}
              className="border-slate-200/80 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center text-2xl flex-shrink-0 shadow-xs">
                      {index === 0 ? '🛁' : index === 1 ? '✂️' : index === 2 ? '🧴' : index === 3 ? '🩺' : '🏠'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{service.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{service.room || 'Khu vực chuyên biệt'}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[40px]">
                  {service.description || 'Chăm sóc toàn diện, tỉ mỉ và tận tâm bởi đội ngũ kỹ thuật viên giàu kinh nghiệm.'}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400 font-medium">Giá gói dịch vụ:</span>
                  <span className="text-xl font-extrabold text-amber-600">
                    {service.price ? service.price.toLocaleString('vi-VN') + ' đ' : '180.000 đ'}
                  </span>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Bảo hành form dáng 48h
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CalendarPlus className="w-3.5 h-3.5" />}
                  onClick={() => navigate('/pet-owner/book-appointment')}
                  className="bg-amber-600 hover:bg-amber-700 border-amber-600 text-white text-xs font-semibold"
                >
                  Đặt lịch gói này
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
