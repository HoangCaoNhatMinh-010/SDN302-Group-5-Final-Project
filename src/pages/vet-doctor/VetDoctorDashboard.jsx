import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ClipboardPlus, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  Breadcrumb,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/common';

export const VetDoctorDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Khu vực bác sĩ thú y' }]} />

      <section className="rounded-2xl bg-gradient-to-r from-teal-800 to-emerald-700 p-6 text-white shadow-elevated sm:p-8">
        <div className="flex items-start gap-4">
          <Stethoscope className="mt-1 h-7 w-7 shrink-0" />
          <div>
            <p className="text-sm font-medium text-teal-100">Bác sĩ chuyên khoa thú y</p>
            <h1 className="mt-1 text-2xl font-bold">
              Xin chào, {currentUser?.name || 'Bác sĩ'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-teal-50">
              Đây là khu vực riêng cho lịch khám và hồ sơ y tế. Các thao tác khám bệnh và ghi hồ sơ chưa được kết nối API; không có dữ liệu bệnh án giả lập được lưu hoặc hiển thị như dữ liệu thật.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CalendarDays className="h-5 w-5 text-teal-700" />
            <CardTitle>Lịch khám thú y</CardTitle>
            <CardDescription>Xem khu vực lịch hẹn khám và tư vấn.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/vet-doctor/appointments')}>
              Mở lịch khám
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <ClipboardPlus className="h-5 w-5 text-teal-700" />
            <CardTitle>Hồ sơ y tế thú cưng</CardTitle>
            <CardDescription>
              Mục tiêu là ghi nhận ghi chú y tế qua collection `medical_notes` khi API được triển khai.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate('/vet-doctor/medical-notes')}>
              Mở hồ sơ y tế
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
