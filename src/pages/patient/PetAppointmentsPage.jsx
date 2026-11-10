import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CalendarPlus,
  Clock,
  MapPin,
  XCircle,
  AlertCircle,
  CheckCircle,
  FileText,
  User,
  Scissors,
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { useToast } from '../../context/ToastContext';
import {
  Breadcrumb,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatusBadge,
  Tabs,
  Badge,
  Dialog,
  LoadingState,
  EmptyState,
} from '../../components/common';

export const PetAppointmentsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Cancel Dialog
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const res = await appointmentService.getMyAppointments();
      setAppointments(res.data || []);
    } catch (err) {
      toast.error('Không thể tải danh sách lịch hẹn.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleOpenCancelDialog = (apt) => {
    setSelectedAppointment(apt);
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;
    setIsCancelling(true);
    try {
      await appointmentService.cancelAppointment(
        selectedAppointment.id || selectedAppointment._id,
        'Chủ nuôi bận việc đột xuất'
      );
      toast.success('Đã hủy lịch hẹn chăm sóc thành công');
      setIsCancelDialogOpen(false);
      await loadAppointments();
    } catch (err) {
      toast.error(err.message || 'Không thể hủy lịch hẹn.');
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') {
      return ['REQUESTED', 'AWAITING_DEPOSIT', 'PENDING', 'CONFIRMED', 'WAITING', 'IN_PROGRESS'].includes(apt.status);
    }
    if (activeTab === 'completed') return apt.status === 'COMPLETED';
    if (activeTab === 'cancelled') return ['CANCELLED', 'CANCELLED_EARLY', 'CANCELLED_LATE', 'NO_SHOW', 'REJECTED'].includes(apt.status);
    return true;
  });

  const tabs = [
    { id: 'all', label: 'Tất cả lịch', count: appointments.length },
    {
      id: 'upcoming',
      label: 'Sắp tới',
      count: appointments.filter((a) => ['REQUESTED', 'AWAITING_DEPOSIT', 'PENDING', 'CONFIRMED', 'WAITING', 'IN_PROGRESS'].includes(a.status)).length,
    },
    {
      id: 'completed',
      label: 'Đã hoàn thành',
      count: appointments.filter((a) => a.status === 'COMPLETED').length,
    },
    {
      id: 'cancelled',
      label: 'Đã hủy',
      count: appointments.filter((a) => ['CANCELLED', 'CANCELLED_EARLY', 'CANCELLED_LATE', 'NO_SHOW', 'REJECTED'].includes(a.status)).length,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <Breadcrumb
        items={[
          { label: 'Trang chủ', path: '/patient/dashboard' },
          { label: 'Quản lý Lịch hẹn Chăm sóc Thú Cưng' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-primary-600 p-6 text-white shadow-elevated">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm mb-2">
            <span>🐾 PawCare Appointments</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Danh sách Lịch hẹn Chăm sóc Bé</h1>
          <p className="mt-1 text-sm text-amber-50 max-w-xl">
            Theo dõi tình trạng xác nhận, khung giờ hẹn, chuyên viên phụ trách và lịch sử làm đẹp của thú cưng tại cửa hàng.
          </p>
        </div>
        <Button
          variant="light"
          size="md"
          leftIcon={<CalendarPlus className="w-4 h-4 text-amber-700" />}
          onClick={() => navigate('/patient/book-appointment')}
          className="bg-white text-amber-800 hover:bg-amber-50 border-0 shadow-sm font-semibold flex-shrink-0"
        >
          Đặt lịch mới
        </Button>
      </div>

      <Card>
        <div className="px-6 pt-4 pb-2 border-b border-slate-100">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <CardContent className="pt-4">
          {isLoading ? (
            <LoadingState text="Đang tải lịch hẹn..." />
          ) : filteredAppointments.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Không có lịch hẹn nào"
              description="Bạn chưa có lịch hẹn chăm sóc thú cưng nào trong mục này."
              actionLabel="Đặt lịch chăm sóc ngay"
              onAction={() => navigate('/patient/book-appointment')}
            />
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => {
                const canCancel = ['REQUESTED', 'AWAITING_DEPOSIT', 'PENDING', 'CONFIRMED', 'WAITING'].includes(apt.status);
                return (
                  <div
                    key={apt.id || apt.code}
                    className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-amber-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold uppercase text-slate-400">NGÀY</span>
                        <span className="text-sm font-black text-amber-800">
                          {apt.date ? apt.date.substring(0, 5) : '10/11'}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {apt.petName ? `🐾 Bé ${apt.petName}` : '🐾 Thú cưng'} - {apt.specialty || 'Gói Spa'}
                          </h4>
                          <StatusBadge status={apt.status} size="sm" />
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                          <span>
                            Chuyên viên: <strong className="text-slate-800">{apt.doctorName}</strong>
                          </span>
                          <span>• Mã phiếu: <strong className="text-amber-800">{apt.code || apt.id}</strong></span>
                          {apt.type && <span>• Gói: {apt.type}</span>}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            {apt.time} ({apt.date})
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {apt.room || 'PawCare Studio - Khu Spa & Grooming'}
                          </span>
                        </div>

                        {(apt.careNotes || apt.symptoms) && (
                          <p className="mt-2 text-xs text-amber-900 bg-amber-50/70 px-2.5 py-1 rounded-md border border-amber-100 inline-block">
                            Ghi chú: {apt.careNotes || apt.symptoms}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      {canCancel && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCancelDialog(apt)}
                          className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          Hủy lịch
                        </Button>
                      )}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          alert(
                            `MÃ LỊCH HẸN: ${apt.code || apt.id}\nThú cưng: ${apt.petName || 'Bé cưng'}\nGói: ${apt.specialty}\nThời gian: ${apt.time} ngày ${apt.date}\nChuyên viên: ${apt.doctorName}\nĐịa chỉ: PawCare Studio - Số 123 Nguyễn Thị Minh Khai, Q.1`
                          )
                        }
                        className="text-xs bg-amber-600 hover:bg-amber-700 border-amber-600 text-white font-medium"
                      >
                        Chi tiết phiếu
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Hủy lịch */}
      <Dialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        title="Hủy lịch chăm sóc thú cưng?"
        description={`Bạn có chắc muốn hủy lịch hẹn [${selectedAppointment?.code || selectedAppointment?.id}] cho bé "${selectedAppointment?.petName || 'thú cưng'}" vào ngày ${selectedAppointment?.date} không?`}
        confirmLabel="Xác nhận hủy lịch"
        confirmVariant="danger"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};
