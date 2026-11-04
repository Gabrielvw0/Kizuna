import React from 'react';
import { useKizuna } from '../../context/KizunaContext';
import { HankoStamp } from '../shared/HankoStamp';
import {
  GitPullRequest,
  Bell,
  CheckCircle2,
  ArrowDown,
  FileText,
  Building2,
  ArrowRight,
} from 'lucide-react';

export const WorkflowModule: React.FC = () => {
  const {
    purchaseRequests,
    selectedPrId,
    setSelectedPrId,
    approvePurchaseRequest,
    kpis,
    openRecord,
    setActiveModule,
    t,
  } = useKizuna();

  const activePr =
    purchaseRequests.find((p) => p.id === selectedPrId) || purchaseRequests[0];

  const isApproved = activePr.status === 'APPROVED_ORDERED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            電子稟議・多段階承認オーケストレーション・電子印鑑統制
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-3">
            <span>ワークフロー (電子稟議)</span>
            <span className="text-sm font-normal text-slate-500">
              / {t('Workflow & Ringi Approval Orchestration', 'Orquestração de Workflow e Aprovações Ringi')}
            </span>
          </h1>
        </div>

        {/* Notification Banner */}
        <div
          className={`px-4 py-2.5 rounded-md border flex items-center gap-3 ${
            kpis.pendingApprovalsCount > 0
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}
        >
          <Bell
            className={`w-4 h-4 ${
              kpis.pendingApprovalsCount > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}
          />
          <div className="text-xs">
            <div className="font-bold">
              🔔 {kpis.pendingApprovalsCount}件の承認待ちがあります
            </div>
            <div className="text-[11px] opacity-80">
              {t(
                `You have ${kpis.pendingApprovalsCount} pending approvals requiring digital Hanko.`,
                `Você possui ${kpis.pendingApprovalsCount} aprovações pendentes aguardando carimbo.`
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Queue + Center Visual Orchestrator + Right Cross-Module Reaction */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 4 Cols: Ringi Queue */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              決裁キュー / {t('Approval Queue', 'Fila de Aprovação')}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              未決: {kpis.pendingApprovalsCount}件
            </span>
          </div>

          <div className="divide-y divide-slate-200">
            {purchaseRequests.map((pr) => {
              const selected = pr.id === activePr.id;
              return (
                <button
                  key={pr.id}
                  onClick={() => setSelectedPrId(pr.id)}
                  className={`w-full p-4 text-left transition-all ${
                    selected
                      ? 'bg-blue-50/70 border-l-4 border-l-blue-900'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-blue-900">
                      {pr.id}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        pr.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {pr.statusJp}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1">
                    {pr.supplierNameJp}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                    {pr.titleJp}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">申請: {pr.requesterJp}</span>
                    <span className="font-mono font-bold text-slate-900">
                      ¥{pr.amount.toLocaleString()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center 5 Cols: Visual Workflow Diagram (Solicitação ↓ Gerente ↓ Financeiro/Compras ↓ Purchasing) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-md p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[11px] font-mono text-blue-800 font-bold">
                  RINGI ORCHESTRATOR • {activePr.id}
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  {activePr.supplierNameJp} (¥{activePr.amount.toLocaleString()})
                </h2>
              </div>
              <button
                onClick={() => openRecord('DOC', activePr.id)}
                className="text-xs px-2.5 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>稟議書 PDF</span>
              </button>
            </div>

            {/* Vertical Node Flow Diagram */}
            <div className="flex flex-col items-center space-y-2 py-2">
              {/* Node 1: Solicitação */}
              <div className="w-full max-w-md p-3.5 rounded-md border border-emerald-300 bg-emerald-50/40 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase text-emerald-700 font-bold">
                    STEP 1 • 起案・申請 ({t('Request Submitted', 'Solicitação')})
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {activePr.requesterJp} ({activePr.departmentJp})
                  </div>
                  <div className="text-[11px] text-slate-500">2026/10/21 09:15 提出済</div>
                </div>
                <HankoStamp kanji="田中" size="md" />
              </div>

              <ArrowDown className="w-4 h-4 text-slate-400" />

              {/* Node 2: Gerente (部門長承認) */}
              <div className="w-full max-w-md p-3.5 rounded-md border border-emerald-300 bg-emerald-50/40 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase text-emerald-700 font-bold">
                    STEP 2 • 部門長承認 ({t('Department Manager', 'Gerente de Área')})
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    鈴木 健二 (製造・購買統括)
                  </div>
                  <div className="text-[11px] text-slate-500">承認済 • 予算枠確認完了</div>
                </div>
                <HankoStamp kanji="鈴木" size="md" />
              </div>

              <ArrowDown className="w-4 h-4 text-slate-400" />

              {/* Node 3: Executive / Finance Approval (承認待ち -> 承認済) */}
              <div
                className={`w-full max-w-md p-3.5 rounded-md border-2 flex items-center justify-between transition-all ${
                  isApproved
                    ? 'border-emerald-400 bg-emerald-50/50'
                    : 'border-amber-400 bg-amber-50/60 shadow-sm'
                }`}
              >
                <div>
                  <div
                    className={`text-[10px] font-mono uppercase font-bold ${
                      isApproved ? 'text-emerald-800' : 'text-amber-800'
                    }`}
                  >
                    STEP 3 • 最終決裁 ({t('Executive / Finance Approval', 'Aprovação Executiva / Financeiro')})
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    山田 太郎 (執行役員補佐)
                  </div>
                  <div className="text-[11px] font-semibold mt-0.5">
                    {isApproved ? (
                      <span className="text-emerald-700">✓ 承認済 (電子印鑑押印完了)</span>
                    ) : (
                      <span className="text-amber-800">● 承認待ち (Awaiting Your Approval)</span>
                    )}
                  </div>
                </div>
                {isApproved ? (
                  <HankoStamp kanji="山田" size="md" animated />
                ) : (
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-400 flex items-center justify-center text-[10px] text-amber-700 font-bold">
                    未押印
                  </div>
                )}
              </div>

              <ArrowDown className="w-4 h-4 text-slate-400" />

              {/* Node 4: Purchasing Dispatch */}
              <div
                className={`w-full max-w-md p-3.5 rounded-md border flex items-center justify-between ${
                  isApproved
                    ? 'border-blue-300 bg-blue-50/50 text-slate-900'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                <div>
                  <div className="text-[10px] font-mono uppercase font-bold">
                    STEP 4 • 購買発注・会計買掛計上 ({t('Purchasing & AP Ledger', 'Compras & Contas a Pagar')})
                  </div>
                  <div className="text-xs font-bold mt-0.5">
                    {isApproved
                      ? `✓ 発注済 (${activePr.poNumber}) • 買掛金 ¥${activePr.amount.toLocaleString()} 計上`
                      : '○ 決裁完了後に自動EDI発注・買掛金仕訳を生成'}
                  </div>
                </div>
                {isApproved && <HankoStamp kanji="購買" size="sm" animated />}
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4 border-t border-slate-200">
            {!isApproved ? (
              <button
                onClick={() => approvePurchaseRequest(activePr.id)}
                className="w-full py-3 px-4 rounded-md bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  稟議を承認して電子印鑑を押印 ({t('Approve & Stamp Hanko', 'Aprovar com Hanko Digital')})
                </span>
              </button>
            ) : (
              <button
                onClick={() => setActiveModule('dashboard')}
                className="w-full py-3 px-4 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>✓ ワークフロー完了 — 経営ダッシュボードで変化を確認</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right 3 Cols: Live System-Wide Cross-Module Impact Panel */}
        <div className="lg:col-span-3 bg-slate-900 text-white rounded-md p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                CROSS-MODULE REACTION
              </div>
              <h3 className="text-sm font-bold mt-0.5">
                基幹システム連動モニター
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {t(
                  'Approving this workflow triggers immediate updates across Accounting, Procurement, Inventory, and Executive Dashboard:',
                  'Aprovar este workflow atualiza simultaneamente Contabilidade, Compras, Estoque, Audit Log e o Dashboard:'
                )}
              </p>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 rounded bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                <span className="text-slate-300 font-sans">🔔 承認待ち件数</span>
                <span className="font-bold text-amber-300">
                  {kpis.pendingApprovalsCount} 件
                </span>
              </div>

              <div className="p-3 rounded bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                <span className="text-slate-300 font-sans">💴 買掛金残高 (AP)</span>
                <span className="font-bold text-emerald-400">
                  ¥{(kpis.accountsPayable / 1000000).toFixed(2)}M
                </span>
              </div>

              <div className="p-3 rounded bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                <span className="text-slate-300 font-sans">🛒 当月発注数 (PO)</span>
                <span className="font-bold text-white">{kpis.activePoCount} 件</span>
              </div>

              <div className="p-3 rounded bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                <span className="text-slate-300 font-sans">📦 名古屋 入荷予定</span>
                <span className="font-bold text-blue-300">
                  {isApproved ? '+80 個手配済' : '待機中'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
            <button
              onClick={() => openRecord('PARTNER', activePr.supplierId)}
              className="w-full py-2 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>取引先: {activePr.supplierNameJp}</span>
              </span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
