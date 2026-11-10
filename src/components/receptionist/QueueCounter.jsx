import React from 'react';
import { ListOrdered, Users } from 'lucide-react';
import { Card, CardContent } from '../common/Card';

export const QueueCounter = ({ waitingCount = 7, servingCount = 4 }) => {
  return (
    <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-100">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-sm">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Hàng chờ hiện tại
            </p>
            <h4 className="text-xl font-extrabold text-teal-900">{waitingCount} người</h4>
          </div>
        </div>

        <div className="text-right border-l border-teal-100 pl-4">
          <p className="text-[11px] text-slate-400 font-medium">Đang phục vụ</p>
          <p className="text-sm font-bold text-teal-700">{servingCount} quầy / phòng</p>
        </div>
      </CardContent>
    </Card>
  );
};
