import React from 'react';
import { MapPin, Building, Calendar, Bookmark, BookmarkCheck, ArrowUpRight, Sparkles } from 'lucide-react';
import { Opportunity, UserProfile } from '../types.ts';
import { MatchScore } from './MatchScore.tsx';

interface OpportunityCardProps {
  opportunity: Opportunity;
  user: UserProfile | null;
  isSaved: boolean;
  onSaveToggle: (oppId: string) => void;
  onViewDetails: (oppId: string) => void;
  onAskAI?: (opportunity: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  user,
  isSaved,
  onSaveToggle,
  onViewDetails,
  onAskAI,
}) => {
  const userSkills = user?.skills || [];

  return (
    <div
      id={`opp-card-${opportunity._id}`}
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs hover:border-indigo-300 transition-colors flex flex-col justify-between group"
    >
      <div>
        {/* Top Header: Title, Company, & Match Pill */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="flex items-start gap-2.5">
            {opportunity.companyLogo ? (
              <img
                src={opportunity.companyLogo}
                alt={opportunity.company}
                className="w-9 h-9 rounded-md object-contain bg-slate-50 border border-slate-200 p-1 shrink-0 mt-0.5"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : null}
            <div>
              <h3
                onClick={() => onViewDetails(opportunity._id)}
                className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer leading-tight mb-1"
              >
                {opportunity.title}
              </h3>
              <p className="text-indigo-600 text-sm font-medium">{opportunity.company}</p>
            </div>
          </div>

          <div className="shrink-0">
            <MatchScore requiredSkills={opportunity.skills} userSkills={userSkills} size="sm" />
          </div>
        </div>

        {/* Attribute Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {opportunity.isLive && (
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </span>
          )}
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {opportunity.location}
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {opportunity.type}
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {opportunity.salary}
          </span>
          {opportunity.featured && (
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Featured
            </span>
          )}
          {opportunity.source && (
            <span className="text-[10px] text-slate-400 font-medium">
              via {opportunity.source.replace('Live Job Feed', '').replace('Live Feed', '').trim()}
            </span>
          )}
        </div>

        {/* Brief description snippet */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Skill badges */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {opportunity.skills.map((skill) => {
            const isMatched = userSkills.some(
              (s) => s.toLowerCase().trim() === skill.toLowerCase().trim()
            );
            return (
              <span
                key={skill}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  isMatched
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100 font-medium'
                    : 'bg-slate-50 text-slate-400 border-slate-100 line-through decoration-slate-300'
                }`}
              >
                {skill}
              </span>
            );
          })}
        </div>
      </div>

      {/* Card Footer: View Details, Save, and Ask AI */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onViewDetails(opportunity._id)}
          className="flex-1 py-2 px-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors text-center cursor-pointer inline-flex items-center justify-center gap-1.5"
          id={`view-details-btn-${opportunity._id}`}
        >
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
        </button>

        {onAskAI && (
          <button
            onClick={() => onAskAI(opportunity)}
            className="p-2 border border-slate-200 rounded-md text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors cursor-pointer"
            title="Ask AI Assistant about this role"
            id={`ask-ai-card-btn-${opportunity._id}`}
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => onSaveToggle(opportunity._id)}
          className={`px-3 py-2 border rounded-md transition-colors cursor-pointer ${
            isSaved
              ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
              : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save opportunity'}
          id={`save-opp-btn-${opportunity._id}`}
        >
          {isSaved ? (
            <BookmarkCheck className="w-4 h-4 fill-indigo-600" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
