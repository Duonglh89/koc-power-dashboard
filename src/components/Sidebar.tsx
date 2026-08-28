import React from 'react';
import { FilterState, KOC } from '../types';
import { LayoutDashboard, Filter, RotateCcw, ChevronDown, Calendar } from 'lucide-react';

interface SidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  kocs: KOC[];
  dateRangeLabel: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  kocs,
  dateRangeLabel,
}) => {
  const pics = Array.from(new Set(kocs.map(k => k.pic))).filter(Boolean);
  const targetGroups = Array.from(new Set(kocs.map(k => k.targetGroup))).filter(Boolean);
  const bookingTypes = ['Booking', 'Freecast'];
  const statuses = ['Hoạt động', 'Tạm dừng', 'Đã hoàn thành'];
  const kocNames = Array.from(new Set(kocs.map(k => k.name))).filter(Boolean);
  const kocIds = Array.from(new Set(kocs.map(k => k.id))).filter(Boolean);

  const timeRanges = [
    { id: '30_days', label: '30 ngày qua' },
    { id: '7_days', label: '7 ngày qua' },
    { id: 'yesterday', label: 'Hôm qua' },
    { id: 'this_year', label: 'Năm nay' },
    { id: 'this_quarter', label: 'Quý này' },
    { id: 'this_month', label: 'Tháng này' },
    { id: 'this_week', label: 'Tuần này' },
    { id: 'custom', label: 'Tùy chọn ngày' },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200/90 flex flex-col flex-shrink-0 min-h-screen text-slate-700 shadow-sm">
      {/* Brand Logo Header */}
      <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white">
        <div className="w-10 h-10 rounded-lg bg-navy-800 flex items-center justify-center text-white shadow-md">
          <LayoutDashboard className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <div className="font-extrabold text-navy-800 text-sm tracking-wide leading-tight">POWER DASHBOARD</div>
          <div className="text-[10px] text-slate-500 font-medium">KOC &amp; Affiliate Analytics</div>
        </div>
      </div>

      <div className="p-3.5 flex-1 overflow-y-auto space-y-4 text-xs">
        {/* Time Filter Radio Section */}
        <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-navy-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-navy-700" />
              Thời gian
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          {/* Active Date Label Pill */}
          <div className="bg-navy-800 text-white rounded px-2 py-1 text-[10px] font-mono text-center mb-2.5 shadow-xs truncate" title={dateRangeLabel}>
            {dateRangeLabel}
          </div>

          <div className="space-y-1">
            {timeRanges.map(t => (
              <label
                key={t.id}
                className={`flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded transition-colors ${
                  filters.timeRange === t.id ? 'bg-sky-50 font-bold text-navy-900' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="timeRange"
                  checked={filters.timeRange === t.id}
                  onChange={() => onFilterChange({ timeRange: t.id as any })}
                  className="w-3.5 h-3.5 text-navy-700 border-slate-300 focus:ring-navy-600 cursor-pointer"
                />
                <span className="text-xs">{t.label}</span>
              </label>
            ))}
          </div>

          {/* Custom Date Inputs if 'custom' is selected */}
          {filters.timeRange === 'custom' && (
            <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-2 animate-in fade-in duration-150">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Từ ngày:</label>
                <input
                  type="date"
                  value={filters.startDate || '2026-01-01'}
                  onChange={e => onFilterChange({ startDate: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-navy-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Đến ngày:</label>
                <input
                  type="date"
                  value={filters.endDate || '2026-03-31'}
                  onChange={e => onFilterChange({ endDate: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-navy-700"
                />
              </div>
            </div>
          )}
        </div>

        {/* Slicer Dropdowns */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between font-bold text-navy-800 text-[11px] uppercase tracking-wider pt-1">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-navy-600" />
              Bộ lọc đa chiều
            </span>
            <button
              onClick={onResetFilters}
              title="Đặt lại bộ lọc"
              className="text-[10px] text-sky-600 hover:text-navy-800 flex items-center gap-0.5 font-semibold"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Reset
            </button>
          </div>

          {/* Slicer: Nhân sự quản lý */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nhân sự quản lý</label>
            <div className="relative">
              <select
                value={filters.pic}
                onChange={e => onFilterChange({ pic: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-700 appearance-none focus:outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600 pr-7"
              >
                <option value="All">All</option>
                {pics.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Slicer: Nhóm mục tiêu */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nhóm mục tiêu</label>
            <div className="relative">
              <select
                value={filters.targetGroup}
                onChange={e => onFilterChange({ targetGroup: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-700 appearance-none focus:outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600 pr-7"
              >
                <option value="All">All</option>
                {targetGroups.map(tg => (
                  <option key={tg} value={tg}>{tg}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Slicer: Loại booking */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Loại booking</label>
            <div className="relative">
              <select
                value={filters.bookingType}
                onChange={e => onFilterChange({ bookingType: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-700 appearance-none focus:outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600 pr-7"
              >
                <option value="All">All</option>
                {bookingTypes.map(bt => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Slicer: Trạng thái */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Trạng thái</label>
            <div className="relative">
              <select
                value={filters.status}
                onChange={e => onFilterChange({ status: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-700 appearance-none focus:outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600 pr-7"
              >
                <option value="All">All</option>
                {statuses.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Slicer: ID KOC */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">ID KOC</label>
            <div className="relative">
              <select
                value={filters.kocId}
                onChange={e => onFilterChange({ kocId: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-700 appearance-none focus:outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600 pr-7"
              >
                <option value="All">All</option>
                {kocIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Slicer: Tên KOC */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tên KOC</label>
            <div className="relative">
              <select
                value={filters.kocName}
                onChange={e => onFilterChange({ kocName: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-700 appearance-none focus:outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600 pr-7"
              >
                <option value="All">All</option>
                {kocNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500 font-medium">
        KOC Management System v1.1
      </div>
    </aside>
  );
};
