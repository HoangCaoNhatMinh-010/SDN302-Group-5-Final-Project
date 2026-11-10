import React, { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Breadcrumb, Button, Modal } from '../../components/common';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/adminService';

const SECTION_INFO = {
  services: { title: 'Quản lý dịch vụ chăm sóc', description: 'Quản lý gói Spa & Grooming, giá và khu vực phục vụ.' },
  'slot-config': { title: 'Cấu hình khung giờ dịch vụ', description: 'Lưu cấu hình thời lượng dịch vụ, khung giờ và giới hạn đặt lịch.' },
  policies: { title: 'Chính sách cửa hàng', description: 'Quản lý các chính sách và quy định vận hành cửa hàng.' },
  consent: { title: 'Điều khoản & Consent', description: 'Quản lý nội dung chấp thuận và phiên bản điều khoản.' },
  integrations: { title: 'Tích hợp dịch vụ cửa hàng', description: 'Quản lý metadata cấu hình tích hợp. Kết nối thật cần API và thông tin xác thực riêng.' },
  reminders: { title: 'Nhắc hẹn tự động', description: 'Quản lý cấu hình mẫu và thời điểm gửi nhắc hẹn.' },
};

const emptyForm = { name: '', description: '', configText: '{}', enabled: true };

export const AdminSettingsPage = ({ section }) => {
  const toast = useToast();
  const info = SECTION_INFO[section];
  const isServices = section === 'services';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    setError('');
    try {
      const response = isServices
        ? await adminService.getSpecialties()
        : await adminService.getSettings(section);
      setItems(response.data || []);
    } catch (loadError) {
      setError(loadError.message || 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [isServices, section]);

  useEffect(() => {
    let active = true;
    const request = isServices
      ? adminService.getSpecialties()
      : adminService.getSettings(section);
    request
      .then((response) => {
        if (active) setItems(response.data || []);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Không thể tải dữ liệu.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isServices, section]);

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    const config = isServices
      ? {
        price: item.price ?? 0,
        durationMinutes: item.durationMinutes ?? 60,
        species: item.species || ['Chó', 'Mèo', 'Khác'],
        room: item.room || '',
        icon: item.icon || 'Activity',
      }
      : item.config || {};
    setForm({
      name: item.name || '',
      description: item.description || '',
      configText: JSON.stringify(config, null, 2),
      enabled: item.enabled !== false,
    });
    setModalOpen(true);
  };

  const saveItem = async (event) => {
    event.preventDefault();
    let config;
    try {
      config = JSON.parse(form.configText);
      if (!config || Array.isArray(config) || typeof config !== 'object') {
        throw new Error('Cấu hình phải là một đối tượng JSON.');
      }
    } catch (parseError) {
      toast.error(parseError.message || 'JSON cấu hình không hợp lệ.');
      return;
    }

    setSaving(true);
    try {
      let payload;
      if (isServices) {
        const price = Number(config.price);
        if (!Number.isFinite(price) || price < 0) {
          throw new Error('Giá dịch vụ phải là số không âm (price).');
        }
        const durationMinutes = Number(config.durationMinutes);
        if (!Number.isInteger(durationMinutes) || durationMinutes < 15) {
          throw new Error('Thời lượng dịch vụ phải từ 15 phút trở lên (durationMinutes).');
        }
        if (!Array.isArray(config.species)) {
          throw new Error('Loài áp dụng phải là danh sách (species).');
        }
        payload = {
          name: form.name,
          description: form.description,
          price,
          durationMinutes,
          species: config.species,
          room: typeof config.room === 'string' ? config.room : '',
          icon: typeof config.icon === 'string' ? config.icon : 'Activity',
        };
        if (editingItem) await adminService.updateSpecialty(editingItem.id, payload);
        else await adminService.createSpecialty(payload);
      } else {
        payload = { ...form, config };
        delete payload.configText;
        if (editingItem) await adminService.updateSetting(section, editingItem.id, payload);
        else await adminService.createSetting(section, payload);
      }
      toast.success(editingItem ? 'Đã cập nhật cấu hình.' : 'Đã tạo cấu hình.');
      setModalOpen(false);
      setLoading(true);
      await loadItems();
    } catch (saveError) {
      toast.error(saveError.message || 'Không thể lưu dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Xóa "${item.name}"? Thao tác này không thể hoàn tác.`)) return;
    try {
      if (isServices) await adminService.deleteSpecialty(item.id);
      else await adminService.deleteSetting(section, item.id);
      toast.success('Đã xóa mục đã chọn.');
      setLoading(true);
      await loadItems();
    } catch (deleteError) {
      toast.error(deleteError.message || 'Không thể xóa mục đã chọn.');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Quản trị' }, { label: info.title }]} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{info.title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">{info.description}</p>
        </div>
        <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Thêm mới</Button>
      </div>

      {section === 'integrations' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Không lưu mật khẩu, token hoặc khóa bí mật tại đây. Màn hình này chỉ lưu cấu hình mô tả; cần triển khai API riêng để kết nối thực tế với các dịch vụ cửa hàng.
        </div>
      )}
      {error && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
          <button type="button" className="ml-3 font-semibold underline" onClick={() => { setLoading(true); loadItems(); }}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Đang tải dữ liệu...</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Chưa có mục nào. Chọn “Thêm mới” để bắt đầu.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const config = isServices
              ? {
                price: item.price,
                durationMinutes: item.durationMinutes,
                species: item.species,
                room: item.room,
                icon: item.icon,
              }
              : item.config;
            return (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900">{item.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{item.description || 'Không có mô tả.'}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${item.enabled === false ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'}`}>
                    {item.enabled === false ? 'Tắt' : 'Bật'}
                  </span>
                </div>
                <pre className="mt-4 max-h-36 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{JSON.stringify(config || {}, null, 2)}</pre>
                {item.updatedAt && <p className="mt-3 text-[11px] text-slate-400">Cập nhật: {new Date(item.updatedAt).toLocaleString('vi-VN')}</p>}
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(item)} leftIcon={<Pencil className="h-3.5 w-3.5" />}>Sửa</Button>
                  <Button variant="danger" size="sm" onClick={() => deleteItem(item)} leftIcon={<Trash2 className="h-3.5 w-3.5" />}>Xóa</Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Cập nhật' : 'Tạo mới'}
        description={isServices ? 'Nhập cấu hình dịch vụ dạng JSON, gồm giá, thời lượng, loài áp dụng và khu vực phục vụ.' : 'Cấu hình được xác thực và lưu trong cơ sở dữ liệu.'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit" form="admin-setting-form" isLoading={saving}>Lưu</Button>
          </>
        }
      >
        <form id="admin-setting-form" onSubmit={saveItem} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-700">Tên</span>
            <input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-700">Mô tả</span>
            <textarea rows={2} maxLength={1000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-700">Cấu hình JSON</span>
            <textarea required rows={8} spellCheck="false" value={form.configText} onChange={(event) => setForm({ ...form, configText: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs" />
          </label>
          {!isServices && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.enabled} onChange={(event) => setForm({ ...form, enabled: event.target.checked })} />
              Đang bật
            </label>
          )}
        </form>
      </Modal>
    </div>
  );
};
