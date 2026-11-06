import React, { useState } from 'react';
import { usePresentation } from '../core/PresentationContext';
import { getPlan, yen } from '../data/pricing';
import { Kicker, DisplayTitle, Accent, Classification } from '../components/strategic/Editorial';
import { SceneStage } from '../components/strategic/SceneStage';

/*
 * Tela 10 • Posicionamento competitivo — comparação editorial em três blocos (Etapa 8).
 * Substitui o mapa 2×2: a banca lê grupos e proposta diretamente, sem decifrar eixos.
 * Tudo aqui é proposta estratégica do grupo, não pesquisa de mercado: as leituras dos concorrentes
 * são hipóteses de posicionamento (os textos vêm da versão anterior da tela, sem novas afirmações).
 */

type Company = { id: string; name: string; jp: string; scope: string; cultural: string; note: string };
type Group = { id: string; code: string; label: string; summary: string; companies: Company[] };

const GROUPS: Group[] = [
  {
    id: 'corp',
    code: '01',
    label: 'Sistemas corporativos',
    summary: 'Sistemas empresariais de escopo amplo.',
    companies: [
      {
        id: 'sap_oracle',
        name: 'SAP / Oracle',
        jp: '海外メガERP',
        scope: 'Amplo e complexo',
        cultural: 'Genérica / global',
        note: 'implantação longa e custosa para PMEs.'
      },
      {
        id: 'obic_bugyo',
        name: 'OBIC / 奉行',
        jp: '国内従来型ERP',
        scope: 'Fechado / tradicional',
        cultural: 'Nativa',
        note: 'forte aderência local, menor abertura a integrações modernas.'
      }
    ]
  },
  {
    id: 'spec',
    code: '02',
    label: 'Ferramentas especializadas',
    summary: 'Ferramentas direcionadas a necessidades e processos específicos.',
    companies: [
      {
        id: 'freee_mf',
        name: 'freee / Money Forward',
        jp: 'クラウド会計・労務',
        scope: 'Foco fiscal e contábil',
        cultural: 'Média-alta',
        note: 'foco em contabilidade e RH; cobertura de projetos a conferir.'
      },
      {
        id: 'notion_asana',
        name: 'Notion / Asana',
        jp: '海外生産性ツール',
        scope: 'Produtividade de equipe',
        cultural: 'Baixa',
        note: 'suporte a Ringi/Hanko e regras locais a conferir.'
      }
    ]
  }
];

const KIZUNA = {
  name: 'KIZUNA 絆',
  jp: 'グローバル技術 × 日本適応',
  summary: 'Proposta de entrada modular no mercado japonês, começando pela gestão de equipes e atividades, com expansão conforme o plano contratado.',
  scope: 'Modular: equipe → empresa',
  cultural: 'Alta (Keigo, Ringi, APPI como requisitos)',
  note: `entrada simples (${yen(getPlan('start').priceMonthly)}, preço sugerido) com engenharia global e adaptação local desde o início.`,
  points: [
    'Entrada modular',
    'Gestão de equipes como produto inicial',
    'Adaptação ao contexto japonês como requisito estratégico',
    'Expansão progressiva para módulos e funcionalidades mais abrangentes'
  ]
};

const SYNTHESIS = [
  { criterion: 'Entrada no mercado', value: 'Modular' },
  { criterion: 'Escopo inicial', value: 'Gestão de equipes' },
  { criterion: 'Adaptação local', value: 'Requisito estratégico' },
  { criterion: 'Expansão', value: 'Progressiva' }
];

const T = {
  label: 'text-[clamp(0.64rem,0.56rem+0.2vw,0.84rem)] uppercase tracking-[0.2em] text-washi-dim',
  seal: '!text-[clamp(0.6rem,0.5rem+0.22vw,0.8rem)] !px-[0.6em] !py-[0.25em]'
};

const companyById = (id: string) => GROUPS.flatMap((g) => g.companies.map((c) => ({ c, g }))).find((x) => x.c.id === id);

