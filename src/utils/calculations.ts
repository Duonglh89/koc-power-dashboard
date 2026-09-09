import { KOC, VideoItem, FilterState, DailyTrendItem } from '../types';

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

// Normalize any date string (YYYY-MM-DD, YYYY/MM/DD, ISO, etc.) into YYYY-MM-DD
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';
  const cleaned = dateStr.trim().replace(/\//g, '-');
  const part = cleaned.split(' ')[0] || cleaned.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(part)) return part;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return part;
}

// Calculate the active Date Range [startDate, endDate] based on timeRange
export function getDateRangeFromFilter(
  timeRange: FilterState['timeRange'],
  allTrends: DailyTrendItem[],
  customStart?: string,
  customEnd?: string,
  allVideos: VideoItem[] = []
): { startDate: string; endDate: string; label: string } {
  // Determine reference max date
  let maxDateStr = '2026-03-31';
  if (allVideos.length > 0) {
    const dates = allVideos.map(v => normalizeDate(v.publishTime)).filter(Boolean).sort();
    if (dates.length > 0) maxDateStr = dates[dates.length - 1];
  } else if (allTrends.length > 0) {
    maxDateStr = allTrends[allTrends.length - 1].date;
  }

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

// Aggregate actual videos into daily trend items
export function aggregateTrendsFromVideos(videos: VideoItem[]): DailyTrendItem[] {
  const map: Record<string, { totalGmv: number; views: number; clicks: number; orders: number }> = {};

  videos.forEach(v => {
    const d = normalizeDate(v.publishTime);
    if (!d) return;
    if (!map[d]) {
      map[d] = { totalGmv: 0, views: 0, clicks: 0, orders: 0 };
    }
    map[d].totalGmv += v.gmv || 0;
    map[d].views += v.views || 0;
    map[d].clicks += v.prodClicks || 0;
    map[d].orders += v.orders || 0;
  });

  const sortedDates = Object.keys(map).sort();
  return sortedDates.map(date => {
    const item = map[date];
    const adsCost = Math.round(item.totalGmv * 0.09);
    const commissionCost = Math.round(item.totalGmv * 0.06);
    const bookingCost = Math.round(item.totalGmv * 0.01);
    const totalCost = adsCost + commissionCost + bookingCost;
    const roas = totalCost > 0 ? Number((item.totalGmv / totalCost).toFixed(2)) : 0;
    return {
      date,
      gmvTotal: item.totalGmv,
      gmvOrganic: 0,
      gmvAds: 0,
      totalCost,
      adsCost,
      bookingCost,
      commissionCost,
      roas,
      views: item.views,
      clicks: item.clicks,
      orders: item.orders,
    };
  });
}

// Filter and aggregate KOCs by Date Range & Slicers
export function filterAndScaleKocs(
  kocs: KOC[],
  filters: FilterState,
  allTrends: DailyTrendItem[],
  videos: VideoItem[] = []
): {
  filteredKocs: KOC[];
  activeTrends: DailyTrendItem[];
  filteredVideos: VideoItem[];
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
    filters.endDate,
    videos
  );

  // Filter KOCs by Slicers (PIC, Group, Type, Status, Search)
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

  const matchedKocIds = new Set(matchedKocs.map(k => k.id));
  const matchedKocNames = new Set(matchedKocs.map(k => k.name));

  // If we have actual videos with dates, filter videos by date window and matched KOCs
  if (videos.length > 0) {
    const matchedVideos = videos.filter(v => {
      // Check KOC match
      const isKocMatch = matchedKocIds.has(v.kocId) || matchedKocNames.has(v.kocName);
      if (!isKocMatch) return false;

      // Check Date match
      const vDate = normalizeDate(v.publishTime);
      if (!vDate) return true;
      return vDate >= startDate && vDate <= endDate;
    });

    // Group actual video metrics by KOC
    const kocVideoAgg: Record<string, { count: number; gmv: number; views: number; clicks: number; orders: number }> = {};
    matchedVideos.forEach(v => {
      const key = v.kocId || v.kocName;
      if (!kocVideoAgg[key]) {
        kocVideoAgg[key] = { count: 0, gmv: 0, views: 0, clicks: 0, orders: 0 };
      }
      kocVideoAgg[key].count += 1;
      kocVideoAgg[key].gmv += v.gmv || 0;
      kocVideoAgg[key].views += v.views || 0;
      kocVideoAgg[key].clicks += v.prodClicks || 0;
      kocVideoAgg[key].orders += v.orders || 0;
    });

    // Reconstruct KOC metrics based on exact date window
    const filteredKocs: KOC[] = matchedKocs
      .map(k => {
        const agg = kocVideoAgg[k.id] || kocVideoAgg[k.name];
        if (!agg || agg.count === 0) {
          // If KOC has no video in this date window, keep with 0 or exclude
          return {
            ...k,
            videoCount: 0,
            totalGmv: 0,
            organicGmv: 0,
            adsGmv: 0,
            totalCost: 0,
            roas: 0,
            views: 0,
            clicks: 0,
            orders: 0,
            itemsSold: 0,
            bookingFee: 0,
            adsSpend: 0,
            affiliateCommission: 0,
          };
        }

        const kocGmv = agg.gmv;
        // Cost estimation based on KOC rates
        const adsRatio = k.totalGmv > 0 ? k.adsSpend / k.totalGmv : 0.08;
        const adsSpend = Math.round(kocGmv * adsRatio);
        const affiliateCommission = Math.round(kocGmv * 0.08);
        const bookingFee = agg.count > 0 ? Math.round(k.bookingFee * (agg.count / Math.max(1, k.videoCount))) : 0;
        const totalCost = bookingFee + adsSpend + affiliateCommission;
        const roas = totalCost > 0 ? Number((kocGmv / totalCost).toFixed(2)) : 0;

        return {
          ...k,
          videoCount: agg.count,
          totalGmv: kocGmv,
          organicGmv: 0,
          adsGmv: 0,
          totalCost,
          roas,
          views: agg.views,
          clicks: agg.clicks,
          orders: agg.orders,
          itemsSold: Math.round(agg.orders * 1.1),
          bookingFee,
          adsSpend,
          affiliateCommission,
        };
      })
      .filter(k => k.videoCount > 0 || matchedKocs.length === 1); // keep active KOCs in range

    // Build true daily trends from matched videos
    const activeTrends = aggregateTrendsFromVideos(matchedVideos);

    const finalTotalGmv = filteredKocs.reduce((a, k) => a + k.totalGmv, 0);
    const finalTotalCost = filteredKocs.reduce((a, k) => a + k.totalCost, 0);
    const finalRoas = finalTotalCost > 0 ? Number((finalTotalGmv / finalTotalCost).toFixed(2)) : 0;
    const finalViews = filteredKocs.reduce((a, k) => a + k.views, 0);
    const finalClicks = filteredKocs.reduce((a, k) => a + k.clicks, 0);
    const finalOrders = filteredKocs.reduce((a, k) => a + k.orders, 0);

    return {
      filteredKocs: filteredKocs.length > 0 ? filteredKocs : matchedKocs,
      activeTrends: activeTrends.length > 0 ? activeTrends : filterTrendsByDate(allTrends, startDate, endDate),
      filteredVideos: matchedVideos,
      dateRangeLabel: label,
      totalGmv: finalTotalGmv,
      organicGmv: 0,
      adsGmv: 0,
      totalCost: finalTotalCost,
      roas: finalRoas,
      views: finalViews,
      clicks: finalClicks,
      orders: finalOrders,
    };
  }

  // Fallback for when videos list is not yet loaded: use trend scaling
  const activeTrends = filterTrendsByDate(allTrends, startDate, endDate);
  const trendTotalGmv = activeTrends.reduce((a, t) => a + t.gmvTotal, 0);
  const allTotalGmv = allTrends.reduce((a, t) => a + t.gmvTotal, 0) || 1;
  const timeScaleRatio = trendTotalGmv / allTotalGmv;

  const filteredKocs: KOC[] = matchedKocs.map(k => {
    const kocGmv = Math.round(k.totalGmv * timeScaleRatio);
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
      organicGmv: 0,
      adsGmv: 0,
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
  const finalTotalCost = filteredKocs.reduce((a, k) => a + k.totalCost, 0);
  const finalRoas = finalTotalCost > 0 ? finalTotalGmv / finalTotalCost : 0;
  const finalViews = filteredKocs.reduce((a, k) => a + k.views, 0);
  const finalClicks = filteredKocs.reduce((a, k) => a + k.clicks, 0);
  const finalOrders = filteredKocs.reduce((a, k) => a + k.orders, 0);

  return {
    filteredKocs,
    activeTrends,
    filteredVideos: [],
    dateRangeLabel: label,
    totalGmv: finalTotalGmv,
    organicGmv: 0,
    adsGmv: 0,
    totalCost: finalTotalCost,
    roas: finalRoas,
    views: finalViews,
    clicks: finalClicks,
    orders: finalOrders,
  };
}
