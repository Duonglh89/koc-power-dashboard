import React from 'react';
import { UploadCloud, FileSpreadsheet, RefreshCw, HelpCircle, Download } from 'lucide-react';
import { downloadExcelTemplate } from '../utils/templateGenerator';

import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenImport: () => void;
  onOpenSchema: () => void;
  onOpenGoogleSheets: () => void;
  isGoogleSheetConnected: boolean;
  onQuickSync: () => void;
  isSyncing: boolean;
  lastSyncTime?: string;
  currentDataset: string;
  onToggleDataset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenImport,
  onOpenSchema,
  onOpenGoogleSheets,
  isGoogleSheetConnected,
  onQuickSync,
  isSyncing,
  lastSyncTime,
  currentDataset,
  onToggleDataset,
}) => {
  const navTabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'productAnalytics', label: 'Sản phẩm bán chạy' },
    { id: 'kocList', label: 'Danh sách KOC' },
    { id: 'kocDetail', label: 'Chi tiết KOC' },
    { id: 'kocSuggest', label: 'Gợi ý KOC' },
  ];

  return (
    <header className="bg-navy-800 text-white shadow-md sticky top-0 z-30 flex flex-wrap items-center justify-between px-6 py-2.5 border-b border-navy-700">
      {/* Top Navigation Tabs */}
      <nav className="flex items-center space-x-1 sm:space-x-4">
        {navTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`px-4 py-2 rounded-md font-bold text-sm transition-all relative ${
                isActive
                  ? 'text-white bg-navy-600/80 shadow-inner'
                  : 'text-slate-200 hover:text-white hover:bg-navy-700/60'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-sky-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Action Tools */}
      <div className="flex items-center gap-2.5 mt-2 sm:mt-0 text-xs">
        {/* Toggle Dataset Button */}
        <button
          onClick={onToggleDataset}
          className="flex items-center gap-1.5 bg-navy-700 hover:bg-navy-600 text-slate-200 hover:text-white px-3 py-1.5 rounded-md border border-navy-600 transition-colors font-medium shadow-sm"
          title="Bấm để chuyển đổi giữa Dữ liệu mẫu và Dữ liệu thật Anpaso"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
          <span>Bộ số: <strong className="text-sky-300">{currentDataset}</strong></span>
        </button>

        {/* Data Format Guide & Template Download */}
        <button
          onClick={onOpenSchema}
          className="flex items-center gap-1.5 bg-navy-700 hover:bg-navy-600 text-slate-200 hover:text-white px-3 py-1.5 rounded-md border border-navy-600 transition-colors font-medium"
          title="Xem quy chuẩn định dạng dữ liệu cho từng mục"
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Format Dữ liệu &amp; Template</span>
        </button>

        {/* Google Sheets Database Connection Button */}
        <button
          onClick={onOpenGoogleSheets}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-all font-medium ${
            isGoogleSheetConnected
              ? 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-500/50 shadow-sm'
              : 'bg-navy-700 hover:bg-navy-600 text-slate-200 hover:text-white border-navy-600'
          }`}
          title={isGoogleSheetConnected ? `Đang liên kết Google Sheets (Cập nhật: ${lastSyncTime || 'vừa xong'}). Bấm để cấu hình.` : 'Kết nối Google Sheets làm Cơ sở dữ liệu'}
        >
          {isGoogleSheetConnected ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ) : (
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>
            {isGoogleSheetConnected ? (
              <>Sheet: <strong className="text-white">Online</strong></>
            ) : (
              'Database Google Sheet'
            )}
          </span>
        </button>

        {/* Quick Sync Button */}
        {isGoogleSheetConnected && (
          <button
            onClick={onQuickSync}
            disabled={isSyncing}
            className="p-1.5 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white transition-colors flex items-center justify-center"
            title="Đồng bộ lại dữ liệu từ Google Sheet ngay lập tức"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* Upload Excel Modal */}
        <button
          onClick={onOpenImport}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 rounded-md font-semibold shadow-sm transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Nạp Excel / File</span>
        </button>
      </div>
    </header>
  );
};
