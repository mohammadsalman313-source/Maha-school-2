import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  UserPlus,
  Phone,
  Sparkles,
  RotateCcw,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Student, Language } from '../types';
import { translations } from '../utils/i18n';
import { INITIAL_STUDENTS } from '../utils/sampleData';

interface StudentsDirectoryViewProps {
  students: Student[];
  onSaveStudents: (students: Student[]) => void;
  lang: Language;
}

export const StudentsDirectoryView: React.FC<StudentsDirectoryViewProps> = ({
  students,
  onSaveStudents,
  lang,
}) => {
  const t = translations[lang];

  const [selectedStandard, setSelectedStandard] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [nameMr, setNameMr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [rollNo, setRollNo] = useState<number>(1);
  const [standard, setStandard] = useState<number>(1);
  const [division, setDivision] = useState<string>('A');
  const [gender, setGender] = useState<'boy' | 'girl'>('boy');
  const [parentNameMr, setParentNameMr] = useState('');
  const [parentNameEn, setParentNameEn] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Filtered list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchStd = selectedStandard === 'all' || s.standard === selectedStandard;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        s.nameMr.toLowerCase().includes(query) ||
        s.nameEn.toLowerCase().includes(query) ||
        s.parentPhone.includes(query) ||
        String(s.rollNo) === query;
      return matchStd && matchSearch;
    });
  }, [students, selectedStandard, searchQuery]);

  const openAddModal = () => {
    setEditingStudent(null);
    setNameMr('');
    setNameEn('');
    setRollNo(students.length > 0 ? Math.max(...students.map((s) => s.rollNo)) + 1 : 1);
    setStandard(selectedStandard === 'all' ? 1 : selectedStandard);
    setDivision('A');
    setGender('boy');
    setParentNameMr('');
    setParentNameEn('');
    setParentPhone('');
    setShowAddModal(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setNameMr(student.nameMr);
    setNameEn(student.nameEn);
    setRollNo(student.rollNo);
    setStandard(student.standard);
    setDivision(student.division);
    setGender(student.gender);
    setParentNameMr(student.parentNameMr);
    setParentNameEn(student.parentNameEn);
    setParentPhone(student.parentPhone);
    setShowAddModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameMr.trim() || !parentPhone.trim()) return;

    if (editingStudent) {
      // Update
      const updated = students.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              nameMr,
              nameEn: nameEn || nameMr,
              rollNo,
              standard,
              division,
              gender,
              parentNameMr,
              parentNameEn: parentNameEn || parentNameMr,
              parentPhone,
            }
          : s
      );
      onSaveStudents(updated);
    } else {
      // Add
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        nameMr,
        nameEn: nameEn || nameMr,
        rollNo,
        standard,
        division,
        gender,
        parentNameMr,
        parentNameEn: parentNameEn || parentNameMr,
        parentPhone,
      };
      onSaveStudents([...students, newStudent]);
    }

    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(lang === 'mr' ? 'विद्यार्थी हटवायचा आहे का?' : 'Delete this student?')) {
      onSaveStudents(students.filter((s) => s.id !== id));
    }
  };

  const handleResetSample = () => {
    if (
      confirm(
        lang === 'mr'
          ? 'नमुना विद्यार्थी यादी रिसेट करायची आहे का?'
          : 'Reset to sample students?'
      )
    ) {
      onSaveStudents(INITIAL_STUDENTS);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              पटनोंद
            </span>
            <span className="text-xs text-teal-200">STUDENT ROSTER</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
            {t.navStudents} ({students.length})
          </h2>
          <p className="text-xs text-teal-100/90 mt-0.5">
            {lang === 'mr'
              ? 'इयत्ता १ ली ते ८ वी विद्यार्थी व पालक संपर्क नोंदवही'
              : 'Class 1 to 8 students and parent directory'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleResetSample}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-teal-200 text-xs transition"
            title="नमुना डेटा पूर्ववत करा"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            id="btn-add-student-open"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition active:scale-95"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.addStudent}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'mr' ? 'विद्यार्थ्याचे नाव, फोन किंवा हजेरी क्र. शोधा...' : 'Search name, phone, roll no...'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Standard Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedStandard('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                selectedStandard === 'all'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.all}
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStandard(s)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                  selectedStandard === s
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {lang === 'mr' ? `इ. ${s}` : `Std ${s}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Students List Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            {lang === 'mr' ? 'कोणतेही विद्यार्थी आढळले नाहीत.' : 'No students found.'}
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className="p-3.5 sm:px-4 sm:py-3.5 hover:bg-slate-50 transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-900 font-extrabold text-xs flex items-center justify-center shrink-0">
                  {student.rollNo}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-sm text-slate-900 truncate">
                      {lang === 'mr' ? student.nameMr : student.nameEn}
                    </h4>
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
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {lang === 'mr' ? 'पालक: ' : 'Parent: '}
                    {lang === 'mr' ? student.parentNameMr : student.parentNameEn} |{' '}
                    <span className="font-mono">{student.parentPhone}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`tel:${student.parentPhone}`}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95"
                  title="फोन करा"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                </a>
                <button
                  onClick={() => openEditModal(student)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-teal-100 text-slate-700 hover:text-teal-800 transition active:scale-95"
                  title="माहिती बदला"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition active:scale-95"
                  title="हटवा"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl text-slate-900 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent
                  ? lang === 'mr'
                    ? 'विद्यार्थी माहिती संपादन'
                    : 'Edit Student'
                  : t.addStudent}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {t.rollNo}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={rollNo}
                    onChange={(e) => setRollNo(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {t.gender}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="boy">{t.boy}</option>
                    <option value="girl">{t.girl}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  विद्यार्थ्याचे पूर्ण नाव (मराठी)
                </label>
                <input
                  type="text"
                  required
                  value={nameMr}
                  onChange={(e) => setNameMr(e.target.value)}
                  placeholder="उदा. आरव सचिन पाटील"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Student Full Name (English)
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Aarav Sachin Patil"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {t.standard}
                  </label>
                  <select
                    value={standard}
                    onChange={(e) => setStandard(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        {lang === 'mr' ? `इयत्ता ${s} वी` : `Class ${s}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {t.division}
                  </label>
                  <input
                    type="text"
                    value={division}
                    onChange={(e) => setDivision(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.parentName} (मराठी)
                </label>
                <input
                  type="text"
                  value={parentNameMr}
                  onChange={(e) => setParentNameMr(e.target.value)}
                  placeholder="उदा. सचिन बाळू पाटील"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.parentPhone} (१० अंकी मोबाईल नंबर)
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="9822101011"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  {t.close}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-extrabold shadow-md transition"
                >
                  {editingStudent
                    ? lang === 'mr'
                      ? 'बदल जतन करा'
                      : 'Update'
                    : lang === 'mr'
                    ? 'विद्यार्थी जोडा'
                    : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
