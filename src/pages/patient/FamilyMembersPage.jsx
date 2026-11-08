import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Heart,
  Phone,
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
  Eye,
  CheckCircle2,
  Shield,
  User,
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
  Avatar,
  Badge,
  Modal,
  Dialog,
  EmptyState,
  LoadingState,
} from '../../components/common';

const RELATIONSHIP_OPTIONS = [
  { value: 'Bố', label: 'Bố (Cha)' },
  { value: 'Mẹ', label: 'Mẹ' },
  { value: 'Vợ/chồng', label: 'Vợ / Chồng' },
  { value: 'Con', label: 'Con (Trai / Gái)' },
  { value: 'Anh/chị/em', label: 'Anh / Chị / Em' },
  { value: 'Người thân khác', label: 'Người thân khác' },
];

export const FamilyMembersPage = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Selected Member for Edit / View / Delete
  const [selectedMember, setSelectedMember] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'Bố',
    dateOfBirth: '',
    gender: 'Nam',
    phone: '',
    address: '',
    idCard: '',
    note: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load family members on mount
  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const res = await familyMemberService.getFamilyMembers(currentUser?.id);
      setMembers(res.data || []);
    } catch (err) {
      toast.error('Không thể tải danh sách người thân.');
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
      relationship: 'Bố',
      dateOfBirth: '',
      gender: 'Nam',
      phone: '',
      address: currentUser?.address || '',
      idCard: '',
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
      relationship: member.relationship || 'Bố',
      dateOfBirth: member.dateOfBirth || '',
      gender: member.gender || 'Nam',
      phone: member.phone || '',
      address: member.address || '',
      idCard: member.idCard || '',
      note: member.note || '',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetailModal = (member) => {
    setSelectedMember(member);
    setIsDetailModalOpen(true);
  };

  // Open Delete Dialog
  const handleOpenDeleteDialog = (member) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  // Form Validation
  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Vui lòng nhập họ và tên';
    if (!formData.relationship) errs.relationship = 'Vui lòng chọn mối quan hệ';
    if (!formData.dateOfBirth.trim()) errs.dateOfBirth = 'Vui lòng nhập ngày sinh';
    if (!formData.gender) errs.gender = 'Vui lòng chọn giới tính';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Form Submit (Add or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (formMode === 'add') {
        const res = await familyMemberService.createFamilyMember(formData, currentUser?.id);
        toast.success(res.message);
      } else {
        const res = await familyMemberService.updateFamilyMember(selectedMember.id, formData);
        toast.success(res.message);
      }
      setIsFormModalOpen(false);
      await loadMembers();
    } catch (err) {
      toast.error(err.message || 'Thao tác không thành công.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedMember) return;
    setIsSubmitting(true);
    try {
      const res = await familyMemberService.deleteFamilyMember(selectedMember.id);
      toast.success(res.message);
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
      await loadMembers();
    } catch (err) {
      toast.error(err.message || 'Không thể xóa hồ sơ người thân.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Quản lý người thân' }]} />

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý người thân</h1>
          <p className="mt-1 text-sm text-slate-500">
            Khai báo và liên kết hồ sơ người thân để đặt lịch khám hộ và theo dõi sức khỏe gia đình
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
          >
            Thêm hồ sơ người thân
          </Button>
        </div>
      </div>

      {/* 1. Account Owner Badge Card (Clearly distinguish Account Owner vs Family) */}
      <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            src={currentUser?.avatar}
            name={currentUser?.name}
            size="lg"
            status="online"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">{currentUser?.name}</h3>
              <Badge variant="primary" size="sm">
                Chủ tài khoản
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Mã hồ sơ gốc: <span className="font-mono font-semibold">{currentUser?.patientCode || 'BN-2026-0892'}</span> • {currentUser?.phone}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 bg-white/80 rounded-lg p-2.5 border border-sky-100 sm:text-right">
          <span>Người đại diện hợp pháp quản lý lịch khám gia đình</span>
        </div>
      </div>

      {/* 2. Family Members List / Cards */}
      {isLoading ? (
        <LoadingState message="Đang tải danh sách người thân..." />
      ) : members.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-primary-500" />}
          title="Chưa có hồ sơ người thân"
          description="Bạn chưa liên kết hồ sơ người thân nào. Hãy thêm hồ sơ để có thể đặt lịch khám bệnh hộ cho bố, mẹ, con cái hoặc người thân trong gia đình."
          actionLabel="Thêm người thân ngay"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member) => (
            <Card key={member.id} hover className="flex flex-col justify-between overflow-hidden">
              <CardContent className="p-5">
                {/* Header of Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200 flex items-center justify-center text-sm shadow-xs">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {member.name}
                      </h4>
                      <Badge variant="secondary" size="sm" className="mt-1">
                        {member.relationship}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Details list */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-2 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>
                      {member.dateOfBirth} ({member.gender})
                    </span>
                  </div>

                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  )}

                  {member.address && (
                    <div className="flex items-center gap-2 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{member.address}</span>
                    </div>
                  )}

                  {member.note && (
                    <div className="p-2 rounded bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 mt-2">
                      <span className="font-semibold">Ghi chú y tế:</span> {member.note}
                    </div>
                  )}
                </div>
              </CardContent>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                  onClick={() => handleOpenDetailModal(member)}
                >
                  Xem chi tiết
                </Button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(member)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-white transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDeleteDialog(member)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white transition-colors"
                    title="Xóa hồ sơ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT FAMILY MEMBER ================= */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={formMode === 'add' ? 'Thêm hồ sơ người thân' : 'Chỉnh sửa hồ sơ người thân'}
        description="Thông tin này sẽ được dùng để đăng ký khám bệnh và lưu hồ sơ y tế."
        maxWidth="max-w-lg"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsFormModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleFormSubmit}
              isLoading={isSubmitting}
            >
              {formMode === 'add' ? 'Thêm người thân' : 'Lưu thay đổi'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Họ và tên người thân"
            required
            placeholder="Ví dụ: Nguyễn Văn Hùng"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            leftIcon={<User className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Mối quan hệ"
              required
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              error={formErrors.relationship}
              options={RELATIONSHIP_OPTIONS}
            />

            <Select
              label="Giới tính"
              required
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              error={formErrors.gender}
              options={[
                { value: 'Nam', label: 'Nam' },
                { value: 'Nữ', label: 'Nữ' },
                { value: 'Khác', label: 'Khác' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ngày sinh"
              required
              placeholder="DD/MM/YYYY"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              error={formErrors.dateOfBirth}
              leftIcon={<Calendar className="w-4 h-4" />}
            />

            <Input
              label="Số điện thoại liên hệ"
              placeholder="Ví dụ: 0903111222"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Địa chỉ cư trú"
            placeholder="Địa chỉ hiện tại"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            leftIcon={<MapPin className="w-4 h-4" />}
          />

          <Input
            label="Số CMND/CCCD hoặc Thẻ BHYT (nếu có)"
            placeholder="Ví dụ: 079058001234"
            value={formData.idCard}
            onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
          />

          <Textarea
            label="Ghi chú sức khỏe / Dị ứng thuốc"
            rows={2}
            placeholder="Tiền sử dị ứng thuốc, bệnh lý mạn tính..."
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          />
        </form>
      </Modal>

      {/* ================= MODAL: DETAIL VIEW ================= */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết hồ sơ người thân"
        maxWidth="max-w-md"
        footer={
          <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>
        }
      >
        {selectedMember && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-base">
                {selectedMember.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{selectedMember.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" size="sm">
                    {selectedMember.relationship}
                  </Badge>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">{selectedMember.gender}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Ngày sinh:</span>
                <span className="font-medium">{selectedMember.dateOfBirth}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Số điện thoại:</span>
                <span className="font-medium">{selectedMember.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">CMND / BHYT:</span>
                <span className="font-mono font-medium">{selectedMember.idCard || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Địa chỉ:</span>
                <span className="font-medium text-right max-w-[200px]">{selectedMember.address || 'Chưa cập nhật'}</span>
              </div>
              {selectedMember.note && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 mt-2">
                  <p className="font-bold mb-0.5">Tiền sử y tế / Dị ứng:</p>
                  <p>{selectedMember.note}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ================= DIALOG: CONFIRM DELETE ================= */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa hồ sơ người thân"
        message={`Bạn có chắc chắn muốn xóa hồ sơ người thân "${selectedMember?.name}" (${selectedMember?.relationship}) khỏi danh sách? Thao tác này không thể hoàn tác.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};
