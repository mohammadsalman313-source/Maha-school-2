import React, { useState } from 'react';
import { Download, Sparkles, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Language } from '../types';
import { AndroidApkModal } from './AndroidApkModal';

interface PWAInstallButtonProps {
  lang: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ lang }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showApkModal, setShowApkModal] = useState(false);

  const handleClick = async () => {
    if (isInstallable) {
      try {
        await install();
      } catch {
        setShowApkModal(true);
      }
    } else {
      setShowApkModal(true);
    }
  };

  return (
    <>
      {isInstalled ? (
        <button
          onClick={() => setShowApkModal(true)}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/30 transition cursor-pointer"
          title={lang === 'mr' ? 'अँड्रॉइड APK पर्याय पहा' : 'View Android APK options'}
        >
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>{lang === 'mr' ? 'ॲप इन्स्टॉल्ड' : 'App Installed'}</span>
        </button>
      ) : (
        <button
          id="btn-pwa-install-action"
          onClick={handleClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 text-xs font-black shadow-md transition active:scale-95 cursor-pointer"
          title={lang === 'mr' ? 'अँड्रॉइड APK व ॲप डाऊनलोड' : 'Download Android APK & App'}
        >
          <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{lang === 'mr' ? 'APK / ॲप इन्स्टॉल' : 'APK / Install App'}</span>
          <Download className="w-3 h-3 stroke-[2.5] ml-0.5 opacity-80" />
        </button>
      )}

      <AndroidApkModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
        lang={lang}
      />
    </>
  );
};

