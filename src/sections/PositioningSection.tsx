import React, { useState } from 'react';
import { Compass, CheckCircle2, ArrowRight, Sparkles, Orbit } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { getPlan, yen } from '../data/pricing';

interface CompetitorNode {
  id: string;
  name: string;
  jp: string;
  quadrant: string;
  scope: string;
  cultural: string;
  limitation: string;
  xPercent: number;
  yPercent: number;
  isKizuna?: boolean;
}

const COMPETITORS: CompetitorNode[] = [
  {
    id: 'sap_oracle',
    name: 'SAP / Oracle',
    jp: '海外メガERP',
    quadrant: 'Extremo Direito Inferior',
    scope: 'Altíssimo / Complexo',
    cultural: 'Baixa (Genérica / Global)',
    limitation: 'Hipótese do grupo (a validar): soluções amplas tendem a exigir custo e prazo de implantação elevados para PMEs.',
    xPercent: 78,
    yPercent: 75
  },
  {
    id: 'obic_bugyo',
    name: 'OBIC / 奉行 (Bugyo)',
    jp: '国内従来型ERP',
    quadrant: 'Extremo Esquerdo Superior',
    scope: 'Fechado / Rígido',
    cultural: 'Alta (Nativa Tradicional)',
    limitation: 'Hipótese do grupo (a validar): forte aderência local, com possível menor abertura a integrações modernas e à expansão global.',
    xPercent: 24,
    yPercent: 28
  },
  {
    id: 'freee_mf',
    name: 'Freee / Money Forward',
    jp: 'クラウド会計・労務',
    quadrant: 'Centro-Esquerda',
    scope: 'Focado em Fiscal / Contábil',
    cultural: 'Média-Alta',
    limitation: 'Hipótese do grupo (a validar): foco em contabilidade e RH; a cobertura de projetos e tarefas deve ser conferida em fontes oficiais.',
    xPercent: 32,
    yPercent: 55
  },
  {
    id: 'notion_asana',
    name: 'Notion / Asana',
    jp: '海外生産性ツール',
    quadrant: 'Esquerdo Inferior',
    scope: 'Produtividade de Equipe',
    cultural: 'Baixa (Sem Regras Locais)',
    limitation: 'Hipótese do grupo (a validar): produtividade de equipe moderna; o suporte a rituais japoneses (Ringi/Hanko) e a requisitos fiscais locais deve ser conferido.',
    xPercent: 20,
    yPercent: 82
  },
  {
    id: 'kizuna',
    name: 'KIZUNA (絆)',
    jp: 'グローバル技術 × 日本適応',
    quadrant: 'Quadrante Superior Direito ★',
    scope: 'Modular (Equipes → ERP)',
    cultural: 'Alta (Keigo, Ringi, APPI)',
    limitation: `Proposta: combinar facilidade de entrada (${yen(getPlan('start').priceMonthly)}, preço sugerido) com engenharia corporativa e adaptação local.`,
    xPercent: 80,
    yPercent: 22,
    isKizuna: true
  }
];

