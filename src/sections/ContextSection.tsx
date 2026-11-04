import React from 'react';
import { usePresentation } from '../core/PresentationContext';
import { Kicker, DisplayTitle, Accent, LegibilityVeil } from '../components/strategic/Editorial';

const DOORS = [
  {
    kanji: '文化',
    reading: 'bunka',
    title: 'Cultura',
    label: 'Papéis e responsabilidades',
    context: 'Expectativa frequente no mercado japonês',
    seen: 'Hierarquia explícita, formalidade e decisão por consenso.',
    requires: 'Papéis claros no produto: direção, gerência, equipe e indivíduo.'
  },
  {
    kanji: '言語',
    reading: 'gengo',
    title: 'Idioma',
    label: 'Comunicação em japonês',
    context: 'Expectativa frequente no mercado japonês',
    seen: 'Tradução literal soa desrespeitosa e reduz a percepção de seriedade.',
    requires: 'Interface e notificações em japonês corporativo (Keigo), com suporte local.'
  },
  {
    kanji: '商習慣',
    reading: 'shōshūkan',
    title: 'Hábitos empresariais',
    label: 'Aprovações e consenso',
    context: 'Prática frequente em empresas japonesas',
    seen: 'Decisões passam por alinhamento prévio (Nemawashi) e aprovação formal (Ringi) com carimbo (Hanko).',
    requires: 'Fluxos de aprovação e registro que reproduzam esse rito, sem atalhos.'
  },
  {
    kanji: '規制',
    reading: 'kisei',
    title: 'Regulação',
    label: 'Conformidade e requisitos',
    context: 'Exigência legal no Japão',
    seen: 'Proteção de dados (APPI), livros eletrônicos e fatura qualificada são exigências legais.',
    requires: 'Separar o que é lei do que é certificação técnica (ISO/IEC 27001, JIS Q 27001).'
  }
];

/**
 * Tela 03 • O Japão exige contexto (R1).
 * Cenas 1–4 — quatro portas lado a lado (número, japonês, português); a porta aberta
 *   se expande e traz dentro dela o contexto e a consequência para o Kizuna.
 * Cena 5 — família A (cinematográfica): Global e Local em volta da fusão 3D.
 */
