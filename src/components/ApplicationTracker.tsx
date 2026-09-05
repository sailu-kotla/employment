import React, { useState } from 'react';
import { Briefcase, Building, MapPin, Calendar, Clock, ChevronDown, CheckCircle2, AlertCircle, Sparkles, ArrowUpRight } from 'lucide-react';
import { Application, ApplicationStatus } from '../types.ts';

interface ApplicationTrackerProps {
  applications: Application[];
  onStatusChange: (appId: string, newStatus: ApplicationStatus) => Promise<void>;
  onViewOpportunity: (oppId: string) => void;
}

const statusColorMap: Record<ApplicationStatus, { bg: string; text: string; dot: string }> = {
  Saved: { bg: 'bg-slate-100 text-slate-700 border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' },
  Applied: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  Interview: { bg: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500' },
  Selected: { bg: 'bg-green-100 text-green-700 border-green-200', text: 'text-green-700', dot: 'bg-emerald-500' },
  Rejected: { bg: 'bg-slate-100 text-slate-500 border-slate-200', text: 'text-slate-500', dot: 'bg-slate-400' },
};

const allStatuses: ApplicationStatus[] = ['Saved', 'Applied', 'Interview', 'Selected', 'Rejected'];

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  onStatusChange,
  onViewOpportunity,
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleSelectChange = async (appId: string, status: ApplicationStatus) => {
    try {
      setUpdatingId(appId);
      await onStatusChange(appId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        <p className="text-sm font-medium">No applications tracked yet.</p>
        <p className="text-xs text-slate-400 mt-1">
          Apply to opportunities or move saved opportunities to this tracker.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Application Pipeline</h3>
          <p className="text-xs text-slate-500 mt-0.5">Track and update the status of each job you've targeted</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {applications.length} {applications.length === 1 ? 'Record' : 'Records'}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {applications.map((app) => {
          const colors = statusColorMap[app.status] || statusColorMap.Saved;
          const opp = app.opportunity;

          return (
            <div
              key={app._id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              id={`tracker-row-${app._id}`}
            >
              {/* Job Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4
                    onClick={() => opp && onViewOpportunity(opp._id)}
                    className="text-sm sm:text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {opp?.title || 'Job Opportunity'}
                  </h4>
                  {opp?.type && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {opp.type}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {opp?.company || 'Company'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {opp?.location || 'Location'}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(app.appliedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Status Selector & Actions */}
              <div className="flex items-center gap-3 self-start sm:self-center">
                {/* Status Dropdown */}
                <div className="relative">
                  <select
                    value={app.status}
                    disabled={updatingId === app._id}
                    onChange={(e) => handleSelectChange(app._id, e.target.value as ApplicationStatus)}
                    className={`appearance-none pl-3 pr-8 py-1.5 rounded-md text-xs font-bold border transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 ${colors.bg} ${
                      updatingId === app._id ? 'opacity-50' : ''
                    }`}
                    id={`status-select-${app._id}`}
                  >
                    {allStatuses.map((st) => (
                      <option key={st} value={st}>
                        Status: {st}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${colors.text}`} />
                </div>

                {opp && (
                  <button
                    onClick={() => onViewOpportunity(opp._id)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="View details"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
