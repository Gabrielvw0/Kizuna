import React from 'react';
import { usePresentation } from '../core/PresentationContext';
import { Kicker, DisplayTitle, Accent, AkaiIto, LegibilityVeil } from '../components/strategic/Editorial';

const DOORS = [
  {
    kanji: '文化',
    title: 'Cultura',
    seen: 'Hierarquia explícita, formalidade e decisão por consenso.',
    requires: 'Papéis claros no produto: direção, gerência, equipe e indivíduo.'
  },
  {
    kanji: '言語',
    title: 'Idioma',
    seen: 'Tradução literal soa desrespeitosa e reduz a percepção de seriedade.',
    requires: 'Interface e notificações em japonês corporativo (Keigo), com suporte local.'
  },
  {
    kanji: '商習慣',
    title: 'Hábitos empresariais',
    seen: 'Decisões passam por alinhamento prévio (Nemawashi) e aprovação formal (Ringi) com carimbo (Hanko).',
    requires: 'Fluxos de aprovação e registro que reproduzam esse rito, sem atalhos.'
  },
  {
    kanji: '規制',
    title: 'Regulação',
    seen: 'Proteção de dados (APPI), livros eletrônicos e fatura qualificada são exigências legais.',
    requires: 'Separar o que é lei do que é certificação técnica (ISO/IEC 27001, JIS Q 27001).'
  }
];

/**
 * Tela 03 • O Japão exige contexto (R1).
 * Cenas 1–4 — família B (narrativa): índice das portas à esquerda, leitura à direita.
 * Cena 5 — família A (cinematográfica): Global e Local em volta da fusão 3D.
 */
export const ContextSection: React.FC = () => {
  const { sceneIndex, setSceneIndex } = usePresentation();
  const scene = Math.min(4, Math.max(0, sceneIndex));
  const isSynthesis = scene === 4;
  const door = DOORS[Math.min(3, scene)];

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
              <AkaiIto className="mt-2 w-24 !from-ai !via-ai/60" knot={false} />
              <p className="mt-3 text-lg md:text-2xl font-display text-washi leading-snug">
                Engenharia, escala e métodos internacionais.
              </p>
            </div>
            <div className="hidden md:flex flex-col items-center">
              <div className="font-display text-6xl lg:text-7xl text-washi drop-shadow-[0_0_30px_rgba(215,38,61,0.9)]">絆</div>
            </div>
            <div className="text-right">
              <div className="text-xs md:text-sm uppercase tracking-[0.28em] text-beni-soft">Local</div>
              <AkaiIto className="mt-2 w-24 ml-auto rotate-180" knot={false} />
              <p className="mt-3 text-lg md:text-2xl font-display text-washi leading-snug">
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
      <LegibilityVeil side="left" />
      <div className="relative h-full max-w-6xl mx-auto px-6 md:px-14 py-4 flex flex-col justify-center gap-5 md:gap-8 short:gap-4 overflow-y-auto">
        <div>
          <Kicker code="03" label="R1 • Choque cultural" jp="文脈" />
          <DisplayTitle className="mt-4 short:mt-2">
            O Japão não é <Accent>apenas outro mercado.</Accent>
          </DisplayTitle>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-4 md:gap-12">
          {/* Índice das 4 portas: escolher uma porta mostra o que ela exige do produto */}
          <div
            className="grid grid-cols-4 md:grid-cols-1 border-t border-washi/10"
            role="tablist"
            aria-label="Portas de entrada no Japão"
          >
            {DOORS.map((d, i) => {
              const active = scene === i;
              const visited = i < scene;
              return (
                <button
                  key={d.title}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSceneIndex(i)}
                  className={`relative flex flex-col md:flex-row md:items-baseline gap-0.5 md:gap-4 py-2.5 md:py-3 short:py-1.5 pl-3 md:pl-5 pr-2 text-left border-b border-washi/10 transition-colors ${
                    active ? 'bg-beni/10' : 'hover:bg-washi/[0.04]'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute left-0 top-0 bottom-0 w-[2px] ${active ? 'bg-beni' : visited ? 'bg-beni/35' : 'bg-transparent'}`}
                  />
                  <span className={`whitespace-nowrap font-display text-xl md:text-2xl ${active ? 'text-washi' : 'text-washi-muted'}`}>{d.kanji}</span>
                  <span className={`text-xs md:text-base ${active ? 'text-washi font-semibold' : 'text-washi-dim'}`}>{d.title}</span>
                </button>
              );
            })}
          </div>

          <div key={door.title} className="flex flex-col justify-center gap-5 md:gap-7 short:gap-3 animate-fadeIn">
            <div>
              <div className="text-xs md:text-sm uppercase tracking-[0.22em] text-washi-dim">O que o mercado espera</div>
              <p className="mt-2 font-display text-xl md:text-[1.9rem] short:text-[1.35rem] text-washi leading-snug">{door.seen}</p>
            </div>
            <AkaiIto className="w-40 md:w-64" />
            <div>
              <div className="text-xs md:text-sm uppercase tracking-[0.22em] text-beni-soft">O que isso exige do Kizuna</div>
              <p className="mt-2 text-lg md:text-2xl short:text-lg text-washi font-semibold leading-snug">{door.requires}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ContextSection;
