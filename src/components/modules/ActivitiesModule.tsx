import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useKizuna } from '../../context/KizunaContext';
import { ActivityRecord, ActivityStatus, TeamId } from '../../types/erp';
import { DEMO_TODAY, TEAM_LABELS, TEAM_MEMBERS, TEAM_ORDER } from '../../data/startActivitiesData';
import { ListChecks, Plus, AlertTriangle, CheckCircle2, Clock, Users, FolderKanban, Activity } from 'lucide-react';

const STATUS_ORDER: ActivityStatus[] = ['TODO', 'DOING', 'DONE'];

const STATUS_STYLE: Record<ActivityStatus, string> = {
  TODO: 'bg-slate-100 text-slate-700 border-slate-300',
  DOING: 'bg-blue-50 text-blue-800 border-blue-300',
  DONE: 'bg-emerald-50 text-emerald-800 border-emerald-300',
};

const dayDiff = (a: string, b: string) =>
  Math.round((new Date(a + 'T00:00:00Z').getTime() - new Date(b + 'T00:00:00Z').getTime()) / 86400000);

const isOverdue = (a: ActivityRecord) => a.status !== 'DONE' && a.dueDate < DEMO_TODAY;

const fmtDate = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

const Bar: React.FC<{ pct: number; tone?: string }> = ({ pct, tone = 'bg-emerald-500' }) => (
  <div className="h-1.5 w-full rounded bg-slate-200 overflow-hidden">
    <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
  </div>
);

export type GuideZone = 'create' | 'assign' | 'status' | 'project' | 'manager';

interface ActivitiesModuleProps {
  /** Modo incorporado na apresentação: sem cabeçalho próprio e sem prender o foco do teclado. */
  embedded?: boolean;
  /** Zona destacada pela demonstração guiada. */
  highlight?: GuideZone | null;
  /** Atividade em foco na demonstração guiada (destaque na lista). */
  focusId?: string | null;
  /** Visão controlada de fora (lista ou visão gerencial). */
  view?: 'list' | 'manager';
  onViewChange?: (view: 'list' | 'manager') => void;
  /** Ação do link da trilha completa (no ERP abre o módulo de auditoria). */
  onOpenAudit?: () => void;
}

const GUIDE_RING = 'ring-4 ring-rose-400/80 ring-offset-2 ring-offset-white transition-shadow';

