import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Users,
  UserCheck,
  UserX,
  Sparkles,
  MessageSquare,
  Phone,
  Save,
  ChevronRight,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, AttendanceRecord, Language } from '../types';
import { translations } from '../utils/i18n';

interface AttendanceViewProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[]) => void;
  lang: Language;
  onNavigateToAbsentee: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  attendanceRecords,
  onSaveAttendance,
  lang,
  onNavigateToAbsentee,
}) => {
  const t = translations[lang];

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedStandard, setSelectedStandard] = useState<number | 'all'>('all');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter students by class and division
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchStd = selectedStandard === 'all' || s.standard === selectedStandard;
      const matchDiv = selectedDivision === 'all' || s.division === selectedDivision;
      return matchStd && matchDiv;
    });
  }, [students, selectedStandard, selectedDivision]);

  // Find attendance record for selected date and standard
  // Or initialize attendance states per student for the selected date
  const [attendanceState, setAttendanceState] = useState<Record<string, boolean>>(() => {
    // Check if we have records for today
    const state: Record<string, boolean> = {};
    students.forEach((s) => {
      // Find record for this student's class on selectedDate
      const record = attendanceRecords.find(
        (r) => r.date === todayStr && r.standard === s.standard
      );
      if (record) {
        state[s.id] = record.presentStudentIds.includes(s.id);
      } else {
        // Default present
        state[s.id] = true;
      }
    });
    return state;
  });

  // Re-sync attendanceState when selectedDate changes
  React.useEffect(() => {
    const newState: Record<string, boolean> = {};
    students.forEach((s) => {
      const record = attendanceRecords.find(
        (r) => r.date === selectedDate && r.standard === s.standard
      );
      if (record) {
        newState[s.id] = record.presentStudentIds.includes(s.id);
      } else {
        newState[s.id] = true;
      }
    });
    setAttendanceState(newState);
  }, [selectedDate, attendanceRecords, students]);

  // Compute live statistics for currently filtered view
  const stats = useMemo(() => {
    const totalEnrolled = filteredStudents.length;
    let presentCount = 0;
    let boysPresent = 0;
    let girlsPresent = 0;
    let absentCount = 0;

    filteredStudents.forEach((s) => {
      const isPresent = attendanceState[s.id] ?? true;
      if (isPresent) {
        presentCount++;
        if (s.gender === 'boy') boysPresent++;
        if (s.gender === 'girl') girlsPresent++;
      } else {
        absentCount++;
      }
    });

    const percent = totalEnrolled > 0 ? Math.round((presentCount / totalEnrolled) * 100) : 0;

    return { totalEnrolled, presentCount, boysPresent, girlsPresent, absentCount, percent };
  }, [filteredStudents, attendanceState]);

  // Toggle single student
  const toggleStudent = (id: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Mark all filtered present
  const markAll = (present: boolean) => {
    setAttendanceState((prev) => {
      const updated = { ...prev };
      filteredStudents.forEach((s) => {
        updated[s.id] = present;
      });
      return updated;
    });
  };

  // Save attendance
  const handleSave = () => {
    // Generate records grouped by standard
    const updatedRecords = [...attendanceRecords.filter((r) => r.date !== selectedDate)];

    const standardsInSchool = Array.from(new Set(students.map((s) => s.standard))).sort(
      (a: number, b: number) => a - b
    );

    standardsInSchool.forEach((std) => {
      const stdStudents = students.filter((s) => s.standard === std);
      if (stdStudents.length === 0) return;

      const presents = stdStudents.filter((s) => attendanceState[s.id] ?? true).map((s) => s.id);
      const absents = stdStudents.filter((s) => !(attendanceState[s.id] ?? true)).map((s) => s.id);

      const boysCount = stdStudents.filter(
        (s) => presents.includes(s.id) && s.gender === 'boy'
      ).length;
      const girlsCount = stdStudents.filter(
        (s) => presents.includes(s.id) && s.gender === 'girl'
      ).length;

      updatedRecords.push({
        id: `att-${selectedDate}-std${std}`,
        date: selectedDate,
        standard: std,
        division: 'A',
        totalEnrolled: stdStudents.length,
        presentStudentIds: presents,
        absentStudentIds: absents,
        boysPresent: boysCount,
        girlsPresent: girlsCount,
        totalPresent: presents.length,
        markedAt: new Date().toLocaleTimeString(),
        markedBy: 'वर्गशिक्षक',
      });
    });

    onSaveAttendance(updatedRecords);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // Ignore if iframe restricts canvas
    }

    setToastMessage(t.attendanceSavedSuccess);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Direct WhatsApp absentee quick launcher
  const sendQuickWhatsApp = (student: Student) => {
    const text =
      lang === 'mr'
        ? `नमस्कार पालक,\nआपला/आपली पाल्य *${student.nameMr}* (इयत्ता ${student.standard} वी, हजेरी क्र. ${student.rollNo}) आज दिनांक ${selectedDate} रोजी शाळेत अनुपस्थित आहे. नियमित उपस्थिती ही अभ्यासासाठी आवश्यक आहे. गैरहजर राहण्याचे कारण कळवावे.\n- वर्गशिक्षक / मुख्याध्यापक`
        : `Dear Parent,\nYour ward *${student.nameEn}* (Class ${student.standard}, Roll No. ${student.rollNo}) is absent from school today (${selectedDate}). Please send him/her regularly or inform the reason.\n- Class Teacher / Headmaster`;

    const cleanPhone = student.parentPhone.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    window.open(`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Date & Class Filter Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-700" />
              <span>{t.date}</span>
            </label>
            <input
              id="attendance-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Class Select Dropdown (for quick selection) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-teal-700" />
              <span>{t.standard}</span>
            </label>
            <select
              id="attendance-class-select"
              value={selectedStandard}
              onChange={(e) =>
                setSelectedStandard(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">{t.allClasses}</option>
              <option value="1">इयत्ता १ ली (Std 1)</option>
              <option value="2">इयत्ता २ री (Std 2)</option>
              <option value="3">इयत्ता ३ री (Std 3)</option>
              <option value="4">इयत्ता ४ थी (Std 4)</option>
              <option value="5">इयत्ता ५ वी (Std 5)</option>
              <option value="6">इयत्ता ६ वी (Std 6)</option>
              <option value="7">इयत्ता ७ वी (Std 7)</option>
              <option value="8">इयत्ता ८ वी (Std 8)</option>
            </select>
          </div>
        </div>

        {/* Quick Class Filter Pills */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedStandard('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition whitespace-nowrap ${
              selectedStandard === 'all'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.all}
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((std) => (
            <button
              key={std}
              onClick={() => setSelectedStandard(std)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                selectedStandard === std
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {lang === 'mr' ? `इ. ${std}` : `Std ${std}`}
            </button>
          ))}
        </div>
      </div>

      {/* Live Attendance Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.totalEnrolled}</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{stats.totalEnrolled}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {lang === 'mr' ? 'शाळेतील पटसंख्या' : 'Total students'}
          </p>
        </div>

        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
            <span>{t.presentTotal}</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-800 mt-1">{stats.presentCount}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
            {stats.boysPresent} {t.boy} | {stats.girlsPresent} {t.girl}
          </p>
        </div>

        <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 text-xs font-bold">
            <span>{t.absentTotal}</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-extrabold text-rose-800 mt-1">{stats.absentCount}</p>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
            {stats.absentCount > 0 ? (
              <button
                onClick={onNavigateToAbsentee}
                className="underline hover:text-rose-800 transition"
              >
                {lang === 'mr' ? 'पालकांना सूचना पाठवा' : 'Send notice to parents'}
              </button>
            ) : (
              (lang === 'mr' ? 'सर्व हजर आहेत' : 'All present')
            )}
          </p>
        </div>

        <div className="bg-teal-50/80 p-3 rounded-xl border border-teal-200 shadow-xs">
          <div className="flex items-center justify-between text-teal-700 text-xs font-bold">
            <span>{t.attendancePercent}</span>
            <span className="text-xs font-bold text-teal-800">{stats.percent}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.percent >= 90
                  ? 'bg-emerald-600'
                  : stats.percent >= 75
                  ? 'bg-teal-600'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${stats.percent}%` }}
            />
          </div>
          <p className="text-[11px] text-teal-800 font-medium mt-1">
            {stats.percent >= 90
              ? lang === 'mr'
                ? 'उत्कृष्ट उपस्थिती'
                : 'Excellent'
              : lang === 'mr'
              ? 'नियमित उपस्थिती आवश्यक'
              : 'Needs improvement'}
          </p>
        </div>
      </div>

      {/* Quick Action Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            id="btn-mark-all-present"
            onClick={() => markAll(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.markAllPresent}</span>
          </button>
          <button
            id="btn-mark-all-absent"
            onClick={() => markAll(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition active:scale-95"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{t.markAllAbsent}</span>
          </button>
        </div>

        <button
          id="btn-save-attendance-action"
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-900/20 transition active:scale-95"
        >
          <Save className="w-4 h-4 text-amber-300" />
          <span>{t.saveAttendance}</span>
        </button>
      </div>

      {/* Students Roster List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-700" />
            <span>
              {lang === 'mr' ? 'विद्यार्थी हजेरी यादी' : 'Student Attendance Register'}
            </span>
            <span className="text-xs font-medium text-slate-500">
              ({filteredStudents.length} {lang === 'mr' ? 'विद्यार्थी' : 'students'})
            </span>
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            {lang === 'mr' ? 'नावावर टॅप करून हजेरी बदला' : 'Tap row to toggle'}
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            {lang === 'mr'
              ? 'या वर्गासाठी विद्यार्थी उपलब्ध नाहीत.'
              : 'No students found in this class.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredStudents.map((student) => {
              const isPresent = attendanceState[student.id] ?? true;

              return (
                <div
                  key={student.id}
                  id={`student-row-${student.id}`}
                  className={`p-3 sm:px-4 sm:py-3.5 transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                    isPresent
                      ? 'hover:bg-slate-50'
                      : 'bg-rose-50/50 hover:bg-rose-50/80 border-l-4 border-rose-500'
                  }`}
                  onClick={() => toggleStudent(student.id)}
                >
                  {/* Student Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Roll No badge */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                        isPresent
                          ? 'bg-teal-100 text-teal-900'
                          : 'bg-rose-200 text-rose-950 font-bold'
                      }`}
                    >
                      {student.rollNo}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {lang === 'mr' ? student.nameMr : student.nameEn}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            student.gender === 'boy'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {student.gender === 'boy' ? t.boy : t.girl}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                          {lang === 'mr'
                            ? `इ. ${student.standard} (${student.division})`
                            : `Std ${student.standard}-${student.division}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {lang === 'mr' ? 'पालक: ' : 'Parent: '}
                        {lang === 'mr' ? student.parentNameMr : student.parentNameEn} (
                        {student.parentPhone})
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status Pill */}
                  <div
                    className="flex items-center gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* If Absent, quick contact buttons */}
                    {!isPresent && (
                      <div className="flex items-center gap-1 mr-1">
                        <button
                          onClick={() => sendQuickWhatsApp(student)}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition active:scale-95 shadow-xs"
                          title="WhatsApp वर अनुपस्थिती सूचना पाठवा"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`tel:${student.parentPhone}`}
                          className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition active:scale-95"
                          title="पालकांना फोन लावा"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Status Toggle Button */}
                    <button
                      onClick={() => toggleStudent(student.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-xs active:scale-95 ${
                        isPresent
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-rose-600 text-white hover:bg-rose-700'
                      }`}
                    >
                      {isPresent ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t.present}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t.absent}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Save Action Bar on Mobile */}
      <div className="sticky bottom-2 z-20 flex items-center justify-between bg-teal-950/95 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-teal-700/50">
        <div>
          <p className="text-xs text-teal-200 font-medium">{t.date}: {selectedDate}</p>
          <p className="text-sm font-extrabold text-white">
            {stats.presentCount} {lang === 'mr' ? 'हजर' : 'Present'} / {stats.absentCount}{' '}
            {lang === 'mr' ? 'गैरहजर' : 'Absent'}
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs sm:text-sm font-extrabold shadow-md transition active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>{t.saveAttendance}</span>
        </button>
      </div>
    </div>
  );
};
