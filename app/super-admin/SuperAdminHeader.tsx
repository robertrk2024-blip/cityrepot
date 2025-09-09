'use client';

export default function SuperAdminHeader() {
  return (
    <header className="fixed top-0 w-full bg-purple-600 text-white z-50 px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="ri-shield-star-line text-xl"></i>
          <h1 className="text-lg font-semibold">Super Administration</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Système actif</span>
          </div>
          <button className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
            <i className="ri-user-line"></i>
          </button>
        </div>
      </div>
    </header>
  );
}