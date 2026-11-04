import React, { useState } from 'react';
import { Check, Layers, Wrench, Plug, ArrowRight, TrendingUp, Users, ShieldAlert } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';

interface PlanConfig {
  id: 'start' | 'business' | 'enterprise';
  name: string;
  priceNum: number;
  priceFormatted: string;
  jp: string;
  summary: string;
  features: string[];
  recommendedScale: number;
}

const PLANS: PlanConfig[] = [
  {
    id: 'start',
    name: 'KIZUNA START',
    priceNum: 980,
    priceFormatted: '¥980',
    jp: 'チーム管理',
    summary: 'Tarefas, calendário, projetos e comunicação contextual.',
    features: [
      'Gestão ágil de tarefas e prazos',
      'Calendário compartilhado por equipe',
      'Visão de entregas e progresso de projetos',
      'Comunicação direta contextualizada'
    ],
    recommendedScale: 10
  },
  {
    id: 'business',
    name: 'KIZUNA BUSINESS',
    priceNum: 1980,
    priceFormatted: '¥1.980',
    jp: '知能・稟議フロー',
    summary: 'Automação, IA assistiva e fluxos de aprovação (Ringi/Nemawashi).',
    features: [
      'Tudo do Kizuna Start',
      'Fluxos nativos de Nemawashi (根回し) e Ringi (稟議)',
      'Inteligência assistiva com portão de validação humana',
      'Indicadores multiequipe e visibilidade gerencial'
    ],
    recommendedScale: 40
  },
  {
    id: 'enterprise',
    name: 'KIZUNA ENTERPRISE',
    priceNum: 3500,
    priceFormatted: '¥3.500',
    jp: '全社統制・連携',
    summary: 'Governança corporativa, trilha de auditoria e integrações dedicadas.',
    features: [
      'Tudo do Kizuna Business',
      'Controle de acesso granular (RBAC) & Audit Trail',
      'Integrações dedicadas com ERPs legados japoneses',
      'Alinhamento a APPI e ISO/IEC 27001 (JIS Q 27001) como referência, sem certificação'
    ],
    recommendedScale: 100
  }
];

const USER_SCALE_OPTIONS = [10, 25, 40, 75, 100] as const;

