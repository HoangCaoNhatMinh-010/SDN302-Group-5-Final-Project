import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROLE_LABELS } from '../../utils/constants';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';
import { Avatar, Badge, Dropdown, DropdownItem, DropdownDivider } from '../common';

export const Header = ({ onToggleSidebar }) => {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [unreadNotifications, setUnreadNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = unreadNotifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    toast.info('Bạn đã đăng xuất khỏi hệ thống');
    navigate('/login');
  };

  const markAllAsRead = () => {
    setUnreadNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('Đã đánh dấu đã đọc tất cả thông báo');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left side: Hamburger button + Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo and Brand */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-primary-600 to-rose-500 text-white shadow-sm shadow-primary-500/20 text-lg">
            🐾
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-bold tracking-tight text-slate-900">
              PawCare<span className="text-primary-600">Studio</span>
            </span>
            <span className="ml-2 hidden rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 md:inline-block border border-amber-200">
              Pet Spa & Grooming
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Search input (hidden on mobile) */}
      <div className="hidden md:flex items-center max-w-xs lg:max-w-md w-full mx-4">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm thú cưng, dịch vụ spa, chuyên viên grooming..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Right side: Current role, notifications, and user menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 sm:inline">
          {ROLE_LABELS[role] || 'Người dùng'}
        </span>

        {/* Notifications Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>
          }
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800">
              Thông báo ({unreadCount})
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-medium text-primary-600 hover:text-primary-800"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {unreadNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 text-xs transition-colors hover:bg-slate-50 ${
                  !notif.read ? 'bg-sky-50/40' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <h5 className="font-semibold text-slate-800">{notif.title}</h5>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {notif.time}
                  </span>
                </div>
                <p className="mt-1 text-slate-600 line-clamp-2">{notif.message}</p>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-slate-100 text-center">
            <button
              onClick={() => navigate('/notifications')}
              className="text-xs font-medium text-primary-600 hover:text-primary-800"
            >
              Xem tất cả thông báo
            </button>
          </div>
        </Dropdown>

        {/* User Profile Menu */}
        <Dropdown
          align="right"
          trigger={
            <div className="flex items-center gap-2 pl-1 cursor-pointer">
              <Avatar
                src={currentUser?.avatar}
                name={currentUser?.name}
                size="sm"
                status="online"
              />
              <div className="hidden text-left xl:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser?.name || 'Tài khoản'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {ROLE_LABELS[role] || 'Người dùng'}
                </p>
              </div>
              <ChevronDown className="hidden xl:block w-3.5 h-3.5 text-slate-400" />
            </div>
          }
        >
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-900">{currentUser?.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
            <div className="mt-1.5">
              <Badge variant="primary" size="sm">
                {ROLE_LABELS[role]}
              </Badge>
            </div>
          </div>

          <div className="py-1">
            <DropdownItem
              icon={<User className="w-4 h-4" />}
              onClick={() => navigate('/profile')}
            >
              Hồ sơ cá nhân
            </DropdownItem>
            <DropdownItem
              icon={<Bell className="w-4 h-4" />}
              onClick={() => navigate('/notifications')}
            >
              Thông báo
            </DropdownItem>
          </div>

          <DropdownDivider />

          <div className="py-1">
            <DropdownItem
              icon={<LogOut className="w-4 h-4" />}
              variant="danger"
              onClick={handleLogout}
            >
              Đăng xuất
            </DropdownItem>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};
