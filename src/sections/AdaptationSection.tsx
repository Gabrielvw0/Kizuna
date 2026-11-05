import React, { useState } from 'react';
import { Languages, CalendarDays, GitPullRequest, ShieldCheck } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { PRICING, getPlan, yen } from '../data/pricing';
import { Kicker, DisplayTitle, Accent, Classification, LegibilityVeil } from '../components/strategic/Editorial';
import { SceneStage } from '../components/strategic/SceneStage';

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
      tag: <Classification kind="proposta" />
    },
    {
      icon: CalendarDays,
      title: 'Datas, moeda e imposto',
      why: `Era Reiwa, ano/mês/dia e preço com e sem o imposto de consumo (${TAX_PCT}%).`,
      jp: `令和8年10月27日 ・ 小計 ${yenJp(NET)}（税抜）＋ 消費税${TAX_PCT}% ${yenJp(TAX)} ＝ ${yenJp(NET + TAX)}（税込）`,
      pt: `27/10/2026 (Reiwa 8) • ${yen(NET)} sem imposto + ${TAX_PCT}% (${yen(TAX)}) = ${yen(NET + TAX)} com imposto`,
      tag: <Classification kind="proposta" />
    }
  ],
  [
    {
      icon: GitPullRequest,
      title: 'Nemawashi, Ringi e Hanko',
      why: 'Alinhamento prévio e aprovação formal com carimbo, em ordem hierárquica.',
      jp: '根回し完了（3名合意）→ 稟議申請 → 部長承認【印】',
      pt: 'Alinhamento prévio (3 gestores) → pedido formal (Ringi) → aprovação do gerente com carimbo',
      tag: <Classification kind="proposta">Proposta • fluxo Ringi no Business</Classification>
    },
    {
      icon: ShieldCheck,
      title: 'Conformidade legal',
      why: 'APPI e Lei de Livros Eletrônicos como requisitos; certificações são outra camada.',
      jp: '個人情報保護法（APPI）・電子帳簿保存法への対応方針',
      pt: 'Diretriz de atendimento à APPI e à Lei de Livros Eletrônicos — a validar com assessoria jurídica; sem certificação obtida.',
      tag: <Classification kind="hipotese">Requisito a validar</Classification>
    }
  ]
];

/**
 * Faixa de um pilar: à esquerda o argumento; à direita o próprio texto em japonês,
 * como aparece no Kizuna, é o protagonista. "Ver tradução" troca pelo português.
 */
const PillarBand: React.FC<{ p: Pillar; index: number }> = ({ p, index }) => {
  const [showPt, setShowPt] = useState(false);
  const Icon = p.icon;
  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] gap-3 md:gap-10 short:gap-2 py-5 short:py-2.5 border-t border-washi/10">
      <div>
        <div className="flex items-center gap-3">
          <span className="font-display text-lg text-beni-soft tabular-nums">{String(index).padStart(2, '0')}</span>
          <Icon className="w-4 h-4 text-washi-dim" aria-hidden />
        </div>
        <h2 className="mt-1 font-display font-semibold text-xl md:text-2xl short:text-xl text-washi leading-tight">{p.title}</h2>
        <p className="mt-1.5 short:mt-0.5 text-sm md:text-base short:text-xs short:lg:text-sm text-washi-muted leading-snug">{p.why}</p>
        <div className="mt-2 short:mt-1">{p.tag}</div>
      </div>

      <div className="md:border-l md:border-washi/15 md:pl-8 flex flex-col justify-center">
        <div className="text-[11px] md:text-xs uppercase tracking-[0.2em] text-washi-dim">
          {showPt ? 'Tradução' : 'Como aparece no Kizuna (japonês)'}
        </div>
        <div
          key={showPt ? 'pt' : 'jp'}
          lang={showPt ? 'pt-BR' : 'ja'}
          className={`mt-2 text-washi leading-snug animate-fadeIn ${
            showPt ? 'text-base md:text-lg short:text-base' : 'font-display text-xl md:text-2xl lg:text-[1.75rem] short:text-base short:lg:text-xl'
          }`}
        >
          {showPt ? p.pt : p.jp}
        </div>
        <button
          onClick={() => setShowPt((v) => !v)}
          aria-pressed={showPt}
          className="mt-3 short:mt-1.5 self-start flex items-center gap-1.5 text-xs text-washi-muted hover:text-washi border-b border-washi/25 hover:border-washi/60 pb-0.5"
        >
          <Languages className="w-3.5 h-3.5" aria-hidden />
          {showPt ? 'Ver em japonês' : 'Ver tradução'}
        </button>
      </div>
    </div>
  );
};

/** Pilar recolhido: continua visível (número, nome e classificação) e abre a cena dele ao clicar. */
const PillarRow: React.FC<{ p: Pillar; index: number; onOpen: () => void }> = ({ p, index, onOpen }) => {
  const Icon = p.icon;
  return (
    <button
      onClick={onOpen}
      className="w-full flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 short:py-1 border-t border-washi/10 text-left hover:bg-washi/[0.03]"
    >
      <span className="font-display text-base text-washi-dim tabular-nums">{String(index).padStart(2, '0')}</span>
      <Icon className="w-4 h-4 text-washi-dim" aria-hidden />
      <span className="font-display text-base md:text-lg text-washi-muted">{p.title}</span>
      <span className="ml-auto opacity-70">{p.tag}</span>
    </button>
  );
};

/**
 * Tela 06 • Adaptação ao Japão (R2) — os quatro pilares sempre visíveis.
 * Cena 1 abre os pilares de comunicação (idioma e formatos);
 * cena 2 abre os de decisão e conformidade (preparam a tela 07).
 */
export const AdaptationSection: React.FC = () => {
  const { sceneIndex, setSceneIndex } = usePresentation();
  const scene = Math.min(1, Math.max(0, sceneIndex));

  return (
    <div className="relative w-full h-full select-none">
      <LegibilityVeil side="left" />
      <div className="relative h-full max-w-6xl mx-auto px-6 md:px-14 py-4 short:py-1 flex flex-col justify-center gap-4 md:gap-6 short:gap-1.5 overflow-y-auto">
        <div>
          <Kicker code="06" label="R2 • Adaptação do produto" jp="和" />
          <DisplayTitle className="mt-4 short:mt-1 short:!text-[1.8rem] short:lg:!text-[2.15rem]">
            Não basta traduzir. <Accent>É preciso respeitar o contexto.</Accent>
          </DisplayTitle>
        </div>
        {/* troca de cena: a dimensão anterior sai e a nova entra (SceneStage), sem remontar a tela */}
        <SceneStage index={scene} className="border-b border-washi/10">
          {GROUPS.map((group, g) =>
            group.map((p, i) =>
              g === scene ? (
                <div key={p.title}>
                  <PillarBand p={p} index={g * 2 + i + 1} />
                </div>
              ) : (
                <PillarRow key={p.title} p={p} index={g * 2 + i + 1} onOpen={() => setSceneIndex(g)} />
              )
            )
          )}
        </SceneStage>
      </div>
    </div>
  );
};
export default AdaptationSection;
