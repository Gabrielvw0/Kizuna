import React from 'react';
import { usePresentation } from '../core/PresentationContext';
import { ScreenTitle } from '../components/strategic/ScreenTitle';

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

/** Tela 03 • O Japão exige contexto (R1) — 4 portas e a síntese Global × Local. */
export const ContextSection: React.FC = () => {
  const { sceneIndex, setSceneIndex } = usePresentation();
  const scene = Math.min(4, Math.max(0, sceneIndex));
  const isSynthesis = scene === 4;
  const door = DOORS[Math.min(3, scene)];

  return (
    <div className="relative w-full h-full flex flex-col justify-center gap-6 px-6 md:px-14 py-6 max-w-6xl mx-auto overflow-y-auto select-none">
      <ScreenTitle
        kicker="03 • R1 • Choque cultural"
        title={
          isSynthesis ? (
            <>
              Global sem contexto <span className="text-rose-500">não é aceito.</span>
            </>
          ) : (
            <>
              O Japão não é <span className="text-rose-500">apenas outro mercado.</span>
            </>
          )
        }
      />

      {/* As 4 portas: escolher uma porta mostra o que ela exige do produto */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="tablist" aria-label="Portas de entrada no Japão">
        {DOORS.map((d, i) => {
          const active = scene === i;
          const visited = isSynthesis || i < scene;
          return (
            <button
              key={d.title}
              role="tab"
              aria-selected={active}
              onClick={() => setSceneIndex(i)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                active
                  ? 'bg-rose-950/60 border-rose-500 shadow-[0_0_25px_rgba(225,29,72,0.3)]'
                  : visited
                  ? 'bg-slate-900/80 border-rose-500/30'
                  : 'bg-slate-950/70 border-white/10 hover:border-white/30'
              }`}
            >
              <div className="text-2xl font-serif text-white">{d.kanji}</div>
              <div className="mt-1 text-sm font-black text-white">{d.title}</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">Porta {i + 1}</div>
            </button>
          );
        })}
      </div>

      {!isSynthesis ? (
        <div key={door.title} className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-slate-950/85 border border-white/15">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">O que o mercado espera</div>
            <p className="mt-2 text-base sm:text-lg text-white leading-snug">{door.seen}</p>
          </div>
          <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300">O que isso exige do Kizuna</div>
            <p className="mt-2 text-base sm:text-lg text-white font-semibold leading-snug">{door.requires}</p>
          </div>
        </div>
      ) : (
        <div key="synthesis" className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-5 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-sky-950/30 border border-sky-500/40">
            <div className="text-xs font-mono tracking-[0.25em] text-sky-300">GLOBAL</div>
            <p className="mt-2 text-sm text-white">Engenharia, escala e métodos internacionais.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-6xl font-serif text-white drop-shadow-[0_0_30px_rgba(225,29,72,0.8)]">絆</div>
            <div className="text-[10px] font-mono tracking-[0.25em] text-rose-400 mt-1">KIZUNA</div>
          </div>
          <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/40">
            <div className="text-xs font-mono tracking-[0.25em] text-rose-300">LOCAL</div>
            <p className="mt-2 text-sm text-white">Keigo, Ringi e Hanko, leis japonesas e relação de longo prazo.</p>
          </div>
          <p className="md:col-span-3 text-center text-sm sm:text-base text-slate-200">
            O produto nasce da união: capacidade global, adaptada desde o início ao contexto japonês.
          </p>
        </div>
      )}
    </div>
  );
};
export default ContextSection;
