
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      icon: 'ri-home-line',
      activeIcon: 'ri-home-fill',
      label: 'Accueil'
    },
    {
      href: '/alertes',
      icon: 'ri-notification-3-line',
      activeIcon: 'ri-notification-3-fill', 
      label: 'Alertes'
    },
    {
      href: '/carte',
      icon: 'ri-map-line',
      activeIcon: 'ri-map-fill',
      label: 'Carte'
    },
    {
      href: '/historique',
      icon: 'ri-history-line',
      activeIcon: 'ri-history-fill',
      label: 'Historique'
    },
    {
      href: '/contact',
      icon: 'ri-phone-line',
      activeIcon: 'ri-phone-fill',
      label: 'Contact'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:relative md:border-t-0 md:bg-gray-100 md:p-4">
      <div className="grid grid-cols-5 h-16 md:max-w-lg md:mx-auto md:bg-white md:rounded-full md:shadow-lg md:h-auto md:py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-1 md:flex-row md:gap-2 md:px-4 md:py-3 md:rounded-full transition-colors ${
                isActive 
                  ? 'text-blue-600 md:bg-blue-600 md:text-white' 
                  : 'text-gray-600 hover:text-gray-900 md:hover:bg-gray-100'
              }`}
            >
              <i className={`${isActive ? item.activeIcon : item.icon} text-xl md:text-lg`}></i>
              <span className="text-xs font-medium mt-1 md:mt-0 md:text-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
