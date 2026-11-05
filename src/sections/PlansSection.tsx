import React, { useState } from 'react';
import { Check, Layers, Wrench, Plug, Users } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { PRICING, PlanId, getPlan, planForUsers, yen } from '../data/pricing';
import { Kicker, DisplayTitle, Accent, Classification, LegibilityVeil } from '../components/strategic/Editorial';

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
  const activeLevel = PLAN_IDS.indexOf(planId);
  const simPlanId = planForUsers(users);
  const simPlan = getPlan(simPlanId);
  const monthly = simPlan.priceMonthly * users;
  const { implementation, integration } = simPlan.estimates;

  return (
    <div className="relative w-full h-full select-none">
      <LegibilityVeil side="left" />
      <div className="relative h-full max-w-6xl mx-auto px-6 md:px-14 py-4 short:py-1 flex flex-col justify-center gap-4 md:gap-6 short:gap-2 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <Kicker code="08" label="Planos e receita" jp="価" />
            <DisplayTitle className="mt-4 short:mt-2">
              {scene === 0 ? (
                <>
                  À medida que a confiança cresce, <Accent>a plataforma cresce.</Accent>
                </>
              ) : (
                <>
                  Receita recorrente <Accent>por usuário.</Accent>
                </>
              )}
            </DisplayTitle>
          </div>
          <Classification kind="preco">{PRICING.badge}</Classification>
        </div>

        {scene === 0 ? (
          <div key="rings" className="grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-4 md:gap-12 items-center animate-fadeIn">
            {/* Anéis concêntricos: equipe → departamentos → empresa; cada anel abre o escopo do plano */}
            <div className="flex flex-col items-center gap-2">
              <svg viewBox="0 0 360 360" className="w-full max-w-[200px] md:max-w-[340px] short:md:max-w-[220px]" role="group" aria-label="Planos Kizuna">
                {[...PLAN_IDS].reverse().map((id) => {
                  const active = planId === id;
                  const level = PLAN_IDS.indexOf(id);
                  const included = level <= activeLevel; // o plano escolhido inclui os anéis internos
                  // acende de dentro para fora; apaga de fora para dentro
                  const delay = included ? level * 160 : (2 - level) * 90;
                  return (
                    <g
                      key={id}
                      onClick={() => setPlanId(id)}
                      className="cursor-pointer"
                      role="button"
                      aria-pressed={active}
                      aria-label={`${getPlan(id).name}: ver escopo`}
                      style={{
                        transformOrigin: '180px 180px',
                        transform: active ? 'scale(1.04)' : 'scale(1)',
                        transition: `transform 600ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`
                      }}
                    >
                      <circle
                        cx="180"
                        cy="180"
                        r={RING_RADIUS[id]}
                        style={{
                          fill: active ? 'rgba(215,38,61,0.16)' : included ? 'rgba(215,38,61,0.07)' : 'rgba(17,17,20,0.78)',
                          stroke: active ? '#D7263D' : included ? 'rgba(236,74,92,0.55)' : 'rgba(242,238,230,0.2)',
                          strokeWidth: active ? 3 : included ? 1.8 : 1.2,
                          filter: active ? 'drop-shadow(0 0 10px rgba(215,38,61,0.55))' : 'none',
                          transition: `fill 500ms ease ${delay}ms, stroke 500ms ease ${delay}ms, stroke-width 500ms ease ${delay}ms`
                        }}
                      />
                      <text
                        x="180"
                        y={id === 'start' ? 176 : 180 - RING_RADIUS[id] + 24}
                        textAnchor="middle"
                        className="pointer-events-none"
                        style={{ fill: '#F2EEE6', fontFamily: '"Noto Serif JP", serif', fontSize: 15, fontWeight: 600 }}
                      >
                        {getPlan(id).name.replace('KIZUNA ', '')}
                      </text>
                      <text
                        x="180"
                        y={id === 'start' ? 194 : 180 - RING_RADIUS[id] + 40}
                        textAnchor="middle"
                        className="pointer-events-none"
                        style={{ fill: included ? '#EC4A5C' : '#B9B3A8', fontSize: 11, transition: `fill 500ms ease ${delay}ms` }}
                      >
                        {yen(getPlan(id).priceMonthly)} • {RING_LABEL[id]}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <p className="text-[11px] text-washi-dim short:hidden short:lg:block">Toque em um anel para ver o escopo do plano.</p>
            </div>

            <div key={planId} className="md:border-l md:border-washi/15 md:pl-10 animate-fadeIn">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="font-display font-semibold text-2xl md:text-3xl short:text-2xl text-washi">{plan.name}</h2>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-semibold text-3xl md:text-4xl short:text-3xl text-washi tabular-nums">{yen(plan.priceMonthly)}</span>
                  <span className="text-xs text-washi-dim">/usuário/mês <span className="font-display text-kin-soft">税抜</span></span>
                </div>
              </div>
              <div className="mt-1 text-sm text-kin-soft">{plan.audience}</div>
              <ul className="mt-3 short:mt-2 border-t border-washi/10">
                {plan.features.map((f, i) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 py-1.5 short:py-0.5 border-b border-washi/10 text-sm md:text-base short:text-sm text-washi animate-fadeIn"
                    style={{ animationDelay: `${120 + i * 70}ms`, animationFillMode: 'both' }}
                  >
                    <Check className="w-4 h-4 text-washi-dim shrink-0 mt-1" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-washi-muted flex items-center gap-1.5">
                <Plug className="w-3.5 h-3.5 text-washi-dim" aria-hidden />
                {plan.integrationPolicy}
              </p>
              {planId === 'start' && (
                <div className="mt-3 short:mt-2 border-l-2 border-kin pl-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-kin-soft">{PRICING.trial.label}</div>
                  <p className="text-xs md:text-sm text-washi-muted mt-0.5">{PRICING.trial.text}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div key="simulator" className="flex flex-col gap-4 md:gap-6 short:gap-3 animate-fadeIn">
            {/* 1. Quantos usuários? */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-washi-dim flex items-center gap-1.5 mr-1">
                <Users className="w-4 h-4" aria-hidden /> Usuários
              </span>
              {PRICING.presets.map((n) => (
                <button
                  key={n}
                  onClick={() => setUsers(n)}
                  aria-pressed={users === n}
                  className={`min-w-[52px] px-3 py-1.5 border text-sm tabular-nums transition-colors ${
                    users === n ? 'border-beni text-washi bg-beni/15' : 'border-washi/15 text-washi-muted hover:border-washi/35'
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="text-xs text-washi-muted ml-1">
                → plano indicado: <strong className="text-washi">{simPlan.name}</strong>
              </span>
            </div>

            {/* 2. A conta: usuários × preço = MRR; MRR × 12 = ARR */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-3 md:gap-6 border-y border-washi/15 py-4 short:py-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-washi-dim">Receita mensal (MRR)</div>
                <div className="mt-1 text-sm md:text-base text-washi-muted tabular-nums">
                  {users} usuários × {yen(simPlan.priceMonthly)}
                </div>
                <div key={'m' + monthly} className="font-display font-semibold text-4xl md:text-5xl lg:text-6xl short:text-4xl text-washi tabular-nums animate-fadeIn">
                  {yenJp(monthly)}
                </div>
              </div>
              <div className="hidden md:flex flex-col items-center pb-3 text-washi-dim" aria-hidden>
                <span className="text-sm tabular-nums">× 12</span>
                <span className="text-2xl leading-none">→</span>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-washi-dim">Receita anual (ARR)</div>
                <div className="mt-1 text-sm md:text-base text-washi-muted">{PRICING.annualRule}</div>
                <div key={'a' + monthly} className="font-display font-semibold text-4xl md:text-5xl lg:text-6xl short:text-4xl text-beni-soft tabular-nums animate-fadeIn">
                  {yenJp(monthly * 12)}
                </div>
              </div>
            </div>

            {/* 3. Componentes: o que é recorrente e o que é cobrado à parte, sob proposta */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4 md:gap-8">
              <div className="border-l-2 border-washi/40 pl-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-washi-dim">Recorrente</div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-washi-muted"><Layers className="w-4 h-4" aria-hidden /> Licenças</div>
                <div className="text-xl md:text-2xl text-washi tabular-nums">{yenJp(monthly)}/mês</div>
              </div>
              <div className="border-l-2 border-washi/15 pl-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-washi-dim">À parte • sob proposta</div>
                <div className="mt-1 grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm text-washi-muted"><Wrench className="w-4 h-4" aria-hidden /> Implantação</div>
                    <div className="text-xl md:text-2xl text-washi tabular-nums">{yenJp(implementation)}</div>
                    <div className="text-[11px] text-washi-dim">{PRICING.estimateLabel}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-sm text-washi-muted"><Plug className="w-4 h-4" aria-hidden /> Integrações</div>
                    <div className="text-xl md:text-2xl text-washi tabular-nums">{integration === null ? 'Fora do escopo' : yenJp(integration)}</div>
                    <div className="text-[11px] text-washi-dim">{integration === null ? simPlan.integrationPolicy : PRICING.estimateLabel}</div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-washi-dim">{PRICING.expansionJourney.disclaimer}</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default PlansSection;
