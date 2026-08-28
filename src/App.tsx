import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { KocListTab } from './components/KocListTab';
import { KocDetailTab } from './components/KocDetailTab';
import { KocSuggestTab } from './components/KocSuggestTab';
import { DataImportModal } from './components/DataImportModal';
import { DataSchemaModal } from './components/DataSchemaModal';

import { mockKocs, mockVideos, mockLivestreams, mockDailyTrends } from './data/mockData';
import { anpasoKocs, anpasoVideos } from './data/anpasoRealData';
import { FilterState, KOC, VideoItem, DailyTrendItem } from './types';
import { filterAndScaleKocs } from './utils/calculations';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'kocList' | 'kocDetail' | 'kocSuggest'>('overview');

  // Datasets
  const [currentDataset, setCurrentDataset] = useState<'Mẫu Chuẩn' | 'Anpaso (Thực tế)' | string>('Mẫu Chuẩn');
  const [kocsData, setKocsData] = useState<KOC[]>(mockKocs);
  const [videosData, setVideosData] = useState<VideoItem[]>(mockVideos);
  const [trendsData, setTrendsData] = useState<DailyTrendItem[]>(mockDailyTrends);

  // Selected KOC for drill-down
  const [selectedKocId, setSelectedKocId] = useState<string>(mockKocs[0]?.id || 'KOC001');

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

  const handleToggleDataset = () => {
    if (currentDataset === 'Mẫu Chuẩn') {
      setCurrentDataset('Anpaso (Thực tế)');
      setKocsData(anpasoKocs);
      setVideosData(anpasoVideos);
      if (anpasoKocs.length > 0) {
        setSelectedKocId(anpasoKocs[0].id);
      }
    } else {
      setCurrentDataset('Mẫu Chuẩn');
      setKocsData(mockKocs);
      setVideosData(mockVideos);
      setSelectedKocId(mockKocs[0].id);
    }
  };

  const handleDataLoaded = (newKocs: KOC[], datasetName: string) => {
    setKocsData(newKocs);
    setCurrentDataset(datasetName);
    if (newKocs.length > 0) {
      setSelectedKocId(newKocs[0].id);
    }
  };

  // Perform dynamic date filtering and proportional metric scaling
  const {
    filteredKocs,
    activeTrends,
    dateRangeLabel,
    totalGmv,
    organicGmv,
    adsGmv,
    totalCost,
    roas,
    views,
    clicks,
    orders,
  } = filterAndScaleKocs(kocsData, filters, trendsData);

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
          currentDataset={currentDataset}
          onToggleDataset={handleToggleDataset}
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

          {activeTab === 'kocList' && (
            <KocListTab kocs={filteredKocs} onSelectKoc={handleSelectKocAndDrilldown} />
          )}

          {activeTab === 'kocDetail' && (
            <KocDetailTab
              kocs={filteredKocs}
              selectedKocId={selectedKocId}
              onSelectKoc={setSelectedKocId}
              videos={videosData}
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
    </div>
  );
};
