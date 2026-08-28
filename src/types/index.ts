export interface KOC {
  id: string;
  name: string;
  avatar?: string;
  tiktokHandle: string;
  tiktokUrl: string;
  followers: number;
  pic: string;
  targetGroup: string;
  bookingType: 'Booking' | 'Freecast';
  status: 'Hoạt động' | 'Tạm dừng' | 'Đã hoàn thành';
  bookingDate: string;
  
  videoCount: number;
  liveCount: number;
  totalGmv: number;
  organicGmv: number;
  adsGmv: number;
  totalCost: number;
  roas: number;
  
  bookingFee: number;
  adsSpend: number;
  affiliateCommission: number;
  imageRightsFee: number;
  
  views: number;
  impressions: number;
  clicks: number;
  orders: number;
  itemsSold: number;
}

export interface VideoItem {
  id: string;
  kocId: string;
  kocName: string;
  title: string;
  publishTime: string;
  productName: string;
  messageTag: string;
  campaign: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  prodImpressions: number;
  prodClicks: number;
  orders: number;
  gmv: number;
  gmvDirect: number;
  gmvIndirect: number;
  gpm: number;
  ctr: number;
  ctor: number;
}

export interface LiveItem {
  id: string;
  kocId: string;
  title: string;
  date: string;
  durationMinutes: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  clicks: number;
  orders: number;
  gmv: number;
}

export interface DailyTrendItem {
  date: string;
  gmvTotal: number;
  gmvOrganic: number;
  gmvAds: number;
  totalCost: number;
  adsCost: number;
  bookingCost: number;
  commissionCost: number;
  roas: number;
  views: number;
  clicks: number;
  orders: number;
}

export interface FilterState {
  timeRange: '30_days' | '7_days' | 'yesterday' | 'this_year' | 'this_quarter' | 'this_month' | 'this_week' | 'custom';
  startDate?: string;
  endDate?: string;
  pic: string;
  targetGroup: string;
  bookingType: string;
  status: string;
  kocId: string;
  kocName: string;
  bookingDate: string;
  searchQuery: string;
}

export type OverviewMetricType = 'totalGmv' | 'organicGmv' | 'adsGmv' | 'totalCost' | 'roas';
export type OverviewDimensionType = 'messageTag' | 'campaign' | 'targetGroup' | 'bookingType';
export type TrendMetricType = 'adsGmv' | 'organicGmv' | 'totalGmv' | 'totalCost' | 'roas' | 'views' | 'orders';
export type TrendDimensionType = 'day' | 'week' | 'month';
