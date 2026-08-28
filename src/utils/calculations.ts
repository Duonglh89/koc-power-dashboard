import { KOC, FilterState, DailyTrendItem } from '../types';

export function formatCurrency(val: number, compact: boolean = false): string {
  if (isNaN(val) || val === null || val === undefined) return '0 ₫';
  
  if (compact) {
    if (Math.abs(val) >= 1e9) {
      return (val / 1e9).toFixed(2) + 'bn';
    }
    if (Math.abs(val) >= 1e6) {
      return (val / 1e6).toFixed(2) + 'M';
    }
    if (Math.abs(val) >= 1e3) {
      return (val / 1e3).toFixed(1) + 'K';
    }
    return val.toLocaleString('vi-VN') + ' ₫';
  }
  
  return val.toLocaleString('vi-VN') + ' ₫';
}

export function formatNumber(val: number, compact: boolean = false): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  
  if (compact) {
    if (Math.abs(val) >= 1e6) {
      return (val / 1e6).toFixed(2) + 'M';
    }
    if (Math.abs(val) >= 1e3) {
      return (val / 1e3).toFixed(0) + 'K';
    }
  }
  
  return val.toLocaleString('vi-VN');
}

export function formatPercent(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0.00%';
  return val.toFixed(2) + '%';
}

