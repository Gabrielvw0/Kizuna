import React from 'react';
import { usePresentation } from '../core/PresentationContext';
import { AkaiIto, LegibilityVeil } from '../components/strategic/Editorial';

/**
 * Tela 01 • Abertura — família A (cinematográfica).
 * Cena 1: o fio vermelho sobre o globo. Cena 2: 絆 KIZUNA, o símbolo domina.
 */
export const IntroSection: React.FC = () => {
  const { sceneIndex } = usePresentation();
  const scene = Math.min(1, Math.max(0, sceneIndex));

  return (
    <div className="relative w-full h-full flex items-center justify-center px-6 select-none">
      <LegibilityVeil side="center" />
      {scene === 0 ? (
        <div key="thread" className="relative max-w-4xl text-center animate-fadeIn">
          <div className="flex items-center justify-center gap-3 text-[11px] md:text-xs uppercase tracking-[0.32em] text-washi-muted">
            <span className="font-display normal-case tracking-[0.2em] text-beni-soft">赤い糸</span>
            <AkaiIto className="w-10" knot={false} />
            <span>o fio vermelho</span>
          </div>
          <h1 className="mt-5 font-display font-semibold text-washi !leading-[1.08] text-[2.4rem] sm:text-5xl md:text-6xl lg:text-7xl">
            Tecnologia global.
            <span className="block mt-1 text-beni-soft">Um destino que exige confiança.</span>
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-base md:text-lg text-washi-muted leading-relaxed">
            Um projeto acadêmico, com a Globant como referência empresarial, propõe levar ao Japão uma solução de gestão de equipes.
          </p>
        </div>
      ) : (
        <div key="kizuna" className="relative flex flex-col items-center text-center animate-fadeIn">
          <div className="font-display font-semibold text-beni leading-none text-[7rem] sm:text-[9rem] md:text-[11rem] drop-shadow-[0_0_60px_rgba(215,38,61,0.55)]">
            絆
          </div>
          <h1 className="mt-3 font-display font-semibold text-washi text-4xl sm:text-5xl md:text-6xl tracking-[0.32em] pl-[0.32em]">
            KIZUNA
          </h1>
          <p className="mt-3 text-sm md:text-base text-washi-muted tracking-[0.18em]">kizuna • vínculo que permanece</p>
          <div className="mt-8 flex items-center gap-4">
            <AkaiIto className="w-10 md:w-20 rotate-180" knot={false} />
            <span className="text-base sm:text-xl md:text-2xl font-semibold tracking-[0.28em] text-washi">
              GLOBAL REACH. <span className="text-beni-soft">LOCAL TRUST.</span>
            </span>
            <AkaiIto className="w-10 md:w-20" knot={false} />
          </div>
        </div>
      )}
    </div>
  );
};
export default IntroSection;
