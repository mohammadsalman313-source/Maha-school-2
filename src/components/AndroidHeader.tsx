import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Sparkles, Smartphone, Monitor, Globe, School } from 'lucide-react';
import { Language, SchoolProfile } from '../types';
import { translations } from '../utils/i18n';
import { PWAInstallButton } from './PWAInstallButton';

interface AndroidHeaderProps {
  lang: Language;
  onToggleLang: () => void;
  schoolProfile: SchoolProfile;
  isMobileDeviceFrame: boolean;
  onToggleDeviceFrame: () => void;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  lang,
  onToggleLang,
  schoolProfile,
  isMobileDeviceFrame,
  onToggleDeviceFrame,
}) => {
  const t = translations[lang];
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white select-none shrink-0 shadow-md">
      {/* Android System Status Bar (Authentic Android Experience) */}
      <div className="px-4 py-1.5 flex items-center justify-between text-xs text-teal-100/90 border-b border-white/10 tracking-wide font-mono">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{currentTime || '10:30 AM'}</span>
          <span className="text-[10px] bg-teal-700/60 px-1.5 py-0.5 rounded text-emerald-200 uppercase font-sans font-medium">
            4G LTE
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="hidden sm:inline font-sans text-teal-200">
            UDISE: <span className="font-mono text-amber-300 font-bold">{schoolProfile.udiseCode}</span>
          </span>
          <Wifi className="w-3.5 h-3.5 text-teal-200" />
          <div className="flex items-center gap-1 font-sans">
            <span>94%</span>
            <BatteryMedium className="w-4 h-4 text-emerald-300" />
          </div>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-900/30 shrink-0 border border-amber-300/40">
            <School className="w-5 h-5 text-slate-950" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-extrabold text-base sm:text-lg leading-tight tracking-tight text-white truncate">
                {lang === 'mr' ? 'महाशाळा' : 'MahaSchool'}
              </h1>
              <span className="text-[11px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full">
                {lang === 'mr' ? 'हजेरी व पोषण आहार' : 'Attendance & MDM'}
              </span>
            </div>
            <p className="text-xs text-teal-200 truncate mt-0.5">
              {lang === 'mr' ? schoolProfile.schoolNameMr : schoolProfile.schoolNameEn}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Toggle */}
          <button
            id="btn-lang-toggle"
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition active:scale-95"
            title="भाषा बदला / Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'mr' ? 'English' : 'मराठी'}</span>
          </button>

          {/* Android Mobile Frame Toggle (View in Android Phone Mockup vs Responsive Full) */}
          <button
            id="btn-device-frame-toggle"
            onClick={onToggleDeviceFrame}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-800/80 hover:bg-teal-700/80 border border-teal-600/40 text-xs font-medium text-teal-100 transition active:scale-95"
            title={isMobileDeviceFrame ? 'पूर्ण पडद्यावर पहा' : 'अँड्रॉइड फोन फ्रेममध्ये पहा'}
          >
            {isMobileDeviceFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-emerald-300" />
                <span>Full View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                <span>Android Mode</span>
              </>
            )}
          </button>

          {/* In-app PWA install button */}
          <PWAInstallButton lang={lang} />
        </div>
      </div>
    </header>
  );
};
