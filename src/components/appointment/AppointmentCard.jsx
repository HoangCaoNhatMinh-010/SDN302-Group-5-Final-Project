import React from 'react';
import { Clock, MapPin, User, Calendar } from 'lucide-react';
import { Card, CardContent } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';

export const AppointmentCard = ({ appointment, onAction, actionLabel = 'Xem chi tiết' }) => {
  if (!appointment) return null;

  return (
    <Card hover className="overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
              {appointment.id}
            </span>
            <span className="text-xs font-semibold text-slate-700">{appointment.type}</span>
          </div>
          <StatusBadge status={appointment.status} size="sm" />
        </div>

        <div className="mt-3 space-y-1.5">
          <h4 className="text-sm font-bold text-slate-900">
            {appointment.petName || appointment.patientName}
          </h4>
          {appointment.petName && (
            <p className="text-xs text-slate-500">Chủ nuôi: {appointment.patientName}</p>
          )}
          {appointment.serviceSnapshot && (
            <p className="text-xs text-slate-500">
              {appointment.serviceSnapshot.durationMinutes} phút
              {Number.isFinite(appointment.serviceSnapshot.price)
                ? ` • ${appointment.serviceSnapshot.price.toLocaleString('vi-VN')} đ`
                : ''}
            </p>
          )}
          <p className="text-xs text-slate-600 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Chuyên viên: <span className="font-medium text-slate-800">{appointment.doctorName}</span>
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {appointment.date} • {appointment.time}
          </p>
          {appointment.room && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {appointment.room} ({appointment.specialty})
            </p>
          )}
        </div>

        {onAction && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => onAction(appointment)}>
              {actionLabel}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
