import React from 'react';
import { RotateCcw, BookOpen, ShieldCheck } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';

const TAKEAWAYS = [
  { title: 'Começa pela equipe', text: 'Kizuna Start: atividades, equipes, projetos e indicadores.' },
  { title: 'Respeita o contexto', text: 'Keigo, Ringi e Hanko, leis japonesas como requisitos.' },
  { title: 'Cresce com a confiança', text: 'Pilotos, referências e expansão Start → Enterprise.' }
];

/** Tela 12 • Encerramento — uma síntese, uma frase final. */
export const FinaleSection: React.FC = () => {
  const { goToSection, toggleBancaMode, toggleEvidence } = usePresentation();

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center gap-5 px-6 md:px-14 py-4 overflow-y-auto select-none">
      <div className="flex flex-col items-center text-center animate-fadeIn">
        <div className="text-7xl md:text-8xl font-serif text-rose-500 drop-shadow-[0_0_35px_rgba(220,38,38,0.65)]">絆</div>
        <h1 className="mt-1 text-3xl md:text-5xl font-black tracking-[0.22em] text-white">KIZUNA</h1>
        <h2 className="mt-2 text-lg md:text-2xl font-black tracking-[0.18em] text-amber-300">GLOBAL REACH. LOCAL TRUST.</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl w-full">
        {TAKEAWAYS.map((t) => (
          <div key={t.title} className="p-4 rounded-2xl bg-slate-950/85 border border-white/15 text-center">
            <div className="text-sm font-black text-white">{t.title}</div>
            <p className="mt-1 text-xs text-slate-300">{t.text}</p>
          </div>
        ))}
      </div>

      <p className="max-w-3xl text-center text-base md:text-xl font-bold text-white leading-relaxed">
        “O Kizuna não leva apenas tecnologia ao Japão.
        <span className="block mt-1 text-rose-400">Constrói uma conexão que o mercado possa aceitar e uma relação que possa permanecer.”</span>
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={toggleBancaMode}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-xs font-mono text-slate-200"
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" /> Roteiro da banca (B)
        </button>
        <button
          onClick={toggleEvidence}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-xs font-mono text-slate-200"
        >
          <BookOpen className="w-4 h-4 text-rose-400" /> Fontes e dados (E)
        </button>
        <button
          onClick={() => goToSection(0, 0)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-xs font-mono text-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Voltar à tela 01
        </button>
      </div>
    </div>
  );
};
export default FinaleSection;
