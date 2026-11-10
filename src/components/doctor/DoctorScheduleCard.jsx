import React from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';

export const DoctorScheduleCard = ({ doctor }) => {
  if (!doctor) return null;

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-50 text-primary-600">
            <Calendar className="w-4 h-4" />
          </div>
          <CardTitle className="text-sm">Ca chăm sóc tiếp theo</CardTitle>
        </div>
        <Badge variant="success" size="sm" dot>
          Đang mở
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-700">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Ca sáng (08:00 - 12:00)
          </span>
          <span className="font-semibold text-primary-700">14 lịch hẹn</span>
        </div>
        <p className="text-slate-500 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {doctor.room || 'Khu Spa & Grooming'}
        </p>
      </CardContent>
    </Card>
  );
};
