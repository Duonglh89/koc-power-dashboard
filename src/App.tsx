import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { KocListTab } from './components/KocListTab';
import { KocDetailTab } from './components/KocDetailTab';
import { KocSuggestTab } from './components/KocSuggestTab';
import { ProductAnalyticsTab } from './components/ProductAnalyticsTab';
import { DataImportModal } from './components/DataImportModal';
import { DataSchemaModal } from './components/DataSchemaModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';

import { mockKocs, mockVideos, mockLivestreams, mockDailyTrends } from './data/mockData';
import { anpasoKocs, anpasoVideos } from './data/anpasoRealData';
import { FilterState, KOC, VideoItem, DailyTrendItem, TabType } from './types';
import { filterAndScaleKocs } from './utils/calculations';
import {
  getStoredSheetUrl,
  getStoredAutoSync,
  getLastSyncTime,
  fetchLiveGoogleSheet,
} from './utils/googleSheetsSync';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('overview');

// Datasets: Use Real Data (Anpaso) as default, completely removing Mẫu Chuẩn
  const [currentDataset, setCurrentDataset] = useState<string>('Dữ liệu thực tế (Anpaso)');
  const [kocsData, setKocsData] = useState<KOC[]>(anpasoKocs);
  const [videosData, setVideosData] = useState<VideoItem[]>(anpasoVideos);
  const [trendsData, setTrendsData] = useState<DailyTrendItem[]>(mockDailyTrends);

  // Google Sheets Live Sync State
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>(() => getStoredSheetUrl());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => getLastSyncTime());

  // Selected KOC for drill-down
  const [selectedKocId, setSelectedKocId] = useState<string>(anpasoKocs[0]?.id || '');

  // Modals
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    timeRange: 'this_year',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    pic: 'All',
    targetGroup: 'All',
    bookingType: 'All',
    status: 'All',
    kocId: 'All',
    kocName: 'All',
    bookingDate: 'All',
    searchQuery: '',
  });

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      timeRange: 'this_year',
      startDate: '2026-01-01',
      endDate: '2026-03-31',
      pic: 'All',
      targetGroup: 'All',
      bookingType: 'All',
      status: 'All',
      kocId: 'All',
      kocName: 'All',
      bookingDate: 'All',
      searchQuery: '',
    });
  };

  const handleSelectKocAndDrilldown = (kocId: string) => {
    setSelectedKocId(kocId);
    setActiveTab('kocDetail');
  };

  const handleResetToRealData = () => {
    setCurrentDataset('Dữ liệu thực tế (Anpaso)');
    setKocsData(anpasoKocs);
    setVideosData(anpasoVideos);
    if (anpasoKocs.length > 0) {
      setSelectedKocId(anpasoKocs[0].id);
    }
  };

  const handleDataLoaded = (newKocs: KOC[], datasetName: string) => {
    setKocsData(newKocs);
    setCurrentDataset(datasetName);
    if (newKocs.length > 0) {
      setSelectedKocId(newKocs[0].id);
    }
  };

  // Google Sheets Auto Load and Sync Handlers
  const handleGoogleSheetDataLoaded = (newKocs: KOC[], newVideos: VideoItem[], datasetName: string) => {
    setKocsData(newKocs);
    if (newVideos && newVideos.length > 0) {
      setVideosData(newVideos);
    }
    setCurrentDataset(datasetName);
    setGoogleSheetUrl(getStoredSheetUrl());
    setLastSyncTime(getLastSyncTime());
    if (newKocs.length > 0) {
      setSelectedKocId(newKocs[0].id);
    }
  };

  const handleQuickSync = async () => {
    const url = getStoredSheetUrl();
    if (!url) {
      setIsGoogleSheetsOpen(true);
      return;
    }

    setIsSyncing(true);
    try {
      const result = await fetchLiveGoogleSheet(url);
      handleGoogleSheetDataLoaded(result.kocs, result.videos, 'Google Sheet Trực Tuyến');
    } catch (e: any) {
      console.error('Quick sync error:', e);
      alert('Không thể đồng bộ từ Google Sheet: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial load from Google Sheet if configured, plus periodic sync
  React.useEffect(() => {
    const storedUrl = getStoredSheetUrl();
    if (storedUrl) {
      fetchLiveGoogleSheet(storedUrl)
        .then(result => {
          handleGoogleSheetDataLoaded(result.kocs, result.videos, 'Google Sheet Trực Tuyến');
        })
        .catch(err => {
          console.warn('Initial Google Sheet sync failed:', err.message);
        });
    }

    // Interval sync (every 60 seconds if auto-sync is on)
    const interval = setInterval(() => {
      const activeUrl = getStoredSheetUrl();
      const autoSyncEnabled = getStoredAutoSync();
      if (activeUrl && autoSyncEnabled) {
        fetchLiveGoogleSheet(activeUrl)
          .then(result => {
            setKocsData(result.kocs);
            if (result.videos.length > 0) setVideosData(result.videos);
            setLastSyncTime(getLastSyncTime());
          })
          .catch(() => {});
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Perform dynamic date filtering and proportional metric scaling
  const {
    filteredKocs,
    activeTrends,
    filteredVideos,
    dateRangeLabel,
    totalGmv,
    organicGmv,
    adsGmv,
    totalCost,
    roas,
    views,
    clicks,
    orders,
  } = filterAndScaleKocs(kocsData, filters, trendsData, videosData);

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] text-slate-800">
      {/* 1. Left Sidebar Filter Panel with Date Range Controls */}
      <Sidebar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        kocs={kocsData}
        dateRangeLabel={dateRangeLabel}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Sticky Header with Navigation Tabs */}
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenImport={() => setIsImportOpen(true)}
          onOpenSchema={() => setIsSchemaOpen(true)}
          onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
          isGoogleSheetConnected={Boolean(googleSheetUrl)}
          onQuickSync={handleQuickSync}
          isSyncing={isSyncing}
          lastSyncTime={lastSyncTime}
          currentDataset={currentDataset}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewTab
              kocs={filteredKocs}
              dailyTrends={activeTrends}
              dateRangeLabel={dateRangeLabel}
              totalGmv={totalGmv}
              organicGmv={organicGmv}
              adsGmv={adsGmv}
              totalCost={totalCost}
              roas={roas}
              views={views}
              clicks={clicks}
              orders={orders}
            />
          )}

          {activeTab === 'productAnalytics' && (
            <ProductAnalyticsTab
              kocs={filteredKocs}
              videos={filteredVideos.length > 0 ? filteredVideos : videosData}
              onSelectKoc={handleSelectKocAndDrilldown}
            />
          )}

          {activeTab === 'kocList' && (
            <KocListTab kocs={filteredKocs} onSelectKoc={handleSelectKocAndDrilldown} />
          )}

          {activeTab === 'kocDetail' && (
            <KocDetailTab
              kocs={filteredKocs}
              selectedKocId={selectedKocId}
              onSelectKoc={setSelectedKocId}
              videos={filteredVideos.length > 0 ? filteredVideos : videosData}
              livestreams={mockLivestreams}
              dailyTrends={activeTrends}
            />
          )}

          {activeTab === 'kocSuggest' && (
            <KocSuggestTab kocs={filteredKocs} onSelectKoc={handleSelectKocAndDrilldown} />
          )}
        </main>
      </div>

      {/* 3. Data Import Modal */}
      <DataImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onDataLoaded={handleDataLoaded}
      />

      {/* 4. Data Schema & Format Guide Modal */}
      <DataSchemaModal
        isOpen={isSchemaOpen}
        onClose={() => setIsSchemaOpen(false)}
      />

      {/* 5. Google Sheets Database & Live Sync Modal */}
      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        onDataLoaded={handleGoogleSheetDataLoaded}
        currentConnectedUrl={googleSheetUrl}
      />
    </div>
  );
};
