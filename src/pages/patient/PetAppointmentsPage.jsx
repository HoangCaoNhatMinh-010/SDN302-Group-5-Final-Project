import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CalendarDays,
  CalendarPlus,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import { PayosPaymentModal } from '../../components/payment/PayosPaymentModal';
import {
  Breadcrumb,
  Button,
  Card,
  CardContent,
  StatusBadge,
  Tabs,
  Modal,
  Dialog,
  LoadingState,
  EmptyState,
} from '../../components/common';

export const PetAppointmentsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Detail & Cancel Modals
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // PayOS Payment State
  const [payosData, setPayosData] = useState(null);
  const [isPayosModalOpen, setIsPayosModalOpen] = useState(false);
  const [isCreatingPayos, setIsCreatingPayos] = useState(false);

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

  // Xử lý returnUrl từ cổng PayOS
  useEffect(() => {
    const paymentStatusParam = searchParams.get('payment');
    const orderCodeParam = searchParams.get('orderCode');
    const appointmentIdParam = searchParams.get('appointmentId');

    if (paymentStatusParam === 'success' && orderCodeParam) {
      paymentService
        .verifyPayosPayment({
          orderCode: orderCodeParam,
          appointmentId: appointmentIdParam,
          simulateSuccess: false,
        })
        .then((res) => {
          toast.success(res.message || 'Thanh toán PayOS 100đ thành công!');
          loadAppointments();
        })
        .catch((err) => {
          toast.info(err.message || 'Đang kiểm tra giao dịch PayOS...');
        })
        .finally(() => {
          setSearchParams({});
        });
    } else if (paymentStatusParam === 'cancelled') {
      toast.info('Bạn đã hủy thao tác thanh toán trên cổng PayOS.');
      setSearchParams({});
    }
  }, [searchParams]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleOpenDetailModal = (apt) => {
    setSelectedAppointment(apt);
    setIsDetailModalOpen(true);
  };

  const handleOpenCancelDialog = (apt) => {
    setSelectedAppointment(apt);
    setIsCancelDialogOpen(true);
  };

  const handlePayNow = async (apt) => {
    setIsCreatingPayos(true);
    try {
      const payRes = await paymentService.createPayosLink(apt.id || apt._id);
      if (payRes.alreadyPaid) {
        toast.info('Lịch hẹn này đã được thanh toán rồi.');
        await loadAppointments();
        return;
      }
      setPayosData({
        ...payRes.data,
        mode: payRes.mode,
        payosNotice: payRes.payosNotice,
      });
      setIsPayosModalOpen(true);
    } catch (err) {
      toast.error(err.message || 'Không thể khởi tạo liên kết thanh toán PayOS.');
    } finally {
      setIsCreatingPayos(false);
    }
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
      return apt.status === 'CONFIRMED' || apt.status === 'WAITING' || apt.status === 'IN_PROGRESS';
    }
    if (activeTab === 'completed') return apt.status === 'COMPLETED';
    if (activeTab === 'cancelled') return apt.status === 'CANCELLED' || apt.status === 'NO_SHOW';
    return true;
  });

  const tabs = [
    { id: 'all', label: 'Tất cả lịch', count: appointments.length },
    {
      id: 'upcoming',
      label: 'Sắp tới',
      count: appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'WAITING' || a.status === 'IN_PROGRESS').length,
    },
    {
      id: 'completed',
      label: 'Đã hoàn thành',
      count: appointments.filter((a) => a.status === 'COMPLETED').length,
    },
    {
      id: 'cancelled',
      label: 'Đã hủy',
      count: appointments.filter((a) => a.status === 'CANCELLED' || a.status === 'NO_SHOW').length,
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
            Theo dõi tình trạng xác nhận, thanh toán phí đặt lịch (100đ qua PayOS), chuyên viên phụ trách và lịch sử làm đẹp của thú cưng.
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
                const canCancel = apt.status === 'CONFIRMED' || apt.status === 'WAITING';
                const isPaid = apt.paymentStatus === 'PAID';
                const canPay = !isPaid && apt.status !== 'CANCELLED' && apt.status !== 'NO_SHOW';

                return (
                  <div
                    key={apt.id || apt.code}
                    className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-amber-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold uppercase text-slate-400">NGÀY</span>
                        <span className="text-sm font-black text-amber-800">
                          {apt.date ? apt.date.substring(0, 5) : '11/11'}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {apt.petName ? `🐾 Bé ${apt.petName}` : '🐾 Thú cưng'} - {apt.specialty || 'Gói Spa'}
                          </h4>
                          <StatusBadge status={apt.status} size="sm" />
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Đã thanh toán {(apt.bookingFee || 100)}đ (PayOS)
                            </span>
                          ) : apt.status !== 'CANCELLED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Chưa thanh toán phí giữ chỗ (100đ)
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                          <span>
                            Chuyên viên: <strong className="text-slate-800">{apt.doctorName}</strong>
                          </span>
                          <span>• Mã phiếu: <strong className="text-amber-800">{apt.code || apt.id}</strong></span>
                          {apt.price && (
                            <span>• Giá gói: <strong className="text-slate-800">{apt.price.toLocaleString('vi-VN')} đ</strong></span>
                          )}
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

                        {apt.symptoms && (
                          <p className="mt-2 text-xs text-amber-900 bg-amber-50/70 px-2.5 py-1 rounded-md border border-amber-100 inline-block">
                            Ghi chú: {apt.symptoms}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                      {canPay && (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={isCreatingPayos}
                          leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                          onClick={() => handlePayNow(apt)}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white font-semibold"
                        >
                          Thanh toán PayOS (100đ)
                        </Button>
                      )}
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
                        onClick={() => handleOpenDetailModal(apt)}
                        className="text-xs bg-amber-600 hover:bg-amber-700 border-amber-600 text-white font-medium"
                      >
                        {apt.status === 'COMPLETED' ? 'Xem hóa đơn' : 'Chi tiết phiếu'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Chi tiết Phiếu hẹn / Hóa đơn */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Chi tiết Phiếu Dịch vụ [${selectedAppointment?.code || ''}]`}
        size="md"
      >
        {selectedAppointment && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50/70 border border-amber-200">
              <div>
                <p className="text-[11px] font-bold uppercase text-amber-700">PawCare Pet Spa & Grooming</p>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  🐾 Bé {selectedAppointment.petName || 'Thú cưng'}
                </h4>
                <p className="text-slate-500 mt-0.5">{selectedAppointment.petBreed || 'Thú cưng tại cửa hàng'}</p>
              </div>
              <StatusBadge status={selectedAppointment.status} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Gói dịch vụ</span>
                <span className="font-semibold text-slate-900">{selectedAppointment.specialty}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Giá gói dịch vụ</span>
                <span className="font-bold text-slate-800">
                  {(selectedAppointment.price || 180000).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Phí đặt lịch PayOS</span>
                <span className={`font-bold ${selectedAppointment.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {(selectedAppointment.bookingFee || 100)} đ ({selectedAppointment.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Thời gian hẹn</span>
                <span className="font-semibold text-slate-800">
                  {selectedAppointment.time} • {selectedAppointment.date}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Chuyên viên & Khu vực thực hiện</span>
                <span className="font-semibold text-slate-800">
                  {selectedAppointment.doctorName} • {selectedAppointment.room || 'PawCare Studio - Số 123 Nguyễn Thị Minh Khai, Quận 1, TP.HCM'}
                </span>
              </div>
            </div>

            {selectedAppointment.symptoms && (
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-amber-900">
                <span className="font-bold block mb-1">Ghi chú chăm sóc:</span>
                <p>{selectedAppointment.symptoms}</p>
              </div>
            )}

            {selectedAppointment.cancelReason && selectedAppointment.status === 'CANCELLED' && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                <span className="font-bold block mb-1">Lý do hủy lịch:</span>
                <p>{selectedAppointment.cancelReason}</p>
              </div>
            )}

            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 leading-relaxed">
              <strong>Lưu ý đón & đưa bé:</strong> Vui lòng mang bé đến cửa hàng <strong>PawCare Studio</strong> trước 10 phút để chuyên viên kiểm tra tình trạng da lông và tư vấn kiểu dáng phù hợp nhất.
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

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

      {/* Modal Thanh toán PayOS */}
      <PayosPaymentModal
        isOpen={isPayosModalOpen}
        onClose={() => setIsPayosModalOpen(false)}
        paymentData={payosData}
        onPaymentSuccess={() => {
          loadAppointments();
        }}
      />
    </div>
  );
};
