'use client';

import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import HistoryList from './HistoryList';

export default function HistoriquePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Historique des signalements" />
      <main className="pt-16 pb-20">
        <HistoryList />
      </main>
      <BottomNav />
    </div>
  );
}