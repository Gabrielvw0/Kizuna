import React, { useState } from 'react';
import { useKizuna } from '../../context/KizunaContext';
import { HankoStamp } from '../shared/HankoStamp';
import {
  BookOpen,
  CheckCircle2,
  Plus,
  ArrowRight,
  FileSpreadsheet,
  ArrowUpRight,
} from 'lucide-react';

type AccountingSubTab =
  | 'JOURNAL'
  | 'GL'
  | 'AR'
  | 'AP'
  | 'ASSETS_EXP'
  | 'STATEMENTS';

export const AccountingModule: React.FC = () => {
  const {
    journalEntries,
    invoices,
    purchaseRequests,
    kpis,
    highlightedJeId,
    advanceJournalEntryStep,
    addJournalEntry,
    openRecord,
    t,
  } = useKizuna();

  const [subTab, setSubTab] = useState<AccountingSubTab>('JOURNAL');
  const [workflowFilter, setWorkflowFilter] = useState<'ALL' | 'POSTED'>('ALL');

  // Quick new Journal Entry form state
  const [debitJp, setDebitJp] = useState('売掛金');
  const [creditJp, setCreditJp] = useState('売上高');
  const [amountInput, setAmountInput] = useState('480000');
  const [summaryInput, setSummaryInput] = useState('定期保守契約 売上計上 (東京本社)');

  const subMenus: { id: AccountingSubTab; labelJp: string; labelSub: string }[] = [
    { id: 'JOURNAL', labelJp: '仕訳入力・伝票承認', labelSub: t('Journal Entries', 'Lançamentos Contábeis') },
    { id: 'GL', labelJp: '総勘定元帳', labelSub: t('General Ledger', 'Razão Geral') },
    { id: 'AR', labelJp: '売掛金・入金管理', labelSub: t('Accounts Receivable', 'Contas a Receber') },
    { id: 'AP', labelJp: '買掛金・支払管理', labelSub: t('Accounts Payable', 'Contas a Pagar') },
    { id: 'ASSETS_EXP', labelJp: '固定資産・経費精算', labelSub: t('Fixed Assets & Expenses', 'Ativos Fixos & Despesas') },
    { id: 'STATEMENTS', labelJp: '決算・財務諸表', labelSub: t('Financial Statements', 'Demonstrações Financeiras') },
  ];

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amountInput) || 480000;
    addJournalEntry({
      date: '10/21',
      branch: 'TOKYO',
      debitAccountJp: debitJp,
      debitAccountEn: debitJp === '売掛金' ? 'Accounts Receivable' : 'Purchases / Expense',
      debitAccountPt: debitJp === '売掛金' ? 'Contas a Receber' : 'Compras / Despesa',
      creditAccountJp: creditJp,
      creditAccountEn: creditJp === '売上高' ? 'Sales Revenue' : 'Accounts Payable',
      creditAccountPt: creditJp === '売上高' ? 'Receita de Vendas' : 'Contas a Pagar',
      amount: num,
      summaryJp: summaryInput,
      summaryEn: summaryInput,
      summaryPt: summaryInput,
      workflowStep: 'POSTED',
      relatedDocId: 'INV-2026-00389',
      approvedByStamp: '佐藤',
    });
  };

  const stepLabels: { key: 'SAVED' | 'VERIFIED' | 'APPROVED' | 'POSTED'; jp: string; sub: string }[] = [
    { key: 'SAVED', jp: '1. 保存', sub: t('Save Draft', 'Salvar') },
    { key: 'VERIFIED', jp: '2. 確認', sub: t('Verify', 'Confirmar') },
    { key: 'APPROVED', jp: '3. 承認', sub: t('Approve', 'Aprovar') },
    { key: 'POSTED', jp: '4. 登録 (元帳転記)', sub: t('Post to GL', 'Registrar') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            財務会計・管理会計統合モジュール (J-GAAP / インボイス制度対応)
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-3">
            <span>会計管理</span>
            <span className="text-sm font-normal text-slate-500">
              / {t('Accounting & Financial Ledger', 'Gestão Financeira e Contábil')}
            </span>
          </h1>
        </div>

        {/* Accounting Workflow Pipeline Indicator: 保存 → 確認 → 承認 → 登録 */}
        <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-md border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 mr-2">
            仕訳承認フロー:
          </span>
          {stepLabels.map((st, idx) => (
            <React.Fragment key={st.key}>
              <div className="px-2.5 py-1 rounded bg-slate-900 text-white text-xs font-semibold flex items-center gap-1">
                <span>{st.jp}</span>
                <span className="text-[10px] text-slate-300 font-normal hidden sm:inline">
                  ({st.sub})
                </span>
              </div>
              {idx < stepLabels.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Submenu Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {subMenus.map((item) => (
          <button
            key={item.id}
            onClick={() => setSubTab(item.id)}
            className={`px-3.5 py-2 rounded-md text-xs transition-all text-left border ${
              subTab === item.id
                ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div>{item.labelJp}</div>
            <div
              className={`text-[10px] ${
                subTab === item.id ? 'text-slate-300 font-normal' : 'text-slate-400'
              }`}
            >
              {item.labelSub}
            </div>
          </button>
        ))}
      </div>

      {/* TAB 1: JOURNAL ENTRY (仕訳入力) */}
      {subTab === 'JOURNAL' && (
        <div className="space-y-5">
          {/* Quick Journal Entry Input Box */}
          <form
            onSubmit={handleCreateEntry}
            className="bg-white border border-slate-200 rounded-md p-4 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-800" />
                <span>仕訳入力 (複式簿記伝票起票) / {t('New Journal Entry Input', 'Novo Lançamento Contábil')}</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                貸借バランス自動検証: OK
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">借方科目 / Debit</label>
                <select
                  value={debitJp}
                  onChange={(e) => setDebitJp(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-semibold text-slate-800"
                >
                  <option value="売掛金">売掛金 (Accounts Receivable)</option>
                  <option value="仕入高">仕入高 (Cost of Goods / Purchases)</option>
                  <option value="普通預金">普通預金 (Cash & Bank)</option>
                  <option value="研究開発費">研究開発費 (R&D Expense)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">貸方科目 / Credit</label>
                <select
                  value={creditJp}
                  onChange={(e) => setCreditJp(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white font-semibold text-slate-800"
                >
                  <option value="売上高">売上高 (Sales Revenue)</option>
                  <option value="買掛金">買掛金 (Accounts Payable)</option>
                  <option value="売掛金">売掛金 (Accounts Receivable)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">金額 (JPY) / Amount</label>
                <input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">摘要 / Description</label>
                <input
                  type="text"
                  value={summaryInput}
                  onChange={(e) => setSummaryInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-slate-800"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-1.5 px-3 rounded bg-blue-900 hover:bg-blue-800 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>保存 → 承認 → 登録</span>
                </button>
              </div>
            </div>
          </form>

          {/* Journal Entries Table */}
          <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  仕訳帳・元帳転記一覧 / {t('Journal Entry Ledger', 'Diário Contábil Integrado')}
                </h3>
                <p className="text-[11px] text-slate-500">
                  販売管理・購買管理・ワークフローから自動連携された仕訳伝票を含みます
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setWorkflowFilter('ALL')}
                  className={`px-2.5 py-1 rounded border ${
                    workflowFilter === 'ALL'
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  全伝票 ({journalEntries.length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                    <th className="py-2.5 px-4 font-semibold">伝票番号</th>
                    <th className="py-2.5 px-4 font-semibold">日付 / Date</th>
                    <th className="py-2.5 px-4 font-semibold">借方 / Debit</th>
                    <th className="py-2.5 px-4 font-semibold">貸方 / Credit</th>
                    <th className="py-2.5 px-4 font-semibold text-right">金額 / Amount</th>
                    <th className="py-2.5 px-4 font-semibold">摘要・関連証憑 / Related Doc</th>
                    <th className="py-2.5 px-4 font-semibold text-center">状態 / Status</th>
                    <th className="py-2.5 px-4 font-semibold text-center">承認印</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {journalEntries.map((je) => {
                    const isHighlighted = highlightedJeId === je.id;
                    return (
                      <tr
                        key={je.id}
                        className={`transition-colors ${
                          isHighlighted
                            ? 'bg-blue-50/90 ring-1 ring-inset ring-blue-400'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-blue-900">
                          {je.id}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">{je.date}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{je.debitAccountJp}</div>
                          <div className="text-[10px] text-slate-400">
                            {t(je.debitAccountEn, je.debitAccountPt)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{je.creditAccountJp}</div>
                          <div className="text-[10px] text-slate-400">
                            {t(je.creditAccountEn, je.creditAccountPt)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums text-sm">
                          ¥{je.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800 font-medium">{je.summaryJp}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() =>
                                openRecord(
                                  je.relatedDocId.startsWith('PR') ? 'PR' : 'INV',
                                  je.relatedDocId
                                )
                              }
                              className="text-[11px] font-mono text-blue-800 hover:underline flex items-center gap-0.5"
                            >
                              <span>証憑: {je.relatedDocId}</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                            {je.partnerId && (
                              <button
                                onClick={() => openRecord('PARTNER', je.partnerId!)}
                                className="text-[11px] text-slate-500 hover:text-blue-800 hover:underline"
                              >
                                • 取引先 360°
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => advanceJournalEntryStep(je.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>✓ 登録済</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <HankoStamp kanji={je.approvedByStamp} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 & OTHERS: GL, AR, AP, ASSETS, FINANCIAL STATEMENTS */}
      {subTab !== 'JOURNAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-md p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-800" />
                <h3 className="text-sm font-bold text-slate-900">
                  {subMenus.find((m) => m.id === subTab)?.labelJp} /{' '}
                  {subMenus.find((m) => m.id === subTab)?.labelSub}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">2026年度 第3四半期</span>
            </div>

            {subTab === 'AR' ? (
              <div className="space-y-3 text-xs">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => openRecord('INV', inv.id)}
                    className="p-3.5 rounded border border-slate-200 hover:border-blue-500 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-mono font-bold text-blue-900">
                        {inv.id} — {inv.partnerNameJp}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        注文: {inv.salesOrderId} | 期日: {inv.dueDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-slate-900">
                        ¥{inv.amount.toLocaleString()}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold">
                        {inv.statusJp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : subTab === 'AP' ? (
              <div className="space-y-3 text-xs">
                {purchaseRequests.map((pr) => (
                  <div
                    key={pr.id}
                    onClick={() => openRecord('PR', pr.id)}
                    className="p-3.5 rounded border border-slate-200 hover:border-blue-500 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-mono font-bold text-blue-900">
                        {pr.poNumber || pr.id} — {pr.supplierNameJp}
                      </div>
                      <div className="text-slate-500 mt-0.5">{pr.titleJp}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-slate-900">
                        ¥{pr.amount.toLocaleString()}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold">
                        {pr.statusJp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-slate-200 rounded overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                      <th className="py-2 px-3">勘定科目コード</th>
                      <th className="py-2 px-3">勘定科目名 / Account Title</th>
                      <th className="py-2 px-3 text-right">当期残高 (JPY)</th>
                      <th className="py-2 px-3 text-right">構成比</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2.5 px-3 font-mono">1110</td>
                      <td className="py-2.5 px-3 font-semibold">現金及び預金 (Cash & Equivalents)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">¥142,800,000</td>
                      <td className="py-2.5 px-3 text-right font-mono">38.4%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono">1120</td>
                      <td className="py-2.5 px-3 font-semibold">売掛金 (Accounts Receivable)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        ¥{kpis.accountsReceivable.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">12.1%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono">1150</td>
                      <td className="py-2.5 px-3 font-semibold">棚卸資産・製品在庫 (Inventory)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        ¥{kpis.inventoryValue.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">18.5%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono">2110</td>
                      <td className="py-2.5 px-3 font-semibold">買掛金 (Accounts Payable)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        ¥{kpis.accountsPayable.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">9.4%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono">4100</td>
                      <td className="py-2.5 px-3 font-semibold">売上高 (Sales Revenue)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-900">
                        ¥{kpis.revenue.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">100.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Summary Card */}
          <div className="bg-slate-900 text-white rounded-md p-5 space-y-4">
            <div className="text-xs font-mono text-blue-300 uppercase">
              財務統制サマリー / FINANCIAL SUMMARY
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">売上高合計</span>
                <span className="font-mono font-bold">¥{kpis.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">営業利益</span>
                <span className="font-mono font-bold text-emerald-400">
                  ¥{kpis.operatingProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">未回収債権 (売掛金)</span>
                <span className="font-mono font-bold text-amber-300">
                  ¥{kpis.accountsReceivable.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">買掛金残高</span>
                <span className="font-mono font-bold">
                  ¥{kpis.accountsPayable.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
