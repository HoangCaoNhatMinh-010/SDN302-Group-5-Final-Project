import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  X,
  Edit3,
  KeyRound,
  CheckCircle,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { profileService } from '../../services/profileService';
import { ROLE_LABELS } from '../../utils/constants';
import {
  Breadcrumb,
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Avatar,
  Badge,
  Dialog,
} from '../../components/common';

export const ProfilePage = () => {
  const { currentUser, role, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State initialized with currentUser
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Nam',
    address: '',
    avatar: '',
  });

  const [initialData, setInitialData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentUser) {
      const data = {
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        dateOfBirth: currentUser.dateOfBirth || '',
        gender: currentUser.gender || 'Nam',
        address: currentUser.address || '',
        avatar: currentUser.avatar || '',
      };
      setFormData(data);
      setInitialData(data);
    }
  }, [currentUser]);

  // Check if form was modified
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };

  const handleCancelClick = () => {
    if (hasChanges()) {
      setIsDiscardDialogOpen(true);
    } else {
      setIsEditing(false);
    }
  };

  const confirmDiscard = () => {
    setFormData(initialData);
    setErrors({});
    setIsEditing(false);
    setIsDiscardDialogOpen(false);
    toast.info('Đã hủy các thay đổi chưa lưu');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Họ và tên không được để trống';
    if (!formData.email.trim()) newErrors.email = 'Email không được để trống';
    if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại không được để trống';
    if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = 'Ngày sinh không được để trống';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await profileService.updateProfile(currentUser?.id, formData);
      // Update AuthContext so Header & Sidebar reflect changes immediately
      updateCurrentUser(formData);
      setInitialData(formData);
      setIsEditing(false);
      toast.success('Đã cập nhật thông tin hồ sơ cá nhân thành công!');
    } catch (err) {
      toast.error(err.message || 'Không thể lưu hồ sơ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Hồ sơ cá nhân' }]} />

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hồ sơ cá nhân</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý thông tin định danh, tài khoản liên hệ và bảo mật
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<KeyRound className="w-4 h-4 text-slate-600" />}
            onClick={() => navigate('/profile/change-password')}
          >
            Đổi mật khẩu
          </Button>

          {!isEditing ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => setIsEditing(true)}
            >
              Chỉnh sửa hồ sơ
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<X className="w-4 h-4" />}
                onClick={handleCancelClick}
                disabled={isLoading}
              >
                Hủy chỉnh sửa
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Save className="w-4 h-4" />}
                onClick={handleSave}
                isLoading={isLoading}
              >
                Lưu thay đổi
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <Avatar
                src={formData.avatar}
                name={formData.name}
                size="xl"
                status="online"
              />
              {isEditing && (
                <button
                  type="button"
                  title="Thay đổi ảnh đại diện (Demo)"
                  onClick={() => toast.info('Chức năng tải ảnh đại diện sẽ được tích hợp trong bước kế tiếp.')}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary-600 text-white shadow-md hover:bg-primary-700 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 truncate">{formData.name}</h2>
                <Badge variant="primary" size="sm">
                  {ROLE_LABELS[role] || 'Thành viên'}
                </Badge>
              </div>

              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span>{formData.email}</span>
                <span>•</span>
                <span>{formData.phone}</span>
              </p>

              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium border border-slate-200">
                  {currentUser?.patientCode || currentUser?.department || 'Tài khoản hoạt động'}
                </span>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-medium border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Đã xác thực danh tính
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Profile Form */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Thông tin chi tiết</CardTitle>
            <CardDescription>
              {isEditing
                ? 'Đang ở chế độ chỉnh sửa. Thay đổi thông tin và nhấn Lưu thay đổi.'
                : 'Thông tin cá nhân đã được lưu trên hệ thống PawCare Studio.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Họ và tên"
                required
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="Địa chỉ Email"
                type="email"
                required
                disabled={!isEditing}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Số điện thoại"
                required
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={errors.phone}
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Ngày sinh"
                required
                disabled={!isEditing}
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                error={errors.dateOfBirth}
                placeholder="DD/MM/YYYY"
                leftIcon={<Calendar className="w-4 h-4" />}
              />

              <Select
                label="Giới tính"
                disabled={!isEditing}
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                options={[
                  { value: 'Nam', label: 'Nam' },
                  { value: 'Nữ', label: 'Nữ' },
                  { value: 'Khác', label: 'Khác' },
                ]}
              />
            </div>

            <div>
              <Input
                label="Địa chỉ cư trú"
                disabled={!isEditing}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                leftIcon={<MapPin className="w-4 h-4" />}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
              />
            </div>

            {isEditing && (
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleCancelClick}
                  disabled={isLoading}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Lưu thay đổi
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Discard Confirmation Dialog */}
      <Dialog
        isOpen={isDiscardDialogOpen}
        onClose={() => setIsDiscardDialogOpen(false)}
        onConfirm={confirmDiscard}
        title="Hủy các thay đổi?"
        message="Bạn có những thông tin vừa sửa đổi chưa được lưu. Bạn có chắc chắn muốn hủy bỏ các thay đổi này?"
        confirmText="Hủy thay đổi"
        cancelText="Tiếp tục sửa"
        variant="danger"
      />
    </div>
  );
};
