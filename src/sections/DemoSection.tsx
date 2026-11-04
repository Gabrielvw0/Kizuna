import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { useKizuna } from '../context/KizunaContext';
import { ActivitiesModule, GuideZone } from '../components/modules/ActivitiesModule';
import { DEMO_TODAY, TEAM_MEMBERS } from '../data/startActivitiesData';
import { ScreenTitle, InfoTag } from '../components/strategic/ScreenTitle';

const STEPS: { zone: GuideZone; title: string; action: string }[] = [
  { zone: 'create', title: 'Criar a atividade', action: 'Preencha o título, escolha responsável e prazo e clique em Criar.' },
  { zone: 'assign', title: 'Responsável e prazo', action: 'Na linha destacada, troque o responsável ou o prazo.' },
  { zone: 'status', title: 'Acompanhar a execução', action: 'Mude o status: Fazer → Andando → Feito.' },
  { zone: 'project', title: 'Relacionar ao projeto', action: 'Escolha o projeto da atividade na linha destacada.' },
  { zone: 'manager', title: 'Visão da gestão', action: 'Equipes, projetos e carga por pessoa, calculados das próprias atividades.' }
];

const STATUS_PT = { TODO: 'A fazer', DOING: 'Em andamento', DONE: 'Concluída' } as const;

/**
 * Tela 05 • Demonstração real do Kizuna Start.
 * Usa o módulo de Atividades do ERP (mesmo estado do botão DEMO). Os indicadores vêm do estado real.
 * A simulação de reserva (V) executa os mesmos passos com as funções reais do módulo.
 */