export const ActivitiesModule: React.FC<ActivitiesModuleProps> = ({
  embedded = false,
  highlight = null,
  focusId = null,
  view: controlledView,
  onViewChange,
  onOpenAudit,
}) => {
  const {
    activities,
    projects,
    auditLogs,
    createActivity,
    setActivityStatus,
    assignActivity,
    setActivityDueDate,
    setActivityProject,
    setActiveModule,
    t,
  } = useKizuna();

  const [internalView, setInternalView] = useState<'list' | 'manager'>('list');
  const view = controlledView ?? internalView;
  const setView = (v: 'list' | 'manager') => {
    setInternalView(v);
    onViewChange?.(v);
  };
  const hl = (zone: GuideZone) => (highlight === zone ? GUIDE_RING : '');
  const guideAttr = (zone: GuideZone) => (highlight === zone ? { 'data-guide-active': 'true' } : {});
  // Na apresentação, o foco não pode ficar preso em campos: o controle remoto precisa seguir funcionando.
  const releaseFocus = (el: HTMLElement | null) => {
    if (embedded) el?.blur();
  };

  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!highlight) return;
    const el = rootRef.current?.querySelector('[data-guide-active="true"]');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlight, focusId, view]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | ActivityStatus | 'OVERDUE'>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');

  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState(TEAM_MEMBERS[0].id);
  const [dueDate, setDueDate] = useState('2026-10-30');
  const [projectId, setProjectId] = useState<string>('');
  const [formError, setFormError] = useState('');

  const memberById = (id: string) => TEAM_MEMBERS.find((m) => m.id === id);

  const stats = useMemo(() => {
    const total = activities.length;
    const done = activities.filter((a) => a.status === 'DONE').length;
    const doing = activities.filter((a) => a.status === 'DOING').length;
    const todo = activities.filter((a) => a.status === 'TODO').length;
    const overdue = activities.filter(isOverdue).length;
    const dueSoon = activities.filter(
      (a) => a.status !== 'DONE' && a.dueDate >= DEMO_TODAY && dayDiff(a.dueDate, DEMO_TODAY) <= 7
    ).length;
    const rate = total ? Math.round((done / total) * 100) : 0;
    return { total, done, doing, todo, overdue, dueSoon, rate };
  }, [activities]);

  const filtered = useMemo(
    () =>
      activities.filter((a) => {
        if (projectFilter === 'NONE' && a.projectId) return false;
        if (projectFilter !== 'ALL' && projectFilter !== 'NONE' && a.projectId !== projectFilter) return false;
        if (statusFilter === 'OVERDUE') return isOverdue(a);
        if (statusFilter !== 'ALL') return a.status === statusFilter;
        return true;
      }),
    [activities, statusFilter, projectFilter]
  );

  const statusLabel = (s: ActivityStatus) =>
    s === 'TODO' ? t('To do', 'A fazer') : s === 'DOING' ? t('In progress', 'Em andamento') : t('Done', 'Concluída');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError(t('Enter a title.', 'Informe um título.'));
      return;
    }
    if (!dueDate) {
      setFormError(t('Choose a due date.', 'Escolha um prazo.'));
      return;
    }
    const ok = createActivity({ title, assigneeId, dueDate, projectId: projectId || null });
    if (ok) {
      setTitle('');
      setFormError('');
      if (embedded) (document.activeElement as HTMLElement | null)?.blur();
    }
  };

  const teamStats = TEAM_ORDER.map((teamId: TeamId) => {
    const members = TEAM_MEMBERS.filter((m) => m.team === teamId);
    const own = activities.filter((a) => members.some((m) => m.id === a.assigneeId));
    const done = own.filter((a) => a.status === 'DONE').length;
    return {
      teamId,
      total: own.length,
      done,
      doing: own.filter((a) => a.status === 'DOING').length,
      overdue: own.filter(isOverdue).length,
      rate: own.length ? Math.round((done / own.length) * 100) : 0,
    };
  });

  const projectStats = [
    ...projects.map((p) => ({ id: p.id as string | null, name: p.name })),
    { id: null as string | null, name: t('No project', 'Sem projeto') },
  ].map((p) => {
    const own = activities.filter((a) => a.projectId === p.id);
    const done = own.filter((a) => a.status === 'DONE').length;
    const open = own.filter((a) => a.status !== 'DONE');
    const next = open.map((a) => a.dueDate).sort()[0];
    return {
      ...p,
      total: own.length,
      done,
      overdue: own.filter(isOverdue).length,
      rate: own.length ? Math.round((done / own.length) * 100) : 0,
      next,
    };
  });

  const memberLoad = TEAM_MEMBERS.map((m) => {
    const own = activities.filter((a) => a.assigneeId === m.id && a.status !== 'DONE');
    return { m, open: own.length, overdue: own.filter(isOverdue).length };
  });
  const maxLoad = Math.max(1, ...memberLoad.map((x) => x.open));

  const recentAudit = auditLogs.filter((l) => l.targetId.startsWith('ATV-')).slice(0, 5);

  const kpiCards = [
    { label: t('Open', 'Em aberto'), value: stats.todo + stats.doing, icon: ListChecks, tone: 'text-slate-900' },
    { label: t('In progress', 'Em andamento'), value: stats.doing, icon: Activity, tone: 'text-blue-800' },
    { label: t('Done', 'Concluídas'), value: stats.done, icon: CheckCircle2, tone: 'text-emerald-700' },
    { label: t('Overdue', 'Atrasadas'), value: stats.overdue, icon: AlertTriangle, tone: stats.overdue ? 'text-red-700' : 'text-slate-900' },
    { label: t('Due in 7 days', 'Vencem em 7 dias'), value: stats.dueSoon, icon: Clock, tone: 'text-amber-700' },
    { label: t('Completion rate', 'Taxa de conclusão'), value: `${stats.rate}%`, icon: CheckCircle2, tone: 'text-slate-900' },
  ];

  return (
    <div ref={rootRef} className="space-y-5">
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 ${embedded ? 'hidden' : ''}`}>
        <div>
          <div className="text-xs text-slate-500 font-medium">チームとアクティビティの管理 • Kizuna Start</div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5 flex flex-wrap items-baseline gap-x-3">
            <span>アクティビティ管理</span>
            <span className="text-sm font-normal text-slate-500">
              / {t('Team & Activity Management', 'Gestão de Equipes e Atividades')}
            </span>
          </h1>
        </div>
        <div className="text-[11px] font-mono text-slate-500 text-right">
          <div>
            {t('Demo reference date', 'Data de referência da demonstração')}: <strong className="text-slate-800">21/10/2026</strong>
          </div>
          <div className="text-amber-700 font-semibold">{t('Fictitious data', 'Dados fictícios')}</div>
        </div>
      </div>

      {/* Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiCards.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white border border-slate-200 rounded-md p-3 shadow-sm">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{k.label}</span>
                <Icon className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className={`text-2xl font-bold mt-1 ${k.tone}`}>{k.value}</div>
            </div>
          );
        })}
      </div>

      {/* View switch */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setView('list')}
          className={`px-3 py-1.5 rounded text-xs font-semibold border ${
            view === 'list' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          {t('Activities', 'Atividades')}
        </button>
        <button
          onClick={() => setView('manager')}
          className={`px-3 py-1.5 rounded text-xs font-semibold border ${
            view === 'manager' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          {t('Management view (teams & projects)', 'Visão gerencial (equipes e projetos)')}
        </button>
      </div>

      {view === 'list' && (
        <div className="space-y-4">
          {/* Create */}
          <form onSubmit={handleCreate} {...guideAttr('create')} className={`bg-white border border-slate-200 rounded-md p-4 shadow-sm ${hl('create')}`}>
            <div className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> {t('New activity', 'Nova atividade')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
              <label className="md:col-span-4 text-[11px] text-slate-600">
                {t('Title', 'Título')}
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('e.g. Review weekly schedule', 'ex.: Revisar escala semanal')}
                  className="mt-0.5 w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-slate-900"
                />
              </label>
              <label className="md:col-span-3 text-[11px] text-slate-600">
                {t('Assignee', 'Responsável')}
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="mt-0.5 w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-slate-900 bg-white"
                >
                  {TEAM_MEMBERS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nameJp} ({m.nameRomaji})
                    </option>
                  ))}
                </select>
              </label>
              <label className="md:col-span-2 text-[11px] text-slate-600">
                {t('Due date', 'Prazo')}
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-0.5 w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-slate-900"
                />
              </label>
              <label className="md:col-span-2 text-[11px] text-slate-600">
                {t('Project', 'Projeto')}
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="mt-0.5 w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-slate-900 bg-white"
                >
                  <option value="">{t('No project', 'Sem projeto')}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="md:col-span-1 px-3 py-1.5 rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold"
              >
                {t('Create', 'Criar')}
              </button>
            </div>
            {formError && <div className="text-[11px] text-red-700 mt-1.5">{formError}</div>}
          </form>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {(['ALL', 'TODO', 'DOING', 'DONE', 'OVERDUE'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1 rounded border ${
                  statusFilter === f ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {f === 'ALL' ? t('All', 'Todas') : f === 'OVERDUE' ? t('Overdue', 'Atrasadas') : statusLabel(f)}
              </button>
            ))}
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="ml-auto px-2 py-1 border border-slate-300 rounded bg-white text-slate-800"
              aria-label={t('Project filter', 'Filtro de projeto')}
            >
              <option value="ALL">{t('All projects', 'Todos os projetos')}</option>
              <option value="NONE">{t('No project', 'Sem projeto')}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* List */}
          <div className="bg-white border border-slate-200 rounded-md shadow-sm divide-y divide-slate-100">
            {filtered.length === 0 && (
              <div className="p-6 text-xs text-slate-500 text-center">
                {t('No activity matches the filters.', 'Nenhuma atividade corresponde aos filtros.')}
              </div>
            )}
            {filtered.map((a) => {
              const overdue = isOverdue(a);
              const member = memberById(a.assigneeId);
              const inFocus = !!highlight && a.id === (focusId ?? filtered[0]?.id);
              const rowHl = (zone: GuideZone) => (inFocus ? hl(zone) : '');
              const rowAttr = (zone: GuideZone) => (inFocus ? guideAttr(zone) : {});
              return (
                <div
                  key={a.id}
                  data-activity-id={a.id}
                  className={`p-3 grid grid-cols-1 lg:grid-cols-12 gap-2 items-center ${overdue ? 'bg-red-50/40' : ''} ${inFocus ? 'bg-rose-50/60' : ''}`}
                >
                  <div className="lg:col-span-4 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-blue-900 font-bold">{a.id}</span>
                      {overdue && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-semibold">
                          {t('OVERDUE', 'ATRASADA')} ({dayDiff(DEMO_TODAY, a.dueDate)}d)
                        </span>
                      )}
                    </div>
                    <div className={`text-xs font-semibold mt-0.5 ${a.status === 'DONE' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                      {a.title}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {member ? `${member.nameJp} • ${TEAM_LABELS[member.team].pt}` : ''}
                    </div>
                  </div>

                  <div {...rowAttr('status')} className={`lg:col-span-2 flex items-center gap-1 rounded ${rowHl('status')}`}>
                    {STATUS_ORDER.map((s) => (
                      <button
                        key={s}
                        onClick={() => setActivityStatus(a.id, s)}
                        title={statusLabel(s)}
                        className={`px-1.5 py-1 rounded border text-[10px] font-semibold ${
                          a.status === s ? STATUS_STYLE[s] : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
                        }`}
                      >
                        {s === 'TODO' ? t('To do', 'Fazer') : s === 'DOING' ? t('Doing', 'Andando') : t('Done', 'Feito')}
                      </button>
                    ))}
                  </div>

                  <select
                    value={a.assigneeId}
                    onChange={(e) => {
                      assignActivity(a.id, e.target.value);
                      releaseFocus(e.currentTarget);
                    }}
                    {...rowAttr('assign')}
                    className={`lg:col-span-2 px-1.5 py-1 border border-slate-300 rounded text-[11px] bg-white text-slate-900 ${rowHl('assign')}`}
                    aria-label={t('Assignee', 'Responsável')}
                  >
                    {TEAM_MEMBERS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nameRomaji}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={a.dueDate}
                    onChange={(e) => setActivityDueDate(a.id, e.target.value)}
                    className={`lg:col-span-2 px-1.5 py-1 border border-slate-300 rounded text-[11px] text-slate-900 ${rowHl('assign')}`}
                    aria-label={t('Due date', 'Prazo')}
                  />

                  <select
                    value={a.projectId ?? ''}
                    onChange={(e) => {
                      setActivityProject(a.id, e.target.value || null);
                      releaseFocus(e.currentTarget);
                    }}
                    {...rowAttr('project')}
                    className={`lg:col-span-2 px-1.5 py-1 border border-slate-300 rounded text-[11px] bg-white text-slate-900 ${rowHl('project')}`}
                    aria-label={t('Project', 'Projeto')}
                  >
                    <option value="">{t('No project', 'Sem projeto')}</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'manager' && (
        <div {...guideAttr('manager')} className={`space-y-4 rounded-md ${hl('manager')}`}>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* By team */}
            <div className="bg-white border border-slate-200 rounded-md shadow-sm">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> {t('By team', 'Por equipe')}
              </div>
              <div className="divide-y divide-slate-100">
                {teamStats.map((ts) => (
                  <div key={ts.teamId} className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">
                        {TEAM_LABELS[ts.teamId].jp} <span className="font-normal text-slate-500">/ {TEAM_LABELS[ts.teamId].pt}</span>
                      </span>
                      <span className="font-mono text-slate-700">{ts.rate}%</span>
                    </div>
                    <Bar pct={ts.rate} />
                    <div className="flex flex-wrap gap-x-4 text-[11px] text-slate-600">
                      <span>{t('Total', 'Total')}: {ts.total}</span>
                      <span>{t('Doing', 'Em andamento')}: {ts.doing}</span>
                      <span>{t('Done', 'Concluídas')}: {ts.done}</span>
                      <span className={ts.overdue ? 'text-red-700 font-semibold' : ''}>{t('Overdue', 'Atrasadas')}: {ts.overdue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By project */}
            <div className="bg-white border border-slate-200 rounded-md shadow-sm">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5" /> {t('By project', 'Por projeto')}
              </div>
              <div className="divide-y divide-slate-100">
                {projectStats.map((ps) => (
                  <div key={ps.id ?? 'none'} className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 min-w-0 truncate">
                        {ps.id && <span className="font-mono text-[10px] text-blue-900 mr-1.5">{ps.id}</span>}
                        {ps.name}
                      </span>
                      <span className="font-mono text-slate-700">{ps.rate}%</span>
                    </div>
                    <Bar pct={ps.rate} tone="bg-blue-600" />
                    <div className="flex flex-wrap gap-x-4 text-[11px] text-slate-600">
                      <span>{t('Activities', 'Atividades')}: {ps.total}</span>
                      <span>{t('Done', 'Concluídas')}: {ps.done}</span>
                      <span className={ps.overdue ? 'text-red-700 font-semibold' : ''}>{t('Overdue', 'Atrasadas')}: {ps.overdue}</span>
                      <span>{t('Next due', 'Próximo prazo')}: {ps.next ? fmtDate(ps.next) : '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Workload */}
          <div className="bg-white border border-slate-200 rounded-md shadow-sm">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-900">
              {t('Open workload per person', 'Carga em aberto por pessoa')}
            </div>
            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {memberLoad.map(({ m, open, overdue }) => (
                <div key={m.id} className="text-[11px]">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>{m.nameJp} <span className="text-slate-400">({m.nameRomaji})</span></span>
                    <span className="font-mono">
                      {open}
                      {overdue > 0 && <span className="text-red-700 font-semibold"> • {overdue} {t('overdue', 'atrasada(s)')}</span>}
                    </span>
                  </div>
                  <Bar pct={Math.round((open / maxLoad) * 100)} tone={overdue ? 'bg-red-500' : 'bg-slate-500'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audit trail */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-900">
            {t('Recent changes (activity history)', 'Últimas alterações (histórico das atividades)')}
          </span>
          <button onClick={() => (onOpenAudit ? onOpenAudit() : setActiveModule('audit'))} className="text-[11px] text-blue-800 hover:underline">
            {t('Open full audit log (Enterprise demo)', 'Abrir trilha completa (demonstração Enterprise)')}
          </button>
        </div>
        {recentAudit.length === 0 ? (
          <div className="p-4 text-xs text-slate-500">
            {t('No changes yet. Create or edit an activity to see it recorded here.', 'Nenhuma alteração ainda. Crie ou edite uma atividade para vê-la registrada aqui.')}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentAudit.map((l) => (
              <li key={l.id} className="px-4 py-2 text-[11px] flex flex-wrap items-baseline gap-x-3">
                <span className="font-mono text-slate-400">{l.time}</span>
                <span className="font-mono text-blue-900 font-bold">{l.targetId}</span>
                <span className="text-slate-900">{t(l.actionEn, l.actionPt)}</span>
                <span className="text-slate-500">{l.detailEn}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
