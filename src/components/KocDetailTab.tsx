import React, { useState } from 'react';
import { KOC, VideoItem, LiveItem, DailyTrendItem } from '../types';
import { formatCurrency, formatNumber, formatPercent } from '../utils/calculations';
import {
  User,
  Users,
  Video,
  Radio,
  ExternalLink,
  ChevronDown,
  Eye,
  MousePointer,
  ShoppingBag,
  Film
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface KocDetailTabProps {
  kocs: KOC[];
  selectedKocId: string;
  onSelectKoc: (id: string) => void;
  videos: VideoItem[];
  livestreams: LiveItem[];
  dailyTrends: DailyTrendItem[];
}

export const KocDetailTab: React.FC<KocDetailTabProps> = ({
  kocs,
  selectedKocId,
  onSelectKoc,
  videos,
  livestreams,
  dailyTrends,
}) => {
  const selectedKoc = kocs.find(k => k.id === selectedKocId) || kocs[0];

  const kocVideos = videos.filter(v => v.kocId === selectedKoc?.id || v.kocName === selectedKoc?.name);
  const kocLives = livestreams.filter(l => l.kocId === selectedKoc?.id);

  // Individual Funnel
  const views = selectedKoc?.views || 677934;
  const clicks = selectedKoc?.clicks || 63807;
  const orders = selectedKoc?.orders || 540;
  const clickRate = views > 0 ? (clicks / views) * 100 : 0;
  const convRate = clicks > 0 ? (orders / clicks) * 100 : 0;

  // Trend Controls for Single KOC
  const [trendMetric, setTrendMetric] = useState<'organicGmv' | 'adsGmv' | 'totalGmv'>('organicGmv');

  return (
    <div className="p-4 space-y-4">
      {/* 1. TOP KOC SELECTOR & PROFILE HEADER CARD */}
      <div className="custom-card p-4 bg-white shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* KOC Dropdown */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Chọn KOC</label>
            <div className="relative">
              <select
                value={selectedKoc?.id}
                onChange={e => onSelectKoc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs font-bold text-navy-800 appearance-none focus:outline-none focus:border-navy-600 pr-8"
              >
                {kocs.map(k => (
                  <option key={k.id} value={k.id}>
                    {k.tiktokHandle} ({k.name})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Profile Card Center */}
          <div className="md:col-span-6 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-sm shadow">
                {selectedKoc?.name?.charAt(0) || 'K'}
              </div>
              <div>
                <div className="font-extrabold text-navy-900 text-sm flex items-center gap-1.5">
                  <span>{selectedKoc?.name}</span>
                  <a
                    href={selectedKoc?.tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-sky-600"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">{selectedKoc?.tiktokUrl}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-xs font-bold text-navy-800 justify-end">
                <Users className="w-3.5 h-3.5 text-sky-500" />
                <span>{formatNumber(selectedKoc?.followers, true)} Người theo dõi</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                Nhân sự quản lý: <strong className="text-navy-800">{selectedKoc?.pic}</strong>
              </div>
            </div>
          </div>

          {/* Video & Live Count Badges */}
          <div className="md:col-span-3 flex justify-around md:justify-end gap-6 text-right">
            <div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                <Video className="w-3.5 h-3.5 text-navy-700" />
                <span>Số Video</span>
              </div>
              <div className="text-xl font-extrabold text-navy-800">{selectedKoc?.videoCount}</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                <Radio className="w-3.5 h-3.5 text-rose-500" />
                <span>Số phiên Live</span>
              </div>
              <div className="text-xl font-extrabold text-navy-800">{selectedKoc?.liveCount || '--'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 8 KPI CARDS FOR SINGLE KOC */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="custom-card p-3">
          <div className="text-slate-500 text-[11px] font-semibold">Tổng doanh thu</div>
          <div className="text-lg font-extrabold text-navy-800 mt-1">{formatCurrency(selectedKoc?.totalGmv, true)}</div>
        </div>

        <div className="custom-card p-3">
          <div className="text-slate-500 text-[11px] font-semibold">Doanh thu tự nhiên</div>
          <div className="text-lg font-extrabold text-navy-800 mt-1">{formatCurrency(selectedKoc?.organicGmv, true)}</div>
        </div>

        <div className="custom-card p-3">
          <div className="text-slate-500 text-[11px] font-semibold">Doanh thu quảng cáo</div>
          <div className="text-lg font-extrabold text-navy-800 mt-1">{formatCurrency(selectedKoc?.adsGmv, true)}</div>
        </div>

        <div className="custom-card p-3">
          <div className="text-slate-500 text-[11px] font-semibold">Tổng chi phí</div>
          <div className="text-lg font-extrabold text-navy-800 mt-1">{formatCurrency(selectedKoc?.totalCost, true)}</div>
        </div>

        <div className="custom-card p-3">
          <div className="text-slate-500 text-[11px] font-semibold">ROAS</div>
          <div className="text-lg font-extrabold text-navy-800 mt-1">{selectedKoc?.roas?.toFixed(2)}</div>
        </div>

        <div className="custom-card p-3">
          <div className="text-slate-500 text-[11px] font-semibold">Phí Booking</div>
          <div className="text-lg font-extrabold text-navy-800 mt-1">{formatCurrency(selectedKoc?.bookingFee, true)}</div>
        </div>

        <div className="custom-card p-3">
          <div className="text-slate-500 text-[11px] font-semibold">Phí quảng cáo</div>
          <div className="text-lg font-extrabold text-navy-800 mt-1">{formatCurrency(selectedKoc?.adsSpend, true)}</div>
        </div>

        <div className="custom-card p-3">
          <div className="text-slate-500 text-[11px] font-semibold">Phí hoa hồng tiếp thị LK</div>
          <div className="text-lg font-extrabold text-navy-800 mt-1">{formatCurrency(selectedKoc?.affiliateCommission, true)}</div>
        </div>
      </div>

      {/* 3. MIDDLE: INDIVIDUAL FUNNEL + INDIVIDUAL TRENDLINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Funnel (4 cols) */}
        <div className="lg:col-span-4 custom-card p-4 flex flex-col justify-between">
          <div className="text-xs font-bold text-navy-800 uppercase tracking-wider mb-2">
            Phễu Chuyển Đổi KOC
          </div>

          <div className="space-y-3 my-auto">
            {/* Hiển thị */}
            <div className="relative">
              <div className="bg-navy-800 text-white rounded-t-lg p-2.5 text-center shadow-sm">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>Hiển thị</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 border-t-0 p-2 rounded-b-lg flex justify-between text-xs px-3">
                <span className="text-slate-500 font-medium">Lượt xem</span>
                <span className="font-extrabold text-navy-800">{formatNumber(views, true)}</span>
              </div>
            </div>

            {/* Tiếp cận */}
            <div className="relative px-3">
              <div className="bg-navy-700 text-white rounded-t-lg p-2 text-center shadow-sm">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                  <MousePointer className="w-3.5 h-3.5 text-sky-300" />
                  <span>Tiếp cận</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 border-t-0 p-2 rounded-b-lg flex justify-between text-xs px-3">
                <div>
                  <span className="text-slate-500 font-medium">Tỷ lệ click: </span>
                  <strong className="text-navy-800">{formatPercent(clickRate)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Lượt click: </span>
                  <strong className="text-navy-800">{formatNumber(clicks, true)}</strong>
                </div>
              </div>
            </div>

            {/* Chuyển đổi */}
            <div className="relative px-6">
              <div className="bg-navy-600 text-white rounded-t-lg p-2 text-center shadow-sm">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Chuyển đổi</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 border-t-0 p-2 rounded-b-lg flex justify-between text-xs px-3">
                <div>
                  <span className="text-slate-500 font-medium">Tỷ lệ CVR: </span>
                  <strong className="text-navy-800">{formatPercent(convRate)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Đơn hàng: </span>
                  <strong className="text-navy-800">{formatNumber(orders, true)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trendline (8 cols) */}
        <div className="lg:col-span-8 custom-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Xu hướng</span>
              <select
                value={trendMetric}
                onChange={e => setTrendMetric(e.target.value as any)}
                className="font-bold text-navy-800 bg-slate-100 border border-slate-200 rounded px-2.5 py-1 focus:outline-none"
              >
                <option value="organicGmv">Doanh thu tự nhiên</option>
                <option value="adsGmv">Doanh thu quảng cáo</option>
                <option value="totalGmv">Tổng doanh thu</option>
              </select>
              <span className="text-slate-500">theo Ngày</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Feb 01 - Mar 15</div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends.slice(30, 75)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorKocGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#165294" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#165294" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis
                  tickFormatter={val => (val / 1e6).toFixed(1) + 'M'}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val, true), 'Doanh thu']}
                  labelFormatter={l => `Ngày: ${l}`}
                />
                <Area
                  type="monotone"
                  dataKey={trendMetric}
                  stroke="#165294"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorKocGmv)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM TABLES: CHI TIẾT VIDEO & CHI TIẾT LIVESTREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Table Video (6 cols) */}
        <div className="lg:col-span-6 custom-card p-4">
          <div className="text-xs font-bold text-navy-800 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Chi tiết Video</span>
            <span className="text-[10px] text-slate-400 font-normal">({kocVideos.length} videos)</span>
          </div>

          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-navy-800 text-white text-[10px] uppercase font-bold sticky top-0">
                  <th className="py-2 px-2.5">ID Video</th>
                  <th className="py-2 px-2 text-right">Hiển thị SP</th>
                  <th className="py-2 px-2 text-right">Nhấp SP</th>
                  <th className="py-2 px-2 text-right">Thích</th>
                  <th className="py-2 px-2.5 text-right">GMV (₫)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {kocVideos.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-2.5 font-mono text-slate-600 truncate max-w-[140px]" title={v.title}>
                      {v.id}
                    </td>
                    <td className="py-2 px-2 text-right">{formatNumber(v.prodImpressions)}</td>
                    <td className="py-2 px-2 text-right">{formatNumber(v.prodClicks)}</td>
                    <td className="py-2 px-2 text-right">{formatNumber(v.likes)}</td>
                    <td className="py-2 px-2.5 text-right font-bold text-navy-800">{formatCurrency(v.gmv, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Livestream (6 cols) */}
        <div className="lg:col-span-6 custom-card p-4">
          <div className="text-xs font-bold text-navy-800 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Chi tiết Livestream</span>
            <span className="text-[10px] text-slate-400 font-normal">({kocLives.length} phiên Live)</span>
          </div>

          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            {kocLives.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                KOC này chưa có phiên Livestream trong kỳ báo cáo.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-navy-800 text-white text-[10px] uppercase font-bold sticky top-0">
                    <th className="py-2 px-2.5">Tên phiên Live</th>
                    <th className="py-2 px-2 text-right">Lượt xem LIVE</th>
                    <th className="py-2 px-2 text-right">Thích LIVE</th>
                    <th className="py-2 px-2 text-right">Chia sẻ</th>
                    <th className="py-2 px-2.5 text-right">GMV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {kocLives.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-2.5 font-medium text-slate-700 truncate max-w-[150px]" title={l.title}>
                        {l.title}
                      </td>
                      <td className="py-2 px-2 text-right">{formatNumber(l.views)}</td>
                      <td className="py-2 px-2 text-right">{formatNumber(l.likes)}</td>
                      <td className="py-2 px-2 text-right">{formatNumber(l.shares)}</td>
                      <td className="py-2 px-2.5 text-right font-bold text-navy-800">{formatCurrency(l.gmv, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