export const PositioningSection: React.FC = () => {
  const { setSceneIndex, nextStep } = usePresentation();
  const [selectedCompId, setSelectedCompId] = useState<string>('kizuna');

  const activeComp = COMPETITORS.find((c) => c.id === selectedCompId) || COMPETITORS[4];

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-6 md:px-14 pt-6 pb-6 overflow-y-auto select-none">
      {/* Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/10 pb-3.5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600/15 border border-red-500/40 text-[10px] font-mono tracking-[0.2em] text-red-300 uppercase">
              TELA 12 / 15 • POSICIONAMENTO E CONCORRÊNCIA
            </span>
            <span className="text-[11px] font-mono text-slate-400 tracking-widest">
              位 • CONSTELAÇÃO COMPETITIVA 3D
            </span>
          </div>
          <h1 className="text-xl md:text-3xl lg:text-4xl font-black tracking-tight text-white">
            SE O JAPÃO JÁ POSSUI SISTEMAS,{' '}
            <span className="text-red-500">POR QUE ESCOLHER O KIZUNA?</span>
          </h1>
        </div>

        <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-400/40 text-xs font-mono text-amber-300 shrink-0">
          ALTA ADAPTAÇÃO LOCAL × ESCOPO MODULAR ESCALÁVEL
        </div>
      </div>

      {/* Main 2x2 Celestial Constellation Matrix */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-auto py-2">
        {/* Left 7 Cols: Constellation Scatter Grid */}
        <div className="lg:col-span-7 relative rounded-3xl bg-slate-950/95 border border-white/15 p-6 flex flex-col justify-between overflow-hidden min-h-[360px] shadow-2xl">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-slate-400 z-10">
            <span>▲ EIXO VERTICAL: ADAPTAÇÃO CULTURAL (BAIXA → ALTA/NATIVA)</span>
            <span className="text-amber-300 font-bold">POSIÇÃO-ALVO DO KIZUNA ★</span>
          </div>

          <div className="relative flex-1 my-3 rounded-2xl bg-slate-900/50 border border-white/10 overflow-hidden">
            {/* Center Grid Lines */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/15" />
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/15" />

            {/* Glowing Golden Apex Quadrant */}
            <div className="absolute right-0 top-0 w-1/2 h-1/2 bg-gradient-to-bl from-red-600/25 via-amber-500/10 to-transparent pointer-events-none" />

            {/* Axis Labels */}
            <div className="absolute bottom-2 right-4 text-[9px] font-mono text-slate-400 uppercase">
              Escopo Amplo / Complexo ▶
            </div>
            <div className="absolute bottom-2 left-4 text-[9px] font-mono text-slate-400 uppercase">
              ◀ Escopo Especializado
            </div>

            {/* Competitor Nodes */}
            {COMPETITORS.map((comp) => {
              const isSelected = selectedCompId === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => {
                    setSelectedCompId(comp.id);
                    setSceneIndex(comp.isKizuna ? 1 : 0);
                  }}
                  style={{ left: `${comp.xPercent}%`, top: `${comp.yPercent}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-xl border text-left transition-all duration-300 hover:scale-105 cursor-pointer ${
                    comp.isKizuna
                      ? 'bg-gradient-to-br from-red-600 via-rose-700 to-slate-950 border-2 border-amber-300 shadow-[0_0_35px_rgba(239,68,68,0.7)] z-20 scale-105'
                      : isSelected
                      ? 'bg-slate-800 border-white/60 z-10'
                      : 'bg-slate-950/90 border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-black tracking-wide ${
                        comp.isKizuna ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {comp.name}
                    </span>
                    {comp.isKizuna && <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />}
                  </div>
                  <div
                    className={`text-[9px] font-serif ${
                      comp.isKizuna ? 'text-amber-200' : 'text-slate-400'
                    }`}
                  >
                    {comp.jp}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between border-t border-white/10 pt-2">
            <span>Clique nos concorrentes para comparar diferenciais</span>
            <span className="text-amber-300 font-bold">Mapa conceitual: avaliação qualitativa do grupo, sem pesquisa de mercado</span>
          </div>
        </div>

        {/* Right 5 Cols: Comparative Breakdown Drawer */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-950/95 border border-red-500/30 p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-400 font-bold">
                DIAGNÓSTICO COMPETITIVO
              </span>
              <span className="text-xs font-serif text-amber-300">{activeComp.jp}</span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <h2 className="text-2xl font-black text-white">{activeComp.name}</h2>
              {activeComp.isKizuna && (
                <span className="px-2 py-0.5 rounded bg-red-600/30 border border-red-400/50 text-[10px] font-mono text-red-200">
                  POSIÇÃO-ALVO DO PROJETO
                </span>
              )}
            </div>

            <div className="space-y-2.5 my-4">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10">
                <div className="text-[10px] font-mono uppercase text-slate-400">Escopo de Solução</div>
                <div className="text-xs font-bold text-white mt-0.5">{activeComp.scope}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10">
                <div className="text-[10px] font-mono uppercase text-slate-400">Adaptação Cultural &amp; UX</div>
                <div className="text-xs font-bold text-amber-300 mt-0.5">{activeComp.cultural}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10">
                <div className="text-[10px] font-mono uppercase text-slate-400">Hipótese de limitação / Razão de escolha</div>
                <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{activeComp.limitation}</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Diferencial pretendido</span>
            <button
              onClick={nextStep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PositioningSection;
