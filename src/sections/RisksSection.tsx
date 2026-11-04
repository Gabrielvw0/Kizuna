import React, { useState } from 'react';
import { Handshake, Cpu, TrendingUp, DollarSign, ShieldCheck } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import metricsData from '../data/metrics.json';
import { ScreenTitle, InfoTag } from '../components/strategic/ScreenTitle';

const ICONS: Record<string, React.FC<{ className?: string }>> = {
  mercado: Handshake,
  produto: Cpu,
  comercial: TrendingUp,
  financeiro: DollarSign
};

/**
 * Tela 11 • Riscos e planejamento de 12 meses.
 * Cena 1: 4 riscos, cada um com gatilho e resposta. Cena 2: marcos propostos para o primeiro ano.
 * Tudo vem de metrics.json e é meta/proposta: nenhum resultado foi realizado.
 */
export const RisksSection: React.FC = () => {
  const { sceneIndex } = usePresentation();
  const scene = Math.min(1, Math.max(0, sceneIndex));
  const { riskPanel, phases, transversalIndicator, kpis } = metricsData;
  const [riskId, setRiskId] = useState<string>(riskPanel.quadrants[0].id);
  const risk = riskPanel.quadrants.find((q) => q.id === riskId) || riskPanel.quadrants[0];

  return (
    <div className="relative w-full h-full flex flex-col justify-center gap-5 px-6 md:px-14 py-4 max-w-6xl mx-auto overflow-y-auto select-none">
      <ScreenTitle
        kicker="11 • Riscos e 12 meses • 標"
        title={
          scene === 0 ? (
            <>
              Quatro riscos, <span className="text-rose-500">uma resposta para cada.</span>
            </>
          ) : (
            <>
              O primeiro ano <span className="text-rose-500">em quatro marcos.</span>
            </>
          )
        }
        aside={<InfoTag kind="proposta">{scene === 0 ? 'GATILHOS PROPOSTOS' : metricsData.badge}</InfoTag>}
      />

      {scene === 0 ? (
        <div key="risks" className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-fadeIn">
          <div className="md:col-span-5 grid grid-cols-2 gap-3">
            {riskPanel.quadrants.map((q) => {
              const Icon = ICONS[q.id] ?? ShieldCheck;
              const sel = q.id === riskId;
              return (
                <button
                  key={q.id}
                  onClick={() => setRiskId(q.id)}
                  aria-pressed={sel}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    sel ? 'bg-rose-950/50 border-rose-500' : 'bg-slate-950/80 border-white/10 hover:border-white/30'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${sel ? 'text-rose-300' : 'text-slate-400'}`} />
                  <div className="mt-2 text-sm font-black text-white">{q.title}</div>
                  <div className="text-[10px] font-serif text-slate-400">{q.jp}</div>
                </button>
              );
            })}
          </div>

          <div key={risk.id} className="md:col-span-7 p-5 rounded-3xl bg-slate-950/90 border border-white/15 flex flex-col gap-4 animate-fadeIn">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Risco</div>
              <p className="mt-1 text-lg font-bold text-white leading-snug">{risk.risk}</p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-amber-400/30">
              <div className="text-[10px] font-mono uppercase text-slate-400">Gatilho de alerta</div>
              <div className="text-sm font-mono font-bold text-amber-300">
                {risk.trigger}: {risk.triggerValue}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
              <div className="text-[10px] font-mono uppercase text-emerald-300">Resposta</div>
              <div className="text-sm text-white">{risk.response}</div>
            </div>
            <p className="text-[11px] text-slate-500">{riskPanel.disclaimer}</p>
          </div>
        </div>
      ) : (
        <div key="milestones" className="flex flex-col gap-4 animate-fadeIn">
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-3">
            {phases.map((ph, i) => (
              <div key={ph.id} className="p-4 rounded-2xl bg-slate-950/85 border border-amber-400/40">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-amber-300 font-bold">{ph.period}</span>
                  <span className="text-slate-400">{i + 1}/4</span>
                </div>
                <div className="mt-1 text-xs font-mono text-slate-400">{ph.stage}</div>
                <div className="mt-2 text-3xl font-black font-mono text-white">{ph.targetNumber}</div>
                <div className="text-xs text-slate-300 leading-snug">{ph.targetUnit}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
            <span className="text-sm font-black font-mono text-emerald-300">
              {transversalIndicator.value} {transversalIndicator.label}
            </span>
            <span className="text-[11px] italic text-slate-300 sm:ml-auto">“{transversalIndicator.quote}”</span>
          </div>

          <p className="text-xs text-slate-300">
            Indicadores acompanhados: {kpis.items.map((k) => k.label).join(', ')} — metas numéricas definidas depois dos pilotos.
            <span className="block text-slate-500 mt-1">Resultados realizados: nenhum. O projeto é acadêmico e ainda não tem operação.</span>
          </p>
        </div>
      )}
    </div>
  );
};
export default RisksSection;
