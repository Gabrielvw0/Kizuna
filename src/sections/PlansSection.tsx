import React, { useState } from 'react';
import { Check, Layers, Wrench, Plug, Users } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { PRICING, PlanId, getPlan, planForUsers, yen } from '../data/pricing';
import { ScreenTitle, InfoTag } from '../components/strategic/ScreenTitle';

const PLAN_IDS: PlanId[] = ['start', 'business', 'enterprise'];
const RING_RADIUS: Record<PlanId, number> = { start: 62, business: 112, enterprise: 162 };
const RING_LABEL: Record<PlanId, string> = { start: 'Equipe', business: 'Departamentos', enterprise: 'Empresa' };
const yenJp = (n: number) => `¥${n.toLocaleString('ja-JP')}`;

/**
 * Tela 08 • Planos e modelo de receita.
 * Cena 1: Land & Expand — escolher um anel mostra o escopo do plano.
 * Cena 2: simulador — plano × usuários = receita recorrente, com implantação e integrações à parte.
 */
export const PlansSection: React.FC = () => {
  const { sceneIndex } = usePresentation();
  const scene = Math.min(1, Math.max(0, sceneIndex));
  const [planId, setPlanId] = useState<PlanId>('start');
  const [users, setUsers] = useState<number>(PRICING.defaultUsers);

  const plan = getPlan(planId);
  const simPlanId = planForUsers(users);
  const simPlan = getPlan(simPlanId);
  const monthly = simPlan.priceMonthly * users;
  const { implementation, integration } = simPlan.estimates;

  return (
    <div className="relative w-full h-full flex flex-col justify-center gap-6 px-6 md:px-14 py-6 max-w-6xl mx-auto overflow-y-auto select-none">
      <ScreenTitle
        kicker="08 • Planos e receita • 価"
        title={
          scene === 0 ? (
            <>
              À medida que a confiança cresce, <span className="text-rose-500">a plataforma cresce.</span>
            </>
          ) : (
            <>
              Receita recorrente <span className="text-rose-500">por usuário.</span>
            </>
          )
        }
        aside={<InfoTag kind="preco">{PRICING.badge}</InfoTag>}
      />

      {scene === 0 ? (
        <div key="rings" className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center animate-fadeIn">
          {/* Anéis: cada anel é um botão que mostra o escopo do plano */}
          <svg viewBox="0 0 360 360" className="w-full max-w-[360px] mx-auto" role="group" aria-label="Planos Kizuna">
            {[...PLAN_IDS].reverse().map((id) => {
              const active = planId === id;
              return (
                <g key={id} onClick={() => setPlanId(id)} className="cursor-pointer" role="button" aria-pressed={active}>
                  <circle
                    cx="180"
                    cy="180"
                    r={RING_RADIUS[id]}
                    fill={active ? 'rgba(225,29,72,0.18)' : 'rgba(15,23,42,0.55)'}
                    stroke={active ? '#f43f5e' : 'rgba(255,255,255,0.22)'}
                    strokeWidth={active ? 3 : 1.5}
                  />
                  <text
                    x="180"
                    y={id === 'start' ? 176 : 180 - RING_RADIUS[id] + 22}
                    textAnchor="middle"
                    className="fill-white font-mono text-[11px] font-bold pointer-events-none"
                  >
                    {getPlan(id).name.replace('KIZUNA ', '')}
                  </text>
                  <text
                    x="180"
                    y={id === 'start' ? 192 : 180 - RING_RADIUS[id] + 36}
                    textAnchor="middle"
                    className="fill-rose-300 font-mono text-[10px] pointer-events-none"
                  >
                    {yen(getPlan(id).priceMonthly)} • {RING_LABEL[id]}
                  </text>
                </g>
              );
            })}
          </svg>

          <div key={planId} className="p-6 rounded-3xl bg-slate-950/90 border border-rose-500/40 animate-fadeIn">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-black text-white">{plan.name}</h2>
              <div className="font-mono">
                <span className="text-2xl font-black text-white">{yen(plan.priceMonthly)}</span>
                <span className="text-[10px] text-slate-400"> /usuário/mês 税抜</span>
              </div>
            </div>
            <div className="text-xs text-amber-300 mt-0.5">{plan.audience}</div>
            <ul className="mt-4 space-y-1.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-400">
              <Plug className="inline w-3.5 h-3.5 mr-1 text-sky-400" />
              {plan.integrationPolicy}
            </p>
            {planId === 'start' && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-400/40">
                <div className="text-[10px] font-mono font-bold text-amber-300">{PRICING.trial.label}</div>
                <p className="text-xs text-slate-200 mt-0.5">{PRICING.trial.text}</p>
              </div>
            )}
            <p className="mt-4 text-[11px] text-slate-500">Toque em um anel para ver o escopo de cada plano.</p>
          </div>
        </div>
      ) : (
        <div key="simulator" className="flex flex-col gap-5 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-rose-400" /> Usuários:
            </span>
            {PRICING.presets.map((n) => (
              <button
                key={n}
                onClick={() => setUsers(n)}
                aria-pressed={users === n}
                className={`px-3.5 py-2 rounded-xl text-sm font-mono font-bold transition-all ${
                  users === n ? 'bg-rose-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {n}
              </button>
            ))}
            <span className="text-xs font-mono text-slate-400">
              → plano indicado: <strong className="text-white">{simPlan.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-slate-950/90 border border-emerald-500/40">
              <div className="text-[10px] font-mono uppercase text-slate-400">Receita mensal (MRR)</div>
              <div className="text-4xl font-black font-mono text-emerald-300 mt-1">{yenJp(monthly)}</div>
              <div className="text-xs font-mono text-slate-400 mt-1">
                {yen(simPlan.priceMonthly)} × {users} usuários
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-slate-950/90 border border-amber-500/40">
              <div className="text-[10px] font-mono uppercase text-slate-400">Receita anual (ARR)</div>
              <div className="text-4xl font-black font-mono text-amber-300 mt-1">{yenJp(monthly * 12)}</div>
              <div className="text-xs font-mono text-slate-400 mt-1">{PRICING.annualRule}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold"><Layers className="w-4 h-4" /> Licenças</div>
              <div className="font-mono text-white mt-1">{yenJp(monthly)}/mês</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold"><Wrench className="w-4 h-4" /> Implantação</div>
              <div className="font-mono text-white mt-1">{yenJp(implementation)}</div>
              <div className="text-[10px] text-slate-400">{PRICING.estimateLabel}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold"><Plug className="w-4 h-4" /> Integrações</div>
              <div className="font-mono text-white mt-1">{integration === null ? 'Fora do escopo' : yenJp(integration)}</div>
              <div className="text-[10px] text-slate-400">{integration === null ? simPlan.integrationPolicy : PRICING.estimateLabel}</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">{PRICING.expansionJourney.disclaimer}</p>
        </div>
      )}
    </div>
  );
};
export default PlansSection;
