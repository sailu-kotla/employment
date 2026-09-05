import React, { useState } from 'react';
import { ArrowLeft, Building, MapPin, Calendar, Clock, DollarSign, Award, ExternalLink, Bookmark, BookmarkCheck, Sparkles, CheckCircle2, Shield, Check, X } from 'lucide-react';
import { Opportunity, UserProfile } from '../types.ts';
import { MatchScore } from '../components/MatchScore.tsx';

interface OpportunityDetailsProps {
  opportunity: Opportunity;
  user: UserProfile | null;
  isSaved: boolean;
  hasApplied: boolean;
  onBack: () => void;
  onSaveToggle: (oppId: string) => void;
  onApply: (oppId: string) => void;
  onOpenAI: (opp: Opportunity) => void;
}

export const OpportunityDetails: React.FC<OpportunityDetailsProps> = ({
  opportunity,
  user,
  isSaved,
  hasApplied,
  onBack,
  onSaveToggle,
  onApply,
  onOpenAI,
}) => {
  const [showApplyModal, setShowApplyModal] = useState(false);

  const handleApplyClick = () => {
    // Record application in backend
    onApply(opportunity._id);
    // Open application link in new tab
    if (opportunity.applyLink) {
      window.open(opportunity.applyLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-3 py-1.5 rounded-md transition-colors shadow-2xs cursor-pointer"
        id="back-to-opportunities-btn"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Opportunities</span>
      </button>

      {/* Main Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* Live Feed Banner if applicable */}
        {opportunity.isLive && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Verified Real-Time Job Posting
                </p>
                <p className="text-[11px] text-emerald-700">
                  Aggregated from {opportunity.source || 'Live Web Board'}. Apply directly on their official company site.
                </p>
              </div>
            </div>
            {opportunity.applyLink && (
              <a
                href={opportunity.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-900 underline"
              >
                <span>External Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            {opportunity.companyLogo && (
              <img
                src={opportunity.companyLogo}
                alt={opportunity.company}
                className="w-14 h-14 rounded-lg object-contain bg-slate-50 border border-slate-200 p-1.5 shrink-0"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {opportunity.isLive && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Live Web Feed
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {opportunity.type}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                  {opportunity.category}
                </span>
                {hasApplied && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    ✓ Applied & Tracked
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {opportunity.title}
              </h1>

              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-600 flex-wrap pt-1">
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Building className="w-4 h-4 text-slate-400" />
                  {opportunity.company}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {opportunity.location}
                </span>
                <span className="flex items-center gap-1.5 font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100 text-xs">
                  {opportunity.salary}
                </span>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 self-start">
            <button
              onClick={() => onSaveToggle(opportunity._id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                isSaved
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              id="save-details-btn"
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 fill-indigo-600 text-indigo-600" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-slate-400" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Primary Action Buttons Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={handleApplyClick}
            className="w-full sm:flex-1 py-2.5 px-5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            id="apply-now-btn"
          >
            <span>
              {opportunity.isLive
                ? hasApplied
                  ? 'Re-open Company Application'
                  : 'Apply on Company Site & Track'
                : hasApplied
                ? 'Applied (Re-open Link)'
                : 'Apply Now'}
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onOpenAI(opportunity)}
            className="w-full sm:w-auto py-2.5 px-5 rounded-md bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            id="ask-ai-assistant-btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ask AI Coach</span>
          </button>
        </div>
      </div>

      {/* Skill Match Breakdown Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Skill Alignment with Your Profile
        </h2>
        <MatchScore
          requiredSkills={opportunity.skills}
          userSkills={user?.skills || []}
          showDetails={true}
        />
      </div>

      {/* Opportunity Details Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
          Role Specifications & Eligibility
        </h2>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Experience Level</span>
            <span className="text-sm font-bold text-slate-800 mt-0.5 block">{opportunity.experience}</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Application Deadline</span>
            <span className="text-sm font-bold text-slate-800 mt-0.5 block flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              {opportunity.deadline}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 sm:col-span-2">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Candidate Eligibility</span>
            <span className="text-sm font-semibold text-slate-800 mt-0.5 block">{opportunity.eligibility}</span>
          </div>
        </div>

        {/* Required Skills Section */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Required Technical & Domain Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {opportunity.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Description Section */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            About the Role & Responsibilities
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-100">
            {opportunity.description}
          </p>
        </div>

        {/* Footer Apply CTA */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Deadline: <strong className="text-slate-700">{opportunity.deadline}</strong> • Free direct application
          </div>

          <button
            onClick={handleApplyClick}
            className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Official Application</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
