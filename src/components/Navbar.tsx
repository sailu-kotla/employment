import React, { useState } from 'react';
import {
  Briefcase,
  Menu,
  X,
  MapPin,
  Sparkles,
  User as UserIcon,
  Bookmark,
  CheckCircle2,
  Database,
  LogIn,
  LogOut,
  UserPlus
} from 'lucide-react';
import { UserProfile } from '../types.ts';

interface NavbarProps {
  currentPage: 'home' | 'opportunities' | 'dashboard' | 'profile' | 'auth';
  onNavigate: (page: 'home' | 'opportunities' | 'dashboard' | 'profile' | 'auth', oppId?: string, authMode?: 'login' | 'register') => void;
  user: UserProfile | null;
  savedCount: number;
  dbStatus?: string;
  aiStatus?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  user,
  savedCount,
  dbStatus,
  aiStatus,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const navItems: { id: 'home' | 'opportunities' | 'dashboard' | 'profile'; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'opportunities', label: 'Opportunities' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'profile', label: 'Profile' },
  ];

  const handleNavClick = (id: 'home' | 'opportunities' | 'dashboard' | 'profile' | 'auth', authMode?: 'login' | 'register') => {
    onNavigate(id, undefined, authMode);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden cursor-pointer"
              id="brand-logo-btn"
            >
              <img
                src="/nearwork-logo.jpg"
                alt="NearWork Logo"
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs group-hover:ring-2 group-hover:ring-indigo-200 transition-all"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    Near<span className="text-indigo-600">Work</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                    MVP
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'text-indigo-600 font-semibold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {item.id === 'dashboard' && savedCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 font-bold">
                      {savedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* System Status Pill */}
            <button
              onClick={() => setShowStatusModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="System Diagnostics & Hackathon Architecture"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="hidden lg:inline text-slate-400">Stack:</span>
              <span className="font-semibold text-slate-800">MERN + AI</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {/* Profile Avatar */}
                <button
                  onClick={() => handleNavClick('profile')}
                  className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border transition-all text-xs font-medium cursor-pointer ${
                    currentPage === 'profile'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700'
                  }`}
                  id="user-profile-header-btn"
                  title="View Candidate Profile"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <span className="max-w-[100px] truncate text-slate-700">{user?.name ? user.name.split(' ')[0] : 'Profile'}</span>
                </button>

                {/* Sign Out Button */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Sign Out"
                    id="nav-logout-btn"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('auth', 'login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  id="nav-signin-btn"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => handleNavClick('auth', 'register')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                  id="nav-register-btn"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              id="mobile-menu-toggle"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1.5 animate-in slide-in-from-top-2">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            "Find the right opportunity, closer to you."
          </p>
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'dashboard' && savedCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-indigo-200 text-indigo-900' : 'bg-indigo-100 text-indigo-800'}`}>
                    {savedCount}
                  </span>
                )}
              </button>
            );
          })}

          {/* Mobile Auth Actions */}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 truncate max-w-[150px]">
                    {user.name}
                  </span>
                </div>
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleNavClick('auth', 'login')}
                  className="w-full py-2 px-3 text-center text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('auth', 'register')}
                  className="w-full py-2 px-3 text-center text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between px-3 text-xs text-slate-500">
            <span>Location: <strong>{user?.preferredLocation || 'Visakhapatnam'}</strong></span>
            <button
              onClick={() => setShowStatusModal(true)}
              className="text-indigo-600 font-semibold underline"
            >
              System Info
            </button>
          </div>
        </div>
      )}

      {/* System Status / Architecture Info Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">NearWork System Architecture</h3>
                  <p className="text-xs text-slate-500">Hackathon Full-Stack Verification</p>
                </div>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="font-semibold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Database Layer</span>
                  <span className="text-indigo-600 font-bold">Mongoose / MongoDB</span>
                </div>
                <p className="text-slate-500">
                  {dbStatus || 'Connected. In-memory demo store active with 14 pre-seeded opportunities and instant zero-loss state.'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="font-semibold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Smart Assistant Engine</span>
                  <span className="text-indigo-600 font-bold">Dual-Mode AI</span>
                </div>
                <p className="text-slate-500">
                  {aiStatus || 'Gemini 3.8 Flash + Smart Rule-Based Engine fallback. 100% free with zero mandatory billing.'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="font-semibold text-slate-800 mb-1">5 Core Features Active</div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                  <li>Feature 1: Dynamic Job & Keyword Search</li>
                  <li>Feature 2: Location Filter (7 Sample Hubs)</li>
                  <li>Feature 3: Skill & Category % Matching</li>
                  <li>Feature 4: Complete Opportunity Details & Apply</li>
                  <li>Feature 5: Application Status Tracker & Analytics</li>
                </ul>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={() => setShowStatusModal(false)}
                className="w-full py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Close Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
