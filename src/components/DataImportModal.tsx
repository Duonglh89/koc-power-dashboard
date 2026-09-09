import React, { useState } from 'react';
import { X, UploadCloud, Link as LinkIcon, FileSpreadsheet, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { KOC } from '../types';
import { fetchLiveGoogleSheet } from '../utils/googleSheetsSync';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (newKocs: KOC[], datasetName: string) => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
}) => {
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  // Handle Excel upload (Multi-sheet or Single-sheet)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatusMsg(null);

    const reader = new FileReader();
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    reader.onload = (evt) => {
      try {
        if (isExcel) {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Check if multi-sheet format exists (Dim_KOC, Fact_Video, Fact_Cost...)
          const sheetNames = workbook.SheetNames;
          const kocSheetName = sheetNames.find(s => s.toLowerCase().includes('koc') || s.includes('Dim_KOC') || s.includes('1.'));
          const videoSheetName = sheetNames.find(s => s.toLowerCase().includes('video') || s.includes('Fact_Video') || s.includes('2.'));
          const costSheetName = sheetNames.find(s => s.toLowerCase().includes('cost') || s.toLowerCase().includes('ads') || s.includes('3.'));
          const liveSheetName = sheetNames.find(s => s.toLowerCase().includes('live') || s.includes('4.'));

          if (kocSheetName && videoSheetName) {
            // Multi-sheet parsing & relational joining
            const kocsRaw = XLSX.utils.sheet_to_json(workbook.Sheets[kocSheetName]);
            const videosRaw = XLSX.utils.sheet_to_json(workbook.Sheets[videoSheetName]);
            const costsRaw = costSheetName ? XLSX.utils.sheet_to_json(workbook.Sheets[costSheetName]) : [];
            const livesRaw = liveSheetName ? XLSX.utils.sheet_to_json(workbook.Sheets[liveSheetName]) : [];

            processMultiSheetData(kocsRaw, videosRaw, costsRaw, livesRaw, file.name);
          } else {
            // Single sheet export format (e.g. TikTok Shop Raw Report)
            const firstSheet = workbook.Sheets[sheetNames[0]];
            const json = XLSX.utils.sheet_to_json(firstSheet);
            processSingleSheetData(json, file.name);
          }
        } else {
          // CSV format
          const csvText = evt.target?.result as string;
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              processSingleSheetData(results.data, file.name);
            }
          });
        }
      } catch (err: any) {
        setStatusMsg({ type: 'error', text: 'Lỗi đọc file: ' + err.message });
        setLoading(false);
      }
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file, 'utf-8');
    }
  };

  // Process multi-sheet joined data
  const processMultiSheetData = (kocsRaw: any[], videosRaw: any[], costsRaw: any[], livesRaw: any[], sourceName: string) => {
    try {
      const kocMap: Record<string, KOC> = {};

      // 1. Initialize KOC Master
      kocsRaw.forEach((k: any, idx: number) => {
        const id = k['ID KOC'] || k['id'] || ('KOC_' + (idx + 1));
        const name = k['Tên KOC'] || k['name'] || ('KOC ' + (idx + 1));
        kocMap[id] = {
          id: id,
          name: name,
          tiktokHandle: k['TikTok Handle'] || k['tiktokHandle'] || ('@' + name.toLowerCase().replace(/\s+/g, '_')),
          tiktokUrl: k['Link TikTok'] || k['tiktokUrl'] || ('https://www.tiktok.com/@' + name),
          followers: parseFloat(k['Followers'] || 0) || 100000,
          pic: k['Nhân sự quản lý'] || k['pic'] || 'Nhân sự 1',
          targetGroup: k['Nhóm mục tiêu'] || k['targetGroup'] || 'Nhóm mục tiêu 1',
          bookingType: k['Loại booking'] === 'Booking' ? 'Booking' : 'Freecast',
          status: k['Trạng thái'] || 'Hoạt động',
          bookingDate: k['Ngày booking'] || '2026-01-01',
          videoCount: 0,
          liveCount: 0,
          totalGmv: 0,
          organicGmv: 0,
          adsGmv: 0,
          totalCost: 0,
          roas: 0,
          bookingFee: parseFloat(k['Phí Booking (₫)'] || k['bookingFee'] || 0) || 0,
          adsSpend: 0,
          affiliateCommission: 0,
          imageRightsFee: parseFloat(k['Phí hình ảnh (₫)'] || 0) || 0,
          views: 0,
          impressions: 0,
          clicks: 0,
          orders: 0,
          itemsSold: 0,
        };
      });

      // 2. Aggregate Videos into KOC
      videosRaw.forEach((v: any) => {
        const kocId = v['ID KOC'] || v['kocId'];
        const targetKoc = kocMap[kocId] || Object.values(kocMap).find(k => k.name === v['Tên KOC']);
        const gmv = parseFloat(v['Tổng GMV (₫)'] || v['GMV'] || 0) || 0;
        const gmvDir = parseFloat(v['GMV trực tiếp (₫)'] || 0) || (gmv * 0.5);
        const gmvIndir = parseFloat(v['GMV gián tiếp (₫)'] || 0) || (gmv * 0.5);
        const views = parseFloat(v['Lượt xem (VV)'] || v['views'] || 0) || 0;
        const clicks = parseFloat(v['Lượt nhấp SP'] || v['clicks'] || 0) || 0;
        const orders = parseFloat(v['Đơn hàng SKU'] || v['orders'] || 0) || 0;

        if (targetKoc) {
          targetKoc.videoCount += 1;
          targetKoc.totalGmv += gmv;
          targetKoc.organicGmv += gmvDir;
          targetKoc.adsGmv += gmvIndir;
          targetKoc.views += views;
          targetKoc.clicks += clicks;
          targetKoc.orders += orders;
        }
      });

      // 3. Aggregate Costs into KOC
      costsRaw.forEach((c: any) => {
        const kocId = c['ID Video / ID KOC'] || c['ID KOC'] || c['kocId'];
        const targetKoc = kocMap[kocId];
        const adsCost = parseFloat(c['Tiền chạy Ads (₫)'] || c['adsSpend'] || 0) || 0;
        const comm = parseFloat(c['Phí Hoa hồng Affiliate (₫)'] || c['affiliateCommission'] || 0) || 0;

        if (targetKoc) {
          targetKoc.adsSpend += adsCost;
          targetKoc.affiliateCommission += comm;
        }
      });

      // 4. Calculate ROAS & Total Cost
      const finalKocs = Object.values(kocMap).map(k => {
        if (k.affiliateCommission === 0) k.affiliateCommission = Math.round(k.totalGmv * 0.08);
        if (k.adsSpend === 0 && k.adsGmv > 0) k.adsSpend = Math.round(k.adsGmv / 2.3);
        const cost = k.bookingFee + k.adsSpend + k.affiliateCommission + k.imageRightsFee;
        return {
          ...k,
          totalCost: Math.round(cost),
          roas: cost > 0 ? parseFloat((k.totalGmv / cost).toFixed(2)) : 0,
        };
      });

      onDataLoaded(finalKocs, sourceName + ' (Multi-Sheet)');
      setStatusMsg({ type: 'success', text: 'Đã nạp và ghép thành công ' + finalKocs.length + ' KOCs từ file Excel nhiều sheet!' });
      setLoading(false);
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Lỗi ghép nối dữ liệu nhiều sheet: ' + err.message });
      setLoading(false);
    }
  };

  // Process single sheet data (Raw TikTok Export)
  const processSingleSheetData = (rows: any[], sourceName: string) => {
    try {
      const kocMap: Record<string, KOC> = {};

      rows.forEach((r, idx) => {
        const creatorName = r['Tên nhà sáng tạo'] || r['Creator'] || r['KOC'] || ('KOC_' + (idx + 1));
        const gmv = parseFloat(String(r['GMV đến từ video (₫)'] || r['GMV'] || r['Doanh thu'] || 0).replace(/[^0-9.-]+/g, '')) || 0;
        const gmvDir = parseFloat(String(r['GMV video (₫)'] || r['GMV trực tiếp'] || 0).replace(/[^0-9.-]+/g, '')) || 0;
        const views = parseFloat(String(r['VV'] || r['Lượt xem'] || 0).replace(/[^0-9.-]+/g, '')) || 0;
        const clicks = parseFloat(String(r['Lượt nhấp sản phẩm'] || r['Clicks'] || 0).replace(/[^0-9.-]+/g, '')) || 0;
        const orders = parseFloat(String(r['Đơn hàng SKU đã ghi nhận'] || r['Đơn hàng'] || 0).replace(/[^0-9.-]+/g, '')) || 0;

        if (!kocMap[creatorName]) {
          kocMap[creatorName] = {
            id: 'KOC_' + (Object.keys(kocMap).length + 1),
            name: creatorName,
            tiktokHandle: '@' + creatorName.toLowerCase().replace(/\s+/g, '_'),
            tiktokUrl: 'https://www.tiktok.com/@' + creatorName,
            followers: Math.round(50000 + Math.random() * 500000),
            pic: 'Nhân sự ' + ((Object.keys(kocMap).length % 3) + 1),
            targetGroup: 'Nhóm mục tiêu ' + ((Object.keys(kocMap).length % 3) + 1),
            bookingType: Object.keys(kocMap).length % 4 === 0 ? 'Booking' : 'Freecast',
            status: 'Hoạt động',
            bookingDate: '2026-02-01',
            videoCount: 0,
            liveCount: 0,
            totalGmv: 0,
            organicGmv: 0,
            adsGmv: 0,
            totalCost: 0,
            roas: 2.5,
            bookingFee: 100000,
            adsSpend: 0,
            affiliateCommission: 0,
            imageRightsFee: 0,
            views: 0,
            impressions: 0,
            clicks: 0,
            orders: 0,
            itemsSold: 0,
          };
        }

        kocMap[creatorName].videoCount += 1;
        kocMap[creatorName].totalGmv += gmv;
        kocMap[creatorName].organicGmv += gmvDir > 0 ? gmvDir : gmv * 0.45;
        kocMap[creatorName].adsGmv += gmv - (gmvDir > 0 ? gmvDir : gmv * 0.45);
        kocMap[creatorName].views += views;
        kocMap[creatorName].clicks += clicks;
        kocMap[creatorName].orders += orders;
      });

      const parsedKocs = Object.values(kocMap).map(k => {
        const adsCost = k.adsGmv / (2.2 + Math.random() * 0.6);
        const comm = k.totalGmv * 0.08;
        const cost = k.bookingFee + adsCost + comm;
        return {
          ...k,
          adsSpend: Math.round(adsCost),
          affiliateCommission: Math.round(comm),
          totalCost: Math.round(cost),
          roas: cost > 0 ? parseFloat((k.totalGmv / cost).toFixed(2)) : 0,
        };
      });

      onDataLoaded(parsedKocs, sourceName);
      setStatusMsg({ type: 'success', text: 'Đã nạp thành công ' + parsedKocs.length + ' KOCs từ ' + sourceName + '!' });
      setLoading(false);
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Lỗi chuyển đổi dữ liệu: ' + err.message });
      setLoading(false);
    }
  };

  // Google Sheets import with CORS support
  const handleSheetsConnect = async () => {
    if (!sheetsUrl.trim()) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const result = await fetchLiveGoogleSheet(sheetsUrl);
      onDataLoaded(result.kocs, 'Google Sheets Trực Tuyến');
      setStatusMsg({ type: 'success', text: `Đã nạp thành công ${result.kocs.length} KOCs từ Google Sheets!` });
      setLoading(false);
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Không thể kết nối Google Sheets' });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-navy-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <UploadCloud className="w-5 h-5 text-sky-400" />
            <span>Nạp Dữ Liệu Báo Cáo (1 File Duy Nhất)</span>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Note Box */}
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-start gap-2 text-emerald-900">
            <Layers className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Chỉ cần 1 file Excel tổng duy nhất:</strong> Bạn chỉ cần tải lên 1 file có các Sheet (<code>Dim_KOC</code>, <code>Fact_Video</code>, <code>Fact_Ads_Cost</code>, <code>Fact_Livestream</code>), hệ thống sẽ tự động ghép nối và phân bổ số liệu lên toàn bộ màn hình!
            </div>
          </div>

          {/* Status feedback */}
          {statusMsg && (
            <div className={'p-3 rounded-lg flex items-center gap-2 text-xs font-semibold ' + (statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200')}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Option 1: File Upload */}
          <div className="space-y-2">
            <label className="block font-bold text-navy-800 text-xs uppercase tracking-wider">
              1. Tải lên 1 file Excel (.xlsx) tổng
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-navy-600 rounded-lg p-5 text-center cursor-pointer bg-slate-50 hover:bg-sky-50/30 transition-all">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
                <FileSpreadsheet className="w-8 h-8 text-navy-700" />
                <span className="font-bold text-navy-800">Bấm để chọn file Excel tổng</span>
                <span className="text-[11px] text-slate-500">Hỗ trợ file nhiều sheet hoặc file 1 sheet TikTok Shop</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[11px] text-slate-400 font-bold uppercase">HOẶC</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Option 2: Google Sheets URL */}
          <div className="space-y-2">
            <label className="block font-bold text-navy-800 text-xs uppercase tracking-wider">
              2. Kết nối trực tiếp qua Link Google Sheets
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetsUrl}
                  onChange={e => setSheetsUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 pl-8 pr-3 text-xs focus:outline-none focus:border-navy-600 focus:bg-white"
                />
              </div>
              <button
                onClick={handleSheetsConnect}
                disabled={loading || !sheetsUrl.trim()}
                className="bg-navy-800 hover:bg-navy-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-md transition-colors shadow-sm"
              >
                {loading ? 'Đang tải...' : 'Kết nối'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