export const DemoSection: React.FC = () => {
  const { sceneIndex, backupVideoMode, toggleBackupSimulation, setErpDemoOpen } = usePresentation();
  const {
    activities,
    projects,
    lastCreatedActivityId,
    createActivity,
    assignActivity,
    setActivityDueDate,
    setActivityStatus,
    setActivityProject,
    setActiveModule,
    resetDemoState
  } = useKizuna();
  const scene = Math.min(STEPS.length - 1, Math.max(0, sceneIndex));
  const step = STEPS[scene];

  // A visão acompanha o passo (passo 5 = visão gerencial), mas o apresentador pode alternar.
  const [view, setView] = useState<'list' | 'manager'>('list');
  useEffect(() => {
    setView(scene === 4 ? 'manager' : 'list');
  }, [scene]);

  // Simulação de reserva: cada passo executa a ação real correspondente, uma única vez.
  const simApplied = useRef<number>(-1);
  useEffect(() => {
    if (!backupVideoMode) {
      simApplied.current = -1;
      return;
    }
    if (simApplied.current === scene) return;
    simApplied.current = scene;
    const id = lastCreatedActivityId;
    if (scene === 0 || !id) {
      if (scene === 0) {
        createActivity({ title: 'Preparar resumo semanal para a gestão', assigneeId: 'MBR-03', dueDate: '2026-10-24', projectId: null });
      }
      return;
    }
    if (scene === 1) {
      assignActivity(id, 'MBR-04');
      setActivityDueDate(id, '2026-10-23');
    } else if (scene === 2) {
      setActivityStatus(id, 'DOING');
    } else if (scene === 3) {
      setActivityProject(id, 'PRJ-002');
    } else if (scene === 4) {
      setActivityStatus(id, 'DONE');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backupVideoMode, scene]);

  const stats = useMemo(() => {
    const done = activities.filter((a) => a.status === 'DONE').length;
    const open = activities.length - done;
    const overdue = activities.filter((a) => a.status !== 'DONE' && a.dueDate < DEMO_TODAY).length;
    return { open, overdue, rate: activities.length ? Math.round((done / activities.length) * 100) : 0 };
  }, [activities]);

  const focus = activities.find((a) => a.id === lastCreatedActivityId) ?? null;
  const focusMember = focus ? TEAM_MEMBERS.find((m) => m.id === focus.assigneeId) : null;
  const focusProject = focus ? projects.find((p) => p.id === focus.projectId) : null;

  const openAuditInErp = () => {
    setActiveModule('audit');
    setErpDemoOpen(true);
  };

  return (
    <div className="relative w-full h-full flex flex-col gap-3 px-4 md:px-10 py-4 overflow-hidden select-none">
      <ScreenTitle
        kicker="05 • Demonstração real • Kizuna Start • 動"
        title={
          <>
            Uma informação. <span className="text-rose-500">Uma operação.</span>
          </>
        }
        aside={
          <div className="flex items-center gap-2">
            {backupVideoMode && (
              <span role="status" className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
                Simulação automática • passo {scene + 1}/5
              </span>
            )}
            <button
              onClick={resetDemoState}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-slate-900/80 text-[11px] font-mono text-slate-300 hover:border-white/30"
              title="Restaurar dados da demonstração"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restaurar
            </button>
            <button
              onClick={toggleBackupSimulation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono ${
                backupVideoMode ? 'bg-amber-500/20 border-amber-400 text-amber-200' : 'bg-slate-900/80 border-white/15 text-slate-300 hover:border-white/30'
              }`}
              title="Contingência: executa os 5 passos sozinha, um a cada 2,4 s (tecla V)"
            >
              {backupVideoMode ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {backupVideoMode ? 'Interromper (V)' : 'Simulação de reserva (V)'}
            </button>
          </div>
        }
      />

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Guia do passo atual + leitura dos indicadores reais */}
        <div className="lg:col-span-3 flex flex-col gap-3 min-h-0">
          <div key={scene} className="p-4 rounded-2xl bg-slate-950/90 border border-rose-500/40 animate-fadeIn">
            <div className="text-[10px] font-mono text-rose-300">PASSO {scene + 1} DE 5</div>
            <div className="mt-1 text-lg font-black text-white">{step.title}</div>
            <p className="mt-1 text-xs text-slate-300 leading-snug">{step.action}</p>
            {/* Abaixo de 1024 px o painel de estado vira uma linha dentro do guia */}
            <p className="lg:hidden mt-2 text-[11px] font-mono text-slate-300">
              Estado atual: <strong className="text-white">{stats.open}</strong> em aberto •{' '}
              <strong className={stats.overdue ? 'text-rose-400' : 'text-white'}>{stats.overdue}</strong> atrasadas •{' '}
              <strong className="text-emerald-300">{stats.rate}%</strong> concluídas
              {focus && <> • {focus.id} {STATUS_PT[focus.status].toLowerCase()}</>}
            </p>
          </div>

          <div className="hidden lg:block p-4 rounded-2xl bg-slate-950/90 border border-white/15 text-xs">
            <div className="text-[10px] font-mono text-slate-400 mb-2">ESTADO ATUAL DO MÓDULO</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xl font-black font-mono text-white">{stats.open}</div>
                <div className="text-[10px] text-slate-400">em aberto</div>
              </div>
              <div>
                <div className={`text-xl font-black font-mono ${stats.overdue ? 'text-rose-400' : 'text-white'}`}>{stats.overdue}</div>
                <div className="text-[10px] text-slate-400">atrasadas</div>
              </div>
              <div>
                <div className="text-xl font-black font-mono text-emerald-300">{stats.rate}%</div>
                <div className="text-[10px] text-slate-400">concluídas</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 text-slate-300 leading-relaxed">
              {focus ? (
                <>
                  <span className="font-mono text-rose-300">{focus.id}</span> • {STATUS_PT[focus.status]}
                  <br />
                  {focusMember?.nameRomaji} • prazo {focus.dueDate.slice(8, 10)}/{focus.dueDate.slice(5, 7)}
                  <br />
                  {focusProject ? focusProject.name : 'sem projeto'}
                </>
              ) : (
                <span className="text-slate-500">Nenhuma atividade criada nesta apresentação ainda.</span>
              )}
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-2 mt-auto">
            <InfoTag kind="demo">DADOS FICTÍCIOS • SEM INTEGRAÇÕES REAIS</InfoTag>
            <button
              onClick={resetDemoState}
              className="flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] text-[11px] font-mono text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restaurar dados da demonstração
            </button>
          </div>
        </div>

        {/* O produto real, em sua janela (tema claro do ERP) */}
        <div className="lg:col-span-9 min-h-0 flex flex-col rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-[#F8FAFC]">
          <div className="shrink-0 h-8 px-3 flex items-center justify-between bg-slate-900 text-[11px] font-mono text-slate-300">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="ml-2 text-white font-bold">Kizuna Start • Atividades</span>
            </span>
            <span className="text-amber-300">DEMO • dados fictícios • ref. 21/10/2026</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 text-slate-900">
            <ActivitiesModule
              embedded
              highlight={step.zone}
              focusId={lastCreatedActivityId}
              view={view}
              onViewChange={setView}
              onOpenAudit={openAuditInErp}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default DemoSection;
