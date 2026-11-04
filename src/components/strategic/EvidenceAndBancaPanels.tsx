import React, { useState } from 'react';
import { usePresentation, PRESENTATION_SECTIONS } from '../../core/PresentationContext';
import sourcesData from '../../data/sources.json';
import {
  ShieldAlert,
  BookOpen,
  X,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lightbulb,
  Target,
  Compass,
  Mic
} from 'lucide-react';

const TYPE_BADGE_STYLES: Record<string, string> = {
  DADO: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  HIPÓTESE: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  RECOMENDAÇÃO: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
  META: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
  'PREÇO SUGERIDO': 'bg-rose-500/15 text-rose-300 border-rose-500/40'
};

export const EvidenceAndBancaPanels: React.FC = () => {
  const {
    bancaMode,
    evidenceOpen,
    toggleBancaMode,
    setEvidenceOpen,
    currentSection,
    sceneIndex,
    currentSectionData
  } = usePresentation();

  const [showAllEvidences, setShowAllEvidences] = useState(false);

  return (
    <>
      {/* MODO BANCA + TELEPROMPTER INVISÍVEL (Shortcut: B) */}
      {bancaMode && (
        <div className="fixed bottom-14 right-6 z-40 w-full max-w-xl bg-[#080C15]/95 backdrop-blur-xl border border-rose-500/45 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-slate-200 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="px-4 py-2.5 bg-rose-950/40 border-b border-rose-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-rose-200 font-semibold">
                MODO BANCA & TELEPROMPTER DE PALCO
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-rose-300/80 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                Seção {currentSection.code} • Cena {sceneIndex + 1}/{currentSection.sceneCount}
              </span>
              <button
                onClick={toggleBancaMode}
                className="text-slate-400 hover:text-white p-0.5"
                title="Fechar Modo Banca (B ou Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-[68vh] overflow-y-auto text-xs">
            {/* TELEPROMPTER BOX (FALA) */}
            {'speech' in currentSectionData.banca && (
              <div className="p-3.5 rounded-lg bg-sky-950/30 border border-sky-400/40">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-sky-300 font-bold mb-1">
                  <Mic className="w-3.5 h-3.5 text-sky-400" />
                  <span>FALA SUGERIDA (TELEPROMPTER)</span>
                </div>
                <p className="text-white text-xs sm:text-sm leading-relaxed font-light italic">
                  “{(currentSectionData.banca as any).speech}”
                </p>
              </div>
            )}

            {/* PERGUNTA PROVÁVEL & RESPOSTA DE DEFESA */}
            <div className="p-3.5 rounded-lg bg-rose-950/25 border border-rose-500/40">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-rose-300 font-semibold mb-1">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>PERGUNTA PROVÁVEL DA BANCA</span>
              </div>
              <p className="text-white font-semibold mb-2">
                “{currentSectionData.banca.probableQuestion}”
              </p>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-0.5">
                RESPOSTA ESTRATÉGICA:
              </div>
              <p className="text-slate-200 leading-relaxed">
                {currentSectionData.banca.suggestedAnswer}
              </p>
            </div>

            {/* 4 PILLARS OF DEFENSE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-sky-400 mb-1">
                  <Compass className="w-3 h-3" />
                  <span>CONCEITO</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{currentSectionData.banca.concept}</p>
              </div>

              <div className="p-2.5 rounded bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-1">
                  <FileText className="w-3 h-3" />
                  <span>EVIDÊNCIA</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{currentSectionData.banca.evidence}</p>
              </div>

              <div className="p-2.5 rounded bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-amber-400 mb-1">
                  <Lightbulb className="w-3 h-3" />
                  <span>PREMISSA</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{currentSectionData.banca.premise}</p>
              </div>

              <div className="p-2.5 rounded bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-rose-400 mb-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>RISCO & MITIGAÇÃO</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {currentSectionData.banca.risk} — {currentSectionData.banca.response}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CAMADA DE EVIDÊNCIAS DRAWER (Shortcut: E) */}
      {evidenceOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#080C14] border-l border-white/15 h-full flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-mono uppercase tracking-widest text-white font-semibold">
                    CAMADA DE EVIDÊNCIAS & RIGOR ACADÊMICO
                  </h2>
                  <p className="text-xs text-slate-400">
                    Distinção estrita entre Dado, Hipótese, Recomendação, Meta e Preço Sugerido
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEvidenceOpen(false)}
                className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-3 bg-white/[0.02] border-b border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(sourcesData.classificationLegend).map(([key, desc]) => (
                  <div
                    key={key}
                    className="flex items-start gap-2 p-2 rounded bg-black/30 border border-white/5"
                  >
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                        TYPE_BADGE_STYLES[key] || 'bg-white/10 text-white border-white/20'
                      }`}
                    >
                      {key}
                    </span>
                    <span className="text-[11px] text-slate-300 leading-tight">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-2.5 border-b border-white/10 flex items-center justify-between bg-[#0B101B]">
              <span className="text-xs font-mono text-slate-300">
                {showAllEvidences
                  ? 'Dossiê completo (15 telas)'
                  : `Tela atual: ${currentSectionData.title}`}
              </span>
              <button
                onClick={() => setShowAllEvidences((prev) => !prev)}
                className="text-xs font-mono text-sky-400 hover:text-sky-300 underline"
              >
                {showAllEvidences ? 'Filtrar apenas tela atual' : 'Ver todas as 15 telas'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {(showAllEvidences
                ? PRESENTATION_SECTIONS.map(
                    (s) =>
                      sourcesData.sections[s.code as keyof typeof sourcesData.sections]
                  )
                : [currentSectionData]
              ).map((sec) => (
                <div key={sec.id} className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
                    <Target className="w-3.5 h-3.5 text-rose-400" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                      {sec.title}
                    </h3>
                  </div>

                  {sec.evidences.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-white/[0.03] border border-white/10 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                            TYPE_BADGE_STYLES[ev.type] || 'bg-white/10 text-white border-white/20'
                          }`}
                        >
                          {ev.type}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {ev.source} • {ev.date}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white">{ev.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{ev.info}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
                        <div>
                          <span className="font-mono text-slate-500 uppercase block text-[10px]">
                            Metodologia:
                          </span>
                          <span className="text-slate-300">{ev.methodology}</span>
                        </div>
                        <div>
                          <span className="font-mono text-slate-500 uppercase block text-[10px]">
                            Implicação Estratégica:
                          </span>
                          <span className="text-slate-300">{ev.implication}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
