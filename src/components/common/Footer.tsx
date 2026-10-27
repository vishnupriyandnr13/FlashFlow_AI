import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 mt-16 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} FlashGuard. All rights reserved.</p>
        <div className="flex items-center gap-6 text-xs text-slate-500">
          <span className="hover:text-slate-800 transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-800 transition-colors cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-800 transition-colors cursor-pointer">Security</span>
          <span className="hover:text-slate-800 transition-colors cursor-pointer">Help Center</span>
        </div>
      </div>
    </footer>
  );
};
