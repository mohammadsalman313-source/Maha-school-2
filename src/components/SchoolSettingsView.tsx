import React, { useState, useEffect } from 'react';
import {
  School,
  Save,
  CheckCircle2,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Sliders,
  DollarSign,
  Info,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  Database,
  Smartphone,
  FileArchive,
} from 'lucide-react';
import { SchoolProfile, Language } from '../types';
import { translations } from '../utils/i18n';
import { Storage } from '../utils/storage';
import { AndroidApkModal } from './AndroidApkModal';
import { downloadSourceZip } from '../utils/sourceZipExport';

interface SchoolSettingsViewProps {
  schoolProfile: SchoolProfile;
  onSaveProfile: (profile: SchoolProfile) => void;
  lang: Language;
  onReloadAllData: () => void;
  isOnline?: boolean;
}

export const SchoolSettingsView: React.FC<SchoolSettingsViewProps> = ({
  schoolProfile,
  onSaveProfile,
  lang,
  onReloadAllData,
  isOnline,
}) => {
  const t = translations[lang];

  const [formData, setFormData] = useState<SchoolProfile>(schoolProfile);
  const [toast, setToast] = useState<string | null>(null);

  // Sync state & indicators
  const [effectiveOnline, setEffectiveOnline] = useState<boolean>(() => {
    if (typeof isOnline === 'boolean') return isOnline;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [syncInfo, setSyncInfo] = useState(() => Storage.getSyncInfo());
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(syncInfo.lastSyncTime);
  const [autoSync, setAutoSync] = useState<boolean>(syncInfo.autoSync);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncStepMessage, setSyncStepMessage] = useState<string>('');
  const [syncSuccessBanner, setSyncSuccessBanner] = useState<boolean>(false);
  const [showOfflineNotice, setShowOfflineNotice] = useState<boolean>(false);
  const [showApkModal, setShowApkModal] = useState<boolean>(false);

  // Counts of local records
  const [syncedCounts, setSyncedCounts] = useState(() => {
    return (
      syncInfo.lastSyncedCounts || {
        students: Storage.getStudents().length,
        attendance: Storage.getAttendance().length,
        poshan: Storage.getPoshanEntries().length,
        stock: Storage.getStock().length,
        notices: Storage.getNotices().length,
      }
    );
  });

  useEffect(() => {
    if (typeof isOnline === 'boolean') {
      setEffectiveOnline(isOnline);
    }
  }, [isOnline]);

  useEffect(() => {
    const handleOnline = () => {
      setEffectiveOnline(true);
      setShowOfflineNotice(false);
    };
    const handleOffline = () => {
      setEffectiveOnline(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatSyncTime = (isoString: string | null) => {
    if (!isoString) {
      return lang === 'mr' ? 'अद्याप सिंक केलेले नाही' : 'Not synced yet';
    }
    try {
      const d = new Date(isoString);
      return d.toLocaleString(lang === 'mr' ? 'mr-IN' : 'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const handleTriggerSync = () => {
    if (!effectiveOnline) {
      setShowOfflineNotice(true);
      return;
    }

    setShowOfflineNotice(false);
    setIsSyncing(true);
    setSyncProgress(20);
    setSyncStepMessage(
      lang === 'mr'
        ? 'विद्यार्थी व पटसंख्या माहिती पडताळत आहे...'
        : 'Verifying student roster data...'
    );

    setTimeout(() => {
      setSyncProgress(55);
      setSyncStepMessage(
        lang === 'mr'
          ? 'हजेरी व पोषण आहार नोंदवही सिंक करत आहे...'
          : 'Syncing attendance & MDM daily records...'
      );
    }, 400);

    setTimeout(() => {
      setSyncProgress(85);
      setSyncStepMessage(
        lang === 'mr'
          ? 'धान्य साठा व शालेय परिपत्रके सुरक्षित करत आहे...'
          : 'Packaging stock ledger and notices...'
      );
    }, 800);

    setTimeout(() => {
      const result = Storage.performDataSync();
      setSyncProgress(100);
      setSyncStepMessage(
        lang === 'mr' ? 'डेटा सुरक्षित जतन झाला!' : 'Data securely synced!'
      );
      setLastSyncTime(result.timestamp);
      setSyncedCounts(result.counts);
      setIsSyncing(false);
      setSyncSuccessBanner(true);
      setToast(
        lang === 'mr'
          ? 'सर्व शालेय माहिती यशस्वीरित्या सिंक झाली!'
          : 'All school records synced successfully!'
      );
      setTimeout(() => {
        setSyncSuccessBanner(false);
        setToast(null);
      }, 4000);
    }, 1250);
  };

  const handleToggleAutoSync = () => {
    const nextVal = !autoSync;
    setAutoSync(nextVal);
    Storage.saveSyncInfo({
      ...Storage.getSyncInfo(),
      autoSync: nextVal,
    });
    setToast(
      nextVal
        ? (lang === 'mr'
            ? 'इंटरनेट सुरू होताच ऑटो-सिंक सुरू केले!'
            : 'Auto-sync enabled when online!')
        : (lang === 'mr' ? 'ऑटो-सिंक बंद केले.' : 'Auto-sync disabled.')
    );
    setTimeout(() => setToast(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setToast(
      lang === 'mr' ? 'शाळा माहिती जतन केली!' : 'School details saved successfully!'
    );
    setTimeout(() => setToast(null), 3000);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backup = {
      profile: Storage.getProfile(),
      students: Storage.getStudents(),
      attendance: Storage.getAttendance(),
      poshan: Storage.getPoshanEntries(),
      stock: Storage.getStock(),
      notices: Storage.getNotices(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MahaSchool_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.students) Storage.saveStudents(data.students);
        if (data.attendance) Storage.saveAttendance(data.attendance);
        if (data.poshan) Storage.savePoshanEntries(data.poshan);
        if (data.stock) Storage.saveStock(data.stock);
        if (data.notices) Storage.saveNotices(data.notices);
        if (data.profile) Storage.saveProfile(data.profile);

        onReloadAllData();
        setToast(
          lang === 'mr' ? 'बॅकअप रिस्टोअर झाला!' : 'Backup restored successfully!'
        );
        setTimeout(() => setToast(null), 3000);
      } catch {
        alert(lang === 'mr' ? 'अवैध बॅकअप फाईल!' : 'Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleFullReset = () => {
    if (
      confirm(
        lang === 'mr'
          ? 'सावध राहा: सर्व माहिती (हजेरी, पोषण आहार, सूचना) पूर्ववत करायची आहे का?'
          : 'Warning: Reset all app data to fresh defaults?'
      )
    ) {
      Storage.resetAllData();
      onReloadAllData();
    }
  };

  return (
    <div className="space-y-4 pb-12 max-w-2xl mx-auto">
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-teal-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex items-center gap-2">
          <span className="bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            शाळा तपशील
          </span>
          <span className="text-xs text-teal-200">CONFIGURATION &amp; BACKUP</span>
        </div>
        <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
          {t.navSettings}
        </h2>
        <p className="text-xs text-teal-100/90 mt-0.5">
          {lang === 'mr'
            ? 'शाळेचे नाव, UDISE कोड, दर प्रति विद्यार्थी व डेटा बॅकअप'
            : 'School profile, UDISE code, cooking rates and offline data management'}
        </p>
      </div>

      {/* SYNC DATA INDICATOR & MANUAL TRIGGER CARD */}
      <div
        id="sync-data-card"
        className="bg-white rounded-2xl p-4 sm:p-5 border border-teal-200 shadow-sm space-y-4 relative overflow-hidden"
      >
        {/* Subtle accent corner glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-teal-50 rounded-full blur-2xl pointer-events-none -mr-12 -mt-12" />

        {/* Card Header with Live Connection Status Indicator */}
        <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-slate-100 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-amber-300 flex items-center justify-center shadow-sm shrink-0">
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {t.syncData}
                </h3>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-200 px-2 py-0.5 rounded-full">
                  OFFLINE-FIRST SYNC
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.syncDataSubtitle}
              </p>
            </div>
          </div>

          {/* Connection Status Indicator Badge */}
          <div
            id="network-sync-status-indicator"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition shadow-xs ${
              effectiveOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
          >
            {effectiveOnline ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <Wifi className="w-3.5 h-3.5 text-emerald-700" />
                <span>{lang === 'mr' ? 'ऑनलाइन जोडलेले' : 'Online Connected'}</span>
              </>
            ) : (
              <>
                <span className="inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                <span>{lang === 'mr' ? 'ऑफलाइन मोड' : 'Offline Mode'}</span>
              </>
            )}
          </div>
        </div>

        {/* Sync Trigger Action & Status Banner */}
        <div className="bg-gradient-to-r from-slate-50 via-teal-50/40 to-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Database className="w-4 h-4 text-teal-700 shrink-0" />
              <span className="font-semibold">{t.lastSynced}:</span>
              <span className="font-bold text-slate-950 bg-white px-2 py-0.5 rounded border border-slate-200">
                {formatSyncTime(lastSyncTime)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              {lastSyncTime ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {t.syncSuccessState}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {t.notSyncedYet}
                </span>
              )}
            </div>
          </div>

          {/* Manual Trigger Button */}
          <button
            id="btn-sync-data"
            type="button"
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 active:scale-95 disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 text-amber-300 ${isSyncing ? 'animate-spin' : ''}`}
            />
            <span>{isSyncing ? t.syncing : t.syncNow}</span>
          </button>
        </div>

        {/* Active Sync Progress Bar */}
        {isSyncing && (
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 space-y-2 animate-fadeIn">
            <div className="flex justify-between text-xs font-bold text-teal-950">
              <span>{syncStepMessage}</span>
              <span className="font-mono">{syncProgress}%</span>
            </div>
            <div className="w-full bg-teal-200/70 rounded-full h-2 overflow-hidden">
              <div
                className="bg-teal-700 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Offline Notification Warning (if trigger was clicked while offline) */}
        {showOfflineNotice && !effectiveOnline && (
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 text-xs space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {lang === 'mr'
                    ? 'डिव्हाइस सध्या ऑफलाइन आहे (इंटरनेट बंद आहे)'
                    : 'Device is currently offline'}
                </p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  {t.syncFailedOffline}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-3 py-1.5 bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold rounded-lg text-[11px] flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>स्थानिक बॅकअप सेव्ह करा</span>
              </button>
              <button
                type="button"
                onClick={() => setShowOfflineNotice(false)}
                className="text-[11px] text-amber-800 underline hover:text-amber-950"
              >
                {t.close}
              </button>
            </div>
          </div>
        )}

        {/* Sync Success Alert */}
        {syncSuccessBanner && (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t.syncedSuccess}</span>
          </div>
        )}

        {/* Live Local Records Breakdown */}
        <div>
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span>{t.syncedSummary}</span>
            <span className="text-[10px] text-slate-500 font-medium">
              {lang === 'mr' ? 'स्थानिक फोन/ब्राउझर स्टोरेजमध्ये सुरक्षित' : 'Safely kept in local storage'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-2xs">
              <span className="block text-sm font-black text-slate-900 font-mono">{syncedCounts.students}</span>
              <span className="text-[10px] text-slate-600 font-semibold">{lang === 'mr' ? 'विद्यार्थी' : 'Students'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-2xs">
              <span className="block text-sm font-black text-teal-800 font-mono">{syncedCounts.attendance}</span>
              <span className="text-[10px] text-slate-600 font-semibold">{lang === 'mr' ? 'हजेरी दिवस' : 'Att. Days'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-2xs">
              <span className="block text-sm font-black text-amber-800 font-mono">{syncedCounts.poshan}</span>
              <span className="text-[10px] text-slate-600 font-semibold">{lang === 'mr' ? 'पोषण नोंदी' : 'MDM Logs'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-2xs">
              <span className="block text-sm font-black text-slate-900 font-mono">{syncedCounts.stock}</span>
              <span className="text-[10px] text-slate-600 font-semibold">{lang === 'mr' ? 'धान्य साठा' : 'Stock Items'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-2xs col-span-2 sm:col-span-1">
              <span className="block text-sm font-black text-slate-900 font-mono">{syncedCounts.notices}</span>
              <span className="text-[10px] text-slate-600 font-semibold">{lang === 'mr' ? 'परिपत्रके' : 'Notices'}</span>
            </div>
          </div>
        </div>

        {/* Auto-Sync Toggle Switch & Quick Snapshot Link */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <label className="flex items-start sm:items-center gap-2.5 cursor-pointer select-none">
            <input
              id="toggle-auto-sync"
              type="checkbox"
              checked={autoSync}
              onChange={handleToggleAutoSync}
              className="w-4 h-4 mt-0.5 sm:mt-0 rounded text-teal-700 focus:ring-teal-500 border-slate-300 accent-teal-700 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                {t.autoSyncLabel}
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight">
                {t.autoSyncDesc}
              </span>
            </div>
          </label>

          <button
            type="button"
            onClick={handleExportBackup}
            className="text-xs font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1.5 transition shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span>{t.syncDownloadCopy}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* School Profile Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <School className="w-4 h-4 text-teal-700" />
            <span>शाळेची मूलभूत माहिती (School Details)</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              शाळेचे पूर्ण नाव (मराठी)
            </label>
            <input
              type="text"
              required
              value={formData.schoolNameMr}
              onChange={(e) =>
                setFormData({ ...formData, schoolNameMr: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              School Name (English)
            </label>
            <input
              type="text"
              required
              value={formData.schoolNameEn}
              onChange={(e) =>
                setFormData({ ...formData, schoolNameEn: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                UDISE कोड (११ अंकी)
              </label>
              <input
                type="text"
                required
                value={formData.udiseCode}
                onChange={(e) =>
                  setFormData({ ...formData, udiseCode: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                केंद्र (Center)
              </label>
              <input
                type="text"
                value={formData.center}
                onChange={(e) => setFormData({ ...formData, center: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                तालुका (Taluka)
              </label>
              <input
                type="text"
                value={formData.taluka}
                onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                जिल्हा (District)
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              मुख्याध्यापक / प्रभारी शिक्षक नाव
            </label>
            <input
              type="text"
              value={formData.headmasterName}
              onChange={(e) =>
                setFormData({ ...formData, headmasterName: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        {/* Cooking Conversion Cost Rates Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-emerald-700" />
            <span>
              {lang === 'mr'
                ? 'पोषण आहार पाककृती खर्च दर (₹ प्रति विद्यार्थी)'
                : 'Cooking Conversion Cost Rates'}
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
              <label className="block text-xs font-bold text-teal-900 mb-1">
                प्राथमिक (इयत्ता १ ते ५) दर (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={formData.primaryCookingRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primaryCookingRate: Number(e.target.value),
                  })
                }
                className="w-full bg-white border border-teal-300 rounded-lg px-3 py-1.5 text-sm font-black text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
              />
              <span className="text-[10px] text-teal-700 mt-1 block">
                शासकीय दर: ₹५.४५ / विद्यार्थी
              </span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <label className="block text-xs font-bold text-amber-900 mb-1">
                उच्च प्राथमिक (इयत्ता ६ ते ८) दर (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={formData.upperPrimaryCookingRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    upperPrimaryCookingRate: Number(e.target.value),
                  })
                }
                className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-sm font-black text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-600 font-mono"
              />
              <span className="text-[10px] text-amber-700 mt-1 block">
                शासकीय दर: ₹८.१७ / विद्यार्थी
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>{lang === 'mr' ? 'शाळा माहिती जतन करा' : 'Save Details'}</span>
          </button>
        </div>
      </form>

      {/* Android APK & Mobile Installation Card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-teal-500/10 rounded-2xl p-4 sm:p-5 border border-amber-300 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-600" />
            <span>{lang === 'mr' ? 'अँड्रॉइड APK व मोबाईल इन्स्टॉलेशन' : 'Android APK & Mobile Installation'}</span>
          </h3>
          <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
            APK / WEBAPK
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {lang === 'mr'
            ? 'शाळेच्या फोन किंवा टॅब्लेटवर हे ॲप इन्स्टॉल करण्यासाठी थेट WebAPK वापरा, PWABuilder द्वारे स्वतंत्र .apk फाईल तयार करा किंवा Android Studio प्रोजेक्ट डाऊनलोड करा.'
            : 'Install this app on teacher phones or school tablets via direct Android WebAPK, generate a standalone .apk package via PWABuilder, or download the full Android Studio project.'}
        </p>
        <div className="pt-1 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => setShowApkModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-800 to-slate-900 hover:from-teal-900 hover:to-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-amber-300" />
            <span>{lang === 'mr' ? 'APK फाईल पर्याय व डाऊनलोड उघडा' : 'Open APK Download & Options'}</span>
          </button>
        </div>
      </div>

      {/* Backup and Data Management */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
          <Download className="w-4 h-4 text-teal-700" />
          <span>डेटा बॅकअप व रिस्टोअर (Offline Storage Management)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 hover:bg-teal-50 border border-slate-200 text-xs font-bold text-slate-800 hover:text-teal-900 transition active:scale-95"
          >
            <Download className="w-4 h-4 text-teal-700" />
            <span>{t.exportBackup}</span>
          </button>

          <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 hover:bg-teal-50 border border-slate-200 text-xs font-bold text-slate-800 hover:text-teal-900 transition active:scale-95 cursor-pointer">
            <Upload className="w-4 h-4 text-teal-700" />
            <span>{t.importBackup}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              downloadSourceZip();
              setToast(lang === 'mr' ? 'सोर्स कोड (.ZIP) डाऊनलोड सुरू झाले!' : 'Source code (.ZIP) download started!');
              setTimeout(() => setToast(null), 3000);
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <FileArchive className="w-4 h-4 text-teal-700" />
            <span>{lang === 'mr' ? 'संपूर्ण सोर्स कोड डाऊनलोड (.ZIP)' : 'Download Source Code (.ZIP)'}</span>
          </button>

          <button
            onClick={handleFullReset}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>सर्व माहिती पूर्ववत करा (Reset Data)</span>
          </button>
        </div>
      </div>

      <AndroidApkModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
        lang={lang}
      />
    </div>
  );
};
