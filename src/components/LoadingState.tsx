import React from 'react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Finding opportunities...',
  subMessage = 'Connecting to NearWork database'
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
        <img
          src="/nearwork-logo.jpg"
          alt="NearWork"
          className="w-8 h-8 rounded-full object-cover absolute inset-0 m-auto animate-pulse"
          referrerPolicy="no-referrer"
        />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{message}</h3>
      {subMessage && <p className="text-sm text-slate-500 mt-1 max-w-sm">{subMessage}</p>}
    </div>
  );
};
