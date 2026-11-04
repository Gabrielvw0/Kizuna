import React, { useState } from 'react';
import { useKizuna } from '../../context/KizunaContext';
import { RelatedRecordsBar } from './RelatedRecordsBar';
import { RelatedRecordRef } from '../../types/erp';
import {
  X,
  Building2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  ShoppingCart,
  Receipt,
  BookOpen,
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

export const PartnerDrawer: React.FC = () => {
  const {
    selectedPartnerId,
    setSelectedPartnerId,
    partners,
    salesOrders,
    invoices,
    journalEntries,
    openRecord,
    syncOrderToAccounting,
    t,
  } = useKizuna();

  const [activeTab, setActiveTab] = useState<'ALL' | 'ORDERS' | 'INVOICES' | 'ACCOUNTING'>('ALL');

  if (!selectedPartnerId) return null;

  const partner = partners.find((p) => p.id === selectedPartnerId) || partners[0];
  const partnerOrders = salesOrders.filter((o) => o.partnerId === partner.id);
  const partnerInvoices = invoices.filter((i) => i.partnerId === partner.id);
  const partnerJes = journalEntries.filter((j) => j.partnerId === partner.id);

  const creditUsagePct = Math.min(
    100,
    Math.round(((partner.receivableBalance || partner.payableBalance) / partner.creditLimit) * 100)
  );

  const relatedRecords: RelatedRecordRef[] = [
    ...partner.contracts.map((cId) => ({
      type: 'CONTRACT' as const,
      id: cId,
      titleJp: '基本取引契約書',
      titleEn: 'Master Supply Agreement',
      titlePt: 'Contrato Mestre de Fornecimento',
      amount: 12400000,
      statusJp: '有効',
    })),
    ...partnerOrders.map((so) => ({
      type: 'SO' as const,
      id: so.id,
      titleJp: so.itemsSummaryJp,
      titleEn: so.itemsSummaryEn,
      titlePt: so.itemsSummaryEn,
      amount: so.amount,
      statusJp: so.statusJp,
    })),
    ...partnerInvoices.map((inv) => ({
      type: 'INV' as const,
      id: inv.id,
      titleJp: `適格請求書 (${inv.issueDate})`,
      titleEn: `Qualified Invoice (${inv.issueDate})`,
      titlePt: `Fatura Fiscal (${inv.issueDate})`,
      amount: inv.amount,
      statusJp: inv.statusJp,
    })),
    ...partner.payments.map((payId) => ({
      type: 'PAYMENT' as const,
      id: payId,
      titleJp: '銀行振込 (みずほ銀行 丸の内営業部)',
      titleEn: 'Wire Transfer (Mizuho Bank Marunouchi)',
      titlePt: 'Transferência Bancária (Mizuho Bank)',
      statusJp: '照合済',
    })),
    ...partnerJes.map((je) => ({
      type: 'JE' as const,
      id: je.id,
      titleJp: `${je.debitAccountJp} / ${je.creditAccountJp}`,
      titleEn: `${je.debitAccountEn} / ${je.creditAccountEn}`,
      titlePt: `${je.debitAccountPt} / ${je.creditAccountPt}`,
      amount: je.amount,
      statusJp: '転記済',
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-[1px]">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-300 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-600/30 text-blue-200 border border-blue-400/30">
                取引先 360° VIEW • {partner.code}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                信用格付: {partner.rating}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1.5 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span>{partner.nameJp}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {partner.nameEn} — {partner.locationJp} ({partner.locationEn})
            </p>
          </div>
          <button
            onClick={() => setSelectedPartnerId(null)}
            className="text-slate-400 hover:text-white p-1.5 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata & Credit Limit Bar */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-slate-400 font-medium">
              適格請求書番号 / {t('Invoice Reg No.', 'Reg. Invoice')}
            </div>
            <div className="font-mono font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{partner.invoiceRegNo}</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">
              担当者 / {t('Primary Contact', 'Contato Principal')}
            </div>
            <div className="font-semibold text-slate-800 mt-0.5">
              {partner.contactPersonJp} ({partner.departmentJp})
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">
              与信限度額 / {t('Credit Limit Usage', 'Uso do Limite de Crédito')}
            </div>
            <div className="font-mono font-semibold text-slate-900 mt-0.5">
              ¥{(partner.receivableBalance / 1000000).toFixed(2)}M / ¥{(partner.creditLimit / 1000000).toFixed(1)}M ({creditUsagePct}%)
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-6 text-xs font-semibold">
          {[
            { id: 'ALL', labelJp: '360° サマリー', labelSub: t('Overview & Links', 'Visão 360° e Vínculos') },
            { id: 'ORDERS', labelJp: '受注・契約', labelSub: t('Orders & Contracts', 'Pedidos e Contratos') },
            { id: 'INVOICES', labelJp: '請求・入金', labelSub: t('Invoices & Billing', 'Faturas e Cobrança') },
            { id: 'ACCOUNTING', labelJp: '会計仕訳', labelSub: t('Journal Ledger', 'Lançamentos Contábeis') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-800 text-blue-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <div>{tab.labelJp}</div>
              <div className="text-[10px] font-normal text-slate-400">{tab.labelSub}</div>
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Highlighted Order & Invoice Card (Act 1 Showcase) */}
          {partnerOrders.length > 0 && (
            <div className="border border-blue-200 bg-blue-50/40 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-900 text-white rounded">
                    主要取引 / {t('ACTIVE TRANSACTION', 'TRANSAÇÃO EM DESTAQUE')}
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-950">
                    {partnerOrders[0].id} → {partnerOrders[0].invoiceId}
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  {partnerOrders[0].statusJp}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {partnerOrders[0].itemsSummaryJp}
                  </div>
                  <div className="text-xs text-slate-500">
                    {partnerOrders[0].itemsSummaryEn} • 営業担当: {partnerOrders[0].salesRepJp}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                    ¥{partnerOrders[0].amount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    契約番号: {partnerOrders[0].contractId}
                  </div>
                </div>
              </div>

              {/* Action Bar inside Customer 360° */}
              <div className="pt-3 border-t border-blue-200/70 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openRecord('SO', partnerOrders[0].id)}
                    className="text-xs px-3 py-1.5 rounded bg-white hover:bg-blue-50 text-slate-800 border border-slate-300 font-medium flex items-center gap-1.5"
                  >
                    <Receipt className="w-3.5 h-3.5 text-blue-700" />
                    <span>請求書・注文詳細 ({partnerOrders[0].invoiceId})</span>
                  </button>
                  <button
                    onClick={() => openRecord('CONTRACT', partnerOrders[0].contractId)}
                    className="text-xs px-3 py-1.5 rounded bg-white hover:bg-blue-50 text-slate-800 border border-slate-300 font-medium flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>契約書 PDF ({partnerOrders[0].contractId})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      syncOrderToAccounting(partnerOrders[0].id);
                    }}
                    className="text-xs px-3.5 py-1.5 rounded bg-blue-900 hover:bg-blue-800 text-white font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>「会計へ連携」({t('Post to Accounting', 'Integrar à Contabilidade')})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Related Records Graph */}
          <RelatedRecordsBar
            records={relatedRecords}
            titleJp="取引先 関連レコード一覧 (契約・注文・請求・入金・仕訳)"
          />

          {/* Detailed Invoices & Accounting Ledger Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              請求書・売掛金明細 / {t('Invoices & Receivables Ledger', 'Faturas e Razão de Contas a Receber')}
            </h4>
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-semibold">請求番号 / Invoice</th>
                    <th className="py-2.5 px-3 font-semibold">注文番号 / Order</th>
                    <th className="py-2.5 px-3 font-semibold">発行日 / Date</th>
                    <th className="py-2.5 px-3 font-semibold text-right">金額 / Amount</th>
                    <th className="py-2.5 px-3 font-semibold">会計仕訳 / GL Entry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {partnerInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-semibold text-blue-900">
                        <button
                          onClick={() => openRecord('INV', inv.id)}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{inv.id}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{inv.salesOrderId}</td>
                      <td className="py-2.5 px-3 text-slate-600">{inv.issueDate}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        ¥{inv.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        {inv.journalEntryId ? (
                          <button
                            onClick={() => openRecord('JE', inv.journalEntryId!)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] hover:bg-emerald-100"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{inv.journalEntryId}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => syncOrderToAccounting(inv.salesOrderId)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-900 text-white font-medium text-[11px] hover:bg-blue-800"
                          >
                            <span>会計へ連携</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contact & Address Footer Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 grid grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="space-y-1.5">
              <div className="font-semibold text-slate-800">所在地・連絡先 / Contact Details</div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{partner.locationJp}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{partner.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{partner.email}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="font-semibold text-slate-800">取引条件 / Trading Terms</div>
              <div>締日・支払条件: 月末締め翌月末日銀行振込</div>
              <div>取引開始日: {partner.sinceDate}</div>
              <div>決済口座: みずほ銀行 丸の内営業部 (当座)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
