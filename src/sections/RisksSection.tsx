import React, { useState } from 'react';
import { X } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import metricsData from '../data/metrics.json';
import { Kicker, DisplayTitle, Accent, Classification } from '../components/strategic/Editorial';
import { SceneStage } from '../components/strategic/SceneStage';

/*
 * Tela 11 • Riscos e planejamento de 12 meses — painel executivo (Etapa 8).
 * 11.1 Matriz de riscos: risco → gatilho de alerta → resposta proposta; uma linha pode ser expandida.
 * 11.2 Roadmap: quatro marcos numa linha do tempo horizontal.
 * Tudo vem de metrics.json e é proposta/meta: nenhum gatilho é medição real e nenhum marco foi realizado.
 * Sem radar 3D (WorldStage): a informação é o elemento visual.
 */

const { riskPanel, phases, transversalIndicator, kpis } = metricsData;

// Objetivo de cada marco (redação da banca para a linha do tempo)
const OBJECTIVES: Record<string, string> = {
  m0_3: 'Validar necessidades, dores operacionais e aderência da proposta.',
  m3_6: 'Testar a solução em empresas selecionadas.',
  m6_9: 'Avaliar a experiência dos usuários e a aderência do produto.',
  m9_12: 'Avaliar a viabilidade comercial e a possibilidade de expansão.'
};

const T = {
  label: 'text-[clamp(0.62rem,0.55rem+0.2vw,0.84rem)] uppercase tracking-[0.2em] text-washi-dim',
  seal: '!text-[clamp(0.6rem,0.5rem+0.22vw,0.8rem)] !px-[0.6em] !py-[0.25em]'
};

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const pad = (n: number) => String(n).padStart(2, '0');
// "0–3 MESES" → "0–3 meses"
const months = (p: string) => p.toLowerCase();

/* ------------------------------------------------------------------------------------------------
 * 11.1 • Matriz de riscos
 * ---------------------------------------------------------------------------------------------- */

