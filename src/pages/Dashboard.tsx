import React, { useState } from 'react';
import { Bookmark, Send, Users, CheckCircle, XCircle, ArrowRight, UserCheck, Sparkles, MapPin, Building, Trash2 } from 'lucide-react';
import { UserProfile, Opportunity, Application, ApplicationStatus, DashboardStats } from '../types.ts';
import { ApplicationTracker } from '../components/ApplicationTracker.tsx';
import { OpportunityCard } from '../components/OpportunityCard.tsx';
import { EmptyState } from '../components/EmptyState.tsx';

interface DashboardProps {
  user: UserProfile | null;
  applications: Application[];
  savedOpportunities: Opportunity[];
  recommendedOpportunities: Opportunity[];
  stats: DashboardStats;
  savedOppIds: Set<string>;
  onStatusChange: (appId: string, newStatus: ApplicationStatus) => Promise<void>;
  onViewOpportunity: (oppId: string) => void;
  onSaveToggle: (oppId: string) => void;
  onNavigate: (page: 'home' | 'opportunities' | 'dashboard' | 'profile' | 'auth', oppId?: string, authMode?: 'login' | 'register') => void;
  onAskAI: (opp: Opportunity) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  applications,
  savedOpportunities,
  recommendedOpportunities,
  stats,
  savedOppIds,
  onStatusChange,
  onViewOpportunity,
  onSaveToggle,
  onNavigate,
  onAskAI,
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'saved' | 'recommended'>('applications');

  const statItems = [
    { label: 'Saved', count: stats.saved, icon: Bookmark, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' },
    { label: 'Applied', count: stats.applied, icon: Send, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Interview', count: stats.interview, icon: Users, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    { label: 'Selected', count: stats.selected, icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: 'Rejected', count: stats.rejected, icon: XCircle, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Welcome Header & Profile Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Candidate Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {user ? `Welcome to NearWork, ${user.name.split(' ')[0]}!` : 'Welcome to NearWork!'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {user ? (
                <>
                  {user.education || 'Computer Science Engineering'} • Target Location: <strong className="text-slate-700">{user.preferredLocation || 'Visakhapatnam'}</strong>
                </>
              ) : (
                'Sign in or register an account to personalize job matching, track your applications, and save opportunities.'
              )}
            </p>
          </div>

          {user ? (
            <button
              onClick={() => onNavigate('profile')}
              className="self-start sm:self-auto px-3.5 py-2 rounded-md border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
              id="edit-profile-dashboard-btn"
            >
              Edit Profile & Skills
            </button>
          ) : (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => onNavigate('auth', undefined, 'login')}
                className="px-3.5 py-2 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                id="dashboard-signin-btn"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('auth', undefined, 'register')}
                className="px-3.5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors shadow-2xs cursor-pointer"
                id="dashboard-register-btn"
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {/* User Skills Pills */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Target Skills:</span>
          {(user?.skills || []).map((skill) => (
            <span key={skill} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 text-xs">
              {skill}
            </span>
          ))}
          {(!user?.skills || user.skills.length === 0) && (
            <span className="text-slate-400 italic text-xs">No skills listed yet. Add skills in profile.</span>
          )}
        </div>
      </div>

      {/* 5 Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {statItems.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.label}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between"
              id={`stat-card-${st.label.toLowerCase()}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{st.label}</span>
                <div className={`w-7 h-7 rounded-md ${st.bg} ${st.color} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                {st.count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'applications'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-applications"
        >
          Application Tracker ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'saved'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-saved"
        >
          Saved Opportunities ({savedOpportunities.length})
        </button>

        <button
          onClick={() => setActiveTab('recommended')}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'recommended'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-recommended"
        >
          Recommended For You ({recommendedOpportunities.length})
        </button>
      </div>

      {/* Tab 1: Application Tracker */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <ApplicationTracker
            applications={applications}
            onStatusChange={onStatusChange}
            onViewOpportunity={onViewOpportunity}
          />
        </div>
      )}

      {/* Tab 2: Saved Opportunities */}
      {activeTab === 'saved' && (
        <div>
          {savedOpportunities.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="You haven't saved any opportunities yet."
              description="Save opportunities you want to research or apply to later. Click the bookmark icon on any job card."
              actionLabel="Explore Opportunities"
              onAction={() => onNavigate('opportunities')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {savedOpportunities.map((opp) => (
                <OpportunityCard
                  key={opp._id}
                  opportunity={opp}
                  user={user}
                  isSaved={true}
                  onSaveToggle={onSaveToggle}
                  onViewDetails={onViewOpportunity}
                  onAskAI={onAskAI}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Recommended Opportunities */}
      {activeTab === 'recommended' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
            <span>
              Personalized based on target location: <strong>{user?.preferredLocation}</strong> and your profile skills.
            </span>
            <button
              onClick={() => onNavigate('opportunities')}
              className="font-bold underline text-indigo-700 hover:text-indigo-900 cursor-pointer"
            >
              Browse All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recommendedOpportunities.map((opp) => (
              <OpportunityCard
                key={opp._id}
                opportunity={opp}
                user={user}
                isSaved={savedOppIds.has(opp._id)}
                onSaveToggle={onSaveToggle}
                onViewDetails={onViewOpportunity}
                onAskAI={onAskAI}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
