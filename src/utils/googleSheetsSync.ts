import Papa from 'papaparse';
import { KOC, VideoItem } from '../types';
import { detectProductCategory } from './productCalculations';

export const LOCAL_STORAGE_SHEET_URL_KEY = 'koc_dashboard_google_sheet_url';
export const LOCAL_STORAGE_AUTO_SYNC_KEY = 'koc_dashboard_auto_sync_enabled';
export const LOCAL_STORAGE_LAST_SYNC_KEY = 'koc_dashboard_last_sync_time';

// Default public Google Sheet template URL (for demo / initial connect)
export const DEFAULT_GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1-u5Rsk2Y8aC2M0X4k4g4-SampleKocDashboard/edit';

// Convert user-provided Google Sheet URL into a direct CSV export endpoint with CORS enabled
export function normalizeGoogleSheetUrl(rawUrl: string): string {
  const url = rawUrl.trim();
  if (!url) return '';

  // Extract sheet ID: /spreadsheets/d/([a-zA-Z0-9_-]+)
  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!idMatch || !idMatch[1]) {
    // If it's already a published CSV link (e.g. /pub?output=csv)
    if (url.includes('google.com') && (url.includes('csv') || url.includes('output=csv'))) {
      return url;
    }
    return '';
  }

  const sheetId = idMatch[1];

  // Extract GID if present (#gid=123 or ?gid=123)
  let gidParam = '';
  const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
  if (gidMatch && gidMatch[1]) {
    gidParam = `&gid=${gidMatch[1]}`;
  }

  // Use Google Visualization API (GViz) CSV export which supports CORS (Access-Control-Allow-Origin: *)
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gidParam}`;
}

export function getStoredSheetUrl(): string {
  try {
    return localStorage.getItem(LOCAL_STORAGE_SHEET_URL_KEY) || '';
  } catch (e) {
    return '';
  }
}

export function setStoredSheetUrl(url: string): void {
  try {
    if (url) {
      localStorage.setItem(LOCAL_STORAGE_SHEET_URL_KEY, url);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_SHEET_URL_KEY);
    }
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export function getStoredAutoSync(): boolean {
  try {
    const val = localStorage.getItem(LOCAL_STORAGE_AUTO_SYNC_KEY);
    return val !== null ? val === 'true' : true; // default true
  } catch (e) {
    return true;
  }
}

export function setStoredAutoSync(enabled: boolean): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_AUTO_SYNC_KEY, String(enabled));
  } catch (e) {
    console.error('Failed to save auto sync preference', e);
  }
}

export function getLastSyncTime(): string {
  try {
    return localStorage.getItem(LOCAL_STORAGE_LAST_SYNC_KEY) || '';
  } catch (e) {
    return '';
  }
}

export function setLastSyncTime(timeStr: string): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_LAST_SYNC_KEY, timeStr);
  } catch (e) {
    console.error('Failed to save last sync time', e);
  }
}

export interface SheetParseResult {
  kocs: KOC[];
  videos: VideoItem[];
  rowCount: number;
  sourceName: string;
}

// Parse flat rows from Google Sheets into both KOC master and VideoItem master
export function parseSheetRows(rows: any[], sourceName: string = 'Google Sheets'): SheetParseResult {
  const kocMap: Record<string, KOC> = {};
  const videosList: VideoItem[] = [];

  rows.forEach((r, idx) => {
    // Determine creator name
    const creatorName = (
      r['Tên nhà sáng tạo'] ||
      r['Creator'] ||
      r['KOC'] ||
      r['Tên KOC'] ||
      r['Tên'] ||
      r['kocName'] ||
      `KOC_${idx + 1}`
    ).trim();

    if (!creatorName) return;

    // Metrics
    const gmv = parseFloat(String(r['Tổng GMV (₫)'] || r['GMV đến từ video (₫)'] || r['GMV'] || r['Doanh thu'] || 0).replace(/[^0-9.-]+/g, '')) || 0;
    const gmvDir = parseFloat(String(r['GMV trực tiếp (₫)'] || r['GMV video (₫)'] || r['GMV trực tiếp'] || 0).replace(/[^0-9.-]+/g, '')) || 0;
    const views = parseFloat(String(r['Lượt xem (VV)'] || r['VV'] || r['Lượt xem'] || r['Views'] || 0).replace(/[^0-9.-]+/g, '')) || 0;
    const clicks = parseFloat(String(r['Lượt nhấp SP'] || r['Lượt nhấp sản phẩm'] || r['Clicks'] || 0).replace(/[^0-9.-]+/g, '')) || 0;
    const orders = parseFloat(String(r['Đơn hàng SKU'] || r['Đơn hàng SKU đã ghi nhận'] || r['Đơn hàng'] || r['Orders'] || 0).replace(/[^0-9.-]+/g, '')) || 0;
    const bookingFee = parseFloat(String(r['Phí Booking (₫)'] || r['Phí booking'] || r['bookingFee'] || 0).replace(/[^0-9.-]+/g, '')) || 0;
    const adsSpend = parseFloat(String(r['Tiền chạy Ads (₫)'] || r['Chi phí Ads'] || r['adsSpend'] || 0).replace(/[^0-9.-]+/g, '')) || 0;

    // Metadata
    const productName = (r['Sản phẩm gắn kèm'] || r['Tên sản phẩm'] || r['Sản phẩm'] || r['Product'] || 'Mì Somen Rau Củ Anpaso').trim();
    const videoTitle = (r['Tiêu đề Video / Link'] || r['Tên Video / Tiêu đề'] || r['Tiêu đề'] || r['Title'] || `Video quảng bá ${productName}`).trim();
    const pic = (r['Nhân sự quản lý'] || r['PIC'] || r['Nhân sự'] || 'Nhân sự 1').trim();
    const targetGroup = (r['Nhóm mục tiêu'] || r['Target Group'] || 'Nhóm mục tiêu 1').trim();
    const bookingType = (r['Loại booking'] || 'Freecast').includes('Booking') ? 'Booking' : 'Freecast';
    const status = (r['Trạng thái'] || 'Hoạt động') as any;
    const dateStr = (r['Thời gian đăng'] || r['Ngày đăng'] || r['Ngày'] || '2026-02-15').trim();

    // Create KOC entry if not yet exists
    if (!kocMap[creatorName]) {
      kocMap[creatorName] = {
        id: `KOC_${Object.keys(kocMap).length + 1}`,
        name: creatorName,
        tiktokHandle: (r['TikTok Handle'] || `@${creatorName.toLowerCase().replace(/[^a-z0-9_]/g, '')}`).trim(),
        tiktokUrl: (r['Link TikTok'] || `https://www.tiktok.com/@${creatorName.toLowerCase().replace(/[^a-z0-9_]/g, '')}`).trim(),
        followers: parseFloat(String(r['Followers'] || 0).replace(/[^0-9.-]+/g, '')) || Math.round(50000 + Math.random() * 450000),
        pic: pic,
        targetGroup: targetGroup,
        bookingType: bookingType,
        status: status,
        bookingDate: dateStr.split(' ')[0] || '2026-01-01',
        videoCount: 0,
        liveCount: 0,
        totalGmv: 0,
        organicGmv: 0,
        adsGmv: 0,
        totalCost: 0,
        roas: 0,
        bookingFee: bookingFee,
        adsSpend: adsSpend,
        affiliateCommission: 0,
        imageRightsFee: 0,
        views: 0,
        impressions: 0,
        clicks: 0,
        orders: 0,
        itemsSold: 0,
      };
    }

    const currentKoc = kocMap[creatorName];
    currentKoc.videoCount += 1;
    currentKoc.totalGmv += gmv;
    currentKoc.organicGmv += gmvDir > 0 ? gmvDir : Math.round(gmv * 0.48);
    currentKoc.adsGmv += gmv - (gmvDir > 0 ? gmvDir : Math.round(gmv * 0.48));
    currentKoc.views += views;
    currentKoc.impressions += Math.round(views * 1.08);
    currentKoc.clicks += clicks;
    currentKoc.orders += orders;
    currentKoc.itemsSold += Math.round(orders * 1.15);
    if (bookingFee > 0) currentKoc.bookingFee = bookingFee;
    if (adsSpend > 0) currentKoc.adsSpend += adsSpend;

    // Create VideoItem entry
    const videoId = String(r['ID Video'] || `VID_${idx + 1}_${Date.now().toString().slice(-4)}`);
    videosList.push({
      id: videoId,
      kocId: currentKoc.id,
      kocName: creatorName,
      title: videoTitle,
      publishTime: dateStr,
      productName: productName,
      messageTag: r['Thông điệp'] || 'Thông điệp chính',
      campaign: r['Chiến dịch'] || 'Chiến dịch TikTok Shop 2026',
      views: views,
      likes: Math.round(views * 0.02),
      comments: Math.round(views * 0.003),
      shares: Math.round(views * 0.001),
      prodImpressions: Math.round(views * 0.15),
      prodClicks: clicks,
      orders: orders,
      gmv: gmv,
      gmvDirect: gmvDir > 0 ? gmvDir : Math.round(gmv * 0.48),
      gmvIndirect: gmv - (gmvDir > 0 ? gmvDir : Math.round(gmv * 0.48)),
      gpm: views > 0 ? Math.round((gmv / views) * 1000) : 0,
      ctr: views > 0 ? Number(((clicks / views) * 100).toFixed(2)) : 0,
      ctor: clicks > 0 ? Number(((orders / clicks) * 100).toFixed(2)) : 0,
    });
  });

  // Calculate costs and ROAS for each KOC
  const finalKocs = Object.values(kocMap).map(k => {
    if (k.adsSpend === 0 && k.adsGmv > 0) {
      k.adsSpend = Math.round(k.adsGmv / 2.35);
    }
    if (k.affiliateCommission === 0) {
      k.affiliateCommission = Math.round(k.totalGmv * 0.08);
    }
    const totalCost = k.bookingFee + k.adsSpend + k.affiliateCommission + k.imageRightsFee;
    const roas = totalCost > 0 ? Number((k.totalGmv / totalCost).toFixed(2)) : 0;

    return {
      ...k,
      totalCost,
      roas,
    };
  });

  return {
    kocs: finalKocs,
    videos: videosList,
    rowCount: rows.length,
    sourceName,
  };
}

