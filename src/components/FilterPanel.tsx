import React from 'react';
import { Filter, X, RotateCcw, MapPin, Tag, Briefcase, Award } from 'lucide-react';
import { PREDEFINED_LOCATIONS, PREDEFINED_CATEGORIES, PREDEFINED_SKILLS, EMPLOYMENT_TYPES } from '../../server/data/sampleOpportunities.ts';

interface FilterPanelProps {
  selectedLocation: string;
  selectedCategory: string;
  selectedType: string;
  selectedSkill: string;
  onLocationChange: (loc: string) => void;
  onCategoryChange: (cat: string) => void;
  onTypeChange: (type: string) => void;
  onSkillChange: (skill: string) => void;
  onClearFilters: () => void;
  totalResultsCount: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedLocation,
  selectedCategory,
  selectedType,
  selectedSkill,
  onLocationChange,
  onCategoryChange,
  onTypeChange,
  onSkillChange,
  onClearFilters,
  totalResultsCount,
}) => {
  const hasActiveFilters =
    selectedLocation !== 'All' ||
    selectedCategory !== 'All' ||
    selectedType !== 'All' ||
    selectedSkill !== 'All';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            id="clear-filters-btn"
          >
            <RotateCcw className="w-3 h-3" />
            Reset All
          </button>
        )}
      </div>

      {/* Filter Grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Location Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Location
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            id="filter-location-select"
          >
            <option value="All">All Locations</option>
            {PREDEFINED_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            id="filter-category-select"
          >
            <option value="All">All Categories</option>
            {PREDEFINED_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Employment Type Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            id="filter-type-select"
          >
            <option value="All">All Types</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Skill Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            Skill
          </label>
          <select
            value={selectedSkill}
            onChange={(e) => onSkillChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            id="filter-skill-select"
          >
            <option value="All">All Skills</option>
            {PREDEFINED_SKILLS.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Active:</span>
          {selectedLocation !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              Location: {selectedLocation}
              <button onClick={() => onLocationChange('All')} className="hover:text-indigo-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              Category: {selectedCategory}
              <button onClick={() => onCategoryChange('All')} className="hover:text-indigo-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedType !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
              Type: {selectedType}
              <button onClick={() => onTypeChange('All')} className="hover:text-slate-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSkill !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              Skill: {selectedSkill}
              <button onClick={() => onSkillChange('All')} className="hover:text-indigo-950 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
