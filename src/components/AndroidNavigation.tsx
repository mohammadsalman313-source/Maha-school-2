import React from 'react';
import {
  CalendarCheck,
  UtensilsCrossed,
  UserX,
  Bell,
  Users,
  PackageCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/i18n';

export type TabType =
  | 'attendance'
  | 'poshan'
  | 'absentee'
  | 'notices'
  | 'students'
  | 'stock'
  | 'settings';

interface AndroidNavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  lang: Language;
  absentCountToday: number;
}

export const AndroidNavigation: React.FC<AndroidNavigationProps> = ({
  activeTab,
  onSelectTab,
  lang,
  absentCountToday,
}) => {
  const t = translations[lang];

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'attendance',
      label: lang === 'mr' ? 'हजेरी' : 'Attendance',
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      id: 'poshan',
      label: lang === 'mr' ? 'पोषण आहार' : 'MDM Poshan',
      icon: <UtensilsCrossed className="w-5 h-5" />,
    },
    {
      id: 'absentee',
      label: lang === 'mr' ? 'गैरहजर सूचना' : 'Absentee',
      icon: <UserX className="w-5 h-5" />,
      badge: absentCountToday > 0 ? absentCountToday : undefined,
    },
    {
      id: 'notices',
      label: lang === 'mr' ? 'सूचना' : 'Notices',
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: 'students',
      label: lang === 'mr' ? 'विद्यार्थी' : 'Students',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'stock',
      label: lang === 'mr' ? 'धान्य साठा' : 'Stock',
      icon: <PackageCheck className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: lang === 'mr' ? 'शाळा' : 'School',
      icon: <SlidersHorizontal className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="bg-white border-t border-slate-200 shadow-lg shrink-0 select-none pb-safe">
      <div className="flex items-center justify-around overflow-x-auto py-1.5 px-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[62px] px-1.5 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-teal-800 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              {/* Active Indicator Pill (Material Design 3 style) */}
              <div
                className={`flex items-center justify-center w-11 h-7 rounded-full transition-colors relative ${
                  isActive ? 'bg-teal-100 text-teal-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {tab.icon}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight truncate mt-0.5 max-w-[70px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