// Fetch and parse live data from Google Sheets URL with CORS support & clear error detection
export async function fetchLiveGoogleSheet(sheetUrl: string): Promise<SheetParseResult> {
  const gvizUrl = normalizeGoogleSheetUrl(sheetUrl);
  if (!gvizUrl) {
    throw new Error('Link Google Sheet không đúng định dạng. Vui lòng dán link dạng: https://docs.google.com/spreadsheets/d/.../edit');
  }

  try {
    const res = await fetch(gvizUrl);
    if (!res.ok) {
      throw new Error(`Google trả về mã lỗi HTTP ${res.status}. Vui lòng kiểm tra lại quyền truy cập.`);
    }

    const text = await res.text();

    // Check if Google redirected to a login page (Private Sheet)
    if (text.includes('<!DOCTYPE html>') || text.includes('<html') || text.includes('ServiceLogin') || text.includes('accounts.google.com')) {
      throw new Error(
        'Google Sheet chưa bật quyền xem công khai!\n👉 Cách khắc phục:\n1. Mở file Google Sheet trên trình duyệt\n2. Bấm nút "Chia sẻ" (Share) ở góc trên bên phải\n3. Chuyển mục Quyền truy cập chung thành: "Bất kỳ ai có đường liên kết đều có thể xem"\n4. Bấm Xong rồi bấm thử lại tại đây.'
      );
    }

    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data || results.data.length === 0) {
            reject(new Error('Bảng tính Google Sheet chưa có dòng dữ liệu nào!'));
            return;
          }

          try {
            const parsed = parseSheetRows(results.data, 'Google Sheet Trực Tuyến');
            if (parsed.kocs.length === 0) {
              reject(
                new Error(
                  'Không tìm thấy dòng KOC nào hợp lệ trong Sheet. Hãy đảm bảo cột đầu tiên là "Tên nhà sáng tạo" hoặc "Tên KOC" (bạn có thể bấm nút "Tải File Mẫu (.CSV)" để xem chuẩn cột).'
                )
              );
              return;
            }
            setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            resolve(parsed);
          } catch (err: any) {
            reject(new Error('Lỗi xử lý dữ liệu từ Sheet: ' + err.message));
          }
        },
        error: (err) => {
          reject(new Error('Lỗi phân tích cú pháp CSV: ' + err.message));
        },
      });
    });
  } catch (err: any) {
    throw new Error(err.message || 'Không thể kết nối tới Google Sheet');
  }
}

