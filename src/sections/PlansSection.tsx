import React, { useEffect, useRef, useState } from 'react';
import { Check, Layers, Wrench, Plug, Users } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { PRICING, PlanId, getPlan, planForUsers, yen } from '../data/pricing';
import { Kicker, DisplayTitle, Accent, Classification, LegibilityVeil } from '../components/strategic/Editorial';
import { SceneStage } from '../components/strategic/SceneStage';

const PLAN_IDS: PlanId[] = ['start', 'business', 'enterprise'];
const RING_LABEL: Record<PlanId, string> = { start: 'Equipe', business: 'Departamentos', enterprise: 'Empresa' };

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Contagem por tempo (não por quadro) até o valor exato. Sempre termina no alvo;
 * com movimento reduzido mostra o valor direto.
 */
function useCountUp(target: number, delayMs: number, durationMs: number) {
  const [value, setValue] = useState(target);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (reducedMotion()) {
      setValue(target);
      return;
    }
    const start = performance.now() + delayMs;
    setValue(0);
    const tick = () => {
      const t = Math.min(1, Math.max(0, (performance.now() - start) / durationMs));
      const e = 1 - Math.pow(1 - t, 3);
      setValue(t >= 1 ? target : Math.round(target * e));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    // rede de segurança: se os quadros pararem, o valor final aparece mesmo assim
    const done = window.setTimeout(() => setValue(target), delayMs + durationMs + 200);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.clearTimeout(done);
    };
  }, [target, delayMs, durationMs]);
  return value;
}

/** Trilha de níveis (não clicável): mostra onde a cena está no crescimento. */
const LevelTrail: React.FC<{ level: number }> = ({ level }) => (
  <ol className="flex items-center gap-2 text-[11px] md:text-xs uppercase tracking-[0.18em]" aria-label="Nível do plano">
    {PLAN_IDS.map((id, i) => (
      <li key={id} className="flex items-center gap-2">
        {i > 0 && <span className={`h-px w-5 md:w-8 transition-colors duration-700 ${i <= level ? 'bg-beni/70' : 'bg-washi/15'}`} aria-hidden />}
        <span className={`transition-colors duration-700 ${i === level ? 'text-washi' : i < level ? 'text-beni-soft' : 'text-washi-dim'}`}>
          <span className="font-display normal-case tracking-normal tabular-nums mr-1">{i + 1}</span>
          {RING_LABEL[id]}
        </span>
      </li>
    ))}
  </ol>
);

/**
 * Tela 08 • Planos e modelo de receita — Etapa 8.2, quatro cenas.
 * 08.1 Start (nível 1) • 08.2 Business (níveis 1–2) • 08.3 Enterprise (estrutura completa)
 * • 08.4 simulador: usuários × preço = MRR; MRR × 12 = ARR; licenças recorrentes separadas
 * de implantação e integrações (à parte, sob proposta).
 * O texto fica à esquerda; a estrutura 3D de crescimento (WorldStage) fica à direita.
 */
