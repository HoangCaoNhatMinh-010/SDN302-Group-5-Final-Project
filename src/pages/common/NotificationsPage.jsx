import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Calendar, Info, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../services/notificationService';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';
import {
  Breadcrumb,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  LoadingState,
} from '../../components/common';

export const NotificationsPage = () => {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await notificationService.getMyNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      setNotifications(MOCK_NOTIFICATIONS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (item) => {
    if (item.read) return;
    try {
      await notificationService.markAsRead(item.id || item._id);
      setNotifications((prev) =>
        prev.map((n) => ((n.id || n._id) === (item.id || item._id) ? { ...n, read: true } : n))
      );
    } catch (err) {
      // fallback
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('Đã đánh dấu đã đọc tất cả thông báo');
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái thông báo');
    }
  };

  const clearAll = async () => {
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
      toast.info('Đã xóa tất cả thông báo');
    } catch (err) {
      toast.error('Không thể xóa thông báo');
    }
  };

  const formatTime = (item) => {
    if (item.time) return item.time;
    if (item.createdAt) {
      return new Date(item.createdAt).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      });
    }
    return 'Vừa xong';
  };

  const getIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'checkin':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Thông báo cửa hàng' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thông báo</h1>
          <p className="mt-1 text-sm text-slate-500">
            Nhắc lịch Spa Thú cưng, trạng thái đón bé và ưu đãi từ PawCare Studio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            leftIcon={<CheckCheck className="w-4 h-4" />}
            disabled={notifications.length === 0}
          >
            Đánh dấu đã đọc
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            leftIcon={<Trash2 className="w-4 h-4 text-slate-400" />}
            disabled={notifications.length === 0}
          >
            Xóa tất cả
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Danh sách thông báo gần đây</CardTitle>
            <CardDescription>Đồng bộ tự động từ cơ sở dữ liệu cửa hàng</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <LoadingState text="Đang tải thông báo..." />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Bạn không có thông báo nào.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((item) => (
                <div
                  key={item.id || item._id}
                  onClick={() => handleMarkAsRead(item)}
                  className={`p-4 flex items-start gap-3.5 transition-colors hover:bg-slate-50 cursor-pointer ${
                    !item.read ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs flex-shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-900">{item.title}</h4>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        {formatTime(item)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
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
