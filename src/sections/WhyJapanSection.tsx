import React from 'react';
import { usePresentation } from '../core/PresentationContext';
import { Kicker, DisplayTitle, Accent, Classification, LegibilityVeil } from '../components/strategic/Editorial';

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

/**
 * Tela 02 • Por que o Japão.
 * Cena 1 — família C (evidência): dois números grandes, sem caixas.
 * Cena 2 — família A (cinematográfica): o ano 1908 domina a composição.
 */
export const WhyJapanSection: React.FC = () => {
  const { sceneIndex } = usePresentation();
  const scene = Math.min(1, Math.max(0, sceneIndex));

  if (scene === 0) {
    return (
      <div className="relative w-full h-full select-none">
        <LegibilityVeil side="left" />
        <div className="relative h-full max-w-6xl mx-auto px-6 md:px-14 py-4 flex flex-col justify-center gap-6 md:gap-10 short:gap-4 overflow-y-auto">
          <div>
            <Kicker code="02" label="Por que o Japão" jp="なぜ日本か" />
            <DisplayTitle className="mt-4 short:mt-2">
              Muitas PMEs. <Accent>Pressão para modernizar.</Accent>
            </DisplayTitle>
          </div>

          <div key="figures" className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 animate-fadeIn">
            {FIGURES.map((f) => (
              <div key={f.number} className="relative border-t border-washi/15 pt-4 short:pt-2">
                <div className=" font-display font-semibold text-washi leading-none text-5xl sm:text-6xl lg:text-[5.5rem] short:text-[3.25rem] tabular-nums">
                  {f.number}
                </div>
                <p className="mt-3 short:mt-2 max-w-md text-base md:text-lg short:text-base text-washi leading-snug">{f.text}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-washi-dim">
                  <Classification kind={f.kind} />
                  <span>{f.source}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="max-w-3xl text-base md:text-lg short:text-base text-washi-muted">
            Oportunidade para uma solução simples de adotar — desde que respeite um mercado que exige confiança e governança.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full select-none">
      <LegibilityVeil side="left" />
      <div
        key="bridge"
        className="relative h-full max-w-6xl mx-auto px-6 md:px-14 py-4 grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-center gap-4 md:gap-12 overflow-y-auto animate-fadeIn"
      >
        <div>
          <Kicker code="02" label="Uma ponte histórica" />
          <div
            className="mt-2 font-display font-semibold leading-none text-[5.5rem] sm:text-[7rem] md:text-[9rem] lg:text-[11rem] text-transparent [-webkit-text-stroke:1.5px_#C9A45C]"
            aria-label="1908"
          >
            1908
          </div>
          <div className="mt-2 text-xs md:text-sm uppercase tracking-[0.24em] text-kin-soft">Kasato Maru • Brasil ↔ Japão</div>
        </div>

        <div className="md:border-l md:border-washi/10 md:pl-10">
          <DisplayTitle size="md" as="h1">
            Uma ponte que já existe <Accent>desde 1908.</Accent>
          </DisplayTitle>
          <p className="mt-5 text-lg md:text-2xl text-washi leading-snug">
            O Brasil abriga a maior comunidade de origem japonesa fora do Japão — cerca de 2 milhões de pessoas (as estimativas variam).
          </p>
          <p className="mt-4 text-base md:text-lg text-washi-muted">
            É uma ponte cultural e de confiança, não uma vantagem comercial garantida.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-washi-dim">
            <Classification kind="externo" />
            <span>MOFA Japan / Museu da Imigração do Estado de São Paulo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WhyJapanSection;
