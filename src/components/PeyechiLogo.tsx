import React from 'react';

interface PeyechiLogoProps {
  className?: string;
  showTagline?: boolean;
}

export const PeyechiLogo: React.FC<PeyechiLogoProps> = ({ className = 'h-8', showTagline = false }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon */}
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm shadow-emerald-900/10">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
        >
          {/* Magnifying glass / location pin fusion */}
          <path d="M12 21s-6-5.333-6-10a6 6 0 0 1 12 0c0 4.667-6 10-6 10z" />
          <circle cx="12" cy="11" r="2.5" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold tracking-tight text-slate-900">
            পেয়েছি
          </span>
          <span className="text-sm font-semibold text-emerald-700 tracking-wide uppercase font-mono">
            Peyechi
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-slate-500 leading-tight">
            Lost & Found Bangladesh
          </span>
        )}
      </div>
    </div>
  );
};
