import React, { useState } from 'react';
import { useKizuna } from '../../context/KizunaContext';
import {
  Sparkles,
  Send,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Cpu,
  ShieldCheck,
  Zap,
  BookOpen,
  GitPullRequest,
  Package,
  Building2,
} from 'lucide-react';

interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  timestamp: string;
  textJp: string;
  textSub: string;
  metrics?: { label: string; value: string; delta?: string }[];
  actions?: {
    labelJp: string;
    labelSub: string;
    onClickType: 'OPEN_YAMADA' | 'SYNC_SO' | 'APPROVE_PR' | 'REPLENISH_C' | 'OPEN_BI';
  }[];
}

export const AiIntelligenceModule: React.FC = () => {
  const {
    kpis,
    currentBranchInfo,
    openRecord,
    syncOrderToAccounting,
    approvePurchaseRequest,
    triggerReplenishment,
    setActiveModule,
    recordCustomAction,
    t,
  } = useKizuna();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      timestamp: '10:40:00',
      textJp:
        'おはようございます、山田部長。Kizuna Intelligence（統合基幹AI参謀）が2026年10月21日現在の全社データ（東京・大阪・名古屋・福岡）をリアルタイム解析しました。現在、重要インサイトが3件検出されています。',
      textSub: t(
        'Good morning, Director Yamada. Kizuna Intelligence has analyzed real-time consolidated ERP data across Tokyo, Osaka, Nagoya, and Fukuoka. Three priority executive insights require your attention.',
        'Bom dia, Diretor Yamada. O Kizuna Intelligence analisou em tempo real os dados consolidados de Tóquio, Osaka, Nagoya e Fukuoka. Três insights executivos prioritários foram detectados.'
      ),
      metrics: [
        { label: '売上高予測達成率', value: '104.6%', delta: '前月比 +8.4%' },
        { label: '売掛債権変動 (AR)', value: `¥${(kpis.accountsReceivable / 1000000).toFixed(2)}M`, delta: '↑ 14.2%' },
        { label: '在庫欠品リスク', value: `${kpis.lowStockCount} 品目`, delta: '名古屋 部品C' },
        { label: '承認待ち稟議', value: `${kpis.pendingApprovalsCount} 件`, delta: 'PR-2026-00842' },
      ],
      actions: [
        {
          labelJp: '株式会社山田 (360° 調査)',
          labelSub: t('Inspect Yamada Corp', 'Inspecionar Yamada Corp'),
          onClickType: 'OPEN_YAMADA',
        },
        {
          labelJp: '稟議 #PR-2026-00842 を即時決裁',
          labelSub: t('Approve PR-2026-00842', 'Aprovar PR-2026-00842'),
          onClickType: 'APPROVE_PR',
        },
        {
          labelJp: '部品 C (KZ-00882) 緊急補充',
          labelSub: t('Replenish Component C', 'Repor Componente C'),
          onClickType: 'REPLENISH_C',
        },
      ],
    },
  ]);

  const executeChatAction = (
    type: 'OPEN_YAMADA' | 'SYNC_SO' | 'APPROVE_PR' | 'REPLENISH_C' | 'OPEN_BI'
  ) => {
    if (type === 'OPEN_YAMADA') {
      openRecord('PARTNER', 'PTN-001');
    } else if (type === 'SYNC_SO') {
      syncOrderToAccounting('SO-2026-10482');
    } else if (type === 'APPROVE_PR') {
      approvePurchaseRequest('PR-2026-00842');
    } else if (type === 'REPLENISH_C') {
      triggerReplenishment('KZ-00882');
    } else if (type === 'OPEN_BI') {
      setActiveModule('analytics');
    }
  };

  const handlePresetPrompt = (presetKey: 'AR' | 'STOCK' | 'FORECAST' | 'AUDIT') => {
    const nowStr = new Date().toTimeString().slice(0, 8);

    if (presetKey === 'AR') {
      const userMsg: AiChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        timestamp: nowStr,
        textJp: 'なぜ今月の未回収債権（売掛金）が 14.2% 増加したのか、取引先別の要因と回収リスクを分析して。',
        textSub: t(
          'Analyze why Accounts Receivable increased by 14.2% this month and evaluate counterparty credit risk.',
          'Analise por que o Contas a Receber aumentou 14,2% neste mês e avalie o risco por cliente.'
        ),
      };
      const aiMsg: AiChatMessage = {
        id: `a-${Date.now() + 1}`,
        role: 'assistant',
        timestamp: nowStr,
        textJp:
          '【売掛債権ドリルダウン解析結果】未回収債権 ¥12.7M のうち 66.3%（¥8,420,000）は「株式会社山田」向け受注 #SO-2026-10482（適格請求書 #INV-2026-00389）によるものです。同社の信用格付は最高位の「AAA」（与信枠 ¥30.0M に対し使用率 28%）であり、貸倒リスクは極めて低い（0.02%未満）と判定されます。',
        textSub: t(
          '[AR Root-Cause Analysis] 66.3% (¥8,420,000) of the ¥12.7M AR balance stems from Yamada Corporation (#SO-2026-10482 / #INV-2026-00389). Credit rating is AAA (28% credit utilization), indicating negligible default risk (<0.02%).',
          '[Análise de Causa Raiz] 66,3% (¥8.420.000) do saldo de ¥12,7M vem da Yamada Corporation (#SO-2026-10482 / #INV-2026-00389). O rating de crédito é AAA (28% do limite utilizado), indicando risco de inadimplência mínimo (<0,02%).'
        ),
        metrics: [
          { label: '主要要因取引先', value: '株式会社山田', delta: '構成比 66.3%' },
          { label: '対象注文 / 請求', value: 'SO-2026-10482', delta: '¥8,420,000' },
          { label: 'AI信用リスク判定', value: 'AAA (安全性極高)', delta: '期日: 11/30' },
        ],
        actions: [
          {
            labelJp: '株式会社山田 360° を開く',
            labelSub: t('Open Yamada 360°', 'Abrir Yamada 360°'),
            onClickType: 'OPEN_YAMADA',
          },
          {
            labelJp: '会計へ連携 (#SO-2026-10482)',
            labelSub: t('Execute GL Posting', 'Integrar à Contabilidade'),
            onClickType: 'SYNC_SO',
          },
        ],
      };
      setMessages((prev) => [...prev, userMsg, aiMsg]);
      return;
    }

    if (presetKey === 'STOCK') {
      const userMsg: AiChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        timestamp: nowStr,
        textJp: '名古屋支社の「部品 C (KZ-00882)」欠品による生産への影響と、最適な調達アクションを提案して。',
        textSub: t(
          'Analyze the production impact of Component C (KZ-00882) stockout in Nagoya and recommend optimal procurement action.',
          'Analise o impacto da falta do Componente C (KZ-00882) em Nagoya na produção e recomende a ação ideal.'
        ),
      };
      const aiMsg: AiChatMessage = {
        id: `a-${Date.now() + 1}`,
        role: 'assistant',
        timestamp: nowStr,
        textJp:
          '【BOM・MRP影響解析】部品構成表（BOM）上、主力「製品 KZ-500」1台あたり部品 C が 8個必要です。現在、製造部の田中健一課長より青葉部品株式会社向け緊急購買稟議 #PR-2026-00842（¥2,840,000）が提出され、山田部長の最終承認待ちとなっています。今すぐ決裁することで納期遅延を100%回避できます。',
        textSub: t(
          '[BOM Impact Analysis] Product KZ-500 requires 8 units of Component C per assembly. Purchase Request #PR-2026-00842 (Aoba Components, ¥2,840,000) is awaiting your final Ringi stamp. Immediate approval prevents any production delay.',
          '[Análise de Impacto BOM] O Produto KZ-500 requer 8 unidades do Componente C por montagem. A Requisição #PR-2026-00842 (Aoba Components, ¥2.840.000) aguarda seu carimbo final. Aprovar agora evita atrasos na linha.'
        ),
        metrics: [
          { label: '欠品対象品目', value: 'KZ-00882 (部品C)', delta: '現在庫 0 / 最低 50' },
          { label: '関連購買稟議', value: 'PR-2026-00842', delta: '¥2,840,000' },
          { label: 'AI推奨措置', value: '即時稟議承認 + 補充', delta: '納期短縮 4日' },
        ],
        actions: [
          {
            labelJp: 'PR-2026-00842 を即時承認 (Hanko押印)',
            labelSub: t('Approve PR-2026-00842 Now', 'Aprovar PR-2026-00842 Agora'),
            onClickType: 'APPROVE_PR',
          },
          {
            labelJp: '緊急在庫補充 (+100個) を実行',
            labelSub: t('Dispatch +100 Replenishment', 'Disparar Reposição +100 un.'),
            onClickType: 'REPLENISH_C',
          },
        ],
      };
      setMessages((prev) => [...prev, userMsg, aiMsg]);
      return;
    }

    if (presetKey === 'FORECAST') {
      const userMsg: AiChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        timestamp: nowStr,
        textJp: '第4四半期（10月〜12月）の売上高・営業利益・キャッシュフロー予測シミュレーションを実行して。',
        textSub: t(
          'Run Q4 (Oct–Dec) Revenue, Operating Profit, and Cash Flow predictive simulation.',
          'Execute a simulação preditiva de Receita, Lucro Operacional e Fluxo de Caixa para o 4º trimestre.'
        ),
      };
      const aiMsg: AiChatMessage = {
        id: `a-${Date.now() + 1}`,
        role: 'assistant',
        timestamp: nowStr,
        textJp:
          '【Q4 モンテカルロ経営予測】現在の受注残高（¥34.2M）およびパイプライン商談（¥42.8M）の成約確率モデルに基づき、10月〜12月期の着地見込を算出しました。標準シナリオにて通期予算達成率は 106.8% に到達する見通しです。',
        textSub: t(
          '[Q4 Predictive Simulation] Based on current backlog (¥34.2M) and sales pipeline conversion rates (¥42.8M), full-year budget attainment is projected to reach 106.8%.',
          '[Simulação Preditiva Q4] Com base na carteira atual (¥34,2M) e taxa de conversão do funil (¥42,8M), a meta anual deve atingir 106,8%.'
        ),
        metrics: [
          { label: '10月着地予測', value: '¥298.5M', delta: '+4.9% MoM' },
          { label: '11月着地予測', value: '¥312.0M', delta: '+4.5% MoM' },
          { label: '12月着地予測', value: '¥334.8M', delta: '過去最高更新見込' },
        ],
        actions: [
          {
            labelJp: '経営分析 (BI) チャートで詳細確認',
            labelSub: t('Open BI Interactive Charts', 'Abrir Gráficos Interativos no BI'),
            onClickType: 'OPEN_BI',
          },
        ],
      };
      setMessages((prev) => [...prev, userMsg, aiMsg]);
      return;
    }

    if (presetKey === 'AUDIT') {
      const userMsg: AiChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        timestamp: nowStr,
        textJp: '全仕訳伝票および電子証憑に対する「電子帳簿保存法・インボイス制度・J-SOX」AI監査スキャンを実行して。',
        textSub: t(
          'Run AI compliance & anomaly scan across all journal entries and electronic invoices.',
          'Execute varredura de IA para conformidade fiscal japonesa (Invoice / J-SOX) em todos os lançamentos.'
        ),
      };
      const aiMsg: AiChatMessage = {
        id: `a-${Date.now() + 1}`,
        role: 'assistant',
        timestamp: nowStr,
        textJp:
          '【AIコンプライアンス監査完了】全 1,482 件の仕訳伝票・適格請求書（T番号）・タイムスタンプを照合しました。改ざん検知 0件、国税庁適格請求書発行事業者API照合 100% 一致を確認しました。',
        textSub: t(
          '[AI Compliance Audit Complete] SIMULATED output over fictitious data (demo). No real tax-authority verification is performed.',
          '[Auditoria de IA Concluída] 1.482 lançamentos, registros T-Number e timestamps verificados. 0 anomalias detectadas; 100% de conformidade com a Receita Japonesa.'
        ),
        metrics: [
          { label: '電帳法タイムスタンプ', value: '100% 適合', delta: '違反 0件' },
          { label: '適格請求書 T番号照合', value: 'デモ表示', delta: '模擬 (実連携なし)' },
          { label: 'J-SOX 職務分掌統制 (デモ表示)', value: 'デモ値', delta: '電子印鑑検証済' },
        ],
      };
      setMessages((prev) => [...prev, userMsg, aiMsg]);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;
    const nowStr = new Date().toTimeString().slice(0, 8);
    const q = inputPrompt.trim();
    setInputPrompt('');

    const userMsg: AiChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      timestamp: nowStr,
      textJp: q,
      textSub: q,
    };

    const aiMsg: AiChatMessage = {
      id: `a-${Date.now() + 1}`,
      role: 'assistant',
      timestamp: nowStr,
      textJp: `「${q}」について、${currentBranchInfo.nameJp}の統合データベース（販売・会計・購買・在庫）を横断照会しました。関連する主要トランザクション（注文 #SO-2026-10482 / 稟議 #PR-2026-00842）の整合性は正常であり、以下のアクションを推奨します。`,
      textSub: t(
        `Cross-referenced "${q}" across Sales, Accounting, Procurement, and Inventory ledgers for ${currentBranchInfo.nameEn}. All linked records are consistent.`,
        `Consulta cruzada sobre "${q}" realizada nos módulos de Vendas, Contabilidade, Compras e Estoque (${currentBranchInfo.namePt}). Veja as ações recomendadas abaixo.`
      ),
      actions: [
        {
          labelJp: '株式会社山田 (360° 顧客情報)',
          labelSub: t('Open Yamada Corp', 'Abrir Yamada Corp'),
          onClickType: 'OPEN_YAMADA',
        },
        {
          labelJp: '購買稟議 #PR-2026-00842 を承認',
          labelSub: t('Approve PR-2026-00842', 'Aprovar PR-2026-00842'),
          onClickType: 'APPROVE_PR',
        },
      ],
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
  };

  const runDeepAnomalyScan = () => {
    setIsScanning(true);
    setScanProgress(18);
    setTimeout(() => setScanProgress(54), 300);
    setTimeout(() => setScanProgress(89), 650);
    setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      recordCustomAction(
        'Kizuna AI 全社データ整合性・異常値スキャン完了',
        '全4拠点・12,842品目・全仕訳伝票のAI監査を実施 (異常値 0件)',
        'AI-ENGINE-01',
        'AI整合性スコア 99.8% | Audit Log +1'
      );
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-800 font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>KIZUNA AI ENGINE • デモ用LLM基盤 (模擬)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-3">
            <span>Kizuna Intelligence (AI 経営参謀)</span>
            <span className="text-sm font-normal text-slate-500">
              / {t('Autonomous Executive Insights & ERP Co-Pilot', 'Inteligência Artificial Executiva & Co-Piloto ERP')}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runDeepAnomalyScan}
            disabled={isScanning}
            className="px-4 py-2 rounded-md bg-slate-900 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isScanning
                ? `全社AIスキャン実行中 (${scanProgress}%)...`
                : t('Run Full-ERP AI Scan (全社AI診断)', 'Executar Diagnóstico IA Completo')}
            </span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left 8 Cols Interactive AI Co-Pilot, Right 4 Cols Autonomous Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: Interactive AI Advisor */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-md shadow-sm flex flex-col overflow-hidden">
          {/* Preset Prompt Bar */}
          <div className="p-3.5 bg-slate-900 text-white border-b border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ワンクリック経営分析プロンプト / {t('1-Click Executive Prompts:', 'Análises Instantâneas de IA (Clique para testar):')}</span>
              </span>
              <span className="font-mono text-[10px]">J-SOX PRIVATE MODEL v4.2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handlePresetPrompt('AR')}
                className="p-2 rounded bg-slate-800/90 hover:bg-blue-950 border border-slate-700 hover:border-blue-500 text-left text-xs transition-all flex items-center justify-between"
              >
                <span className="truncate">
                  1. 📈 売掛金 +14.2% 増加の要因・与信リスク解析
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              </button>

              <button
                onClick={() => handlePresetPrompt('STOCK')}
                className="p-2 rounded bg-slate-800/90 hover:bg-blue-950 border border-slate-700 hover:border-blue-500 text-left text-xs transition-all flex items-center justify-between"
              >
                <span className="truncate">
                  2. 📦 名古屋「部品 C」欠品の影響と最適調達提案
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </button>

              <button
                onClick={() => handlePresetPrompt('FORECAST')}
                className="p-2 rounded bg-slate-800/90 hover:bg-blue-950 border border-slate-700 hover:border-blue-500 text-left text-xs transition-all flex items-center justify-between"
              >
                <span className="truncate">
                  3. 🔮 第4四半期 (Q4) 売上・利益モンテカルロ予測
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </button>

              <button
                onClick={() => handlePresetPrompt('AUDIT')}
                className="p-2 rounded bg-slate-800/90 hover:bg-blue-950 border border-slate-700 hover:border-blue-500 text-left text-xs transition-all flex items-center justify-between"
              >
                <span className="truncate">
                  4. 🛡️ 電帳法・インボイス制度・J-SOX 異常値監査
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-300 shrink-0" />
              </button>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 p-5 space-y-4 max-h-[480px] overflow-y-auto bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-2xl rounded-lg p-4 border ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white border-slate-800'
                      : 'bg-white text-slate-900 border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] font-mono mb-1.5 opacity-70">
                    <span>
                      {m.role === 'user'
                        ? '山田 太郎 (営業部長)'
                        : '✦ KIZUNA INTELLIGENCE ENGINE'}
                    </span>
                    <span>{m.timestamp}</span>
                  </div>

                  <p className="text-xs font-medium leading-relaxed">{m.textJp}</p>
                  {m.textSub !== m.textJp && (
                    <p
                      className={`text-[11px] mt-1.5 leading-relaxed ${
                        m.role === 'user' ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {m.textSub}
                    </p>
                  )}

                  {/* Metrics Grid inside AI response */}
                  {m.metrics && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-slate-100">
                      {m.metrics.map((met, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded bg-slate-50 border border-slate-200"
                        >
                          <div className="text-[10px] text-slate-500">{met.label}</div>
                          <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                            {met.value}
                          </div>
                          {met.delta && (
                            <div className="text-[10px] font-mono text-blue-800 mt-0.5">
                              {met.delta}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Direct ERP Action Buttons inside AI response */}
                  {m.actions && (
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-slate-100">
                      {m.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => executeChatAction(act.onClickType)}
                          className="px-3 py-1.5 rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Zap className="w-3 h-3 text-amber-300" />
                          <span>{act.labelJp}</span>
                          <span className="text-[10px] text-blue-200 font-normal">
                            ({act.labelSub})
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleCustomSubmit}
            className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2.5"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={t(
                'Ask Kizuna Intelligence about revenue, receivables, BOM stockouts, or J-SOX compliance...',
                'Pergunte à IA sobre receitas, contas a receber, falta de estoque no BOM ou compliance...'
              )}
              className="flex-1 text-xs px-3.5 py-2.5 rounded border border-slate-300 focus:outline-none focus:border-blue-800"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded bg-slate-900 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>AI解析実行</span>
            </button>
          </form>
        </div>

        {/* Right 4 Cols: Autonomous ERP Action Cards */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <div className="text-[10px] font-mono font-bold text-blue-800 uppercase">
                AUTONOMOUS WORKFLOW RECOMMENDATIONS
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                AI 推奨オペレーション (即時実行可能)
              </h3>
              <p className="text-[11px] text-slate-500">
                {t(
                  'Click any recommendation below to execute the action directly in the ERP ledger.',
                  'Clique em qualquer recomendação abaixo para executar a ação diretamente no banco do ERP.'
                )}
              </p>
            </div>

            {/* Recommendation 1 */}
            <div className="p-3.5 rounded-md border border-amber-200 bg-amber-50/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  優先度: 高 (HIGH PRIORITY)
                </span>
                <span className="font-mono text-[11px] text-slate-500">PR-2026-00842</span>
              </div>
              <div className="font-bold text-slate-900">
                青葉部品向け 部品C 購買稟議の即時承認
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                名古屋支社の欠品（KZ-00882）を解消し、製品 KZ-500 の製造ライン停止を未然に防ぎます。
              </p>
              <button
                onClick={() => approvePurchaseRequest('PR-2026-00842')}
                className="w-full py-2 rounded bg-slate-900 hover:bg-blue-900 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <GitPullRequest className="w-3.5 h-3.5 text-amber-400" />
                <span>AI推奨: 稟議承認・発注を実行 (¥2.84M)</span>
              </button>
            </div>

            {/* Recommendation 2 */}
            <div className="p-3.5 rounded-md border border-blue-200 bg-blue-50/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                  財務自動化 (AUTO-GL)
                </span>
                <span className="font-mono text-[11px] text-slate-500">SO-2026-10475</span>
              </div>
              <div className="font-bold text-slate-900">
                未連携出荷伝票 (#INV-2026-00376) の自動仕訳計上
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                株式会社 Kizuna Trading 向け出荷済分（¥2,480,000）を売掛金・売上高へ即時転記します。
              </p>
              <button
                onClick={() => syncOrderToAccounting('SO-2026-10475')}
                className="w-full py-2 rounded bg-blue-900 hover:bg-blue-800 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>AI推奨: 会計へ自動仕訳連携 (+¥2.48M)</span>
              </button>
            </div>

            {/* Recommendation 3 */}
            <div className="p-3.5 rounded-md border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  在庫最適化 (SCM)
                </span>
                <span className="font-mono text-[11px] text-slate-500">KZ-00291</span>
              </div>
              <div className="font-bold text-slate-900">
                大阪支社「部品 B (サーボ駆動シャフト)」安全在庫補充
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                現在庫 38個（最低在庫 80個）のため、+100個の補充オーダーを自動送信します。
              </p>
              <button
                onClick={() => triggerReplenishment('KZ-00291')}
                className="w-full py-2 rounded bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Package className="w-3.5 h-3.5 text-blue-800" />
                <span>AI推奨: 大阪倉庫 緊急補充 (+100個)</span>
              </button>
            </div>
          </div>

          {/* Governance Card */}
          <div className="bg-slate-900 text-white rounded-md p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>AI ガバナンス・セキュリティ統制</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              すべてのAI推奨アクションは人間の最終決裁（Human-in-the-Loop）および電子印鑑による承認を経て実行され、監査ログに完全記録されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