export const PlansSection: React.FC = () => {
  const { sceneIndex } = usePresentation();
  const scene = Math.min(3, Math.max(0, sceneIndex));
  const isSim = scene === 3;
  const [users, setUsers] = useState<number>(PRICING.defaultUsers);

  const plan = getPlan(PLAN_IDS[Math.min(2, scene)]);
  const simPlanId = planForUsers(users);
  const simPlan = getPlan(simPlanId);
  const monthly = simPlan.priceMonthly * users;
  // ordem da conta: usuários (0) → preço (0,25 s) → MRR (0,5 s) → × 12 (1,25 s) → ARR (1,45 s)
  const mrrShown = useCountUp(isSim ? monthly : 0, 500, 700);
  const arrShown = useCountUp(isSim ? monthly * 12 : 0, 1450, 800);

  // O 3D acompanha as mudanças no simulador (anel de receita refaz a conta)
  const firstRun = useRef(true);
  useEffect(() => {
    if (!isSim) {
      firstRun.current = true;
      return;
    }
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    window.dispatchEvent(new CustomEvent('kizuna:revenue', { detail: { strength: Math.min(1, 0.4 + users / 160) } }));
  }, [users, isSim]);
  const { implementation, integration } = simPlan.estimates;

  return (
    <div className="relative w-full h-full select-none">
      <LegibilityVeil side="left" />
      <div className="relative h-full max-w-6xl mx-auto px-6 md:px-14 py-4 short:py-1 flex flex-col justify-center overflow-y-auto">
        <div className={isSim ? 'w-full md:max-w-[64%] lg:max-w-[56%]' : 'w-full md:max-w-[58%] lg:max-w-[52%]'}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Kicker code="08" label="Planos e receita" jp="価" />
            <Classification kind="preco">{PRICING.badge}</Classification>
          </div>
          <SceneStage index={isSim ? 1 : 0}>
          <DisplayTitle className="mt-4 short:mt-2 short:!text-[1.8rem] short:lg:!text-[2.15rem]">
            {isSim ? (
              <>
                Receita recorrente <Accent>por usuário.</Accent>
              </>
            ) : (
              <>
                À medida que a confiança cresce, <Accent>a plataforma cresce.</Accent>
              </>
            )}
          </DisplayTitle>
          </SceneStage>

          {/* trilha de níveis fica fixa entre Start, Business e Enterprise; só as cores mudam */}
          {!isSim && (
            <div className="mt-5 short:mt-2">
              <LevelTrail level={scene} />
            </div>
          )}

          {/* troca de cena: o plano anterior sai e o próximo entra (SceneStage), sem remontar a tela */}
          <SceneStage index={scene}>
          {!isSim ? (
            <div key={plan.id}>
              <div className="mt-4 short:mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="font-display font-semibold text-2xl md:text-3xl short:text-2xl text-washi">{plan.name}</h2>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-semibold text-3xl md:text-4xl short:text-3xl text-washi tabular-nums">{yen(plan.priceMonthly)}</span>
                  <span className="text-xs text-washi-dim">
                    /usuário/mês <span className="font-display text-kin-soft">税抜</span>
                  </span>
                </div>
              </div>
              <div className="mt-1 text-sm text-kin-soft">{plan.audience}</div>
              <ul className="mt-3 short:mt-2 border-t border-washi/10">
                {plan.features.map((f, i) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 py-1.5 short:py-0.5 border-b border-washi/10 text-sm md:text-base short:text-sm text-washi animate-fadeIn"
                    style={{ animationDelay: `${150 + i * 80}ms`, animationFillMode: 'both' }}
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
              {plan.id === 'start' && (
                <div className="mt-3 short:mt-2 border-l-2 border-kin pl-3">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-kin-soft">{PRICING.trial.label}</div>
                  <p className="text-xs md:text-sm text-washi-muted mt-0.5">{PRICING.trial.text}</p>
                </div>
              )}
            </div>
          ) : (
            <div key="simulator" className="mt-5 short:mt-2 flex flex-col gap-4 md:gap-5 short:gap-2">
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
                    className={`min-w-[46px] px-2.5 py-1 short:py-0.5 border text-sm tabular-nums transition-colors ${
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
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-3 md:gap-5 border-y border-washi/15 py-4 short:py-1.5">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-washi-dim">Receita mensal (MRR)</div>
                  <div key={'f' + users} className="mt-1 text-sm md:text-base text-washi-muted tabular-nums">
                    <span className="step-in inline-block">{users} usuários</span>{' '}
                    <span className="step-in inline-block" style={{ animationDelay: '250ms' }}>
                      × {yen(simPlan.priceMonthly)}
                    </span>
                  </div>
                  <div className="font-display font-semibold text-3xl md:text-4xl lg:text-5xl short:text-3xl text-washi tabular-nums" aria-label={yen(monthly)}>
                    {yen(mrrShown)}
                  </div>
                </div>
                <div key={'x' + users} className="flex flex-col items-center pb-2 text-washi-dim step-in" style={{ animationDelay: '1250ms' }} aria-hidden>
                  <span className="text-sm tabular-nums">× 12</span>
                  <span className="text-2xl leading-none">→</span>
                </div>
                <div key={'a' + users} className="step-in" style={{ animationDelay: '1400ms' }}>
                  <div className="text-xs uppercase tracking-[0.2em] text-washi-dim">Receita anual (ARR)</div>
                  <div className="mt-1 text-sm md:text-base text-washi-muted">{PRICING.annualRule}</div>
                  <div className="font-display font-semibold text-3xl md:text-4xl lg:text-5xl short:text-3xl text-beni-soft tabular-nums" aria-label={yen(monthly * 12)}>
                    {yen(arrShown)}
                  </div>
                </div>
              </div>

              {/* 3. O que é recorrente e o que é cobrado à parte, sob proposta */}
              <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3 md:gap-6">
                <div className="border-l-2 border-washi/40 pl-3">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-washi-dim">Recorrente</div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-washi-muted">
                    <Layers className="w-4 h-4" aria-hidden /> Licenças
                  </div>
                  <div className="text-lg md:text-xl text-washi tabular-nums">{yen(monthly)}/mês</div>
                </div>
                <div className="border-l-2 border-washi/15 pl-3">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-washi-dim">Adicional • à parte, sob proposta</div>
                  <div className="mt-1 grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-sm text-washi-muted">
                        <Wrench className="w-4 h-4" aria-hidden /> Implantação
                      </div>
                      <div className="text-lg md:text-xl text-washi tabular-nums">{yen(implementation)}</div>
                      <div className="text-[11px] text-washi-dim">{PRICING.estimateLabel}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-sm text-washi-muted">
                        <Plug className="w-4 h-4" aria-hidden /> Integrações
                      </div>
                      <div className="text-lg md:text-xl text-washi tabular-nums">{integration === null ? 'Fora do escopo' : yen(integration)}</div>
                      <div className="text-[11px] text-washi-dim">{integration === null ? simPlan.integrationPolicy : PRICING.estimateLabel}</div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs short:text-[11px] text-washi-dim">{PRICING.expansionJourney.disclaimer}</p>
            </div>
          )}
          </SceneStage>
        </div>
      </div>
    </div>
  );
};
export default PlansSection;
