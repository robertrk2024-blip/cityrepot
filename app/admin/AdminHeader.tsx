'use client';

export default function AdminHeader() {
  return (
    <header className="fixed top-0 w-full bg-red-600 text-white z-50 px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Interface Agents</h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm">En service</span>
        </div>
      </div>
    </header>
  );
}