import React from 'react';
import {
  PlusCircle,
  Link2,
  CheckCircle2,
  TrendingUp,
  LayoutDashboard,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';

interface DemoStep {
  step: number;
  code: string;
  label: string;
  jp: string;
  highlightText: string;
  subText: string;
  icon: React.ReactNode;
}

const DEMO_STEPS: DemoStep[] = [
  {
    step: 0,
    code: '1. CRIAR TAREFA',
    label: 'Criar Tarefa na Equipe',
    jp: 'タスク作成',
    highlightText: '“Preparar proposta comercial para cliente japonês”',
    subText: 'Criada por Sato-san • Prioridade Alta • Prazo: Sexta 17:00 JST',
    icon: <PlusCircle className="w-4 h-4" />
  },
  {
    step: 1,
    code: '2. VINCULAR AO PROJETO',
    label: 'Vincular ao Projeto',
    jp: 'プロジェクト紐付け',
    highlightText: '“Projeto: Entrada Japão”',
    subText: 'Vínculo direto ao projeto estratégico sem duplicar planilhas',
    icon: <Link2 className="w-4 h-4" />
  },
  {
    step: 2,
    code: '3. ACOMPANHAR',
    label: 'Fluxo de Execução',
    jp: 'ステータス更新',
    highlightText: 'A fazer → Em andamento → Concluído',
    subText: 'Transição registrada em tempo real pela equipe operacional',
    icon: <CheckCircle2 className="w-4 h-4" />
  },
  {
    step: 3,
    code: '4. INDICADOR',
    label: 'Progresso Automático',
    jp: '進捗指標',
    highlightText: '68% → 75%',
    subText: 'Cálculo instantâneo do avanço do Projeto: Entrada Japão',
    icon: <TrendingUp className="w-4 h-4" />
  },
  {
    step: 4,
    code: '5. GESTÃO',
    label: 'Visão Geral da Gestão',
    jp: '経営ダッシュボード',
    highlightText: 'Atualização imediata da visão geral',
    subText: 'Liderança visualiza entrega concluída, impacto e rastreabilidade completa',
    icon: <LayoutDashboard className="w-4 h-4" />
  }
];

export const ValueSection: React.FC = () => {
  const {
    sceneIndex,
    setSceneIndex,
    nextStep,
    backupVideoMode,
    toggleBackupSimulation
  } = usePresentation();

  const currentDemo = DEMO_STEPS[sceneIndex] || DEMO_STEPS[0];
  const progressValue = sceneIndex >= 3 ? 75 : 68;
  const taskStatus =
    sceneIndex === 0
      ? 'A fazer'
      : sceneIndex === 1
      ? 'Em andamento'
      : 'Concluído';

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-6 md:px-14 pt-6 pb-6 overflow-y-auto select-none">
      {/* Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-3 border-b border-white/10 pb-3.5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600/15 border border-red-500/40 text-[10px] font-mono tracking-[0.2em] text-red-300 uppercase">
              TELA 06 • DEMONSTRAÇÃO DO KIZUNA
            </span>
            <span className="text-[11px] font-mono text-slate-400 tracking-widest">
              動 • FLUXO OPERACIONAL ÚNICO
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
            UMA INFORMAÇÃO. <span className="text-red-500">UMA OPERAÇÃO.</span>
          </h1>
        </div>

        {/* Backup Video Mode Controls */}
        <div className="flex items-center gap-2.5">
          {backupVideoMode && (
            <span
              role="status"
              className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-amber-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Simulação automática • passo {sceneIndex + 1}/5 • ESC ou ← → para assumir
            </span>
          )}
          <button
            onClick={toggleBackupSimulation}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              backupVideoMode
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900/80 border-white/15 text-slate-300 hover:border-white/30'
            }`}
            title="Atalho: tecla V (somente nesta tela). Simulação de reserva: um passo a cada 2,4 s, só inicia por comando manual."
          >
            {backupVideoMode ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{backupVideoMode ? 'Interromper simulação (V)' : 'Simulação de reserva (V)'}</span>
          </button>
          <button
            onClick={() => setSceneIndex(0)}
            className="p-2 rounded-xl bg-slate-900/80 border border-white/15 text-slate-300 hover:text-white hover:border-white/30 transition-all cursor-pointer"
            title="Reiniciar Fluxo (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5-Step Live Red Thread Stepper */}
      <div className="relative z-10 my-2">
        <div className="relative flex items-center justify-between gap-2">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded-full -z-10" />
          <div
            style={{ width: `${(sceneIndex / 4) * 100}%` }}
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-red-600 via-red-500 to-amber-400 rounded-full -z-10 shadow-[0_0_15px_rgba(239,68,68,0.85)] transition-all duration-500"
          />

          {DEMO_STEPS.map((item, idx) => {
            const isDone = idx <= sceneIndex;
            const isCurrent = idx === sceneIndex;
            return (
              <button
                key={item.code}
                onClick={() => setSceneIndex(idx)}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-red-950/60 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                    : isDone
                    ? 'bg-slate-900/90 border-red-500/40'
                    : 'bg-slate-950/80 border-white/10 opacity-65 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span
                    className={`text-[10px] font-mono font-bold tracking-wider ${
                      isCurrent ? 'text-red-300' : isDone ? 'text-red-400' : 'text-slate-400'
                    }`}
                  >
                    {item.code}
                  </span>
                  <span className="text-[10px] font-serif text-slate-400">{item.jp}</span>
                </div>
                <div className="text-xs font-semibold text-white truncate">{item.highlightText}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Kizuna Live Workspace */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch my-auto py-1">
        {/* Left 7 Cols: Live Kizuna App Interface */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-950/90 border border-white/15 shadow-2xl overflow-hidden flex flex-col justify-between p-5 relative">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-xs font-serif text-white font-bold">
                絆
              </div>
              <span className="text-xs font-mono tracking-widest text-white font-bold">
                KIZUNA WORKSPACE • TOKYO OPS
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
                ● LIVE SYNC
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                ETAPA {sceneIndex + 1}/5
              </span>
            </div>
          </div>

          <div className="my-auto space-y-4 py-3">
            <div
              className={`p-4 rounded-xl border transition-all duration-500 ${
                sceneIndex === 0
                  ? 'bg-red-950/25 border-red-500/60'
                  : 'bg-slate-900/80 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-red-400">
                  TAREFA #KZ-104 • CRIADA PELA EQUIPE
                </span>
                <span className="text-[10px] font-mono text-slate-400">Responsável: Sato-san</span>
              </div>
              <div className="text-base md:text-lg font-bold text-white">
                “Preparar proposta comercial para cliente japonês”
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div
                  className={`px-3 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all duration-500 ${
                    sceneIndex >= 1
                      ? 'bg-red-600/20 border-red-500/70 text-red-200'
                      : 'bg-white/5 border-white/15 text-slate-400'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Projeto: Entrada Japão</span>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  {(['A fazer', 'Em andamento', 'Concluído'] as const).map((st) => {
                    const active = taskStatus === st;
                    return (
                      <button
                        key={st}
                        onClick={() =>
                          setSceneIndex(st === 'A fazer' ? 0 : st === 'Em andamento' ? 1 : 2)
                        }
                        className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase transition-all cursor-pointer ${
                          active
                            ? st === 'Concluído'
                              ? 'bg-emerald-600 text-white font-bold shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                              : 'bg-red-600 text-white font-bold'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                onClick={() => setSceneIndex(3)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  sceneIndex === 3
                    ? 'bg-red-950/30 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]'
                    : 'bg-slate-900/75 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    4. INDICADOR DO PROJETO
                  </span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2 my-1">
                  <span className="text-2xl md:text-3xl font-black font-mono text-white">
                    {progressValue}%
                  </span>
                  <span className="text-xs font-mono text-emerald-400">
                    {sceneIndex >= 3 ? '(68% → 75% ▲ +7%)' : '(Base: 68%)'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-2">
                  <div
                    style={{ width: `${progressValue}%` }}
                    className="h-full bg-gradient-to-r from-red-600 to-emerald-400 transition-all duration-500"
                  />
                </div>
              </div>

              <div
                onClick={() => setSceneIndex(4)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  sceneIndex === 4
                    ? 'bg-amber-950/25 border-amber-400/70 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                    : 'bg-slate-900/75 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
                    5. VISÃO DA GESTÃO
                  </span>
                  <LayoutDashboard className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-sm font-bold text-white mt-1">
                  {sceneIndex >= 4
                    ? 'Visão Geral Atualizada Instantaneamente'
                    : 'Aguardando conclusão da etapa'}
                </div>
                <div className="text-[11px] font-mono text-slate-300 mt-1.5">
                  {sceneIndex >= 4
                    ? '✓ Proposta comercial auditada • SLA: 100% no prazo'
                    : 'Clique para inspecionar o painel executivo'}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>赤い糸 • Fio de Dados Contínuo: Equipe → Projeto → Gestão</span>
            <span className="text-red-400">Zero retrabalho entre sistemas</span>
          </div>
        </div>

        {/* Right 5 Cols: Active Step Spotlight & Core Thesis */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div
            key={currentDemo.code}
            className="p-6 rounded-2xl bg-slate-900/85 border border-red-500/40 shadow-xl flex-1 flex flex-col justify-between animate-fadeIn"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded bg-red-600/20 border border-red-500/40 text-xs font-mono font-bold text-red-300">
                  {currentDemo.code}
                </span>
                <span className="text-sm font-serif text-amber-300">{currentDemo.jp}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-2">
                {currentDemo.label}
              </h3>
              <div className="p-4 rounded-xl bg-slate-950/90 border border-white/10 text-sm md:text-base font-mono text-emerald-300 mb-3">
                {currentDemo.highlightText}
              </div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                {currentDemo.subText}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Sparkles className="w-4 h-4 text-red-400" />
                <span>Use → ou clique para avançar cada passo</span>
              </div>
              <button
                onClick={nextStep}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer"
              >
                <span>Próximo Passo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/60 to-slate-900/90 border border-red-500/40">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-400 mb-1">
              SÍNTESE DA OPERAÇÃO
            </div>
            <p className="text-sm md:text-base font-bold text-white leading-snug">
              “A informação nasce na equipe e chega à gestão sem precisar atravessar sistemas desconectados.”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ValueSection;
