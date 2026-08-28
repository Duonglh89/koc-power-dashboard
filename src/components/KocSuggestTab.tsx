import React, { useState } from 'react';
import { KOC } from '../types';
import { formatCurrency } from '../utils/calculations';
import { Sparkles, TrendingUp, AlertTriangle, ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface KocSuggestTabProps {
  kocs: KOC[];
  onSelectKoc: (id: string) => void;
}

export const KocSuggestTab: React.FC<KocSuggestTabProps> = ({ kocs, onSelectKoc }) => {
  const [filterTier, setFilterTier] = useState<'all' | 'star' | 'potential' | 'optimize'>('all');

  // Classification Logic
  const starKocs = kocs.filter(k => k.roas >= 3.0 && k.totalGmv >= 200000000);
  const potentialKocs = kocs.filter(k => (k.roas >= 2.0 && k.roas < 3.0) || (k.clicks > 100000 && k.totalGmv < 200000000));
  const optimizeKocs = kocs.filter(k => k.roas < 1.5 || (k.bookingFee > 10000000 && k.roas < 2.0));

  const displayList = filterTier === 'all'
    ? kocs
    : filterTier === 'star'
    ? starKocs
    : filterTier === 'potential'
    ? potentialKocs
    : optimizeKocs;

  return (
    <div className="p-4 space-y-4">
      {/* Overview Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stars */}
        <div
          onClick={() => setFilterTier('star')}
          className={`custom-card p-4 cursor-pointer transition-all border-l-4 ${
            filterTier === 'star' ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : 'hover:shadow-md'
          } border-emerald-500`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              ⭐ KOC Ngôi Sao (Scale)
            </span>
            <span className="text-xl font-black text-emerald-700">{starKocs.length}</span>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            ROAS &gt; 3.0 &amp; Doanh thu cao. Đề xuất: <strong>Gia hạn độc quyền &amp; Đẩy mạnh Spark Ads</strong>.
          </p>
        </div>

        {/* Potentials */}
        <div
          onClick={() => setFilterTier('potential')}
          className={`custom-card p-4 cursor-pointer transition-all border-l-4 ${
            filterTier === 'potential' ? 'ring-2 ring-sky-500 bg-sky-50/20' : 'hover:shadow-md'
          } border-sky-500`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-800 uppercase flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              🚀 KOC Tiềm Năng (Nurture)
            </span>
            <span className="text-xl font-black text-sky-700">{potentialKocs.length}</span>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Tương tác &amp; CTR tốt. Đề xuất: <strong>Hỗ trợ mẫu sản phẩm mới &amp; tối ưu kịch bản tăng thô</strong>.
          </p>
        </div>

        {/* Inefficient */}
        <div
          onClick={() => setFilterTier('optimize')}
          className={`custom-card p-4 cursor-pointer transition-all border-l-4 ${
            filterTier === 'optimize' ? 'ring-2 ring-rose-500 bg-rose-50/20' : 'hover:shadow-md'
          } border-rose-500`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              ⚠️ KOC Cần Tối Ưu (Review)
            </span>
            <span className="text-xl font-black text-rose-700">{optimizeKocs.length}</span>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Chi phí booking/ads cao nhưng ROAS thấp (&lt;1.5). Đề xuất: <strong>Đàm phán lại giá hoặc dừng hợp tác</strong>.
          </p>
        </div>
      </div>

      {/* Suggested Action Table */}
      <div className="custom-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-navy-800 uppercase tracking-wider">
            Danh sách Đề xuất Hành động cho từng KOC
          </div>
          <div className="text-xs text-slate-500">
            Hiển thị: <strong>{displayList.length}</strong> KOCs
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-navy-800 text-white text-[11px] uppercase font-bold">
                <th className="py-2.5 px-3">Tên KOC</th>
                <th className="py-2.5 px-2">Nhân sự</th>
                <th className="py-2.5 px-2">Loại</th>
                <th className="py-2.5 px-3 text-right">Doanh thu</th>
                <th className="py-2.5 px-2 text-right">ROAS</th>
                <th className="py-2.5 px-3">Phân loại AI</th>
                <th className="py-2.5 px-3">Khuyến nghị Chiến lược</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {displayList.map(k => {
                let badge = { text: 'Ổn định', bg: 'bg-slate-100 text-slate-700', action: 'Duy trì tần suất video' };
                if (k.roas >= 3.0 && k.totalGmv >= 200000000) {
                  badge = { text: '⭐ Ngôi sao', bg: 'bg-emerald-100 text-emerald-800 font-bold', action: 'Ký dài hạn + Cấp ngân sách Spark Ads tối đa' };
                } else if (k.roas >= 2.0) {
                  badge = { text: '🚀 Tiềm năng', bg: 'bg-sky-100 text-sky-800 font-bold', action: 'Gửi mẫu SKU Dầu ăn dặm & Mì somen mới' };
                } else if (k.roas < 1.5) {
                  badge = { text: '⚠️ Kém hiệu quả', bg: 'bg-rose-100 text-rose-800 font-bold', action: 'Giảm 50% ngân sách ads hoặc chuyển sang Affiliate thuần' };
                }

                return (
                  <tr
                    key={k.id}
                    onClick={() => onSelectKoc(k.id)}
                    className="hover:bg-sky-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 font-semibold text-navy-800">{k.name}</td>
                    <td className="py-2 px-2 text-slate-600">{k.pic}</td>
                    <td className="py-2 px-2 text-slate-600">{k.bookingType}</td>
                    <td className="py-2 px-3 text-right font-bold text-navy-900">{formatCurrency(k.totalGmv, true)}</td>
                    <td className="py-2 px-2 text-right font-extrabold">
                      <span className={k.roas >= 3 ? 'text-emerald-600' : k.roas < 1.5 ? 'text-rose-600' : 'text-slate-700'}>
                        {k.roas.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${badge.bg}`}>{badge.text}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-700 font-medium">{badge.action}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
