import React, { useState } from 'react';
import { KOC, OverviewMetricType, OverviewDimensionType, TrendMetricType, TrendDimensionType, DailyTrendItem } from '../types';
import { formatCurrency, formatNumber, formatPercent } from '../utils/calculations';
import {
  Users,
  Video,
  Radio,
  Eye,
  MousePointer,
  ShoppingBag,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface OverviewTabProps {
  kocs: KOC[];
  dailyTrends: DailyTrendItem[];
  dateRangeLabel: string;
  totalGmv: number;
  organicGmv: number;
  adsGmv: number;
  totalCost: number;
  roas: number;
  views: number;
  clicks: number;
  orders: number;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  kocs,
  dailyTrends,
  dateRangeLabel,
  totalGmv,
  organicGmv,
  adsGmv,
  totalCost,
  roas,
  views,
  clicks,
  orders,
}) => {
  // Dynamic Bar Chart Controls
  const [metricOption, setMetricOption] = useState<OverviewMetricType>('totalGmv');
  const [dimensionOption, setDimensionOption] = useState<OverviewDimensionType>('messageTag');
  const [showMetricDropdown, setShowMetricDropdown] = useState(false);

  // Top 10 Toggle: Revenue or ROAS
  const [top10Mode, setTop10Mode] = useState<'revenue' | 'roas'>('revenue');

  // Trend Controls
  const [trendMetric, setTrendMetric] = useState<TrendMetricType>('totalGmv');
  const [trendDim, setTrendDim] = useState<TrendDimensionType>('day');

  // Totals calculations
  const totalKocs = kocs.length;
  const totalVideos = kocs.reduce((acc, k) => acc + k.videoCount, 0);
  const totalLive = kocs.reduce((acc, k) => acc + k.liveCount, 0);

  // Funnel calculations
  const clickRate = views > 0 ? (clicks / views) * 100 : 0;
  const convRate = clicks > 0 ? (orders / clicks) * 100 : 0;

  // Dynamic Bar Chart Data scaled to active time
  const dynamicItems = [
    { label: 'Thông điệp 1', value: Math.round(totalGmv * 0.58), color: '#165294' },
    { label: 'Thông điệp 2', value: Math.round(totalGmv * 0.18), color: '#165294' },
    { label: 'Thông điệp 3', value: Math.round(totalGmv * 0.24), color: '#165294' },
  ];
  const maxDynamicVal = Math.max(...dynamicItems.map(d => d.value), 1);

  // Top 10 KOC Data
  const sortedKocs = [...kocs].sort((a, b) => {
    if (top10Mode === 'revenue') return b.totalGmv - a.totalGmv;
    return b.roas - a.roas;
  }).slice(0, 10);

  const maxTopVal = top10Mode === 'revenue'
    ? Math.max(...sortedKocs.map(k => k.totalGmv), 1)
    : Math.max(...sortedKocs.map(k => k.roas), 1);

  // Donut Cost Breakdown Data
  const totalAdsSpend = kocs.reduce((acc, k) => acc + k.adsSpend, 0);
  const totalAffiliateComm = kocs.reduce((acc, k) => acc + k.affiliateCommission, 0);
  const totalBookingFee = kocs.reduce((acc, k) => acc + k.bookingFee, 0);

  const costDonutData = [
    { name: 'Phí quảng cáo', value: totalAdsSpend || Math.round(totalCost * 0.817), color: '#6ba2d6' },
    { name: 'Phí hoa hồng tiếp thị liên kết', value: totalAffiliateComm || Math.round(totalCost * 0.165), color: '#2d6aa0' },
    { name: 'Phí Booking', value: totalBookingFee || Math.round(totalCost * 0.018), color: '#0d3b66' },
  ];

  const currentDonutData = costDonutData;
  const currentDonutTotal = currentDonutData.reduce((a, b) => a + b.value, 0);

  // Metric Options for Dropdown
  const metricOptionsList: { id: OverviewMetricType; label: string }[] = [
    { id: 'totalGmv', label: 'Doanh thu chung' },
    { id: 'totalCost', label: 'Tổng chi phí' },
    { id: 'roas', label: 'ROAS' },
  ];

  return (
    <div className="space-y-4 p-4">
      {/* 1. TOP 6 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Số KOC */}
        <div className="custom-card p-3 flex flex-col justify-between">
          <div className="text-slate-500 text-[11px] font-semibold">Số KOC</div>
          <div className="text-2xl font-extrabold text-navy-800 mt-1">{totalKocs}</div>
        </div>

        {/* Số Video */}
        <div className="custom-card p-3 flex flex-col justify-between">
          <div className="text-slate-500 text-[11px] font-semibold">Số Video</div>
          <div className="text-2xl font-extrabold text-navy-800 mt-1">
            {formatNumber(totalVideos, true)}
          </div>
        </div>

        {/* Số phiên live */}
        <div className="custom-card p-3 flex flex-col justify-between">
          <div className="text-slate-500 text-[11px] font-semibold">Số phiên live</div>
          <div className="text-2xl font-extrabold text-navy-800 mt-1">{totalLive}</div>
        </div>

        {/* Doanh thu chung */}
        <div className="custom-card p-3 flex flex-col justify-between bg-sky-50/50 border border-sky-200">
          <div className="text-sky-800 text-[11px] font-bold">Doanh thu chung (GMV)</div>
          <div className="text-2xl font-black text-sky-900 mt-1">
            {formatCurrency(totalGmv, true)}
          </div>
        </div>

        {/* Tổng chi phí */}
        <div className="custom-card p-3 flex flex-col justify-between">
          <div className="text-slate-500 text-[11px] font-semibold">Tổng chi phí</div>
          <div className="text-2xl font-extrabold text-navy-800 mt-1">
            {formatCurrency(totalCost, true)}
          </div>
        </div>

        {/* ROAS */}
        <div className="custom-card p-3 flex flex-col justify-between">
          <div className="text-slate-500 text-[11px] font-semibold">ROAS</div>
          <div className="text-2xl font-extrabold text-navy-800 mt-1">
            {roas.toFixed(2)}
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW: FUNNEL + DYNAMIC BAR CHART + TOP 10 KOC */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Phễu chuyển đổi (4 cols) */}
        <div className="lg:col-span-4 custom-card p-4 flex flex-col justify-between">
          <div className="text-xs font-bold text-navy-800 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Phễu Chuyển Đổi</span>
            <span className="text-[10px] text-slate-400 font-normal truncate max-w-[130px]" title={dateRangeLabel}>
              {dateRangeLabel}
            </span>
          </div>

          <div className="space-y-3 my-auto">
            {/* Tầng 1: Hiển thị */}
            <div className="relative">
              <div className="bg-navy-800 text-white rounded-t-lg p-3 text-center shadow-sm">
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

            {/* Tầng 2: Tiếp cận */}
            <div className="relative px-3">
              <div className="bg-navy-700 text-white rounded-t-lg p-2.5 text-center shadow-sm">
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

            {/* Tầng 3: Chuyển đổi */}
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

        {/* Biểu đồ động theo Dropdown (4 cols) */}
        <div className="lg:col-span-4 custom-card p-4 flex flex-col justify-between relative">
          {/* Header with Dynamic Dropdowns */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative">
              <button
                onClick={() => setShowMetricDropdown(!showMetricDropdown)}
                className="flex items-center gap-1 text-xs font-bold text-navy-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded border border-slate-200"
              >
                <span>{metricOptionsList.find(m => m.id === metricOption)?.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showMetricDropdown && (
                <div className="absolute left-0 top-8 w-44 bg-white border border-slate-200 rounded-md shadow-lg z-20 py-1 text-xs">
                  {metricOptionsList.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setMetricOption(opt.id);
                        setShowMetricDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between ${
                        metricOption === opt.id ? 'font-bold text-navy-800 bg-slate-50' : 'text-slate-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {metricOption === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-navy-800" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-xs text-slate-500 font-medium">theo</span>

            <select
              value={dimensionOption}
              onChange={e => setDimensionOption(e.target.value as any)}
              className="text-xs font-semibold text-navy-800 bg-slate-100 border border-slate-200 rounded px-2 py-1.5 focus:outline-none"
            >
              <option value="messageTag">Thông điệp</option>
              <option value="campaign">Chiến dịch</option>
              <option value="targetGroup">Nhóm mục tiêu</option>
              <option value="bookingType">Loại booking</option>
            </select>
          </div>

          {/* Horizontal Bar Chart */}
          <div className="space-y-4 my-auto">
            {dynamicItems.map(item => {
              const pct = (item.value / maxDynamicVal) * 100;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="text-xs font-medium text-slate-600">{item.label}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded h-6 overflow-hidden relative">
                      <div
                        className="bg-navy-700 h-full rounded transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${pct}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">
                          {formatCurrency(item.value, true)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 10 KOC theo Doanh thu / ROAS (4 cols) */}
        <div className="lg:col-span-4 custom-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-navy-800">Top 10 KOC theo</span>
            <div className="inline-flex rounded-md shadow-sm border border-slate-200 bg-slate-100 p-0.5">
              <button
                onClick={() => setTop10Mode('revenue')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                  top10Mode === 'revenue' ? 'bg-navy-800 text-white' : 'text-slate-600 hover:text-navy-800'
                }`}
              >
                Doanh thu
              </button>
              <button
                onClick={() => setTop10Mode('roas')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                  top10Mode === 'roas' ? 'bg-navy-800 text-white' : 'text-slate-600 hover:text-navy-800'
                }`}
              >
                ROAS
              </button>
            </div>
          </div>

          {/* Top 10 List */}
          <div className="space-y-2 overflow-y-auto max-h-56 pr-1 text-xs">
            {sortedKocs.map(k => {
              const val = top10Mode === 'revenue' ? k.totalGmv : k.roas;
              const pct = (val / maxTopVal) * 100;
              return (
                <div key={k.id} className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 truncate max-w-[170px]">{k.name}</span>
                    <span className="font-extrabold text-navy-800">
                      {top10Mode === 'revenue' ? formatCurrency(k.totalGmv, true) : k.roas.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-navy-700 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ROW: BREAKDOWN DONUT + TREND LINE CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Cơ cấu Chi phí (4 cols) */}
        <div className="lg:col-span-4 custom-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-navy-800 uppercase tracking-wide">Cơ Cấu Chi Phí</span>
            <span className="text-[11px] text-slate-500 font-semibold">{formatCurrency(currentDonutTotal, true)}</span>
          </div>

          {/* Donut Chart */}
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {currentDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [
                    `${formatCurrency(val, true)} (${((val / (currentDonutTotal || 1)) * 100).toFixed(1)}%)`,
                    'Chi phí'
                  ]}
                />
                <Legend
                  formatter={(val, entry: any) => {
                    const pct = ((entry.payload.value / (currentDonutTotal || 1)) * 100).toFixed(1);
                    return (
                      <span className="text-[11px] text-slate-600 font-medium">
                        {val} ({pct}%)
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ xu hướng (8 cols) */}
        <div className="lg:col-span-8 custom-card p-4 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-slate-500">Xu hướng</span>
              <select
                value={trendMetric}
                onChange={e => setTrendMetric(e.target.value as any)}
                className="font-bold text-navy-800 bg-slate-100 border border-slate-200 rounded px-2.5 py-1 focus:outline-none"
              >
                <option value="totalGmv">Doanh thu chung (GMV)</option>
                <option value="totalCost">Tổng chi phí</option>
                <option value="roas">ROAS</option>
                <option value="views">Lượt xem</option>
                <option value="orders">Đơn hàng</option>
              </select>
              <span className="text-slate-500">theo</span>
              <select
                value={trendDim}
                onChange={e => setTrendDim(e.target.value as any)}
                className="font-bold text-navy-800 bg-slate-100 border border-slate-200 rounded px-2 py-1 focus:outline-none"
              >
                <option value="day">Ngày</option>
                <option value="week">Tuần</option>
                <option value="month">Tháng</option>
              </select>
            </div>
            <div className="text-[11px] text-slate-500 font-mono font-medium">{dateRangeLabel}</div>
          </div>

          {/* Area Line Chart */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#165294" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#165294" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={str => {
                    const d = new Date(str);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  tickFormatter={val => {
                    if (val >= 1e9) return (val / 1e9).toFixed(1) + 'bn';
                    if (val >= 1e6) return (val / 1e6).toFixed(0) + 'M';
                    if (val >= 1e3) return (val / 1e3).toFixed(0) + 'K';
                    return val;
                  }}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(val: number) => [
                    trendMetric === 'roas' ? val.toFixed(2) : formatCurrency(val, true),
                    'Giá trị'
                  ]}
                  labelFormatter={label => `Ngày: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey={trendMetric}
                  stroke="#165294"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorGmv)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
