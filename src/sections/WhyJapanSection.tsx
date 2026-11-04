import React from 'react';
import { usePresentation } from '../core/PresentationContext';
import { ScreenTitle, InfoTag } from '../components/strategic/ScreenTitle';

const FIGURES = [
  {
    number: '99,7%',
    text: 'das empresas no Japão são PMEs (cerca de 3,4 milhões).',
    source: 'METI / Agência de PMEs — Censo Econômico 2021 (pub. 2023)',
    kind: 'externo' as const
  },
  {
    number: '¥12 tri/ano',
    text: 'de perda econômica potencial a partir de 2025 se sistemas legados não forem modernizados (“Digital Cliff”).',
    source: 'METI — DX Report (2018) • estimativa de risco',
    kind: 'projecao' as const
  }
];

/** Tela 02 • Por que o Japão — explicação com dois números e a ponte histórica. */
export const WhyJapanSection: React.FC = () => {
  const { sceneIndex } = usePresentation();
  const scene = Math.min(1, Math.max(0, sceneIndex));

  return (
    <div className="relative w-full h-full flex flex-col justify-center gap-5 px-6 md:px-14 py-4 max-w-6xl mx-auto overflow-y-auto select-none">
      <ScreenTitle
        kicker="02 • Por que o Japão"
        title={
          scene === 0 ? (
            <>
              Muitas PMEs. <span className="text-rose-500">Pressão para modernizar.</span>
            </>
          ) : (
            <>
              Uma ponte que já existe <span className="text-rose-500">desde 1908.</span>
            </>
          )
        }
      />

      {scene === 0 ? (
        <div key="figures" className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
          {FIGURES.map((f) => (
            <div key={f.number} className="p-6 rounded-3xl bg-slate-950/85 border border-white/15">
              <div className="text-5xl sm:text-6xl font-black font-mono text-white">{f.number}</div>
              <p className="mt-3 text-sm sm:text-base text-slate-200 leading-snug">{f.text}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400">
                <InfoTag kind={f.kind} />
                <span>{f.source}</span>
              </div>
            </div>
          ))}
          <p className="md:col-span-2 text-sm text-slate-300">
            Oportunidade para uma solução simples de adotar — desde que respeite um mercado que exige confiança e governança.
          </p>
        </div>
      ) : (
        <div key="bridge" className="max-w-3xl p-7 rounded-3xl bg-slate-950/85 border border-amber-400/40 animate-fadeIn">
          <div className="text-xs font-mono tracking-[0.25em] text-amber-300">1908 • KASATO MARU • BRASIL ↔ JAPÃO</div>
          <p className="mt-3 text-lg sm:text-2xl font-bold text-white leading-snug">
            O Brasil abriga a maior comunidade de origem japonesa fora do Japão — cerca de 2 milhões de pessoas (as estimativas variam).
          </p>
          <p className="mt-3 text-sm text-slate-300">
            É uma ponte cultural e de confiança, não uma vantagem comercial garantida.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400">
            <InfoTag kind="externo" />
            <span>MOFA Japan / Museu da Imigração do Estado de São Paulo</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default WhyJapanSection;