/** Bloco de um grupo concorrente: o grupo e cada empresa são selecionáveis. */
const GroupBlock: React.FC<{ group: Group; selected: string; dim: boolean; onSelect: (id: string) => void }> = ({ group, selected, dim, onSelect }) => {
  const groupSel = selected === group.id;
  return (
    <article
      className={`min-w-0 h-full flex flex-col border bg-sumi-800/70 transition-[opacity,border-color] duration-500 motion-reduce:transition-none ${
        groupSel ? 'border-washi/40' : 'border-washi/10'
      } ${dim ? 'opacity-50 hover:opacity-80' : 'opacity-100'}`}
    >
      <button
        onClick={() => onSelect(group.id)}
        aria-pressed={groupSel}
        className="text-left px-[clamp(0.8rem,1.6vw,1.75rem)] pt-[clamp(0.7rem,2.2vh,1.6rem)] pb-[clamp(0.5rem,1.6vh,1.1rem)] focus:outline-none group"
      >
        <div className="flex items-baseline gap-[0.6em]">
          <span className="font-display text-[clamp(1.1rem,0.8rem+0.8vw,1.8rem)] text-beni-soft tabular-nums leading-none">{group.code}</span>
          <span className={`${T.label} !text-washi-muted group-hover:!text-washi`}>{group.label}</span>
        </div>
        <p className={`mt-[0.5em] text-[clamp(0.82rem,0.66rem+0.45vw,1.2rem)] leading-snug text-washi-muted ${dim ? '[@media(max-height:700px)]:hidden' : ''}`}>{group.summary}</p>
        <span className={`mt-[0.6em] inline-block ${T.label} !text-[clamp(0.58rem,0.5rem+0.18vw,0.76rem)] [@media(max-height:700px)]:hidden`}>Hipótese de posicionamento</span>
      </button>
      <ul className="mt-auto border-t border-washi/10">
        {group.companies.map((c) => {
          const sel = selected === c.id;
          return (
            <li key={c.id} className="border-b border-washi/10 last:border-b-0">
              <button
                onClick={() => onSelect(c.id)}
                aria-pressed={sel}
                className={`relative w-full text-left px-[clamp(0.8rem,1.6vw,1.75rem)] py-[clamp(0.45rem,1.5vh,1rem)] transition-colors duration-300 focus:outline-none ${
                  sel ? 'bg-washi/[0.06]' : 'hover:bg-washi/[0.03]'
                }`}
              >
                {sel && <span aria-hidden className="absolute left-0 top-0 bottom-0 w-[3px] bg-beni" />}
                <span className={`block text-[clamp(0.9rem,0.72rem+0.5vw,1.35rem)] font-semibold leading-tight ${sel ? 'text-washi' : 'text-washi/90'}`}>{c.name}</span>
                <span className="block text-[clamp(0.66rem,0.58rem+0.22vw,0.88rem)] text-washi-dim">{c.jp}</span>
                {/* leitura do grupo (hipótese): some em telas baixas, onde o painel de contexto a mostra */}
                <span className={`mt-[0.5em] grid grid-cols-2 gap-x-3 [@media(max-height:860px)]:hidden ${dim ? 'hidden' : ''}`}>
                  <span className="min-w-0">
                    <span className={`block ${T.label} !tracking-[0.14em]`}>Escopo</span>
                    <span className="block text-[clamp(0.74rem,0.62rem+0.32vw,1.02rem)] text-washi-muted leading-snug">{c.scope}</span>
                  </span>
                  <span className="min-w-0">
                    <span className={`block ${T.label} !tracking-[0.14em]`}>Adaptação local</span>
                    <span className="block text-[clamp(0.74rem,0.62rem+0.32vw,1.02rem)] text-washi-muted leading-snug">{c.cultural}</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
};

/** Bloco protagonista: a proposta do Kizuna. */
const KizunaBlock: React.FC<{ selected: boolean; focus: boolean; onSelect: () => void }> = ({ selected, focus, onSelect }) => (
  <button
    onClick={onSelect}
    aria-pressed={selected}
    className={`relative min-w-0 h-full text-left flex flex-col border-2 bg-beni/[0.13] px-[clamp(0.9rem,2vw,2.25rem)] py-[clamp(0.7rem,2.2vh,1.75rem)] transition-[border-color,background-color] duration-500 motion-reduce:transition-none focus:outline-none ${
      focus ? 'border-beni bg-beni/[0.18]' : selected ? 'border-beni/80' : 'border-beni/50 hover:border-beni/80'
    }`}
  >
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <div className="flex items-baseline gap-[0.6em]">
        <span className="font-display text-[clamp(1.1rem,0.8rem+0.8vw,1.8rem)] text-beni-soft tabular-nums leading-none">03</span>
        <span className={`${T.label} !text-washi`}>Kizuna</span>
      </div>
      <Classification kind="proposta" className={T.seal} />
    </div>
    <div className="mt-[clamp(0.3rem,1vh,0.75rem)] font-display text-[clamp(1.5rem,min(0.9rem+1.8vw,0.5rem+4.2vh),3.2rem)] leading-none text-washi">{KIZUNA.name}</div>
    <p className={`mt-[clamp(0.35rem,1.2vh,0.9rem)] ${focus ? '[@media(max-height:700px)]:hidden' : ''} max-w-[52ch] text-[clamp(0.82rem,0.66rem+0.45vw,1.2rem)] leading-snug text-washi/85`}>{KIZUNA.summary}</p>
    <ol className={`mt-auto pt-[clamp(0.4rem,1.6vh,1.2rem)] ${focus ? '' : '[@media(max-height:860px)]:hidden'} grid grid-cols-2 gap-x-[clamp(0.8rem,2vw,2rem)] gap-y-[clamp(0.3rem,1.2vh,0.9rem)]`}>
      {KIZUNA.points.map((p, i) => (
        <li key={p} className="flex gap-[0.6em] border-t border-beni/40 pt-[0.45em] text-[clamp(0.8rem,0.64rem+0.45vw,1.2rem)] leading-snug text-washi">
          <span className="font-display text-beni-soft tabular-nums">{String(i + 1).padStart(2, '0')}</span>
          <span>{p}</span>
        </li>
      ))}
    </ol>
  </button>
);

/** Painel de contexto (10.1): mostra o grupo ou a empresa selecionada. */
const ContextPanel: React.FC<{ selected: string }> = ({ selected }) => {
  const group = GROUPS.find((g) => g.id === selected);
  const company = companyById(selected);
  const isKizuna = selected === 'kizuna';

  let title: string;
  let jp = '';
  let rows: { k: string; v: string }[] = [];
  let note: string;
  let kind: 'hipotese' | 'proposta';
  if (isKizuna) {
    title = KIZUNA.name;
    jp = KIZUNA.jp;
    rows = [
      { k: 'Escopo', v: KIZUNA.scope },
      { k: 'Adaptação local', v: KIZUNA.cultural }
    ];
    note = `Proposta: ${KIZUNA.note}`;
    kind = 'proposta';
  } else if (company) {
    title = company.c.name;
    jp = company.c.jp;
    rows = [
      { k: 'Escopo', v: company.c.scope },
      { k: 'Adaptação local', v: company.c.cultural }
    ];
    note = `Hipótese do grupo: ${company.c.note}`;
    kind = 'hipotese';
  } else {
    const g = group ?? GROUPS[0];
    title = g.label;
    rows = g.companies.map((c) => ({ k: c.name, v: c.scope }));
    note = g.summary;
    kind = 'hipotese';
  }

  return (
    <div key={selected} className="step-in grid grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)] gap-[clamp(1rem,3vw,3.5rem)] items-start border-t border-washi/15 pt-[clamp(0.5rem,1.8vh,1.25rem)]">
      <div className="min-w-0">
        <div className={T.label}>Selecionado</div>
        <div className="mt-[0.3em] text-[clamp(1.05rem,0.8rem+0.8vw,1.8rem)] font-semibold leading-tight text-washi">{title}</div>
        {jp && <div className="text-[clamp(0.68rem,0.58rem+0.25vw,0.9rem)] text-washi-dim">{jp}</div>}
        <div className="mt-[0.6em]">
          <Classification kind={kind} className={T.seal}>
            {kind === 'hipotese' ? 'Hipótese de posicionamento' : undefined}
          </Classification>
        </div>
      </div>
      <div className="min-w-0">
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-x-[clamp(0.8rem,2vw,2.5rem)] gap-y-2">
          {rows.map((r) => (
            <div key={r.k}>
              <dt className={T.label}>{r.k}</dt>
              <dd className="mt-[0.2em] text-[clamp(0.84rem,0.68rem+0.45vw,1.25rem)] text-washi">{r.v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-[clamp(0.4rem,1.4vh,1rem)] max-w-[70ch] text-[clamp(0.84rem,0.68rem+0.45vw,1.25rem)] leading-snug text-washi-muted">{note}</p>
      </div>
    </div>
  );
};

/** Faixa de síntese: compacta na 10.1, protagonista na 10.2. */
const Synthesis: React.FC<{ big: boolean }> = ({ big }) => (
  <div className={`border-t-2 border-beni ${big ? 'pt-[clamp(0.5rem,2.4vh,1.75rem)]' : 'pt-[clamp(0.4rem,1.2vh,0.8rem)]'}`}>
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <span className={`${T.label} ${big ? '!text-washi-muted' : ''}`}>Síntese • critério → proposta Kizuna</span>
    </div>
    <dl className={`mt-[clamp(0.4rem,1.4vh,1rem)] grid grid-cols-4 ${big ? 'gap-[clamp(0.8rem,2.4vw,3rem)]' : 'gap-[clamp(0.6rem,1.6vw,2rem)]'}`}>
      {SYNTHESIS.map((s, i) => (
        <div key={s.criterion} className={`min-w-0 ${big ? 'step-in' : ''}`} style={big ? { animationDelay: `${120 + i * 90}ms` } : undefined}>
          <dt className={`${T.label}`}>{s.criterion}</dt>
          <dd
            className={`mt-[0.25em] leading-tight ${
              big ? 'font-display text-[clamp(1.2rem,min(0.7rem+1.6vw,0.4rem+3.6vh),2.8rem)] [@media(max-height:700px)]:!text-[1.2rem] text-washi' : 'text-[clamp(0.84rem,0.68rem+0.45vw,1.2rem)] font-semibold text-washi/90'
            }`}
          >
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  </div>
);

/**
 * Tela 10 • Posicionamento.
 * 10.1 O cenário competitivo: três blocos (o Kizuna visível desde o início), seleção livre e painel de contexto.
 * 10.2 A proposta de posicionamento: o Kizuna assume o protagonismo, os grupos ficam secundários
 * (ainda selecionáveis) e a síntese ganha a faixa inferior.
 * A troca de cena usa o mecanismo central (setSceneIndex + SceneStage); a seleção nunca muda a cena sozinha,
 * exceto ao escolher um concorrente na 10.2, que volta à 10.1 para mostrar o contexto dele.
 */
export const PositioningSection: React.FC = () => {
  const { sceneIndex, setSceneIndex } = usePresentation();
  const scene = Math.min(1, Math.max(0, sceneIndex));
  const focus = scene === 1;
  const [selected, setSelected] = useState<string>('corp');

  const select = (id: string) => {
    setSelected(id);
    if (focus && id !== 'kizuna') setSceneIndex(0);
  };

  return (
    <div className="relative w-full h-full select-none">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-sumi/70" />
      <div className="relative h-full mx-auto w-[min(88%,1640px)] flex flex-col pt-[clamp(0.6rem,3.6vh,2.75rem)] pb-[clamp(0.5rem,3vh,2.25rem)]">
        <header className="shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
            <Kicker code="10" label="Posicionamento competitivo" jp="位" className="!text-[clamp(0.68rem,0.6rem+0.22vw,0.9rem)]" />
            <Classification kind="proposta" className={T.seal}>
              Proposta estratégica • Não é pesquisa de mercado
            </Classification>
          </div>
          <DisplayTitle className="mt-[clamp(0.4rem,1.4vh,1.1rem)] !text-[clamp(1.6rem,min(3.1vw,5.8vh),3.9rem)]">
            Se o Japão já tem sistemas, <Accent>por que o Kizuna?</Accent>
          </DisplayTitle>
        </header>

        {/* três blocos: na 10.2 o Kizuna cresce e os grupos recuam (mesma grade, sem remontar) */}
        <div
          className="mt-[clamp(0.75rem,3.4vh,2.5rem)] flex-1 min-h-0 grid gap-[clamp(0.6rem,1.4vw,1.5rem)] transition-[grid-template-columns] duration-700 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none"
          style={{ gridTemplateColumns: focus ? 'minmax(0,0.78fr) minmax(0,0.78fr) minmax(0,1.9fr)' : 'minmax(0,1fr) minmax(0,1fr) minmax(0,1.35fr)' }}
        >
          {GROUPS.map((g) => (
            <GroupBlock key={g.id} group={g} selected={selected} dim={focus} onSelect={select} />
          ))}
          <KizunaBlock selected={selected === 'kizuna'} focus={focus} onSelect={() => select('kizuna')} />
        </div>

        {/* faixa inferior: contexto + síntese compacta (10.1) → síntese em destaque (10.2) */}
        <SceneStage index={scene} className="shrink-0 mt-[clamp(0.6rem,2.6vh,2rem)]">
          {focus ? (
            <Synthesis big />
          ) : (
            <div className="flex flex-col gap-[clamp(0.5rem,2vh,1.5rem)]">
              <ContextPanel selected={selected} />
              {/* telas baixas: a síntese aparece só na 10.2, onde é o destaque */}
              <div className="[@media(max-height:700px)]:hidden">
                <Synthesis big={false} />
              </div>
            </div>
          )}
        </SceneStage>
      </div>
    </div>
  );
};
export default PositioningSection;
