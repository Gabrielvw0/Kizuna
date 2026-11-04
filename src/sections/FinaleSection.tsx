import React from 'react';
import { RotateCcw, BookOpen, ShieldCheck, Globe2 } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';

const RED_THREAD_NODES = [
  { id: 'brasil', label: 'Brasil', jp: 'ブラジル (1908)' },
  { id: 'mundo', label: 'Mundo', jp: 'グローバル拠点' },
  { id: 'japao', label: 'Japão', jp: '日本市場' },
  { id: 'equipes', label: 'Equipes', jp: '現場チーム' },
  { id: 'empresas', label: 'Empresas', jp: '日本企業' },
  { id: 'kizuna', label: 'Kizuna', jp: '絆 KIZUNA', isFinal: true }
];

export const FinaleSection: React.FC = () => {
  const {
    sceneIndex,
    setSceneIndex,
    goToSection,
    toggleBancaMode,
    toggleEvidence
  } = usePresentation();

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-6 md:px-14 pt-6 pb-6 overflow-y-auto select-none">
      {/* Subtle Orbital Globe + Red Thread Full Circle SVG Backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-45">
        <svg className="w-[760px] h-[760px]" viewBox="0 0 700 700">
          <defs>
            <radialGradient id="finaleGlobeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.22" />
              <stop offset="55%" stopColor="#0f172a" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="finaleRedThread" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          <circle cx="350" cy="350" r="280" fill="url(#finaleGlobeGlow)" />
          <circle
            cx="350"
            cy="350"
            r="235"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.2"
          />
          <ellipse
            cx="350"
            cy="350"
            rx="235"
            ry="95"
            fill="none"
            stroke="url(#finaleRedThread)"
            strokeWidth="2.5"
          />
          <ellipse
            cx="350"
            cy="350"
            rx="115"
            ry="235"
            fill="none"
            stroke="rgba(212,175,55,0.25)"
            strokeWidth="1.2"
            strokeDasharray="6 6"
          />
        </svg>
      </div>

      {/* Top Strip: The Red Thread Connecting the 6 Nodes */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-[10px] font-mono tracking-[0.25em] text-red-300 uppercase">
            TELA 15 • SÍNTESE &amp; ENCERRAMENTO • 赤い糸
          </span>
        </div>

        {/* Continuous Red Thread Chain: Brasil -> Mundo -> Japão -> Equipes -> Empresas -> Kizuna */}
        <div className="w-full max-w-5xl relative flex flex-wrap items-center justify-center gap-2 md:gap-3 bg-slate-950/85 border border-white/15 rounded-2xl px-4 py-3 shadow-xl">
          {RED_THREAD_NODES.map((node, idx) => (
            <React.Fragment key={node.id}>
              <button
                onClick={() => setSceneIndex(idx < 2 ? 0 : idx < 4 ? 1 : 2)}
                className={`px-3.5 py-1.5 rounded-xl border text-left transition-all duration-300 hover:scale-105 cursor-pointer ${
                  node.isFinal
                    ? 'bg-red-600 border-amber-300 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                    : 'bg-slate-900/90 border-red-500/35 text-slate-200 hover:border-red-400'
                }`}
              >
                <div className="text-xs md:text-sm font-black tracking-wide">{node.label}</div>
                <div className="text-[9px] font-serif text-amber-200/90">{node.jp}</div>
              </button>
              {idx < RED_THREAD_NODES.length - 1 && (
                <span className="text-red-500 font-mono font-bold text-sm">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Centerpiece: # 絆 / ## KIZUNA / ## GLOBAL REACH. LOCAL TRUST. + Final Quote */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-4xl mx-auto px-4">
        <div className="relative mb-3 animate-fadeIn">
          <div className="text-6xl md:text-8xl font-serif text-red-500 drop-shadow-[0_0_35px_rgba(220,38,38,0.65)] select-none">
            絆
          </div>
          {/* Subtle Hanko Stamp Badge */}
          <div className="absolute -right-10 -bottom-1 w-9 h-9 rounded-md border-2 border-red-500/80 bg-red-950/80 flex items-center justify-center text-[10px] font-serif text-red-300 rotate-6 shadow-lg">
            絆印
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-[0.22em] text-white mb-1">
          KIZUNA
        </h1>
        <div className="text-xs md:text-sm font-serif tracking-[0.3em] text-slate-400 mb-3">
          絆統合基幹業務システム
        </div>

        <h2 className="text-xl md:text-3xl font-black tracking-[0.18em] text-amber-300 uppercase mb-6">
          GLOBAL REACH. LOCAL TRUST.
        </h2>

        {/* Final Statement on Screen */}
        <div
          key={sceneIndex}
          className="p-6 md:p-7 rounded-3xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-red-500/40 shadow-[0_0_45px_rgba(220,38,38,0.2)] max-w-3xl animate-fadeIn"
        >
          <p className="text-base md:text-xl font-bold text-white leading-relaxed">
            “O Kizuna não leva apenas tecnologia ao Japão.
            <span className="block mt-1.5 text-red-400">
              Constrói uma conexão que o mercado possa aceitar e uma relação que possa permanecer.”
            </span>
          </p>
        </div>
      </div>

      {/* Bottom Action Bar for Defense in front of the University Board */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Globe2 className="w-4 h-4 text-red-400" />
          <span>CAPACIDADE GLOBAL + ADAPTAÇÃO LOCAL + CONFIANÇA = KIZUNA</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={toggleBancaMode}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-xs font-mono text-slate-200 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Defesa da Banca (B)</span>
          </button>
          <button
            onClick={toggleEvidence}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-xs font-mono text-slate-200 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-red-400" />
            <span>Fontes &amp; Dados (E)</span>
          </button>
          <button
            onClick={() => goToSection(0, 0)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Voltar à Tela 01</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default FinaleSection;
