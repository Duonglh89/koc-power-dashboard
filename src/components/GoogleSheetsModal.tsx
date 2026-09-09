import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Link as LinkIcon,
  RefreshCw,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  HelpCircle,
  Code2,
  Copy,
} from 'lucide-react';
import {
  normalizeGoogleSheetUrl,
  fetchLiveGoogleSheet,
  getStoredSheetUrl,
  setStoredSheetUrl,
  getStoredAutoSync,
  setStoredAutoSync,
  getLastSyncTime,
  downloadGoogleSheetCSVTemplate,
} from '../utils/googleSheetsSync';
import { KOC, VideoItem } from '../types';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (newKocs: KOC[], newVideos: VideoItem[], datasetName: string) => void;
  currentConnectedUrl: string;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
  currentConnectedUrl,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [lastSync, setLastSync] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'template' | 'script'>('template');
  const [copiedScript, setCopiedScript] = useState(false);

  const appsScriptCode = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: TỰ ĐỘNG KHỞI TẠO BẢNG TÍNH & ĐỒNG BỘ KOC DASHBOARD
 * =========================================================================
 * 1. Mở Google Sheet -> Tiện ích mở rộng (Extensions) -> Apps Script
 * 2. Xóa hết code cũ, dán đoạn này vào và bấm Lưu (Ctrl + S)
 * 3. Bấm "Chạy" (Run) hàm "khoiTaoBangTinhKOC" hoặc reload lại Sheet
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 KOC Dashboard')
    .addItem('✨ 1. Tự động tạo Bảng chuẩn & Dữ liệu mẫu', 'khoiTaoBangTinhKOC')
    .addItem('📋 2. Lấy link kết nối Dashboard', 'layLinkKetNoi')
    .addToUi();
}

