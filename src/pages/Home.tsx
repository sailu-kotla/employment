import React from 'react';
import { ArrowRight, MapPin, Sparkles, CheckCircle2, TrendingUp, Users, Award, ShieldCheck, Briefcase } from 'lucide-react';
import { Opportunity, UserProfile } from '../types.ts';
import { OpportunityCard } from '../components/OpportunityCard.tsx';

interface HomeProps {
  opportunities: Opportunity[];
  user: UserProfile | null;
  savedOppIds: Set<string>;
  onSaveToggle: (oppId: string) => void;
  onViewDetails: (oppId: string) => void;
  onNavigate: (page: 'home' | 'opportunities' | 'dashboard' | 'profile' | 'auth', oppId?: string, authMode?: 'login' | 'register') => void;
  onAskAI: (opp: Opportunity) => void;
}

export const Home: React.FC<HomeProps> = ({
  opportunities,
  user,
  savedOppIds,
  onSaveToggle,
  onViewDetails,
  onNavigate,
  onAskAI,
}) => {
  // Grab 3-4 featured opportunities
  const featuredOpportunities = opportunities.slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 pb-12 sm:pb-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Official Brand Logo Emblem */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img
                src="/nearwork-logo.jpg"
                alt="NearWork — Jobs Near You"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-md border-2 border-white ring-4 ring-indigo-100 object-cover bg-white"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Tagline Badge & Live Indicator */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              "Find the right opportunity, closer to you."
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-Time Job Feed Online
            </div>
          </div>

          {/* Hero Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Find Opportunities <span className="text-indigo-600">Near You</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Discover jobs, internships and entry-level opportunities based on your skills and location.
            Built specifically for college students and fresh engineering graduates.
          </p>

          {/* Hero Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('opportunities')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
              id="hero-explore-btn"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {user ? (
              <button
                onClick={() => onNavigate('profile')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider border border-slate-200 transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                id="hero-create-profile-btn"
              >
                <span>Candidate Profile</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('auth', undefined, 'register')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-white hover:bg-slate-50 text-indigo-700 font-bold text-xs uppercase tracking-wider border border-indigo-200 transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                id="hero-register-btn"
              >
                <span>Register Account</span>
              </button>
            )}
          </div>

          {/* Demonstration Statistics */}
          <div className="mt-12 max-w-2xl mx-auto grid grid-cols-3 gap-3 sm:gap-6 pt-8 border-t border-slate-200">
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600">500+</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Opportunities</div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="text-2xl sm:text-3xl font-bold text-slate-800">50+</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Skills</div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="text-2xl sm:text-3xl font-bold text-slate-800">10+</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Locations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Opportunities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Hand-picked for students
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Featured Opportunities
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verified openings in Visakhapatnam, Hyderabad, Vijayawada, and remote teams
            </p>
          </div>

          <button
            onClick={() => onNavigate('opportunities')}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
          >
            <span>View all openings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featuredOpportunities.map((opp) => (
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
      </section>

      {/* How NearWork Works / 5 Core Features Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-10 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Why Students Choose NearWork
            </h2>
            <p className="text-xs text-slate-500 mt-1.5">
              Say goodbye to scattered job links and ghost postings. Built to jumpstart your career right where you study.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Zero Relocation Guesswork</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter local internships in Visakhapatnam, Vizianagaram, Vijayawada, or remote so you can work without prohibitive living costs.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Instant Skill Match %</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                See exactly which skills you already have and which you are missing, calculated cleanly from your profile.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
              <div className="w-9 h-9 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Smart Interview Coach</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ask the NearWork Smart Assistant how to prepare, bridge gaps, and ace technical questions before applying.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
