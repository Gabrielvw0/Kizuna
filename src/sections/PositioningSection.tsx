import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { getPlan, yen } from '../data/pricing';
import { ScreenTitle, InfoTag } from '../components/strategic/ScreenTitle';

interface Alternative {
  id: string;
  name: string;
  jp: string;
  scope: string;
  cultural: string;
  note: string;
  x: number;
  y: number;
  isKizuna?: boolean;
}

// Posições e leituras são avaliação qualitativa do grupo (proposta estratégica), sem pesquisa de mercado.
const ALTERNATIVES: Alternative[] = [
  {
    id: 'sap_oracle',
    name: 'SAP / Oracle',
    jp: '海外メガERP',
    scope: 'Amplo e complexo',
    cultural: 'Genérica / global',
    note: 'Hipótese do grupo: implantação longa e custosa para PMEs.',
    x: 78,
    y: 75
  },
  {
    id: 'obic_bugyo',
    name: 'OBIC / 奉行',
    jp: '国内従来型ERP',
    scope: 'Fechado / tradicional',
    cultural: 'Nativa',
    note: 'Hipótese do grupo: forte aderência local, menor abertura a integrações modernas.',
    x: 24,
    y: 28
  },
  {
    id: 'freee_mf',
    name: 'freee / Money Forward',
    jp: 'クラウド会計・労務',
    scope: 'Foco fiscal e contábil',
    cultural: 'Média-alta',
    note: 'Hipótese do grupo: foco em contabilidade e RH; cobertura de projetos a conferir.',
    x: 32,
    y: 55
  },
  {
    id: 'notion_asana',
    name: 'Notion / Asana',
    jp: '海外生産性ツール',
    scope: 'Produtividade de equipe',
    cultural: 'Baixa',
    note: 'Hipótese do grupo: suporte a Ringi/Hanko e regras locais a conferir.',
    x: 20,
    y: 82
  },
  {
    id: 'kizuna',
    name: 'KIZUNA 絆',
    jp: 'グローバル技術 × 日本適応',
    scope: 'Modular: equipe → empresa',
    cultural: 'Alta (Keigo, Ringi, APPI como requisitos)',
    note: `Proposta: entrada simples (${yen(getPlan('start').priceMonthly)}, preço sugerido) com engenharia global e adaptação local desde o início.`,
    x: 80,
    y: 22,
    isKizuna: true
  }
];

/** Tela 10 • Posicionamento — proposta estratégica. Cena 1: alternativas. Cena 2: posição-alvo. */
export const PositioningSection: React.FC = () => {
  const { sceneIndex, setSceneIndex } = usePresentation();
  const scene = Math.min(1, Math.max(0, sceneIndex));
  const [selectedId, setSelectedId] = useState<string>(ALTERNATIVES[0].id);

  // A cena define o foco: cena 2 sempre mostra o Kizuna; cena 1 nunca.
  useEffect(() => {
    if (scene === 1 && selectedId !== 'kizuna') setSelectedId('kizuna');
    if (scene === 0 && selectedId === 'kizuna') setSelectedId(ALTERNATIVES[0].id);
  }, [scene, selectedId]);

  const active = ALTERNATIVES.find((a) => a.id === selectedId) || ALTERNATIVES[0];

  return (
    <div className="relative w-full h-full flex flex-col justify-center gap-5 px-6 md:px-14 py-6 max-w-6xl mx-auto overflow-y-auto select-none">
      <ScreenTitle
        kicker="10 • Posicionamento • 位"
        title={
          <>
            Se o Japão já tem sistemas, <span className="text-rose-500">por que o Kizuna?</span>
          </>
        }
        aside={<InfoTag kind="proposta">PROPOSTA ESTRATÉGICA • NÃO É PESQUISA DE MERCADO</InfoTag>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 relative rounded-3xl bg-slate-950/90 border border-white/15 min-h-[320px] overflow-hidden">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/15" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/15" />
          <div
            className={`absolute right-0 top-0 w-1/2 h-1/2 bg-gradient-to-bl from-rose-600/25 to-transparent transition-opacity duration-500 ${
              scene === 1 ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <span className="absolute top-2 left-3 text-[9px] font-mono text-slate-400">▲ ADAPTAÇÃO LOCAL</span>
          <span className="absolute bottom-2 right-3 text-[9px] font-mono text-slate-400">ESCOPO AMPLO ▶</span>

          {ALTERNATIVES.map((a) => {
            const isSel = selectedId === a.id;
            const hidden = a.isKizuna && scene === 0;
            return (
              <button
                key={a.id}
                onClick={() => {
                  setSelectedId(a.id);
                  setSceneIndex(a.isKizuna ? 1 : 0);
                }}
                style={{ left: `${a.x}%`, top: `${a.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl border text-left transition-all duration-500 ${
                  hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
                } ${
                  a.isKizuna
                    ? 'bg-gradient-to-br from-rose-600 to-slate-950 border-2 border-amber-300 shadow-[0_0_30px_rgba(225,29,72,0.6)] z-20'
                    : isSel
                    ? 'bg-slate-800 border-white/60 z-10'
                    : 'bg-slate-950/90 border-white/20 hover:border-white/50'
                }`}
              >
                <span className="flex items-center gap-1 text-xs font-black text-white">
                  {a.name}
                  {a.isKizuna && <Sparkles className="w-3 h-3 text-amber-300" />}
                </span>
                <span className="block text-[9px] font-serif text-slate-400">{a.jp}</span>
              </button>
            );
          })}
        </div>

        <div key={active.id} className="lg:col-span-5 p-6 rounded-3xl bg-slate-950/90 border border-rose-500/30 flex flex-col gap-3 animate-fadeIn">
          <h2 className="text-2xl font-black text-white">{active.name}</h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10">
              <div className="text-[10px] font-mono text-slate-400">Escopo</div>
              <div className="font-bold text-white mt-0.5">{active.scope}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10">
              <div className="text-[10px] font-mono text-slate-400">Adaptação local</div>
              <div className="font-bold text-amber-300 mt-0.5">{active.cultural}</div>
            </div>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">{active.note}</p>
          <p className="text-[11px] text-slate-500 mt-auto">
            {scene === 0 ? 'Toque em uma alternativa para comparar.' : 'Posição-alvo: alta adaptação local com escopo que cresce por módulos.'}
          </p>
        </div>
      </div>
    </div>
  );
};
export default PositioningSection;
