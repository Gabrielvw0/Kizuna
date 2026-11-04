import React, { useState } from 'react';
import { Languages, CalendarDays, GitPullRequest, ShieldCheck } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { PRICING, getPlan, yen } from '../data/pricing';
import { ScreenTitle, InfoTag } from '../components/strategic/ScreenTitle';

// Exemplo de 税抜/税込 calculado a partir do preço sugerido do Start e da alíquota em pricing.json
const NET = getPlan('start').priceMonthly;
const TAX = Math.floor(NET * PRICING.taxRate);
const TAX_PCT = Math.round(PRICING.taxRate * 100);
const yenJp = (n: number) => `¥${n.toLocaleString('ja-JP')}`;

interface Pillar {
  icon: React.FC<{ className?: string }>;
  title: string;
  why: string;
  jp: string;
  pt: string;
  tag: React.ReactNode;
}

const GROUPS: Pillar[][] = [
  [
    {
      icon: Languages,
      title: 'Idioma e Keigo',
      why: 'Mensagens formais, adequadas à hierarquia — não tradução literal.',
      jp: '承認申請を提出いたしました。ご確認のほどよろしくお願い申し上げます。',
      pt: 'Enviei o pedido de aprovação. Peço, respeitosamente, que o verifique.',
      tag: <InfoTag kind="proposta" />
    },
    {
      icon: CalendarDays,
      title: 'Datas, moeda e imposto',
      why: `Era Reiwa, ano/mês/dia e preço com e sem o imposto de consumo (${TAX_PCT}%).`,
      jp: `令和8年10月27日 ・ 小計 ${yenJp(NET)}（税抜）＋ 消費税${TAX_PCT}% ${yenJp(TAX)} ＝ ${yenJp(NET + TAX)}（税込）`,
      pt: `27/10/2026 (Reiwa 8) • ${yen(NET)} sem imposto + ${TAX_PCT}% (${yen(TAX)}) = ${yen(NET + TAX)} com imposto`,
      tag: <InfoTag kind="proposta" />
    }
  ],
  [
    {
      icon: GitPullRequest,
      title: 'Nemawashi, Ringi e Hanko',
      why: 'Alinhamento prévio e aprovação formal com carimbo, em ordem hierárquica.',
      jp: '根回し完了（3名合意）→ 稟議申請 → 部長承認【印】',
      pt: 'Alinhamento prévio (3 gestores) → pedido formal (Ringi) → aprovação do gerente com carimbo',
      tag: <InfoTag kind="proposta">PROPOSTA • FLUXO RINGI NO BUSINESS</InfoTag>
    },
    {
      icon: ShieldCheck,
      title: 'Conformidade legal',
      why: 'APPI e Lei de Livros Eletrônicos como requisitos; certificações são outra camada.',
      jp: '個人情報保護法（APPI）・電子帳簿保存法への対応方針',
      pt: 'Diretriz de atendimento à APPI e à Lei de Livros Eletrônicos — a validar com assessoria jurídica; sem certificação obtida.',
      tag: <InfoTag kind="hipotese">REQUISITO A VALIDAR</InfoTag>
    }
  ]
];

const PillarCard: React.FC<{ p: Pillar }> = ({ p }) => {
  const [showPt, setShowPt] = useState(false);
  const Icon = p.icon;
  return (
    <div className="p-5 rounded-3xl bg-slate-950/85 border border-white/15 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Icon className="w-5 h-5 text-amber-300" />
          <span className="text-lg font-black text-white">{p.title}</span>
        </div>
        {p.tag}
      </div>
      <p className="text-sm text-slate-300">{p.why}</p>
      <div className="p-4 rounded-2xl bg-black/60 border border-amber-400/30 min-h-[84px]">
        <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">
          {showPt ? 'Tradução' : 'Como aparece no Kizuna (japonês)'}
        </div>
        <div className={`text-white ${showPt ? 'text-sm' : 'text-base font-medium'}`}>{showPt ? p.pt : p.jp}</div>
      </div>
      <button
        onClick={() => setShowPt((v) => !v)}
        aria-pressed={showPt}
        className="self-start px-3 py-1.5 rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] text-xs font-mono text-slate-200"
      >
        {showPt ? 'Ver em japonês' : 'Ver tradução'}
      </button>
    </div>
  );
};

/** Tela 06 • Adaptação ao Japão (R2) — 4 pilares, cada um com o exemplo em japonês. */
export const AdaptationSection: React.FC = () => {
  const { sceneIndex } = usePresentation();
  const scene = Math.min(1, Math.max(0, sceneIndex));

  return (
    <div className="relative w-full h-full flex flex-col justify-center gap-6 px-6 md:px-14 py-6 max-w-6xl mx-auto overflow-y-auto select-none">
      <ScreenTitle
        kicker="06 • R2 • Adaptação do produto • 和"
        title={
          <>
            Não basta traduzir. <span className="text-rose-500">É preciso respeitar o contexto.</span>
          </>
        }
      />
      <div key={scene} className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
        {GROUPS[scene].map((p) => (
          <PillarCard key={p.title} p={p} />
        ))}
      </div>
    </div>
  );
};
export default AdaptationSection;
