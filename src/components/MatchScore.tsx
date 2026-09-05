import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { calculateSkillMatch, getMatchBadgeColor } from '../utils/matching.ts';

interface MatchScoreProps {
  requiredSkills: string[];
  userSkills: string[];
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const MatchScore: React.FC<MatchScoreProps> = ({
  requiredSkills = [],
  userSkills = [],
  showDetails = false,
  size = 'md',
}) => {
  const { matchPercentage, ratingCategory, matchedSkills, missingSkills } = calculateSkillMatch(
    requiredSkills,
    userSkills
  );

  const getPillStyle = () => {
    if (matchPercentage >= 80) {
      return 'bg-green-100 text-green-700';
    } else if (matchPercentage >= 60) {
      return 'bg-yellow-100 text-yellow-700';
    } else if (matchPercentage >= 40) {
      return 'bg-amber-100 text-amber-800';
    }
    return 'bg-slate-100 text-slate-600';
  };

  const getProgressColor = () => {
    if (matchPercentage >= 80) return 'bg-emerald-500';
    if (matchPercentage >= 60) return 'bg-yellow-500';
    if (matchPercentage >= 40) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  if (!showDetails) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getPillStyle()}`}
        title={`${ratingCategory}: ${matchedSkills.length} of ${requiredSkills.length} skills matched`}
      >
        <span>{matchPercentage}% Match</span>
        {size !== 'sm' && <span className="text-[11px] font-medium opacity-80">({ratingCategory})</span>}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Skill Alignment</h4>
            <span className="text-sm font-bold text-slate-800">{ratingCategory}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl font-extrabold text-slate-900">{matchPercentage}%</span>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Match</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3.5">
        <div
          className={`h-full transition-all duration-500 ${getProgressColor()}`}
          style={{ width: `${Math.max(matchPercentage, 6)}%` }}
        />
      </div>

      {/* Skills breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
        <div>
          <span className="font-semibold text-slate-600 block mb-1.5 flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <Check className="w-3.5 h-3.5 text-indigo-600" />
            Matched Skills ({matchedSkills.length})
          </span>
          {matchedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {matchedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-slate-400 italic text-xs">None matched yet</span>
          )}
        </div>

        <div>
          <span className="font-semibold text-slate-600 block mb-1.5 flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <X className="w-3.5 h-3.5 text-slate-400" />
            Missing Skills ({missingSkills.length})
          </span>
          {missingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 border border-slate-100 line-through"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-indigo-600 font-medium text-xs">All required skills met!</span>
          )}
        </div>
      </div>
    </div>
  );
};
