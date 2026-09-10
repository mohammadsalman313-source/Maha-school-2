import React, { useState, useEffect, useMemo } from 'react';
import { Storage } from './utils/storage';
import {
  Student,
  AttendanceRecord,
  PoshanAaharEntry,
  StockItem,
  SchoolNotice,
  SchoolProfile,
  Language,
} from './types';
import { AndroidHeader } from './components/AndroidHeader';
import { AndroidNavigation, TabType } from './components/AndroidNavigation';
import { AttendanceView } from './components/AttendanceView';
import { PoshanAaharView } from './components/PoshanAaharView';
import { AbsenteeNoticeView } from './components/AbsenteeNoticeView';
import { SchoolNoticesView } from './components/SchoolNoticesView';
import { StudentsDirectoryView } from './components/StudentsDirectoryView';
import { StockLedgerView } from './components/StockLedgerView';
import { SchoolSettingsView } from './components/SchoolSettingsView';
import { WifiOff, Smartphone } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('mahaschool_lang');
      return saved === 'en' ? 'en' : 'mr';
    } catch {
      return 'mr';
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Core Data States
  const [students, setStudents] = useState<Student[]>(() => Storage.getStudents());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() =>
    Storage.getAttendance()
  );
  const [poshanEntries, setPoshanEntries] = useState<PoshanAaharEntry[]>(() =>
    Storage.getPoshanEntries()
  );
  const [stock, setStock] = useState<StockItem[]>(() => Storage.getStock());
  const [notices, setNotices] = useState<SchoolNotice[]>(() => Storage.getNotices());
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() =>
    Storage.getProfile()
  );

  // Online / Offline tracking & Auto-sync on reconnect
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      const syncInfo = Storage.getSyncInfo();
      if (syncInfo.autoSync) {
        Storage.performDataSync();
      }
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === 'mr' ? 'en' : 'mr';
      localStorage.setItem('mahaschool_lang', next);
      return next;
    });
  };

  const handleReloadAll = () => {
    setStudents(Storage.getStudents());
    setAttendanceRecords(Storage.getAttendance());
    setPoshanEntries(Storage.getPoshanEntries());
    setStock(Storage.getStock());
    setNotices(Storage.getNotices());
    setSchoolProfile(Storage.getProfile());
  };

  // State update handlers that write through to localStorage
  const handleSaveStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    Storage.saveStudents(newStudents);
  };

  const handleSaveAttendance = (newRecords: AttendanceRecord[]) => {
    setAttendanceRecords(newRecords);
    Storage.saveAttendance(newRecords);
  };

  const handleSavePoshanEntry = (newEntry: PoshanAaharEntry) => {
    const updated = [
      newEntry,
      ...poshanEntries.filter((e) => e.date !== newEntry.date),
    ];
    setPoshanEntries(updated);
    Storage.savePoshanEntries(updated);
  };

  const handleSaveStock = (newStock: StockItem[]) => {
    setStock(newStock);
    Storage.saveStock(newStock);
  };

  const handleDeductStock = (deductions: { id: string; amount: number }[]) => {
    const updated = stock.map((item) => {
      const deduction = deductions.find((d) => d.id === item.id);
      if (deduction) {
        const newConsumed = item.consumedStock + deduction.amount;
        const newCurrent = Math.max(0, item.currentStock - deduction.amount);
        return {
          ...item,
          consumedStock: Number(newConsumed.toFixed(2)),
          currentStock: Number(newCurrent.toFixed(2)),
        };
      }
      return item;
    });
    setStock(updated);
    Storage.saveStock(updated);
  };

  const handleSaveNotices = (newNotices: SchoolNotice[]) => {
    setNotices(newNotices);
    Storage.saveNotices(newNotices);
  };

  const handleSaveProfile = (newProfile: SchoolProfile) => {
    setSchoolProfile(newProfile);
    Storage.saveProfile(newProfile);
  };

  // Today's absent student count for the navigation badge
  const absentCountToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceRecords.filter((r) => r.date === today);
    let count = 0;
    todayRecords.forEach((r) => {
      count += r.absentStudentIds.length;
    });
    return count;
  }, [attendanceRecords]);

  // Main screen renderer based on tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'attendance':
        return (
          <AttendanceView
            students={students}
            attendanceRecords={attendanceRecords}
            onSaveAttendance={handleSaveAttendance}
            lang={lang}
            onNavigateToAbsentee={() => setActiveTab('absentee')}
          />
        );
      case 'poshan':
        return (
          <PoshanAaharView
            attendanceRecords={attendanceRecords}
            poshanEntries={poshanEntries}
            onSavePoshanEntry={handleSavePoshanEntry}
            stock={stock}
            onDeductStock={handleDeductStock}
            schoolProfile={schoolProfile}
            lang={lang}
          />
        );
      case 'absentee':
        return (
          <AbsenteeNoticeView
            students={students}
            attendanceRecords={attendanceRecords}
            schoolProfile={schoolProfile}
            lang={lang}
            onNavigateToAttendance={() => setActiveTab('attendance')}
          />
        );
      case 'notices':
        return (
          <SchoolNoticesView
            notices={notices}
            onSaveNotices={handleSaveNotices}
            schoolProfile={schoolProfile}
            lang={lang}
          />
        );
      case 'students':
        return (
          <StudentsDirectoryView
            students={students}
            onSaveStudents={handleSaveStudents}
            lang={lang}
          />
        );
      case 'stock':
        return (
          <StockLedgerView stock={stock} onSaveStock={handleSaveStock} lang={lang} />
        );
      case 'settings':
        return (
          <SchoolSettingsView
            schoolProfile={schoolProfile}
            onSaveProfile={handleSaveProfile}
            lang={lang}
            onReloadAllData={handleReloadAll}
            isOnline={isOnline}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 flex items-center justify-center p-0 md:p-4 selection:bg-teal-600 selection:text-white">
      {/* Offline Alert Badge */}
      {!isOnline && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
          <WifiOff className="w-3.5 h-3.5" />
          <span>
            {lang === 'mr'
              ? 'ऑफलाइन मोड - सर्व माहिती सुरक्षित साठवली जात आहे'
              : 'Offline Mode - Local data active'}
          </span>
        </div>
      )}

      {/* Main Container - Supports Android Device Frame Mockup or Full Screen */}
      <div
        className={`w-full flex flex-col bg-slate-100 transition-all duration-300 overflow-hidden ${
          isMobileDeviceFrame
            ? 'max-w-[440px] h-[92vh] max-h-[920px] rounded-[44px] shadow-2xl border-[10px] border-slate-800 ring-1 ring-white/20'
            : 'max-w-5xl min-h-screen md:min-h-[92vh] md:rounded-3xl shadow-xl border border-slate-200'
        }`}
      >
        {/* Android Punch Hole Camera Cutout (Visible when in Android phone frame mode) */}
        {isMobileDeviceFrame && (
          <div className="bg-slate-900 pt-2 flex justify-center shrink-0">
            <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-slate-700/50 shadow-inner" />
          </div>
        )}

        {/* Android Status Bar & Top App Bar */}
        <AndroidHeader
          lang={lang}
          onToggleLang={toggleLang}
          schoolProfile={schoolProfile}
          isMobileDeviceFrame={isMobileDeviceFrame}
          onToggleDeviceFrame={() => setIsMobileDeviceFrame(!isMobileDeviceFrame)}
        />

        {/* Scrollable Viewport Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 scrollbar-thin">
          {renderTabContent()}
        </main>

        {/* Android Bottom Navigation Bar */}
        <AndroidNavigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          lang={lang}
          absentCountToday={absentCountToday}
        />
      </div>
    </div>
  );
}
