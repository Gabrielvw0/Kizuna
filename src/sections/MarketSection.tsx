import React from 'react';
import { Users, BrainCircuit, Building2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { PRICING, getPlan, yen } from '../data/pricing';

interface RingTier {
  idx: number;
  ringLabel: string;
  name: string;
  price: string;
  tagline: string;
  jp: string;
  scopeItems: string[];
  icon: React.ReactNode;
}

const EXPANSION_RINGS: RingTier[] = [
  {
    idx: 0,
    ringLabel: 'ANEL 01 • ENTRADA',
    name: 'KIZUNA START',
    price: yen(getPlan('start').priceMonthly),
    tagline: 'Gestão de equipes',
    jp: 'チーム管理',
    scopeItems: getPlan('start').features,
    icon: <Users className="w-5 h-5" />
  },
  {
    idx: 1,
    ringLabel: 'ANEL 02 • EXPANSÃO',
    name: 'KIZUNA BUSINESS',
    price: yen(getPlan('business').priceMonthly),
    tagline: 'Gestão + inteligência',
    jp: '知能と自動化',
    scopeItems: getPlan('business').features,
    icon: <BrainCircuit className="w-5 h-5" />
  },
  {
    idx: 2,
    ringLabel: 'ANEL 03 • PLATAFORMA',
    name: 'KIZUNA ENTERPRISE',
    price: yen(getPlan('enterprise').priceMonthly),
    tagline: 'Gestão + escala',
    jp: '全社統合基盤',
    scopeItems: getPlan('enterprise').features,
    icon: <Building2 className="w-5 h-5" />
  }
];

export const MarketSection: React.FC = () => {
  const { sceneIndex, setSceneIndex, nextStep } = usePresentation();
  const activeRing = EXPANSION_RINGS[sceneIndex] || EXPANSION_RINGS[0];

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-6 md:px-14 pt-6 pb-6 overflow-y-auto select-none">
      {/* Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600/15 border border-red-500/40 text-[10px] font-mono tracking-[0.2em] text-red-300 uppercase">
              TELA 07 • ESTRATÉGIA LAND &amp; EXPAND
            </span>
            <span className="text-[11px] font-mono text-slate-400 tracking-widest">
              拡 • EVOLUÇÃO CONTÍNUA PELO FIO VERMELHO
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
            À MEDIDA QUE A CONFIANÇA CRESCE,{' '}
            <span className="text-red-500">A PLATAFORMA CRESCE.</span>
          </h1>
        </div>

        {/* Ring Selector Pills */}
        <div className="flex items-center gap-2">
          {EXPANSION_RINGS.map((ring) => {
            const active = sceneIndex === ring.idx;
            return (
              <button
                key={ring.name}
                onClick={() => setSceneIndex(ring.idx)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-mono uppercase transition-all cursor-pointer ${
                  active
                    ? 'bg-red-600 border-red-400 text-white font-bold shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                    : 'bg-slate-900/80 border-white/15 text-slate-300 hover:border-white/30'
                }`}
              >
                {ring.name.replace('KIZUNA ', '')} ({ring.price})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto py-2">
        {/* Left 6 Cols: Interactive Concentric Rings */}
        <div className="lg:col-span-6 relative h-[360px] md:h-[420px] rounded-3xl bg-slate-950/80 border border-white/10 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-w-[540px] max-h-[420px]" viewBox="0 0 560 420">
            <defs>
              <linearGradient id="redThreadExpand" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Ring 3: Enterprise */}
            <circle
              cx="280"
              cy="210"
              r="175"
              fill={sceneIndex >= 2 ? 'rgba(220,38,38,0.07)' : 'rgba(15,23,42,0.3)'}
              stroke={sceneIndex >= 2 ? '#d4af37' : 'rgba(255,255,255,0.12)'}
              strokeWidth={sceneIndex === 2 ? 2.5 : 1.2}
              strokeDasharray={sceneIndex >= 2 ? undefined : '6 6'}
              onClick={() => setSceneIndex(2)}
              className="cursor-pointer transition-all duration-500"
            />
            {/* Ring 2: Business */}
            <circle
              cx="280"
              cy="210"
              r="120"
              fill={sceneIndex >= 1 ? 'rgba(220,38,38,0.11)' : 'rgba(15,23,42,0.4)'}
              stroke={sceneIndex >= 1 ? '#ef4444' : 'rgba(255,255,255,0.18)'}
              strokeWidth={sceneIndex === 1 ? 2.5 : 1.5}
              onClick={() => setSceneIndex(1)}
              className="cursor-pointer transition-all duration-500"
            />
            {/* Ring 1: Start */}
            <circle
              cx="280"
              cy="210"
              r="65"
              fill="rgba(220,38,38,0.22)"
              stroke="#ef4444"
              strokeWidth={sceneIndex === 0 ? 3 : 1.8}
              onClick={() => setSceneIndex(0)}
              className="cursor-pointer transition-all duration-500"
            />

            {/* The Red Thread (赤い糸) traversing all 3 rings */}
            <path
              d="M 40 210 Q 160 185 280 210 T 520 210"
              fill="none"
              stroke="url(#redThreadExpand)"
              strokeWidth="3.5"
            />

            <circle cx="280" cy="210" r="7" fill="#ef4444" />
            <circle
              cx="400"
              cy="210"
              r="6"
              fill={sceneIndex >= 1 ? '#ef4444' : '#334155'}
              stroke="#fff"
              strokeWidth="1.5"
            />
            <circle
              cx="455"
              cy="210"
              r="6"
              fill={sceneIndex >= 2 ? '#d4af37' : '#334155'}
              stroke="#fff"
              strokeWidth="1.5"
            />

            <text
              x="280"
              y="206"
              textAnchor="middle"
              className="fill-white font-mono text-[11px] font-bold pointer-events-none"
            >
              START
            </text>
            <text
              x="280"
              y="222"
              textAnchor="middle"
              className="fill-red-300 font-mono text-[11px] font-bold pointer-events-none"
            >
              {yen(getPlan('start').priceMonthly)}
            </text>

            <text
              x="280"
              y="108"
              textAnchor="middle"
              className="fill-slate-200 font-mono text-[10px] font-bold pointer-events-none"
            >
              BUSINESS • {yen(getPlan('business').priceMonthly)}
            </text>

            <text
              x="280"
              y="52"
              textAnchor="middle"
              className="fill-amber-300 font-mono text-[10px] font-bold pointer-events-none"
            >
              ENTERPRISE • {yen(getPlan('enterprise').priceMonthly)}
            </text>
          </svg>

          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>赤い糸 • Fio Vermelho atravessa os 3 anéis</span>
            <span>Clique nos anéis para expandir</span>
          </div>
        </div>

        {/* Right 6 Cols: The 3 Progressive Rings Cards */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-3.5">
          {EXPANSION_RINGS.map((tier) => {
            const isActive = sceneIndex === tier.idx;
            const isUnlocked = tier.idx <= sceneIndex;
            return (
              <div
                key={tier.name}
                onClick={() => setSceneIndex(tier.idx)}
                className={`p-4 md:p-5 rounded-2xl border transition-all duration-500 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-red-950/60 via-slate-900/95 to-slate-900/95 border-red-500 shadow-[0_0_25px_rgba(220,38,38,0.25)]'
                    : isUnlocked
                    ? 'bg-slate-900/80 border-red-500/30'
                    : 'bg-slate-950/65 border-white/10 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isActive ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-300'
                      }`}
                    >
                      {tier.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-red-400">
                          {tier.ringLabel}
                        </span>
                        <span className="text-[10px] font-serif text-slate-400">• {tier.jp}</span>
                      </div>
                      <h3 className="text-lg md:text-xl font-black text-white">{tier.name}</h3>
                      <p className="text-xs md:text-sm text-amber-300 font-medium">{tier.tagline}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-2xl md:text-3xl font-black font-mono text-white">
                        {tier.price}
                      </span>
                      <span className="text-[10px] font-mono text-amber-300">税抜</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">/ usuário/mês</span>
                  </div>
                </div>

                {isActive && (
                  <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 animate-fadeIn">
                    {tier.scopeItems.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-1.5 text-xs text-slate-200 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <p className="text-[10px] font-mono text-slate-500 leading-snug">
            Preços sugeridos (税抜). {PRICING.expansionJourney.disclaimer}
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-mono text-slate-400">
              Evolução ativa: <strong className="text-white">{activeRing.name}</strong> ({activeRing.tagline})
            </span>
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
export default MarketSection;
