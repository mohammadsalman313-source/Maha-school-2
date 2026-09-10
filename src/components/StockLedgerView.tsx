import React, { useState } from 'react';
import {
  PackageCheck,
  Plus,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Scale,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';
import { StockItem, Language } from '../types';
import { translations } from '../utils/i18n';
import { INITIAL_STOCK } from '../utils/sampleData';

interface StockLedgerViewProps {
  stock: StockItem[];
  onSaveStock: (stock: StockItem[]) => void;
  lang: Language;
}

export const StockLedgerView: React.FC<StockLedgerViewProps> = ({
  stock,
  onSaveStock,
  lang,
}) => {
  const t = translations[lang];

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedStockId, setSelectedStockId] = useState<string>('rice');
  const [inwardAmount, setInwardAmount] = useState<number>(50);
  const [toast, setToast] = useState<string | null>(null);

  const handleAddInward = (e: React.FormEvent) => {
    e.preventDefault();
    if (inwardAmount <= 0) return;

    const updated = stock.map((item) => {
      if (item.id === selectedStockId) {
        const newReceived = item.receivedStock + inwardAmount;
        const newCurrent = item.currentStock + inwardAmount;
        return {
          ...item,
          receivedStock: Number(newReceived.toFixed(2)),
          currentStock: Number(newCurrent.toFixed(2)),
        };
      }
      return item;
    });

    onSaveStock(updated);
    setShowAddModal(false);
    setToast(
      lang === 'mr'
        ? 'नवीन आवक यशस्वीरित्या नोंदवली!'
        : 'Inward stock added successfully!'
    );
    setTimeout(() => setToast(null), 3000);
  };

  const handleResetStock = () => {
    if (
      confirm(
        lang === 'mr'
          ? 'साठा नोंदी पूर्ववत करायच्या आहेत का?'
          : 'Reset stock to default ledger?'
      )
    ) {
      onSaveStock(INITIAL_STOCK);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-teal-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              साठा नोंद
            </span>
            <span className="text-xs text-teal-200">PM POSHAN RATION INVENTORY</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
            {t.stockTitle}
          </h2>
          <p className="text-xs text-teal-100/90 mt-0.5">
            {lang === 'mr'
              ? 'तांदूळ, डाळी, खाद्यतेल व पूरक आहार शिल्लक नोंदवही'
              : 'Official daily grain & ingredient balance register'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleResetStock}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-teal-200 text-xs transition"
            title="साठा पूर्ववत करा"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            id="btn-add-stock-open"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t.addStock}</span>
          </button>
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {stock.map((item) => {
          const isLow = item.currentStock <= item.minAlertThreshold;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-4 border transition shadow-sm ${
                isLow ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  {lang === 'mr' ? item.nameMr : item.nameEn}
                </span>
                {isLow ? (
                  <span className="flex items-center gap-1 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    साठा कमी
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    पर्याप्त साठा
                  </span>
                )}
              </div>

              {/* Big Current Stock Metric */}
              <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">
                  {t.currentBalance}
                </div>
                <div className="text-2xl font-black text-teal-950 font-mono mt-0.5">
                  {item.currentStock.toFixed(item.unit === 'kg' ? 2 : 0)}{' '}
                  <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                </div>
              </div>

              {/* Movement Summary Details */}
              <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 text-[11px]">
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <span className="text-slate-400 block text-[10px]">
                    {t.openingStock}
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {item.openingStock}
                  </span>
                </div>
                <div className="bg-emerald-50 p-2 rounded-lg text-center text-emerald-800">
                  <span className="text-emerald-600 block text-[10px]">
                    {t.receivedStock}
                  </span>
                  <span className="font-mono font-bold">+{item.receivedStock}</span>
                </div>
                <div className="bg-rose-50 p-2 rounded-lg text-center text-rose-800">
                  <span className="text-rose-600 block text-[10px]">
                    {t.consumedStock}
                  </span>
                  <span className="font-mono font-bold">-{item.consumedStock}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inward Receipt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-slate-900 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-700" />
                <span>
                  {lang === 'mr' ? 'नवीन धान्य / साहित्य आवक नोंद' : 'Log Stock Receipt'}
                </span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInward} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  साहित्य निवडा
                </label>
                <select
                  value={selectedStockId}
                  onChange={(e) => setSelectedStockId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  {stock.map((item) => (
                    <option key={item.id} value={item.id}>
                      {lang === 'mr' ? item.nameMr : item.nameEn} ({item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  नवीन आवक प्रमाण (Amount)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  value={inwardAmount}
                  onChange={(e) => setInwardAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
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
                  {lang === 'mr' ? 'साठ्यात जमा करा' : 'Add to Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
