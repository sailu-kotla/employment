import React, { useState, useEffect } from 'react';
import { User, Mail, GraduationCap, MapPin, Tag, Award, CheckCircle2, AlertCircle, Save, Sparkles } from 'lucide-react';
import { UserProfile } from '../types.ts';
import { PREDEFINED_LOCATIONS, PREDEFINED_CATEGORIES, PREDEFINED_SKILLS } from '../../server/data/sampleOpportunities.ts';

interface ProfileProps {
  user: UserProfile | null;
  onSaveProfile: (profile: Partial<UserProfile>) => Promise<void>;
  onNavigate: (page: 'home' | 'opportunities' | 'dashboard' | 'profile' | 'auth', oppId?: string, authMode?: 'login' | 'register') => void;
}

export const Profile: React.FC<ProfileProps> = ({
  user,
  onSaveProfile,
  onNavigate,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [preferredLocation, setPreferredLocation] = useState('Visakhapatnam');
  const [preferredCategory, setPreferredCategory] = useState('Software Development');

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize form from current user profile
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setEducation(user.education || '');
      setSkills(user.skills || []);
      setPreferredLocation(user.preferredLocation || 'Visakhapatnam');
      setPreferredCategory(user.preferredCategory || 'Software Development');
    }
  }, [user]);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email.');
      return;
    }
    if (!education.trim()) {
      setErrorMessage('Please enter your education background.');
      return;
    }
    if (skills.length === 0) {
      setErrorMessage('Please select at least one skill.');
      return;
    }
    if (!preferredLocation.trim()) {
      setErrorMessage('Please select a preferred location.');
      return;
    }
    if (!preferredCategory.trim()) {
      setErrorMessage('Please select a preferred category.');
      return;
    }

    try {
      setSaving(true);
      await onSaveProfile({
        name: name.trim(),
        email: email.trim(),
        education: education.trim(),
        skills,
        preferredLocation,
        preferredCategory,
      });
      setSuccessMessage('Profile updated successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Account Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Skill-Based Job Matching Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Candidate Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Your profile directly powers percentage match scores, missing skill gap detections, and NearWork Smart Assistant recommendations.
          </p>
        </div>

        <div className="shrink-0">
          {user ? (
            <div className="text-right sm:text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Active: {user.name.split(' ')[0]}
              </span>
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('auth', undefined, 'login')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                >
                  Switch Account
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('auth', undefined, 'login')}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100/60 cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onNavigate('auth', undefined, 'register')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-2xs cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in" id="profile-success-msg">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sailaja Kotla"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              id="profile-name-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. kotlasailaja2006@gmail.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              id="profile-email-input"
            />
          </div>
        </div>

        {/* Education */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            Education & Degree <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="e.g. B.Tech Computer Science Engineering (Final Year)"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            id="profile-education-input"
          />
        </div>

        {/* Location & Category Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Preferred Location <span className="text-rose-500">*</span>
            </label>
            <select
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              id="profile-location-select"
            >
              {PREDEFINED_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Preferred Job Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={preferredCategory}
              onChange={(e) => setPreferredCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              id="profile-category-select"
            >
              {PREDEFINED_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Skills Multi-Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              Skills & Tech Stack <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-slate-500 font-medium">
              {skills.length} selected
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Click to select or deselect skills you have learned:
          </p>

          <div className="flex flex-wrap gap-2">
            {PREDEFINED_SKILLS.map((skill) => {
              const isSelected = skills.includes(skill);
              return (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                  id={`skill-chip-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
            id="save-profile-btn"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
