import React from 'react';
import { usePresentation } from '../core/PresentationContext';

/** Tela 01 • Abertura — impacto. Cena 1: o fio vermelho. Cena 2: 絆 KIZUNA. */
export const IntroSection: React.FC = () => {
  const { sceneIndex } = usePresentation();
  const scene = Math.min(1, Math.max(0, sceneIndex));

  return (
    <div className="relative w-full h-full flex items-center justify-center px-6 select-none">
      {scene === 0 ? (
        <div key="thread" className="max-w-2xl text-center animate-fadeIn">
          <div className="text-[11px] font-mono uppercase tracking-[0.35em] text-rose-400">赤い糸 • o fio vermelho</div>
          <h1 className="mt-3 text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Tecnologia global.
            <span className="block text-rose-500">Um destino que exige confiança.</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 font-light leading-relaxed">
            Um projeto acadêmico, com a Globant como referência empresarial, propõe levar ao Japão uma solução de gestão de equipes.
          </p>
        </div>
      ) : (
        <div key="kizuna" className="flex flex-col items-center text-center animate-fadeIn">
          <div className="text-8xl sm:text-9xl font-serif text-rose-500 drop-shadow-[0_0_40px_rgba(225,29,72,0.7)]">絆</div>
          <h1 className="mt-2 text-4xl sm:text-6xl font-black tracking-[0.25em] text-white">KIZUNA</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 tracking-[0.2em]">kizuna: vínculo que permanece</p>
          <div className="mt-6 px-5 py-2 rounded-2xl bg-slate-950/80 border border-rose-500/40">
            <span className="text-base sm:text-xl font-mono font-bold tracking-[0.22em] text-white">GLOBAL REACH. LOCAL TRUST.</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default IntroSection;
