import React, { useState } from 'react';
import { CheckSquare, Calendar, FolderKanban, MessageSquare, ArrowRight, Sparkles, Layers } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';

interface TeamBlock {
  id: string;
  code: string;
  title: string;
  jp: string;
  icon: React.ReactNode;
  summary: string;
  microView: string;
}

const TEAM_BLOCKS: TeamBlock[] = [
  {
    id: 'tarefas',
    code: '01',
    title: 'TAREFAS',
    jp: 'タスク管理',
    icon: <CheckSquare className="w-5 h-5" />,
    summary: 'Responsáveis claros, prazos e prioridades sem ruído.',
    microView: 'Preparar proposta comercial • Responsável: Sato-san • Hoje 17:00'
  },
  {
    id: 'calendario',
    code: '02',
    title: 'CALENDÁRIO',
    jp: 'スケジュール',
    icon: <Calendar className="w-5 h-5" />,
    summary: 'Sincronia da rotina diária e marcos da operação.',
    microView: 'Reunião de alinhamento (Nemawashi) • Quinta 10:00 JST'
  },
  {
    id: 'projetos',
    code: '03',
    title: 'PROJETOS',
    jp: 'プロジェクト',
    icon: <FolderKanban className="w-5 h-5" />,
    summary: 'Visão integrada de entregas, etapas e progresso real.',
    microView: 'Projeto: Entrada Japão • Progresso: 75% • No Prazo'
  },
  {
    id: 'comunicacao',
    code: '04',
    title: 'COMUNICAÇÃO',
    jp: 'チーム連携',
    icon: <MessageSquare className="w-5 h-5" />,
    summary: 'Contexto conversado dentro da própria tarefa e projeto.',
    microView: '@Tanaka-san: Escopo validado com parceiro de Tóquio.'
  }
];

