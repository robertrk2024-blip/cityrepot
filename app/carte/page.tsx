
'use client';

import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import InteractiveMap from './InteractiveMap';

export default function CartePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Carte des signalements" />
      <main className="pt-16 pb-32 md:pb-8 h-screen">
        <div className="max-w-7xl mx-auto h-full">
          <InteractiveMap />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
