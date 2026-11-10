import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Calendar,
  CheckCircle,
  CalendarPlus,
  User,
  Sparkles,
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

export const PetAvailableSlotsPage = () => {
  const navigate = useNavigate();
  const [groomers, setGroomers] = useState([]);
  const [selectedGroomerId, setSelectedGroomerId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [slotsData, setSlotsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGroomers = async () => {
      try {
        const res = await doctorService.getAllDoctors();
        const list = res.data || [];
        setGroomers(list);
        if (list.length > 0) {
          setSelectedGroomerId(list[0].id || list[0]._id);
        }
      } catch (err) {
        console.error('Lỗi tải chuyên viên:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroomers();
  }, []);

  useEffect(() => {
    if (!selectedGroomerId) return;

    const fetchSlots = async () => {
      try {
        const dateParts = selectedDate.split('-');
        const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        const res = await doctorService.getAvailableSlots(selectedGroomerId, formattedDate);
        setSlotsData(res);
      } catch (err) {
        console.error('Lỗi tải slot:', err);
      }
    };

    fetchSlots();
  }, [selectedGroomerId, selectedDate]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <Breadcrumb
        items={[
          { label: 'Trang chủ', path: '/patient/dashboard' },
          { label: 'Tra cứu Lịch trống của Tiệm' },
        ]}
      />

      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-primary-600 p-6 sm:p-7 text-white shadow-elevated">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm mb-2">
          <span>🐾 Real-time Slot Lookup</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Tra cứu Khung giờ Trống tại Cửa hàng</h1>
        <p className="mt-1 text-sm text-amber-50 max-w-2xl">
          Kiểm tra nhanh khung giờ còn nhận thú cưng theo từng ngày và chuyên viên Groomer để chủ động sắp xếp thời gian đưa đón bé.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chọn Chuyên viên / Bác sĩ thú y:
              </label>
              <select
                value={selectedGroomerId}
                onChange={(e) => setSelectedGroomerId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                {groomers.map((g) => (
                  <option key={g.id || g._id} value={g.id || g._id}>
                    {g.name} - {g.title || g.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chọn Ngày:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {isLoading ? (
            <LoadingState text="Đang tải lịch trống..." />
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">
                  Khung giờ ngày: <span className="text-amber-700">{selectedDate}</span>
                </h4>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    Còn trống
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                    Đã kín
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {slotsData?.slots?.map((slot, index) => (
                  <div
                    key={index}
                    className={`rounded-xl p-3 border text-center transition-all ${
                      slot.isAvailable
                        ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400'
                        : 'border-slate-200 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-800 mb-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{slot.time}</span>
                    </div>
                    {slot.isAvailable ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Nhận bé
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-600">
                        Đã có lịch
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Bạn có thể chọn lịch trực tiếp để được chuyên viên chăm sóc ngay khi đến.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CalendarPlus className="w-3.5 h-3.5" />}
                  onClick={() => navigate('/patient/book-appointment')}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs"
                >
                  Đặt lịch theo khung giờ
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

