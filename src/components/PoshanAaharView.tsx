import React, { useState, useMemo } from 'react';
import {
  UtensilsCrossed,
  Calendar,
  Sparkles,
  RefreshCw,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Award,
  ChevronDown,
  Info,
  DollarSign,
  Scale,
  Egg,
  Save,
  Clock,
  History,
} from 'lucide-react';
import {
  PoshanAaharEntry,
  AttendanceRecord,
  SchoolProfile,
  Language,
  StockItem,
} from '../types';
import {
  calculatePoshanAahar,
  MAHA_WEEKLY_MENU,
  MAHA_POSHAN_NORMS,
} from '../utils/poshanRules';
import { translations } from '../utils/i18n';

interface PoshanAaharViewProps {
  attendanceRecords: AttendanceRecord[];
  poshanEntries: PoshanAaharEntry[];
  onSavePoshanEntry: (entry: PoshanAaharEntry) => void;
  stock: StockItem[];
  onDeductStock: (deductions: { id: string; amount: number }[]) => void;
  schoolProfile: SchoolProfile;
  lang: Language;
}

export const PoshanAaharView: React.FC<PoshanAaharViewProps> = ({
  attendanceRecords,
  poshanEntries,
  onSavePoshanEntry,
  stock,
  onDeductStock,
  schoolProfile,
  lang,
}) => {
  const t = translations[lang];

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Derive day index (0 = Sun, 1 = Mon, ... 6 = Sat)
  const dayOfWeekIndex = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.getDay();
    }
    return new Date().getDay();
  }, [selectedDate]);

  const menuItem = useMemo(() => {
    return (
      MAHA_WEEKLY_MENU.find((m) => m.dayIndex === dayOfWeekIndex) || MAHA_WEEKLY_MENU[1]
    );
  }, [dayOfWeekIndex]);

  // Helper to extract attendance counts for this date
  const attendanceCountsForDate = useMemo(() => {
    const dayRecords = attendanceRecords.filter((r) => r.date === selectedDate);
    let primary = 0;
    let upperPrimary = 0;
    let primaryEnrolled = 0;
    let upperPrimaryEnrolled = 0;

    dayRecords.forEach((r) => {
      if (r.standard >= 1 && r.standard <= 5) {
        primary += r.totalPresent;
        primaryEnrolled += r.totalEnrolled;
      } else if (r.standard >= 6 && r.standard <= 8) {
        upperPrimary += r.totalPresent;
        upperPrimaryEnrolled += r.totalEnrolled;
      }
    });

    return {
      primary,
      upperPrimary,
      primaryEnrolled: primaryEnrolled || 14,
      upperPrimaryEnrolled: upperPrimaryEnrolled || 6,
      hasRecords: dayRecords.length > 0,
    };
  }, [attendanceRecords, selectedDate]);

  // Existing entry for this date if already logged
  const existingEntry = useMemo(() => {
    return poshanEntries.find((e) => e.date === selectedDate);
  }, [poshanEntries, selectedDate]);

  // Form states
  const [primaryCount, setPrimaryCount] = useState<number>(() => {
    if (existingEntry) return existingEntry.primaryPresent;
    return attendanceCountsForDate.primary > 0 ? attendanceCountsForDate.primary : 11;
  });

  const [upperPrimaryCount, setUpperPrimaryCount] = useState<number>(() => {
    if (existingEntry) return existingEntry.upperPrimaryPresent;
    return attendanceCountsForDate.upperPrimary > 0
      ? attendanceCountsForDate.upperPrimary
      : 5;
  });

  const [customMenu, setCustomMenu] = useState<string>(
    existingEntry ? existingEntry.menuItem : menuItem.menuMr
  );

  const [tastedBy, setTastedBy] = useState<string>(
    existingEntry ? existingEntry.tastedBy : schoolProfile.headmasterName
  );

  const [qualityRemark, setQualityRemark] = useState<'excellent' | 'good' | 'satisfactory'>(
    existingEntry ? existingEntry.qualityRemark : 'excellent'
  );

  const [supplementaryDistributed, setSupplementaryDistributed] = useState<boolean>(
    existingEntry ? existingEntry.supplementaryDistributed : dayOfWeekIndex === 6
  );

  const [toast, setToast] = useState<string | null>(null);
  const [showMonthlyRegister, setShowMonthlyRegister] = useState<boolean>(false);

  // Keep state synced if selected date changes
  React.useEffect(() => {
    if (existingEntry) {
      setPrimaryCount(existingEntry.primaryPresent);
      setUpperPrimaryCount(existingEntry.upperPrimaryPresent);
      setCustomMenu(existingEntry.menuItem);
      setTastedBy(existingEntry.tastedBy);
      setQualityRemark(existingEntry.qualityRemark);
      setSupplementaryDistributed(existingEntry.supplementaryDistributed);
    } else {
      setPrimaryCount(
        attendanceCountsForDate.primary > 0 ? attendanceCountsForDate.primary : 11
      );
      setUpperPrimaryCount(
        attendanceCountsForDate.upperPrimary > 0 ? attendanceCountsForDate.upperPrimary : 5
      );
      setCustomMenu(lang === 'mr' ? menuItem.menuMr : menuItem.menuEn);
      setSupplementaryDistributed(dayOfWeekIndex === 6);
    }
  }, [selectedDate, existingEntry, attendanceCountsForDate, menuItem, lang]);

  // Sync with today's live attendance
  const syncWithAttendance = () => {
    setPrimaryCount(attendanceCountsForDate.primary);
    setUpperPrimaryCount(attendanceCountsForDate.upperPrimary);
    setToast(lang === 'mr' ? 'हजेरीतून संख्या अपडेट झाली!' : 'Synced with attendance!');
    setTimeout(() => setToast(null), 2500);
  };

  // Perform calculation
  const calc = useMemo(() => {
    return calculatePoshanAahar({
      primaryPresent: primaryCount,
      upperPrimaryPresent: upperPrimaryCount,
      primaryRate: schoolProfile.primaryCookingRate,
      upperPrimaryRate: schoolProfile.upperPrimaryCookingRate,
    });
  }, [primaryCount, upperPrimaryCount, schoolProfile]);

  // Save current Poshan log entry
  const handleSave = () => {
    const entry: PoshanAaharEntry = {
      id: existingEntry ? existingEntry.id : `poshan-${selectedDate}`,
      date: selectedDate,
      dayOfWeek: lang === 'mr' ? menuItem.dayNameMr : menuItem.dayNameEn,
      menuItem: customMenu,
      primaryEnrolled: attendanceCountsForDate.primaryEnrolled,
      primaryPresent: primaryCount,
      upperPrimaryEnrolled: attendanceCountsForDate.upperPrimaryEnrolled,
      upperPrimaryPresent: upperPrimaryCount,
      totalPresent: calc.totalPresent,
      riceKg: calc.riceKg,
      pulsesKg: calc.pulsesKg,
      oilKg: calc.oilKg,
      veggiesKg: calc.veggiesKg,
      spicesKg: calc.spicesKg,
      cookingCostRs: calc.cookingCostRs,
      supplementaryDistributed,
      supplementaryItem:
        lang === 'mr' ? menuItem.supplementaryMr : menuItem.supplementaryEn,
      supplementaryCount: supplementaryDistributed ? calc.totalPresent : 0,
      tastedBy,
      qualityRemark,
      notes:
        qualityRemark === 'excellent'
          ? 'अन्न चवदार, गरम व उच्च दर्जाचे होते. मुले आनंदाने जेवली.'
          : 'अन्न स्वच्छ व योग्य प्रमाणातील होते.',
    };

    onSavePoshanEntry(entry);

    // Auto deduct ration stock
    onDeductStock([
      { id: 'rice', amount: calc.riceKg },
      { id: 'pulses', amount: calc.pulsesKg },
      { id: 'oil', amount: calc.oilKg },
      { id: 'spices', amount: calc.spicesKg },
      ...(supplementaryDistributed
        ? [{ id: 'eggs_fruits', amount: calc.totalPresent }]
        : []),
    ]);

    setToast(t.poshanLogSaved);
    setTimeout(() => setToast(null), 3000);
  };

  // Print MDM register
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-teal-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner & Date Controls */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                महाराष्ट्र शासन
              </span>
              <span className="text-xs text-teal-200">PM POSHAN NORM</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
              {t.poshanTitle}
            </h2>
            <p className="text-xs text-teal-100/90 mt-0.5">{t.poshanSubtitle}</p>
          </div>

          {/* Quick Register View Toggle */}
          <button
            id="btn-toggle-monthly-register"
            onClick={() => setShowMonthlyRegister(!showMonthlyRegister)}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition active:scale-95 self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-300" />
            <span>
              {showMonthlyRegister
                ? lang === 'mr'
                  ? 'हिशोब पॅनल पहा'
                  : 'View Calculator'
                : t.generateMonthlyRegister}
            </span>
          </button>
        </div>

        {/* Date Selector & Weekly Menu Display */}
        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="text-xs font-semibold text-teal-100">{t.calculateForDate}:</span>
            <input
              id="poshan-date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-teal-950/70 border border-teal-600/50 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Today's Govt prescribed menu */}
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                {t.todaysMenu} ({menuItem.dayNameMr})
              </span>
              <span className="text-[10px] text-teal-200 font-mono">
                {menuItem.recommendedPulse}
              </span>
            </div>
            <p className="text-xs font-bold text-white mt-1 truncate">
              {lang === 'mr' ? menuItem.menuMr : menuItem.menuEn}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Register View (Toggle Mode) */}
      {showMonthlyRegister ? (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-700" />
                <span>
                  {lang === 'mr'
                    ? 'शालेय पोषण आहार दैनिक व मासिक नोंदवही'
                    : 'MDM Daily & Monthly Register'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {schoolProfile.schoolNameMr} | UDISE: {schoolProfile.udiseCode}
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'प्रिंट काढा' : 'Print Register'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700 border border-slate-200">
              <thead className="bg-slate-100 text-slate-900 uppercase font-extrabold border-b border-slate-200">
                <tr>
                  <th className="px-2.5 py-2 border-r border-slate-200">{t.date}</th>
                  <th className="px-2.5 py-2 border-r border-slate-200">वार</th>
                  <th className="px-2.5 py-2 border-r border-slate-200">मेनू</th>
                  <th className="px-2.5 py-2 border-r border-slate-200 text-center">
                    इ. १-५ हजर
                  </th>
                  <th className="px-2.5 py-2 border-r border-slate-200 text-center">
                    इ. ६-८ हजर
                  </th>
                  <th className="px-2.5 py-2 border-r border-slate-200 text-center font-black">
                    एकूण
                  </th>
                  <th className="px-2.5 py-2 border-r border-slate-200 text-right">
                    तांदूळ (kg)
                  </th>
                  <th className="px-2.5 py-2 border-r border-slate-200 text-right">
                    डाळ (kg)
                  </th>
                  <th className="px-2.5 py-2 border-r border-slate-200 text-right">
                    तेल (kg)
                  </th>
                  <th className="px-2.5 py-2 border-r border-slate-200 text-right">
                    खर्च (₹)
                  </th>
                  <th className="px-2.5 py-2">चव तपासणी</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {poshanEntries.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-6 text-slate-400">
                      नोंदी उपलब्ध नाहीत.
                    </td>
                  </tr>
                ) : (
                  poshanEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 font-medium">
                      <td className="px-2.5 py-2 font-mono font-bold border-r border-slate-100">
                        {entry.date}
                      </td>
                      <td className="px-2.5 py-2 border-r border-slate-100">
                        {entry.dayOfWeek}
                      </td>
                      <td className="px-2.5 py-2 border-r border-slate-100 max-w-[140px] truncate">
                        {entry.menuItem}
                      </td>
                      <td className="px-2.5 py-2 text-center border-r border-slate-100">
                        {entry.primaryPresent}
                      </td>
                      <td className="px-2.5 py-2 text-center border-r border-slate-100">
                        {entry.upperPrimaryPresent}
                      </td>
                      <td className="px-2.5 py-2 text-center font-extrabold text-teal-900 border-r border-slate-100 bg-teal-50/50">
                        {entry.totalPresent}
                      </td>
                      <td className="px-2.5 py-2 text-right font-mono font-bold text-slate-900 border-r border-slate-100">
                        {entry.riceKg.toFixed(3)}
                      </td>
                      <td className="px-2.5 py-2 text-right font-mono border-r border-slate-100">
                        {entry.pulsesKg.toFixed(3)}
                      </td>
                      <td className="px-2.5 py-2 text-right font-mono border-r border-slate-100">
                        {entry.oilKg.toFixed(3)}
                      </td>
                      <td className="px-2.5 py-2 text-right font-mono font-extrabold text-emerald-800 border-r border-slate-100">
                        ₹{entry.cookingCostRs.toFixed(2)}
                      </td>
                      <td className="px-2.5 py-2 text-slate-600 truncate max-w-[120px]">
                        {entry.tastedBy.split(' ')[1] || entry.tastedBy} ({entry.qualityRemark})
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Main Calculation Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Student Count Input & Sync */}
        <div className="lg:col-span-5 space-y-4">
          {/* Student Count Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-700" />
                <span>
                  {lang === 'mr' ? 'हजर विद्यार्थी संख्या' : 'Present Student Counts'}
                </span>
              </h3>
              <button
                onClick={syncWithAttendance}
                className="flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded-lg transition active:scale-95"
                title="हजेरीवरून आपोआप संख्या घ्या"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{t.syncFromAttendance}</span>
              </button>
            </div>

            {/* Primary (Std 1 to 5) Counter */}
            <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-teal-950">
                    {t.primaryStudents}
                  </h4>
                  <p className="text-[10px] text-teal-700 mt-0.5">{t.primaryNormText}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPrimaryCount(Math.max(0, primaryCount - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-teal-200 text-teal-900 font-black text-base flex items-center justify-center hover:bg-teal-50 transition active:scale-90"
                  >
                    -
                  </button>
                  <input
                    id="input-primary-count"
                    type="number"
                    min="0"
                    value={primaryCount}
                    onChange={(e) => setPrimaryCount(Math.max(0, Number(e.target.value)))}
                    className="w-14 text-center font-extrabold text-base text-teal-950 bg-white border border-teal-300 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <button
                    onClick={() => setPrimaryCount(primaryCount + 1)}
                    className="w-8 h-8 rounded-lg bg-teal-800 text-white font-black text-base flex items-center justify-center hover:bg-teal-900 transition active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Upper Primary (Std 6 to 8) Counter */}
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-amber-950">
                    {t.upperPrimaryStudents}
                  </h4>
                  <p className="text-[10px] text-amber-800 mt-0.5">
                    {t.upperPrimaryNormText}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUpperPrimaryCount(Math.max(0, upperPrimaryCount - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-amber-300 text-amber-900 font-black text-base flex items-center justify-center hover:bg-amber-50 transition active:scale-90"
                  >
                    -
                  </button>
                  <input
                    id="input-upper-primary-count"
                    type="number"
                    min="0"
                    value={upperPrimaryCount}
                    onChange={(e) =>
                      setUpperPrimaryCount(Math.max(0, Number(e.target.value)))
                    }
                    className="w-14 text-center font-extrabold text-base text-amber-950 bg-white border border-amber-300 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                  <button
                    onClick={() => setUpperPrimaryCount(upperPrimaryCount + 1)}
                    className="w-8 h-8 rounded-lg bg-amber-700 text-white font-black text-base flex items-center justify-center hover:bg-amber-800 transition active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Combined Total Badge */}
            <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300 font-medium">
                  {lang === 'mr' ? 'एकूण लाभार्थी विद्यार्थी' : 'Total Beneficiaries'}
                </span>
                <p className="text-xs text-teal-300 font-mono mt-0.5">
                  इ. १-५: {primaryCount} + इ. ६-८: {upperPrimaryCount}
                </p>
              </div>
              <span className="text-2xl font-black text-amber-300 font-mono">
                {calc.totalPresent}
              </span>
            </div>

            {/* Saturday Supplementary Diet (अंडी / केळी / चिक्की) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                    <Egg className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {t.supplementaryDiet}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {menuItem.supplementaryMr}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={supplementaryDistributed}
                  onChange={(e) => setSupplementaryDistributed(e.target.checked)}
                  className="w-5 h-5 rounded text-teal-700 focus:ring-teal-600 cursor-pointer"
                />
              </label>
              {supplementaryDistributed && (
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-teal-800">
                  <span>वाटप संख्या:</span>
                  <span className="font-mono bg-teal-100 px-2 py-0.5 rounded">
                    {calc.totalPresent} नग (Units)
                  </span>
                </div>
              )}
            </div>

            {/* Food Tasting & Inspection Note (Govt Compliance) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t.tastedByHM}</span>
              </label>
              <input
                type="text"
                value={tastedBy}
                onChange={(e) => setTastedBy(e.target.value)}
                placeholder="उदा. श्री. सुनील डी. गायकवाड (मुख्याध्यापक)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(['excellent', 'good', 'satisfactory'] as const).map((rem) => (
                  <button
                    key={rem}
                    type="button"
                    onClick={() => setQualityRemark(rem)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition text-center ${
                      qualityRemark === rem
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {rem === 'excellent'
                      ? t.remarkExcellent
                      : rem === 'good'
                      ? t.remarkGood
                      : t.remarkSatisfactory}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Ration Requirements & Cooking Cost */}
        <div className="lg:col-span-7 space-y-4">
          {/* Ration Breakdown Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-teal-700" />
                  <span>{t.requiredRationToday}</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {lang === 'mr'
                    ? 'हजर विद्यार्थ्यांनुसार तंतोतंत वजनी हिशोब'
                    : 'Exact weight calculation based on state norm'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-teal-100 text-teal-900 px-2 py-1 rounded-lg">
                {selectedDate}
              </span>
            </div>

            {/* Ingredients Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Rice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>{t.rice}</span>
                  <span className="text-[10px] bg-white px-1 rounded border border-slate-200">
                    तांदूळ
                  </span>
                </div>
                <p className="text-xl font-black text-slate-900 font-mono mt-1">
                  {calc.riceKg.toFixed(3)}
                  <span className="text-xs font-semibold text-slate-500 ml-1">kg</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  P: {(primaryCount * 0.1).toFixed(2)} + UP:{' '}
                  {(upperPrimaryCount * 0.15).toFixed(2)}
                </p>
              </div>

              {/* Pulses */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>{t.pulses}</span>
                  <span className="text-[10px] bg-white px-1 rounded border border-slate-200">
                    डाळ
                  </span>
                </div>
                <p className="text-xl font-black text-teal-900 font-mono mt-1">
                  {calc.pulsesKg.toFixed(3)}
                  <span className="text-xs font-semibold text-slate-500 ml-1">kg</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {primaryCount * 20 + upperPrimaryCount * 30} ग्रॅम
                </p>
              </div>

              {/* Cooking Oil */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>{t.oil}</span>
                  <span className="text-[10px] bg-white px-1 rounded border border-slate-200">
                    तेल
                  </span>
                </div>
                <p className="text-xl font-black text-amber-900 font-mono mt-1">
                  {calc.oilKg.toFixed(3)}
                  <span className="text-xs font-semibold text-slate-500 ml-1">kg</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {primaryCount * 5 + upperPrimaryCount * 7.5} ग्रॅम
                </p>
              </div>

              {/* Vegetables */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>{t.veggies}</span>
                  <span className="text-[10px] bg-white px-1 rounded border border-slate-200">
                    भाजीपाला
                  </span>
                </div>
                <p className="text-xl font-black text-emerald-900 font-mono mt-1">
                  {calc.veggiesKg.toFixed(3)}
                  <span className="text-xs font-semibold text-slate-500 ml-1">kg</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {primaryCount * 50 + upperPrimaryCount * 75} ग्रॅम
                </p>
              </div>

              {/* Salt & Spices */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>{t.spices}</span>
                  <span className="text-[10px] bg-white px-1 rounded border border-slate-200">
                    मसाले
                  </span>
                </div>
                <p className="text-xl font-black text-purple-900 font-mono mt-1">
                  {calc.spicesKg.toFixed(3)}
                  <span className="text-xs font-semibold text-slate-500 ml-1">kg</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {primaryCount * 2 + upperPrimaryCount * 3} ग्रॅम
                </p>
              </div>

              {/* Total Cooking Cost (पाककृती खर्च) */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300">
                <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
                  <span>{t.cookingCost}</span>
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-xl font-black text-emerald-950 font-mono mt-1">
                  ₹{calc.cookingCostRs.toFixed(2)}
                </p>
                <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">
                  इ.१-५: ₹{schoolProfile.primaryCookingRate} | इ.६-८: ₹
                  {schoolProfile.upperPrimaryCookingRate}
                </p>
              </div>
            </div>

            {/* Nutrition Norms Verification Card */}
            <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-700" />
                <div>
                  <span className="text-xs font-extrabold text-teal-950 block">
                    {lang === 'mr'
                      ? 'दैनिक पोषण मूल्य प्रमाण'
                      : 'Total Nutritional Value Served'}
                  </span>
                  <span className="text-[11px] text-teal-800">
                    शासन मानकानुसार अन्न घटक परिपूर्ण
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold font-mono">
                <span className="bg-white px-2 py-1 rounded text-teal-900 border border-teal-200">
                  {calc.caloriesKcal.toLocaleString()} kcal
                </span>
                <span className="bg-white px-2 py-1 rounded text-emerald-900 border border-teal-200">
                  {calc.proteinGrams} g Protein
                </span>
              </div>
            </div>

            {/* Save Button */}
            <button
              id="btn-save-poshan-log"
              onClick={handleSave}
              className="w-full py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-sm shadow-md shadow-teal-900/20 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{t.saveDailyPoshanLog}</span>
            </button>
          </div>

          {/* Quick Govt Guidelines Info Box */}
          <div className="bg-amber-50/80 rounded-xl p-3.5 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-amber-700" />
              <span>
                {lang === 'mr'
                  ? 'शालेय पोषण आहार महाराष्ट्र नियम संक्षेप'
                  : 'Maharashtra MDM Guidelines'}
              </span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800">
              <li>दररोज जेवण देण्यापूर्वी मुख्याध्यापक / शिक्षकांनी चव चाखणे बंधनकारक आहे.</li>
              <li>स्वयंपाकासाठी फोर्टिफाइड खाद्यतेल व आयोडिनयुक्त मीठ वापरणे आवश्यक आहे.</li>
              <li>शनिवारी पूरक आहार म्हणून उकडलेले अंडे किंवा फळे / चिक्की वाटप केले जाते.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
