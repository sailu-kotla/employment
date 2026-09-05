import { SkillMatchResult } from '../types.ts';

export function calculateSkillMatch(
  requiredSkills: string[] = [],
  userSkills: string[] = []
): SkillMatchResult {
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      matchPercentage: 100,
      ratingCategory: 'Excellent Match',
      matchedSkills: [],
      missingSkills: [],
      totalRequired: 0,
    };
  }

  const userSkillsNormalized = (userSkills || []).map((s) => s.toLowerCase().trim());
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  requiredSkills.forEach((reqSkill) => {
    const isMatched = userSkillsNormalized.includes(reqSkill.toLowerCase().trim());
    if (isMatched) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const matchPercentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);

  let ratingCategory: SkillMatchResult['ratingCategory'] = 'Low Match';
  if (matchPercentage >= 80) {
    ratingCategory = 'Excellent Match';
  } else if (matchPercentage >= 60) {
    ratingCategory = 'Good Match';
  } else if (matchPercentage >= 40) {
    ratingCategory = 'Partial Match';
  } else {
    ratingCategory = 'Low Match';
  }

  return {
    matchPercentage,
    ratingCategory,
    matchedSkills,
    missingSkills,
    totalRequired: requiredSkills.length,
  };
}

export function getMatchBadgeColor(category: SkillMatchResult['ratingCategory']) {
  switch (category) {
    case 'Excellent Match':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bar: 'bg-emerald-500',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500'
      };
    case 'Good Match':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        bar: 'bg-blue-500',
        text: 'text-blue-700',
        dot: 'bg-blue-500'
      };
    case 'Partial Match':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        bar: 'bg-amber-500',
        text: 'text-amber-700',
        dot: 'bg-amber-500'
      };
    case 'Low Match':
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        bar: 'bg-slate-400',
        text: 'text-slate-600',
        dot: 'bg-slate-400'
      };
  }
}
