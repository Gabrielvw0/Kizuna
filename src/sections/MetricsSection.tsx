import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  Handshake,
  Activity,
  TrendingUp,
  ArrowRight,
  Radar,
  Sliders,
  DollarSign,
  Cpu
} from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import metricsData from '../data/metrics.json';

interface TacticalQuadrant {
  id: 'mercado' | 'produto' | 'comercial' | 'financeiro';
  title: string;
  jp: string;
  risk: string;
  trigger: string;
  triggerValue: string;
  response: string;
  status: 'OPTIMAL' | 'WATCH' | 'ALERT';
  icon: React.ReactNode;
  colorClass: string;
  borderClass: string;
}

// Conteúdo (riscos, gatilhos, respostas e status ilustrativo) vem de src/data/metrics.json (riskPanel).
// Aqui ficam apenas ícone e cores de cada quadrante.
const QUADRANT_STYLE: Record<
  TacticalQuadrant['id'],
  { icon: React.ReactNode; colorClass: string; borderClass: string }
> = {
  mercado: { icon: <Handshake className="w-5 h-5 text-amber-400" />, colorClass: 'text-amber-400', borderClass: 'border-amber-500/50' },
  produto: { icon: <Cpu className="w-5 h-5 text-emerald-400" />, colorClass: 'text-emerald-400', borderClass: 'border-emerald-500/50' },
  comercial: { icon: <TrendingUp className="w-5 h-5 text-rose-400" />, colorClass: 'text-rose-400', borderClass: 'border-rose-500/50' },
  financeiro: { icon: <DollarSign className="w-5 h-5 text-cyan-400" />, colorClass: 'text-cyan-400', borderClass: 'border-cyan-500/50' }
};

const TACTICAL_QUADRANTS: TacticalQuadrant[] = metricsData.riskPanel.quadrants.map((q) => ({
  ...(q as Omit<TacticalQuadrant, 'icon' | 'colorClass' | 'borderClass'>),
  ...QUADRANT_STYLE[q.id as TacticalQuadrant['id']]
}));

