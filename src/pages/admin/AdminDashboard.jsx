import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Sliders,
  History,
  Key,
  Server,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import {
  Breadcrumb,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from '../../components/common';

export const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    adminService.getSummary()
      .then((response) => {
        if (active) setSummary(response.data);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Không thể tải dữ liệu quản trị.');
      });
    return () => {
      active = false;
    };
  }, []);

  const staffCount = (summary?.staffByRole || [])
    .reduce((total, item) => total + item.count, 0);
  const ownerCount = summary?.ownerCount || 0;
  const auditEvents = summary?.recentAuditLogs || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Quản trị hệ thống' }]} />

      {/* 1. Admin Welcome Card */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm mb-3">
              <Server className="w-3.5 h-3.5 text-indigo-300" />
              <span>{summary ? 'Dữ liệu quản trị trực tiếp' : 'Đang tải dữ liệu hệ thống'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Quản trị hệ thống
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Cổng quản trị PawCare Studio dành cho {currentUser?.name || 'Quản trị viên'}. Quản lý khách hàng, đội ngũ chăm sóc, dịch vụ, khung giờ đặt lịch và hoạt động hệ thống.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="light"
              size="md"
              leftIcon={<Users className="w-4 h-4 text-slate-900" />}
              onClick={() => navigate('/admin/staff')}
              className="bg-white text-slate-900 hover:bg-slate-100 border-0 shadow-sm"
            >
              Đội ngũ chăm sóc & Nhân viên
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Sliders className="w-4 h-4 text-white" />}
              onClick={() => navigate('/admin/slot-config')}
              className="border-white/40 text-white hover:bg-white/10"
            >
              Cấu hình slot
            </Button>
            <Button
              variant="ghost"
              size="md"
              leftIcon={<Key className="w-4 h-4 text-white" />}
              onClick={() => navigate('/admin/rbac')}
              className="text-white hover:bg-white/10"
            >
              RBAC
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* 2. Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Nhân viên & chuyên viên"
          value={summary ? staffCount : '—'}
          trend={summary ? `${ownerCount} chủ thú cưng` : 'Đang tải'}
          trendType="neutral"
          trendLabel="Nhân viên đang hoạt động"
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          iconColor="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Dịch vụ chăm sóc"
          value={summary ? summary.specialtyCount : '—'}
          trend={summary ? 'Đã lưu' : 'Đang tải'}
          trendType="neutral"
          trendLabel="Gói Spa & Grooming"
          icon={<Briefcase className="w-5 h-5 text-sky-600" />}
          iconColor="bg-sky-50 text-sky-600"
        />
        <StatCard
          title="Lịch hẹn"
          value={summary ? summary.appointmentCount : '—'}
          trend="Tổng số"
          trendType="neutral"
          trendLabel="Trong cơ sở dữ liệu"
          icon={<Sliders className="w-5 h-5 text-emerald-600" />}
          iconColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Nhật ký Audit hôm nay"
          value={summary ? summary.auditCount : '—'}
          trend="Hôm nay"
          trendType="neutral"
          trendLabel="Sự kiện audit"
          icon={<History className="w-5 h-5 text-amber-600" />}
          iconColor="bg-amber-50 text-amber-600"
        />
      </div>

      {/* 3. System Activity Logs */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Nhật ký hoạt động hệ thống (Audit Logs)</CardTitle>
            <CardDescription>
              Theo dõi vết thay đổi cấu hình, phân quyền và thao tác quan trọng
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/audit-logs')}
            leftIcon={<History className="w-3.5 h-3.5" />}
          >
            Xem toàn bộ Audit Log
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Mã sự kiện</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Người thực hiện</TableHead>
                <TableHead>Đối tượng thao tác</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className="text-right">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditEvents.map((evt) => (
                <TableRow key={evt.id}>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {evt.id.slice(-8)}
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-slate-800">
                    {evt.action}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {evt.actorName}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">
                    {evt.target}
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">
                    {new Date(evt.createdAt).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="success" size="sm" dot>
                      Thành công
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {summary && auditEvents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                    Chưa có hoạt động quản trị nào được ghi nhận.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
