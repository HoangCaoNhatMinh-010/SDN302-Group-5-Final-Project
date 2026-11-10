import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarPlus,
  Heart,
  Sparkles,
  Scissors,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight,
  User,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { familyMemberService } from '../../services/familyMemberService';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import {
  Breadcrumb,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Input,
  Textarea,
  LoadingState,
} from '../../components/common';

const TIME_SLOTS = [
  '08:30 - 09:30',
  '09:30 - 10:30',
  '10:30 - 11:30',
  '13:30 - 14:30',
  '14:30 - 15:30',
  '15:30 - 16:30',
  '16:30 - 17:30',
  '18:00 - 19:00',
];

export const BookPetAppointmentPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [groomers, setGroomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Selection States
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedGroomer, setSelectedGroomer] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('09:30 - 10:30');
  const [specialNotes, setSpecialNotes] = useState('');

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
          setSelectedPet(loadedPets[0]);
        }

        const loadedServices = servicesRes.data || [];
        setServices(loadedServices);
        if (loadedServices.length > 0) {
          setSelectedService(loadedServices[0]);
        }

        const loadedGroomers = groomersRes.data || [];
        setGroomers(loadedGroomers);
        if (loadedGroomers.length > 0) {
          setSelectedGroomer(loadedGroomers[0]);
        }
      } catch (err) {
        toast.error('Không thể tải dữ liệu dịch vụ thú cưng.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
      toast.error('Vui lòng chọn khung giờ hẹn');
      return;
    }

    setIsSubmitting(true);
    try {
      // Format date to DD/MM/YYYY
      const dateParts = selectedDate.split('-');
      const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

      const payload = {
        doctorId: selectedGroomer.id || selectedGroomer._id,
        date: formattedDate,
        time: selectedTime,
        type: selectedService.name,
        symptoms: specialNotes ? `[${selectedPet.name} - ${selectedPet.breed || 'Pet'}]: ${specialNotes}` : `Chăm sóc bé ${selectedPet.name}`,
        notes: `Gói ${selectedService.name} - Bé ${selectedPet.name} (${selectedPet.petType || 'Chó'})`,
        isForFamilyMember: true,
        familyMemberId: selectedPet.id || selectedPet._id,
      };

      const res = await appointmentService.createAppointment(payload);
      toast.success(res.message || 'Đặt lịch chăm sóc bé thú cưng thành công! 🐾');
      navigate('/patient/dashboard');
    } catch (err) {
      toast.error(err.message || 'Không thể hoàn tất đặt lịch. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState text="Đang tải dịch vụ và lịch tiệm..." />;
  }

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
                  const isSelected = selectedPet?.id === pet.id || selectedPet?._id === pet._id;
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
                const isSelected = selectedService?.id === srv.id || selectedService?._id === srv._id;
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
                const isSelected = selectedGroomer?.id === doc.id || selectedGroomer?._id === doc._id;
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

        {/* BƯỚC 4: Chọn Ngày & Giờ hẹn */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                4
              </div>
              <div>
                <CardTitle className="text-base">Chọn Thời gian đến Cửa hàng</CardTitle>
                <CardDescription>Cửa hàng mở cửa từ 08:30 đến 19:30 mỗi ngày</CardDescription>
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
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Khung giờ hẹn *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`rounded-xl py-2.5 px-3 text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
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
              Chuyên viên: <span className="font-semibold">{selectedGroomer?.name || '--'}</span> • Thời gian: <span className="font-semibold">{selectedDate} ({selectedTime})</span>
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
              leftIcon={<CheckCircle className="w-4 h-4" />}
              className="bg-amber-600 hover:bg-amber-700 border-amber-600 text-white font-bold"
            >
              Xác nhận đặt lịch 🐾
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

