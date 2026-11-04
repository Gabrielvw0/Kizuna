import React, { useState } from 'react';
import { useKizuna } from '../../context/KizunaContext';
import { BI_MONTHLY_SERIES } from '../../data/initialErpData';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ArrowUpRight,
  Calendar,
  Building2,
  Sliders,
  Download,
  Sparkles,
  Layers,
  Activity,
} from 'lucide-react';

export const BiAnalytics: React.FC = () => {
  const {
    currentBranchInfo,
    kpis,
    setIsArDrilldownOpen,
    setActiveModule,
    openRecord,
    recordCustomAction,
    t,
    subLang,
  } = useKizuna();

  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(5); // Sep default
  const [mainChartMode, setMainChartMode] = useState<'COMBO' | 'WATERFALL' | 'HEATMAP'>('COMBO');
  const [showYoY, setShowYoY] = useState<boolean>(true);
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number>(0);
  const [radarBranch, setRadarBranch] = useState<'TOKYO' | 'OSAKA' | 'NAGOYA' | 'FUKUOKA'>('TOKYO');

  // What-If Simulator Sliders
  const [fxRate, setFxRate] = useState<number>(152);
  const [growthRate, setGrowthRate] = useState<number>(8);
  const [costDelta, setCostDelta] = useState<number>(-2);

  const mult = currentBranchInfo.multiplier;
  const pt = BI_MONTHLY_SERIES[selectedMonthIdx];
  const isSep = selectedMonthIdx === 5;

  const activeRevenueM = isSep ? kpis.revenue / 1000000 : pt.revenueM * mult;
  const activeProfitM = isSep ? kpis.operatingProfit / 1000000 : pt.operatingProfitM * mult;
  const activeBudgetM = pt.budgetM * mult;
  const activeArM = isSep ? kpis.accountsReceivable / 1000000 : pt.arM * mult;
  const activeApM = isSep ? kpis.accountsPayable / 1000000 : pt.apM * mult;
  const activeCfM = pt.cashFlowM * mult;
  const budgetAttainment = ((activeRevenueM / activeBudgetM) * 100).toFixed(1);

  const productSegments = [
    {
      code: 'KZ-500',
      nameJp: '製品 KZ-500 統合制御ユニット',
      nameEn: 'KZ-500 Control Unit',
      share: 52,
      color: '#1E3A8A',
      stroke: '#1E3A8A',
      margin: '18.4%',
      topClient: '株式会社山田',
      orderId: 'SO-2026-10482',
    },
    {
      code: 'KZ-200',
      nameJp: 'サーボアクチュエータ KZ-200',
      nameEn: 'Servo Actuator KZ-200',
      share: 24,
      color: '#059669',
      stroke: '#059669',
      margin: '14.2%',
      topClient: '関西精密工業株式会社',
      orderId: 'SO-2026-10460',
    },
    {
      code: 'KZ-124',
      nameJp: '高精度センサーモジュール A',
      nameEn: 'High-Precision Sensor A',
      share: 15,
      color: '#D97706',
      stroke: '#D97706',
      margin: '12.8%',
      topClient: '株式会社 Kizuna Trading',
      orderId: 'SO-2026-10475',
    },
    {
      code: 'KZ-SLA',
      nameJp: '年間保守・キャリブレーション',
      nameEn: 'Annual SLA & Calibration',
      share: 9,
      color: '#475569',
      stroke: '#475569',
      margin: '26.5%',
      topClient: '全社継続契約',
      orderId: 'SO-2026-10482',
    },
  ];

  const activeSeg = productSegments[selectedSegmentIdx];

  // Radar Chart Scores (5 axes: 収益性, 在庫回転, 債権回収, 予算達成, 納期遵守)
  const radarData: Record<
    'TOKYO' | 'OSAKA' | 'NAGOYA' | 'FUKUOKA',
    { labelJp: string; scores: [number, number, number, number, number]; summaryJp: string }
  > = {
    TOKYO: {
      labelJp: '東京本社',
      scores: [94, 88, 82, 96, 95],
      summaryJp: '大口受注 (#SO-2026-10482) により予算達成率96pt・収益性94ptと高水準。',
    },
    OSAKA: {
      labelJp: '大阪支社',
      scores: [86, 68, 90, 88, 91],
      summaryJp: '部品 B (KZ-00291) の安全在庫低下により在庫回転スコアが68ptへ低下。',
    },
    NAGOYA: {
      labelJp: '名古屋支社',
      scores: [89, 58, 92, 91, 84],
      summaryJp: '部品 C (KZ-00882) 欠品の影響で在庫指標が58pt。稟議 #PR-2026-00842 決裁で回復。',
    },
    FUKUOKA: {
      labelJp: '福岡支社',
      scores: [82, 85, 94, 86, 92],
      summaryJp: '九州ロジスティクス幹線網により納期遵守率92pt・債権回収94ptと安定推移。',
    },
  };

  // Helper to compute SVG Radar polygon points
  const getRadarPoints = (scores: number[]) => {
    const cx = 110;
    const cy = 105;
    const maxR = 72;
    return scores
      .map((sc, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const r = (sc / 100) * maxR;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Simulated Q4 projection from sliders
  const simQ4RevM = (
    activeRevenueM *
    3 *
    (1 + growthRate / 100) *
    (1 + (fxRate - 150) * 0.004)
  ).toFixed(1);
  const simQ4ProfitM = (
    Number(simQ4RevM) *
    ((pt.marginPct - costDelta * 0.35 + (fxRate - 150) * 0.08) / 100)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span>BI・多次元経営分析エンジン (OLAP Cube)</span>
            <span>•</span>
            <span>対象拠点: {currentBranchInfo.nameJp}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-3">
            <span>「経営分析」</span>
            <span className="text-sm font-normal text-slate-500">
              / {t('Interactive Management Analytics & BI', 'Business Intelligence & Análise Interativa')}
            </span>
          </h1>
        </div>

        {/* Month Selector + Export Action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 px-2 flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-800" />
              <span>月度:</span>
            </span>
            {BI_MONTHLY_SERIES.map((m, idx) => (
              <button
                key={m.month}
                onClick={() => setSelectedMonthIdx(idx)}
                className={`px-2.5 py-1.5 rounded text-xs font-mono transition-all ${
                  selectedMonthIdx === idx
                    ? 'bg-slate-900 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {m.month} ({m.monthJp})
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              recordCustomAction(
                `経営分析レポート (${pt.monthJp}度・${currentBranchInfo.nameJp}) 出力完了`,
                '取締役会報告用 PDF / Excel ピボットデータを生成しました',
                'BI-REPORT-2026',
                'BI Report Exported'
              )
            }
            className="px-3 py-2 rounded-md bg-slate-900 hover:bg-blue-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>レポート出力</span>
          </button>
        </div>
      </div>

      {/* 6 Interactive KPI Cards (Every card has a click action!) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <button
          onClick={() => setMainChartMode('COMBO')}
          className="text-left bg-white hover:border-blue-600 border border-slate-200 rounded-md p-4 shadow-sm transition-all"
        >
          <div className="text-xs font-bold text-slate-700">月次売上高 ({pt.monthJp})</div>
          <div className="text-[10px] text-slate-400">{t('Monthly Revenue', 'Receita Mensal')}</div>
          <div className="text-2xl font-mono font-bold text-slate-900 mt-2 tabular-nums">
            ¥{activeRevenueM.toFixed(1)}M
          </div>
          <div className="text-[11px] font-mono text-emerald-700 mt-1">
            YoY +{pt.yoyGrowthPct}% • 推移表示
          </div>
        </button>

        <button
          onClick={() => setMainChartMode('HEATMAP')}
          className="text-left bg-white hover:border-blue-600 border border-slate-200 rounded-md p-4 shadow-sm transition-all"
        >
          <div className="text-xs font-bold text-slate-700">営業利益 ({pt.monthJp})</div>
          <div className="text-[10px] text-slate-400">{t('Operating Profit', 'Lucro Operacional')}</div>
          <div className="text-2xl font-mono font-bold text-slate-900 mt-2 tabular-nums">
            ¥{activeProfitM.toFixed(1)}M
          </div>
          <div className="text-[11px] font-mono text-emerald-700 mt-1">
            利益率 {pt.marginPct.toFixed(1)}% • 部門分析
          </div>
        </button>

        <button
          onClick={() => setShowYoY((prev) => !prev)}
          className="text-left bg-white hover:border-blue-600 border border-slate-200 rounded-md p-4 shadow-sm transition-all"
        >
          <div className="text-xs font-bold text-slate-700">予算対比 (予実管理)</div>
          <div className="text-[10px] text-slate-400">{t('Budget vs Actual', 'Orçado × Realizado')}</div>
          <div className="text-2xl font-mono font-bold text-blue-900 mt-2 tabular-nums">
            {budgetAttainment}%
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-1">
            予算: ¥{activeBudgetM.toFixed(1)}M
          </div>
        </button>

        <button
          onClick={() => setIsArDrilldownOpen(true)}
          className="text-left bg-white border border-amber-300 hover:border-blue-600 cursor-pointer rounded-md p-4 shadow-sm transition-colors"
        >
          <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>売掛金残高</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-800" />
          </div>
          <div className="text-[10px] text-slate-400">{t('Accounts Receivable', 'Contas a Receber')}</div>
          <div className="text-2xl font-mono font-bold text-slate-900 mt-2 tabular-nums">
            ¥{activeArM.toFixed(2)}M
          </div>
          <div className="text-[11px] font-mono text-amber-800 mt-1 font-semibold">
            クリックで内訳ドリルダウン →
          </div>
        </button>

        <button
          onClick={() => setActiveModule('accounting')}
          className="text-left bg-white hover:border-blue-600 border border-slate-200 rounded-md p-4 shadow-sm transition-all"
        >
          <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>買掛金残高</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-[10px] text-slate-400">{t('Accounts Payable', 'Contas a Pagar')}</div>
          <div className="text-2xl font-mono font-bold text-slate-900 mt-2 tabular-nums">
            ¥{activeApM.toFixed(2)}M
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-1">
            仕訳元帳を確認 →
          </div>
        </button>

        <button
          onClick={() => setMainChartMode('WATERFALL')}
          className="text-left bg-white hover:border-emerald-600 border border-slate-200 rounded-md p-4 shadow-sm transition-all"
        >
          <div className="text-xs font-bold text-slate-700">フリーCF予測</div>
          <div className="text-[10px] text-slate-400">{t('Cash Flow Bridge', 'Fluxo de Caixa')}</div>
          <div className="text-2xl font-mono font-bold text-emerald-800 mt-2 tabular-nums">
            +¥{activeCfM.toFixed(1)}M
          </div>
          <div className="text-[11px] font-mono text-emerald-700 mt-1">
            CF滝チャートを表示 →
          </div>
        </button>
      </div>

      {/* MAIN INTERACTIVE CHART CANVAS WITH 3 VISUALIZATION MODES */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-800" />
              <span>
                {mainChartMode === 'COMBO' &&
                  '売上高・予算対比・営業利益率 複合トレンド (Apr – Sep 2026)'}
                {mainChartMode === 'WATERFALL' &&
                  `キャッシュフロー増減ウォーターフォール分析 (${pt.monthJp}度)`}
                {mainChartMode === 'HEATMAP' &&
                  '部門別 × 月次 収益マトリクス・ヒートマップ (単位: 百万円)'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {pt.monthJp}インサイト: {subLang === 'EN' ? pt.insightEn : pt.insightPt}
            </p>
          </div>

          {/* Chart Type Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded border border-slate-200 text-xs">
            <button
              onClick={() => setMainChartMode('COMBO')}
              className={`px-3 py-1 rounded font-semibold transition-all ${
                mainChartMode === 'COMBO'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📊 予実・利益率複合
            </button>
            <button
              onClick={() => setMainChartMode('WATERFALL')}
              className={`px-3 py-1 rounded font-semibold transition-all ${
                mainChartMode === 'WATERFALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌊 キャッシュフロー滝グラフ
            </button>
            <button
              onClick={() => setMainChartMode('HEATMAP')}
              className={`px-3 py-1 rounded font-semibold transition-all ${
                mainChartMode === 'HEATMAP'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟦 部門×月次ヒートマップ
            </button>
          </div>
        </div>

        {/* MODE 1: COMBO BAR + SVG TREND LINE */}
        {mainChartMode === 'COMBO' && (
          <div>
            <div className="flex items-center justify-between text-xs px-2 mb-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-blue-900 inline-block" />
                  <span>実績売上高 (Actual)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-slate-300 inline-block" />
                  <span>予算目標 (Budget)</span>
                </span>
                {showYoY && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
                    <span>営業利益 (Profit)</span>
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowYoY((prev) => !prev)}
                className="text-[11px] font-mono px-2.5 py-0.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700"
              >
                {showYoY ? '✓ 営業利益バー表示中' : '+ 営業利益バーを表示'}
              </button>
            </div>

            <div className="grid grid-cols-6 gap-4 items-end h-56 pt-8 px-4 border-b border-slate-200 bg-slate-50/50 rounded-t relative">
              {BI_MONTHLY_SERIES.map((item, idx) => {
                const isSelected = selectedMonthIdx === idx;
                const valM = idx === 5 ? kpis.revenue / 1000000 : item.revenueM * mult;
                const budM = item.budgetM * mult;
                const profM = item.operatingProfitM * mult;
                const barH = Math.min(100, Math.round((valM / (310 * mult)) * 100));
                const budH = Math.min(100, Math.round((budM / (310 * mult)) * 100));
                const profH = Math.min(100, Math.round((profM / (310 * mult)) * 220));

                return (
                  <button
                    key={item.month}
                    onClick={() => setSelectedMonthIdx(idx)}
                    className={`group flex flex-col items-center justify-end h-full p-2 rounded-t transition-all ${
                      isSelected
                        ? 'bg-blue-50/90 ring-1 ring-blue-400'
                        : 'hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-emerald-800 mb-1 shadow-sm">
                      利益率 {item.marginPct}%
                    </div>
                    <div
                      className={`text-xs font-mono font-bold mb-1.5 ${
                        isSelected ? 'text-blue-950' : 'text-slate-700'
                      }`}
                    >
                      ¥{valM.toFixed(1)}M
                    </div>
                    <div className="w-full flex items-end justify-center gap-1.5 h-32">
                      <div
                        className="w-3.5 bg-slate-300 rounded-t transition-all"
                        style={{ height: `${budH}%` }}
                        title={`予算: ¥${budM.toFixed(1)}M`}
                      />
                      <div
                        className={`w-7 rounded-t transition-all ${
                          isSelected
                            ? 'bg-blue-900 shadow-md'
                            : 'bg-slate-700 group-hover:bg-blue-700'
                        }`}
                        style={{ height: `${barH}%` }}
                        title={`実績: ¥${valM.toFixed(1)}M`}
                      />
                      {showYoY && (
                        <div
                          className="w-3.5 bg-emerald-600 rounded-t transition-all"
                          style={{ height: `${profH}%` }}
                          title={`営業利益: ¥${profM.toFixed(1)}M`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-6 gap-4 pt-2.5 text-center text-xs font-mono">
              {BI_MONTHLY_SERIES.map((item, idx) => (
                <button
                  key={item.month}
                  onClick={() => setSelectedMonthIdx(idx)}
                  className={`py-1 rounded transition-colors ${
                    selectedMonthIdx === idx
                      ? 'font-bold text-white bg-slate-900'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.month} ({item.monthJp})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODE 2: CASH FLOW WATERFALL CHART */}
        {mainChartMode === 'WATERFALL' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-6 gap-4 items-end h-56 pt-8 px-4 border-b border-slate-200 bg-slate-50/50 rounded-t">
              {[
                {
                  labelJp: '期首資金残高',
                  sub: 'Opening Cash',
                  val: '+¥124.2M',
                  h: 65,
                  color: 'bg-slate-700',
                  desc: '前月末繰越 現預金残高',
                },
                {
                  labelJp: '営業CF収入',
                  sub: 'Operating Inflow',
                  val: `+¥${(activeProfitM * 1.15).toFixed(1)}M`,
                  h: 88,
                  color: 'bg-emerald-600',
                  desc: '税引前利益 + 減価償却費',
                },
                {
                  labelJp: '売掛債権増減',
                  sub: 'AR Working Cap',
                  val: `-¥${(activeArM * 0.65).toFixed(1)}M`,
                  h: 72,
                  color: 'bg-amber-500',
                  desc: '株式会社山田 (#SO-2026-10482) 売掛計上分',
                },
                {
                  labelJp: '在庫・買掛増減',
                  sub: 'Inventory / AP',
                  val: '-¥6.4M',
                  h: 62,
                  color: 'bg-amber-600',
                  desc: '部材調達・安全在庫積み増し',
                },
                {
                  labelJp: '設備・DX投資',
                  sub: 'CAPEX Investment',
                  val: '-¥8.2M',
                  h: 52,
                  color: 'bg-red-600',
                  desc: '名古屋工場 自動化ライン設備投資',
                },
                {
                  labelJp: '期末現預金残高',
                  sub: 'Ending Cash',
                  val: `+¥${(124.2 + activeCfM).toFixed(1)}M`,
                  h: 82,
                  color: 'bg-blue-900',
                  desc: '当月末予測 最終現預金残高',
                },
              ].map((step) => (
                <button
                  key={step.labelJp}
                  onClick={() =>
                    recordCustomAction(
                      `キャッシュフロー内訳照会: ${step.labelJp} (${step.val})`,
                      step.desc,
                      'CF-BRIDGE'
                    )
                  }
                  className="group flex flex-col items-center justify-end h-full p-2 rounded hover:bg-white transition-all"
                >
                  <div className="text-xs font-mono font-bold text-slate-900 mb-1.5">
                    {step.val}
                  </div>
                  <div
                    className={`w-12 rounded-t ${step.color} group-hover:opacity-90 transition-all shadow-sm`}
                    style={{ height: `${step.h}%` }}
                  />
                  <div className="text-[11px] font-bold text-slate-800 mt-2">
                    {step.labelJp}
                  </div>
                  <div className="text-[9px] text-slate-400">{step.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODE 3: DEPARTMENT × MONTH PROFITABILITY HEATMAP */}
        {mainChartMode === 'HEATMAP' && (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-semibold">事業部門 / Division</th>
                  {BI_MONTHLY_SERIES.map((m, idx) => (
                    <th key={m.month} className="py-2.5 px-3 font-mono text-center">
                      <button
                        onClick={() => setSelectedMonthIdx(idx)}
                        className="hover:underline font-bold"
                      >
                        {m.month} ({m.monthJp})
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { name: '営業第一部 (東京エンタープライズ)', factor: 0.44 },
                  { name: '産業機械・FAシステム事業部', factor: 0.31 },
                  { name: '保守・エンジニアリングSLA部', factor: 0.16 },
                  { name: '海外・ECソリューション事業部', factor: 0.09 },
                ].map((dept) => (
                  <tr key={dept.name}>
                    <td className="py-3 px-3 font-bold text-slate-800 bg-slate-50">
                      {dept.name}
                    </td>
                    {BI_MONTHLY_SERIES.map((m, mIdx) => {
                      const cellVal = (m.revenueM * mult * dept.factor).toFixed(1);
                      const intensity =
                        Number(cellVal) > 100
                          ? 'bg-blue-900 text-white font-bold'
                          : Number(cellVal) > 65
                          ? 'bg-blue-700 text-white font-semibold'
                          : Number(cellVal) > 35
                          ? 'bg-blue-100 text-blue-950 font-semibold'
                          : 'bg-slate-50 text-slate-700';

                      return (
                        <td key={m.month} className="p-1.5 text-center font-mono">
                          <button
                            onClick={() => {
                              setSelectedMonthIdx(mIdx);
                              recordCustomAction(
                                `部門別ドリルダウン: ${dept.name} (${m.monthJp})`,
                                `実績売上高 ¥${cellVal}M • 利益貢献度正常`,
                                'BI-MATRIX'
                              );
                            }}
                            className={`w-full py-2 px-2 rounded transition-transform hover:scale-[1.03] ${intensity}`}
                          >
                            ¥{cellVal}M
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LOWER 3-COLUMN INTERACTIVE ANALYTICS SUITE: DONUT + RADAR + WHAT-IF SIMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Interactive SVG Donut Chart (製品セグメント構成比) */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-blue-800" />
              <span>製品セグメント別 ドーナツ分析 ({pt.monthJp})</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">CLICK TO INSPECT</span>
          </div>

          <div className="flex items-center gap-4">
            {/* SVG Ring Chart */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#E2E8F0"
                  strokeWidth="3.8"
                />
                {(() => {
                  let accum = 0;
                  return productSegments.map((seg, idx) => {
                    const dash = `${seg.share} ${100 - seg.share}`;
                    const offset = 100 - accum;
                    accum += seg.share;
                    const isSel = idx === selectedSegmentIdx;
                    return (
                      <circle
                        key={seg.code}
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke={seg.stroke}
                        strokeWidth={isSel ? '4.8' : '3.6'}
                        strokeDasharray={dash}
                        strokeDashoffset={offset}
                        className="cursor-pointer transition-all"
                        onClick={() => setSelectedSegmentIdx(idx)}
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] font-mono font-bold text-blue-900">
                  {activeSeg.code}
                </span>
                <span className="text-lg font-mono font-bold text-slate-900">
                  {activeSeg.share}%
                </span>
                <span className="text-[9px] text-emerald-700 font-mono">
                  利益率 {activeSeg.margin}
                </span>
              </div>
            </div>

            {/* Interactive Segment Selector List */}
            <div className="flex-1 space-y-1.5 text-xs">
              {productSegments.map((seg, idx) => (
                <button
                  key={seg.code}
                  onClick={() => setSelectedSegmentIdx(idx)}
                  className={`w-full p-2 rounded border text-left transition-all flex items-center justify-between ${
                    selectedSegmentIdx === idx
                      ? 'bg-blue-50/80 border-blue-500 font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="truncate">{seg.nameJp}</span>
                  </div>
                  <span className="font-mono text-slate-900 ml-1">
                    ¥{((activeRevenueM * seg.share) / 100).toFixed(1)}M
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Segment Drill-down Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              主要取引先: <strong className="text-slate-800">{activeSeg.topClient}</strong>
            </span>
            <button
              onClick={() => openRecord('SO', activeSeg.orderId)}
              className="text-blue-800 font-semibold hover:underline flex items-center gap-1"
            >
              <span>代表受注 ({activeSeg.orderId}) を開く</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Interactive Multi-Axis Radar / Spider Chart (拠点別5軸経営健全性) */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-700" />
              <span>拠点別 5軸経営健全性レーダー</span>
            </h3>
            <div className="flex items-center gap-1 text-[10px] font-mono">
              {(['TOKYO', 'OSAKA', 'NAGOYA', 'FUKUOKA'] as const).map((bKey) => (
                <button
                  key={bKey}
                  onClick={() => setRadarBranch(bKey)}
                  className={`px-1.5 py-0.5 rounded ${
                    radarBranch === bKey
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {bKey.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Radar Chart */}
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 220 205" className="w-56 h-48">
              {/* Background Concentric Pentagons */}
              {[0.35, 0.68, 1.0].map((scale, sIdx) => {
                const pts = [0, 1, 2, 3, 4]
                  .map((i) => {
                    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                    const r = 72 * scale;
                    return `${(110 + r * Math.cos(angle)).toFixed(1)},${(
                      105 +
                      r * Math.sin(angle)
                    ).toFixed(1)}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={sIdx}
                    points={pts}
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="0.8"
                    strokeDasharray={sIdx < 2 ? '2 2' : undefined}
                  />
                );
              })}

              {/* Axis Spokes & Labels */}
              {[
                { label: '収益性', x: 110, y: 20 },
                { label: '在庫回転', x: 196, y: 78 },
                { label: '債権回収', x: 168, y: 184 },
                { label: '納期遵守', x: 52, y: 184 },
                { label: '予算達成', x: 24, y: 78 },
              ].map((ax, i) => {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const x2 = 110 + 72 * Math.cos(angle);
                const y2 = 105 + 72 * Math.sin(angle);
                return (
                  <g key={ax.label}>
                    <line
                      x1="110"
                      y1="105"
                      x2={x2}
                      y2={y2}
                      stroke="#E2E8F0"
                      strokeWidth="1"
                    />
                    <text
                      x={ax.x}
                      y={ax.y}
                      textAnchor="middle"
                      className="text-[9px] fill-slate-600 font-semibold"
                    >
                      {ax.label} ({radarData[radarBranch].scores[i]})
                    </text>
                  </g>
                );
              })}

              {/* Active Branch Radar Polygon */}
              <polygon
                points={getRadarPoints(radarData[radarBranch].scores)}
                fill="rgba(30, 58, 138, 0.25)"
                stroke="#1E3A8A"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <strong className="text-slate-900">{radarData[radarBranch].labelJp}:</strong>{' '}
            {radarData[radarBranch].summaryJp}
          </div>
        </div>

        {/* 3. Interactive What-If Scenario Simulator (経営シミュレーション) */}
        <div className="bg-slate-900 text-white rounded-md p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  第4四半期 (Q4) 感度シミュレーション
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">WHAT-IF ENGINE</span>
            </div>

            {/* Sliders */}
            <div className="space-y-3 pt-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">想定為替レート (USD/JPY)</span>
                  <span className="font-mono font-bold text-blue-300">¥{fxRate}.00</span>
                </div>
                <input
                  type="range"
                  min={135}
                  max={165}
                  value={fxRate}
                  onChange={(e) => setFxRate(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">受注成長率変動 (Order Growth)</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {growthRate >= 0 ? `+${growthRate}%` : `${growthRate}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-5}
                  max={20}
                  value={growthRate}
                  onChange={(e) => setGrowthRate(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">部材調達原価変動 (Material Cost)</span>
                  <span className="font-mono font-bold text-amber-300">
                    {costDelta >= 0 ? `+${costDelta}%` : `${costDelta}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-10}
                  max={15}
                  value={costDelta}
                  onChange={(e) => setCostDelta(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Real-time Simulated Output Box */}
          <div className="p-3 rounded bg-slate-950/90 border border-slate-800 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-[10px] text-slate-400">Q4 予測売上高合計</div>
                <div className="text-base font-mono font-bold text-white tabular-nums">
                  ¥{simQ4RevM}M
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Q4 予測営業利益</div>
                <div className="text-base font-mono font-bold text-emerald-400 tabular-nums">
                  ¥{simQ4ProfitM}M
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                recordCustomAction(
                  'Q4 経営シミュレーション試算を中期経営計画へ保存',
                  `為替 ¥${fxRate}/USD • 成長率 +${growthRate}% • 予測売上 ¥${simQ4RevM}M / 営業利益 ¥${simQ4ProfitM}M`,
                  'SIM-Q4-2026',
                  `予測利益 ¥${simQ4ProfitM}M 保存済`
                )
              }
              className="w-full py-2 rounded bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold transition-colors"
            >
              試算シナリオを経営計画へ登録
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
