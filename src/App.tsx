import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Home } from './pages/Home.tsx';
import { Opportunities } from './pages/Opportunities.tsx';
import { OpportunityDetails } from './pages/OpportunityDetails.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { Profile } from './pages/Profile.tsx';
import { Auth } from './pages/Auth.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import {
  fetchOpportunities,
  fetchLiveOpportunities,
  fetchUserProfile,
  saveUserProfile,
  fetchSavedJobs,
  toggleSaveJob,
  fetchApplications,
  applyToOpportunity,
  updateApplicationStatus,
  fetchHealth,
} from './services/api.ts';
import { Opportunity, UserProfile, Application, ApplicationStatus, DashboardStats } from './types.ts';
import { CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'opportunities' | 'dashboard' | 'profile' | 'auth'>('home');
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);

  // Core Data
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [savedOppIds, setSavedOppIds] = useState<Set<string>>(new Set());
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    saved: 0,
    applied: 0,
    interview: 0,
    selected: 0,
    rejected: 0,
  });

  // Filter & Search state for Opportunities page
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedSource, setSelectedSource] = useState<'all' | 'curated' | 'live'>('all');

  // Loading and System States
  const [loadingOpps, setLoadingOpps] = useState(false);
  const [isRefreshingLive, setIsRefreshingLive] = useState(false);
  const [dbStatus, setDbStatus] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // AI Assistant Modal
  const [aiModalOpp, setAiModalOpp] = useState<Opportunity | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4000);
  };

  // 1. Initial Load: Profile, Health, Applications, Saved Jobs
  useEffect(() => {
    const initApp = async () => {
      try {
        const health = await fetchHealth();
        setDbStatus(health.database);
        setAiStatus(health.aiStatus);

        // Check if there is an authenticated session stored in localStorage
        const storedUserJson = localStorage.getItem('nearwork_auth_user');
        let activeUser: UserProfile | null = null;

        if (storedUserJson) {
          try {
            activeUser = JSON.parse(storedUserJson);
          } catch (e) {
            console.warn('Could not parse stored session:', e);
          }
        }

        // If no stored user, fetch default seed user profile so candidate features are previewable
        if (!activeUser) {
          activeUser = await fetchUserProfile();
        }

        setUser(activeUser);

        const targetUserId = activeUser?._id || activeUser?.id || 'user-default-1';
        const saved = await fetchSavedJobs(targetUserId);
        setSavedOppIds(new Set(saved.map((s) => s.opportunityId)));

        const appsData = await fetchApplications(targetUserId);
        setApplications(appsData.applications);
        setStats(appsData.stats);
      } catch (err) {
        console.error('Error initializing app:', err);
      }
    };

    initApp();
  }, []);

  // 2. Fetch Opportunities when filters change
  const loadOpportunities = async () => {
    try {
      setLoadingOpps(true);
      const res = await fetchOpportunities({
        search: searchQuery,
        location: selectedLocation,
        category: selectedCategory,
        type: selectedType,
        skill: selectedSkill,
        source: selectedSource,
      });
      setOpportunities(res.data);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
      showToast('Failed to load opportunities. Retrying with cached data.', 'error');
    } finally {
      setLoadingOpps(false);
    }
  };

  const handleRefreshLive = async () => {
    try {
      setIsRefreshingLive(true);
      const liveRes = await fetchLiveOpportunities({
        search: searchQuery,
        category: selectedCategory,
        type: selectedType,
        skill: selectedSkill,
        location: selectedLocation,
        refresh: true,
      });
      showToast(`Real-time feed updated! ${liveRes.count} live web jobs active.`, 'success');
      loadOpportunities();
    } catch (err) {
      console.error('Failed to refresh live feed:', err);
      showToast('Could not refresh live job boards. Using cached live postings.', 'info');
    } finally {
      setIsRefreshingLive(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [searchQuery, selectedLocation, selectedCategory, selectedType, selectedSkill, selectedSource]);

  // Handlers
  const handleNavigate = (
    page: 'home' | 'opportunities' | 'dashboard' | 'profile' | 'auth',
    oppId?: string,
    authMode?: 'login' | 'register'
  ) => {
    setCurrentPage(page);
    if (authMode) {
      setAuthInitialMode(authMode);
    }
    if (oppId) {
      setSelectedOppId(oppId);
    } else if (page !== 'opportunities' || !oppId) {
      setSelectedOppId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = async (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    localStorage.setItem('nearwork_auth_user', JSON.stringify(authenticatedUser));
    showToast(`Welcome back, ${authenticatedUser.name.split(' ')[0]}!`, 'success');
    setCurrentPage('dashboard');

    const userId = authenticatedUser._id || authenticatedUser.id || 'user-default-1';
    try {
      const saved = await fetchSavedJobs(userId);
      setSavedOppIds(new Set(saved.map((s) => s.opportunityId)));

      const appsData = await fetchApplications(userId);
      setApplications(appsData.applications);
      setStats(appsData.stats);
    } catch (err) {
      console.error('Failed to refresh data after login:', err);
    }
  };

  const handleRegisterSuccess = async (newUser: UserProfile) => {
    setUser(newUser);
    localStorage.setItem('nearwork_auth_user', JSON.stringify(newUser));
    showToast(`Account created! Welcome to NearWork, ${newUser.name.split(' ')[0]}.`, 'success');
    setCurrentPage('opportunities');

    const userId = newUser._id || newUser.id || 'user-default-1';
    try {
      const saved = await fetchSavedJobs(userId);
      setSavedOppIds(new Set(saved.map((s) => s.opportunityId)));

      const appsData = await fetchApplications(userId);
      setApplications(appsData.applications);
      setStats(appsData.stats);
    } catch (err) {
      console.error('Failed to refresh data after register:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nearwork_auth_user');
    setUser(null);
    setSavedOppIds(new Set());
    setApplications([]);
    setStats({
      saved: 0,
      applied: 0,
      interview: 0,
      selected: 0,
      rejected: 0,
    });
    showToast('Signed out of NearWork.', 'info');
    setCurrentPage('home');
  };

  const handleViewDetails = (oppId: string) => {
    setSelectedOppId(oppId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveToggle = async (oppId: string) => {
    const userId = user?._id || user?.id || 'user-default-1';
    try {
      const res = await toggleSaveJob(userId, oppId);
      const newSaved = new Set(savedOppIds);
      if (res.saved) {
        newSaved.add(oppId);
        showToast('Opportunity saved to your dashboard.', 'success');
      } else {
        newSaved.delete(oppId);
        showToast('Opportunity removed from saved list.', 'info');
      }
      setSavedOppIds(newSaved);

      // Refresh applications & stats
      const appsData = await fetchApplications(userId);
      setApplications(appsData.applications);
      setStats(appsData.stats);
    } catch (err: any) {
      console.error('Save toggle error:', err);
      showToast(err.message || 'Error updating saved status', 'error');
    }
  };

  const handleApply = async (oppId: string) => {
    const userId = user?._id || user?.id || 'user-default-1';
    try {
      await applyToOpportunity(userId, oppId, 'Applied');
      showToast('Application tracked! Status marked as "Applied".', 'success');

      // Refresh applications & stats
      const appsData = await fetchApplications(userId);
      setApplications(appsData.applications);
      setStats(appsData.stats);
    } catch (err: any) {
      console.error('Apply error:', err);
      showToast(err.message || 'Failed to submit application', 'error');
    }
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    const userId = user?._id || user?.id || 'user-default-1';
    try {
      await updateApplicationStatus(appId, newStatus);
      showToast(`Application status updated to "${newStatus}".`, 'success');

      const appsData = await fetchApplications(userId);
      setApplications(appsData.applications);
      setStats(appsData.stats);
    } catch (err: any) {
      console.error('Status update error:', err);
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleSaveProfile = async (profileData: Partial<UserProfile>) => {
    try {
      const res = await saveUserProfile(profileData);
      setUser(res.user);
      showToast('Profile updated successfully.', 'success');
      // Trigger opportunities re-render so match badges update
      loadOpportunities();
    } catch (err: any) {
      console.error('Save profile error:', err);
      throw err;
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedLocation('All');
    setSelectedCategory('All');
    setSelectedType('All');
    setSelectedSkill('All');
  };

  // Filter saved opportunities for dashboard
  const savedOpportunities = opportunities.filter((opp) => savedOppIds.has(opp._id));

  // Compute recommended opportunities based on user profile
  const recommendedOpportunities = opportunities
    .filter((opp) => {
      if (!user) return false;
      const matchesLocation =
        user.preferredLocation && opp.location.toLowerCase() === user.preferredLocation.toLowerCase();
      const matchesCategory =
        user.preferredCategory && opp.category.toLowerCase() === user.preferredCategory.toLowerCase();
      const matchesSkills =
        user.skills &&
        opp.skills.some((sk) => user.skills.map((s) => s.toLowerCase()).includes(sk.toLowerCase()));
      return matchesLocation || matchesCategory || matchesSkills;
    })
    .slice(0, 6);

  // Selected opportunity for details view
  const currentOpportunity = selectedOppId
    ? opportunities.find((o) => o._id === selectedOppId) || null
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-3 duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border text-xs sm:text-sm font-semibold ${
              toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : toast.type === 'info'
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-emerald-900 border-emerald-800 text-white'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        user={user}
        savedCount={savedOppIds.size}
        dbStatus={dbStatus}
        aiStatus={aiStatus}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'auth' ? (
          <Auth
            initialMode={authInitialMode}
            onLoginSuccess={handleLoginSuccess}
            onRegisterSuccess={handleRegisterSuccess}
            onNavigate={handleNavigate}
          />
        ) : selectedOppId && currentOpportunity ? (
          <OpportunityDetails
            opportunity={currentOpportunity}
            user={user}
            isSaved={savedOppIds.has(currentOpportunity._id)}
            hasApplied={applications.some((a) => a.opportunityId === currentOpportunity._id && a.status === 'Applied')}
            onBack={() => setSelectedOppId(null)}
            onSaveToggle={handleSaveToggle}
            onApply={handleApply}
            onOpenAI={(opp) => setAiModalOpp(opp)}
          />
        ) : currentPage === 'home' ? (
          <Home
            opportunities={opportunities}
            user={user}
            savedOppIds={savedOppIds}
            onSaveToggle={handleSaveToggle}
            onViewDetails={handleViewDetails}
            onNavigate={handleNavigate}
            onAskAI={(opp) => setAiModalOpp(opp)}
          />
        ) : currentPage === 'opportunities' ? (
          <Opportunities
            opportunities={opportunities}
            user={user}
            savedOppIds={savedOppIds}
            loading={loadingOpps}
            searchQuery={searchQuery}
            selectedLocation={selectedLocation}
            selectedCategory={selectedCategory}
            selectedType={selectedType}
            selectedSkill={selectedSkill}
            selectedSource={selectedSource}
            onSourceChange={setSelectedSource}
            onRefreshLive={handleRefreshLive}
            isRefreshingLive={isRefreshingLive}
            onSearchChange={setSearchQuery}
            onLocationChange={setSelectedLocation}
            onCategoryChange={setSelectedCategory}
            onTypeChange={setSelectedType}
            onSkillChange={setSelectedSkill}
            onClearFilters={handleClearFilters}
            onSaveToggle={handleSaveToggle}
            onViewDetails={handleViewDetails}
            onAskAI={(opp) => setAiModalOpp(opp)}
          />
        ) : currentPage === 'dashboard' ? (
          <Dashboard
            user={user}
            applications={applications}
            savedOpportunities={savedOpportunities}
            recommendedOpportunities={recommendedOpportunities}
            stats={stats}
            savedOppIds={savedOppIds}
            onStatusChange={handleStatusChange}
            onViewOpportunity={handleViewDetails}
            onSaveToggle={handleSaveToggle}
            onNavigate={handleNavigate}
            onAskAI={(opp) => setAiModalOpp(opp)}
          />
        ) : (
          <Profile
            user={user}
            onSaveProfile={handleSaveProfile}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* NearWork Smart Assistant Modal */}
      {aiModalOpp && (
        <AIAssistant
          opportunity={aiModalOpp}
          user={user}
          isOpen={true}
          onClose={() => setAiModalOpp(null)}
        />
      )}

      {/* Modern Student-Focused Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
              <img
                src="/nearwork-logo.jpg"
                alt="NearWork Logo"
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <span className="font-bold text-sm text-slate-900">
                Near<span className="text-indigo-600">Work</span>
              </span>
              <span>— "Find the right opportunity, closer to you."</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span>MERN Stack + Dual-Mode AI MVP</span>
              <span>•</span>
              <button
                onClick={() => handleNavigate('auth', undefined, user ? 'login' : 'register')}
                className="hover:text-indigo-600 font-medium cursor-pointer"
              >
                {user ? 'Account Portal' : 'Sign In / Register'}
              </button>
              <span>•</span>
              <button
                onClick={() => handleNavigate('profile')}
                className="hover:text-indigo-600 font-medium cursor-pointer"
              >
                Candidate Profile
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
