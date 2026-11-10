import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarPlus,
  Stethoscope,
  Activity,
  Clock,
  CalendarDays,
  Users,
  UserCircle,
  ListOrdered,
  UserCheck,
  Calendar,
  UserX,
  Ban,
  FileText,
  Briefcase,
  Sliders,
  ShieldCheck,
  Key,
  FileCheck,
  History,
  Cpu,
  BellRing,
  BarChart3,
  Sparkles,
  Heart,
  Scissors,
  MessageCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS_BY_ROLE } from '../../data/mockData';
import { ROLE_LABELS } from '../../utils/constants';

// Safe icon lookup table
const ICON_MAP = {
  LayoutDashboard,
  CalendarPlus,
  Stethoscope,
  Activity,
  Clock,
  CalendarDays,
  Users,
  UserCircle,
  ListOrdered,
  UserCheck,
  Calendar,
  UserX,
  Ban,
  FileText,
  Briefcase,
  Sliders,
  ShieldCheck,
  Key,
  FileCheck,
  History,
  Cpu,
  BellRing,
  BarChart3,
  Sparkles,
  Heart,
  Scissors,
  MessageCircle,
};

export const Sidebar = ({
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { role, currentUser } = useAuth();
  const location = useLocation();

  const navItems = (role && NAV_ITEMS_BY_ROLE[role]) || [];

  const renderIcon = (iconName, className) => {
    const IconComponent = ICON_MAP[iconName] || LayoutDashboard;
    return <IconComponent className={className} />;
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto bg-white border-r border-slate-200">
      <div>
        {/* User Mini Profile in Sidebar */}
        <div
          className={`border-b border-slate-100 p-4 transition-all duration-200 ${
            isCollapsed ? 'items-center text-center px-2' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700 font-bold border border-primary-200">
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-slate-900 truncate">
                  {currentUser?.name || 'Người dùng'}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  {ROLE_LABELS[role] || role}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section Title */}
        {!isCollapsed && (
          <div className="px-4 pt-4 pb-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Menu điều hướng
            </p>
          </div>
        )}

        {/* Navigation list */}
        <nav className="space-y-1 px-2.5 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={`
                  group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-150 relative
                  ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                  ${isCollapsed ? 'justify-center px-2' : ''}
                `}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary-600 rounded-r-md" />
                )}

                {/* Icon */}
                {renderIcon(
                  item.icon,
                  `w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`
                )}

                {/* Label */}
                {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}

                {/* Badge if any */}
                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`
                      ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold
                      ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }
                    `}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-slate-100 p-3">
        {/* Toggle Collapse Button for desktop/tablet */}
        <div className="hidden lg:block mb-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`
              w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition-colors
              ${isCollapsed ? 'justify-center px-1' : ''}
            `}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
                <span>Thu gọn menu</span>
              </>
            )}
          </button>
        </div>

        {/* System Version & Help Info */}
        {!isCollapsed ? (
          <div className="rounded-xl bg-slate-50 p-3 text-slate-500 border border-slate-200/60">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-700">Hỗ trợ PawCare</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 leading-tight">
              Hotline Quán: 0901 234 567
            </p>
            <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-200/60 pt-1.5">
              <span>PawCare Studio v1.0</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center text-slate-400 py-1" title="PawCare Studio v1.0">
            <HelpCircle className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Mobile Drawer Backdrop & Container */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-200 ${
          isOpenMobile
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onCloseMobile}
        />
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-200 transform ${
            isOpenMobile ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile drawer header with close button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white font-bold text-xs">
                🐾
              </div>
              <span className="font-bold text-sm text-slate-800">PawCare Studio</span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="h-[calc(100%-56px)]">{sidebarContent}</div>
        </div>
      </div>

      {/* 2. Desktop & Tablet Static / Collapsible Sidebar */}
      <aside
        className={`
          hidden lg:block flex-shrink-0 h-full transition-all duration-200 z-20
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div className="h-full">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
};
