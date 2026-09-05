import React from 'react';
import { Sparkles, SearchX, Radio, Globe, Building2, RefreshCw } from 'lucide-react';
import { Opportunity, UserProfile } from '../types.ts';
import { OpportunityCard } from '../components/OpportunityCard.tsx';
import { SearchBar } from '../components/SearchBar.tsx';
import { FilterPanel } from '../components/FilterPanel.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import { LoadingState } from '../components/LoadingState.tsx';

interface OpportunitiesProps {
  opportunities: Opportunity[];
  user: UserProfile | null;
  savedOppIds: Set<string>;
  loading: boolean;
  searchQuery: string;
  selectedLocation: string;
  selectedCategory: string;
  selectedType: string;
  selectedSkill: string;
  selectedSource?: 'all' | 'curated' | 'live';
  onSourceChange?: (source: 'all' | 'curated' | 'live') => void;
  onRefreshLive?: () => void;
  isRefreshingLive?: boolean;
  onSearchChange: (q: string) => void;
  onLocationChange: (loc: string) => void;
  onCategoryChange: (cat: string) => void;
  onTypeChange: (type: string) => void;
  onSkillChange: (skill: string) => void;
  onClearFilters: () => void;
  onSaveToggle: (oppId: string) => void;
  onViewDetails: (oppId: string) => void;
  onAskAI: (opp: Opportunity) => void;
}

export const Opportunities: React.FC<OpportunitiesProps> = ({
  opportunities,
  user,
  savedOppIds,
  loading,
  searchQuery,
  selectedLocation,
  selectedCategory,
  selectedType,
  selectedSkill,
  selectedSource = 'all',
  onSourceChange,
  onRefreshLive,
  isRefreshingLive = false,
  onSearchChange,
  onLocationChange,
  onCategoryChange,
  onTypeChange,
  onSkillChange,
  onClearFilters,
  onSaveToggle,
  onViewDetails,
  onAskAI,
}) => {
  const liveCount = opportunities.filter((o) => o.isLive).length;
  const regionalCount = opportunities.filter((o) => !o.isLive).length;

  // Construct dynamic results label
  let resultsLabel = `${opportunities.length} ${opportunities.length === 1 ? 'opportunity' : 'opportunities'} found`;
  if (selectedLocation !== 'All') {
    resultsLabel = `${opportunities.length} ${opportunities.length === 1 ? 'opportunity' : 'opportunities'} found in ${selectedLocation}`;
  } else if (searchQuery.trim()) {
    resultsLabel = `${opportunities.length} ${opportunities.length === 1 ? 'opportunity' : 'opportunities'} matching "${searchQuery}"`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Introduction */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Job & Internship Discovery
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Explore Opportunities
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Discover verified campus postings and real-time live web jobs. Match scores compute dynamically based on your profile skills.
          </p>
        </div>

        {/* Real-time status badge */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-Time Job Feed Active</span>
          </div>
          {onRefreshLive && (
            <button
              onClick={onRefreshLive}
              disabled={isRefreshingLive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh real-time feed from live job boards"
              id="refresh-live-feed-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isRefreshingLive ? 'animate-spin' : ''}`} />
              <span>{isRefreshingLive ? 'Refreshing...' : 'Refresh Feed'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Feed Source Switcher Tabs */}
      {onSourceChange && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          <span className="text-xs font-bold uppercase text-slate-600 mr-2 tracking-wider shrink-0">
            Feed Source:
          </span>
          <button
            onClick={() => onSourceChange('all')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSource === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>All Opportunities</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${selectedSource === 'all' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>
              {opportunities.length}
            </span>
          </button>

          <button
            onClick={() => onSourceChange('live')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSource === 'live'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Real-Time Live Web Jobs</span>
            {selectedSource !== 'live' && liveCount > 0 && (
              <span className="bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded text-[10px]">
                {liveCount} Live
              </span>
            )}
          </button>

          <button
            onClick={() => onSourceChange('curated')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSource === 'curated'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Regional Campus Tech Hubs</span>
            {selectedSource !== 'curated' && regionalCount > 0 && (
              <span className="bg-indigo-200 text-indigo-900 px-1.5 py-0.2 rounded text-[10px]">
                {regionalCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          onClear={() => onSearchChange('')}
        />
      </div>

      {/* Multi-Filter Panel */}
      <FilterPanel
        selectedLocation={selectedLocation}
        selectedCategory={selectedCategory}
        selectedType={selectedType}
        selectedSkill={selectedSkill}
        onLocationChange={onLocationChange}
        onCategoryChange={onCategoryChange}
        onTypeChange={onTypeChange}
        onSkillChange={onSkillChange}
        onClearFilters={onClearFilters}
        totalResultsCount={opportunities.length}
      />

      {/* Dynamic Results Counter Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="text-sm font-bold text-slate-800" id="search-results-count">
          {resultsLabel}
        </div>
        <div className="text-xs text-slate-500 hidden sm:block">
          Sorted by newest verified opportunities
        </div>
      </div>

      {/* Main Listing View */}
      {loading ? (
        <LoadingState message="Finding opportunities..." subMessage="Fetching live job feeds and matching your profile requirements" />
      ) : opportunities.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No opportunities found."
          description="No opportunities match your current filters. Try changing your search keywords or clearing your active filters."
          actionLabel="Clear Filters"
          onAction={onClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp._id}
              opportunity={opp}
              user={user}
              isSaved={savedOppIds.has(opp._id)}
              onSaveToggle={onSaveToggle}
              onViewDetails={onViewDetails}
              onAskAI={onAskAI}
            />
          ))}
        </div>
      )}
    </div>
  );
};

