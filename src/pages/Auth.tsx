import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  MapPin,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../types.ts';
import { loginUser, registerUser, fetchDemoCredentials } from '../services/api.ts';

interface AuthProps {
  initialMode?: 'login' | 'register';
  onLoginSuccess: (user: UserProfile) => void;
  onRegisterSuccess: (user: UserProfile) => void;
  onNavigate: (page: 'home' | 'opportunities' | 'dashboard' | 'profile' | 'auth') => void;
}

const AVAILABLE_SKILLS = [
  'Python',
  'Java',
  'JavaScript',
  'React',
  'Node.js',
  'SQL',
  'HTML',
  'CSS',
  'Git',
  'AWS',
  'Data Analysis',
  'MongoDB',
  'Figma',
  'C++',
];

const PREFERRED_LOCATIONS = [
  'Visakhapatnam',
  'Vizianagaram',
  'Vijayawada',
  'Hyderabad',
  'Bengaluru',
  'Chennai',
  'Remote',
];

const CATEGORIES = [
  'Software Development',
  'Data & AI',
  'Cloud & DevOps',
  'Web Design & UI/UX',
  'QA & Testing',
  'Management & Operations',
];

export const Auth: React.FC<AuthProps> = ({
  initialMode = 'login',
  onLoginSuccess,
  onRegisterSuccess,
  onNavigate,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regEducation, setRegEducation] = useState('B.Tech Final Year (Computer Science)');
  const [regLocation, setRegLocation] = useState('Visakhapatnam');
  const [regCategory, setRegCategory] = useState('Software Development');
  const [regSkills, setRegSkills] = useState<string[]>(['Python', 'SQL', 'HTML']);

  // Demo credentials state
  const [demoCreds, setDemoCreds] = useState<{ email: string; password: string; name: string } | null>(null);

  useEffect(() => {
    fetchDemoCredentials()
      .then((data) => setDemoCreds(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [mode]);

  const handleFillDemo = () => {
    const email = demoCreds?.email || 'kotlasailaja2006@gmail.com';
    const password = demoCreds?.password || 'password123';
    setLoginEmail(email);
    setLoginPassword(password);
    setErrorMessage(null);
  };

  const handleSkillToggle = (skill: string) => {
    if (regSkills.includes(skill)) {
      if (regSkills.length > 1) {
        setRegSkills(regSkills.filter((s) => s !== skill));
      }
    } else {
      setRegSkills([...regSkills, skill]);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      setSuccessMessage(res.message || 'Login successful!');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 400);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() || !/^\S+@\S+\.\S+$/.test(regEmail.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (!regEducation.trim()) {
      setErrorMessage('Please provide your education details.');
      return;
    }
    if (regSkills.length === 0) {
      setErrorMessage('Please select at least one technical skill.');
      return;
    }

    try {
      setLoading(true);
      const res = await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        education: regEducation.trim(),
        skills: regSkills,
        preferredLocation: regLocation,
        preferredCategory: regCategory,
      });

      setSuccessMessage(res.message || 'Registration successful!');
      setTimeout(() => {
        onRegisterSuccess(res.user);
      }, 400);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-300">
      {/* Brand Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex justify-center mb-3">
          <img
            src="/nearwork-logo.jpg"
            alt="NearWork Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-sm border-2 border-white ring-4 ring-indigo-50 object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {mode === 'login' ? 'Sign In to NearWork' : 'Create Candidate Account'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
          {mode === 'login'
            ? 'Access your personalized job matches, application statuses, and interview prep coach.'
            : 'Register to unlock tailored student opportunities, skill gap diagnostics, and 1-click tracking.'}
        </p>
      </div>

      {/* Auth Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-slate-200 p-1.5 bg-slate-50/80">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="auth-tab-login"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="auth-tab-register"
          >
            Create Account
          </button>
        </div>

        {/* Feedback Alerts */}
        <div className="px-6 sm:px-8 pt-6">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="px-6 sm:px-8 pb-8 pt-2 space-y-4">
            {/* Demo Student Fast Login Box */}
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-900">Demo Candidate Profile</div>
                  <div className="text-[11px] text-indigo-700">Sailaja Kotla (Visakhapatnam)</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-100/50 transition-colors cursor-pointer shrink-0"
              >
                Use Demo Login
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  id="login-email-input"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Demo: password123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  id="login-password-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              id="login-submit-btn"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-3 text-center border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Register here
                </button>
              </p>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="px-6 sm:px-8 pb-8 pt-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    id="register-name-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="rahul@college.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    id="register-email-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 chars"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    id="register-password-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <CheckCircle2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    id="register-confirm-password-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Education / College Background
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={regEducation}
                  onChange={(e) => setRegEducation(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science (Final Year)"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  id="register-education-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={regLocation}
                    onChange={(e) => setRegLocation(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none cursor-pointer"
                    id="register-location-select"
                  >
                    {PREFERRED_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Career Category
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={regCategory}
                    onChange={(e) => setRegCategory(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none cursor-pointer"
                    id="register-category-select"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Key Skills (Select to toggle)
                </label>
                <span className="text-[11px] text-slate-400">{regSkills.length} selected</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 max-h-36 overflow-y-auto">
                {AVAILABLE_SKILLS.map((skill) => {
                  const isSelected = regSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              id="register-submit-btn"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Start Discovering</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-3 text-center border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        )}
      </div>

      {/* Feature Highlights beneath auth form */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="w-6 h-6 mx-auto mb-1 text-indigo-600 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-800">Regional Discoveries</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tier-1 & tier-2 verified hubs</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="w-6 h-6 mx-auto mb-1 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-800">Match Percentage</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Instant skill alignment</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="w-6 h-6 mx-auto mb-1 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-800">Smart Interview Prep</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Free candidate coaching</div>
        </div>
      </div>
    </div>
  );
};
