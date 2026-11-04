import React from 'react';
import { useKizuna } from '../../context/KizunaContext';
import { BI_MONTHLY_SERIES } from '../../data/initialErpData';
import {
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
  Bell,
  Sparkles,
  CheckCircle2,
  GitPullRequest,
  Package,
  BookOpen,
  Activity,
  Building2,
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const {
    kpis,
    currentBranchInfo,
    salesOrders,
    purchaseRequests,
    inventory,
    auditLogs,
    setActiveModule,
    setIsArDrilldownOpen,
    setSelectedPrId,
    openRecord,
    t,
  } = useKizuna();

  const fmtM = (val: number, showPlus = false) => {
    const m = val / 1000000;
    const prefix = showPlus && m > 0 ? '+' : '';
    return `¥ ${prefix}${m.toFixed(1)}M`;
  };

  const fmtM2 = (val: number) => {
    const m = val / 1000000;
    return `¥ ${m.toFixed(2)}M`;
  };

  const primaryCards = [
    {
      id: 'rev',
      labelJp: '売上高',
      labelSub: t('Sales Revenue', 'Receita de Vendas'),
      value: fmtM(kpis.revenue),
      raw: `¥${kpis.revenue.toLocaleString()}`,
      delta: '↑ 8.4% YoY',
      deltaColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      onClick: () => setActiveModule('sales'),
      hint: t('View Sales Pipeline →', 'Ver Pipeline de Vendas →'),
    },
    {
      id: 'op',
      labelJp: '営業利益',
      labelSub: t('Operating Profit', 'Lucro Operacional'),
      value: fmtM(kpis.operatingProfit),
      raw: `¥${kpis.operatingProfit.toLocaleString()}`,
      delta: '利益率 15.0%',
      deltaColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      onClick: () => setActiveModule('analytics'),
      hint: t('Management Analysis →', 'Análise Gerencial →'),
    },
    {
      id: 'inv',
      labelJp: '在庫金額',
      labelSub: t('Inventory Value', 'Valor em Estoque'),
      value: fmtM(kpis.inventoryValue),
      raw: '12,842 SKU Items',
      delta: kpis.lowStockCount > 0 ? `欠品注意 ${kpis.lowStockCount}件` : '正常稼働',
      deltaColor:
        kpis.lowStockCount > 0
          ? 'text-red-700 bg-red-50 border-red-200'
          : 'text-slate-600 bg-slate-100 border-slate-200',
      onClick: () => setActiveModule('inventory'),
      hint: t('Inspect Stock Risks →', 'Inspecionar Estoque →'),
    },
    {
      id: 'ar',
      labelJp: '未回収債権',
      labelSub: t('Accounts Receivable', 'Contas a Receber'),
      value: fmtM(kpis.accountsReceivable),
      raw: `¥${kpis.accountsReceivable.toLocaleString()}`,
      delta: '↑ 14.2%',
      deltaColor: 'text-amber-800 bg-amber-50 border-amber-300 font-bold',
      highlightRing: true,
      onClick: () => setIsArDrilldownOpen(true),
      hint: t('Click to investigate increase →', 'Clique para investigar aumento →'),
    },
    {
      id: 'backlog',
      labelJp: '受注残高',
      labelSub: t('Order Backlog', 'Carteira de Pedidos'),
      value: fmtM(kpis.backlog),
      raw: `¥${kpis.backlog.toLocaleString()}`,
      delta: '消化率 94.2%',
      deltaColor: 'text-blue-800 bg-blue-50 border-blue-200',
      onClick: () => setActiveModule('sales'),
      hint: t('Open Order Book →', 'Ver Carteira →'),
    },
    {
      id: 'cf',
      labelJp: 'キャッシュフロー',
      labelSub: t('Operating Cash Flow', 'Fluxo de Caixa'),
      value: fmtM(kpis.cashFlow, true),
      raw: `¥+${kpis.cashFlow.toLocaleString()}`,
      delta: '健全水準',
      deltaColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      onClick: () => setActiveModule('accounting'),
      hint: t('Financial Statements →', 'Demonstrações →'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>2026年10月21日 (水)</span>
            <span>•</span>
            <span>{currentBranchInfo.nameJp}</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400">
              REALTIME CONSOLIDATED LEDGER
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5 flex items-baseline gap-3">
            <span>経営ダッシュボード</span>
            <span className="text-sm font-normal text-slate-500">
              / {t('Executive Management Dashboard', 'Dashboard Executivo Integrado')}
            </span>
          </h1>
        </div>

        {/* Healthy Business Status Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-md bg-white border border-slate-200 shadow-sm flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-subtle" />
            <div className="leading-tight">
              <div className="text-xs font-bold text-slate-900">
                経営状態: 良好
              </div>
              <div className="text-[10px] text-slate-500">
                {t('Business Status: Healthy', 'Status Corporativo: Saudável')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {primaryCards.map((card) => (
          <button
            key={card.id}
            onClick={card.onClick}
            className={`group text-left p-4 rounded-md bg-white border transition-all flex flex-col justify-between ${
              card.highlightRing
                ? 'border-amber-300 hover:border-blue-700 shadow-sm ring-1 ring-amber-200/60'
                : 'border-slate-200 hover:border-blue-600 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {card.labelJp}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {card.labelSub}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${card.deltaColor}`}
                >
                  {card.delta}
                </span>
              </div>

              <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums mt-3 tracking-tight">
                {card.value}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                {card.raw}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-800 font-medium">
              <span className="truncate">{card.hint}</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>

      {/* Live Cross-Module Reaction Strip (Shows AP, Approvals, PO Count, and Audit Log changing in real time!) */}
      <div className="bg-slate-900 text-white rounded-md p-4 border border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => {
            setSelectedPrId('PR-2026-00842');
            setActiveModule('workflow');
          }}
          className="cursor-pointer hover:bg-slate-800/80 p-2.5 rounded transition-colors border border-slate-800 flex items-center justify-between"
        >
          <div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>承認待ち / {t('Pending Approvals', 'Aprovações Pendentes')}</span>
            </div>
            <div className="text-lg font-mono font-bold text-amber-300 mt-0.5 tabular-nums">
              {kpis.pendingApprovalsCount} 件
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
            ワークフロー →
          </span>
        </div>

        <div
          onClick={() => setActiveModule('accounting')}
          className="cursor-pointer hover:bg-slate-800/80 p-2.5 rounded transition-colors border border-slate-800 flex items-center justify-between"
        >
          <div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>買掛金残高 / {t('Accounts Payable', 'Contas a Pagar')}</span>
            </div>
            <div className="text-lg font-mono font-bold text-white mt-0.5 tabular-nums">
              {fmtM2(kpis.accountsPayable)}
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            ¥{kpis.accountsPayable.toLocaleString()}
          </span>
        </div>

        <div
          onClick={() => setActiveModule('procurement')}
          className="cursor-pointer hover:bg-slate-800/80 p-2.5 rounded transition-colors border border-slate-800 flex items-center justify-between"
        >
          <div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />
              <span>当月発注件数 / {t('Active POs', 'Pedidos de Compra')}</span>
            </div>
            <div className="text-lg font-mono font-bold text-white mt-0.5 tabular-nums">
              {kpis.activePoCount} 件
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">EDI 連携中</span>
        </div>

        <div
          onClick={() => setActiveModule('audit')}
          className="cursor-pointer hover:bg-slate-800/80 p-2.5 rounded transition-colors border border-slate-800 flex items-center justify-between"
        >
          <div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>監査ログ / {t('Audit Trail Events', 'Registros Audit Log')}</span>
            </div>
            <div className="text-lg font-mono font-bold text-white mt-0.5 tabular-nums">
              {auditLogs.length} 件記録済
            </div>
          </div>
          <span className="text-[10px] font-mono text-blue-300">
            最新 {auditLogs[0]?.time}
          </span>
        </div>
      </div>

      {/* Middle Row: Revenue Trend Chart + Kizuna Intelligence & Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Columns: Revenue & Operating Profit Trend */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-md p-5 shadow-sm flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-800" />
                <span>売上高・営業利益推移 (2026年度 上期実績)</span>
              </h2>
              <p className="text-xs text-slate-500">
                {t(
                  'Consolidated Monthly Revenue & Operating Profit Trend (Apr – Sep 2026)',
                  'Evolução Mensal Consolidada de Receita e Lucro Operacional (Abr – Set 2026)'
                )}
              </p>
            </div>
            <button
              onClick={() => setActiveModule('analytics')}
              className="text-xs font-semibold text-blue-800 hover:underline flex items-center gap-1"
            >
              <span>経営分析 (BI) 詳細へ</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive SVG Corporate Chart */}
          <div className="pt-2">
            <div className="grid grid-cols-6 gap-3 items-end h-44 pt-6 px-2 border-b border-slate-200 bg-slate-50/50 rounded-t">
              {BI_MONTHLY_SERIES.map((pt, idx) => {
                const isSep = idx === BI_MONTHLY_SERIES.length - 1;
                const revVal = isSep ? kpis.revenue / 1000000 : pt.revenueM;
                const heightPct = Math.min(100, Math.round((revVal / 310) * 100));
                const profitPct = Math.min(100, Math.round((pt.operatingProfitM / 310) * 100));

                return (
                  <div
                    key={pt.month}
                    onClick={() => setActiveModule('analytics')}
                    className="group cursor-pointer flex flex-col items-center h-full justify-end"
                  >
                    <div className="text-[10px] font-mono font-semibold text-slate-700 mb-1">
                      ¥{revVal.toFixed(1)}M
                    </div>
                    <div className="w-full max-w-[44px] flex items-end justify-center gap-1 h-32">
                      <div
                        className={`w-6 rounded-t transition-all ${
                          isSep
                            ? 'bg-blue-900 group-hover:bg-blue-800'
                            : 'bg-slate-700 group-hover:bg-blue-700'
                        }`}
                        style={{ height: `${heightPct}%` }}
                        title={`売上高: ¥${revVal.toFixed(1)}M`}
                      />
                      <div
                        className="w-3 rounded-t bg-emerald-600/85"
                        style={{ height: `${profitPct * 2.2}%` }}
                        title={`営業利益: ¥${pt.operatingProfitM.toFixed(1)}M`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-6 gap-3 pt-2 text-center text-xs text-slate-600 font-mono">
              {BI_MONTHLY_SERIES.map((pt) => (
                <div key={pt.month}>
                  <span className="font-semibold text-slate-800">{pt.month}</span>{' '}
                  <span className="text-[10px] text-slate-400">({pt.monthJp})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-900 inline-block" />
                <span>売上高 (Sales Revenue)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
                <span>営業利益 (Operating Profit)</span>
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-600">
              予算達成率: <strong>104.6%</strong> (対予算 +¥12.6M)
            </span>
          </div>
        </div>

        {/* Right Column: Kizuna Intelligence (経営インサイト) */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-800" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Kizuna Intelligence
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    経営インサイト / {t('Executive Operational Insights', 'Insights Operacionais')}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                AI 監視中
              </span>
            </div>

            <div className="space-y-3 pt-3 text-xs">
              <div
                onClick={() => setIsArDrilldownOpen(true)}
                className="p-3 rounded border border-slate-200 hover:border-blue-500 bg-slate-50/70 cursor-pointer transition-colors"
              >
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>1. 売上は前月比 8.4% 増加・売掛金変動</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-800" />
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  {t(
                    'Sales grew +8.4% MoM. Accounts Receivable rose to ¥12.7M (+14.2%) due to Yamada Corp (#SO-2026-10482 ¥8.42M).',
                    'Vendas cresceram +8,4% no mês. Contas a Receber subiu para ¥12,7M (+14,2%) devido ao pedido #SO-2026-10482 (株式会社山田).'
                  )}
                </p>
              </div>

              <div
                onClick={() => setActiveModule('inventory')}
                className="p-3 rounded border border-slate-200 hover:border-red-400 bg-red-50/30 cursor-pointer transition-colors"
              >
                <div className="font-bold text-red-900 flex items-center justify-between">
                  <span>2. 在庫回転率が大阪・名古屋支社で低下 / 欠品リスク</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  {t(
                    'Inventory turnover slowed in Osaka (KZ-00291 low stock) and Nagoya (KZ-00882 Component C out of stock).',
                    'Giro de estoque caiu em Osaka (KZ-00291) e Nagoya (KZ-00882 Componente C sem estoque).'
                  )}
                </p>
              </div>

              <div
                onClick={() => {
                  setSelectedPrId('PR-2026-00842');
                  setActiveModule('workflow');
                }}
                className="p-3 rounded border border-amber-200 hover:border-amber-400 bg-amber-50/40 cursor-pointer transition-colors"
              >
                <div className="font-bold text-amber-950 flex items-center justify-between">
                  <span>3. {kpis.pendingApprovalsCount}件の発注稟議が承認待ちです</span>
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  {t(
                    'Purchase Request #PR-2026-00842 (Toyota Tsusho, ¥2,840,000) awaits final Ringi stamp.',
                    'Requisição #PR-2026-00842 (Toyota Tsusho, ¥2.840.000) aguarda carimbo final de aprovação.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Inventory Attention + Workflow Approvals + Recent Sales Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Inventory Summary Card */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-700" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    📦 在庫管理サマリー / {t('Inventory Status', 'Resumo de Estoque')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    総アイテム数: 12,842 items • 評価額 {fmtM(kpis.inventoryValue)}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                🔴 欠品リスク {kpis.lowStockCount}件
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2 text-xs">
              {inventory.slice(0, 3).map((item) => (
                <div
                  key={item.code}
                  onClick={() => setActiveModule('inventory')}
                  className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-1 rounded"
                >
                  <div>
                    <div className="font-mono font-bold text-slate-800">
                      {item.code}{' '}
                      <span className="font-sans font-semibold text-slate-900">
                        {item.nameJp}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      倉庫: {item.warehouseJp} | 最低在庫: {item.minStock}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900">
                      {item.stock} 個
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        item.status === 'NORMAL'
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.status === 'WARNING'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status === 'NORMAL'
                        ? '正常'
                        : item.status === 'WARNING'
                        ? '注意'
                        : '欠品'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveModule('inventory')}
            className="mt-3 w-full py-2 rounded border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
          >
            リアルタイム在庫一覧を開く →
          </button>
        </div>

        {/* 2. Pending Ringi Approvals Card */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    🔔 ワークフロー承認待ち / {t('Pending Approvals', 'Aprovações Ringi')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {kpis.pendingApprovalsCount} pending requests • 合計 ¥4.64M
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                {kpis.pendingApprovalsCount}件
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2 text-xs">
              {purchaseRequests.map((pr) => (
                <div
                  key={pr.id}
                  onClick={() => {
                    setSelectedPrId(pr.id);
                    setActiveModule('workflow');
                  }}
                  className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-blue-50/40 px-1 rounded"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-blue-900">{pr.id}</span>
                      <span className="font-semibold text-slate-900 truncate">
                        {pr.supplierNameJp}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      申請: {pr.requesterJp} ({pr.departmentJp})
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-slate-900 tabular-nums">
                      ¥{pr.amount.toLocaleString()}
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        pr.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {pr.statusJp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedPrId('PR-2026-00842');
              setActiveModule('workflow');
            }}
            className="mt-3 w-full py-2 rounded bg-slate-900 hover:bg-blue-900 text-white text-xs font-semibold transition-colors"
          >
            稟議・ワークフロー決裁画面へ →
          </button>
        </div>

        {/* 3. Key Sales Orders & Customer 360° Traceability */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-800" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    💼 主要受注・売掛トレース / {t('Key Sales Orders', 'Principais Pedidos')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    クリックで注文・顧客360°・会計仕訳へ展開
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-2 text-xs">
              {salesOrders.slice(0, 3).map((so) => (
                <div
                  key={so.id}
                  onClick={() => openRecord('SO', so.id)}
                  className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-blue-50/40 px-1 rounded"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-blue-900">{so.id}</span>
                      <span className="font-semibold text-slate-900 truncate">
                        {so.partnerNameJp}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      請求: {so.invoiceId} • {so.itemsSummaryJp}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-slate-900 tabular-nums">
                      ¥{so.amount.toLocaleString()}
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-semibold">
                      {so.statusJp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveModule('sales')}
            className="mt-3 w-full py-2 rounded border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
          >
            販売管理パイプラインを開く →
          </button>
        </div>
      </div>
    </div>
  );
};
