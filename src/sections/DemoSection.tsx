import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { useKizuna } from '../context/KizunaContext';
import { ActivitiesModule, GuideZone } from '../components/modules/ActivitiesModule';
import { DEMO_TODAY, TEAM_MEMBERS } from '../data/startActivitiesData';
import { Kicker, DisplayTitle, Accent, Classification } from '../components/strategic/Editorial';

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
    <div className="relative w-full h-full flex flex-col gap-3 short:gap-2 px-4 md:px-10 py-4 short:py-2 overflow-hidden select-none">
      {/* Cabeçalho editorial; os controles da demonstração ficam à direita */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <Kicker code="05" label="Demonstração real • Kizuna Start" jp="動" />
          <DisplayTitle size="md" className="mt-2 short:mt-1">
            Uma informação. <Accent>Uma operação.</Accent>
          </DisplayTitle>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {backupVideoMode && (
            <span role="status" className="text-[11px] uppercase tracking-[0.16em] text-kin-soft">
              Simulação automática • passo {scene + 1}/5
            </span>
          )}
          <button
            onClick={resetDemoState}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 border border-washi/15 bg-sumi-800/80 text-xs text-washi-muted hover:border-washi/35"
            title="Restaurar dados da demonstração"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restaurar
          </button>
          <button
            onClick={toggleBackupSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs ${
              backupVideoMode ? 'bg-kin/15 border-kin text-kin-soft' : 'bg-sumi-800/80 border-washi/15 text-washi-muted hover:border-washi/35'
            }`}
            title="Contingência: executa os 5 passos sozinha, um a cada 2,4 s (tecla V)"
          >
            {backupVideoMode ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {backupVideoMode ? 'Interromper (V)' : 'Simulação de reserva (V)'}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Roteiro da demonstração: os 5 passos sempre visíveis; o atual aberto */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          {/* Abaixo de 1024 px: só o passo atual e uma linha de estado */}
          <div key={scene} className="lg:hidden border-l-2 border-beni pl-3 animate-fadeIn">
            <div className="text-[11px] uppercase tracking-[0.18em] text-beni-soft">Passo {scene + 1} de 5</div>
            <div className="text-base font-semibold text-washi">{step.title}</div>
            <p className="text-xs text-washi-muted leading-snug">{step.action}</p>
            <p className="mt-1 text-[11px] text-washi-muted">
              Estado atual: <strong className="text-washi">{stats.open}</strong> em aberto •{' '}
              <strong className={stats.overdue ? 'text-beni-soft' : 'text-washi'}>{stats.overdue}</strong> atrasadas •{' '}
              <strong className="text-washi">{stats.rate}%</strong> concluídas
              {focus && <> • {focus.id} {STATUS_PT[focus.status].toLowerCase()}</>}
            </p>
          </div>

          <ol className="hidden lg:block border-t border-washi/10" aria-label="Passos da demonstração">
            {STEPS.map((st, i) => {
              const active = i === scene;
              const done = i < scene;
              return (
                <li key={st.zone} className={`relative py-2.5 short:py-1.5 pl-4 border-b border-washi/10 ${active ? 'bg-beni/[0.07]' : ''}`}>
                  <span aria-hidden className={`absolute left-0 top-0 bottom-0 w-[2px] ${active ? 'bg-beni' : 'bg-transparent'}`} />
                  <div className="flex items-baseline gap-3">
                    <span className={`font-display text-base tabular-nums ${active ? 'text-beni-soft' : 'text-washi-dim'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={`text-sm ${active ? 'text-washi font-semibold' : done ? 'text-washi-muted' : 'text-washi-dim'}`}>{st.title}</span>
                    {done && <Check className="w-3.5 h-3.5 text-washi-dim" aria-label="concluído" />}
                  </div>
                  {active && <p className="mt-1 pl-8 text-xs text-washi-muted leading-snug animate-fadeIn">{st.action}</p>}
                </li>
              );
            })}
          </ol>

          {/* Estado real do módulo, lido do mesmo estado do ERP */}
          <div className="hidden lg:block mt-4 short:mt-3">
            <div className="text-[11px] uppercase tracking-[0.2em] text-washi-dim">Estado atual do módulo</div>
            <div className="mt-2 grid grid-cols-3 divide-x divide-washi/10">
              <div className="pr-2">
                <div className="font-display text-3xl short:text-2xl text-washi tabular-nums">{stats.open}</div>
                <div className="text-[11px] text-washi-dim">em aberto</div>
              </div>
              <div className="px-2">
                <div className={`font-display text-3xl short:text-2xl tabular-nums ${stats.overdue ? 'text-beni-soft' : 'text-washi'}`}>{stats.overdue}</div>
                <div className="text-[11px] text-washi-dim">atrasadas</div>
              </div>
              <div className="pl-2">
                <div className="font-display text-3xl short:text-2xl text-washi tabular-nums">{stats.rate}%</div>
                <div className="text-[11px] text-washi-dim">concluídas</div>
              </div>
            </div>
            <div className="mt-3 pt-3 short:mt-2 short:pt-2 border-t border-washi/10 text-xs text-washi-muted leading-relaxed">
              {focus ? (
                <>
                  <span className="text-washi">{focus.id}</span> • {STATUS_PT[focus.status]}
                  <br />
                  {focusMember?.nameRomaji} • prazo {focus.dueDate.slice(8, 10)}/{focus.dueDate.slice(5, 7)}
                  <br />
                  {focusProject ? focusProject.name : 'sem projeto'}
                </>
              ) : (
                <span className="text-washi-dim">Nenhuma atividade criada nesta apresentação ainda.</span>
              )}
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-2 mt-auto pt-3">
            <Classification kind="demo">Dados fictícios • sem integrações reais</Classification>
            <button
              onClick={resetDemoState}
              className="flex items-center gap-1.5 self-start px-3 py-1.5 border border-washi/15 bg-sumi-800/80 hover:border-washi/35 text-xs text-washi-muted"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restaurar dados da demonstração
            </button>
          </div>
        </div>

        {/* O produto real, em sua janela (tema claro do ERP) */}
        <div className="lg:col-span-9 min-h-0 flex flex-col rounded-md overflow-hidden border border-washi/20 shadow-[0_30px_80px_rgba(0,0,0,0.6)] bg-[#F8FAFC]">
          <div className="shrink-0 h-8 px-3 flex items-center justify-between bg-sumi-800 border-b border-washi/10 text-[11px] text-washi-muted">
            <span className="flex items-center gap-2">
              <span className="font-display text-beni-soft">絆</span>
              <span className="text-washi font-semibold">Kizuna Start • Atividades</span>
            </span>
            <span className="text-kin-soft">Demo • dados fictícios • ref. 21/10/2026</span>
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
