import React, { useState } from 'react';
import { Check, Layers, Wrench, Plug, ArrowRight, TrendingUp, Users, ShieldAlert } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { PRICING, PlanId, getPlan, planForUsers, scaleStory, yen } from '../data/pricing';

// Preços, faixas de usuários, estimativas e avisos vêm de src/data/pricing.json.
// Aqui ficam apenas os textos de apresentação de cada plano.
const PLAN_COPY: Record<PlanId, { jp: string; summary: string }> = {
  start: { jp: 'チーム管理', summary: 'Tarefas, calendário, projetos e comunicação contextual.' },
  business: { jp: '知能・稟議フロー', summary: 'Automação, IA assistiva e fluxos de aprovação (Ringi/Nemawashi).' },
  enterprise: { jp: '全社統制・連携', summary: 'Governança ampliada, personalização e operação em múltiplas unidades.' }
};

const PLANS = PRICING.plans.map((p) => ({
  id: p.id as PlanId,
  name: p.name,
  priceNum: p.priceMonthly,
  priceFormatted: yen(p.priceMonthly),
  ...PLAN_COPY[p.id as PlanId]
}));

const USER_SCALE_OPTIONS = PRICING.presets;

export const PricingSection: React.FC = () => {
  const { sceneIndex, setSceneIndex, nextStep } = usePresentation();
  // Cena 1: os 3 planos e seu escopo • Cena 2: simulador e estrutura de receita
  const scene = Math.min(1, Math.max(0, sceneIndex));
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(planForUsers(PRICING.defaultUsers));
  const [userCount, setUserCount] = useState<number>(PRICING.defaultUsers);

  const activePlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[1];
  const activePlanData = getPlan(selectedPlanId);
  const monthlyJpy = activePlan.priceNum * userCount;
  const annualJpy = monthlyJpy * 12; // regra em pricing.json (annualRule): mensal × 12, sem desconto

  // Estimativas ilustrativas de implantação e integração (sob proposta), de pricing.json
  const { implementation: implementationJpy, integration: integrationJpy } = getPlan(selectedPlanId).estimates;

  // Escolher um plano ajusta a escala se ela estiver fora da faixa do plano:
  // Start aceita até users.max; Business e Enterprise exigem pelo menos users.min.
  const handleSelectPlan = (planId: PlanId) => {
    setSelectedPlanId(planId);
    const { users } = getPlan(planId);
    const outOfRange = planId === 'start' ? userCount > (users.max ?? Infinity) : userCount < users.min;
    if (outOfRange) setUserCount(users.default);
    setSceneIndex(0);
  };

  // Escolher uma escala seleciona o plano da faixa correspondente
  const handleUserScale = (count: number) => {
    setUserCount(count);
    setSelectedPlanId(planForUsers(count));
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
          <span>{PRICING.badge}</span>
        </div>
      </div>

      {/* Main Dynamic Workspace */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch my-auto py-2">
        {/* Left 5 Cols: Live Responsive Plan Picker */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>SELECIONE O PLANO OPERACIONAL</span>
            <span className="text-red-400">¥ (税抜 • sem imposto de {Math.round(PRICING.taxRate * 100)}%)</span>
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
              <span className="text-[10px] font-mono text-amber-300">{scaleStory}</span>
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
            {scene === 0 ? (
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold block">
                      ESCOPO DO PLANO
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      <span className="text-red-400">{activePlan.name}</span> • {activePlanData.audience}
                    </h3>
                  </div>
                  <span className="text-xs font-serif text-amber-300">{activePlan.jp}</span>
                </div>

                <ul className="space-y-1.5 mb-4">
                  {activePlanData.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-200">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 mb-3">
                  <div className="flex items-center gap-1.5 text-sky-400 text-[10px] font-mono font-bold uppercase mb-1">
                    <Plug className="w-3.5 h-3.5" /> Integrações
                  </div>
                  <p className="text-xs text-slate-200">{activePlanData.integrationPolicy}</p>
                  {activePlanData.additionalScope.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 text-[11px] text-slate-400">
                      {activePlanData.additionalScope.map((a) => (
                        <li key={a}>• {a}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/40">
                  <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-mono font-bold uppercase mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> {PRICING.trial.label}
                  </div>
                  <p className="text-xs text-slate-200">{PRICING.trial.text}</p>
                </div>
              </div>
            ) : (
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
                    <div className="text-[9px] text-slate-400 mt-0.5">{PRICING.estimateLabel}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center gap-1.5 text-sky-400 font-bold mb-0.5">
                      <Plug className="w-3.5 h-3.5" />
                      <span>3. Integrações</span>
                    </div>
                    <div className="text-slate-200 font-mono font-bold">
                      {integrationJpy === null ? 'Fora do escopo' : `¥${integrationJpy.toLocaleString('ja-JP')}`}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      {integrationJpy === null ? activePlanData.integrationPolicy : PRICING.estimateLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}

            <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Proposta: licença por usuário; implantação e integrações apresentadas à parte (valores ilustrativos)
              </span>
              <button
                onClick={nextStep}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shadow-lg"
              >
                <span>{scene === 0 ? 'Ver o simulador' : 'Avançar para Riscos'}</span>
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