// Generate and trigger download of a pre-populated CSV template for Google Sheets
export function downloadGoogleSheetCSVTemplate() {
  const headers = [
    'Tên nhà sáng tạo',
    'TikTok Handle',
    'Followers',
    'Nhân sự quản lý',
    'Nhóm mục tiêu',
    'Loại booking',
    'Trạng thái',
    'Thời gian đăng',
    'Sản phẩm gắn kèm',
    'Nhóm ngành hàng',
    'Tiêu đề Video / Link',
    'Lượt xem (VV)',
    'Lượt nhấp SP',
    'Đơn hàng SKU',
    'Tổng GMV (₫)',
    'GMV trực tiếp (₫)',
    'Phí Booking (₫)',
    'Tiền chạy Ads (₫)',
  ];

  const sampleRows = [
    ['Mê trái cây 🍇', '@me_trai_cay', '850000', 'Nhân sự 1', 'Nhóm mục tiêu 1', 'Freecast', 'Hoạt động', '2026-02-10', 'Dầu Ăn Dặm Ép Lạnh Nguyên Chất Anpaso 100ml', 'Dầu Ăn & Gia Vị Hữu Cơ', 'Bổ sung chất béo tốt cho bé ăn dặm 🌱 #dauandam #anpaso', '220000', '1171', '180', '34500000', '28900000', '0', '12500000'],
    ['Hải Mây 🐼☁️', '@haimay_daily', '620000', 'Nhân sự 2', 'Nhóm mục tiêu 2', 'Booking', 'Hoạt động', '2026-02-12', 'Mì Somen Rau Củ Anpaso Cho Bé Ăn Dặm 300g', 'Mì & Nui Rau Củ Ăn Dặm', 'Mì rau củ somen cho bé 7M tập nhai nuốt cực tốt #misomen', '85000', '520', '45', '7500000', '6500000', '3000000', '1200000'],
    ['Dưỡng Ngầm Skincare ❤️', '@duongngam_beauty', '430000', 'Nhân sự 1', 'Nhóm mục tiêu 1', 'Freecast', 'Hoạt động', '2026-02-15', 'Bột Nêm Rau Củ Tự Nhiên Không Muối Anpaso 60g', 'Dầu Ăn & Gia Vị Hữu Cơ', 'Bí quyết nêm cháo ngọt thanh tự nhiên cho con #botnem #andam', '145000', '980', '120', '18600000', '15200000', '0', '6400000'],
    ['ThươngPinK', '@thuongpink_pinky', '510000', 'Nhân sự 3', 'Nhóm mục tiêu 2', 'Booking', 'Hoạt động', '2026-02-18', 'Bánh Gạo Hữu Cơ Ăn Dặm Tự Tan Vị Táo & Chuối', 'Bánh & Snack Dinh Dưỡng', 'Bánh ăn dặm tự tan không lo hóc nghẹn cho bé #banhandam', '310000', '1540', '210', '24500000', '19800000', '4500000', '8000000'],
    ['Bác Gấu Đảm Đang', '@bacgau_cook', '780000', 'Nhân sự 2', 'Nhóm mục tiêu 1', 'Freecast', 'Hoạt động', '2026-02-20', 'Combo Ăn Dặm Toàn Diện 5 Món Tiết Kiệm Cho Mẹ', 'Combo & Set Quà Tiết Kiệm', 'Set quà ăn dặm siêu hời tháng này các mẹ ơi #combodinhduong', '420000', '2100', '340', '68500000', '54000000', '0', '22000000'],
    ['Mẹ Voi Con', '@me_voicon', '290000', 'Nhân sự 1', 'Nhóm mục tiêu 3', 'Freecast', 'Hoạt động', '2026-02-22', 'Nui Chữ Cái Rau Củ Hữu Cơ Cho Bé 200g', 'Mì & Nui Rau Củ Ăn Dặm', 'Tập bốc nhón với nui chữ cái sắc màu #nuiandam #anpaso', '95000', '480', '65', '8900000', '7800000', '0', '2500000'],
  ];

  const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'KOC_Power_Dashboard_GoogleSheet_Template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
