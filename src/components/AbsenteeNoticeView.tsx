import React, { useState, useMemo } from 'react';
import {
  UserX,
  Calendar,
  MessageSquare,
  Phone,
  Copy,
  Check,
  Send,
  Sparkles,
  AlertCircle,
  Share2,
  Filter,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Student, AttendanceRecord, SchoolProfile, Language } from '../types';
import { translations } from '../utils/i18n';

interface AbsenteeNoticeViewProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  schoolProfile: SchoolProfile;
  lang: Language;
  onNavigateToAttendance: () => void;
}

export const AbsenteeNoticeView: React.FC<AbsenteeNoticeViewProps> = ({
  students,
  attendanceRecords,
  schoolProfile,
  lang,
  onNavigateToAttendance,
}) => {
  const t = translations[lang];

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedStandard, setSelectedStandard] = useState<number | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sentNoticeIds, setSentNoticeIds] = useState<Record<string, boolean>>({});

  // Customizable message template
  const [customReasonNote, setCustomReasonNote] = useState<string>(
    lang === 'mr'
      ? 'नियमित उपस्थिती ही अभ्यासासाठी अत्यंत आवश्यक आहे. गैरहजर राहण्याचे कारण कळवावे.'
      : 'Regular attendance is crucial for academic learning. Please inform reason for absence.'
  );

  // Find all absent students for this date
  const absentStudents = useMemo(() => {
    const dayRecords = attendanceRecords.filter((r) => r.date === selectedDate);
    const absentIds = new Set<string>();

    dayRecords.forEach((r) => {
      r.absentStudentIds.forEach((id) => absentIds.add(id));
    });

    return students.filter((s) => {
      const isAbsent = absentIds.has(s.id);
      const matchStd = selectedStandard === 'all' || s.standard === selectedStandard;
      return isAbsent && matchStd;
    });
  }, [attendanceRecords, selectedDate, students, selectedStandard]);

  // Construct message for a given student
  const getStudentMessage = (student: Student) => {
    if (lang === 'mr') {
      return (
        `*शालेय उपस्थिती सूचना (अनुपस्थिती पत्र)*\n` +
        `शाळा: *${schoolProfile.schoolNameMr}*\n\n` +
        `आदरणीय पालक श्री./श्रीमती *${student.parentNameMr}*,\n` +
        `आपला/आपली पाल्य: *${student.nameMr}*\n` +
        `इयत्ता: ${student.standard} वी (${student.division}) | हजेरी क्र.: ${student.rollNo}\n` +
        `आज दिनांक: *${selectedDate}* रोजी शाळेत अनुपस्थित आहे.\n\n` +
        `सूचना: ${customReasonNote}\n\n` +
        `आपला नम्र,\n` +
        `वर्गशिक्षक / मुख्याध्यापक\n` +
        `संपर्क: ${schoolProfile.schoolNameMr}`
      );
    } else {
      return (
        `*School Attendance Alert (Absentee Notice)*\n` +
        `School: *${schoolProfile.schoolNameEn}*\n\n` +
        `Dear Parent Mr./Mrs. *${student.parentNameEn}*,\n` +
        `Your child *${student.nameEn}*\n` +
        `Class: Std ${student.standard} (${student.division}) | Roll No: ${student.rollNo}\n` +
        `is marked absent today on *${selectedDate}*.\n\n` +
        `Note: ${customReasonNote}\n\n` +
        `Regards,\n` +
        `Class Teacher / Headmaster`
      );
    }
  };

  // Launch WhatsApp with pre-composed notice
  const handleWhatsAppSend = (student: Student) => {
    const message = getStudentMessage(student);
    const cleanPhone = student.parentPhone.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const url = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
    setSentNoticeIds((prev) => ({ ...prev, [student.id]: true }));
  };

  // Copy notice text to clipboard
  const handleCopyNotice = (student: Student) => {
    const message = getStudentMessage(student);
    navigator.clipboard.writeText(message);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Copy all absentee numbers for broadcast / bulk SMS
  const handleCopyAllNumbers = () => {
    const numbers = absentStudents.map((s) => s.parentPhone).join(', ');
    navigator.clipboard.writeText(numbers);
    setCopiedId('all-numbers');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Copy consolidated summary of all absent students
  const handleCopyConsolidatedNotice = () => {
    const list = absentStudents
      .map(
        (s, idx) =>
          `${idx + 1}. ${lang === 'mr' ? s.nameMr : s.nameEn} (इ.${s.standard}, ह.क्र.${s.rollNo}) - पालक: ${s.parentPhone}`
      )
      .join('\n');

    const summary =
      lang === 'mr'
        ? `*${schoolProfile.schoolNameMr}*\n*दैनिक गैरहजर विद्यार्थी यादी (${selectedDate})*\nएकूण गैरहजर: ${absentStudents.length}\n\n${list}\n\nपालकांनी गैरहजर राहण्याचे कारण वर्गशिक्षकांना कळवावे.`
        : `*${schoolProfile.schoolNameEn}*\n*Daily Absentee List (${selectedDate})*\nTotal Absent: ${absentStudents.length}\n\n${list}`;

    navigator.clipboard.writeText(summary);
    setCopiedId('summary');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-rose-900 via-rose-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-400 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                पालक संदेश
              </span>
              <span className="text-xs text-rose-200">WHATSAPP / SMS ALERT</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
              {t.absenteeTitle}
            </h2>
            <p className="text-xs text-rose-100/90 mt-0.5">{t.absenteeSubtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToAttendance}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition active:scale-95 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'mr' ? 'हजेरी नोंदवा' : 'Take Attendance'}</span>
            </button>
          </div>
        </div>

        {/* Date & Filter */}
        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-300 shrink-0" />
            <span className="text-xs font-semibold text-rose-100">{t.date}:</span>
            <input
              id="absentee-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-rose-950/70 border border-rose-600/50 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Standard filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-rose-300 shrink-0" />
            <select
              value={selectedStandard}
              onChange={(e) =>
                setSelectedStandard(
                  e.target.value === 'all' ? 'all' : Number(e.target.value)
                )
              }
              className="bg-rose-950/70 border border-rose-600/50 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400 w-full sm:w-auto"
            >
              <option value="all">{t.allClasses}</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  {lang === 'mr' ? `इयत्ता ${s} वी` : `Class ${s}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Message Customizer Accordion */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
        <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-rose-600" />
            <span>
              {lang === 'mr'
                ? 'पालक सूचनेमधील विशेष टीप / संदेश'
                : 'Custom Note in Notice'}
            </span>
          </span>
          <span className="text-[11px] text-slate-400">
            {lang === 'mr' ? 'आवश्यकतेनुसार बदला' : 'Editable'}
          </span>
        </label>
        <textarea
          rows={2}
          value={customReasonNote}
          onChange={(e) => setCustomReasonNote(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none font-medium"
          placeholder="उदा. उद्या चाचणी परीक्षा असल्याने उपस्थित राहावे..."
        />
      </div>

      {/* Absentee Counter & Bulk Action Strip */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
            {absentStudents.length}
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-rose-950">
              {absentStudents.length} {t.absenteesFound}
            </h4>
            <p className="text-xs text-rose-700">
              {selectedDate} रोजी शाळेत अनुपस्थित
            </p>
          </div>
        </div>

        {absentStudents.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAllNumbers}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-900 text-xs font-bold hover:bg-rose-100 transition active:scale-95 shadow-xs"
              title="सर्व पालकांचे मोबाईल नंबर कॉपी करा"
            >
              {copiedId === 'all-numbers' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-rose-700" />
              )}
              <span>
                {copiedId === 'all-numbers'
                  ? 'नंबर कॉपी झाले!'
                  : 'सर्व फोन नंबर कॉपी करा'}
              </span>
            </button>

            <button
              onClick={handleCopyConsolidatedNotice}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-bold hover:bg-rose-800 transition active:scale-95 shadow-xs"
              title="शालेय WhatsApp ग्रुपसाठी संपूर्ण यादी कॉपी करा"
            >
              {copiedId === 'summary' ? (
                <Check className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>
                {copiedId === 'summary' ? 'यादी कॉपी झाली!' : 'ग्रुपसाठी यादी कॉपी'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Absent Students List */}
      {absentStudents.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {t.noAbsenteesToday}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {lang === 'mr'
                ? 'या तारखेसाठी कोणतेही विद्यार्थी गैरहजर नाहीत, किंवा अजून हजेरी नोंदवलेली नाही.'
                : 'No students are marked absent for this date or attendance not yet recorded.'}
            </p>
          </div>
          <button
            onClick={onNavigateToAttendance}
            className="px-4 py-2 rounded-xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 transition"
          >
            {lang === 'mr' ? 'हजेरी तपासा / नोंदवा' : 'Check / Mark Attendance'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {absentStudents.map((student) => {
            const isSent = sentNoticeIds[student.id];

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm hover:border-rose-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Student info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-900 font-extrabold flex items-center justify-center text-sm shrink-0 mt-0.5">
                    {student.rollNo}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-slate-900 truncate">
                        {lang === 'mr' ? student.nameMr : student.nameEn}
                      </h4>
                      <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-200">
                        {lang === 'mr'
                          ? `इयत्ता ${student.standard} (${student.division})`
                          : `Std ${student.standard}-${student.division}`}
                      </span>
                      {isSent && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {lang === 'mr' ? 'सूचना पाठवली' : 'Sent'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      <span className="font-semibold text-slate-700">
                        {lang === 'mr' ? 'पालक: ' : 'Parent: '}
                      </span>
                      {lang === 'mr' ? student.parentNameMr : student.parentNameEn} |{' '}
                      <span className="font-mono font-bold text-slate-900">
                        {student.parentPhone}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Actions: WhatsApp Notice, SMS, Call */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* WhatsApp Notice Button */}
                  <button
                    id={`btn-wa-notice-${student.id}`}
                    onClick={() => handleWhatsAppSend(student)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition active:scale-95"
                    title="पालकांना WhatsApp द्वारे अनुपस्थिती सूचना पाठवा"
                  >
                    <MessageSquare className="w-4 h-4 fill-white text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Direct Native SMS */}
                  <a
                    href={`sms:${student.parentPhone}?body=${encodeURIComponent(
                      getStudentMessage(student)
                    )}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition active:scale-95 border border-slate-200"
                    title="थेट SMS पाठवा"
                  >
                    <Send className="w-3.5 h-3.5 text-teal-700" />
                    <span>SMS</span>
                  </a>

                  {/* Direct Call */}
                  <a
                    href={`tel:${student.parentPhone}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95 border border-slate-200"
                    title="पालकांना फोन करा"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                  </a>

                  {/* Copy message */}
                  <button
                    onClick={() => handleCopyNotice(student)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95 border border-slate-200"
                    title="सूचना मजकूर कॉपी करा"
                  >
                    {copiedId === student.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
