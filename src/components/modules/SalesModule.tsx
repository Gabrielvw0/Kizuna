import React, { useState } from 'react';
import { useKizuna } from '../../context/KizunaContext';
import {
  Briefcase,
  ArrowRight,
  Building2,
  Receipt,
  BookOpen,
  FileText,
  Plus,
} from 'lucide-react';

export const SalesModule: React.FC = () => {
  const {
    salesOrders,
    partners,
    openRecord,
    syncOrderToAccounting,
    createSalesOrder,
    recordCustomAction,
    t,
  } = useKizuna();

  const [selectedStageIdx, setSelectedStageIdx] = useState<number | null>(null);
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [newPartnerId, setNewPartnerId] = useState('PTN-001');
  const [newItemsJp, setNewItemsJp] = useState('製品 KZ-500 制御ユニット × 5台 (追加導入分)');
  const [newAmount, setNewAmount] = useState('3400000');

  const pipelineStages = [
    { jp: '商談', sub: t('Lead / Opportunity', 'Lead / Oportunidade'), amount: '¥42.8M', count: 38 },
    { jp: '見積', sub: t('Quotation', 'Cotação'), amount: '¥31.2M', count: 24 },
    { jp: '受注', sub: t('Sales Order', 'Pedido'), amount: '¥24.7M', count: 19 },
    { jp: '出荷', sub: t('Shipment', 'Expedição'), amount: '¥18.4M', count: 14 },
    { jp: '売上・請求', sub: t('Invoiced / Revenue', 'Faturamento'), amount: '¥15.8M', count: 12 },
  ];

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    createSalesOrder(newPartnerId, newItemsJp, Number(newAmount) || 3400000);
    setShowNewOrderForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            顧客・見積・受注・出荷・売上・売掛債権 一貫管理モジュール
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-3">
            <span>販売管理</span>
            <span className="text-sm font-normal text-slate-500">
              / {t('Sales & Order-to-Cash Management', 'Gestão de Vendas & Order-to-Cash')}
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* End-to-End Flow Pill */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs bg-white px-3.5 py-2 rounded-md border border-slate-200 shadow-sm font-medium text-slate-700">
            <span>商談 (Lead)</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span>見積 (Quote)</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="font-bold text-blue-900">受注 (Order)</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span>出荷 (Ship)</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="font-bold text-emerald-800">請求・会計連携</span>
          </div>

          <button
            onClick={() => setShowNewOrderForm((prev) => !prev)}
            className="px-3.5 py-2 rounded-md bg-slate-900 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新規受注登録 ({t('New Order', 'Novo Pedido')})</span>
          </button>
        </div>
      </div>

      {/* Interactive New Sales Order Form */}
      {showNewOrderForm && (
        <form
          onSubmit={handleCreateOrder}
          className="bg-blue-50/50 border border-blue-200 rounded-md p-4 space-y-3 animate-in fade-in duration-150"
        >
          <div className="text-xs font-bold text-blue-950">
            新規受注伝票の起票 (請求書を自動同時生成します)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">得意先 / Customer</label>
              <select
                value={newPartnerId}
                onChange={(e) => setNewPartnerId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-semibold"
              >
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameJp} ({p.nameEn})
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-slate-600 mb-1">品目・仕様 / Items</label>
              <input
                type="text"
                value={newItemsJp}
                onChange={(e) => setNewItemsJp(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">受注金額 (JPY)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-mono font-bold"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-blue-900 hover:bg-blue-800 text-white font-bold shrink-0"
                >
                  登録
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Interactive Sales Pipeline Funnel Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {pipelineStages.map((st, idx) => {
          const isSel = selectedStageIdx === idx;
          return (
            <button
              key={st.jp}
              onClick={() => {
                setSelectedStageIdx(isSel ? null : idx);
                recordCustomAction(
                  `販売パイプライン「${st.jp}」ステージ照会`,
                  `対象案件 ${st.count}件 • パイプライン金額 ${st.amount}`,
                  `PIPE-${idx + 1}`
                );
              }}
              className={`text-left bg-white border rounded-md p-4 shadow-sm transition-all ${
                isSel
                  ? 'border-blue-700 ring-1 ring-blue-500 bg-blue-50/20'
                  : 'border-slate-200 hover:border-blue-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{st.jp}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                  {st.count}件
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{st.sub}</div>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-3 tabular-nums">
                {st.amount}
              </div>
              <div
                className="h-1 bg-blue-900 mt-3 rounded-full"
                style={{ width: `${100 - idx * 14}%` }}
              />
            </button>
          );
        })}
      </div>

      {/* Sales Orders Table (Highlighting #SO-2026-10482) */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-800" />
              <span>受注・出荷・請求一覧 / {t('Active Sales Orders', 'Carteira de Pedidos de Venda')}</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              注文番号または取引先をクリックすると、360° 顧客情報・契約書・請求書・会計仕訳へ直接展開します
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-4 font-semibold">受注番号 / Order ID</th>
                <th className="py-2.5 px-4 font-semibold">得意先 / Customer (360°)</th>
                <th className="py-2.5 px-4 font-semibold">件名・品目 / Line Summary</th>
                <th className="py-2.5 px-4 font-semibold">受注日 / 納期</th>
                <th className="py-2.5 px-4 font-semibold text-right">受注金額 / Amount</th>
                <th className="py-2.5 px-4 font-semibold">状態 / Status</th>
                <th className="py-2.5 px-4 font-semibold">関連レコード・会計連携</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {salesOrders.map((so) => {
                const isMainOrder = so.id === 'SO-2026-10482';
                return (
                  <tr
                    key={so.id}
                    className={`transition-colors ${
                      isMainOrder ? 'bg-blue-50/40 hover:bg-blue-50/80' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => openRecord('SO', so.id)}
                        className="font-mono font-bold text-blue-900 hover:underline flex items-center gap-1.5"
                      >
                        <span>{so.id}</span>
                        {isMainOrder && (
                          <span className="text-[9px] font-sans font-bold px-1.5 py-0.2 bg-blue-900 text-white rounded">
                            注目
                          </span>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => openRecord('PARTNER', so.partnerId)}
                        className="font-bold text-slate-900 hover:text-blue-800 hover:underline flex items-center gap-1.5"
                      >
                        <Building2 className="w-3.5 h-3.5 text-blue-700" />
                        <span>{so.partnerNameJp}</span>
                      </button>
                      <div className="text-[10px] text-slate-400">{so.partnerNameEn}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{so.itemsSummaryJp}</div>
                      <div className="text-[10px] text-slate-400">{so.itemsSummaryEn}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <div>受注: {so.date}</div>
                      <div className="text-[10px] text-slate-400">納期: {so.deliveryDate}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums text-sm">
                      ¥{so.amount.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => openRecord('SO', so.id)}
                        className={`inline-block px-2 py-0.5 rounded font-semibold text-[11px] ${
                          so.accountingSynced
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {so.statusJp}
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => openRecord('INV', so.invoiceId)}
                          className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-mono text-[11px] flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3 text-blue-700" />
                          <span>{so.invoiceId}</span>
                        </button>

                        <button
                          onClick={() => openRecord('CONTRACT', so.contractId)}
                          className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-mono text-[11px] flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-slate-500" />
                          <span>{so.contractId}</span>
                        </button>

                        <button
                          onClick={() => syncOrderToAccounting(so.id)}
                          className="px-2.5 py-1 rounded bg-blue-900 hover:bg-blue-800 text-white font-semibold text-[11px] flex items-center gap-1 shadow-sm"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>会計へ連携</span>
                        </button>
                      </div>
                    </td>
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