// Calculate the active Date Range [startDate, endDate] based on timeRange
export function getDateRangeFromFilter(
  timeRange: FilterState['timeRange'],
  allTrends: DailyTrendItem[],
  customStart?: string,
  customEnd?: string
): { startDate: string; endDate: string; label: string } {
  if (allTrends.length === 0) {
    return { startDate: '2026-01-01', endDate: '2026-03-31', label: 'Toàn thời gian' };
  }

  const maxDateStr = allTrends[allTrends.length - 1].date;
  const maxDate = new Date(maxDateStr);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  if (timeRange === 'custom' && customStart && customEnd) {
    return { startDate: customStart, endDate: customEnd, label: `${customStart} ➔ ${customEnd}` };
  }

  if (timeRange === 'yesterday') {
    const d = new Date(maxDate);
    d.setDate(d.getDate() - 1);
    const s = formatDate(d);
    return { startDate: s, endDate: s, label: `Hôm qua (${s})` };
  }

  if (timeRange === '7_days') {
    const d = new Date(maxDate);
    d.setDate(d.getDate() - 6);
    return { startDate: formatDate(d), endDate: maxDateStr, label: `7 ngày qua (${formatDate(d)} ➔ ${maxDateStr})` };
  }

  if (timeRange === '30_days') {
    const d = new Date(maxDate);
    d.setDate(d.getDate() - 29);
    return { startDate: formatDate(d), endDate: maxDateStr, label: `30 ngày qua (${formatDate(d)} ➔ ${maxDateStr})` };
  }

  if (timeRange === 'this_week') {
    const d = new Date(maxDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return { startDate: formatDate(d), endDate: maxDateStr, label: `Tuần này (${formatDate(d)} ➔ ${maxDateStr})` };
  }

  if (timeRange === 'this_month') {
    const d = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    return { startDate: formatDate(d), endDate: maxDateStr, label: `Tháng này (${formatDate(d)} ➔ ${maxDateStr})` };
  }

  if (timeRange === 'this_quarter') {
    const quarterMonth = Math.floor(maxDate.getMonth() / 3) * 3;
    const d = new Date(maxDate.getFullYear(), quarterMonth, 1);
    return { startDate: formatDate(d), endDate: maxDateStr, label: `Quý này (${formatDate(d)} ➔ ${maxDateStr})` };
  }

  // this_year or default
  const d = new Date(maxDate.getFullYear(), 0, 1);
  return { startDate: formatDate(d), endDate: maxDateStr, label: `Năm nay (${formatDate(d)} ➔ ${maxDateStr})` };
}

// Filter Daily Trends array by Date Window
export function filterTrendsByDate(
  trends: DailyTrendItem[],
  startDate: string,
  endDate: string
): DailyTrendItem[] {
  return trends.filter(t => t.date >= startDate && t.date <= endDate);
}

// Filter and scale KOCs by Date Range & Slicers
export function filterAndScaleKocs(
  kocs: KOC[],
  filters: FilterState,
  allTrends: DailyTrendItem[]
): {
  filteredKocs: KOC[];
  activeTrends: DailyTrendItem[];
  dateRangeLabel: string;
  totalGmv: number;
  organicGmv: number;
  adsGmv: number;
  totalCost: number;
  roas: number;
  views: number;
  clicks: number;
  orders: number;
} {
  const { startDate, endDate, label } = getDateRangeFromFilter(
    filters.timeRange,
    allTrends,
    filters.startDate,
    filters.endDate
  );

  const activeTrends = filterTrendsByDate(allTrends, startDate, endDate);

  // Totals from active date window
  const trendTotalGmv = activeTrends.reduce((a, t) => a + t.gmvTotal, 0);
  const trendOrganicGmv = activeTrends.reduce((a, t) => a + t.gmvOrganic, 0);
  const trendAdsGmv = activeTrends.reduce((a, t) => a + t.gmvAds, 0);
  const trendTotalCost = activeTrends.reduce((a, t) => a + t.totalCost, 0);
  const trendViews = activeTrends.reduce((a, t) => a + t.views, 0);
  const trendClicks = activeTrends.reduce((a, t) => a + t.clicks, 0);
  const trendOrders = activeTrends.reduce((a, t) => a + t.orders, 0);

  const allTotalGmv = allTrends.reduce((a, t) => a + t.gmvTotal, 0) || 1;
  const timeScaleRatio = trendTotalGmv / allTotalGmv;

  // Filter KOCs by Slicers
  const matchedKocs = kocs.filter(k => {
    if (filters.pic && filters.pic !== 'All' && k.pic !== filters.pic) return false;
    if (filters.targetGroup && filters.targetGroup !== 'All' && k.targetGroup !== filters.targetGroup) return false;
    if (filters.bookingType && filters.bookingType !== 'All' && k.bookingType !== filters.bookingType) return false;
    if (filters.status && filters.status !== 'All' && k.status !== filters.status) return false;
    if (filters.kocId && filters.kocId !== 'All' && k.id !== filters.kocId) return false;
    if (filters.kocName && filters.kocName !== 'All' && k.name !== filters.kocName) return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = k.name.toLowerCase().includes(q);
      const matchHandle = k.tiktokHandle.toLowerCase().includes(q);
      const matchPic = k.pic.toLowerCase().includes(q);
      if (!matchName && !matchHandle && !matchPic) return false;
    }
    return true;
  });

  // Scale KOC metrics dynamically for the selected date window
  const filteredKocs: KOC[] = matchedKocs.map(k => {
    const kocGmv = Math.round(k.totalGmv * timeScaleRatio);
    const kocOrganic = Math.round(k.organicGmv * timeScaleRatio);
    const kocAds = Math.round(k.adsGmv * timeScaleRatio);
    const kocCost = Math.round(k.totalCost * timeScaleRatio);
    const kocViews = Math.round(k.views * timeScaleRatio);
    const kocClicks = Math.round(k.clicks * timeScaleRatio);
    const kocOrders = Math.round(k.orders * timeScaleRatio);
    const kocAdsSpend = Math.round(k.adsSpend * timeScaleRatio);
    const kocBooking = Math.round(k.bookingFee * (timeScaleRatio > 0.3 ? 1 : timeScaleRatio));
    const kocComm = Math.round(k.affiliateCommission * timeScaleRatio);

    return {
      ...k,
      totalGmv: kocGmv,
      organicGmv: kocOrganic,
      adsGmv: kocAds,
      totalCost: kocCost,
      roas: kocCost > 0 ? parseFloat((kocGmv / kocCost).toFixed(2)) : k.roas,
      views: kocViews,
      clicks: kocClicks,
      orders: kocOrders,
      adsSpend: kocAdsSpend,
      bookingFee: kocBooking,
      affiliateCommission: kocComm,
      videoCount: Math.max(1, Math.round(k.videoCount * timeScaleRatio)),
    };
  });

  const finalTotalGmv = filteredKocs.reduce((a, k) => a + k.totalGmv, 0);
  const finalOrganicGmv = filteredKocs.reduce((a, k) => a + k.organicGmv, 0);
  const finalAdsGmv = filteredKocs.reduce((a, k) => a + k.adsGmv, 0);
  const finalTotalCost = filteredKocs.reduce((a, k) => a + k.totalCost, 0);
  const finalRoas = finalTotalCost > 0 ? finalTotalGmv / finalTotalCost : 0;
  const finalViews = filteredKocs.reduce((a, k) => a + k.views, 0);
  const finalClicks = filteredKocs.reduce((a, k) => a + k.clicks, 0);
  const finalOrders = filteredKocs.reduce((a, k) => a + k.orders, 0);

  return {
    filteredKocs,
    activeTrends,
    dateRangeLabel: label,
    totalGmv: finalTotalGmv,
    organicGmv: finalOrganicGmv,
    adsGmv: finalAdsGmv,
    totalCost: finalTotalCost,
    roas: finalRoas,
    views: finalViews,
    clicks: finalClicks,
    orders: finalOrders,
  };
}
