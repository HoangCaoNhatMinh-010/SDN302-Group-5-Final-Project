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
  consultationFee: 0,
  bio: '',
};

const DoctorField = ({ label, ...props }) => (
  <label className="block space-y-1.5">
    <span className="text-xs font-medium text-slate-700">{label}</span>
    <input {...props} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
  </label>
);

export const AdminDoctorsPage = () => {
  const toast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setError('');
    try {
      const [doctorResponse, specialtyResponse] = await Promise.all([
        adminService.getDoctors(),
        adminService.getSpecialties(),
      ]);
      setDoctors(doctorResponse.data || []);
      setSpecialties(specialtyResponse.data || []);
    } catch (loadError) {
      setError(loadError.message || 'Không thể tải danh sách bác sĩ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([adminService.getDoctors(), adminService.getSpecialties()])
      .then(([doctorResponse, specialtyResponse]) => {
        if (!active) return;
        setDoctors(doctorResponse.data || []);
        setSpecialties(specialtyResponse.data || []);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Không thể tải danh sách bác sĩ.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openCreate = () => {
    setEditingDoctor(null);
    setForm({ ...EMPTY_FORM, specialty: specialties[0]?.name || '' });
    setModalOpen(true);
  };

  const openEdit = (doctor) => {
    setEditingDoctor(doctor);
    setForm({
      name: doctor.name || '',
      specialty: doctor.specialty || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      title: doctor.title || '',
      department: doctor.department || '',
      room: doctor.room || '',
      experienceYears: doctor.experienceYears || 0,
      consultationFee: doctor.consultationFee || 0,
      bio: doctor.bio || '',
    });
    setModalOpen(true);
  };

  const saveDoctor = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        experienceYears: Number(form.experienceYears),
        consultationFee: Number(form.consultationFee),
      };
      if (editingDoctor) await adminService.updateDoctor(editingDoctor.id, payload);
      else await adminService.createDoctor(payload);
      toast.success(editingDoctor ? 'Đã cập nhật hồ sơ bác sĩ.' : 'Đã tạo hồ sơ bác sĩ.');
      setModalOpen(false);
      setLoading(true);
      await loadData();
    } catch (saveError) {
      toast.error(saveError.message || 'Không thể lưu hồ sơ bác sĩ.');
    } finally {
      setSaving(false);
    }
  };

  const deleteDoctor = async (doctor) => {
    if (!window.confirm(`Xóa hồ sơ ${doctor.name}? Bác sĩ có lịch hẹn đã gán sẽ không thể bị xóa.`)) return;
    try {
      await adminService.deleteDoctor(doctor.id);
      toast.success('Đã xóa hồ sơ bác sĩ.');
      setLoading(true);
      await loadData();
    } catch (deleteError) {
      toast.error(deleteError.message || 'Không thể xóa hồ sơ bác sĩ.');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Quản trị' }, { label: 'Bác sĩ & Nhân viên', path: '/admin/staff' }, { label: 'Danh bạ bác sĩ' }]} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh bạ bác sĩ</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý hồ sơ bác sĩ hiển thị trong danh sách đặt lịch.</p>
        </div>
        <Button onClick={openCreate} disabled={specialties.length === 0} leftIcon={<Plus className="h-4 w-4" />}>Thêm bác sĩ</Button>
      </div>
      {specialties.length === 0 && !loading && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Cần tạo chuyên khoa trước khi thêm hồ sơ bác sĩ.</p>}
      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}<button type="button" className="ml-3 underline" onClick={() => { setLoading(true); loadData(); }}>Thử lại</button></div>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Bác sĩ</th><th className="px-4 py-3">Chuyên khoa</th><th className="px-4 py-3">Phòng</th><th className="px-4 py-3">Phí khám</th><th className="px-4 py-3 text-right">Thao tác</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">Đang tải...</td></tr>
              : doctors.length === 0 ? <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">Chưa có hồ sơ bác sĩ.</td></tr>
                : doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td className="px-4 py-3"><div className="font-medium text-slate-900">{doctor.name}</div><div className="text-xs text-slate-500">{doctor.email || 'Chưa có email'} · {doctor.phone || 'Chưa có SĐT'}</div></td>
                    <td className="px-4 py-3">{doctor.specialty}</td>
                    <td className="px-4 py-3">{doctor.room || '—'}</td>
                    <td className="px-4 py-3">{Number(doctor.consultationFee || 0).toLocaleString('vi-VN')} ₫</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => openEdit(doctor)} aria-label={`Sửa ${doctor.name}`}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="danger" size="sm" onClick={() => deleteDoctor(doctor)} aria-label={`Xóa ${doctor.name}`}><Trash2 className="h-4 w-4" /></Button>
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
        title={editingDoctor ? 'Cập nhật hồ sơ bác sĩ' : 'Tạo hồ sơ bác sĩ'}
        footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit" form="admin-doctor-form" isLoading={saving}>Lưu</Button></>}
      >
        <form id="admin-doctor-form" onSubmit={saveDoctor} className="grid gap-4 sm:grid-cols-2">
          <DoctorField label="Họ và tên" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-700">Chuyên khoa</span>
            <select required value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">Chọn chuyên khoa</option>
              {specialties.map((specialty) => <option key={specialty.id} value={specialty.name}>{specialty.name}</option>)}
            </select>
          </label>
          <DoctorField label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <DoctorField label="Số điện thoại" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <DoctorField label="Chức danh" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <DoctorField label="Khoa / bộ phận" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} />
          <DoctorField label="Phòng khám" value={form.room} onChange={(event) => setForm({ ...form, room: event.target.value })} />
          <DoctorField label="Số năm kinh nghiệm" type="number" min="0" value={form.experienceYears} onChange={(event) => setForm({ ...form, experienceYears: event.target.value })} />
          <DoctorField label="Phí khám (VND)" type="number" min="0" value={form.consultationFee} onChange={(event) => setForm({ ...form, consultationFee: event.target.value })} />
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-slate-700">Giới thiệu</span>
            <textarea rows={3} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
        </form>
      </Modal>
    </div>
  );
};
