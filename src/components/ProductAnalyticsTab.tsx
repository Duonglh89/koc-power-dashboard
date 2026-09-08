import React, { useState, useMemo } from 'react';
import { ProductItem, ProductCategorySummary, KocProductAffinity, KOC, VideoItem } from '../types';
import {
  aggregateProductsFromData,
  aggregateCategorySummaries,
  calculateKocProductAffinity,
  exportProductsToCSV,
} from '../utils/productCalculations';
import { formatCurrency, formatNumber, formatPercent } from '../utils/calculations';
import {
  Package,
  Layers,
  Users,
  TrendingUp,
  Download,
  Search,
  ArrowUpDown,
  Filter,
  ExternalLink,
  Award,
  ShoppingCart,
  DollarSign,
  PieChart as PieIcon,
  BarChart2,
  ChevronRight,
  Eye,
  MousePointerClick,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

interface ProductAnalyticsTabProps {
  kocs: KOC[];
  videos: VideoItem[];
  onSelectKoc: (kocId: string) => void;
}

const CATEGORY_COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const ProductAnalyticsTab: React.FC<ProductAnalyticsTabProps> = ({
  kocs,
  videos,
  onSelectKoc,
}) => {
  // Aggregate data dynamically from current filtered KOCs and Videos
  const products = useMemo(() => aggregateProductsFromData(videos, kocs), [videos, kocs]);
  const categories = useMemo(() => aggregateCategorySummaries(products), [products]);
  const affinities = useMemo(() => calculateKocProductAffinity(videos, kocs), [videos, kocs]);

  // Sub-navigation view
  const [viewMode, setViewMode] = useState<'ranking' | 'categories' | 'kocAffinity'>('ranking');

  // Filters for ranking view
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'totalGmv' | 'orders' | 'unitsSold' | 'cvr'>('totalGmv');

  // Affinity drill-down mode
  const [affinityMode, setAffinityMode] = useState<'byProduct' | 'byKoc'>('byProduct');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedKocId, setSelectedKocId] = useState<string>(kocs[0]?.id || '');

  // Keep selected IDs in sync when dataset updates
  React.useEffect(() => {
    if (products.length > 0 && (!selectedProductId || !products.find(p => p.id === selectedProductId))) {
      setSelectedProductId(products[0].id);
    }
  }, [products]);

  React.useEffect(() => {
    if (kocs.length > 0 && (!selectedKocId || !kocs.find(k => k.id === selectedKocId))) {
      setSelectedKocId(kocs[0].id);
    }
  }, [kocs]);

  // KPIs
  const totalGmv = useMemo(() => products.reduce((acc, p) => acc + p.totalGmv, 0), [products]);
  const totalOrders = useMemo(() => products.reduce((acc, p) => acc + p.orders, 0), [products]);
  const totalUnits = useMemo(() => products.reduce((acc, p) => acc + p.unitsSold, 0), [products]);
  const topProduct = products[0];
  const topCategory = categories[0];
  const aov = totalOrders > 0 ? Math.round(totalGmv / totalOrders) : 0;

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesCat = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
        const matchesSearch =
          searchQuery === '' ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.topKocName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
  }, [products, selectedCategoryFilter, searchQuery, sortBy]);

  // Selected Product for drill-down
  const activeProduct = useMemo(
    () => products.find(p => p.id === selectedProductId) || products[0],
    [products, selectedProductId]
  );

  // KOCs selling the active product
  const kocsForActiveProduct = useMemo(() => {
    if (!activeProduct) return [];
    return affinities
      .filter(a => a.productName.trim().toLowerCase() === activeProduct.name.trim().toLowerCase())
      .sort((a, b) => b.gmv - a.gmv);
  }, [affinities, activeProduct]);

  // Selected KOC for drill-down
  const activeKoc = useMemo(() => kocs.find(k => k.id === selectedKocId) || kocs[0], [kocs, selectedKocId]);

  // Products sold by the active KOC
  const productsForActiveKoc = useMemo(() => {
    if (!activeKoc) return [];
    return affinities
      .filter(a => a.kocId === activeKoc.id)
      .sort((a, b) => b.gmv - a.gmv);
  }, [affinities, activeKoc]);

  // Donut chart data for Categories
  const categoryChartData = useMemo(() => {
    return categories.map(c => ({
      name: c.category,
      value: c.totalGmv,
      percentage: c.percentage,
      orders: c.orders,
    }));
  }, [categories]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* 1. Header & Quick View Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-navy-900 font-extrabold text-xl tracking-tight">
            <Package className="w-6 h-6 text-sky-600" />
            <span>Phân Tích Sản Phẩm &amp; KOC Bán Hàng</span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Báo cáo chi tiết sản phẩm bán chạy, cơ cấu nhóm hàng và ma trận tương quan KOC nào bán chạy sản phẩm nào.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setViewMode('ranking')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-all ${
              viewMode === 'ranking'
                ? 'bg-white text-navy-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Sản phẩm Bán chạy</span>
          </button>
          <button
            onClick={() => setViewMode('categories')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-all ${
              viewMode === 'categories'
                ? 'bg-white text-navy-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5 text-sky-500" />
            <span>Nhóm Sản phẩm</span>
          </button>
          <button
            onClick={() => setViewMode('kocAffinity')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-all ${
              viewMode === 'kocAffinity'
                ? 'bg-white text-navy-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            <span>KOC x Sản phẩm</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Total GMV */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Tổng GMV Sản phẩm</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-navy-900">{formatCurrency(totalGmv, true)}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tổng số: <strong className="text-slate-700">{products.length}</strong> mã sản phẩm
          </div>
        </div>

        {/* Metric 2: Top Product */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Sản phẩm Bán chạy #1</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-navy-900 line-clamp-1" title={topProduct?.name}>
            {topProduct ? topProduct.name : 'N/A'}
          </div>
          <div className="text-xs font-black text-sky-600 mt-1">
            {topProduct ? formatCurrency(topProduct.totalGmv, true) : '0 ₫'}{' '}
            <span className="text-[10px] text-slate-400 font-normal">
              ({topProduct && totalGmv > 0 ? ((topProduct.totalGmv / totalGmv) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        </div>

        {/* Metric 3: Top Category */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Nhóm Hàng Dẫn Đầu</span>
            <Layers className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-sm font-bold text-navy-900 line-clamp-1" title={topCategory?.category}>
            {topCategory ? topCategory.category : 'N/A'}
          </div>
          <div className="text-xs font-black text-emerald-600 mt-1">
            {topCategory ? formatCurrency(topCategory.totalGmv, true) : '0 ₫'}{' '}
            <span className="text-[10px] text-slate-400 font-normal">
              ({topCategory?.percentage || 0}%)
            </span>
          </div>
        </div>

        {/* Metric 4: Orders & AOV */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
            <span>Đơn hàng &amp; AOV</span>
            <ShoppingCart className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-navy-900">{formatNumber(totalOrders)} đơn</div>
          <div className="text-[11px] text-slate-500 mt-1">
            AOV TB: <strong className="text-slate-700">{formatCurrency(aov, true)}</strong>
          </div>
        </div>
      </div>

      {/* 3. VIEW MODE 1: RANKING TABLE (SẢN PHẨM BÁN CHẠY) */}
      {viewMode === 'ranking' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm, nhóm, KOC..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCategoryFilter}
                  onChange={e => setSelectedCategoryFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-sky-500"
                >
                  <option value="All">Tất cả nhóm ngành ({categories.length})</option>
                  {categories.map(c => (
                    <option key={c.category} value={c.category}>
                      {c.category} ({c.productCount})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-sky-500 font-medium"
                >
                  <option value="totalGmv">Sắp xếp: Doanh thu GMV cao nhất</option>
                  <option value="orders">Sắp xếp: Số đơn hàng nhiều nhất</option>
                  <option value="unitsSold">Sắp xếp: Số lượng bán (Units) cao nhất</option>
                  <option value="cvr">Sắp xếp: Tỷ lệ CVR cao nhất</option>
                </select>
              </div>
            </div>

            {/* Export CSV */}
            <button
              onClick={() => exportProductsToCSV(filteredProducts)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Xuất CSV Báo Cáo</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 min-w-[260px]">Sản Phẩm</th>
                  <th className="py-3 px-4">Nhóm Ngành</th>
                  <th className="py-3 px-4 text-right">Giá Bán</th>
                  <th className="py-3 px-4 text-right min-w-[150px]">Doanh Thu GMV</th>
                  <th className="py-3 px-4 text-right">Đơn Hàng</th>
                  <th className="py-3 px-4 text-right">Số Lượng Bán</th>
                  <th className="py-3 px-4 text-right">CVR / CTR</th>
                  <th className="py-3 px-4 min-w-[180px]">KOC Bán Chạy Nhất</th>
                  <th className="py-3 px-4 text-center w-24">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-slate-400">
                      Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod, idx) => {
                    const gmvShare = totalGmv > 0 ? (prod.totalGmv / totalGmv) * 100 : 0;
                    return (
                      <tr key={prod.id} className="hover:bg-sky-50/40 transition-colors group">
                        {/* Rank Badge */}
                        <td className="py-3 px-4 text-center">
                          {idx === 0 ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-black text-[11px]">
                              1
                            </span>
                          ) : idx === 1 ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-black text-[11px]">
                              2
                            </span>
                          ) : idx === 2 ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 text-amber-800 font-black text-[11px]">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">{idx + 1}</span>
                          )}
                        </td>

                        {/* Product Name */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-navy-900 group-hover:text-sky-600 transition-colors line-clamp-2">
                            {prod.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>{prod.videoCount} video</span>
                            <span>•</span>
                            <span>{prod.kocCount} KOCs tham gia</span>
                          </div>
                        </td>

                        {/* Category Badge */}
                        <td className="py-3 px-4">
                          <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-slate-200/80">
                            {prod.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 text-right font-medium text-slate-600">
                          {formatCurrency(prod.price)}
                        </td>

                        {/* GMV + Progress Bar */}
                        <td className="py-3 px-4 text-right">
                          <div className="font-black text-navy-900 text-[13px]">
                            {formatCurrency(prod.totalGmv)}
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className="bg-sky-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(gmvShare, 100)}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{gmvShare.toFixed(1)}% tỷ trọng</div>
                        </td>

                        {/* Orders */}
                        <td className="py-3 px-4 text-right font-bold text-slate-800">
                          {formatNumber(prod.orders)}
                        </td>

                        {/* Units Sold */}
                        <td className="py-3 px-4 text-right font-medium text-slate-700">
                          {formatNumber(prod.unitsSold)}
                        </td>

                        {/* CVR / CTR */}
                        <td className="py-3 px-4 text-right">
                          <div className="font-bold text-emerald-600">{formatPercent(prod.cvr)}</div>
                          <div className="text-[10px] text-slate-400">CTR {formatPercent(prod.ctr)}</div>
                        </td>

                        {/* Top KOC */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => prod.topKocId && onSelectKoc(prod.topKocId)}
                            className="text-left group/koc flex flex-col"
                            title="Bấm để xem chi tiết KOC này"
                          >
                            <span className="font-semibold text-navy-900 group-hover/koc:text-sky-600 group-hover/koc:underline flex items-center gap-1">
                              {prod.topKocName}
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover/koc:text-sky-600 inline" />
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              GMV KOC: {formatCurrency(prod.topKocGmv, true)}
                            </span>
                          </button>
                        </td>

                        {/* Action Drill-down */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedProductId(prod.id);
                              setAffinityMode('byProduct');
                              setViewMode('kocAffinity');
                            }}
                            className="px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-[11px] border border-sky-200 transition-colors"
                          >
                            Xem KOC
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. VIEW MODE 2: CATEGORIES (CƠ CẤU NHÓM HÀNG) */}
      {viewMode === 'categories' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Donut Share of Categories */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-sm text-navy-900 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-sky-600" />
                  <span>Tỷ Trọng Doanh Thu Theo Nhóm Ngành</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">{categories.length} nhóm ngành</span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [formatCurrency(val), 'Doanh thu']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                {categoryChartData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                    />
                    <span className="text-slate-600 truncate">{entry.name}:</span>
                    <strong className="text-navy-900">{entry.percentage}%</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Bar Chart Orders per Category */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-sm text-navy-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-600" />
                  <span>Số Đơn Hàng Theo Nhóm Ngành</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">Đơn vị: Đơn hàng</span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categories} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="category"
                      angle={-15}
                      textAnchor="end"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(val: number) => [formatNumber(val), 'Số đơn hàng']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Category Summary Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 bg-slate-50/50">
              <div className="font-bold text-sm text-navy-900">Bảng Tổng Hợp Chi Tiết Nhóm Sản Phẩm</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nhóm Sản Phẩm</th>
                    <th className="py-3 px-4 text-center">Số Mã SP</th>
                    <th className="py-3 px-4 text-center">Số KOCs Bán</th>
                    <th className="py-3 px-4 text-center">Số Video</th>
                    <th className="py-3 px-4 text-right">Tổng Doanh Thu GMV</th>
                    <th className="py-3 px-4 text-right">Tỷ Trọng (%)</th>
                    <th className="py-3 px-4 text-right">Số Đơn Hàng</th>
                    <th className="py-3 px-4 text-right">Số Lượng Bán (Units)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((c, idx) => (
                    <tr key={c.category} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-navy-900 flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                        />
                        <span>{c.category}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-700">{c.productCount}</td>
                      <td className="py-3 px-4 text-center font-medium text-slate-700">{c.kocCount}</td>
                      <td className="py-3 px-4 text-center font-medium text-slate-700">{c.videoCount}</td>
                      <td className="py-3 px-4 text-right font-black text-navy-900">
                        {formatCurrency(c.totalGmv)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-sky-600">{c.percentage}%</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">
                        {formatNumber(c.orders)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">
                        {formatNumber(c.unitsSold)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. VIEW MODE 3: KOC x PRODUCT MATRIX (KOC NÀO BÁN CHẠY SẢN PHẨM NÀO) */}
      {viewMode === 'kocAffinity' && (
        <div className="space-y-6">
          {/* Mode Switcher */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Chế độ phân tích:</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setAffinityMode('byProduct')}
                  className={`px-3 py-1 rounded-md font-bold transition-colors ${
                    affinityMode === 'byProduct' ? 'bg-navy-800 text-white shadow-xs' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  Theo Sản Phẩm (KOC nào bán chạy sản phẩm này?)
                </button>
                <button
                  onClick={() => setAffinityMode('byKoc')}
                  className={`px-3 py-1 rounded-md font-bold transition-colors ${
                    affinityMode === 'byKoc' ? 'bg-navy-800 text-white shadow-xs' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  Theo KOC (KOC này bán chạy sản phẩm nào nhất?)
                </button>
              </div>
            </div>

            {/* Dynamic Selector Dropdown */}
            {affinityMode === 'byProduct' ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Chọn Sản phẩm:</label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-navy-900 font-bold focus:outline-none focus:border-sky-500 max-w-xs truncate"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatCurrency(p.totalGmv, true)})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Chọn KOC:</label>
                <select
                  value={selectedKocId}
                  onChange={e => setSelectedKocId(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-navy-900 font-bold focus:outline-none focus:border-sky-500 max-w-xs truncate"
                >
                  {kocs.map(k => (
                    <option key={k.id} value={k.id}>
                      {k.name} ({formatCurrency(k.totalGmv, true)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Drill-down Results for Mode "byProduct" */}
          {affinityMode === 'byProduct' && activeProduct && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              {/* Product Header Card */}
              <div className="p-4 bg-sky-50/50 border-b border-sky-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="inline-block bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {activeProduct.category}
                  </div>
                  <h3 className="font-extrabold text-navy-900 text-base mt-1">{activeProduct.name}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-4">
                    <span>
                      Tổng GMV: <strong className="text-navy-900">{formatCurrency(activeProduct.totalGmv)}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Số đơn hàng: <strong className="text-navy-900">{formatNumber(activeProduct.orders)}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      KOC dẫn đầu: <strong className="text-sky-600">{activeProduct.topKocName}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Table of KOCs for this Product */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">Xếp Hạng</th>
                      <th className="py-3 px-4 min-w-[200px]">Tên KOC</th>
                      <th className="py-3 px-4 text-center">Số Video Tạo Ra</th>
                      <th className="py-3 px-4 text-right">Lượt Xem (Views)</th>
                      <th className="py-3 px-4 text-right">Lượt Click SP</th>
                      <th className="py-3 px-4 text-right">Số Đơn Hàng</th>
                      <th className="py-3 px-4 text-right min-w-[150px]">Doanh Thu GMV</th>
                      <th className="py-3 px-4 text-right">Đóng Góp Sản Phẩm</th>
                      <th className="py-3 px-4 text-center">Chi Tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {kocsForActiveProduct.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-slate-400">
                          Chưa có dữ liệu phân bổ video cho sản phẩm này.
                        </td>
                      </tr>
                    ) : (
                      kocsForActiveProduct.map((item, index) => {
                        const productShare =
                          activeProduct.totalGmv > 0 ? (item.gmv / activeProduct.totalGmv) * 100 : 0;
                        return (
                          <tr key={item.kocId} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 text-center font-bold text-slate-500">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-navy-900">{item.kocName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">ID: {item.kocId}</div>
                            </td>
                            <td className="py-3 px-4 text-center font-medium text-slate-700">
                              {item.videoCount}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-slate-600">
                              {formatNumber(item.views)}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-slate-600">
                              {formatNumber(item.clicks)}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800">
                              {formatNumber(item.orders)}
                            </td>
                            <td className="py-3 px-4 text-right font-black text-navy-900 text-[13px]">
                              {formatCurrency(item.gmv)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-bold text-sky-600">{productShare.toFixed(1)}%</div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                                <div
                                  className="bg-sky-500 h-full rounded-full"
                                  style={{ width: `${Math.min(productShare, 100)}%` }}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => onSelectKoc(item.kocId)}
                                className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors inline-flex items-center justify-center"
                                title="Chuyển đến trang Chi Tiết KOC"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Drill-down Results for Mode "byKoc" */}
          {affinityMode === 'byKoc' && activeKoc && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              {/* KOC Header Card */}
              <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    KOC Profile
                  </div>
                  <h3 className="font-extrabold text-navy-900 text-base mt-1 flex items-center gap-2">
                    <span>{activeKoc.name}</span>
                    <span className="text-xs text-slate-500 font-normal">({activeKoc.tiktokHandle})</span>
                  </h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-4">
                    <span>
                      Tổng GMV KOC: <strong className="text-navy-900">{formatCurrency(activeKoc.totalGmv)}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Nhóm phụ trách: <strong className="text-slate-700">{activeKoc.targetGroup}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      PIC: <strong className="text-slate-700">{activeKoc.pic}</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectKoc(activeKoc.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Xem Chi Tiết KOC Này</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Table of Products for this KOC */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4 min-w-[240px]">Sản Phẩm</th>
                      <th className="py-3 px-4">Nhóm Ngành</th>
                      <th className="py-3 px-4 text-center">Số Video Đã Đăng</th>
                      <th className="py-3 px-4 text-right">Lượt Xem</th>
                      <th className="py-3 px-4 text-right">Lượt Click</th>
                      <th className="py-3 px-4 text-right">Số Đơn Hàng</th>
                      <th className="py-3 px-4 text-right min-w-[140px]">Doanh Thu GMV</th>
                      <th className="py-3 px-4 text-right">Tỷ Trọng Trong Doanh Thu KOC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {productsForActiveKoc.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-slate-400">
                          KOC này chưa có dữ liệu gắn link video sản phẩm cụ thể.
                        </td>
                      </tr>
                    ) : (
                      productsForActiveKoc.map((item, index) => (
                        <tr key={item.productName} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-center font-medium text-slate-400">{index + 1}</td>
                          <td className="py-3 px-4 font-bold text-navy-900">{item.productName}</td>
                          <td className="py-3 px-4">
                            <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-slate-700">
                            {item.videoCount}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-600">
                            {formatNumber(item.views)}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-600">
                            {formatNumber(item.clicks)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800">
                            {formatNumber(item.orders)}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-navy-900">
                            {formatCurrency(item.gmv)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-bold text-emerald-600">{item.contributionPercent}%</div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: `${Math.min(item.contributionPercent, 100)}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
