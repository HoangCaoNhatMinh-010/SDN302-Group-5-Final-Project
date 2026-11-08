import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Sliders,
  ShieldCheck,
  BellRing,
  Award,
  DollarSign,
  Activity,
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

export const ManagerDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const departmentPerformance = [
    { name: 'Khoa Nội tổng quát', doctors: 8, visitsToday: 45, capacity: '94%', revenue: '18.2 tr' },
    { name: 'Khoa Tai Mũi Họng', doctors: 4, visitsToday: 32, capacity: '88%', revenue: '12.8 tr' },
    { name: 'Khoa Da liễu', doctors: 3, visitsToday: 28, capacity: '90%', revenue: '9.5 tr' },
    { name: 'Khoa Nhi', doctors: 5, visitsToday: 37, capacity: '85%', revenue: '14.0 tr' },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Quản lý phòng khám' }]} />

      {/* 1. Manager Welcome Card */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-800 to-sky-900 p-6 sm:p-8 text-white shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm mb-3">
              <Award className="w-3.5 h-3.5 text-emerald-300" />
              <span>Báo cáo vận hành theo thời gian thực</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Quản lý phòng khám
            </h1>
            <p className="mt-1 text-sm text-teal-100 max-w-xl">
              Kính chào {currentUser?.name || 'Nguyễn Hoàng Nam'} (Giám đốc Vận hành). Theo dõi chỉ số lấp đầy slot, hiệu suất làm việc của bác sĩ và chất lượng dịch vụ của toàn phòng khám.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="light"
              size="md"
              leftIcon={<BarChart3 className="w-4 h-4 text-emerald-900" />}
              onClick={() => navigate('/manager/reports')}
              className="bg-white text-emerald-900 hover:bg-slate-50 border-0 shadow-sm"
            >
              Báo cáo & Thống kê
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Sliders className="w-4 h-4 text-white" />}
              onClick={() => navigate('/manager/slot-config')}
              className="border-white/40 text-white hover:bg-white/10"
            >
              Cấu hình slot
            </Button>
            <Button
              variant="ghost"
              size="md"
              leftIcon={<ShieldCheck className="w-4 h-4 text-white" />}
              onClick={() => navigate('/manager/policies')}
              className="text-white hover:bg-white/10"
            >
              Chính sách
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Manager Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lượt khám hôm nay"
          value="142"
          trend="+14%"
          trendType="up"
          trendLabel="So với hôm qua"
          icon={<Users className="w-5 h-5 text-emerald-600" />}
          iconColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Doanh thu ước tính ngày"
          value="48.5 tr"
          trend="+9.2%"
          trendType="up"
          trendLabel="Đạt 105% chỉ tiêu"
          icon={<DollarSign className="w-5 h-5 text-teal-600" />}
          iconColor="bg-teal-50 text-teal-600"
        />
        <StatCard
          title="Công suất phục vụ"
          value="92%"
          trend="Tối ưu"
          trendType="up"
          trendLabel="Khung giờ cao điểm"
          icon={<Activity className="w-5 h-5 text-sky-600" />}
          iconColor="bg-sky-50 text-sky-600"
        />
        <StatCard
          title="Mức độ hài lòng BN"
          value="98%"
          trend="+1.5%"
          trendType="up"
          trendLabel="Khảo sát sau khám"
          icon={<Award className="w-5 h-5 text-amber-600" />}
          iconColor="bg-amber-50 text-amber-600"
        />
      </div>

      {/* 3. Performance Summary Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Hiệu suất hoạt động theo chuyên khoa</CardTitle>
            <CardDescription>
              Theo dõi số lượng bác sĩ trực, lượt tiếp nhận và công suất phòng khám
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/manager/reports')}
            leftIcon={<BarChart3 className="w-3.5 h-3.5" />}
          >
            Xuất dữ liệu Excel
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Chuyên khoa</TableHead>
                <TableHead>Bác sĩ đang trực</TableHead>
                <TableHead>Lượt khám hôm nay</TableHead>
                <TableHead>Tỉ lệ lấp đầy slot</TableHead>
                <TableHead className="text-right">Doanh thu tạm tính</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentPerformance.map((dept, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-semibold text-xs text-slate-800">
                    {dept.name}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {dept.doctors} bác sĩ
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-900">
                    {dept.visitsToday} lượt
                  </TableCell>
                  <TableCell>
                    <Badge variant="primary" size="sm">
                      {dept.capacity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-xs text-emerald-700">
                    {dept.revenue}
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
