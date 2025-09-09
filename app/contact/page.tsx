'use client';

import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import ContactList from './ContactList';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Contacts officiels" />
      <main className="pt-16 pb-20">
        <ContactList />
      </main>
      <BottomNav />
    </div>
  );
}