import React, { useCallback, useEffect, useState } from 'react';
import { Breadcrumb, Button } from '../../components/common';
import { adminService } from '../../services/adminService';

const PAGE_SIZE = 25;

export const AdminAuditLogsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [result, setResult] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = useCallback(async () => {
    setError('');
    try {
      const response = await adminService.getAuditLogs({
        page,
        limit: PAGE_SIZE,
        q: search.trim(),
        category,
      });
      setResult(response.data || { items: [], total: 0 });
    } catch (loadError) {
      setError(loadError.message || 'Không thể tải audit log.');
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    let active = true;
    adminService.getAuditLogs({
      page,
      limit: PAGE_SIZE,
      q: search.trim(),
      category,
    })
      .then((response) => {
        if (active) setResult(response.data || { items: [], total: 0 });
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Không thể tải audit log.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, search, category]);

  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Quản trị' }, { label: 'Audit log' }]} />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nhật ký hoạt động hệ thống</h1>
        <p className="mt-1 text-sm text-slate-500">Theo dõi các thay đổi quản trị được lưu từ API.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input value={search} onChange={(event) => { setLoading(true); setPage(1); setSearch(event.target.value); }} placeholder="Tìm thao tác, người thực hiện hoặc đối tượng" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <select value={category} onChange={(event) => { setLoading(true); setPage(1); setCategory(event.target.value); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">Tất cả nhóm</option>
          {['staff', 'rbac', 'services', 'slot-config', 'policies', 'consent', 'integrations', 'reminders'].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>
      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}<button type="button" className="ml-3 underline" onClick={() => { setLoading(true); loadLogs(); }}>Thử lại</button></div>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Thời gian</th><th className="px-4 py-3">Hành động</th><th className="px-4 py-3">Người thực hiện</th><th className="px-4 py-3">Đối tượng</th><th className="px-4 py-3">Chi tiết</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">Đang tải...</td></tr>
              : result.items.length === 0 ? <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">Chưa có bản ghi phù hợp.</td></tr>
                : result.items.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3"><span className="font-medium text-slate-800">{log.action}</span><div className="text-xs text-slate-500">{log.category}</div></td>
                    <td className="px-4 py-3"><div>{log.actorName}</div><div className="text-xs text-slate-500">{log.actorEmail}</div></td>
                    <td className="px-4 py-3 text-slate-600">{log.target || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{log.details || '—'}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>{result.total} bản ghi · trang {page}/{totalPages}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => { setLoading(true); setPage((value) => value - 1); }}>Trước</Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => { setLoading(true); setPage((value) => value + 1); }}>Sau</Button>
        </div>
      </div>
    </div>
  );
};