export const TrustSection: React.FC = () => {
  const { sceneIndex, setSceneIndex, nextStep } = usePresentation();
  const [selectedBlock, setSelectedBlock] = useState<string>('tarefas');

  const isLocked = sceneIndex >= 1;
  const activeBlock = TEAM_BLOCKS.find((b) => b.id === selectedBlock) || TEAM_BLOCKS[0];

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-6 md:px-14 pt-6 pb-6 overflow-y-auto select-none">
      {/* Top Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600/15 border border-red-500/40 text-[10px] font-mono tracking-[0.2em] text-red-300 uppercase">
              TELA 05 • ENTRADA PELA OPERAÇÃO REAL
            </span>
            <span className="text-[11px] font-mono text-slate-400 tracking-widest">
              始 • LAND &amp; EXPAND: PASSO 01
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            COMEÇAMOS PELA <span className="text-red-500">EQUIPE.</span>
          </h1>
        </div>

        {/* Subtitle Pricing Pill */}
        <div className="flex items-center gap-4 bg-slate-900/90 border border-red-500/30 rounded-2xl px-5 py-3 shadow-[0_0_30px_rgba(220,38,38,0.12)]">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-red-400 font-bold">
              Kizuna Start
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Preço sugerido para o projeto
            </div>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="text-right">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl font-black text-white font-mono">¥980</span>
              <span className="text-xs font-mono text-slate-300">/ usuário/mês</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-400/30 text-[10px] font-mono text-amber-300">
                税抜
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Core: 4 Team Blocks Locking into KIZUNA */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto py-3">
        {/* Left/Center 7 Cols: Visual Interlocking Architecture */}
        <div className="lg:col-span-7 relative h-[360px] md:h-[410px] rounded-3xl bg-slate-950/75 border border-white/10 overflow-hidden flex items-center justify-center p-6">
          {/* Subtle Red Thread SVG connecting the 4 blocks to the center */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 400">
            <defs>
              <linearGradient id="kizunaThread05" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#ef4444" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <line
              x1="140"
              y1="95"
              x2="300"
              y2="200"
              stroke="url(#kizunaThread05)"
              strokeWidth={isLocked ? 3 : 1.5}
              strokeDasharray={isLocked ? undefined : '6 6'}
            />
            <line
              x1="460"
              y1="95"
              x2="300"
              y2="200"
              stroke="url(#kizunaThread05)"
              strokeWidth={isLocked ? 3 : 1.5}
              strokeDasharray={isLocked ? undefined : '6 6'}
            />
            <line
              x1="140"
              y1="305"
              x2="300"
              y2="200"
              stroke="url(#kizunaThread05)"
              strokeWidth={isLocked ? 3 : 1.5}
              strokeDasharray={isLocked ? undefined : '6 6'}
            />
            <line
              x1="460"
              y1="305"
              x2="300"
              y2="200"
              stroke="url(#kizunaThread05)"
              strokeWidth={isLocked ? 3 : 1.5}
              strokeDasharray={isLocked ? undefined : '6 6'}
            />
            {isLocked && (
              <circle
                cx="300"
                cy="200"
                r="135"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.2"
                strokeOpacity="0.35"
              />
            )}
          </svg>

          {/* 4 Blocks Grid */}
          <div
            className={`relative z-10 grid grid-cols-2 transition-all duration-700 w-full max-w-xl ${
              isLocked ? 'gap-3 md:gap-4 scale-[0.96]' : 'gap-8 md:gap-12'
            }`}
          >
            {TEAM_BLOCKS.map((block) => {
              const isSelected = selectedBlock === block.id;
              return (
                <button
                  key={block.id}
                  onClick={() => setSelectedBlock(block.id)}
                  className={`text-left p-4 md:p-5 rounded-2xl border backdrop-blur-md transition-all duration-500 cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-red-950/35 border-red-500/70 shadow-[0_0_25px_rgba(220,38,38,0.22)]'
                      : isLocked
                      ? 'bg-slate-900/90 border-white/20 hover:border-red-500/40'
                      : 'bg-slate-900/65 border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase">
                      {block.code} • {block.jp}
                    </span>
                    <div
                      className={`p-2 rounded-xl ${
                        isSelected ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-300'
                      }`}
                    >
                      {block.icon}
                    </div>
                  </div>
                  <div className="text-base md:text-lg font-black tracking-wide text-white mb-1">
                    {block.title}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {block.summary}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Center Core Hub (# KIZUNA) */}
          <button
            onClick={() => setSceneIndex(isLocked ? 0 : 1)}
            className={`absolute z-20 w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-red-600 via-red-700 to-slate-950 border-2 border-red-400/80 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500 ${
              isLocked
                ? 'scale-105 shadow-[0_0_45px_rgba(220,38,38,0.55)]'
                : 'scale-95 shadow-[0_0_20px_rgba(220,38,38,0.2)]'
            }`}
          >
            <span className="text-xl md:text-2xl font-serif text-white leading-none mb-0.5">
              絆
            </span>
            <span className="text-xs md:text-sm font-black tracking-[0.2em] text-white">
              KIZUNA
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-red-200 mt-1">
              {isLocked ? 'INTEGRADO' : 'CONECTAR'}
            </span>
          </button>
        </div>

        {/* Right 5 Cols: Focused Operational Detail & Scene Switcher */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                ARQUITETURA DE ENTRADA
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSceneIndex(0)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase transition-all cursor-pointer ${
                    !isLocked
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  1. 4 Blocos
                </button>
                <button
                  onClick={() => setSceneIndex(1)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase transition-all cursor-pointer ${
                    isLocked
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  2. Núcleo Kizuna
                </button>
              </div>
            </div>

            <div
              key={activeBlock.id + String(isLocked)}
              className="p-4 rounded-xl bg-slate-950/90 border border-red-500/30 animate-fadeIn"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-red-400 font-bold">
                  BLOCO ATIVO: {activeBlock.title} ({activeBlock.jp})
                </span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-sm text-white font-medium mb-3">{activeBlock.summary}</p>
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 font-mono text-xs text-emerald-300">
                ▸ {activeBlock.microView}
              </div>
              <p className="mt-1.5 text-[10px] font-mono text-slate-500">
                Exemplo com dados de demonstração (nomes, prazos e percentuais fictícios).
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  Em vez de exigir uma troca traumática de sistemas no primeiro dia, o{' '}
                  <strong className="text-white">Kizuna Start (¥980 税抜)</strong> resolve a rotina imediata da equipe.
                </p>
              </div>
            </div>
          </div>

          {/* Support Phrase Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/50 via-slate-900/90 to-slate-900/90 border border-red-500/40 flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-400 mb-1">
                PRINCÍPIO DO PRODUTO
              </div>
              <p className="text-base md:text-lg font-bold text-white leading-snug">
                “Gestão de equipes sem complexidade desnecessária.”
              </p>
            </div>
            <button
              onClick={nextStep}
              className="shrink-0 p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer shadow-lg"
              title="Avançar"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TrustSection;
