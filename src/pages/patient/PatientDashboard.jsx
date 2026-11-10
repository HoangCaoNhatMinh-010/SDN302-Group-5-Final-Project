import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarPlus,
  Sparkles,
  CalendarDays,
  Clock,
  MapPin,
  Heart,
  Scissors,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { familyMemberService } from '../../services/familyMemberService';
import { MOCK_APPOINTMENTS } from '../../data/mockData';
import {
  Breadcrumb,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  StatusBadge,
  Tabs,
  Modal,
} from '../../components/common';

export const PatientDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [petsCount, setPetsCount] = useState(0);
  const [selectedAptModal, setSelectedAptModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const aptRes = await appointmentService.getMyAppointments();
        if (aptRes && aptRes.data) {
          setAppointments(aptRes.data);
        } else {
          setAppointments(MOCK_APPOINTMENTS);
        }
      } catch (err) {
        console.warn('Dùng dữ liệu lịch hẹn dự phòng:', err.message);
        setAppointments(MOCK_APPOINTMENTS);
      }

      try {
        const fmRes = await familyMemberService.getFamilyMembers();
        if (fmRes && fmRes.data) {
          setPetsCount(fmRes.data.length);
        }
      } catch {
        setPetsCount(3);
      }
    };

    fetchData();
  }, []);

  const upcomingList = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'WAITING' || a.status === 'IN_PROGRESS'
  );
  const completedList = appointments.filter((a) => a.status === 'COMPLETED');
  const cancelledList = appointments.filter((a) => a.status === 'CANCELLED' || a.status === 'NO_SHOW');

  const filterTabs = [
    { id: 'upcoming', label: 'Lịch Spa sắp tới', count: upcomingList.length },
    { id: 'completed', label: 'Lịch đã hoàn thành', count: completedList.length },
    { id: 'cancelled', label: 'Lịch đã hủy', count: cancelledList.length },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Tổng quan dịch vụ Thú Cưng' }]} />

      {/* 1. Pet Care Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-primary-600 p-6 sm:p-8 text-white shadow-elevated">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm mb-3">
            <span>🐾 PawCare Pet Spa & Grooming Studio</span>
            <span className="text-amber-200">•</span>
            <span>Mã khách hàng: {currentUser?.patientCode || 'PAW-VIP-0892'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Chào mừng {currentUser?.name || 'bạn'} và các bé thú cưng! 🐶🐱
          </h1>
          <p className="mt-2 text-sm text-rose-50 leading-relaxed">
            Hệ thống đặt lịch chăm sóc, làm đẹp và spa chuyên nghiệp cho thú cưng tại PawCare Studio. Chủ động chọn gói dịch vụ, chuyên viên yêu thích và khung giờ linh hoạt cho các bé.
          </p>

          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              variant="light"
              size="md"
              leftIcon={<CalendarPlus className="w-4 h-4 text-rose-700" />}
              onClick={() => navigate('/patient/book-appointment')}
              className="bg-white text-rose-700 hover:bg-rose-50 border-0 shadow-sm font-semibold"
            >
              Đặt lịch Spa & Grooming
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Heart className="w-4 h-4 text-white" />}
              onClick={() => navigate('/patient/family')}
              className="border-white/50 text-white hover:bg-white/15"
            >
              Hồ sơ Thú cưng ({petsCount})
            </Button>
            <Button
              variant="ghost"
              size="md"
              leftIcon={<Sparkles className="w-4 h-4 text-white" />}
              onClick={() => navigate('/patient/specialties')}
              className="text-white hover:bg-white/15"
            >
              Bảng giá dịch vụ
            </Button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-6 -bottom-8 text-white/10 text-9xl pointer-events-none select-none">
          🐾
        </div>
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lịch Spa sắp tới"
          value={upcomingList.length.toString()}
          trend="Đã xác nhận"
          trendType="up"
          trendLabel={upcomingList[0] ? `${upcomingList[0].date} (${upcomingList[0].time})` : 'Chưa có lịch mới'}
          icon={<CalendarDays className="w-5 h-5 text-amber-600" />}
          iconColor="bg-amber-50 text-amber-600"
          onClick={() => navigate('/patient/appointments')}
        />
        <StatCard
          title="Thú cưng đã đăng ký"
          value={petsCount.toString()}
          trend="Đã liên kết"
          trendType="neutral"
          trendLabel="Chó, Mèo của bạn"
          icon={<Heart className="w-5 h-5 text-rose-600" />}
          iconColor="bg-rose-50 text-rose-600"
          onClick={() => navigate('/patient/family')}
        />
        <StatCard
          title="Gói dịch vụ hot"
          value="Combo Tắm & Cắt tỉa"
          trend="Được yêu thích nhất"
          trendType="up"
          trendLabel="Form gấu Teddy Hàn Quốc"
          icon={<Scissors className="w-5 h-5 text-purple-600" />}
          iconColor="bg-purple-50 text-purple-600"
          onClick={() => navigate('/patient/specialties')}
        />
        <StatCard
          title="Lịch đã hoàn thành"
          value={completedList.length.toString()}
          trend="Chăm sóc thành công"
          trendType="up"
          trendLabel="Xem hóa đơn dịch vụ"
          icon={<Sparkles className="w-5 h-5 text-emerald-600" />}
          iconColor="bg-emerald-50 text-emerald-600"
          onClick={() => setActiveTab('completed')}
        />
      </div>

      {/* 3. Main Content: Appointments with Tabs */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Lịch hẹn chăm sóc & làm đẹp Thú Cưng</CardTitle>
            <CardDescription>
              Theo dõi tiến trình tắm sấy, cắt tỉa và bàn giao bé tại cửa hàng PawCare
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/patient/book-appointment')}
            leftIcon={<CalendarPlus className="w-3.5 h-3.5 text-amber-600" />}
            className="border-amber-300 text-amber-800 hover:bg-amber-50"
          >
            Đặt lịch mới
          </Button>
        </CardHeader>

        <div className="px-6 pt-2">
          <Tabs tabs={filterTabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <CardContent className="pt-4">
          {activeTab === 'upcoming' ? (
            <div className="space-y-4">
              {upcomingList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <div className="text-3xl mb-2">🐾</div>
                  Hiện bạn chưa có lịch hẹn chăm sóc thú cưng nào sắp tới.
                  <div className="mt-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/patient/book-appointment')}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Đặt lịch cho bé ngay
                    </Button>
                  </div>
                </div>
              ) : (
                upcomingList.map((apt) => (
                  <div
                    key={apt.id || apt.code}
                    className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/60 to-rose-50/40 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-amber-200 text-amber-600 flex flex-col items-center justify-center flex-shrink-0 shadow-xs">
                        <span className="text-[10px] font-bold uppercase text-slate-400">LỊCH HẸN</span>
                        <span className="text-sm font-black text-amber-700">
                          {apt.date ? apt.date.substring(0, 5) : '11/11'}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {apt.petName ? `🐾 Bé ${apt.petName}` : `🐾 Bé cưng`} - {apt.specialty || 'Combo Spa Thú cưng'}
                          </h4>
                          <StatusBadge status={apt.status} size="sm" />
                        </div>

                        <p className="mt-1 text-xs text-slate-600 font-medium">
                          Chuyên viên phụ trách: <span className="text-amber-800 font-semibold">{apt.doctorName}</span> {apt.type ? `• Gói: ${apt.type}` : ''}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            {apt.time} ({apt.date})
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {apt.room || 'PawCare Studio - Khu Làm Đẹp Thú Cưng'}
                          </span>
                        </div>

                        {apt.symptoms && (
                          <p className="mt-2 text-[11px] text-amber-900/80 bg-white/70 px-2.5 py-1 rounded-md border border-amber-100 inline-block">
                            Lưu ý: {apt.symptoms}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAptModal(apt)}
                      >
                        Chỉ dẫn đón bé
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/patient/appointments')}
                        className="bg-amber-600 hover:bg-amber-700 border-amber-600 text-white"
                      >
                        Quản lý lịch
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'completed' ? (
            <div className="divide-y divide-slate-100">
              {completedList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Chưa có lịch chăm sóc nào đã hoàn thành.
                </div>
              ) : (
                completedList.map((apt) => (
                  <div key={apt.id || apt.code} className="py-3.5 flex items-center justify-between text-xs gap-4">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {apt.petName ? `🐾 Bé ${apt.petName}` : 'Thú cưng'} - {apt.specialty}
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        {apt.doctorName} • {apt.date} ({apt.time}) • Chi phí:{' '}
                        <strong className="text-emerald-700">{(apt.price || 180000).toLocaleString('vi-VN')} đ</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadge status="COMPLETED" size="sm" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAptModal(apt)}
                      >
                        Xem hóa đơn
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cancelledList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Không có lịch hẹn nào bị hủy.
                </div>
              ) : (
                cancelledList.map((apt) => (
                  <div key={apt.id || apt.code} className="py-3.5 flex items-center justify-between text-xs gap-4">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {apt.petName ? `🐾 Bé ${apt.petName}` : 'Thú cưng'} - {apt.specialty}
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        {apt.doctorName} • {apt.date} ({apt.time})
                        {apt.cancelReason ? ` • Lý do: ${apt.cancelReason}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadge status={apt.status} size="sm" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAptModal(apt)}
                      >
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Chi tiết Phiếu hẹn & Hóa đơn / Chỉ dẫn đón bé */}
      <Modal
        isOpen={!!selectedAptModal}
        onClose={() => setSelectedAptModal(null)}
        title={`Thông tin Phiếu Dịch Vụ [${selectedAptModal?.code || ''}]`}
        size="md"
      >
        {selectedAptModal && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50/70 border border-amber-200">
              <div>
                <p className="text-[11px] font-bold uppercase text-amber-700">PawCare Pet Spa & Grooming</p>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  🐾 Bé {selectedAptModal.petName || 'Thú cưng'}
                </h4>
                <p className="text-slate-500 mt-0.5">{selectedAptModal.petBreed || 'Thú cưng tại cửa hàng'}</p>
              </div>
              <StatusBadge status={selectedAptModal.status} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Gói dịch vụ</span>
                <span className="font-semibold text-slate-900">{selectedAptModal.specialty}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Chi phí niêm yết</span>
                <span className="font-bold text-emerald-700">
                  {(selectedAptModal.price || 180000).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Thời gian</span>
                <span className="font-semibold text-slate-800">
                  {selectedAptModal.time} • {selectedAptModal.date}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Chuyên viên phụ trách</span>
                <span className="font-semibold text-slate-800">{selectedAptModal.doctorName}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Địa chỉ cửa hàng & Khu vực</span>
                <span className="font-semibold text-slate-800">
                  {selectedAptModal.room || 'PawCare Studio'} • Số 123 Nguyễn Thị Minh Khai, Quận 1, TP.HCM
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 leading-relaxed">
              <strong>Chỉ dẫn đưa & đón bé:</strong> Vui lòng mang theo sổ tiêm phòng (nếu có) và đưa bé đến cửa hàng <strong>PawCare Studio</strong> trước giờ hẹn 10 phút để làm thủ tục check-in.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedAptModal(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