function khoiTaoBangTinhKOC() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  sheet.setName('Data_KOC');
  sheet.clear();

  var headers = [
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
    'Phí Booking (₫)',
    'Tiền chạy Ads (₫)'
  ];

  var sampleData = [
    ['Mê trái cây 🍇', '@me_trai_cay', 850000, 'Nhân sự 1', 'Nhóm mục tiêu 1', 'Freecast', 'Hoạt động', '2026-02-10 14:20:00', 'Dầu Ăn Dặm Ép Lạnh Nguyên Chất Anpaso 100ml', 'Dầu Ăn & Gia Vị Hữu Cơ', 'Bổ sung chất béo tốt cho bé ăn dặm 🌱 #dauandam #anpaso', 220000, 1171, 180, 34500000, 0, 12500000],
    ['Hải Mây 🐼☁️', '@haimay_daily', 620000, 'Nhân sự 2', 'Nhóm mục tiêu 2', 'Booking', 'Hoạt động', '2026-02-12 18:45:00', 'Mì Somen Rau Củ Anpaso Cho Bé Ăn Dặm 300g', 'Mì & Nui Rau Củ Ăn Dặm', 'Mì rau củ somen cho bé 7M tập nhai nuốt cực tốt #misomen', 85000, 520, 45, 7500000, 3000000, 1200000],
    ['Dưỡng Ngầm Skincare ❤️', '@duongngam_beauty', 430000, 'Nhân sự 1', 'Nhóm mục tiêu 1', 'Freecast', 'Hoạt động', '2026-02-15 09:15:00', 'Bột Nêm Rau Củ Tự Nhiên Không Muối Anpaso 60g', 'Dầu Ăn & Gia Vị Hữu Cơ', 'Bí quyết nêm cháo ngọt thanh tự nhiên cho con #botnem #andam', 145000, 980, 120, 18600000, 0, 6400000],
    ['ThươngPinK', '@thuongpink_pinky', 510000, 'Nhân sự 3', 'Nhóm mục tiêu 2', 'Booking', 'Hoạt động', '2026-02-18 20:00:00', 'Bánh Gạo Hữu Cơ Ăn Dặm Tự Tan Vị Táo & Chuối', 'Bánh & Snack Dinh Dưỡng', 'Bánh ăn dặm tự tan không lo hóc nghẹn cho bé #banhandam', 310000, 1540, 210, 24500000, 4500000, 8000000],
    ['Bác Gấu Đảm Đang', '@bacgau_cook', 780000, 'Nhân sự 2', 'Nhóm mục tiêu 1', 'Freecast', 'Hoạt động', '2026-02-20 11:30:00', 'Combo Ăn Dặm Toàn Diện 5 Món Tiết Kiệm Cho Mẹ', 'Combo & Set Quà Tiết Kiệm', 'Set quà ăn dặm siêu hời tháng này các mẹ ơi #combodinhduong', 420000, 2100, 340, 68500000, 0, 22000000],
    ['Mẹ Voi Con', '@me_voicon', 290000, 'Nhân sự 1', 'Nhóm mục tiêu 3', 'Freecast', 'Hoạt động', '2026-02-22 16:10:00', 'Nui Chữ Cái Rau Củ Hữu Cơ Cho Bé 200g', 'Mì & Nui Rau Củ Ăn Dặm', 'Tập bốc nhón với nui chữ cái sắc màu #nuiandam #anpaso', 95000, 480, 65, 8900000, 0, 2500000]
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#0f172a');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 38);

  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  sheet.getRange(2, 3, sampleData.length, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 8, sampleData.length, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange(2, 12, sampleData.length, 3).setNumberFormat('#,##0');
  sheet.getRange(2, 15, sampleData.length, 3).setNumberFormat('#,##0" ₫"');

  sheet.getRange(2, 6, sampleData.length, 3).setHorizontalAlignment('center');
  sheet.getRange(1, 1, sampleData.length + 1, headers.length).setBorder(true, true, true, true, true, true, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);
  
  for (var i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }

  sheet.setFrozenRows(1);
  SpreadsheetApp.getUi().alert('✅ ĐÃ TẠO XONG BẢNG TÍNH!\\n\\nHãy bấm Chia sẻ (Share) -> Bất kỳ ai có liên kết đều có thể xem.');
}

function layLinkKetNoi() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var url = ss.getUrl();
  SpreadsheetApp.getUi().alert('🔗 Link kết nối Dashboard:\\n\\n' + url);
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredSheetUrl();
      setUrlInput(stored || currentConnectedUrl || '');
      setAutoSync(getStoredAutoSync());
      setLastSync(getLastSyncTime());
      setStatusMsg(null);
    }
  }, [isOpen, currentConnectedUrl]);

  if (!isOpen) return null;

  const handleConnect = async (targetUrl?: string) => {
    const finalUrl = (targetUrl || urlInput).trim();
    if (!finalUrl) {
      setStatusMsg({ type: 'error', text: 'Vui lòng nhập đường link Google Sheet của bạn!' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const result = await fetchLiveGoogleSheet(finalUrl);
      setStoredSheetUrl(finalUrl);
      setStoredAutoSync(autoSync);
      onDataLoaded(result.kocs, result.videos, 'Google Sheet Trực Tuyến');
      const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSync(now);
      setStatusMsg({
        type: 'success',
        text: `Đồng bộ thành công! Đã nạp ${result.kocs.length} KOCs và ${result.videos.length} video từ Google Sheet.`,
      });
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Lỗi kết nối Google Sheet' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setStoredSheetUrl('');
    setUrlInput('');
    setStatusMsg({ type: 'success', text: 'Đã hủy liên kết Google Sheet. Hệ thống sẽ dùng bộ số mẫu mặc định.' });
  };

  return (
    <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white px-6 py-4 flex items-center justify-between border-b border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>Cơ Sở Dữ Liệu Google Sheets</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Miễn phí 100%
                </span>
              </h3>
              <p className="text-slate-400 text-[11px]">
                Dữ liệu KOC &amp; Sản phẩm sẽ tự động cập nhật liên tục từ bảng tính Google Sheet của bạn
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
          {/* Sub Tab Switcher: Cách 1 vs Cách 2 */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('template')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeSubTab === 'template'
                  ? 'bg-navy-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cách 1: Tải File CSV Mẫu</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('script')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeSubTab === 'script'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Cách 2: Dùng Google Apps Script (Tự động 100%)</span>
            </button>
          </div>

          {/* Tab 1: CSV Template Guide */}
          {activeSubTab === 'template' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="font-bold text-navy-900 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Cách tạo Google Sheet từ file CSV mẫu:</span>
                </div>
                <button
                  onClick={downloadGoogleSheetCSVTemplate}
                  className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải File Mẫu (.CSV)</span>
                </button>
              </div>

              <ol className="space-y-2 text-[11px] text-slate-600 pl-4 list-decimal">
                <li>
                  <strong>Bước 1:</strong> Bấm{' '}
                  <button onClick={downloadGoogleSheetCSVTemplate} className="text-sky-600 font-bold underline inline">
                    Tải File Mẫu (.CSV)
                  </button>{' '}
                  về máy (đã có sẵn tiêu đề chuẩn và cột <strong>Tổng GMV (₫)</strong>).
                </li>
                <li>
                  <strong>Bước 2:</strong> Mở{' '}
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-600 font-bold underline inline-flex items-center gap-0.5"
                  >
                    Google Drive <ExternalLink className="w-2.5 h-2.5 inline" />
                  </a>{' '}
                  ➔ Bấm <strong>Mới ➔ Tải tệp lên</strong> và chọn file vừa tải.
                </li>
                <li>
                  <strong>Bước 3:</strong> Mở file trên Google Sheet, bấm <strong>Chia sẻ (Share)</strong> ở góc trên bên phải ➔ Chuyển sang:{' '}
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    Bất kỳ ai có đường liên kết đều có thể xem
                  </span>
                  . Sau đó dán link vào ô bên dưới.
                </li>
              </ol>
            </div>
          )}

          {/* Tab 2: Google Apps Script Guide */}
          {activeSubTab === 'script' && (
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Chạy 1 lần - Tự tạo bảng và menu KOC Dashboard:</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="flex items-center gap-1.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg shadow-xs active:scale-95 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedScript ? 'Đã sao chép!' : 'Sao chép mã Script'}</span>
                </button>
              </div>

              <ol className="space-y-1.5 text-[11px] text-slate-700 pl-4 list-decimal">
                <li>Mở một Google Sheet trắng ➔ Chọn <strong>Tiện ích mở rộng (Extensions) ➔ Apps Script</strong>.</li>
                <li>Xóa hết nội dung cũ, dán đoạn mã bên dưới vào rồi bấm <strong>Lưu (Ctrl + S)</strong>.</li>
                <li>Bấm nút <strong>Chạy (Run)</strong> với hàm <code>khoiTaoBangTinhKOC</code> (hoặc tải lại sheet và bấm menu <strong>🚀 KOC Dashboard</strong>).</li>
                <li>Bấm <strong>Chia sẻ (Share) ➔ Bất kỳ ai có liên kết đều có thể xem</strong> và dán link vào ô bên dưới!</li>
              </ol>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-200 p-3 rounded-lg text-[10px] font-mono max-h-36 overflow-y-auto leading-relaxed border border-slate-700 select-all">
                  {appsScriptCode}
                </pre>
              </div>
            </div>
          )}

          {/* Input URL Section */}
          <div className="space-y-2">
            <label className="block font-bold text-navy-900 text-xs">
              Đường link Google Sheet của bạn:
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1abc.../edit"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Ví dụ: <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit</code>
            </p>
          </div>

          {/* Options: Auto Sync */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={e => setAutoSync(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
              />
              <span className="font-semibold text-slate-700">Tự động đồng bộ liên tục</span>
            </label>
            {lastSync && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Cập nhật gần nhất: <strong>{lastSync}</strong></span>
              </div>
            )}
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              )}
              <div className="font-medium leading-relaxed">{statusMsg.text}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <div>
              {getStoredSheetUrl() && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline"
                >
                  Hủy liên kết Sheet
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={loading || !urlInput.trim()}
                onClick={() => handleConnect()}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                  loading || !urlInput.trim()
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Đang kết nối & tải dữ liệu...' : 'Lưu & Đồng Bộ Ngay'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
