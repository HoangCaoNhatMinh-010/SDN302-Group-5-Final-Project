import React, { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Breadcrumb, Button, Modal } from '../../components/common';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/adminService';

const EMPTY_FORM = {
  name: '',
  specialty: '',
  email: '',
  phone: '',
  title: '',
  department: '',
  room: '',
  experienceYears: 0,
  bio: '',
};

const GroomerField = ({ label, ...props }) => (
  <label className="block space-y-1.5">
    <span className="text-xs font-medium text-slate-700">{label}</span>
    <input {...props} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
  </label>
);

export const AdminGroomersPage = () => {
  const toast = useToast();
  const [groomers, setGroomers] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroomer, setEditingGroomer] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const getServicePriceLabel = (serviceName) => {
    const service = specialties.find((item) => item.name === serviceName);
    return service ? `${Number(service.price).toLocaleString('vi-VN')} ₫` : '—';
  };

  const loadData = useCallback(async () => {
    setError('');
    try {
      const [groomerResponse, specialtyResponse] = await Promise.all([
        adminService.getGroomers(),
        adminService.getSpecialties(),
      ]);
      setGroomers(groomerResponse.data || []);
      setSpecialties(specialtyResponse.data || []);
    } catch (loadError) {
      setError(loadError.message || 'Không thể tải danh sách chuyên viên.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([adminService.getGroomers(), adminService.getSpecialties()])
      .then(([groomerResponse, specialtyResponse]) => {
        if (!active) return;
        setGroomers(groomerResponse.data || []);
        setSpecialties(specialtyResponse.data || []);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Không thể tải danh sách chuyên viên.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openCreate = () => {
    setEditingGroomer(null);
    setForm({ ...EMPTY_FORM, specialty: specialties[0]?.name || '' });
    setModalOpen(true);
  };

  const openEdit = (groomer) => {
    setEditingGroomer(groomer);
    setForm({
      name: groomer.name || '',
      specialty: groomer.specialty || '',
      email: groomer.email || '',
      phone: groomer.phone || '',
      title: groomer.title || '',
      department: groomer.department || '',
      room: groomer.room || '',
      experienceYears: groomer.experienceYears || 0,
      bio: groomer.bio || '',
    });
    setModalOpen(true);
  };

  const saveGroomer = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        experienceYears: Number(form.experienceYears),
      };
      if (editingGroomer) await adminService.updateGroomer(editingGroomer.id, payload);
      else await adminService.createGroomer(payload);
      toast.success(editingGroomer ? 'Đã cập nhật hồ sơ chuyên viên.' : 'Đã tạo hồ sơ chuyên viên.');
      setModalOpen(false);
      setLoading(true);
      await loadData();
    } catch (saveError) {
      toast.error(saveError.message || 'Không thể lưu hồ sơ chuyên viên.');
    } finally {
      setSaving(false);
    }
  };

  const deleteGroomer = async (groomer) => {
    if (!window.confirm(`Xóa hồ sơ ${groomer.name}? Chuyên viên có lịch hẹn đã gán sẽ không thể bị xóa.`)) return;
    try {
      await adminService.deleteGroomer(groomer.id);
      toast.success('Đã xóa hồ sơ chuyên viên.');
      setLoading(true);
      await loadData();
    } catch (deleteError) {
      toast.error(deleteError.message || 'Không thể xóa hồ sơ chuyên viên.');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Quản trị' }, { label: 'Nhân viên', path: '/admin/staff' }, { label: 'Đội ngũ chăm sóc' }]} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Đội ngũ chăm sóc</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý hồ sơ chuyên viên hiển thị trong luồng đặt lịch dịch vụ.</p>
        </div>
        <Button onClick={openCreate} disabled={specialties.length === 0} leftIcon={<Plus className="h-4 w-4" />}>Thêm chuyên viên</Button>
      </div>
      {specialties.length === 0 && !loading && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Cần tạo dịch vụ trước khi thêm hồ sơ chuyên viên.</p>}
      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}<button type="button" className="ml-3 underline" onClick={() => { setLoading(true); loadData(); }}>Thử lại</button></div>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Chuyên viên</th><th className="px-4 py-3">Dịch vụ</th><th className="px-4 py-3">Khu vực</th><th className="px-4 py-3">Giá dịch vụ</th><th className="px-4 py-3 text-right">Thao tác</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">Đang tải...</td></tr>
              : groomers.length === 0 ? <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">Chưa có hồ sơ chuyên viên.</td></tr>
                : groomers.map((groomer) => (
                  <tr key={groomer.id}>
                    <td className="px-4 py-3"><div className="font-medium text-slate-900">{groomer.name}</div><div className="text-xs text-slate-500">{groomer.email || 'Chưa có email'} · {groomer.phone || 'Chưa có SĐT'}</div></td>
                    <td className="px-4 py-3">{groomer.specialty}</td>
                    <td className="px-4 py-3">{groomer.room || '—'}</td>
                    <td className="px-4 py-3">{getServicePriceLabel(groomer.specialty)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => openEdit(groomer)} aria-label={`Sửa ${groomer.name}`}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="danger" size="sm" onClick={() => deleteGroomer(groomer)} aria-label={`Xóa ${groomer.name}`}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGroomer ? 'Cập nhật hồ sơ chuyên viên' : 'Tạo hồ sơ chuyên viên'}
        footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit" form="admin-groomer-form" isLoading={saving}>Lưu</Button></>}
      >
        <form id="admin-groomer-form" onSubmit={saveGroomer} className="grid gap-4 sm:grid-cols-2">
          <GroomerField label="Họ và tên" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-700">Dịch vụ phụ trách</span>
            <select required value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">Chọn dịch vụ</option>
              {specialties.map((specialty) => <option key={specialty.id} value={specialty.name}>{specialty.name}</option>)}
            </select>
          </label>
          <GroomerField label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <GroomerField label="Số điện thoại" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <GroomerField label="Chức danh" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <GroomerField label="Nhóm chuyên viên" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} />
          <GroomerField label="Khu vực phục vụ" value={form.room} onChange={(event) => setForm({ ...form, room: event.target.value })} />
          <GroomerField label="Số năm kinh nghiệm" type="number" min="0" value={form.experienceYears} onChange={(event) => setForm({ ...form, experienceYears: event.target.value })} />
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-slate-700">Giới thiệu</span>
            <textarea rows={3} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
        </form>
      </Modal>
    </div>
  );
};
