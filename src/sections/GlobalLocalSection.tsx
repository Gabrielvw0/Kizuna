import React from 'react';
import { usePresentation } from '../core/PresentationContext';
import { ArrowRight, Sparkles } from 'lucide-react';

const GLOBAL_ITEMS = [
  'Tecnologia de ponta',
  'Escala global de engenharia',
  'Experiência corporativa',
  'Capacidade de inovação',
  'Metodologias internacionais'
];

const LOCAL_ITEMS = [
  'Contexto cultural & confiança',
  'Idioma & Keigo corporativo',
  'Rituais de consenso (Nemawashi)',
  'Aprovação formal (Ringi / Hanko)',
  'Conformidade (APPI & JIS)'
];

export const GlobalLocalSection: React.FC = () => {
  const { sceneIndex, setSceneIndex, nextStep, stageMode } = usePresentation();
  const scene = Math.min(2, Math.max(0, sceneIndex));
  const isConnected = scene === 2;

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-6 sm:px-12 py-6 max-w-7xl mx-auto overflow-hidden select-none">
      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-red-500 font-bold">
            04 / 15 • O PONTO DE INFLEXÃO
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
            GLOBAL × LOCAL
          </h1>
          <h3 className="text-xs sm:text-sm font-mono text-slate-300 mt-0.5">
            A convergência onde a tecnologia internacional e o respeito local se encontram.
          </h3>
        </div>

        {!stageMode && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { idx: 0, label: '1. A TENSÃO' },
              { idx: 1, label: '2. APROXIMAÇÃO' },
              { idx: 2, label: '3. FORMAÇÃO: 絆' }
            ].map((s) => (
              <button
                key={s.idx}
                onClick={() => setSceneIndex(s.idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  scene === s.idx
                    ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Kinetic Canvas: Convergence of Global & Local */}
      <div
        onClick={nextStep}
        className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto py-4 cursor-pointer"
      >
        {/* Left Column: GLOBAL Lines */}
        <div
          className={`lg:col-span-4 p-6 rounded-3xl bg-slate-950/80 border-2 transition-all duration-700 ${
            isConnected
              ? 'border-sky-400 shadow-[0_0_35px_rgba(56,189,248,0.25)] lg:translate-x-4'
              : 'border-sky-500/35'
          }`}
        >
          <div className="border-b border-sky-400/30 pb-3 mb-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-sky-300">
              CAPACIDADE GLOBAL
            </span>
            <h2 className="text-3xl sm:text-4xl font-mono font-bold tracking-[0.2em] text-sky-400 mt-0.5">
              GLOBAL
            </h2>
          </div>

          <div className="space-y-2">
            {GLOBAL_ITEMS.map((item) => (
              <div
                key={item}
                className="p-3 rounded-xl bg-sky-500/10 border border-sky-400/25 flex items-center justify-between text-xs sm:text-sm font-bold text-white"
              >
                <span>{item}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Center: The Rift / The Collision / Formation of 絆 */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center relative py-6">
          {!isConnected ? (
            <div className="flex flex-col items-center text-center space-y-4 animate-fadeIn">
              {/* Dynamic Line Collision Graphic */}
              <svg viewBox="0 0 240 180" className="w-56 h-40 overflow-visible">
                {/* Global Cyan Lines from Left */}
                <line
                  x1={scene === 1 ? '10' : '0'}
                  y1="50"
                  x2={scene === 1 ? '110' : '80'}
                  y2="90"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
                <line
                  x1={scene === 1 ? '10' : '0'}
                  y1="130"
                  x2={scene === 1 ? '110' : '80'}
                  y2="90"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />

                {/* Local Crimson Kumiko Lines from Right */}
                <line
                  x1={scene === 1 ? '230' : '240'}
                  y1="50"
                  x2={scene === 1 ? '130' : '160'}
                  y2="90"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
                <line
                  x1={scene === 1 ? '230' : '240'}
                  y1="130"
                  x2={scene === 1 ? '130' : '160'}
                  y2="90"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                />

                {/* Central Collision Spark */}
                {scene === 1 && (
                  <circle cx="120" cy="90" r="14" fill="#ef4444" fillOpacity="0.35">
                    <animate attributeName="r" values="10;18;10" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}
              </svg>

              <div className="px-5 py-3 rounded-2xl bg-slate-950/90 border border-white/15 shadow-xl">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-400 block mb-0.5">
                  A PERGUNTA CRÍTICA
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  COMO CONECTAR OS DOIS?
                </h3>
              </div>
            </div>
          ) : (
            /* Collision Weaves the Kanji 絆 + Software Rebirth */
            <div className="flex flex-col items-center text-center space-y-3 animate-fadeIn">
              {/* Red Thread Weaving */}
              <svg viewBox="0 0 300 80" className="w-full max-w-[280px] h-16 overflow-visible">
                <path
                  d="M 10 40 C 90 10, 210 70, 290 40"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                />
                <circle cx="50" cy="28" r="5" fill="#38bdf8" />
                <circle cx="150" cy="40" r="8" fill="#ef4444" />
                <circle cx="250" cy="52" r="5" fill="#d4af37" />
              </svg>

              {/* The Kanji 絆 formed by the intersection */}
              <div className="relative p-6 sm:p-7 rounded-3xl bg-slate-950/95 border-2 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] flex flex-col items-center">
                <div className="text-6xl sm:text-7xl font-serif text-white drop-shadow-[0_0_30px_rgba(225,29,72,0.8)]">
                  絆
                </div>
                <div className="mt-1 text-xl font-mono font-black tracking-[0.25em] text-red-400">
                  KIZUNA
                </div>

                <div
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full border border-red-500 bg-red-950 flex flex-col items-center justify-center text-red-300 font-serif shadow-lg rotate-[-6deg]"
                  title="Carimbo Hanko (判子)"
                >
                  <span className="text-[9px] font-bold">絆印</span>
                </div>
              </div>

              <div className="text-xs font-mono uppercase tracking-[0.2em] text-amber-300 font-bold">
                O SOFTWARE NASCE DESTA UNIÃO
              </div>
            </div>
          )}
        </div>

        {/* Right Column: LOCAL Reality */}
        <div
          className={`lg:col-span-4 p-6 rounded-3xl bg-slate-950/80 border-2 transition-all duration-700 ${
            isConnected
              ? 'border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.25)] lg:-translate-x-4'
              : 'border-red-500/35'
          }`}
        >
          <div className="border-b border-red-500/30 pb-3 mb-4 text-right">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-300">
              CONTEXTO JAPONÊS
            </span>
            <h2 className="text-3xl sm:text-4xl font-mono font-bold tracking-[0.2em] text-red-500 mt-0.5">
              LOCAL
            </h2>
          </div>

          <div className="space-y-2">
            {LOCAL_ITEMS.map((item) => (
              <div
                key={item}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-between text-xs sm:text-sm font-bold text-white"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      {!stageMode && (
        <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            CAPACIDADE GLOBAL + ADAPTAÇÃO LOCAL + CONFIANÇA = KIZUNA
          </span>
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shadow-lg"
          >
            <span>{scene < 2 ? 'Aproximar Sistemas' : 'TELA 05 | KIZUNA START (¥980)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
export default GlobalLocalSection;