export const PricingSection: React.FC = () => {
  const { setSceneIndex, nextStep } = usePresentation();
  const [selectedPlanId, setSelectedPlanId] = useState<'start' | 'business' | 'enterprise'>('business');
  const [userCount, setUserCount] = useState<number>(40);

  const activePlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[1];
  const monthlyJpy = activePlan.priceNum * userCount;
  const annualJpy = monthlyJpy * 12;

  // Implementation and integration estimates
  const implementationJpy = selectedPlanId === 'start' ? 150000 : selectedPlanId === 'business' ? 450000 : 1200000;
  const integrationJpy = selectedPlanId === 'start' ? 0 : selectedPlanId === 'business' ? 300000 : 800000;

  const handleSelectPlan = (planId: 'start' | 'business' | 'enterprise') => {
    setSelectedPlanId(planId);
    if (planId === 'start' && userCount > 25) setUserCount(10);
    if (planId === 'business' && userCount < 25) setUserCount(40);
    if (planId === 'enterprise' && userCount < 50) setUserCount(100);
    setSceneIndex(0);
  };

  const handleUserScale = (count: number) => {
    setUserCount(count);
    if (count <= 20) setSelectedPlanId('start');
    else if (count <= 60) setSelectedPlanId('business');
    else setSelectedPlanId('enterprise');
    setSceneIndex(1);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-6 md:px-14 py-6 max-w-7xl mx-auto overflow-y-auto select-none">
      {/* Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-[10px] font-mono tracking-[0.2em] text-red-300 uppercase">
              TELA 13 • PAINEL FINANCEIRO VIVO
            </span>
            <span className="text-[11px] font-mono text-slate-400 tracking-widest">
              価 • SIMULAÇÃO REATIVA EM TEMPO REAL
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
            COMO O KIZUNA <span className="text-red-500">GERA VALOR?</span>
          </h1>
        </div>

        {/* Mandatory Visible Notice */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-400/50 text-[11px] font-mono font-bold tracking-wider text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>PREÇOS SUGERIDOS — HIPÓTESE ESTRATÉGICA PARA O PROJETO</span>
        </div>
      </div>

      {/* Main Dynamic Workspace */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch my-auto py-2">
        {/* Left 5 Cols: Live Responsive Plan Picker */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>SELECIONE O PLANO OPERACIONAL</span>
            <span className="text-red-400">¥ (税抜 • sem imposto de 10%)</span>
          </div>

          <div className="space-y-2.5 flex-1 flex flex-col justify-between">
            {PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.3)]'
                      : 'bg-slate-900/75 border-white/10 hover:border-white/25 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-red-400 uppercase">
                      {plan.name}
                    </span>
                    <span className="text-xs font-serif text-amber-300">{plan.jp}</span>
                  </div>

                  <div className="flex items-baseline justify-between my-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black font-mono text-white">
                        {plan.priceFormatted}
                      </span>
                      <span className="text-xs font-mono text-slate-400">/ usuário/mês</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[9px] font-mono text-amber-300 font-bold">
                        税抜
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-1">{plan.summary}</p>
                </button>
              );
            })}
          </div>

          {/* User Scale Dynamic Switcher */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-red-400" /> ESCALA DA EMPRESA: {userCount} USUÁRIOS
              </span>
              <span className="text-[10px] font-mono text-amber-300">10 → 40 → 100</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {USER_SCALE_OPTIONS.map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => handleUserScale(cnt)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    userCount === cnt
                      ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-105'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cnt} u.
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Live Financial Simulation & Revenue Breakdown */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          {/* Main Calculation Card */}
          <div className="p-6 rounded-3xl bg-slate-950/95 border border-red-500/40 shadow-2xl flex-1 flex flex-col justify-between animate-fadeIn">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold block">
                    PROJEÇÃO RECORRENTE AUTOMÁTICA
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Plano Ativo: <span className="text-red-400">{activePlan.name}</span> ({userCount} usuários)
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Período Fiscal</div>
                  <div className="text-xs font-mono text-emerald-400 font-bold">Mensal &amp; Anual (税抜)</div>
                </div>
              </div>

              {/* Live Metric Counters */}
              <div className="grid grid-cols-2 gap-3.5 mb-5">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-1">
                    <span>MRR REPASSE MENSAL</span>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">
                    ¥{monthlyJpy.toLocaleString('ja-JP')}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    {activePlan.priceFormatted} × {userCount} usuários / mês
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-1">
                    <span>ARR RECORRENTE ANUAL</span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">12 MESES</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
                    ¥{annualJpy.toLocaleString('ja-JP')}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    Receita contratual previsível (税抜)
                  </div>
                </div>
              </div>

              {/* Clear Separation of Revenue Streams: Licenças + Implantação + Integração */}
              <div className="space-y-2 border-t border-white/10 pt-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">
                  ESTRUTURA DE RECEITA INDEPENDENTE:
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center gap-1.5 text-red-400 font-bold mb-0.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>1. Licenças</span>
                    </div>
                    <div className="text-slate-200 font-mono font-bold">
                      ¥{monthlyJpy.toLocaleString('ja-JP')}/mês
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">SaaS contínuo</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-0.5">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>2. Implantação</span>
                    </div>
                    <div className="text-slate-200 font-mono font-bold">
                      ¥{implementationJpy.toLocaleString('ja-JP')}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Estimativa ilustrativa • sob proposta</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center gap-1.5 text-sky-400 font-bold mb-0.5">
                      <Plug className="w-3.5 h-3.5" />
                      <span>3. Integrações</span>
                    </div>
                    <div className="text-slate-200 font-mono font-bold">
                      {integrationJpy > 0 ? `¥${integrationJpy.toLocaleString('ja-JP')}` : 'Inclusa'}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Estimativa ilustrativa • sob proposta</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Proposta: licença por usuário; implantação e integrações apresentadas à parte (valores ilustrativos)
              </span>
              <button
                onClick={nextStep}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shadow-lg"
              >
                <span>Avançar para Riscos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PricingSection;