export const ContextSection: React.FC = () => {
  const { sceneIndex, setSceneIndex } = usePresentation();
  const scene = Math.min(4, Math.max(0, sceneIndex));
  const isSynthesis = scene === 4;

  if (isSynthesis) {
    return (
      <div className="relative w-full h-full select-none">
        <LegibilityVeil side="bottom" />
        <div
          key="synthesis"
          className="relative h-full max-w-6xl mx-auto px-6 md:px-14 py-4 flex flex-col justify-between gap-4 overflow-y-auto animate-fadeIn"
        >
          <div className="text-center pt-2 md:pt-6">
            <Kicker code="03" label="R1 • Síntese" className="justify-center" />
            <DisplayTitle className="mt-3">
              Global sem contexto <Accent>não é aceito.</Accent>
            </DisplayTitle>
          </div>

          {/* O centro fica livre para a fusão 3D (os dois blocos que se unem). */}
          <div className="grid grid-cols-2 md:grid-cols-[1fr_minmax(160px,1.1fr)_1fr] items-center gap-4">
            <div className="text-left">
              <div className="text-xs md:text-sm uppercase tracking-[0.28em] text-ai-soft">Global</div>
              <p className="mt-2 text-lg md:text-2xl font-display text-washi leading-snug">
                Engenharia, escala e métodos internacionais.
              </p>
            </div>
            <div className="hidden md:flex flex-col items-center">
              <div className="font-display text-6xl lg:text-7xl text-washi drop-shadow-[0_0_30px_rgba(215,38,61,0.9)]">絆</div>
            </div>
            <div className="text-right">
              <div className="text-xs md:text-sm uppercase tracking-[0.28em] text-beni-soft">Local</div>
              <p className="mt-2 text-lg md:text-2xl font-display text-washi leading-snug">
                Keigo, Ringi e Hanko, leis japonesas e relação de longo prazo.
              </p>
            </div>
          </div>

          <p className="text-center text-base md:text-xl text-washi pb-2 md:pb-6">
            O produto nasce da união: capacidade global, adaptada desde o início ao contexto japonês.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full select-none">
      <LegibilityVeil side="bottom" />
      <div className="relative h-full max-w-6xl mx-auto px-6 md:px-14 py-4 flex flex-col justify-center gap-5 md:gap-7 short:gap-3">
        <div>
          <Kicker code="03" label="R1 • Choque cultural" jp="文脈" />
          <DisplayTitle className="mt-4 short:mt-2">
            O Japão não é <Accent>apenas outro mercado.</Accent>
          </DisplayTitle>
          <p className="mt-2 text-sm md:text-base text-washi-muted">
            Quatro dimensões da adaptação. A porta aberta é a que estamos explicando.
          </p>
        </div>

        {/* Quatro portas lado a lado: cada uma identificada; a aberta traz a explicação dentro dela */}
        <div
          className="flex gap-2 md:gap-3 h-[min(54vh,470px)] short:h-[min(57vh,400px)]"
          role="tablist"
          aria-label="Quatro dimensões da adaptação ao Japão"
        >
          {DOORS.map((d, i) => {
            const active = scene === i;
            const num = String(i + 1).padStart(2, '0');
            return (
              <button
                key={d.title}
                role="tab"
                aria-selected={active}
                aria-label={`${num} ${d.title} (${d.kanji}): ${d.label}`}
                onClick={() => setSceneIndex(i)}
                className={`group relative min-w-0 overflow-hidden text-left border border-t-[3px] transition-[flex-grow,background-color,border-color] duration-500 ease-out ${
                  active
                    ? 'flex-[4.4_1_0%] lg:flex-[3.4_1_0%] border-beni border-t-beni bg-sumi-700/95'
                    : 'flex-[1_1_0%] border-washi/10 border-t-washi/30 bg-sumi-800/90 hover:bg-sumi-700/90'
                }`}
              >
                {/* luz interna da porta aberta */}
                {active && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(242,238,230,0.10)_0%,transparent_65%)]"
                  />
                )}

                <div className="relative h-full flex flex-col p-3 md:p-4 lg:p-5 short:p-3">
                  {/* identificação: número, japonês, português */}
                  <div className={active ? 'flex items-start gap-4' : ''}>
                    {active && (
                      <div className="font-display text-washi leading-none whitespace-nowrap text-4xl md:text-5xl short:text-4xl">{d.kanji}</div>
                    )}
                    <div className="min-w-0">
                      <div className={`text-xs md:text-sm font-semibold tabular-nums tracking-[0.18em] ${active ? 'text-beni-soft' : 'text-washi-dim'}`}>
                        {num}
                      </div>
                      {!active && (
                        <div className="mt-2 font-display text-2xl md:text-3xl short:text-2xl text-washi leading-none whitespace-nowrap">{d.kanji}</div>
                      )}
                      <div className={`mt-1.5 font-semibold leading-tight ${active ? 'text-lg md:text-xl text-washi' : 'text-xs md:text-sm text-washi-muted'}`}>
                        {d.title}
                      </div>
                      <div className="text-[11px] md:text-xs italic text-washi-dim">{d.reading}</div>
                    </div>
                  </div>

                  {active ? (
                    <div key={d.title} className="mt-4 md:mt-6 short:mt-2.5 flex flex-col gap-4 md:gap-5 short:gap-2.5 animate-fadeIn">
                      <div>
                        <div className="text-[11px] md:text-xs uppercase tracking-[0.2em] text-washi-dim">{d.context}</div>
                        <p className="mt-1.5 font-display text-lg md:text-xl lg:text-2xl short:text-base short:lg:text-lg text-washi leading-snug">{d.seen}</p>
                      </div>
                      <div className="border-t border-beni/40 pt-3 short:pt-2">
                        <div className="text-[11px] md:text-xs uppercase tracking-[0.2em] text-beni-soft">
                          Para o Kizuna • {d.label}
                        </div>
                        <p className="mt-1.5 text-base md:text-lg short:text-[15px] short:lg:text-base text-washi font-semibold leading-snug">{d.requires}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto hidden lg:block border-t border-washi/10 pt-2">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-washi-dim">Para o Kizuna</div>
                      <div className="mt-0.5 text-sm text-washi-muted leading-snug">{d.label}</div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default ContextSection;
