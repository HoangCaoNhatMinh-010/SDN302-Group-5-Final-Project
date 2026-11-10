import React, { useCallback, useEffect, useState } from 'react';
import { Breadcrumb } from '../../components/common';
import { adminService } from '../../services/adminService';
import { ROLE_LABELS } from '../../utils/constants';

const MetricCard = ({ title, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <p className="text-sm text-slate-500">{title}</p>
    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

export const AdminReportsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = useCallback(async () => {
    setError('');
    try {
      const response = await adminService.getReports();
      setReport(response.data);
    } catch (loadError) {
      setError(loadError.message || 'Không thể tải báo cáo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    adminService.getReports()
      .then((response) => {
        if (active) setReport(response.data);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Không thể tải báo cáo.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Quản trị' }, { label: 'Báo cáo' }]} />
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Báo cáo & Thống kê hệ thống</h1>
        <p className="mt-1 text-sm text-slate-500">Số liệu tổng hợp trực tiếp từ người dùng, lịch hẹn và chuyên khoa trong cơ sở dữ liệu.</p>
      </div>
      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}<button type="button" className="ml-3 underline" onClick={() => { setLoading(true); loadReport(); }}>Thử lại</button></div>}
      {loading ? <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Đang tải báo cáo...</div> : report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Hồ sơ chủ thú cưng" value={report.ownerCount} />
            <MetricCard title="Tổng lịch hẹn" value={report.appointmentCount} />
            <MetricCard title="Chuyên khoa / dịch vụ" value={report.specialtyCount} />
            <MetricCard title="Nhóm trạng thái lịch hẹn" value={report.appointmentsByStatus.length} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="font-semibold text-slate-900">Người dùng theo vai trò</h2>
              <div className="mt-4 space-y-3">
                {report.usersByRole.map((item) => (
                  <div key={item._id} className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm last:border-0">
                    <span className="text-slate-600">{ROLE_LABELS[item._id] || item._id}</span>
                    <span className="font-semibold text-slate-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="font-semibold text-slate-900">Lịch hẹn theo trạng thái</h2>
              <div className="mt-4 space-y-3">
                {report.appointmentsByStatus.map((item) => (
                  <div key={item._id} className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm last:border-0">
                    <span className="text-slate-600">{item._id}</span>
                    <span className="font-semibold text-slate-900">{item.count}</span>
                  </div>
                ))}
                {report.appointmentsByStatus.length === 0 && <p className="text-sm text-slate-500">Chưa có dữ liệu lịch hẹn.</p>}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};
