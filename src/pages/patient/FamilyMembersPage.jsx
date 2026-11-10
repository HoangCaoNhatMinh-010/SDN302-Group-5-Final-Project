import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  AlertCircle,
  Eye,
  CheckCircle2,
  Shield,
  Tag,
  Scale,
  CalendarPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { familyMemberService } from '../../services/familyMemberService';
import {
  Breadcrumb,
  Button,
  Input,
  Select,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Modal,
  Dialog,
  EmptyState,
  LoadingState,
} from '../../components/common';

const PET_TYPE_OPTIONS = [
  { value: 'Chó', label: '🐶 Chó' },
  { value: 'Mèo', label: '🐱 Mèo' },
  { value: 'Khác', label: '🐰 Thú cưng khác' },
];

const GENDER_OPTIONS = [
  { value: 'Đực', label: 'Đực' },
  { value: 'Cái', label: 'Cái' },
];

export const FamilyMembersPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Selected Pet for Edit / View / Delete
  const [selectedMember, setSelectedMember] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'Chó',
    petType: 'Chó',
    breed: '',
    weight: '3.5',
    dateOfBirth: '',
    gender: 'Đực',
    phone: '',
    address: '',
    idCard: '',
    note: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load pets on mount
  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const res = await familyMemberService.getFamilyMembers();
      setMembers(res.data || []);
    } catch (err) {
      toast.error('Không thể tải danh sách thú cưng.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [currentUser]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormMode('add');
    setSelectedMember(null);
    setFormData({
      name: '',
      relationship: 'Chó',
      petType: 'Chó',
      breed: '',
      weight: '3.5',
      dateOfBirth: '',
      gender: 'Đực',
      phone: currentUser?.phone || '',
      address: currentUser?.address || '',
      idCard: `TAG-${Math.floor(1000 + Math.random() * 9000)}`,
      note: '',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (member) => {
    setFormMode('edit');
    setSelectedMember(member);
    setFormData({
      name: member.name || '',
      relationship: member.relationship || member.petType || 'Chó',
      petType: member.petType || member.relationship || 'Chó',
      breed: member.breed || '',
      weight: member.weight ? member.weight.toString() : '3.5',
      dateOfBirth: member.dateOfBirth || '',
      gender: member.gender || 'Đực',
      phone: member.phone || currentUser?.phone || '',
      address: member.address || '',
      idCard: member.idCard || '',
      note: member.note || '',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open View Details
  const handleOpenDetailModal = (member) => {
    setSelectedMember(member);
    setIsDetailModalOpen(true);
  };

  // Open Delete Dialog
  const handleOpenDeleteDialog = (member) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Vui lòng nhập tên bé thú cưng';
    }
    if (!formData.dateOfBirth.trim()) {
      errors.dateOfBirth = 'Vui lòng nhập ngày sinh hoặc tuổi của bé';
    }
    if (!formData.breed.trim()) {
      errors.breed = 'Vui lòng nhập giống loài (VD: Poodle, Corgi, Mèo Anh lông ngắn...)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Add / Edit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        relationship: formData.petType,
        petType: formData.petType,
        breed: formData.breed.trim(),
        weight: parseFloat(formData.weight) || 3.5,
        dateOfBirth: formData.dateOfBirth.trim(),
        gender: formData.gender,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        idCard: formData.idCard.trim(),
        note: formData.note.trim(),
      };

      if (formMode === 'add') {
        const res = await familyMemberService.createFamilyMember(payload);
        toast.success(res.message || 'Thêm hồ sơ bé cưng thành công!');
      } else {
        const res = await familyMemberService.updateFamilyMember(selectedMember.id, payload);
        toast.success(res.message || 'Cập nhật hồ sơ bé cưng thành công!');
      }

      setIsFormModalOpen(false);
      await loadMembers();
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra khi lưu thông tin thú cưng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedMember) return;
    try {
      const res = await familyMemberService.deleteFamilyMember(selectedMember.id);
      toast.success(res.message || 'Đã xóa hồ sơ bé thú cưng thành công!');
      setIsDeleteDialogOpen(false);
      await loadMembers();
    } catch (err) {
      toast.error(err.message || 'Không thể xóa hồ sơ bé thú cưng.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Trang chủ', path: '/patient/dashboard' },
          { label: 'Hồ sơ Thú cưng của tôi' },
        ]}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-primary-600 p-6 text-white shadow-elevated">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm mb-2">
            <span>🐾 PawCare Pet Profiles</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Hồ sơ Thú cưng của tôi</h1>
          <p className="mt-1 text-sm text-rose-50 max-w-xl">
            Lưu trữ thông tin chi tiết các bé chó mèo, cân nặng, thói quen và lịch tiêm phòng để chuyên viên chăm sóc chu đáo nhất khi đến tiệm.
          </p>
        </div>
        <Button
          variant="light"
          size="md"
          leftIcon={<Plus className="w-4 h-4 text-rose-600" />}
          onClick={handleOpenAddModal}
          className="bg-white text-rose-700 hover:bg-rose-50 border-0 shadow-sm self-start sm:self-auto flex-shrink-0"
        >
          Thêm bé cưng mới
        </Button>
      </div>

      {/* Pet Cards List */}
      {isLoading ? (
        <LoadingState text="Đang tải danh sách thú cưng..." />
      ) : members.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Bạn chưa đăng ký bé thú cưng nào"
          description="Hãy thêm thông tin các bé cún, mèo của bạn để dễ dàng đặt lịch tắm spa, cắt tỉa và theo dõi lịch chăm sóc tại PawCare Studio."
          actionLabel="Thêm bé cưng ngay"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((pet) => {
            const isCat = pet.petType === 'Mèo' || pet.relationship === 'Mèo';
            return (
              <Card
                key={pet.id}
                className="group hover:shadow-lg transition-all duration-200 border-slate-200/80 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-3xl shadow-xs">
                          {isCat ? '🐱' : '🐶'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base group-hover:text-primary-700 transition-colors">
                              {pet.name}
                            </h3>
                            <Badge
                              variant={isCat ? 'primary' : 'warning'}
                              size="sm"
                              className="font-medium text-[11px]"
                            >
                              {pet.petType || pet.relationship || 'Chó'}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {pet.breed || 'Chưa cập nhật giống loài'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(pet)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteDialog(pet)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa hồ sơ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="mt-4 grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Giới tính</span>
                        <span className="text-xs font-bold text-slate-700">{pet.gender || 'Đực'}</span>
                      </div>
                      <div className="border-x border-slate-200">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Cân nặng</span>
                        <span className="text-xs font-bold text-slate-700">{pet.weight || '3.5'} kg</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Tuổi/Ngày sinh</span>
                        <span className="text-xs font-bold text-slate-700 truncate block">{pet.dateOfBirth || '--'}</span>
                      </div>
                    </div>

                    {/* Tag / Microchip */}
                    {pet.idCard && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                        <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Mã vòng cổ / Tag: <span className="font-semibold text-slate-700">{pet.idCard}</span></span>
                      </div>
                    )}

                    {/* Note */}
                    {pet.note && (
                      <div className="mt-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 p-2 text-xs text-amber-900 leading-relaxed">
                        <span className="font-semibold">Lưu ý khi chăm sóc:</span> {pet.note}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDetailModal(pet)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    className="text-xs text-slate-600"
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CalendarPlus className="w-3.5 h-3.5" />}
                    onClick={() =>
                      navigate('/patient/book-appointment', {
                        state: { petId: pet.id || pet._id },
                      })
                    }
                    className="text-xs bg-amber-600 hover:bg-amber-700 border-amber-600 text-white"
                  >
                    Đặt Spa ngay
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Thêm / Chỉnh sửa hồ sơ Thú cưng */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={formMode === 'add' ? 'Thêm Hồ sơ Thú cưng Mới 🐾' : `Cập nhật Hồ sơ bé "${selectedMember?.name}"`}
        size="md"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tên bé thú cưng *"
              placeholder="VD: Milo, LuLu, Bông..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
            />

            <Select
              label="Loại thú cưng *"
              value={formData.petType}
              onChange={(e) => setFormData({ ...formData, petType: e.target.value, relationship: e.target.value })}
              options={PET_TYPE_OPTIONS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Giống loài *"
              placeholder="VD: Poodle, Corgi, Mèo Anh lông ngắn..."
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              error={formErrors.breed}
            />

            <Input
              label="Cân nặng ước tính (kg)"
              type="number"
              step="0.1"
              placeholder="VD: 3.5"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ngày sinh hoặc Độ tuổi *"
              placeholder="VD: 15/05/2024 hoặc 2 tuổi"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              error={formErrors.dateOfBirth}
            />

            <Select
              label="Giới tính"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={GENDER_OPTIONS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mã định danh / Thẻ vòng cổ (Tag ID)"
              placeholder="VD: TAG-MILO-01"
              value={formData.idCard}
              onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
            />

            <Input
              label="SĐT liên hệ khi cần đón bé"
              placeholder="VD: 0901 234 567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <Textarea
            label="Lưu ý đặc biệt cho chuyên viên chăm sóc"
            placeholder="VD: Bé hơi nhát nước, thích tỉa gấu bông Teddy, đã tiêm vắc xin đầy đủ..."
            rows={3}
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsFormModalOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700 border-amber-600 text-white"
            >
              {formMode === 'add' ? 'Lưu hồ sơ bé cưng' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Chi tiết Thú cưng */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Chi tiết Hồ sơ bé "${selectedMember?.name}"`}
        size="md"
      >
        {selectedMember && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
              <div className="w-16 h-16 rounded-2xl bg-white border border-amber-200 flex items-center justify-center text-4xl shadow-xs">
                {selectedMember.petType === 'Mèo' || selectedMember.relationship === 'Mèo' ? '🐱' : '🐶'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedMember.name}</h3>
                <p className="text-slate-600 font-medium">{selectedMember.breed || 'Chưa rõ giống loài'}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="warning" size="sm">{selectedMember.petType || selectedMember.relationship || 'Chó'}</Badge>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-slate-700">Cân nặng: {selectedMember.weight || '3.5'} kg</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Giới tính</span>
                <span className="font-semibold text-slate-800">{selectedMember.gender || 'Đực'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Ngày sinh / Tuổi</span>
                <span className="font-semibold text-slate-800">{selectedMember.dateOfBirth || '--'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Mã thẻ vòng cổ</span>
                <span className="font-semibold text-slate-800">{selectedMember.idCard || 'Chưa gắn'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">SĐT chủ đón</span>
                <span className="font-semibold text-slate-800">{selectedMember.phone || currentUser?.phone || '--'}</span>
              </div>
            </div>

            {selectedMember.note && (
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold block mb-1">Ghi chú & Thói quen chăm sóc:</span>
                <p className="leading-relaxed">{selectedMember.note}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Đóng
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  navigate('/patient/book-appointment', {
                    state: { petId: selectedMember.id || selectedMember._id },
                  });
                }}
                className="bg-amber-600 hover:bg-amber-700 border-amber-600 text-white"
              >
                Đặt lịch Spa cho bé này
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Dialog Xác nhận Xóa */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Xóa hồ sơ thú cưng?"
        description={`Bạn có chắc chắn muốn xóa hồ sơ bé "${selectedMember?.name}" không? Thao tác này sẽ không thể khôi phục.`}
        confirmLabel="Xác nhận xóa"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
