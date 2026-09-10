import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Share2,
  Printer,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Calendar,
  Sparkles,
  FileText,
  MessageSquare,
  Users,
  X,
} from 'lucide-react';
import { SchoolNotice, SchoolProfile, Language } from '../types';
import { translations } from '../utils/i18n';

interface SchoolNoticesViewProps {
  notices: SchoolNotice[];
  onSaveNotices: (notices: SchoolNotice[]) => void;
  schoolProfile: SchoolProfile;
  lang: Language;
}

const NOTICE_TEMPLATES = [
  {
    category: 'meeting',
    titleMr: 'पालक-शिक्षक सभा (PTA Meeting) आयोजन सूचना',
    titleEn: 'Parent-Teacher Association Meeting Notice',
    messageMr:
      'सर्व पालकांना कळविण्यात येते की, चालू शैक्षणिक सत्रातील पालक-शिक्षक सभा शनिवार रोजी सकाळी १०:०० वाजता शाळेच्या सभागृहात आयोजित केली आहे. विद्यार्थ्यांचा शैक्षणिक विकास, मासिक हजेरी व शालेय पोषण आहार या विषयांवर चर्चा होणार आहे. सर्व पालकांनी वेळेवर उपस्थित राहावे ही नम्र विनंती.\n\n- मुख्याध्यापक व शाळा व्यवस्थापन समिती',
    messageEn:
      'All parents are cordially invited to attend the Parent-Teacher Meeting on Saturday at 10:00 AM in the school hall. Key discussions include student progress, attendance, and mid-day meals.\n\n- Headmaster & School Management Committee',
    isUrgent: false,
  },
  {
    category: 'holiday',
    titleMr: 'अतिवृष्टी / आपत्कालीन स्थानिक सुट्टी सूचना',
    titleEn: 'Emergency Weather / Heavy Rain Holiday Notice',
    messageMr:
      'जिल्हाधिकारी कार्यालयाच्या आदेशानुसार व हवामान खात्याच्या अंदाजानुसार मुसळधार पावसामुळे उद्या शाळेस सुट्टी जाहीर करण्यात आली आहे. सर्व पालकांनी पाल्याची काळजी घ्यावी आणि आवश्यक खबरदारी बाळगावी.\n\n- आदेशानुसार, मुख्याध्यापक',
    messageEn:
      'As per directives from the District Administration regarding heavy rainfall, school will remain closed tomorrow. Parents are advised to take necessary precautions.\n\n- By Order, Headmaster',
    isUrgent: true,
  },
  {
    category: 'exam',
    titleMr: 'सत्र चाचणी परीक्षा वेळापत्रक जाहीर',
    titleEn: 'Term Examination Schedule Announcement',
    messageMr:
      'इयत्ता १ ली ते ८ वी च्या सर्व विद्यार्थ्यांची प्रथम सत्र चाचणी परीक्षा पुढील आठवड्यापासून सुरू होत आहे. परीक्षेचे सविस्तर वेळापत्रक वर्गशिक्षकांनी वहीत लिहून दिले आहे. पालकांनी मुलांच्या नियमित अभ्यासाकडे लक्ष द्यावे.\n\n- परीक्षा प्रमुख व मुख्याध्यापक',
    messageEn:
      'Term examination for Std 1 to 8 will commence next week. Detailed timetable has been given in student notebooks. Parents are requested to ensure regular study at home.\n\n- Examination Committee',
    isUrgent: false,
  },
  {
    category: 'mdm',
    titleMr: 'शालेय पोषण आहार (PM POSHAN) पालक चव तपासणी मोहीम',
    titleEn: 'PM POSHAN Daily Meal Tasting by Parents',
    messageMr:
      'शासनाच्या निर्देशानुसार शाळेत शिजणाऱ्या पोषण आहाराचा दर्जा व चव तपासण्यासाठी दररोज दोन पालकांना आमंत्रित केले जात आहे. इच्छुक पालकांनी वर्गशिक्षकांशी संपर्क साधावा.\n\n- शालेय पोषण आहार समिती',
    messageEn:
      'Parents are warmly welcome to visit school and taste the daily mid-day meal to verify quality, nutrition, and hygiene standards.\n\n- MDM Monitoring Committee',
    isUrgent: false,
  },
];

