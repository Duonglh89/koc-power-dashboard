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
          {/* Step Guide: Create your own sheet */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-navy-900 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Cách tự tạo Google Sheet của bạn trong 3 bước:</span>
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
                về máy (đã có sẵn 18 cột và dữ liệu mẫu chuẩn).
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
                ➔ Bấm <strong>Mới ➔ Tải tệp lên</strong> và chọn file vừa tải. File sẽ tự mở thành Google Sheet.
              </li>
              <li>
                <strong>Bước 3:</strong> Trên Google Sheet, bấm nút <strong>Chia sẻ (Share)</strong> ở góc trên bên phải ➔ Chuyển sang:{' '}
                <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  Bất kỳ ai có đường liên kết đều có thể xem
                </span>
                . Sau đó sao chép link và dán vào ô bên dưới.
              </li>
            </ol>
          </div>

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
