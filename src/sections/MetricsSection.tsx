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

const TACTICAL_QUADRANTS: TacticalQuadrant[] = [
  {
    id: 'mercado',
    title: 'MERCADO',
    jp: '市場・文化適応',
    risk: 'Baixa taxa de adoção cultural inicial por desconfiança de software estrangeiro',
    trigger: 'Retenção da Equipe',
    triggerValue: '< 60% em 90 dias',
    response: 'Workshop presencial de onboarding com consultor japonês nativo e integrador local',
    status: 'WATCH',
    icon: <Handshake className="w-5 h-5 text-amber-400" />,
    colorClass: 'text-amber-400',
    borderClass: 'border-amber-500/50'
  },
  {
    id: 'produto',
    title: 'PRODUTO',
    jp: '製品・UX/敬語',
    risk: 'Rejeição de terminologia corporativa ou fricção no Keigo/fluxos de Ringi',
    trigger: 'NPS da Equipe',
    triggerValue: 'NPS < 30',
    response: 'Revisão imediata da interface com o comitê consultivo japonês e atualização quinzenal',
    status: 'OPTIMAL',
    icon: <Cpu className="w-5 h-5 text-emerald-400" />,
    colorClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/50'
  },
  {
    id: 'comercial',
    title: 'COMERCIAL',
    jp: '営業・意思決定サイクル',
    risk: 'Ciclo de vendas excessivamente longo devido à lentidão nos processos de Nemawashi',
    trigger: 'Tempo Médio de Fechamento',
    triggerValue: '> 6 meses',
    response: 'Ativação do modelo “Land & Expand”: entrada gratuita pelo Kizuna Start por 30 dias na equipe',
    status: 'WATCH',
    icon: <TrendingUp className="w-5 h-5 text-rose-400" />,
    colorClass: 'text-rose-400',
    borderClass: 'border-rose-500/50'
  },
  {
    id: 'financeiro',
    title: 'FINANCEIRO',
    jp: '財務・獲得効率',
    risk: 'Custo de aquisição elevado de clientes corporativos no Japão',
    trigger: 'Relação CAC vs LTV',
    triggerValue: 'CAC > LTV / 3',
    response: 'Fortalecimento de parcerias com integradores locais (SIers) com comissão de receita recorrente',
    status: 'OPTIMAL',
    icon: <DollarSign className="w-5 h-5 text-cyan-400" />,
    colorClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/50'
  }
];

export const MetricsSection: React.FC = () => {
  const { setSceneIndex, nextStep } = usePresentation();
  const [selectedQuadrantId, setSelectedQuadrantId] = useState<string>('mercado');

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

        <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-red-500/40 text-xs font-mono text-white flex items-center gap-2">
          <Radar className="w-4 h-4 text-red-400 animate-spin" />
          <span>4 QUADRANTES DE RISCO • GATILHOS PROPOSTOS</span>
        </div>
      </div>

      {/* Main 4-Quadrant Tactical Command Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-auto py-2 items-stretch">
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
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 border border-white/10 ${activeQuad.colorClass}`}>
              STATUS ILUSTRATIVO: {activeQuad.status}
            </span>
            <span className="text-sm font-bold text-white">Centro de Controle (modelo): {activeQuad.title}</span>
            <span className="text-xs font-serif text-slate-400">({activeQuad.jp})</span>
          </div>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Modelo proposto de acompanhamento: gatilhos e limiares são propostas do projeto, sem dados reais de operação. A intenção é intervir cedo, antes que uma barreira comprometa a reputação corporativa (絆).
          </p>
        </div>

        <button
          onClick={nextStep}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shrink-0 self-end md:self-auto"
        >
          <span>Avançar para Encerramento</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default MetricsSection;
