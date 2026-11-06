import React, { useState } from 'react';
import { getPlan, yen } from '../data/pricing';
import { Kicker, DisplayTitle, Accent, Classification } from '../components/strategic/Editorial';

/*
 * Tela 10 • Posicionamento competitivo — comparação editorial em três blocos, em UMA cena (Etapa 8).
 * Substitui o mapa 2×2: a banca lê grupos e proposta diretamente, sem decifrar eixos.
 * A antiga 10.2 repetia o conteúdo da 10.1 com pequenas diferenças visuais e foi removida
 * (roteiro, mapa técnico, câmera, roteiro da banca e validação atualizados juntos).
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
    'Expansão progressiva conforme o plano contratado'
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

/** Bloco de um grupo concorrente: o grupo e cada empresa são selecionáveis (atualiza o painel, nunca a cena). */
const GroupBlock: React.FC<{ group: Group; selected: string | null; onSelect: (id: string) => void }> = ({ group, selected, onSelect }) => {
  const groupSel = selected === group.id;
  return (
    <article className={`min-w-0 h-full flex flex-col border bg-sumi-800/[0.88] transition-colors duration-300 ${groupSel ? 'border-washi/40' : 'border-washi/10'}`}>
      <button
        onClick={() => onSelect(group.id)}
        aria-pressed={groupSel}
        className="text-left px-[clamp(0.8rem,1.6vw,1.75rem)] pt-[clamp(0.7rem,2.2vh,1.6rem)] pb-[clamp(0.5rem,1.6vh,1.1rem)] focus:outline-none group"
      >
        <span className="flex items-baseline gap-[0.6em]">
          <span className="font-display text-[clamp(1.1rem,0.8rem+0.8vw,1.8rem)] text-beni-soft tabular-nums leading-none">{group.code}</span>
          <span className={`${T.label} !text-washi-muted group-hover:!text-washi [@media(max-height:700px)]:!tracking-[0.1em]`}>{group.label}</span>
        </span>
        <span className="block mt-[0.5em] text-[clamp(0.82rem,0.66rem+0.45vw,1.2rem)] leading-snug text-washi-muted [@media(max-height:700px)]:hidden">{group.summary}</span>
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
                <span className="block text-[clamp(0.66rem,0.58rem+0.22vw,0.88rem)] text-washi-dim [@media(max-height:700px)]:hidden">{c.jp}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
};

/** Bloco protagonista: a proposta do Kizuna, sempre visível e completa (não depende de clique). */
const KizunaBlock: React.FC = () => (
  <article className="relative min-w-0 h-full flex flex-col border-2 border-beni bg-[linear-gradient(rgba(215,38,61,0.15),rgba(215,38,61,0.15)),linear-gradient(rgba(14,12,14,0.88),rgba(14,12,14,0.88))] px-[clamp(0.9rem,2.2vw,2.5rem)] py-[clamp(0.8rem,2.6vh,2rem)]">
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <span className="flex items-baseline gap-[0.6em]">
        <span className="font-display text-[clamp(1.1rem,0.8rem+0.8vw,1.8rem)] text-beni-soft tabular-nums leading-none">03</span>
        <span className={`${T.label} !text-washi`}>
          Kizuna<span className="[@media(max-height:860px)]:hidden"> • proposta de posicionamento</span>
        </span>
      </span>
      <span className="[@media(max-height:860px)]:hidden">
        <Classification kind="proposta" className={T.seal} />
      </span>
    </div>
    <h2 className="mt-[clamp(0.4rem,1.4vh,1rem)] font-display text-[clamp(1.7rem,min(1rem+2vw,0.5rem+4.6vh),3.6rem)] leading-none text-washi">{KIZUNA.name}</h2>
    <p className="mt-[clamp(0.4rem,1.4vh,1rem)] max-w-[52ch] text-[clamp(0.84rem,0.66rem+0.5vw,1.25rem)] leading-snug text-washi/85 [@media(min-height:701px)_and_(max-height:960px)]:hidden">
      {KIZUNA.summary}
    </p>
    <ol className="mt-auto pt-[clamp(0.5rem,2vh,1.4rem)] flex flex-col [@media(max-height:700px)]:hidden">
      {KIZUNA.points.map((p, i) => (
        <li
          key={p}
          className="step-in flex items-baseline gap-[0.8em] border-t border-beni/45 py-[clamp(0.35rem,1.3vh,0.9rem)] text-[clamp(0.88rem,min(0.68rem+0.55vw,0.3rem+2vh),1.35rem)] leading-snug text-washi"
          style={{ animationDelay: `${150 + i * 90}ms` }}
        >
          <span className="font-display text-beni-soft tabular-nums">{String(i + 1).padStart(2, '0')}</span>
          <span>{p}</span>
        </li>
      ))}
    </ol>
  </article>
);

/** Painel de contexto: sem seleção, explica a natureza da comparação; com seleção, mostra a leitura do grupo. */
const ContextPanel: React.FC<{ selected: string | null }> = ({ selected }) => {
  const group = GROUPS.find((g) => g.id === selected);
  const company = selected ? companyById(selected) : undefined;

  let title: string;
  let jp = '';
  let rows: { k: string; v: string }[] = [];
  let note: string;
  if (company) {
    title = company.c.name;
    jp = company.c.jp;
    rows = [
      { k: 'Escopo', v: company.c.scope },
      { k: 'Adaptação local', v: company.c.cultural }
    ];
    note = `Hipótese do grupo: ${company.c.note}`;
  } else if (group) {
    title = group.label;
    rows = group.companies.map((c) => ({ k: c.name, v: c.scope }));
    note = group.summary;
  } else {
    title = 'Leitura das alternativas';
    note = 'As leituras dos concorrentes são hipóteses do grupo, a conferir em fontes oficiais.';
  }

  return (
    <div key={selected ?? 'none'} className="step-in h-full min-w-0 border border-washi/10 bg-sumi-800/[0.82] px-[clamp(0.8rem,1.6vw,1.75rem)] py-[clamp(0.5rem,1.8vh,1.25rem)]">
      <div className="flex flex-wrap items-center gap-x-[0.8em] gap-y-1">
        <span className="text-[clamp(0.95rem,0.75rem+0.6vw,1.5rem)] font-semibold leading-tight text-washi">{title}</span>
        {jp && <span className="text-[clamp(0.66rem,0.58rem+0.22vw,0.88rem)] text-washi-dim">{jp}</span>}
        {/* em telas baixas, com empresa selecionada, o texto já começa com "Hipótese do grupo" */}
        <span className={rows.length > 0 ? '[@media(max-height:860px)]:hidden' : ''}>
          <Classification kind="hipotese" className={T.seal}>
            Hipótese de posicionamento
          </Classification>
        </span>
      </div>
      {rows.length > 0 && (
        <p className="hidden [@media(max-height:860px)]:block mt-[0.3em] text-[0.84rem] leading-snug text-washi">
          {rows.map((r) => `${r.k}: ${r.v}`).join(' • ')}. <span className="text-washi-muted">{note}</span>
        </p>
      )}
      {rows.length > 0 && (
        <dl className="[@media(max-height:860px)]:hidden mt-[clamp(0.35rem,1.2vh,0.8rem)] grid grid-cols-2 gap-x-[clamp(0.8rem,2vw,2.5rem)] gap-y-1">
          {rows.map((r) => (
            <div key={r.k} className="min-w-0">
              <dt className={T.label}>{r.k}</dt>
              <dd className="mt-[0.15em] text-[clamp(0.84rem,0.68rem+0.45vw,1.2rem)] text-washi">{r.v}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className={`mt-[clamp(0.35rem,1.2vh,0.8rem)] max-w-[80ch] text-[clamp(0.82rem,0.66rem+0.45vw,1.2rem)] leading-snug text-washi-muted ${rows.length > 0 ? '[@media(max-height:860px)]:hidden' : ''}`}>
        {note}
        {!selected && <span className="[@media(max-height:860px)]:hidden"> Selecione um grupo ou uma empresa para ver escopo e adaptação local.</span>}
      </p>
    </div>
  );
};

/** Faixa de síntese: critério → proposta Kizuna. */
const Synthesis: React.FC = () => (
  <div className="border-t-2 border-beni pt-[clamp(0.4rem,1.8vh,1.25rem)]">
    <span className={T.label}>Síntese • critério → proposta Kizuna</span>
    <dl className="mt-[clamp(0.35rem,1.2vh,0.8rem)] grid grid-cols-4 gap-[clamp(0.8rem,2.4vw,3rem)]">
      {SYNTHESIS.map((s, i) => (
        <div key={s.criterion} className="step-in min-w-0" style={{ animationDelay: `${250 + i * 90}ms` }}>
          <dt className={`${T.label} [@media(max-height:700px)]:!tracking-[0.08em]`}>{s.criterion}</dt>
          <dd className="mt-[0.25em] font-display leading-tight text-washi text-[clamp(1.1rem,min(0.65rem+1.25vw,0.3rem+3vh),2.4rem)] [@media(max-height:700px)]:!text-[0.95rem] [@media(max-height:700px)]:whitespace-nowrap">{s.value}</dd>
        </div>
      ))}
    </dl>
  </div>
);

/**
 * Tela 10 • Posicionamento competitivo — uma única cena.
 * Os três blocos, o painel de contexto e a síntese aparecem juntos: a mensagem não depende de clique.
 * A seleção (grupo ou empresa) só atualiza o painel; nunca troca de cena. O Kizuna fica sempre visível.
 */
export const PositioningSection: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const select = (id: string) => setSelected((cur) => (cur === id ? null : id));

  return (
    <div className="relative w-full h-full select-none">
      {/* Etapa 9: véu mais leve — o andar executivo e a vista de Tóquio aparecem; os blocos têm fundo próprio */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,11,13,0.6)_0%,rgba(11,11,13,0.5)_45%,rgba(11,11,13,0.62)_100%)]" />
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

        {/* grupos concorrentes + contexto à esquerda; o Kizuna ocupa a coluna inteira à direita */}
        <div
          className="mt-[clamp(0.75rem,3.2vh,2.4rem)] [@media(max-height:700px)]:mt-2 flex-1 min-h-0 grid gap-[clamp(0.6rem,1.4vw,1.5rem)] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)] [grid-template-rows:minmax(0,1fr)_auto] [@media(max-height:700px)]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.6fr)] [@media(max-height:860px)]:[grid-template-rows:auto_minmax(0,1fr)]"
        >
          <div className="min-h-0">
            <GroupBlock group={GROUPS[0]} selected={selected} onSelect={select} />
          </div>
          <div className="min-h-0">
            <GroupBlock group={GROUPS[1]} selected={selected} onSelect={select} />
          </div>
          <div className="min-h-0 row-span-2">
            <KizunaBlock />
          </div>
          <div className="col-span-2 min-h-0">
            <ContextPanel selected={selected} />
          </div>
        </div>

        <div className="shrink-0 mt-[clamp(0.7rem,2.8vh,2.2rem)] [@media(max-height:700px)]:mt-2.5">
          <Synthesis />
        </div>
      </div>
    </div>
  );
};
export default PositioningSection;
