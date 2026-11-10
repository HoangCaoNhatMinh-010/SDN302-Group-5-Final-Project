import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scissors,
  Calendar,
  Clock,
  Ban,
  FileText,
  CheckCircle,
  Play,
  CalendarClock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Breadcrumb,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  StatusBadge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/common';

export const GroomerDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const careSchedule = [
    {
      id: 'APT-1003',
      ownerName: 'Lê Quốc Bảo',
      time: '09:30 - 10:00',
      petName: 'Milo (Poodle)',
      reason: 'Cắt tỉa form Teddy',
      status: 'IN_PROGRESS',
      phone: '0981 123 456',
    },
    {
      id: 'APT-1002',
      ownerName: 'Lê Thu Hương',
      petName: 'Bông Bông (Mèo Anh)',
      time: '10:00 - 10:30',
      reason: 'Tắm Spa & chải lông',
      status: 'WAITING',
      phone: '0972 345 678',
    },
    {
      id: 'APT-1001',
      ownerName: 'Nguyễn Văn Minh',
      petName: 'LuLu (Corgi)',
      time: '10:30 - 11:00',
      reason: 'Cắt móng & vệ sinh tai',
      status: 'CONFIRMED',
      phone: '0901 234 567',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Lịch chăm sóc của tôi' }]} />

      {/* 1. Welcome Card */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-800 via-primary-700 to-indigo-700 p-6 sm:p-8 text-white shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm mb-3">
              <Scissors className="w-3.5 h-3.5 text-sky-200" />
              <span>{currentUser?.specialty || 'Spa & Grooming'} • {currentUser?.room || 'Khu Grooming'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Lịch chăm sóc của tôi
            </h1>
            <p className="mt-1 text-sm text-sky-100 max-w-xl">
              Xin chào, {currentUser?.name || 'Chuyên viên Mai Anh'}. Bạn có các lịch chăm sóc thú cưng trong ngày hôm nay.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="light"
              size="md"
              leftIcon={<Play className="w-4 h-4 text-primary-700 fill-current" />}
              onClick={() => toast.info('Bắt đầu ca chăm sóc cho bé Milo')}
              className="bg-white text-primary-700 hover:bg-slate-50 border-0 shadow-sm"
            >
              Bắt đầu ca chăm sóc
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Ban className="w-4 h-4 text-white" />}
              onClick={() => navigate('/groomer/block-time')}
              className="border-white/40 text-white hover:bg-white/10"
            >
              Giờ nghỉ
            </Button>
            <Button
              variant="ghost"
              size="md"
              leftIcon={<FileText className="w-4 h-4 text-white" />}
              onClick={() => navigate('/groomer/care-notes')}
              className="text-white hover:bg-white/10"
            >
              Ghi chú chăm sóc
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Groomer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lịch chăm sóc hôm nay"
          value="12"
          trend="Hôm nay"
          trendType="neutral"
          trendLabel="Ca sáng & chiều"
          icon={<CalendarClock className="w-5 h-5 text-blue-600" />}
          iconColor="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Đã hoàn thành"
          value="7"
          trend="58%"
          trendType="up"
          trendLabel="Tiến độ ca làm"
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          iconColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Thú cưng đang chờ"
          value="3"
          trend="Khu tiếp đón"
          trendType="neutral"
          trendLabel="Đã check-in"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          iconColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Thời gian nghỉ"
          value="1h"
          trend="Giờ nghỉ"
          trendType="neutral"
          trendLabel="11:30 - 12:30"
          icon={<Ban className="w-5 h-5 text-purple-600" />}
          iconColor="bg-purple-50 text-purple-600"
        />
      </div>

      {/* 3. Schedule Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Lịch chăm sóc trong ca làm</CardTitle>
            <CardDescription>
              Xem thông tin thú cưng, bắt đầu dịch vụ và cập nhật lưu ý chăm sóc
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/groomer/calendar')}
            leftIcon={<Calendar className="w-3.5 h-3.5" />}
          >
            Lịch cá nhân
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Khung giờ</TableHead>
                <TableHead>Khách hàng & thú cưng</TableHead>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {careSchedule.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-xs text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs text-slate-900">{item.ownerName}</div>
                    <div className="text-[11px] text-slate-500">{item.petName}</div>
                    <div className="text-[11px] text-slate-400">{item.id}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {item.reason}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">
                    {item.phone}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} size="sm" />
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === 'IN_PROGRESS' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => toast.success(`Bắt đầu dịch vụ cho ${item.petName}`)}
                      >
                        Tiếp tục chăm sóc
                      </Button>
                    ) : item.status === 'WAITING' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toast.info(`Mời ${item.petName} vào khu chăm sóc`)}
                      >
                        Gọi vào
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.info(`Xem hồ sơ chăm sóc của ${item.petName}`)}
                      >
                        Hồ sơ
                      </Button>
                    )}
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
