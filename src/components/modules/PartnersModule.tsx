import React, { useState } from 'react';
import { useKizuna } from '../../context/KizunaContext';
import {
  Building2,
  ShieldCheck,
  ArrowUpRight,
  FileText,
  Receipt,
  BookOpen,
} from 'lucide-react';

export const PartnersModule: React.FC = () => {
  const { partners, openRecord, t } = useKizuna();
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMER' | 'SUPPLIER'>('ALL');

  const filtered = partners.filter((p) => {
    if (roleFilter === 'ALL') return true;
    if (roleFilter === 'CUSTOMER') return p.role === 'CUSTOMER' || p.role === 'BOTH';
    return p.role === 'SUPPLIER' || p.role === 'BOTH';
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            顧客・仕入先・グループ取引先 360° 統合マスタ (与信・適格請求書番号管理)
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-3">
            <span>取引先管理</span>
            <span className="text-sm font-normal text-slate-500">
              / {t('Business Partners (CRM & SRM 360°)', 'Gestão de Clientes e Fornecedores 360°')}
            </span>
          </h1>
        </div>

        {/* Role Switcher: 取引先 / 顧客 / 仕入先 */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-md border border-slate-200 shadow-sm text-xs">
          {[
            { id: 'ALL', jp: '取引先 (すべて)', sub: t('All Partners', 'Todos') },
            { id: 'CUSTOMER', jp: '顧客', sub: t('Customer', 'Clientes') },
            { id: 'SUPPLIER', jp: '仕入先', sub: t('Supplier', 'Fornecedores') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id as typeof roleFilter)}
              className={`px-3.5 py-1.5 rounded transition-all ${
                roleFilter === tab.id
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.jp}</span>{' '}
              <span className="text-[10px] opacity-75">({tab.sub})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Partner Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((ptn) => {
          const usagePct = Math.min(
            100,
            Math.round(((ptn.receivableBalance || ptn.payableBalance) / ptn.creditLimit) * 100)
          );

          return (
            <div
              key={ptn.id}
              onClick={() => openRecord('PARTNER', ptn.id)}
              className="group bg-white border border-slate-200 hover:border-blue-600 rounded-md p-5 shadow-sm cursor-pointer transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {ptn.code}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                        {ptn.role === 'CUSTOMER'
                          ? '顧客 / Customer'
                          : ptn.role === 'SUPPLIER'
                          ? '仕入先 / Supplier'
                          : '顧客・仕入先 / Business Partner'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        格付 {ptn.rating}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 mt-1.5 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-800" />
                      <span>{ptn.nameJp}</span>
                    </h2>
                    <div className="text-xs text-slate-500">
                      {ptn.nameEn} • {ptn.locationJp}
                    </div>
                  </div>

                  <button className="px-2.5 py-1 rounded bg-slate-900 group-hover:bg-blue-900 text-white text-xs font-semibold flex items-center gap-1 shrink-0">
                    <span>360° 詳細</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Financial & Credit Info */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <div className="text-slate-400">売掛金残高 (AR)</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
                      ¥{ptn.receivableBalance.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">買掛金残高 (AP)</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
                      ¥{ptn.payableBalance.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">与信限度額 ({usagePct}%)</div>
                    <div className="font-mono font-semibold text-slate-700 mt-0.5 tabular-nums">
                      ¥{(ptn.creditLimit / 1000000).toFixed(0)}M
                    </div>
                  </div>
                </div>
              </div>

              {/* Linked Records Chips */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex flex-wrap items-center gap-1.5">
                  {ptn.contracts[0] && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-500" />
                      {ptn.contracts[0]}
                    </span>
                  )}
                  {ptn.orders[0] && (
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 font-mono font-semibold">
                      {ptn.orders[0]}
                    </span>
                  )}
                  {ptn.invoices[0] && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono flex items-center gap-1">
                      <Receipt className="w-3 h-3 text-blue-700" />
                      {ptn.invoices[0]}
                    </span>
                  )}
                  {ptn.journalEntries[0] && (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-emerald-700" />
                      {ptn.journalEntries[0]}
                    </span>
                  )}
                </div>

                <span className="font-mono text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {ptn.invoiceRegNo}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
