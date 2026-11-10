import React from 'react';
import { Phone, MapPin, HeartPulse } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';

export const PatientInfoCard = ({ patient }) => {
  if (!patient) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Thông tin khách hàng</CardTitle>
        <Badge variant="primary" size="sm">
          {patient.patientCode || 'PAW-2026'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar src={patient.avatar} name={patient.name} size="lg" />
          <div>
            <h4 className="font-bold text-sm text-slate-900">{patient.name}</h4>
            <p className="text-xs text-slate-500">
              {patient.gender || 'Chưa cập nhật'} • {patient.dateOfBirth || 'Chưa cập nhật'}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 text-xs space-y-2 text-slate-600">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{patient.phone || '0901 234 567'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{patient.address || 'Chưa cập nhật'}</span>
          </div>
          <div className="flex items-center gap-2 text-primary-700 font-medium">
            <HeartPulse className="w-3.5 h-3.5 text-primary-600" />
            <span>Lưu ý chăm sóc: vui lòng xác nhận với chủ nuôi</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
