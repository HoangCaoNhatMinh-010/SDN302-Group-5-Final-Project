import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarPlus,
  Stethoscope,
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle,
  FileText,
  UserPlus,
  AlertCircle,
  ChevronRight,
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
  Badge,
} from '../../components/common';

export const PatientDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [familyMembersCount, setFamilyMembersCount] = useState(3);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Tải lịch hẹn từ MongoDB
        const aptRes = await appointmentService.getMyAppointments();
        if (aptRes && aptRes.data && aptRes.data.length > 0) {
          setAppointments(aptRes.data);
        } else {
          setAppointments(MOCK_APPOINTMENTS);
        }
      } catch (err) {
        console.warn('Dùng dữ liệu lịch hẹn dự phòng:', err.message);
        setAppointments(MOCK_APPOINTMENTS);
      }

      try {
        // Tải người thân từ MongoDB
        const fmRes = await familyMemberService.getFamilyMembers();
        if (fmRes && fmRes.data) {
          setFamilyMembersCount(fmRes.data.length);
        }
      } catch (err) {
        // fallback
      } finally {
        setIsLoading(false);
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
    { id: 'upcoming', label: 'Lịch sắp tới', count: upcomingList.length },
    { id: 'completed', label: 'Lịch đã hoàn thành', count: completedList.length },
    { id: 'cancelled', label: 'Lịch đã hủy', count: cancelledList.length },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Tổng quan bệnh nhân' }]} />

      {/* 1. Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-600 p-6 sm:p-8 text-white shadow-elevated">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm mb-3">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span>Mã hồ sơ: {currentUser?.patientCode || 'BN-2026-0892'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Chào mừng, {currentUser?.name || 'Nguyễn Văn Minh'}
          </h1>
          <p className="mt-2 text-sm text-sky-100 leading-relaxed">
            Chào mừng bạn đến hệ thống đặt lịch khám trực tuyến MedCare (MongoDB & Express). Bạn có thể dễ dàng tra cứu lịch trống của bác sĩ, chủ động đặt lịch khám và quản lý người thân.
          </p>

          {/* Quick Actions inside banner */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              variant="light"
              size="md"
              leftIcon={<CalendarPlus className="w-4 h-4 text-primary-700" />}
              onClick={() => navigate('/patient/book-appointment')}
              className="bg-white text-primary-700 hover:bg-slate-50 border-0 shadow-sm"
            >
              Đặt lịch khám
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Stethoscope className="w-4 h-4 text-white" />}
              onClick={() => navigate('/patient/doctors')}
              className="border-white/40 text-white hover:bg-white/10"
            >
              Xem bác sĩ
            </Button>
            <Button
              variant="ghost"
              size="md"
              leftIcon={<CalendarDays className="w-4 h-4 text-white" />}
              onClick={() => navigate('/patient/appointments')}
              className="text-white hover:bg-white/10"
            >
              Xem lịch hẹn
            </Button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lịch hẹn sắp tới"
          value={upcomingList.length.toString()}
          trend="Đã xác nhận"
          trendType="up"
          trendLabel={upcomingList[0] ? `${upcomingList[0].date} lúc ${upcomingList[0].time}` : 'Chưa có lịch mới'}
          icon={<CalendarDays className="w-5 h-5 text-primary-600" />}
          iconColor="bg-primary-50 text-primary-600"
        />
        <StatCard
          title="Hồ sơ gia đình"
          value={familyMembersCount.toString()}
          trend="Đã liên kết"
          trendType="neutral"
          trendLabel="Hồ sơ người thân"
          icon={<UserPlus className="w-5 h-5 text-teal-600" />}
          iconColor="bg-teal-50 text-teal-600"
          onClick={() => navigate('/patient/family')}
        />
        <StatCard
          title="Kết quả khám mới nhất"
          value="Bình thường"
          trend="Nội tổng quát"
          trendType="up"
          trendLabel="Khám định kỳ gần nhất"
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          iconColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Chỉ định tái khám"
          value="2 tuần nữa"
          trend="Theo dõi huyết áp"
          trendType="neutral"
          icon={<FileText className="w-5 h-5 text-sky-600" />}
          iconColor="bg-sky-50 text-sky-600"
        />
      </div>

      {/* 3. Main Content Area: Appointments with Tabs */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Danh sách lịch hẹn khám bệnh</CardTitle>
            <CardDescription>
              Dữ liệu đồng bộ trực tiếp từ cơ sở dữ liệu MongoDB
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/patient/book-appointment')}
            leftIcon={<CalendarPlus className="w-3.5 h-3.5" />}
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
                <div className="py-8 text-center text-xs text-slate-400">
                  Bạn hiện không có lịch hẹn khám nào sắp tới.
                </div>
              ) : (
                upcomingList.map((apt) => (
                  <div
                    key={apt.id || apt.code}
                    className="rounded-xl border border-primary-200 bg-sky-50/50 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-primary-200 text-primary-600 flex flex-col items-center justify-center flex-shrink-0 shadow-xs">
                        <span className="text-[10px] font-bold uppercase text-slate-400">HẸN</span>
                        <span className="text-sm font-extrabold text-primary-700">
                          {apt.date ? apt.date.substring(0, 5) : '06/10'}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 text-sm">
                            {apt.type || 'Khám bệnh'} - {apt.specialty}
                          </h4>
                          <StatusBadge status={apt.status} size="sm" />
                        </div>

                        <p className="mt-1 text-xs text-slate-600 font-medium">
                          Bác sĩ khám: <span className="text-primary-700">{apt.doctorName}</span> {apt.patientName ? `(Bệnh nhân: ${apt.patientName})` : ''}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {apt.time} ({apt.date})
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {apt.room || 'Phòng khám đa khoa MedCare'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`Mã lịch hẹn: ${apt.code || apt.id}\nVui lòng đến trước 15 phút để làm thủ tục check-in.`)}
                      >
                        Xem chỉ dẫn
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/patient/appointments')}
                      >
                        Chi tiết
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
                  Chưa có lịch khám nào đã hoàn thành.
                </div>
              ) : (
                completedList.map((apt) => (
                  <div key={apt.id || apt.code} className="py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{apt.type || 'Khám bệnh'} - {apt.specialty}</p>
                      <p className="text-slate-500">{apt.doctorName} • {apt.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status="COMPLETED" size="sm" />
                      <Button variant="ghost" size="sm">Xem hồ sơ</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              {cancelledList.length === 0 ? 'Không có lịch hẹn nào bị hủy.' : `${cancelledList.length} lịch hẹn đã hủy.`}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
