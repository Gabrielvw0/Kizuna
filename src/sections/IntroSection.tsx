import React from 'react';
import { usePresentation } from '../core/PresentationContext';
import { Kicker, Classification, LegibilityVeil } from '../components/strategic/Editorial';

/**
 * Tela 01 • Abertura — família A (cinematográfica). O globo é o elemento narrativo.
 * Cena 1: visão ampla; o planeta passa lentamente pela presença internacional da Globant.
 * Cena 2: rotação controlada até o Japão, que termina dominante à direita; 絆 KIZUNA à esquerda.
 * Texto sempre à esquerda para não cobrir a geografia.
 */
export const IntroSection: React.FC = () => {
  const { sceneIndex } = usePresentation();
  const scene = Math.min(1, Math.max(0, sceneIndex));

  return (
    <div className="relative w-full h-full select-none">
      <LegibilityVeil side="leftNarrow" />
      <div className="relative h-full max-w-6xl mx-auto px-6 md:px-14 py-4 flex items-center">
        {scene === 0 ? (
          <div key="world" className="w-full md:w-[55%] lg:w-1/2 animate-fadeIn">
            <Kicker code="01" label="Abertura" />
            <h1 className="mt-4 short:mt-2 font-display font-semibold text-washi !leading-[1.08] text-[2.2rem] sm:text-5xl lg:text-6xl short:text-[2.6rem]">
              Tecnologia global.
              <span className="block mt-1 text-beni-soft">Um destino que exige confiança.</span>
            </h1>
            <p className="mt-5 short:mt-3 max-w-xl text-base md:text-lg text-washi-muted leading-relaxed">
              Um projeto acadêmico, com a Globant como referência empresarial, propõe levar ao Japão uma solução de gestão de equipes.
            </p>

            {/* Legenda curta: distingue as categorias de presença; a fonte vem do relatório anual */}
            <div className="mt-6 short:mt-4 pt-4 short:pt-3 border-t border-washi/15 max-w-xl">
              <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs md:text-sm text-washi">
                <li className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-washi" aria-hidden /> Principais centros da Globant
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-ai" aria-hidden /> Demais países com subsidiária
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-beni" aria-hidden /> Japão: destino do projeto
                </li>
              </ul>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] md:text-xs text-washi-dim">
                <Classification kind="fato" />
                <span>Globant, Form 20-F 2025 (SEC): presença em 31 países</span>
              </div>
            </div>
          </div>
        ) : (
          <div key="kizuna" className="w-full md:w-[50%] lg:w-[46%] animate-fadeIn">
            <div className="font-display font-semibold text-beni leading-none text-[6rem] sm:text-[8rem] md:text-[9.5rem] short:text-[6.5rem] drop-shadow-[0_0_50px_rgba(215,38,61,0.45)]">
              絆
            </div>
            <h1 className="mt-3 font-display font-semibold text-washi text-4xl sm:text-5xl md:text-6xl short:text-5xl tracking-[0.3em]">
              KIZUNA
            </h1>
            <p className="mt-3 text-sm md:text-base text-washi-muted tracking-[0.16em]">kizuna • vínculo que permanece</p>
            <div className="mt-7 short:mt-5 pt-5 short:pt-4 border-t border-washi/15">
              <span className="whitespace-nowrap text-base sm:text-lg lg:text-2xl font-semibold tracking-[0.2em] text-washi">
                GLOBAL REACH. <span className="text-beni-soft">LOCAL TRUST.</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default IntroSection;
