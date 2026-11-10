import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Star,
  Award,
  CalendarPlus,
  Clock,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { doctorService } from '../../services/doctorService';
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

export const GroomersPage = () => {
  const navigate = useNavigate();
  const [groomers, setGroomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGroomers = async () => {
      try {
        setIsLoading(true);
        const res = await doctorService.getAllDoctors();
        setGroomers(res.data || []);
      } catch (err) {
        console.error('Lỗi tải danh sách chuyên viên:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroomers();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <Breadcrumb
        items={[
          { label: 'Trang chủ', path: '/patient/dashboard' },
          { label: 'Đội ngũ chuyên viên chăm sóc' },
        ]}
      />

      <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-primary-600 p-6 sm:p-7 text-white shadow-elevated">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm mb-2">
          <span>🐾 PawCare Team</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Đội ngũ Spa & Grooming</h1>
        <p className="mt-1 text-sm text-amber-50 max-w-2xl">
          Đội ngũ được đào tạo bài bản với các chứng chỉ Grooming quốc tế, kiên nhẫn, yêu thương động vật và luôn đặt sự an toàn, thoải mái của thú cưng lên hàng đầu.
        </p>
      </div>

      {isLoading ? (
        <LoadingState text="Đang tải danh sách chuyên viên..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {groomers.map((groomer) => (
            <Card
              key={groomer.id || groomer._id}
              className="border-slate-200/80 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={groomer.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}
                    alt={groomer.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-200 shadow-xs flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{groomer.name}</h3>
                      <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{groomer.rating || 5.0}</span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-amber-800 mt-0.5">
                      {groomer.title || 'Chuyên viên Grooming'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Chuyên môn: <span className="text-slate-700 font-medium">{groomer.specialty}</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[40px]">
                  {groomer.bio || 'Chuyên gia chăm sóc tạo kiểu thời trang và am hiểu tâm lý thú cưng.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Kinh nghiệm: <strong className="text-slate-800">{groomer.experienceYears || 5} năm</strong></span>
                  <span>{groomer.room || 'PawCare Studio'}</span>
                </div>
              </div>

              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CalendarPlus className="w-3.5 h-3.5" />}
                  onClick={() => navigate('/patient/book-appointment')}
                  className="bg-amber-600 hover:bg-amber-700 border-amber-600 text-white text-xs font-semibold"
                >
                  Đặt lịch với {groomer.name.split(' ').pop()}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
