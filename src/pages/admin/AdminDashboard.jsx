import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Sliders,
  ShieldCheck,
  History,
  Key,
  Server,
  Activity,
  CheckCircle,
  FileCheck,
  Cpu,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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

  const auditEvents = [
    {
      id: 'AUD-8821',
      action: 'Cập nhật cấu hình slot',
      user: 'Admin Hệ Thống',
      target: 'Chuyên khoa Nội (20 slot/buổi)',
      time: '12 phút trước',
      status: 'Thành công',
    },
    {
      id: 'AUD-8820',
      action: 'Gán vai trò RBAC',
      user: 'Admin Hệ Thống',
      target: 'bs.minhanh@medcare.vn -> DOCTOR',
      time: '1 giờ trước',
      status: 'Thành công',
    },
    {
      id: 'AUD-8819',
      action: 'Thêm mới dịch vụ',
      user: 'Nguyễn Hoàng Nam (Manager)',
      target: 'Nội soi tiêu hóa không đau',
      time: '3 giờ trước',
      status: 'Thành công',
    },
    {
      id: 'AUD-8818',
      action: 'Đồng bộ HIS/LIS webhook',
      user: 'Hệ thống tự động',
      target: 'Webhook ID #392',
      time: '5 giờ trước',
      status: 'Thành công',
    },
  ];

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
              <span>Hệ thống vận hành ổn định • Uptime 99.98%</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Quản trị hệ thống
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Cổng quản trị trung tâm dành cho {currentUser?.name || 'Admin Hệ Thống'}. Quản lý danh mục nhân viên, bác sĩ, cấu hình slot khám, phân quyền RBAC và giám sát kiểm toán hệ thống.
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
              Bác sĩ & Nhân viên
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

      {/* 2. Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bác sĩ & nhân viên"
          value="48"
          trend="+3"
          trendType="up"
          trendLabel="Tháng này"
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          iconColor="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Dịch vụ y tế"
          value="120"
          trend="Đang mở"
          trendType="neutral"
          trendLabel="14 chuyên khoa"
          icon={<Briefcase className="w-5 h-5 text-sky-600" />}
          iconColor="bg-sky-50 text-sky-600"
        />
        <StatCard
          title="Tỉ lệ slot được đặt"
          value="86%"
          trend="+8%"
          trendType="up"
          trendLabel="So với tuần trước"
          icon={<Sliders className="w-5 h-5 text-emerald-600" />}
          iconColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Nhật ký Audit hôm nay"
          value="342"
          trend="An toàn"
          trendType="up"
          trendLabel="0 vi phạm bảo mật"
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
                    {evt.id}
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-slate-800">
                    {evt.action}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {evt.user}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">
                    {evt.target}
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">
                    {evt.time}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="success" size="sm" dot>
                      {evt.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
