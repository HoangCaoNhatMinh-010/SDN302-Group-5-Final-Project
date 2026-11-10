import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Calendar,
  Clock,
  Ban,
  FileText,
  User,
  CheckCircle,
  Play,
  CalendarClock,
  ArrowRight,
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

export const DoctorDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const doctorSchedule = [
    {
      id: 'APT-1003',
      patientName: 'Lê Quốc Bảo',
      time: '09:30 - 10:00',
      reason: 'Tái khám huyết áp & kê đơn',
      status: 'IN_PROGRESS',
      phone: '0981 123 456',
    },
    {
      id: 'APT-1002',
      patientName: 'Trần Hoài An',
      time: '10:00 - 10:30',
      reason: 'Đau đầu âm ỉ kéo dài',
      status: 'WAITING',
      phone: '0972 345 678',
    },
    {
      id: 'APT-1001',
      patientName: 'Nguyễn Văn Minh',
      time: '10:30 - 11:00',
      reason: 'Khám sức khỏe tổng quát',
      status: 'CONFIRMED',
      phone: '0901 234 567',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Lịch khám của tôi' }]} />

      {/* 1. Welcome Card */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-800 via-primary-700 to-indigo-700 p-6 sm:p-8 text-white shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm mb-3">
              <Stethoscope className="w-3.5 h-3.5 text-sky-200" />
              <span>Chuyên khoa Nội tổng quát • {currentUser?.room || 'Phòng 204'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Lịch khám của tôi
            </h1>
            <p className="mt-1 text-sm text-sky-100 max-w-xl">
              Xin chào, {currentUser?.name || 'BS. Nguyễn Minh Anh'}. Bạn có 14 lượt khám được xếp lịch trong ngày hôm nay.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="light"
              size="md"
              leftIcon={<Play className="w-4 h-4 text-primary-700 fill-current" />}
              onClick={() => toast.info('Bắt đầu buổi khám cho bệnh nhân Lê Quốc Bảo')}
              className="bg-white text-primary-700 hover:bg-slate-50 border-0 shadow-sm"
            >
              Tiếp tục ca khám
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Ban className="w-4 h-4 text-white" />}
              onClick={() => navigate('/doctor/block-time')}
              className="border-white/40 text-white hover:bg-white/10"
            >
              Block time
            </Button>
            <Button
              variant="ghost"
              size="md"
              leftIcon={<FileText className="w-4 h-4 text-white" />}
              onClick={() => navigate('/doctor/clinical-notes')}
              className="text-white hover:bg-white/10"
            >
              Ghi chú ca khám
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Doctor Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng ca khám hôm nay"
          value="14"
          trend="Hôm nay"
          trendType="neutral"
          trendLabel="Ca sáng & chiều"
          icon={<CalendarClock className="w-5 h-5 text-blue-600" />}
          iconColor="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Đã hoàn thành"
          value="8"
          trend="57%"
          trendType="up"
          trendLabel="Tiến độ ca trực"
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          iconColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Đang chờ vào phòng"
          value="5"
          trend="Phòng chờ A"
          trendType="neutral"
          trendLabel="Đã check-in"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          iconColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Thời gian đã Block"
          value="1h"
          trend="Hội chẩn"
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
            <CardTitle>Danh sách ca khám trong ca trực</CardTitle>
            <CardDescription>
              Xem hồ sơ bệnh án, bắt đầu thăm khám và cập nhật ghi chú y khoa
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/doctor/calendar')}
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
                <TableHead>Bệnh nhân</TableHead>
                <TableHead>Lý do khám / Triệu chứng</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctorSchedule.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-xs text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs text-slate-900">{item.patientName}</div>
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
                        onClick={() => toast.success(`Mở bệnh án cho ${item.patientName}`)}
                      >
                        Tiếp tục khám
                      </Button>
                    ) : item.status === 'WAITING' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toast.info(`Đang gọi ${item.patientName} vào phòng 204`)}
                      >
                        Gọi vào
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.info(`Xem thông tin ${item.patientName}`)}
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
