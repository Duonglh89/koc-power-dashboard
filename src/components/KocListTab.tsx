import React, { useState } from 'react';
import { KOC } from '../types';
import { formatCurrency, formatNumber } from '../utils/calculations';
import { ChevronDown, ChevronRight, Search, Download, ExternalLink } from 'lucide-react';

interface KocListTabProps {
  kocs: KOC[];
  onSelectKoc: (kocId: string) => void;
}

export const KocListTab: React.FC<KocListTabProps> = ({ kocs, onSelectKoc }) => {
  const [groupBy, setGroupBy] = useState<'targetGroup' | 'pic' | 'bookingType' | 'bookingDate'>('targetGroup');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Nhóm mục tiêu 1': true,
    'Nhóm mục tiêu 2': true,
    'Nhóm mục tiêu 3': true,
    'Booking': true,
    'Freecast': true,
  });

  const [searchQuery, setSearchQuery] = useState('');

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Filter KOCs by local search
  const filtered = kocs.filter(k => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return k.name.toLowerCase().includes(q) || k.tiktokHandle.toLowerCase().includes(q) || k.pic.toLowerCase().includes(q);
  });

  // Group KOCs according to selected dimension
  const groups: Record<string, KOC[]> = {};
  filtered.forEach(k => {
    let key = k.targetGroup;
    if (groupBy === 'pic') key = k.pic;
    if (groupBy === 'bookingType') key = k.bookingType;
    if (groupBy === 'bookingDate') key = k.bookingDate ? k.bookingDate.substring(0, 7) : 'Chưa xác định';
    
    if (!groups[key]) groups[key] = [];
    groups[key].push(k);
  });

  // Grand Totals
  const totalVideo = filtered.reduce((a, k) => a + k.videoCount, 0);
  const totalLive = filtered.reduce((a, k) => a + k.liveCount, 0);
  const totalGmv = filtered.reduce((a, k) => a + k.totalGmv, 0);
  const totalOrganicGmv = filtered.reduce((a, k) => a + k.organicGmv, 0);
  const totalAdsGmv = filtered.reduce((a, k) => a + k.adsGmv, 0);
  const totalCost = filtered.reduce((a, k) => a + k.totalCost, 0);
  const avgRoas = totalCost > 0 ? totalGmv / totalCost : 0;
  const totalBookingFee = filtered.reduce((a, k) => a + k.bookingFee, 0);
  const totalAdsSpend = filtered.reduce((a, k) => a + k.adsSpend, 0);

  // Export to CSV
  const handleExportCSV = () => {
    const header = ['ID KOC', 'Tên KOC', 'TikTok Handle', 'Nhân sự', 'Nhóm', 'Loại', 'Số Video', 'Số Live', 'Tổng Doanh Thu', 'DT Tự Nhiên', 'DT Ads', 'Tổng Chi Phí', 'ROAS', 'Phí Booking', 'Phí Ads'];
    const rows = filtered.map(k => [
      k.id, k.name, k.tiktokHandle, k.pic, k.targetGroup, k.bookingType,
      k.videoCount, k.liveCount, k.totalGmv, k.organicGmv, k.adsGmv,
      k.totalCost, k.roas, k.bookingFee, k.adsSpend
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "KOC_Performance_Report.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top Grouping Switcher + Search */}
      <div className="custom-card p-3 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-navy-800">Danh sách KOC theo</span>
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
            {[
              { id: 'targetGroup', label: 'Nhóm mục tiêu' },
              { id: 'pic', label: 'Nhân sự quản lý' },
              { id: 'bookingType', label: 'Loại booking' },
              { id: 'bookingDate', label: 'Ngày booking' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setGroupBy(tab.id as any)}
                className={`px-3 py-1.5 rounded transition-colors ${
                  groupBy === tab.id
                    ? 'bg-navy-800 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-navy-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm KOC, Handle, PIC..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-navy-600 focus:bg-white w-64"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-navy-800 text-xs font-semibold px-3 py-1.5 rounded-md border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* Hierarchical Matrix Table */}
      <div className="custom-card overflow-hidden shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-navy-800 text-white font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 min-w-[220px]">
                  {groupBy === 'targetGroup' && 'Nhóm mục tiêu / Tên KOC'}
                  {groupBy === 'pic' && 'Nhân sự / Tên KOC'}
                  {groupBy === 'bookingType' && 'Loại booking / Tên KOC'}
                  {groupBy === 'bookingDate' && 'Tháng booking / Tên KOC'}
                </th>
                <th className="py-3 px-2 text-right">Số Video</th>
                <th className="py-3 px-2 text-right">Số phiên live</th>
                <th className="py-3 px-3 text-right">Tổng doanh thu</th>
                <th className="py-3 px-3 text-right">Doanh thu tự nhiên</th>
                <th className="py-3 px-3 text-right">Doanh thu quảng cáo</th>
                <th className="py-3 px-3 text-right">Tổng chi phí</th>
                <th className="py-3 px-2 text-right">ROAS</th>
                <th className="py-3 px-3 text-right">Phí Booking</th>
                <th className="py-3 px-3 text-right">Phí quảng cáo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {Object.entries(groups).map(([groupName, groupKocs]) => {
                const isExpanded = expandedGroups[groupName] ?? true;
                const gVideo = groupKocs.reduce((a, k) => a + k.videoCount, 0);
                const gLive = groupKocs.reduce((a, k) => a + k.liveCount, 0);
                const gGmv = groupKocs.reduce((a, k) => a + k.totalGmv, 0);
                const gOrganic = groupKocs.reduce((a, k) => a + k.organicGmv, 0);
                const gAds = groupKocs.reduce((a, k) => a + k.adsGmv, 0);
                const gCost = groupKocs.reduce((a, k) => a + k.totalCost, 0);
                const gRoas = gCost > 0 ? gGmv / gCost : 0;
                const gBooking = groupKocs.reduce((a, k) => a + k.bookingFee, 0);
                const gAdsCost = groupKocs.reduce((a, k) => a + k.adsSpend, 0);

                return (
                  <React.Fragment key={groupName}>
                    {/* Parent Group Row */}
                    <tr
                      onClick={() => toggleGroup(groupName)}
                      className="bg-slate-100/80 hover:bg-slate-200/80 cursor-pointer font-bold text-navy-800 transition-colors border-t border-slate-200"
                    >
                      <td className="py-2.5 px-3 flex items-center gap-1.5">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-navy-700" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-navy-700" />
                        )}
                        <span>{groupName} ({groupKocs.length})</span>
                      </td>
                      <td className="py-2.5 px-2 text-right">{gVideo}</td>
                      <td className="py-2.5 px-2 text-right">{gLive}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-navy-900">{formatCurrency(gGmv)}</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(gOrganic)}</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(gAds)}</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(gCost)}</td>
                      <td className="py-2.5 px-2 text-right">
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          gRoas >= 2.5 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {gRoas.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(gBooking)}</td>
                      <td className="py-2.5 px-3 text-right">{formatCurrency(gAdsCost)}</td>
                    </tr>

                    {/* Child KOC Rows */}
                    {isExpanded &&
                      groupKocs.map(k => (
                        <tr
                          key={k.id}
                          onClick={() => onSelectKoc(k.id)}
                          className="hover:bg-sky-50/60 cursor-pointer text-slate-700 transition-colors text-[11px]"
                        >
                          <td className="py-2 px-3 pl-8 flex items-center justify-between">
                            <span className="font-semibold hover:text-navy-700 hover:underline">{k.name}</span>
                            <span className="text-[10px] text-slate-400">{k.tiktokHandle}</span>
                          </td>
                          <td className="py-2 px-2 text-right">{k.videoCount}</td>
                          <td className="py-2 px-2 text-right">{k.liveCount || '-'}</td>
                          <td className="py-2 px-3 text-right font-bold text-navy-800">{formatCurrency(k.totalGmv)}</td>
                          <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(k.organicGmv)}</td>
                          <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(k.adsGmv)}</td>
                          <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(k.totalCost)}</td>
                          <td className="py-2 px-2 text-right font-bold">
                            <span className={`${k.roas >= 3 ? 'text-emerald-600' : k.roas < 1.5 ? 'text-rose-600' : 'text-slate-700'}`}>
                              {k.roas.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(k.bookingFee)}</td>
                          <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(k.adsSpend)}</td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
            </tbody>
            {/* Total Grand Row */}
            <tfoot>
              <tr className="bg-navy-900 text-white font-extrabold text-xs">
                <td className="py-3 px-3">TOTAL ({filtered.length} KOCs)</td>
                <td className="py-3 px-2 text-right">{totalVideo}</td>
                <td className="py-3 px-2 text-right">{totalLive}</td>
                <td className="py-3 px-3 text-right text-sky-300 font-black">{formatCurrency(totalGmv)}</td>
                <td className="py-3 px-3 text-right">{formatCurrency(totalOrganicGmv)}</td>
                <td className="py-3 px-3 text-right">{formatCurrency(totalAdsGmv)}</td>
                <td className="py-3 px-3 text-right">{formatCurrency(totalCost)}</td>
                <td className="py-3 px-2 text-right text-emerald-300">{avgRoas.toFixed(2)}</td>
                <td className="py-3 px-3 text-right">{formatCurrency(totalBookingFee)}</td>
                <td className="py-3 px-3 text-right">{formatCurrency(totalAdsSpend)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
