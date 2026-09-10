import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  ExternalLink,
  QrCode,
  CheckCircle2,
  Copy,
  Sparkles,
  FileCode2,
  ShieldCheck,
  Zap,
  FileArchive,
} from 'lucide-react';
import QRCode from 'qrcode';
import { Language } from '../types';
import { usePWAInstall } from '../utils/usePWAInstall';
import { generateAndroidProjectZip } from '../utils/androidProjectGenerator';
import { downloadSourceZip } from '../utils/sourceZipExport';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'cloud' | 'source' | 'fullcode'>('direct');

  // Derive active app URL safely
  const currentOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-fc62xif3bqguwpkdflxrm3-234877926679.asia-east1.run.app';

  // Fallback to shared URL if on localhost or dev container
  const appLiveUrl =
    currentOrigin.includes('localhost') || currentOrigin.includes('3000')
      ? 'https://ais-pre-fc62xif3bqguwpkdflxrm3-234877926679.asia-east1.run.app'
      : currentOrigin;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(appLiveUrl, {
        width: 260,
        margin: 1.5,
        color: {
          dark: '#042f2e',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Error generating QR code', err));
    }
  }, [isOpen, appLiveUrl]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appLiveUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleDownloadProjectZip = async () => {
    try {
      setIsGeneratingZip(true);
      const zipBlob = await generateAndroidProjectZip({
        appName: 'MahaSchool Attendance & Poshan Aahar',
        appShortName: 'MahaSchool',
        packageId: 'in.gov.mahaschool.app',
        appUrl: appLiveUrl,
        themeColor: '#0d9488',
        backgroundColor: '#f8fafc',
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MahaSchool-Android-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate Android project zip', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(
    appLiveUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 p-4 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-teal-100 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-md">
              <Smartphone className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                  ANDROID APK & APP
                </span>
                <span className="text-xs text-teal-300 font-semibold">
                  MAHASCHOOL v1.0
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                {lang === 'mr'
                  ? 'अँड्रॉइड APK व मोबाईल ॲप इन्स्टॉल करा'
                  : 'Install Android APK & Mobile App'}
              </h2>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('direct')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'direct'
                ? 'bg-white text-teal-900 border-t-2 border-teal-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>
              {lang === 'mr'
                ? '१. फोनवर थेट इन्स्टॉल (WebAPK)'
                : '1. Direct Install (WebAPK)'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cloud'
                ? 'bg-white text-teal-900 border-t-2 border-teal-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>
              {lang === 'mr' ? '२. ऑनलाइन APK तयार करा' : '2. 1-Click APK Generator'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('source')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'source'
                ? 'bg-white text-teal-900 border-t-2 border-teal-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode2 className="w-4 h-4 text-slate-600" />
            <span>
              {lang === 'mr' ? '३. Android Studio प्रोजेक्ट (.ZIP)' : '3. Android Studio Project'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fullcode')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'fullcode'
                ? 'bg-white text-teal-900 border-t-2 border-teal-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileArchive className="w-4 h-4 text-emerald-600" />
            <span>
              {lang === 'mr' ? '४. संपूर्ण सोर्स कोड (.ZIP)' : '4. Full Source Code (.ZIP)'}
            </span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* TAB 1: Direct WebAPK */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                  <p className="font-bold">
                    {lang === 'mr'
                      ? 'अँड्रॉइड फोनवर इन्स्टॉल करण्याचा सर्वोत्तम व सोपा मार्ग:'
                      : 'Recommended: Native Android WebAPK Installation'}
                  </p>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    {lang === 'mr'
                      ? 'गुगल क्रोम (Google Chrome) हे ॲप तुमच्या फोनवर थेट अधिकृत WebAPK पॅकेज म्हणून इन्स्टॉल करते. यामुळे ॲप पूर्णपणे ऑफलाइन चालते आणि फोनच्या होम स्क्रीनवर ॲप आयकॉन येतो.'
                      : 'Google Chrome directly compiles and registers this as an official native WebAPK package on Android with offline support and home screen launch icon.'}
                  </p>
                </div>
              </div>

              {/* QR Code & Direct Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="Scan to open on phone"
                      className="w-44 h-44 rounded-lg"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center bg-slate-100 rounded-lg">
                      <QrCode className="w-12 h-12 text-slate-400 animate-pulse" />
                    </div>
                  )}
                  <p className="text-[11px] font-bold text-slate-700 mt-2 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-teal-700" />
                    {lang === 'mr'
                      ? 'फोन कॅमेऱ्याने QR कोड स्कॅन करा'
                      : 'Scan with Android phone camera'}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {lang === 'mr' ? 'कसे इन्स्टॉल करावे (Steps):' : 'Installation Steps:'}
                  </h4>
                  <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside font-medium leading-relaxed">
                    <li>
                      {lang === 'mr'
                        ? 'फोनच्या Chrome ब्राऊझरमध्ये वरील लिंक उघडा.'
                        : 'Open the link in Google Chrome on your phone.'}
                    </li>
                    <li>
                      {lang === 'mr'
                        ? 'स्क्रीनवरील '
                        : 'Tap '}
                      <span className="font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">
                        {lang === 'mr' ? 'ॲप इन्स्टॉल करा' : 'Install App / APK'}
                      </span>
                      {lang === 'mr'
                        ? ' बटणावर टॅप करा.'
                        : ' button.'}
                    </li>
                    <li>
                      {lang === 'mr'
                        ? 'किंवा Chrome च्या उजव्या बाजूच्या तीन ठिपक्यांवर (⋮) क्लिक करून "Install app" / "होम स्क्रीनवर जोडा" निवडा.'
                        : 'Or tap Chrome menu (⋮) -> "Install app".'}
                    </li>
                  </ol>

                  {isInstallable && (
                    <button
                      onClick={install}
                      className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition active:scale-95 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{lang === 'mr' ? 'या डिव्हाइसवर आता इन्स्टॉल करा' : 'Install on this device now'}</span>
                    </button>
                  )}

                  {isInstalled && (
                    <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>{lang === 'mr' ? 'ॲप आधीच इन्स्टॉल झालेले आहे!' : 'App is already installed!'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* URL Box */}
              <div className="flex items-center gap-2 p-2.5 bg-slate-100 rounded-xl border border-slate-200">
                <input
                  type="text"
                  readOnly
                  value={appLiveUrl}
                  className="bg-transparent text-xs font-mono text-slate-800 flex-1 outline-hidden px-2 truncate select-all"
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1 shrink-0"
                >
                  {copiedUrl ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{lang === 'mr' ? 'कॉपी झाले' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{lang === 'mr' ? 'लिंक कॉपी' : 'Copy URL'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Cloud APK Generator */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-black text-teal-950">
                    {lang === 'mr'
                      ? 'PWABuilder द्वारे थेट APK फाईल डाऊनलोड करा'
                      : 'Download .APK file via PWABuilder'}
                  </h3>
                </div>
                <p className="text-xs text-teal-900 leading-relaxed">
                  {lang === 'mr'
                    ? 'मायक्रोसॉफ्ट व गुगल क्रोम टीमचे अधिकृत टूल PWABuilder वापरून तुम्ही या ॲपची थेट .APK (Android Package) किंवा .AAB (Google Play Store) फाईल एका क्लिकवर तयार करू शकता.'
                    : 'PWABuilder is the official Google Chrome and Microsoft tool that converts web apps into signed Android APK packages for direct sideloading or Google Play Store.'}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {lang === 'mr' ? 'पायऱ्या (Instructions):' : 'How it works:'}
                </h4>
                <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside font-medium leading-relaxed">
                  <li>
                    {lang === 'mr'
                      ? 'खालील बटणावर क्लिक करून PWABuilder उघडा.'
                      : 'Click the button below to open PWABuilder.'}
                  </li>
                  <li>
                    {lang === 'mr'
                      ? 'स्क्रीनवर "Package for Stores" बटणावर क्लिक करा आणि "Android" निवडा.'
                      : 'Click "Package for Stores" and select "Android".'}
                  </li>
                  <li>
                    {lang === 'mr'
                      ? '"Download APK" वर क्लिक करून तुमच्या संगणकावर किंवा फोनवर थेट .apk फाईल डाऊनलोड करा!'
                      : 'Click "Download APK" to get your ready-to-install Android .apk file!'}
                  </li>
                </ol>

                <a
                  href={pwaBuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-800 to-teal-950 hover:from-teal-900 hover:to-slate-950 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition active:scale-95"
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <span>
                    {lang === 'mr'
                      ? 'PWABuilder वर APK तयार करा (Open PWABuilder)'
                      : 'Generate .APK on PWABuilder'}
                  </span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: Android Studio Source Project */}
          {activeTab === 'source' && (
            <div className="space-y-4">
              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-teal-800" />
                  <h3 className="text-sm font-black text-slate-900">
                    {lang === 'mr'
                      ? 'संपूर्ण Android Studio प्रोजेक्ट (Kotlin / TWA)'
                      : 'Complete Android Studio Project Source Code'}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === 'mr'
                    ? 'जर तुम्हाला Android Studio मध्ये स्वतःचा APK किंवा AAB बनवायचा असेल, तर तुम्ही हा संपूर्ण प्रोजेक्ट डाउनलोड करू शकता. यात AndroidManifest.xml, build.gradle आणि सर्व फाइल्स तयार आहेत.'
                    : 'Download the complete Android Studio project containing build.gradle, AndroidManifest.xml, TWA launcher, and resource configs to build APK via Gradle.'}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="text-xs text-slate-700 space-y-1 font-mono bg-slate-900 text-slate-200 p-3 rounded-xl">
                  <div className="text-teal-400 font-bold mb-1">// Gradle Build Command:</div>
                  <div>./gradlew assembleRelease</div>
                  <div className="text-slate-400 text-[11px] mt-1">
                    Output: app/build/outputs/apk/release/app-release.apk
                  </div>
                </div>

                <button
                  onClick={handleDownloadProjectZip}
                  disabled={isGeneratingZip}
                  className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  <Download className={`w-4 h-4 ${isGeneratingZip ? 'animate-bounce' : ''}`} />
                  <span>
                    {isGeneratingZip
                      ? (lang === 'mr' ? 'ZIP तयार होत आहे...' : 'Packaging ZIP...')
                      : (lang === 'mr'
                          ? 'Android Studio प्रोजेक्ट डाउनलोड करा (.ZIP)'
                          : 'Download Android Studio Project (.ZIP)')}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Full App Source Code */}
          {activeTab === 'fullcode' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <FileArchive className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-sm font-black text-slate-900">
                    {lang === 'mr'
                      ? 'संपूर्ण ॲप सोर्स कोड (.ZIP) एक्सपोर्ट'
                      : 'Export Complete Application Source Code (.ZIP)'}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === 'mr'
                    ? 'या ZIP फाईलमध्ये या ॲपचा संपूर्ण सोर्स कोड (React + TypeScript, Vite, Tailwind CSS, PM पोषण आहार कॅल्क्युलेटर, हजेरी, सूचना, सर्व घटक व कॉन्फिगरेशन) समाविष्ट आहे.'
                    : 'This ZIP archive packages the complete codebase (React + TypeScript, Vite, Tailwind CSS, PM POSHAN calculator, attendance, notice generation, components, and configs).'}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="font-bold text-slate-900">
                    {lang === 'mr' ? 'प्रोजेक्ट रन कसा करावा:' : 'How to run this project:'}
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 font-mono text-[11px] bg-slate-900 text-slate-200 p-3 rounded-xl">
                    <li>unzip mahaschool-source-code.zip</li>
                    <li>cd mahaschool-source-code</li>
                    <li>npm install</li>
                    <li>npm run dev // runs at localhost:3000</li>
                  </ol>
                </div>

                <button
                  type="button"
                  onClick={() => downloadSourceZip()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {lang === 'mr'
                      ? 'सोर्स कोड ZIP डाऊनलोड करा (mahaschool-source-code.zip)'
                      : 'Download Source Code ZIP (mahaschool-source-code.zip)'}
                  </span>
                </button>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <p className="font-bold">
                    {lang === 'mr' ? 'टीप (AI Studio एक्सपोर्ट):' : 'AI Studio Export Note:'}
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    {lang === 'mr'
                      ? 'तुम्ही AI Studio मधील मुख्य मेनू (वर उजवीकडे Settings) &rarr; "Export to GitHub" किंवा "Download ZIP" द्वारे देखील थेट संपूर्ण कोड डाउनलोड करू शकता.'
                      : 'You can also use AI Studio top right Settings menu &rarr; "Export to GitHub" or "Download ZIP" at any time.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500">
            {lang === 'mr'
              ? 'महाराष्ट्र जिल्हा परिषद / महापालिका शाळांसाठी विकसित'
              : 'Built for Maharashtra State Schools'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
          >
            {lang === 'mr' ? 'बंद करा' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