export const MetricsSection: React.FC = () => {
  const { sceneIndex, setSceneIndex, nextStep } = usePresentation();
  // Cena 1: 4 quadrantes de risco • Cena 2: painel dos 6 KPIs e metas propostas
  const scene = Math.min(1, Math.max(0, sceneIndex));
  const [selectedQuadrantId, setSelectedQuadrantId] = useState<string>('mercado');
  const [focus, setFocus] = useState<{ type: 'phase' | 'kpi'; id: string } | null>(null);

  const { phases, kpis, transversalIndicator } = metricsData;
  const phaseOf = (id: string) => phases.find((ph) => ph.id === id);
  const focusedKpiIds = !focus
    ? null
    : focus.type === 'kpi'
    ? [focus.id]
    : kpis.items.filter((k) => k.phaseId === focus.id).map((k) => k.id);
  const focusedPhaseIds = !focus
    ? null
    : focus.type === 'phase'
    ? [focus.id]
    : [kpis.items.find((k) => k.id === focus.id)?.phaseId ?? ''];

  const activeQuad =
    TACTICAL_QUADRANTS.find((q) => q.id === selectedQuadrantId) || TACTICAL_QUADRANTS[0];

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-6 md:px-14 pt-6 pb-6 overflow-y-auto select-none">
      {/* Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/10 pb-3.5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600/15 border border-red-500/40 text-[10px] font-mono tracking-[0.2em] text-red-300 uppercase">
              TELA 14 / 15 • RISCOS E INDICADORES (KPIS)
            </span>
            <span className="text-[11px] font-mono text-slate-400 tracking-widest">
              標 • CENTRO DE COMANDO &amp; GATILHOS DE CONTROLE
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
            UMA ESTRATÉGIA <span className="text-red-500">PRECISA SER MONITORADA.</span>
          </h1>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5">
            {['1. RISCOS', '2. KPIs'].map((label, idx) => (
              <button
                key={label}
                onClick={() => setSceneIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                  scene === idx
                    ? 'bg-red-600 border-red-400 text-white'
                    : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-red-500/40 text-xs font-mono text-white flex items-center gap-2">
            <Radar className="w-4 h-4 text-red-400 animate-spin" />
            <span>{scene === 0 ? '4 QUADRANTES DE RISCO • GATILHOS PROPOSTOS' : kpis.badge}</span>
          </div>
        </div>
      </div>

      {scene === 1 && (
        <div className="relative z-10 flex flex-col gap-3 my-auto py-2 animate-fadeIn">
          {/* Metas e períodos definidos no projeto (metrics.json) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {phases.map((ph) => {
              const on = focusedPhaseIds ? focusedPhaseIds.includes(ph.id) : true;
              return (
                <button
                  key={ph.id}
                  onClick={() => setFocus(focus?.type === 'phase' && focus.id === ph.id ? null : { type: 'phase', id: ph.id })}
                  className={`text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    on ? 'bg-slate-900/95 border-amber-400/50' : 'bg-slate-950/70 border-white/10 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-amber-300 font-bold">{ph.period}</span>
                    <span className="text-slate-400">{ph.stage}</span>
                  </div>
                  <div className="text-lg font-black font-mono text-white mt-1">{ph.targetNumber}</div>
                  <div className="text-[11px] text-slate-300 leading-snug">{ph.targetLabel}</div>
                  <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-400/40 text-[9px] font-mono text-purple-200">
                    {ph.badge}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
            <span className="text-sm font-black font-mono text-emerald-300">
              {transversalIndicator.value} {transversalIndicator.label}
            </span>
            <span className="text-[10px] font-mono text-emerald-200/80">{transversalIndicator.badge}</span>
            <span className="text-[11px] italic text-slate-300 sm:ml-auto">“{transversalIndicator.quote}”</span>
          </div>

          {/* Os 6 KPIs, agrupados nas 3 dimensões do material de apoio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {kpis.dimensions.map((dim) => (
              <div key={dim.id} className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-bold text-white tracking-widest">{dim.label}</span>
                  <span className="text-slate-500">
                    acompanha o risco: {dim.riskIds.map((r) => r.toUpperCase()).join(' + ')}
                  </span>
                </div>
                {kpis.items
                  .filter((k) => k.dimension === dim.id)
                  .map((k) => {
                    const ph = phaseOf(k.phaseId);
                    const deliverable =
                      'deliverableIndex' in k && ph ? ph.deliverables[k.deliverableIndex as number] : null;
                    const base = 'base' in k ? (k.base as { type: string; id: string }) : null;
                    const basePhase = base?.type === 'phase' ? phaseOf(base.id) : null;
                    const baseRisk =
                      base?.type === 'risk' ? metricsData.riskPanel.quadrants.find((q) => q.id === base.id) : null;
                    const on = focusedKpiIds ? focusedKpiIds.includes(k.id) : true;
                    return (
                      <button
                        key={k.id}
                        onClick={() => setFocus(focus?.type === 'kpi' && focus.id === k.id ? null : { type: 'kpi', id: k.id })}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          on ? 'bg-slate-900/95 border-white/20' : 'bg-slate-950/70 border-white/5 opacity-40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-black text-white">{k.label}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-500/20 border border-slate-400/40 text-[9px] font-mono text-slate-200 shrink-0">
                            META A DEFINIR
                          </span>
                        </div>
                        {ph && (
                          <div className="text-[10px] font-mono text-amber-300 mt-1">
                            Fase: {ph.period} • {ph.stage}
                          </div>
                        )}
                        {deliverable && (
                          <div className="text-[11px] text-slate-300 leading-snug mt-0.5">Medido por: {deliverable}</div>
                        )}
                        {basePhase && (
                          <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                            Base proposta: {basePhase.targetLabel}
                          </div>
                        )}
                        {baseRisk && (
                          <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                            Limiar de alerta: {baseRisk.trigger} ({baseRisk.triggerValue})
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-400/40 text-purple-200">META PROPOSTA</span>
            <span>número definido pelo projeto</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-500/20 border border-slate-400/40 text-slate-200">META A DEFINIR</span>
            <span>KPI acompanhado, sem número ainda</span>
            <span className="text-slate-300">Resultados realizados: nenhum</span>
          </div>
        </div>
      )}

      {/* Main 4-Quadrant Tactical Command Grid */}
      <div className={`relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-auto py-2 items-stretch ${scene === 0 ? '' : 'hidden'}`}>
        {TACTICAL_QUADRANTS.map((quad) => {
          const isSelected = selectedQuadrantId === quad.id;
          return (
            <button
              key={quad.id}
              onClick={() => setSelectedQuadrantId(quad.id)}
              className={`text-left p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? `bg-slate-900/95 ${quad.borderClass} shadow-[0_0_25px_rgba(239,68,68,0.3)] scale-[1.02]`
                  : 'bg-slate-950/80 border-white/10 hover:border-white/25'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${quad.colorClass}`}>
                    {quad.title} • {quad.jp}
                  </span>
                  <div className="p-1.5 rounded-lg bg-white/5">{quad.icon}</div>
                </div>

                <div className="text-xs font-bold text-white mb-2 leading-snug">
                  {quad.risk}
                </div>

                <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono mb-2">
                  <span className="text-slate-400 block text-[9px] uppercase">Gatilho de Alerta:</span>
                  <span className="text-amber-300 font-bold">{quad.trigger} ({quad.triggerValue})</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] text-slate-300 leading-relaxed">
                <span className="text-emerald-400 font-mono font-bold block text-[9px] uppercase">
                  Resposta Imediata:
                </span>
                {quad.response}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Quadrant Telemetry Console Drawer */}
      <div className="relative z-10 p-5 rounded-3xl bg-slate-950/95 border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        {scene === 1 ? (
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Os gatilhos da cena anterior avisam quando um risco se aproxima; os KPIs medem se as respostas funcionam.{' '}
            {kpis.note} {metricsData.disclaimer}
          </p>
        ) : (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 border border-white/10 ${activeQuad.colorClass}`}>
              STATUS ILUSTRATIVO: {activeQuad.status}
            </span>
            <span className="text-sm font-bold text-white">Centro de Controle (modelo): {activeQuad.title}</span>
            <span className="text-xs font-serif text-slate-400">({activeQuad.jp})</span>
          </div>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Modelo proposto de acompanhamento: gatilhos e limiares são propostas do projeto, sem dados reais de operação. A intenção é intervir cedo, antes que uma barreira comprometa a reputação corporativa (絆). Cada gatilho será acompanhado pelos 6 KPIs da próxima cena.
          </p>
        </div>
        )}

        <button
          onClick={nextStep}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shrink-0 self-end md:self-auto"
        >
          <span>{scene === 0 ? 'Ver os 6 KPIs' : 'Avançar para Encerramento'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default MetricsSection;
