import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Calendar, Shield, Info, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';
import {
  Breadcrumb,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from '../../components/common';

export const NotificationsPage = () => {
  const toast = useToast();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('Đã đánh dấu đã đọc tất cả thông báo');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.info('Đã xóa tất cả thông báo');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-primary-600" />;
      case 'checkin':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Thông báo hệ thống' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thông báo</h1>
          <p className="mt-1 text-sm text-slate-500">
            Xem tất cả thông báo nhắc lịch khám, cập nhật trạng thái và tin tức hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            leftIcon={<CheckCheck className="w-4 h-4" />}
          >
            Đánh dấu đã đọc
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            leftIcon={<Trash2 className="w-4 h-4 text-slate-400" />}
          >
            Xóa tất cả
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Danh sách thông báo gần đây</CardTitle>
            <CardDescription>Cập nhật tự động theo thời gian thực</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Bạn không có thông báo nào.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 flex items-start gap-3.5 transition-colors hover:bg-slate-50 ${
                    !item.read ? 'bg-sky-50/40' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs flex-shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-900">{item.title}</h4>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-primary-600 mt-1.5 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
