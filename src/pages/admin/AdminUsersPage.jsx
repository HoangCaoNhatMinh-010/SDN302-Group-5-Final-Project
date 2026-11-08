import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Search, UserRound, UserRoundX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Button, Modal } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/adminService';
import { ROLE_LABELS, ROLES } from '../../utils/constants';

const ROLE_OPTIONS = [
  ROLES.PATIENT,
  ROLES.DOCTOR,
  ROLES.RECEPTIONIST,
  ROLES.CLINIC_MANAGER,
  ROLES.ADMIN,
];

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  title: '',
  role: ROLES.RECEPTIONIST,
  password: '',
};

const Field = ({ label, ...props }) => (
  <label className="block space-y-1.5">
    <span className="text-xs font-medium text-slate-700">{label}</span>
    <input
      {...props}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
    />
  </label>
);

export const AdminUsersPage = ({ mode = 'staff' }) => {
  const isRbacPage = mode === 'rbac';
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setError('');
    try {
      const response = await adminService.getUsers();
      setUsers(response.data || []);
    } catch (loadError) {
      setError(loadError.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    adminService.getUsers()
      .then((response) => {
        if (active) setUsers(response.data || []);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Không thể tải danh sách người dùng.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      if (!isRbacPage && user.role === ROLES.PATIENT) return false;
      return !query || [user.name, user.email, user.phone, user.role]
        .some((value) => String(value || '').toLowerCase().includes(query));
    });
  }, [users, isRbacPage, search]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      title: user.title || '',
      role: user.role,
      password: '',
    });
    setIsModalOpen(true);
  };

  const saveUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        await adminService.updateUser(editingUser.id, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          title: form.title,
        });
        toast.success('Đã cập nhật thông tin người dùng.');
      } else {
        await adminService.createUser(form);
        toast.success('Đã tạo tài khoản nhân viên.');
      }
      setIsModalOpen(false);
      setLoading(true);
      await loadUsers();
    } catch (saveError) {
      toast.error(saveError.message || 'Không thể lưu người dùng.');
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (user, role) => {
    if (user.role === role) return;
    if (!window.confirm(`Đổi vai trò của ${user.name} thành ${ROLE_LABELS[role]}?`)) return;
    try {
      const response = await adminService.updateUser(user.id, { role });
      setUsers((previous) => previous.map((item) => item.id === user.id ? response.data : item));
      toast.success('Đã cập nhật vai trò.');
    } catch (updateError) {
      toast.error(updateError.message || 'Không thể cập nhật vai trò.');
    }
  };

  const toggleActive = async (user) => {
    const nextActive = user.isActive === false;
    const action = nextActive ? 'kích hoạt' : 'vô hiệu hóa';
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản ${user.email}?`)) return;
    try {
      const response = await adminService.updateUser(user.id, { isActive: nextActive });
      setUsers((previous) => previous.map((item) => item.id === user.id ? response.data : item));
      toast.success(nextActive ? 'Đã kích hoạt tài khoản.' : 'Đã vô hiệu hóa tài khoản.');
    } catch (updateError) {
      toast.error(updateError.message || 'Không thể cập nhật trạng thái tài khoản.');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Quản trị' }, { label: isRbacPage ? 'Phân quyền RBAC' : 'Bác sĩ & Nhân viên' }]} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isRbacPage ? 'Phân quyền người dùng (RBAC)' : 'Quản lý Bác sĩ & Nhân viên'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isRbacPage
              ? 'Gán vai trò theo tài khoản. Không thể tự hạ quyền hoặc vô hiệu hóa admin cuối cùng.'
              : 'Tạo, cập nhật hồ sơ và quản lý trạng thái tài khoản nhân sự.'}
          </p>
        </div>
        {!isRbacPage && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/doctors')}>Danh bạ bác sĩ</Button>
            <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Thêm nhân viên</Button>
          </div>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo tên, email, số điện thoại hoặc role"
          className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
        />
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
          <button type="button" className="ml-3 font-semibold underline" onClick={() => { setLoading(true); loadUsers(); }}>Thử lại</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Người dùng</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Ngày tạo</th>
              {!isRbacPage && <th className="px-4 py-3 text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={isRbacPage ? 4 : 5}>Đang tải...</td></tr>
            ) : visibleUsers.length === 0 ? (
              <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={isRbacPage ? 4 : 5}>Không có người dùng phù hợp.</td></tr>
            ) : visibleUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}{user.phone ? ` · ${user.phone}` : ''}</div>
                </td>
                <td className="px-4 py-3">
                  {isRbacPage ? (
                    <select
                      value={user.role}
                      disabled={user.id === currentUser?.id || user._id === currentUser?.id}
                      onChange={(event) => changeRole(user, event.target.value)}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs disabled:bg-slate-100"
                      aria-label={`Vai trò của ${user.name}`}
                    >
                      {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
                    </select>
                  ) : <span>{ROLE_LABELS[user.role] || user.role}</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.isActive === false ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'}`}>
                    {user.isActive === false ? 'Đã khóa' : 'Đang hoạt động'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                </td>
                {!isRbacPage && (
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(user)} aria-label={`Sửa ${user.name}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={user.id === currentUser?.id || user._id === currentUser?.id}
                        onClick={() => toggleActive(user)}
                        aria-label={user.isActive === false ? `Kích hoạt ${user.name}` : `Vô hiệu hóa ${user.name}`}
                      >
                        {user.isActive === false ? <UserRound className="h-4 w-4" /> : <UserRoundX className="h-4 w-4" />}
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Cập nhật người dùng' : 'Tạo tài khoản nhân viên'}
        description="Mật khẩu ban đầu chỉ dùng để tạo tài khoản; người dùng có thể đổi sau khi đăng nhập."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" form="admin-user-form" isLoading={saving}>
              {editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </Button>
          </>
        }
      >
        <form id="admin-user-form" onSubmit={saveUser} className="grid gap-4 sm:grid-cols-2">
          <Field label="Họ và tên" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Field label="Email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <Field label="Số điện thoại" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <Field label="Chức danh" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          {!editingUser && (
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-slate-700">Vai trò</span>
              <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {ROLE_OPTIONS.filter((role) => role !== ROLES.PATIENT).map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
              </select>
            </label>
          )}
          {!editingUser && (
            <Field label="Mật khẩu khởi tạo (ít nhất 8 ký tự)" type="password" minLength={8} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          )}
        </form>
      </Modal>
    </div>
  );
};