const RiskMatrix: React.FC = () => {
  const [open, setOpen] = useState<string | null>(null);
  const cols = 'grid grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1.7fr)] gap-x-[clamp(0.9rem,2.6vw,3rem)]';
  const disclaimer = riskPanel.disclaimer.split('. ')[0] + '.';

  return (
    <div className="h-full flex flex-col">
      {/* cabeçalho da matriz */}
      <div className={`${cols} shrink-0 pb-[clamp(0.35rem,1.2vh,0.8rem)] border-b border-washi/20`}>
        <span className={T.label}>Risco</span>
        <span className={T.label}>Gatilho de alerta</span>
        <div className="flex items-center justify-between gap-3">
          <span className={T.label}>Resposta proposta</span>
          {open && (
            <button
              onClick={() => setOpen(null)}
              className={`${T.label} !text-washi-muted hover:!text-washi inline-flex items-center gap-1 focus:outline-none`}
            >
              <X className="w-[1.1em] h-[1.1em]" aria-hidden /> Visão geral
            </button>
          )}
        </div>
      </div>

      <ol className="flex-1 min-h-0 flex flex-col">
        {riskPanel.quadrants.map((q, i) => {
          const isOpen = open === q.id;
          const dim = open !== null && !isOpen;
          return (
            <li
              key={q.id}
              className={`step-in border-b border-washi/10 transition-[flex-grow,opacity] duration-500 motion-reduce:transition-none ${
                isOpen ? 'flex-[0_0_auto]' : 'flex-[1_1_auto]'
              } ${dim ? 'opacity-55' : ''} min-h-0`}
              style={{ animationDelay: `${80 + i * 90}ms` }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : q.id)}
                aria-expanded={isOpen}
                className={`relative w-full h-full text-left ${cols} items-center py-[clamp(0.35rem,1.4vh,1rem)] focus:outline-none transition-colors duration-300 ${
                  isOpen ? 'bg-washi/[0.05]' : 'hover:bg-washi/[0.025]'
                }`}
              >
                {isOpen && <span aria-hidden className="absolute left-0 top-0 bottom-0 w-[3px] bg-beni" />}
                {/* risco */}
                <span className="flex items-baseline gap-[clamp(0.6rem,1.4vw,1.4rem)] pl-[clamp(0.6rem,1vw,1rem)] min-w-0">
                  <span className="font-display text-[clamp(1.3rem,min(0.9rem+1.3vw,0.4rem+3.6vh),2.7rem)] leading-none text-beni-soft tabular-nums">{pad(i + 1)}</span>
                  <span className="min-w-0">
                    <span className="block text-[clamp(1rem,min(0.75rem+0.8vw,0.35rem+2.5vh),1.65rem)] font-semibold leading-tight text-washi">{titleCase(q.title)}</span>
                    <span className="block text-[clamp(0.64rem,0.56rem+0.22vw,0.88rem)] text-washi-dim [@media(max-height:640px)]:hidden">{q.jp}</span>
                  </span>
                </span>
                {/* gatilho */}
                <span className="min-w-0 border-l-2 border-beni/70 pl-[clamp(0.6rem,1.2vw,1.2rem)]">
                  <span className="block text-[clamp(0.7rem,0.6rem+0.28vw,0.95rem)] text-washi-muted leading-tight">{q.trigger}</span>
                  <span className="block mt-[0.15em] text-[clamp(0.95rem,min(0.7rem+0.75vw,0.3rem+2.4vh),1.55rem)] font-semibold leading-tight text-beni-soft tabular-nums">
                    {q.triggerValue}
                  </span>
                </span>
                {/* resposta */}
                <span className="min-w-0 pr-[clamp(0.4rem,1vw,1rem)]">
                  {/* com uma linha aberta, as demais ficam compactas (risco e gatilho) para dar espaço ao detalhe */}
                  <span className={`block text-[clamp(0.84rem,min(0.66rem+0.55vw,0.3rem+1.9vh),1.3rem)] leading-snug text-washi ${dim ? 'hidden' : ''}`}>
                    {q.response}
                  </span>
                  {isOpen && (
                    <span className="step-in block mt-[clamp(0.4rem,1.4vh,1rem)] border-t border-washi/15 pt-[clamp(0.35rem,1.2vh,0.8rem)]">
                      <span className={`block ${T.label}`}>Contexto do risco</span>
                      <span className="block mt-[0.25em] text-[clamp(0.84rem,min(0.66rem+0.55vw,0.3rem+1.9vh),1.3rem)] leading-snug text-washi-muted">{q.risk}</span>
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="shrink-0 mt-[clamp(0.4rem,1.4vh,1rem)] text-[clamp(0.72rem,0.62rem+0.28vw,0.98rem)] text-washi-dim">
        {disclaimer} {open ? '' : 'Selecione uma linha para ver o contexto do risco.'}
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------------------------------------
 * 11.2 • Roadmap
 * ---------------------------------------------------------------------------------------------- */

const Roadmap: React.FC = () => {
  const [active, setActive] = useState<string>(phases[0].id);
  const n = phases.length;
  const x = (i: number) => ((i + 0.5) / n) * 100; // centro de cada coluna

  return (
    <div className="h-full flex flex-col">
      <LocalStyles />
      <div className="relative flex-1 min-h-0 flex flex-col [justify-content:safe_center]" style={{ '--node': 'clamp(1.1rem, 2.6vh, 1.75rem)' } as React.CSSProperties}>
        {/* faixa superior: número e período de cada marco */}
        <div className="grid shrink-0" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
          {phases.map((ph, i) => (
            <div key={ph.id} className="step-in flex items-baseline justify-center gap-[0.5em] px-2" style={{ animationDelay: `${200 + i * 220}ms` }}>
              <span className="font-display text-[clamp(1rem,0.8rem+0.6vw,1.6rem)] text-beni-soft tabular-nums">{pad(i + 1)}</span>
              <span className="text-[clamp(1.05rem,min(0.75rem+1vw,0.35rem+2.9vh),2rem)] font-semibold text-washi whitespace-nowrap">{months(ph.period)}</span>
            </div>
          ))}
        </div>

        {/* linha vermelha: desenha-se da esquerda para a direita ao entrar na cena (uma vez) */}
        <div className="relative shrink-0 my-[clamp(0.35rem,1.6vh,1.4rem)]" style={{ height: 'calc(var(--node) * 1.6)' }}>
          <span
            aria-hidden
            className="roadmap-line absolute left-[12.5%] right-[12.5%] top-1/2 -translate-y-1/2 h-[clamp(4px,0.7vh,7px)] bg-beni origin-left"
          />
          {phases.map((ph, i) => {
            const on = ph.id === active;
            return (
              <button
                key={ph.id}
                onClick={() => setActive(ph.id)}
                aria-pressed={on}
                aria-label={`${pad(i + 1)} ${months(ph.period)}`}
                className="step-in absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none"
                style={{ left: `${x(i)}%`, animationDelay: `${300 + i * 220}ms` }}
              >
                <span
                  className={`block rounded-full border-[3px] transition-[transform,background-color] duration-300 motion-reduce:transition-none ${
                    on ? 'bg-washi border-washi scale-125' : 'bg-sumi border-washi/80 hover:scale-110'
                  }`}
                  style={{ width: 'var(--node)', height: 'var(--node)' }}
                />
                {on && <span aria-hidden className="absolute -inset-[7px] rounded-full border-2 border-beni/60" />}
              </button>
            );
          })}
        </div>

        {/* faixa inferior: etapa, meta proposta e objetivo */}
        <div className="grid shrink-0" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
          {phases.map((ph, i) => {
            const on = ph.id === active;
            return (
              <button
                key={ph.id}
                onClick={() => setActive(ph.id)}
                className={`step-in min-w-0 flex flex-col justify-start text-left px-[clamp(0.6rem,1.4vw,1.6rem)] py-[clamp(0.5rem,1.6vh,1.1rem)] border-l transition-colors duration-300 focus:outline-none ${
                  on ? 'border-beni bg-washi/[0.04]' : 'border-washi/10 hover:bg-washi/[0.02]'
                }`}
                style={{ animationDelay: `${380 + i * 220}ms` }}
              >
                <span className={`block ${T.label}`}>{ph.stage}</span>
                <span className="block mt-[0.3em] font-display text-[clamp(1.5rem,min(1rem+1.9vw,0.3rem+4.6vh),3.6rem)] leading-none text-washi tabular-nums">
                  {ph.targetNumber}
                </span>
                <span className="block mt-[0.25em] text-[clamp(0.8rem,0.66rem+0.4vw,1.15rem)] text-washi-muted leading-tight">{ph.targetUnit}</span>
                <span className="block mt-[clamp(0.4rem,1.4vh,1rem)] text-[clamp(0.8rem,min(0.66rem+0.5vw,0.25rem+1.75vh),1.25rem)] leading-snug text-washi/90">
                  {OBJECTIVES[ph.id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* critério transversal: meta, não resultado */}
      <div className="shrink-0 mt-[clamp(0.5rem,2vh,1.5rem)] grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-[clamp(0.8rem,2.4vw,2.5rem)] border-y border-washi/15 py-[clamp(0.45rem,1.5vh,1rem)]">
        <div>
          <span className={`block ${T.label} [@media(max-height:640px)]:hidden`}>Critério de acompanhamento</span>
          <span className="flex items-baseline gap-[0.5em]">
            <span className="font-display text-[clamp(1.3rem,min(0.9rem+1.2vw,0.4rem+3.4vh),2.4rem)] text-beni-soft leading-none">{transversalIndicator.value}</span>
            <span className="text-[clamp(0.84rem,0.68rem+0.45vw,1.25rem)] font-semibold text-washi">{transversalIndicator.label}</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
          <span className="text-[clamp(0.74rem,0.62rem+0.3vw,1rem)] italic text-washi-muted [@media(max-height:640px)]:hidden">“{transversalIndicator.quote}”</span>
          <Classification kind="proposta" className={T.seal}>
            {transversalIndicator.badge}
          </Classification>
        </div>
      </div>
      <p className="shrink-0 mt-[clamp(0.35rem,1.2vh,0.9rem)] text-[clamp(0.7rem,0.6rem+0.26vw,0.95rem)] leading-snug text-washi-dim">
        Indicadores acompanhados: {kpis.items.map((k) => k.label).join(', ')} — metas numéricas definidas depois dos pilotos. Resultados realizados: nenhum. O projeto é acadêmico e ainda não tem operação.
      </p>
    </div>
  );
};

/** A linha do roadmap se desenha uma vez; com movimento reduzido aparece pronta. */
const LocalStyles = () => (
  <style>{`
    @keyframes roadmapDraw { from { transform: translateY(-50%) scaleX(0); } to { transform: translateY(-50%) scaleX(1); } }
    .roadmap-line { animation: roadmapDraw 1100ms cubic-bezier(.4,0,.2,1) 150ms both; }
    @media (prefers-reduced-motion: reduce) { .roadmap-line { animation: none; } }
  `}</style>
);

/**
 * Tela 11 • Riscos e planejamento.
 * A troca 11.1 ↔ 11.2 usa o mecanismo central (SceneStage); nada avança sozinho.
 */
export const RisksSection: React.FC = () => {
  const { sceneIndex } = usePresentation();
  const scene = Math.min(1, Math.max(0, sceneIndex));

  return (
    <div className="relative w-full h-full select-none">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-sumi/70" />
      <div className="relative h-full mx-auto w-[min(88%,1640px)] flex flex-col pt-[clamp(0.6rem,3.6vh,2.75rem)] pb-[clamp(0.5rem,3vh,2.25rem)]">
        <SceneStage index={scene} className="shrink-0">
          <header>
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
              <Kicker code="11" label="Riscos e planejamento de 12 meses" jp="標" className="!text-[clamp(0.68rem,0.6rem+0.22vw,0.9rem)]" />
              {scene === 0 ? (
                <Classification kind="proposta" className={T.seal}>
                  Gatilhos propostos • Não são medições
                </Classification>
              ) : (
                <Classification kind="projecao" className={T.seal}>
                  Cronograma e metas propostos • Projeção de 12 meses
                </Classification>
              )}
            </div>
            <DisplayTitle className="mt-[clamp(0.4rem,1.4vh,1.1rem)] !text-[clamp(1.6rem,min(3.1vw,5.8vh),3.9rem)]">
              {scene === 0 ? (
                <>
                  Quatro riscos, <Accent>uma resposta para cada.</Accent>
                </>
              ) : (
                <>
                  O primeiro ano <Accent>em quatro marcos.</Accent>
                </>
              )}
            </DisplayTitle>
          </header>
        </SceneStage>

        <div className="mt-[clamp(0.75rem,3.4vh,2.5rem)] flex-1 min-h-0">
          <SceneStage index={scene} className="h-full" fill>
            {scene === 0 ? <RiskMatrix /> : <Roadmap />}
          </SceneStage>
        </div>
      </div>
    </div>
  );
};
export default RisksSection;
