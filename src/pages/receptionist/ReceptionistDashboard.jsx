import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListOrdered,
  UserCheck,
  Calendar,
  CalendarPlus,
  UserX,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SearchInput,
  Dialog,
} from '../../components/common';

export const ReceptionistDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [selectedApt, setSelectedApt] = useState(null);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);

  const handleCheckinClick = (apt) => {
    setSelectedApt(apt);
    setIsCheckinModalOpen(true);
  };

  const confirmCheckin = () => {
    if (!selectedApt) return;
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === selectedApt.id ? { ...a, status: 'WAITING' } : a
      )
    );
    toast.success(`Check-in thành công cho bệnh nhân ${selectedApt.patientName}`);
    setIsCheckinModalOpen(false);
    setSelectedApt(null);
  };

  const filteredAppointments = appointments.filter(
    (a) =>
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Quản lý vận hành phòng khám' }]} />

      {/* 1. Welcome & Shift Info Card */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-800 via-teal-700 to-sky-700 p-6 sm:p-8 text-white shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm mb-3">
              <Clock className="w-3.5 h-3.5 text-teal-200" />
              <span>Ca trực: Sáng (07:30 - 12:00) • Quầy tiếp đón số 01</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Quản lý vận hành phòng khám
            </h1>
            <p className="mt-1 text-sm text-teal-100 max-w-xl">
              Chào ca trực, {currentUser?.name || 'Trần Thị Lan'}. Theo dõi luồng tiếp đón bệnh nhân, kiểm soát check-in và điều phối hàng chờ khám hôm nay.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="light"
              size="md"
              leftIcon={<UserCheck className="w-4 h-4 text-teal-800" />}
              onClick={() => navigate('/receptionist/check-in')}
              className="bg-white text-teal-800 hover:bg-slate-50 border-0 shadow-sm"
            >
              Tiếp nhận Check-in
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<CalendarPlus className="w-4 h-4 text-white" />}
              onClick={() => navigate('/receptionist/book-for-patient')}
              className="border-white/40 text-white hover:bg-white/10"
            >
              Đặt lịch hộ
            </Button>
            <Button
              variant="ghost"
              size="md"
              leftIcon={<Calendar className="w-4 h-4 text-white" />}
              onClick={() => navigate('/receptionist/master-calendar')}
              className="text-white hover:bg-white/10"
            >
              Lịch tổng
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Operational Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Hàng chờ tiếp đón"
          value="7"
          trend="+2"
          trendType="up"
          trendLabel="10 phút gần đây"
          icon={<ListOrdered className="w-5 h-5 text-teal-600" />}
          iconColor="bg-teal-50 text-teal-600"
        />
        <StatCard
          title="Đã check-in hôm nay"
          value="18"
          trend="82%"
          trendType="up"
          trendLabel="Tỉ lệ đúng hẹn"
          icon={<UserCheck className="w-5 h-5 text-sky-600" />}
          iconColor="bg-sky-50 text-sky-600"
        />
        <StatCard
          title="Đang trong phòng khám"
          value="4"
          trend="4 / 6 phòng"
          trendType="neutral"
          trendLabel="Công suất phòng"
          icon={<Clock className="w-5 h-5 text-emerald-600" />}
          iconColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Vắng mặt (No-show)"
          value="3"
          trend="12%"
          trendType="down"
          trendLabel="Cần gọi nhắc hẹn"
          icon={<UserX className="w-5 h-5 text-rose-600" />}
          iconColor="bg-rose-50 text-rose-600"
        />
      </div>

      {/* 3. Operational Queue & Check-in Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Danh sách tiếp nhận & Hàng chờ khám hôm nay</CardTitle>
            <CardDescription>
              Kiểm tra thông tin thẻ, xác nhận check-in và chuyển trạng thái vào phòng khám
            </CardDescription>
          </div>
          <div className="w-full sm:w-72">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm theo tên BN, mã lịch, BS..."
              size="sm"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Mã lịch</TableHead>
                <TableHead>Bệnh nhân</TableHead>
                <TableHead>Khung giờ</TableHead>
                <TableHead>Bác sĩ & Phòng</TableHead>
                <TableHead>Phân loại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell className="font-mono text-xs font-semibold text-primary-700">
                    {apt.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-800 text-xs">{apt.patientName}</div>
                    <div className="text-[11px] text-slate-400">BHXH: 79124890</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {apt.time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-slate-800">{apt.doctorName}</div>
                    <div className="text-[11px] text-slate-500">{apt.room} • {apt.specialty}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {apt.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={apt.status} size="sm" />
                  </TableCell>
                  <TableCell className="text-right">
                    {apt.status === 'CONFIRMED' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                        onClick={() => handleCheckinClick(apt)}
                      >
                        Check-in
                      </Button>
                    ) : apt.status === 'WAITING' ? (
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => toast.info(`Đã điều phối BN ${apt.patientName} vào ${apt.room}`)}
                      >
                        Gọi vào khám
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.info(`Lịch hẹn ${apt.id}: ${apt.patientName}`)}
                      >
                        Chi tiết
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Check-in */}
      <Dialog
        isOpen={isCheckinModalOpen}
        onClose={() => setIsCheckinModalOpen(false)}
        onConfirm={confirmCheckin}
        title="Xác nhận tiếp đón & Check-in"
        message={`Bạn có chắc chắn muốn xác nhận Check-in cho bệnh nhân "${selectedApt?.patientName}" (Lịch ${selectedApt?.id}) tại ${selectedApt?.room}?`}
        confirmText="Xác nhận Check-in"
        cancelText="Đóng"
      />
    </div>
  );
};
