import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  Plus,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { familyMemberService } from '../../services/familyMemberService';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { paymentService } from '../../services/paymentService';
import { PayosPaymentModal } from '../../components/payment/PayosPaymentModal';
import {
  Breadcrumb,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Textarea,
  LoadingState,
} from '../../components/common';

const DEFAULT_TIME_SLOTS = [
  { time: '08:30 - 09:30', isAvailable: true },
  { time: '09:30 - 10:30', isAvailable: true },
  { time: '10:30 - 11:30', isAvailable: true },
  { time: '13:30 - 14:30', isAvailable: true },
  { time: '14:30 - 15:30', isAvailable: true },
  { time: '15:30 - 16:30', isAvailable: true },
  { time: '16:30 - 17:30', isAvailable: true },
  { time: '18:00 - 19:00', isAvailable: true },
];

export const BookPetAppointmentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preselect = location.state || {};
  const toast = useToast();

  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [groomers, setGroomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Selection States
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedGroomer, setSelectedGroomer] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    if (preselect.date) return preselect.date;
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState(DEFAULT_TIME_SLOTS);
  const [selectedTime, setSelectedTime] = useState(preselect.time || '');
  const [specialNotes, setSpecialNotes] = useState('');

  // PayOS Payment Modal State
  const [payosData, setPayosData] = useState(null);
  const [isPayosModalOpen, setIsPayosModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [petsRes, servicesRes, groomersRes] = await Promise.all([
          familyMemberService.getFamilyMembers().catch(() => ({ data: [] })),
          doctorService.getAllSpecialties().catch(() => ({ data: [] })),
          doctorService.getAllDoctors().catch(() => ({ data: [] })),
        ]);

        const loadedPets = petsRes.data || [];
        setPets(loadedPets);
        if (loadedPets.length > 0) {
          const foundPet = preselect.petId
            ? loadedPets.find((p) => (p.id || p._id) === preselect.petId)
            : null;
          setSelectedPet(foundPet || loadedPets[0]);
        }

        const loadedServices = servicesRes.data || [];
        setServices(loadedServices);
        if (loadedServices.length > 0) {
          const foundService = preselect.serviceId
            ? loadedServices.find((s) => (s.id || s._id) === preselect.serviceId)
            : null;
          setSelectedService(foundService || loadedServices[0]);
        }

        const loadedGroomers = groomersRes.data || [];
        setGroomers(loadedGroomers);
        if (loadedGroomers.length > 0) {
          const foundGroomer = preselect.groomerId
            ? loadedGroomers.find((g) => (g.id || g._id) === preselect.groomerId)
            : null;
          setSelectedGroomer(foundGroomer || loadedGroomers[0]);
        }
      } catch (err) {
        toast.error('Không thể tải dữ liệu dịch vụ thú cưng.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [preselect.petId, preselect.serviceId, preselect.groomerId]);

  // Fetch real-time available slots whenever groomer or date changes
  useEffect(() => {
    const groomerId = selectedGroomer?.id || selectedGroomer?._id;
    if (!groomerId || !selectedDate) return;

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const dateParts = selectedDate.split('-');
        const formattedDate =
          dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : selectedDate;
        const res = await doctorService.getAvailableSlots(groomerId, formattedDate);
        const fetchedSlots = res?.slots && res.slots.length > 0 ? res.slots : DEFAULT_TIME_SLOTS;
        setSlots(fetchedSlots);

        // Giữ nguyên slot đang chọn nếu vẫn còn trống, nếu không chọn slot trống đầu tiên
        setSelectedTime((prevTime) => {
          const preTarget = preselect.time && fetchedSlots.find((s) => s.time === preselect.time && s.isAvailable);
          if (preTarget) return preTarget.time;
          const stillValid = fetchedSlots.find((s) => s.time === prevTime && s.isAvailable);
          if (stillValid) return stillValid.time;
          const firstAvailable = fetchedSlots.find((s) => s.isAvailable);
          return firstAvailable ? firstAvailable.time : '';
        });
      } catch {
        setSlots(DEFAULT_TIME_SLOTS);
        setSelectedTime(DEFAULT_TIME_SLOTS[0].time);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedGroomer, selectedDate]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!selectedPet) {
      toast.error('Vui lòng chọn hoặc tạo hồ sơ bé thú cưng');
      return;
    }
    if (!selectedService) {
      toast.error('Vui lòng chọn gói dịch vụ chăm sóc');
      return;
    }
    if (!selectedGroomer) {
      toast.error('Vui lòng chọn chuyên viên chăm sóc');
      return;
    }
    if (!selectedDate) {
      toast.error('Vui lòng chọn ngày đến tiệm');
      return;
    }
    if (!selectedTime) {
      toast.error('Khung giờ này đã kín hoặc bạn chưa chọn giờ. Vui lòng chọn khung giờ trống khác!');
      return;
    }

    setIsSubmitting(true);
    try {
      const dateParts = selectedDate.split('-');
      const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

      const payload = {
        doctorId: selectedGroomer.id || selectedGroomer._id,
        serviceId: selectedService.id || selectedService._id,
        serviceName: selectedService.name,
        price: selectedService.price || 180000,
        date: formattedDate,
        time: selectedTime,
        type: selectedService.name,
        symptoms: specialNotes
          ? `[${selectedPet.name} - ${selectedPet.breed || 'Pet'}]: ${specialNotes}`
          : `Chăm sóc bé ${selectedPet.name}`,
        notes: `Gói ${selectedService.name} - Bé ${selectedPet.name} (${selectedPet.petType || 'Chó'})`,
        isForFamilyMember: true,
        familyMemberId: selectedPet.id || selectedPet._id,
      };

      const res = await appointmentService.createAppointment(payload);
      const createdApt = res.data;
      toast.success('Đã tạo lịch hẹn! Vui lòng thanh toán phí giữ chỗ 100đ qua PayOS.');

      // Tạo liên kết thanh toán PayOS (100đ cố định)
      try {
        const payRes = await paymentService.createPayosLink(createdApt.id || createdApt._id);
        setPayosData({
          ...payRes.data,
          mode: payRes.mode,
          payosNotice: payRes.payosNotice,
        });
        setIsPayosModalOpen(true);
      } catch (payErr) {
        toast.warning('Đã lưu lịch hẹn, bạn có thể thanh toán sau trong mục Lịch hẹn.');
        navigate('/patient/appointments');
      }
    } catch (err) {
      toast.error(err.message || 'Không thể hoàn tất đặt lịch. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState text="Đang tải dịch vụ và lịch tiệm..." />;
  }

  const hasAvailableSlot = slots.some((s) => s.isAvailable);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <Breadcrumb
        items={[
          { label: 'Trang chủ', path: '/patient/dashboard' },
          { label: 'Đặt lịch chăm sóc Thú cưng' },
        ]}
      />

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-primary-600 p-6 sm:p-7 text-white shadow-elevated">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm mb-2">
          <span>🐾 PawCare Pet Spa & Grooming</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Đặt lịch Chăm sóc & Làm đẹp Thú Cưng</h1>
        <p className="mt-1 text-sm text-amber-50">
          Chỉ vài bước đơn giản để bé cún, mèo của bạn được tận hưởng dịch vụ tắm spa, cắt tỉa lông thời trang và chăm sóc chu đáo nhất tại PawCare Studio.
        </p>
      </div>

      <form onSubmit={handleSubmitBooking} className="space-y-6">
        {/* BƯỚC 1: Chọn Thú Cưng */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <div>
                  <CardTitle className="text-base">Chọn bé Thú Cưng của bạn</CardTitle>
                  <CardDescription>Chọn bé pet cần được chăm sóc trong đợt này</CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => navigate('/patient/family')}
                className="text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
              >
                Quản lý bé cưng
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {pets.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center">
                <p className="text-xs text-slate-500">Bạn chưa có hồ sơ bé thú cưng nào.</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/patient/family')}
                  className="mt-2 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Thêm hồ sơ bé ngay
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {pets.map((pet) => {
                  const isSelected = (selectedPet?.id || selectedPet?._id) === (pet.id || pet._id);
                  const isCat = pet.petType === 'Mèo' || pet.relationship === 'Mèo';
                  return (
                    <div
                      key={pet.id || pet._id}
                      onClick={() => setSelectedPet(pet)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all duration-150 flex items-center gap-3 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/80 shadow-xs ring-2 ring-amber-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
                        {isCat ? '🐱' : '🐶'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{pet.name}</h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/60 text-amber-900 font-semibold">
                            {pet.gender || 'Đực'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{pet.breed || 'Chưa rõ giống'}</p>
                        <p className="text-[11px] text-slate-400 font-medium">Nặng: {pet.weight || '3.5'} kg</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* BƯỚC 2: Chọn Gói Dịch Vụ */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                2
              </div>
              <div>
                <CardTitle className="text-base">Chọn Gói Dịch Vụ Chăm Sóc</CardTitle>
                <CardDescription>Bảng giá rõ ràng, bao gồm toàn bộ dụng cụ chuyên dụng</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {services.map((srv) => {
                const isSelected = (selectedService?.id || selectedService?._id) === (srv.id || srv._id);
                return (
                  <div
                    key={srv.id || srv._id}
                    onClick={() => setSelectedService(srv)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all duration-150 flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="font-bold text-slate-900 text-sm">{srv.name}</h4>
                        <span className="text-xs font-extrabold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md flex-shrink-0">
                          {srv.price ? srv.price.toLocaleString('vi-VN') + ' đ' : '180.000 đ'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{srv.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{srv.room || 'PawCare Studio'}</span>
                      {isSelected && <span className="text-amber-700 font-bold">✓ Đang chọn</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* BƯỚC 3: Chọn Chuyên viên Groomer / Bác sĩ Thú y */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                3
              </div>
              <div>
                <CardTitle className="text-base">Chọn Chuyên viên / Bác sĩ Phụ trách</CardTitle>
                <CardDescription>Đội ngũ Groomer tay nghề cao, yêu thương thú cưng hết lòng</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {groomers.map((doc) => {
                const isSelected = (selectedGroomer?.id || selectedGroomer?._id) === (doc.id || doc._id);
                return (
                  <div
                    key={doc.id || doc._id}
                    onClick={() => setSelectedGroomer(doc)}
                    className={`cursor-pointer rounded-2xl p-4 border text-center transition-all duration-150 flex flex-col items-center justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <img
                        src={doc.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}
                        alt={doc.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs mb-2"
                      />
                      <h4 className="font-bold text-slate-900 text-xs">{doc.name}</h4>
                      <p className="text-[11px] text-amber-800 font-medium mt-0.5 line-clamp-1">{doc.title || 'Chuyên viên Grooming'}</p>
                      <p className="text-[10px] text-slate-400 mt-1">⭐ {doc.rating || 5.0} • {doc.experienceYears || 5} năm KN</p>
                    </div>

                    <div className="mt-3 w-full pt-2 border-t border-slate-100 text-[11px]">
                      {isSelected ? (
                        <span className="text-amber-700 font-bold block">✓ Đã chọn</span>
                      ) : (
                        <span className="text-slate-400 block">Chọn</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* BƯỚC 4: Chọn Ngày & Giờ hẹn (kiểm tra slot thực tế từ DB) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                4
              </div>
              <div>
                <CardTitle className="text-base">Chọn Thời gian đến Cửa hàng</CardTitle>
                <CardDescription>Cửa hàng mở cửa từ 08:30 đến 19:00 mỗi ngày (cập nhật khung giờ trống trực tiếp)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 space-y-4">
            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ngày đưa bé đến tiệm *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Khung giờ hẹn của {selectedGroomer?.name || 'chuyên viên'} *
                </label>
                {isLoadingSlots && (
                  <span className="flex items-center gap-1 text-[11px] text-amber-700">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Đang kiểm tra lịch trống...
                  </span>
                )}
              </div>

              {!hasAvailableSlot ? (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Chuyên viên này đã kín lịch trong ngày {selectedDate}. Vui lòng chọn ngày hoặc chuyên viên khác!</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {slots.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.isAvailable}
                        onClick={() => slot.isAvailable && setSelectedTime(slot.time)}
                        className={`rounded-xl py-2.5 px-3 text-xs font-semibold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                          !slot.isAvailable
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-60'
                            : isSelected
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {slot.time}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-amber-100' : slot.isAvailable ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {slot.isAvailable ? 'Còn trống' : 'Đã kín'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <Textarea
                label="Lưu ý đặc biệt cho chuyên viên chăm sóc bé"
                placeholder="VD: Bé Milo hơi nhát nước, xin hãy xoa bóp nhẹ trước khi tắm; tỉa mặt gấu Teddy tròn xoe..."
                rows={2}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tóm tắt đơn đặt lịch & Nút xác nhận */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Xác nhận Đặt lịch Spa Thú Cưng
            </h4>
            <p className="text-xs text-amber-900 mt-1">
              Bé: <span className="font-bold">{selectedPet?.name || '--'}</span> ({selectedPet?.breed || 'Pet'}) • Gói: <span className="font-bold">{selectedService?.name || '--'}</span>
            </p>
            <p className="text-xs text-slate-600">
              Chuyên viên: <span className="font-semibold">{selectedGroomer?.name || '--'}</span> • Thời gian: <span className="font-semibold">{selectedDate} ({selectedTime || 'Chưa chọn'})</span>
            </p>
            <p className="text-xs text-slate-700 mt-1">
              Giá gói dịch vụ (thanh toán tại tiệm):{' '}
              <span className="font-bold">
                {selectedService?.price ? selectedService.price.toLocaleString('vi-VN') + ' đ' : '180.000 đ'}
              </span>
            </p>
            <p className="text-xs text-emerald-700 font-bold mt-0.5">
              Phí đặt lịch giữ chỗ qua PayOS (cố định): 100 đ
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/patient/dashboard')}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={!selectedTime || !hasAvailableSlot}
              leftIcon={<CheckCircle className="w-4 h-4" />}
              className="bg-amber-600 hover:bg-amber-700 border-amber-600 text-white font-bold"
            >
              Đặt lịch & Thanh toán 100đ (PayOS)
            </Button>
          </div>
        </div>
      </form>

      {/* Modal Thanh toán PayOS */}
      <PayosPaymentModal
        isOpen={isPayosModalOpen}
        onClose={() => {
          setIsPayosModalOpen(false);
          navigate('/patient/appointments');
        }}
        paymentData={payosData}
        onPaymentSuccess={() => {
          navigate('/patient/appointments');
        }}
      />
    </div>
  );
};
