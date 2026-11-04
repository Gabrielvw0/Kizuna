import React from 'react';
import { useKizuna } from '../../context/KizunaContext';
import { RelatedRecordsBar } from './RelatedRecordsBar';
import { HankoStamp } from './HankoStamp';
import { RelatedRecordRef } from '../../types/erp';
import {
  X,
  Receipt,
  Building2,
  BookOpen,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const OrderInvoiceDrawer: React.FC = () => {
  const {
    selectedOrderId,
    setSelectedOrderId,
    salesOrders,
    invoices,
    openRecord,
    syncOrderToAccounting,
    setActiveModule,
    setHighlightedJeId,
    t,
  } = useKizuna();

  if (!selectedOrderId) return null;

  const order =
    salesOrders.find((o) => o.id === selectedOrderId) || salesOrders[0];
  const invoice =
    invoices.find((i) => i.salesOrderId === order.id || i.id === order.invoiceId) ||
    invoices[0];
  const jeId = order.journalEntryId || invoice.journalEntryId || 'JE-2026-02841';

  const relatedRecords: RelatedRecordRef[] = [
    {
      type: 'PARTNER',
      id: order.partnerId,
      titleJp: order.partnerNameJp,
      titleEn: `Customer: ${order.partnerNameEn}`,
      titlePt: `Cliente: ${order.partnerNameEn}`,
      statusJp: '取引先 360°',
    },
    {
      type: 'SO',
      id: order.id,
      titleJp: `受注伝票 (${order.itemsSummaryJp.slice(0, 18)}...)`,
      titleEn: 'Related Sales Order',
      titlePt: 'Pedido Relacionado',
      amount: order.amount,
      statusJp: order.statusJp,
    },
    {
      type: 'CONTRACT',
      id: order.contractId,
      titleJp: '基本取引契約書 (継続供給)',
      titleEn: 'Master Contract',
      titlePt: 'Contrato Vinculado',
      amount: 12400000,
      statusJp: '有効',
    },
    {
      type: 'PAYMENT',
      id: invoice.paymentId || 'PAY-2026-01928',
      titleJp: '入金消込レコード (みずほ銀行)',
      titleEn: 'Payment Record',
      titlePt: 'Registro de Pagamento',
      amount: order.amount,
      statusJp: '予定・照合',
    },
    {
      type: 'JE',
      id: jeId,
      titleJp: '借方: 売掛金 / 貸方: 売上高',
      titleEn: 'Journal Entry (AR / Revenue)',
      titlePt: 'Lançamento Contábil (AR / Receita)',
      amount: order.amount,
      statusJp: '仕訳確認',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-[1px]">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-300 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30">
                受注・適格請求書詳細 / ORDER & INVOICE INSPECTOR
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold">
                {order.statusJp}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1.5 font-mono flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-400" />
              <span>{invoice.id}</span>
              <span className="text-sm text-slate-400 font-normal">/ {order.id}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              取引先: <strong>{order.partnerNameJp}</strong> ({order.partnerNameEn})
            </p>
          </div>
          <button
            onClick={() => setSelectedOrderId(null)}
            className="text-slate-400 hover:text-white p-1.5 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Card with Hanko Stamps */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-slate-500 font-medium">
                請求金額 (税抜) / {t('Invoice Amount', 'Valor da Fatura')}
              </div>
              <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                ¥{order.amount.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>消費税 (10%): ¥{invoice.taxAmount.toLocaleString()}</span>
                <span>•</span>
                <span>発行日: {invoice.issueDate}</span>
                <span>•</span>
                <span>支払期日: {invoice.dueDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <HankoStamp kanji="山田" roleLabel="営業部長" size="md" />
              <HankoStamp kanji="佐藤" roleLabel="経理承認" size="md" />
            </div>
          </div>

          {/* Accounting Integration Card (「会計へ連携」) */}
          <div className="border-2 border-blue-900/20 bg-blue-50/40 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-900" />
                <span className="text-sm font-bold text-slate-900">
                  会計システム自動仕訳連携 / {t('Accounting Ledger Integration', 'Integração com Razão Contábil')}
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                仕訳番号: {jeId}
              </span>
            </div>

            {/* Journal Entry Preview Box */}
            <div className="bg-white border border-slate-200 rounded p-3 font-mono text-xs">
              <div className="grid grid-cols-4 text-[11px] text-slate-400 pb-1.5 mb-1.5 border-b border-slate-100 font-sans font-semibold">
                <span>日付 / Date</span>
                <span>借方科目 / Debit (Dr)</span>
                <span>貸方科目 / Credit (Cr)</span>
                <span className="text-right">金額 / Amount</span>
              </div>
              <div className="grid grid-cols-4 items-center text-slate-900 font-semibold">
                <span>10/21</span>
                <span className="text-blue-900">
                  売掛金 <span className="text-[10px] font-normal text-slate-500">(AR)</span>
                </span>
                <span className="text-emerald-800">
                  売上高 <span className="text-[10px] font-normal text-slate-500">(Revenue)</span>
                </span>
                <span className="text-right tabular-nums">¥{order.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openRecord('PARTNER', order.partnerId)}
                  className="text-xs px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-medium flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-800" />
                  <span>顧客 360° ({order.partnerNameJp})</span>
                </button>
                <button
                  onClick={() => openRecord('DOC', invoice.id)}
                  className="text-xs px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-medium flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>請求書 PDFを表示</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    syncOrderToAccounting(order.id);
                  }}
                  className="text-xs px-4 py-2 rounded bg-blue-900 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>「会計へ連携」({t('Execute GL Sync', 'Integrar à Contabilidade')})</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedOrderId(null);
                    setHighlightedJeId(jeId);
                    setActiveModule('accounting');
                  }}
                  className="text-xs px-3 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium flex items-center gap-1"
                >
                  <span>仕訳帳を開く</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Related Records Block (関連情報) */}
          <RelatedRecordsBar
            records={relatedRecords}
            titleJp={`関連レコード (${invoice.id} / ${order.id})`}
          />

          {/* Line Items Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              受注明細・品目内訳 / {t('Order Line Items', 'Itens do Pedido e Fatura')}
            </h4>
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                    <th className="py-2 px-3 font-semibold">品目コード</th>
                    <th className="py-2 px-3 font-semibold">品名・仕様 / Description</th>
                    <th className="py-2 px-3 font-semibold text-right">数量</th>
                    <th className="py-2 px-3 font-semibold text-right">単価</th>
                    <th className="py-2 px-3 font-semibold text-right">金額</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr>
                    <td className="py-2.5 px-3 font-mono text-blue-900 font-semibold">KZ-00500</td>
                    <td className="py-2.5 px-3 text-slate-800">{order.itemsSummaryJp}</td>
                    <td className="py-2.5 px-3 text-right font-mono">12 台</td>
                    <td className="py-2.5 px-3 text-right font-mono">¥680,000</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      ¥8,160,000
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono text-blue-900 font-semibold">KZ-SRV-01</td>
                    <td className="py-2.5 px-3 text-slate-800">現地据付・初期キャリブレーション調整一式</td>
                    <td className="py-2.5 px-3 text-right font-mono">1 式</td>
                    <td className="py-2.5 px-3 text-right font-mono">¥260,000</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      ¥260,000
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Japanese Compliance Strip */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-md flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>
                <strong>電子帳簿保存法・インボイス制度準拠:</strong> タイムスタンプ付与済 (T8010401092831)
              </span>
            </div>
            <span className="font-mono text-[11px] text-emerald-700">VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
