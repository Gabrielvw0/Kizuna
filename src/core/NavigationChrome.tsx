import React, { useState, useEffect } from 'react';
import {
  usePresentation,
  PRESENTATION_SECTIONS
} from './PresentationContext';
import { KizunaMotif } from '../components/strategic/KizunaMotif';
import {
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  BookOpen,
  Maximize2,
  Minimize2,
  Grid,
  Layers,
  EyeOff,
  RotateCcw,
  ShieldCheck,
  X
} from 'lucide-react';

const STORYTELLING_ARC = [
  'MUNDO',
  'JAPÃO',
  'PROBLEMA',
  'CONEXÃO',
  'KIZUNA',
  'PRODUTO',
  'ADAPTAÇÃO',
  'CONFIANÇA',
  'MERCADO',
  'NEGÓCIO',
  'FUTURO'
];

export const NavigationChrome: React.FC = () => {
  const {
    currentIndex,
    sceneIndex,
    currentSection,
    totalSections,
    stageMode,
    safeMode,
    bancaMode,
    evidenceOpen,
    navMenuOpen,
    isFullscreen,
    commandCue,
    goToSection,
    setSceneIndex,
    nextStep,
    prevStep,
    resetCurrentScene,
    toggleStageMode,
    toggleSafeMode,
    toggleBancaMode,
    toggleEvidence,
    setNavMenuOpen,
    setErpDemoOpen,
    toggleFullscreen
  } = usePresentation();

  const [mouseActive, setMouseActive] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handleMouseMove = () => {
      setMouseActive(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setMouseActive(false);
      }, 2800);
    };

    window.addEventListener('mousemove', handleMouseMove);
    timer = setTimeout(() => setMouseActive(false), 3200);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, []);

  const currentSceneLabel =
    currentSection.sceneLabels[sceneIndex] || `Cena ${sceneIndex + 1}`;

  return (
    <>
      {/* DISCREET COMMAND / GESTURE CONFIRMATION HUD */}
      {commandCue && (
        <div
          key={commandCue.id}
          className="pointer-events-none fixed bottom-14 right-6 z-50 bg-[#070B14]/95 backdrop-blur-md border border-rose-500/50 rounded-lg px-3.5 py-2 font-mono shadow-2xl animate-fadeIn"
        >
          <div className="flex items-center justify-between gap-4 text-[10px]">
            <span className="text-rose-400 font-bold tracking-widest">{commandCue.label}</span>
            <span className="text-slate-300">{commandCue.detail}</span>
          </div>
          <div className="mt-1 text-[9px] tracking-[0.15em] text-rose-500">
            ██████████
          </div>
        </div>
      )}

      {/* DISCREET R1/R2/R3/R4 ACADEMIC BADGE (Visible even in Stage Mode when present) */}
      {currentSection.rBadge && (
        <div className="pointer-events-none fixed top-14 right-6 z-30 px-3 py-1 rounded bg-rose-950/80 border border-rose-500/60 shadow-lg">
          <span className="text-[11px] font-mono font-bold tracking-[0.22em] text-rose-200">
            {currentSection.rBadge}
          </span>
        </div>
      )}

      {/* QUICK NAVIGATION MENU (Shortcut: ESC) */}
      {navMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
          <div className="w-full max-w-6xl bg-[#070B13] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded bg-rose-600/20 border border-rose-500/50 flex items-center justify-center text-rose-500 font-serif text-lg">
                  絆
                </span>
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-white font-bold">
                    KIZUNA (絆統合基幹業務システム) — MENU DE NAVEGAÇÃO (15 TELAS)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    GLOBAL REACH. LOCAL TRUST. • Teclas: →/Espaço/Enter (Avançar) | ← (Voltar) | ESC (Menu) | M (Modo Seguro) | B (Roteiro)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSafeMode}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold border transition-all ${
                    safeMode
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : 'bg-white/5 border-white/15 text-slate-300 hover:text-white'
                  }`}
                >
                  {safeMode ? 'MODO SEGURO: ATIVO' : 'ATIVAR MODO SEGURO (M)'}
                </button>
                <button
                  onClick={() => setNavMenuOpen(false)}
                  className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Storytelling Arc Strip */}
            <div className="px-6 py-2.5 bg-white/[0.02] border-b border-white/10 flex items-center justify-between overflow-x-auto gap-2">
              {STORYTELLING_ARC.map((node, idx) => {
                const isActive = currentSection.narrativeNode === node;
                return (
                  <React.Fragment key={node}>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded tracking-widest shrink-0 ${
                        isActive
                          ? 'bg-rose-600 text-white font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {node}
                    </span>
                    {idx < STORYTELLING_ARC.length - 1 && (
                      <span className="text-rose-500/50 text-xs font-mono">→</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[68vh] overflow-y-auto">
              {PRESENTATION_SECTIONS.map((sec) => {
                const isActive = sec.index === currentIndex;
                return (
                  <button
                    key={sec.id}
                    onClick={() => goToSection(sec.index, 0)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between group ${
                      isActive
                        ? 'bg-rose-600/20 border-rose-500 text-white shadow-lg'
                        : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-rose-400 font-bold">
                          TELA {sec.code}
                        </span>
                        <span className="text-xs font-bold text-white group-hover:text-rose-200">
                          {sec.shortTitle}
                        </span>
                        {sec.rBadge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/25 border border-rose-500/50 text-rose-200 font-bold">
                            {sec.rBadge.split(' ')[0]}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {sec.storyQuestion}
                      </div>
                    </div>
                    <span className="text-lg font-serif text-white/20 group-hover:text-rose-500/50 transition-colors shrink-0">
                      {sec.kanji}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* In STAGE MODE (Shortcut: P), hide top/bottom bars */}
      {stageMode ? null : (
        <>
          {/* TOP BAR */}
          <header
            className={`fixed top-0 left-0 right-0 z-40 h-12 px-5 flex items-center justify-between bg-[#05070B]/80 backdrop-blur-md border-b border-white/[0.06] select-none transition-opacity duration-500 ${
              mouseActive || navMenuOpen ? 'opacity-100' : 'opacity-30 hover:opacity-100'
            }`}
          >
            {/* Left: Brand Identity + Official Slogan + Red Thread */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => goToSection(0, 0)}
                className="flex items-center gap-2.5 group text-left shrink-0"
                title="Voltar à Tela 01"
              >
                <div className="w-6 h-6 rounded bg-rose-600/20 border border-rose-500/50 flex items-center justify-center text-rose-500 font-serif text-xs font-bold group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  絆
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold tracking-[0.22em] text-white">
                    KIZUNA
                  </span>
                  <span className="hidden sm:inline text-[10px] font-serif text-slate-400">
                    絆統合基幹業務システム
                  </span>
                  <span className="hidden xl:inline text-[10px] font-mono tracking-[0.2em] text-rose-400 font-semibold ml-1">
                    • GLOBAL REACH. LOCAL TRUST.
                  </span>
                </div>
              </button>

              <div className="hidden lg:block">
                <KizunaMotif size="sm" state="connected" />
              </div>

              <div className="h-3.5 w-[1px] bg-white/10 hidden md:block shrink-0" />

              <div className="hidden md:flex items-center gap-2 truncate text-[11px] font-mono">
                <span className="text-rose-400 font-bold">
                  TELA {currentSection.code} • {currentSection.shortTitle}
                </span>
                <span className="text-white/20">/</span>
                <span className="text-slate-300 truncate">{currentSceneLabel}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Modo Seguro / Emergência (M) */}
              <button
                onClick={toggleSafeMode}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono tracking-wider border transition-all ${
                  safeMode
                    ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 font-bold'
                    : 'bg-transparent hover:bg-white/[0.06] border-white/[0.08] text-slate-400 hover:text-white'
                }`}
                title="Modo Seguro de Emergência — Desativa WebGL/Animações Pesadas (Atalho: M)"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="hidden xl:inline">MODO SEGURO</span>
                <kbd className="text-[9px] opacity-75">M</kbd>
              </button>

              {/* Workspace Kizuna Completo */}
              <button
                onClick={() => setErpDemoOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono tracking-wider bg-white/[0.02] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition-all"
                title="Abrir a demonstração do Kizuna (dados fictícios)"
              >
                <Layers className="w-3 h-3 text-rose-500" />
                <span>DEMO</span>
              </button>

              {/* Reset Current Screen (R) */}
              <button
                onClick={resetCurrentScene}
                className="p-1.5 rounded bg-transparent hover:bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
                title="Reiniciar Cena da Tela Atual (Atalho: R)"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              {/* Stage Mode (P) */}
              <button
                onClick={toggleStageMode}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono tracking-wider bg-transparent hover:bg-white/[0.06] border border-white/[0.08] text-slate-300 hover:text-white transition-all"
                title="Modo Apresentação — Oculta Controles (Atalho: P)"
              >
                <EyeOff className="w-3 h-3 text-rose-400" />
                <span className="hidden xl:inline">PALCO</span>
                <kbd className="text-[9px] opacity-70">P</kbd>
              </button>

              {/* Fontes & Evidências (E) */}
              <button
                onClick={toggleEvidence}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono tracking-wider border transition-all ${
                  evidenceOpen
                    ? 'bg-sky-500/20 border-sky-400/50 text-sky-200'
                    : 'bg-transparent hover:bg-white/[0.06] border-white/[0.08] text-slate-300 hover:text-white'
                }`}
                title="Fontes & Evidências (Atalho: E)"
              >
                <BookOpen className="w-3 h-3 text-sky-400" />
                <span className="hidden xl:inline">FONTES</span>
                <kbd className="text-[9px] opacity-70">E</kbd>
              </button>

              {/* Roteiro & Banca (B) */}
              <button
                onClick={toggleBancaMode}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono tracking-wider border transition-all ${
                  bancaMode
                    ? 'bg-rose-600/25 border-rose-500/60 text-rose-200'
                    : 'bg-transparent hover:bg-white/[0.06] border-white/[0.08] text-slate-300 hover:text-white'
                }`}
                title="Roteiro do Apresentador & Defesa de Banca (Atalho: B)"
              >
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                <span className="hidden xl:inline">ROTEIRO</span>
                <kbd className="text-[9px] opacity-70">B</kbd>
              </button>

              {/* Menu Rápido (ESC) */}
              <button
                onClick={() => setNavMenuOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.1] border border-white/15 text-xs font-mono text-white transition-all"
                title="Menu Rápido de 15 Telas (Atalho: ESC)"
              >
                <Grid className="w-3 h-3 text-rose-400" />
                <span className="font-bold">{currentSection.code}</span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-300">{String(totalSections).padStart(2, '0')}</span>
              </button>

              {/* Fullscreen (F) */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded bg-transparent hover:bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
                title="Tela Cheia (Atalho: F)"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </header>

          {/* BOTTOM PRESENTATION CONTROLLER WITH RED THREAD PROGRESS */}
          <footer className="fixed bottom-0 left-0 right-0 z-40 h-11 px-6 flex items-center justify-between bg-[#05070B]/80 backdrop-blur-md border-t border-white/[0.06] select-none">
            {/* Red Thread Progress Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5">
              <div
                className="h-full bg-gradient-to-r from-rose-700 via-rose-500 to-amber-400 shadow-[0_0_12px_#e11d48] transition-all duration-500"
                style={{
                  width: `${((currentIndex + 1) / totalSections) * 100}%`
                }}
              />
            </div>

            <div className="flex items-center gap-4 font-mono text-xs">
              <button
                onClick={() => setNavMenuOpen(true)}
                className="text-slate-300 hover:text-white tracking-widest flex items-center gap-1.5"
              >
                <span className="text-rose-400 text-[10px]">赤い糸</span>
                <span className="text-white font-bold">TELA {currentSection.code}</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">{String(totalSections).padStart(2, '0')}</span>
              </button>

              <div className="h-3 w-[1px] bg-white/10" />

              <div className="flex items-center gap-2">
                <button
                  onClick={prevStep}
                  disabled={currentIndex === 0 && sceneIndex === 0}
                  className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-20"
                  title="Voltar (←)"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5 text-[11px] tracking-widest">
                  <span className="text-slate-400">ETAPA</span>
                  <span className="text-rose-400 font-bold">{sceneIndex + 1}</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-300">{currentSection.sceneCount}</span>
                </div>

                <button
                  onClick={nextStep}
                  disabled={
                    currentIndex === totalSections - 1 &&
                    sceneIndex === currentSection.sceneCount - 1
                  }
                  className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-20"
                  title="Avançar (→ / Espaço / Enter)"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1 ml-1">
                {Array.from({ length: currentSection.sceneCount }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSceneIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === sceneIndex
                        ? 'w-5 bg-rose-500'
                        : idx < sceneIndex
                        ? 'w-2 bg-rose-500/50'
                        : 'w-1.5 bg-white/15 hover:bg-white/35'
                    }`}
                    title={currentSection.sceneLabels[idx] || `Etapa ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevStep}
                disabled={currentIndex === 0 && sceneIndex === 0}
                className="flex items-center gap-1 px-3 py-1 rounded text-[11px] font-mono border border-white/10 bg-white/[0.03] hover:bg-white/[0.1] text-slate-200 disabled:opacity-20 disabled:pointer-events-none transition-all"
              >
                <span>← VOLTAR</span>
              </button>
              <button
                onClick={nextStep}
                disabled={
                  currentIndex === totalSections - 1 &&
                  sceneIndex === currentSection.sceneCount - 1
                }
                className="flex items-center gap-1 px-3.5 py-1 rounded text-[11px] font-mono border border-rose-500/50 bg-rose-600/25 hover:bg-rose-600/45 text-white font-semibold disabled:opacity-20 disabled:pointer-events-none transition-all"
              >
                <span>AVANÇAR →</span>
              </button>
            </div>
          </footer>
        </>
      )}
    </>
  );
};