export const SchoolNoticesView: React.FC<SchoolNoticesViewProps> = ({
  notices,
  onSaveNotices,
  schoolProfile,
  lang,
}) => {
  const t = translations[lang];

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedNoticeForPrint, setSelectedNoticeForPrint] = useState<SchoolNotice | null>(
    null
  );
  const [copiedNoticeId, setCopiedNoticeId] = useState<string | null>(null);

  // Form states for new notice
  const [newTitle, setNewTitle] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string>('');
  const [newCategory, setNewCategory] = useState<
    'general' | 'absentee' | 'holiday' | 'exam' | 'meeting' | 'mdm'
  >('general');
  const [newIsUrgent, setNewIsUrgent] = useState<boolean>(false);
  const [newTarget, setNewTarget] = useState<string>('all');

  // Load template
  const applyTemplate = (tpl: (typeof NOTICE_TEMPLATES)[0]) => {
    setNewTitle(lang === 'mr' ? tpl.titleMr : tpl.titleEn);
    setNewMessage(lang === 'mr' ? tpl.messageMr : tpl.messageEn);
    setNewCategory(tpl.category as any);
    setNewIsUrgent(tpl.isUrgent);
  };

  // Create notice
  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    const notice: SchoolNotice = {
      id: `notice-${Date.now()}`,
      titleMr: newTitle,
      titleEn: newTitle,
      date: new Date().toISOString().split('T')[0],
      category: newCategory,
      targetStandard: newTarget === 'all' ? 'all' : Number(newTarget),
      messageMr: newMessage,
      messageEn: newMessage,
      issuedBy: schoolProfile.headmasterName || 'मुख्याध्यापक',
      isUrgent: newIsUrgent,
    };

    onSaveNotices([notice, ...notices]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewMessage('');
    setNewIsUrgent(false);
  };

  // Delete notice
  const handleDeleteNotice = (id: string) => {
    if (confirm(lang === 'mr' ? 'ही सूचना हटवायची आहे का?' : 'Delete this notice?')) {
      onSaveNotices(notices.filter((n) => n.id !== id));
    }
  };

  // Share to WhatsApp Group
  const handleShareToWhatsApp = (notice: SchoolNotice) => {
    const text =
      `*${schoolProfile.schoolNameMr}*\n` +
      `*शालेय परिपत्रक / सूचना*\n` +
      `तारीख: ${notice.date}\n` +
      (notice.isUrgent ? `🔴 *तात्काळ / महत्वाचे*\n` : '') +
      `विषय: *${lang === 'mr' ? notice.titleMr : notice.titleEn}*\n\n` +
      `${lang === 'mr' ? notice.messageMr : notice.messageEn}\n\n` +
      `- ${notice.issuedBy}\n` +
      `UDISE: ${schoolProfile.udiseCode}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Copy notice text
  const handleCopyNotice = (notice: SchoolNotice) => {
    const text =
      `*${schoolProfile.schoolNameMr}*\n` +
      `विषय: *${lang === 'mr' ? notice.titleMr : notice.titleEn}*\n\n` +
      `${lang === 'mr' ? notice.messageMr : notice.messageEn}\n\n` +
      `- ${notice.issuedBy}`;

    navigator.clipboard.writeText(text);
    setCopiedNoticeId(notice.id);
    setTimeout(() => setCopiedNoticeId(null), 2500);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              शालेय फलक
            </span>
            <span className="text-xs text-teal-200">OFFICIAL NOTICES &amp; CIRCULARS</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
            {t.noticesTitle}
          </h2>
          <p className="text-xs text-teal-100/90 mt-0.5">
            {lang === 'mr'
              ? 'पालकांसाठी व शिक्षकांसाठी शालेय परिपत्रके व WhatsApp संदेश'
              : 'School circulars, broadcast notices and official slips'}
          </p>
        </div>

        <button
          id="btn-create-notice-open"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t.createNewNotice}</span>
        </button>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {notices.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm text-slate-500 text-sm">
            {lang === 'mr' ? 'कोणत्याही सूचना उपलब्ध नाहीत.' : 'No notices published yet.'}
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white rounded-2xl p-4 sm:p-5 border transition shadow-sm ${
                notice.isUrgent
                  ? 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200 hover:border-teal-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {notice.isUrgent && (
                      <span className="flex items-center gap-1 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        {t.urgentBadge}
                      </span>
                    )}
                    <span className="text-[11px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-md font-mono">
                      {notice.date}
                    </span>
                    <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      {notice.issuedBy}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {lang === 'mr' ? notice.titleMr : notice.titleEn}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed pt-1">
                    {lang === 'mr' ? notice.messageMr : notice.messageEn}
                  </p>
                </div>

                {/* Actions: Share to WhatsApp, Print, Copy, Delete */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start pt-2 sm:pt-0">
                  <button
                    onClick={() => handleShareToWhatsApp(notice)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition active:scale-95 shadow-xs"
                    title="WhatsApp ग्रुपवर पाठवा"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setSelectedNoticeForPrint(notice)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95 border border-slate-200"
                    title="अधिकृत नोटीस स्लिप प्रिंट करा"
                  >
                    <Printer className="w-4 h-4 text-teal-800" />
                  </button>

                  <button
                    onClick={() => handleCopyNotice(notice)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95 border border-slate-200"
                    title="मजकूर कॉपी करा"
                  >
                    {copiedNoticeId === notice.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition active:scale-95 border border-slate-200"
                    title="हटवा"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Notice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 sm:p-6 shadow-2xl text-slate-900 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-700" />
                <span>{t.createNewNotice}</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ready-made official templates bar */}
            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.noticeTemplates}:</span>
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {NOTICE_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 whitespace-nowrap transition"
                  >
                    {tpl.category === 'meeting'
                      ? 'पालक सभा'
                      : tpl.category === 'holiday'
                      ? 'पाऊस सुट्टी'
                      : tpl.category === 'exam'
                      ? 'परीक्षा'
                      : 'पोषण आहार'}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateNotice} className="mt-4 space-y-3">
              {/* Notice Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'mr' ? 'सूचनेचा विषय / शीर्षक' : 'Notice Subject / Title'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="उदा. पालक-शिक्षक सभा आयोजन..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'mr' ? 'सविस्तर मजकूर' : 'Message Content'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="सर्व पालकांना कळविण्यात येते की..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none leading-relaxed"
                />
              </div>

              {/* Urgent Checkbox */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsUrgent}
                    onChange={(e) => setNewIsUrgent(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    {lang === 'mr'
                      ? 'तात्काळ / महत्वाचे परिपत्रक म्हणून चिन्हांकित करा'
                      : 'Mark as Urgent Notice'}
                  </span>
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  {t.close}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-extrabold shadow-md transition"
                >
                  {lang === 'mr' ? 'सूचना प्रसिद्ध करा' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Notice Slip Modal */}
      {selectedNoticeForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-900 border border-slate-200 my-8">
            {/* Action Bar (Top) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold text-teal-800">अधिकृत शालेय स्लिप नमुना</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>प्रिंट / PDF</span>
                </button>
                <button
                  onClick={() => setSelectedNoticeForPrint(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official School Header Slip */}
            <div className="mt-4 border-2 border-slate-800 p-6 rounded-lg text-center space-y-2">
              <div className="border-b-2 border-slate-800 pb-3">
                <span className="text-[11px] font-bold tracking-widest text-slate-600 uppercase">
                  महाराष्ट्र शासन - शिक्षण विभाग
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight mt-0.5">
                  {schoolProfile.schoolNameMr}
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  ता. {schoolProfile.taluka}, जि. {schoolProfile.district} | UDISE क्र.:{' '}
                  <span className="font-mono font-bold">{schoolProfile.udiseCode}</span>
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 py-1 border-b border-slate-200">
                <span>जावक क्र.: जिपशा/२०२६/२४</span>
                <span>दिनांक: {selectedNoticeForPrint.date}</span>
              </div>

              <div className="py-2 text-left space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900 underline underline-offset-4">
                  विषय: {selectedNoticeForPrint.titleMr}
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {selectedNoticeForPrint.messageMr}
                </p>
              </div>

              {/* Signature Stamp Area */}
              <div className="pt-8 flex justify-end text-right">
                <div className="space-y-1">
                  <div className="w-28 border-b border-dashed border-slate-400 mb-1" />
                  <p className="text-xs font-extrabold text-slate-900">
                    {selectedNoticeForPrint.issuedBy}
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {schoolProfile.schoolNameMr}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
