import React, { useLayoutEffect, useRef, useState } from 'react';
import { Handshake, Briefcase, CalendarRange, MonitorPlay, Timer } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import metricsData from '../data/metrics.json';
import { Kicker, DisplayTitle, Accent, Classification } from '../components/strategic/Editorial';
import { SceneStage } from '../components/strategic/SceneStage';

/*
 * Tela 09 • Reformulação "linha de metrô" (inspiração gráfica: mapas de metrô de Tóquio).
 * Vale SÓ para esta tela: o cabeçalho, o rodapé, a navegação e as transições globais não mudam.
 * Linguagem: linha vermelha (#F62E36) como protagonista, estações circulares vazadas, decisão em
 * círculos concêntricos dourados (o dourado fica reservado à decisão), sinalização tipográfica limpa.
 * Nada aparece como concluído: é um plano, não um resultado — nenhuma estação é preenchida.
 */

const phase = (id: string) => metricsData.phases.find((p) => p.id === id)!;
const RESEARCH = phase('m0_3'); // inclui a seleção de parceiros locais
const PILOTS = phase('m3_6');
const VALIDATION = phase('m6_9'); // inclui a publicação de casos autorizados
const CONTRACTS = phase('m9_12');
const months = (p: { period: string }) => p.period.toLowerCase();

const RED = '#F62E36';

type Kind = 'hipotese' | 'projecao' | 'proposta';
type Node = {
  kind: 'station' | 'decision';
  code?: string;
  name: string;
  sub?: string; // período (quando há fonte nos dados) ou complemento da decisão
  tag: Kind;
  text: string;
  group: number; // trecho (cena) a que o nó pertence
  conditional: boolean; // depende da validação dos pilotos → trecho tracejado
};

// Percurso: cinco estações e um ponto de decisão (seis nós)
const NODES: Node[] = [
  {
    kind: 'station',
    code: '01',
    name: 'Parceiro local',
    sub: months(RESEARCH),
    tag: 'hipotese',
    text: 'Aproximar integradores e consultorias japonesas (SIer). Nenhum parceiro confirmado.',
    group: 0,
    conditional: false
  },
  {
    kind: 'station',
    code: '02',
    name: 'Pilotos assistidos',
    sub: months(PILOTS),
    tag: 'projecao',
    text: `${PILOTS.targetLabel} (${months(PILOTS)}), para validar a aderência.`,
    group: 0,
    conditional: false
  },
  {
    kind: 'decision',
    name: 'GO / NO-GO',
    sub: 'após pilotos',
    tag: 'proposta',
    text: 'Mecanismo proposto de governança: continuar ou interromper a entrada conforme o resultado dos pilotos.',
    group: 1,
    conditional: false
  },
  {
    kind: 'station',
    code: '03',
    name: 'Referências',
    sub: months(VALIDATION),
    tag: 'hipotese',
    text: 'Casos de uso publicados só se autorizados pelos clientes e com resultados medidos.',
    group: 1,
    conditional: true
  },
  {
    kind: 'station',
    code: '04',
    name: 'Expansão',
    tag: 'proposta',
    text: 'Do Start para Business e Enterprise dentro de cada cliente (Land & Expand).',
    group: 1,
    conditional: true
  },
  {
    kind: 'station',
    code: '05',
    name: 'Subsidiária futura',
    tag: 'hipotese',
    text: 'Avaliar uma empresa japonesa (KK) só depois de pilotos, carteira e referências. Hoje não existe.',
    group: 2,
    conditional: true
  }
];

// Identificação do trecho (sem repetir o rótulo do cabeçalho global)
const LEG = ['Estações 01 e 02', 'Decisão e estações 03 e 04', 'Estação 05'];

// Aquisição B2B (R4): linhas alimentadoras
const CHANNELS = [
  { icon: Handshake, name: 'Parceiros locais (SIer)', proposal: false },
  { icon: Briefcase, name: 'Venda consultiva', proposal: false },
  { icon: CalendarRange, name: 'Eventos empresariais', proposal: false },
  { icon: MonitorPlay, name: 'Demonstração guiada', proposal: false },
  { icon: Timer, name: 'Piloto de até 30 dias (proposta)', proposal: true }
];

// Linha principal do primeiro ano: a espessura diminui como um funil de conversão
const MAIN = [
  { name: 'Interesse qualificado', value: null as string | null, detail: 'Parceiros, eventos e demonstrações • sem meta numérica definida', w: 16 },
  { name: 'Pilotos assistidos', value: PILOTS.targetNumber, detail: `${PILOTS.targetUnit} • ${months(PILOTS)}`, w: 12 },
  { name: 'Clientes recorrentes', value: CONTRACTS.targetNumber, detail: `contratos • ${months(CONTRACTS)}`, w: 8 }
];

const T = {
  label: 'text-[clamp(0.66rem,0.58rem+0.2vw,0.85rem)] uppercase tracking-[0.2em] text-washi-dim',
  seal: '!text-[clamp(0.62rem,0.52rem+0.22vw,0.82rem)] !px-[0.6em] !py-[0.25em]',
  body: 'text-[clamp(0.95rem,0.72rem+0.62vw,1.5rem)] leading-snug text-washi'
};

/** Animações locais da tela 09 (sem ciclos; com movimento reduzido, tudo aparece pronto). */
const LocalStyles = () => (
  <style>{`
    @keyframes metroDraw { to { stroke-dashoffset: 0; } }
    @keyframes metroFade { from { opacity: 0; } to { opacity: 1; } }
    .metro-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: metroDraw 900ms cubic-bezier(.4,0,.2,1) forwards; }
    .metro-fade { opacity: 0; animation: metroFade 700ms ease-out forwards; }
    @media (prefers-reduced-motion: reduce) {
      .metro-draw { animation: none; stroke-dashoffset: 0; }
      .metro-fade { animation: metroFade 200ms ease-out forwards; }
    }
  `}</style>
);

/** Tamanho real de um elemento (o diagrama da 09.4 é desenhado em pixels, sem distorcer traços nem textos). */
function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

/* ------------------------------------------------------------------------------------------------
 * 09.1–09.3 • a linha de entrada
 * ---------------------------------------------------------------------------------------------- */

const X0 = 7;
const X1 = 93;
const nodeX = (i: number) => X0 + (i * (X1 - X0)) / (NODES.length - 1);
const FOCUS = [0, 2, 5]; // nó onde o marcador para em cada trecho (primeiro nó do trecho)

const StationMark: React.FC<{ node: Node; current: boolean }> = ({ node, current }) => {
  if (node.kind === 'decision') {
    // estação dupla: decisão de continuidade ou interrupção
    return (
      <span
        className={`relative block rounded-full bg-sumi border-[3px] border-kin transition-transform duration-500 motion-reduce:transition-none ${current ? 'scale-110' : ''}`}
        style={{ width: 'calc(var(--n) * 1.18)', height: 'calc(var(--n) * 1.18)' }}
      >
        <span className="absolute inset-[24%] rounded-full border-[3px] border-kin" />
        {current && <span aria-hidden className="absolute -inset-[7px] rounded-full border border-kin/50" />}
      </span>
    );
  }
  // estação vazada: plano ou hipótese ainda não validada (nenhuma aparece como concluída)
  return (
    <span
      className={`relative block rounded-full bg-sumi transition-[transform,border-color] duration-500 motion-reduce:transition-none ${
        current ? 'border-[5px] border-washi scale-110' : 'border-[4px] border-washi/55'
      }`}
      style={{ width: 'var(--n)', height: 'var(--n)' }}
    >
      {current && <span aria-hidden className="absolute -inset-[8px] rounded-full border-2" style={{ borderColor: `${RED}80` }} />}
    </span>
  );
};

const MetroLine: React.FC<{ scene: number; onGo: (scene: number) => void }> = ({ scene, onGo }) => {
  const focus = FOCUS[scene];
  return (
    <div
      className="relative shrink-0"
      style={
        {
          '--n': 'clamp(1.45rem, 4.6vh, 3.3rem)', // diâmetro da estação
          '--l': 'clamp(7px, 1.25vh, 14px)', // espessura da linha
          '--p': 'clamp(1.2rem, 3.2vh, 2.2rem)', // faixa do marcador, acima da linha
          height: 'calc(var(--p) + var(--n) * 1.18 + clamp(3.6rem, 10.5vh, 7.4rem))'
        } as React.CSSProperties
      }
      aria-label="Linha de entrada no Japão"
    >
      {/* trechos entre nós: contínuo = planejado; tracejado = condicionado à validação dos pilotos */}
      {NODES.slice(0, -1).map((a, i) => {
        const b = NODES[i + 1];
        const dashed = b.conditional;
        const active = a.group === scene || b.group === scene;
        return (
          <span
            key={i}
            aria-hidden
            className="absolute transition-opacity duration-500 motion-reduce:transition-none"
            style={{
              left: `${nodeX(i)}%`,
              width: `${nodeX(i + 1) - nodeX(i)}%`,
              top: 'calc(var(--p) + var(--n) * 0.59 - var(--l) / 2)',
              height: 'var(--l)',
              opacity: active ? 1 : 0.42,
              background: dashed
                ? `repeating-linear-gradient(90deg, ${RED} 0 14px, transparent 14px 24px)`
                : RED
            }}
          />
        );
      })}

      {/* marcador de percurso: desloca-se para o trecho da cena (sem ciclo; mov. reduzido: salta) */}
      <span
        aria-hidden
        className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-[left] duration-[900ms] ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none"
        style={{ left: `${nodeX(focus)}%`, height: 'var(--p)' }}
      >
        <span className="px-[0.55em] py-[0.1em] text-[clamp(0.58rem,0.5rem+0.2vw,0.78rem)] font-semibold uppercase tracking-[0.18em] text-sumi" style={{ background: RED }}>
          Aqui
        </span>
        <span className="w-0 h-0 border-x-[5px] border-x-transparent border-t-[6px]" style={{ borderTopColor: RED }} />
      </span>

      {NODES.map((node, i) => {
        const current = node.group === scene;
        const isDecision = node.kind === 'decision';
        return (
          <button
            key={node.name}
            onClick={() => onGo(node.group)}
            aria-current={current ? 'step' : undefined}
            aria-label={`${node.code ? node.code + ' ' : ''}${node.name}`}
            className="group absolute -translate-x-1/2 flex flex-col items-center text-center focus:outline-none"
            style={{ left: `${nodeX(i)}%`, top: 'var(--p)', width: `${(X1 - X0) / (NODES.length - 1)}%` }}
          >
            <span className="flex items-center justify-center" style={{ height: 'calc(var(--n) * 1.18)' }}>
              <StationMark node={node} current={current} />
            </span>
            <span className="mt-[clamp(0.35rem,1.2vh,0.8rem)] flex items-center gap-[0.4em]">
              {node.code ? (
                <span
                  className={`inline-flex items-center justify-center min-w-[2.1em] px-[0.25em] border text-[clamp(0.6rem,0.5rem+0.22vw,0.8rem)] font-semibold tabular-nums leading-[1.5] transition-colors duration-500 ${
                    current ? 'text-washi' : 'text-washi-dim border-washi/20'
                  }`}
                  style={current ? { borderColor: RED, background: `${RED}26` } : undefined}
                >
                  {node.code}
                </span>
              ) : (
                <span className="text-[clamp(0.6rem,0.5rem+0.22vw,0.8rem)] font-semibold uppercase tracking-[0.18em] text-kin-soft">Decisão</span>
              )}
            </span>
            <span
              className={`mt-[0.3em] px-1 text-[clamp(0.8rem,min(0.55rem+0.75vw,0.2rem+2.3vh),1.45rem)] leading-tight transition-colors duration-500 ${
                isDecision ? (current ? 'text-kin-soft font-semibold' : 'text-kin-soft/70') : current ? 'text-washi font-semibold' : 'text-washi-muted group-hover:text-washi'
              }`}
            >
              {node.name}
            </span>
            {node.sub && (
              <span className={`mt-[0.2em] text-[clamp(0.66rem,0.56rem+0.25vw,0.88rem)] ${current ? 'text-washi-muted' : 'text-washi-dim'}`}>{node.sub}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

/** Um item do painel: sinalização (código/decisão), nome, classificação e explicação. */
const PanelItem: React.FC<{ node: Node; large?: boolean }> = ({ node, large }) => {
  const isDecision = node.kind === 'decision';
  return (
    <div className="min-w-0">
      {isDecision && <div className={`${T.label} !text-kin-soft/80 mb-[0.5em]`}>Decisão • {node.sub}</div>}
      <div className="flex flex-wrap items-center gap-x-[0.7em] gap-y-2">
        {isDecision ? (
          <span aria-hidden className="relative inline-block w-[1.25em] h-[1.25em] rounded-full border-[3px] border-kin shrink-0 text-[clamp(1rem,0.8rem+0.6vw,1.6rem)]">
            <span className="absolute inset-[24%] rounded-full border-[3px] border-kin" />
          </span>
        ) : (
          <span
            className="inline-flex items-center justify-center min-w-[2.2em] px-[0.3em] border-2 font-semibold tabular-nums text-washi text-[clamp(0.8rem,0.6rem+0.5vw,1.2rem)] leading-[1.45]"
            style={{ borderColor: RED }}
          >
            {node.code}
          </span>
        )}
        <h2
          className={`font-display leading-tight ${isDecision ? 'text-kin-soft' : 'text-washi'} ${
            large ? 'text-[clamp(1.5rem,min(0.9rem+1.7vw,0.4rem+3.6vh),3.1rem)]' : 'text-[clamp(1.15rem,min(0.85rem+1.4vw,0.35rem+3vh),2.6rem)]'
          }`}
        >
          {node.name}
        </h2>
        <Classification kind={node.tag} className={T.seal}>
          {isDecision ? 'Proposta de governança' : undefined}
        </Classification>
      </div>
      <p
        className={`mt-[clamp(0.45rem,1.5vh,1.1rem)] max-w-[48ch] leading-[1.55] text-washi-muted ${
          large ? 'text-[clamp(1rem,min(0.75rem+0.75vw,0.35rem+2.2vh),1.7rem)]' : 'text-[clamp(0.84rem,min(0.72rem+0.75vw,0.3rem+1.9vh),1.5rem)]'
        }`}
      >
        {node.text}
      </p>
    </div>
  );
};

/** Painel único, amplo: só o trecho da cena atual. */
const LegPanel: React.FC<{ scene: number }> = ({ scene }) => {
  const items = NODES.filter((n) => n.group === scene);
  const decision = items.find((n) => n.kind === 'decision');
  const stations = items.filter((n) => n.kind === 'station');
  if (!decision && stations.length === 1) {
    const n = stations[0];
    return (
      <div className="relative h-full grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] items-center gap-[clamp(1.25rem,4vw,5rem)] bg-sumi-800/85 border border-washi/10 overflow-hidden px-[clamp(1.3rem,3.4vw,3.75rem)] py-[clamp(0.8rem,3vh,2.4rem)]">
        <span aria-hidden className="absolute left-0 top-0 bottom-0 w-[6px]" style={{ background: RED }} />
        <div className="min-w-0">
          <span
            className="inline-flex items-center justify-center min-w-[2.2em] px-[0.3em] border-2 font-semibold tabular-nums text-washi text-[clamp(0.8rem,0.6rem+0.5vw,1.2rem)] leading-[1.45]"
            style={{ borderColor: RED }}
          >
            {n.code}
          </span>
          <h2 className="mt-[0.35em] font-display leading-[1.05] text-washi text-[clamp(1.8rem,min(1rem+2.4vw,0.5rem+5vh),3.9rem)]">{n.name}</h2>
          <div className="mt-[clamp(0.5rem,1.6vh,1rem)]">
            <Classification kind={n.tag} className={T.seal} />
          </div>
        </div>
        <p className="border-l border-washi/15 pl-[clamp(1rem,2.6vw,3rem)] max-w-[40ch] leading-relaxed text-washi-muted text-[clamp(1rem,min(0.75rem+0.8vw,0.35rem+2.3vh),1.75rem)]">
          {n.text}
        </p>
      </div>
    );
  }
  return (
    <div className="relative h-full flex flex-col bg-sumi-800/85 border border-washi/10 overflow-hidden">
      {/* faixa de cor da linha, como numa placa de sinalização */}
      <span aria-hidden className="absolute left-0 top-0 bottom-0 w-[6px]" style={{ background: RED }} />
      {/* colunas do trecho, na ordem da linha; a decisão (09.2) abre o trecho, com fundo dourado discreto */}
      <div className={`flex-1 min-h-0 grid ${items.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} divide-x divide-washi/10`}>
        {[...(decision ? [decision] : []), ...stations].map((n) => (
          <div
            key={n.name}
            className={`flex items-center px-[clamp(0.8rem,2.4vw,3.25rem)] py-[clamp(0.6rem,2.4vh,2rem)] ${n.kind === 'decision' ? 'bg-kin/[0.06]' : ''}`}
          >
            <PanelItem node={n} />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------------------------------------
 * 09.4 • linhas alimentadoras → linha principal
 * ---------------------------------------------------------------------------------------------- */

const FeederMap: React.FC = () => {
  const [ref, { w: W, h: H }] = useSize<HTMLDivElement>();
  const ready = W > 0 && H > 0;
  const labelW = Math.max(W * 0.25, Math.min(210, W * 0.32));
  const yMain = H * 0.3;
  const ys = CHANNELS.map((_, i) => H * (0.08 + i * 0.21));
  const slope = W < 1100 ? 0.5 : 0.7; // trecho diagonal (horizontal por unidade vertical)
  const maxDy = Math.max(...ys.map((y) => Math.abs(y - yMain)));
  const xStart = labelW + 18;
  const xm = xStart + W * 0.035 + maxDy * slope;
  const xEnd = W - 6;
  const L = xEnd - xm;
  const sx = [0.16, 0.5, 0.84].map((f) => xm + L * f);
  const colW = L * 0.33;

  return (
    <div ref={ref} className="relative h-full min-h-0">
      {ready && (
        <>
          <svg width={W} height={H} className="absolute inset-0 overflow-visible" aria-hidden>
            {/* alimentadoras: cada canal desce/sobe em diagonal até a linha principal */}
            {ys.map((y, i) => {
              const dy = Math.abs(y - yMain);
              const d = `M ${xStart} ${y} H ${xm - dy * slope} L ${xm} ${yMain}`;
              const ch = CHANNELS[i];
              return (
                <g key={i}>
                  <path
                    d={d}
                    fill="none"
                    stroke={RED}
                    strokeOpacity={0.6}
                    strokeWidth={4}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    pathLength={ch.proposal ? undefined : 1}
                    strokeDasharray={ch.proposal ? '9 7' : undefined}
                    className={ch.proposal ? 'metro-fade' : 'metro-draw'}
                    style={{ animationDelay: `${120 + i * 90}ms` }}
                  />
                  <circle cx={xStart} cy={y} r={5.5} fill="#0B0B0D" stroke="#F2EEE6" strokeOpacity={0.7} strokeWidth={2.5} className="metro-fade" style={{ animationDelay: `${i * 90}ms` }} />
                </g>
              );
            })}
            {/* linha principal: a espessura diminui de estação em estação (funil de conversão) */}
            {MAIN.map((m, i) => {
              const a = i === 0 ? xm : sx[i - 1];
              const b = sx[i];
              return (
                <path
                  key={m.name}
                  d={`M ${a} ${yMain} H ${b}`}
                  stroke={RED}
                  strokeWidth={m.w}
                  strokeLinecap={i === 0 ? 'round' : 'butt'}
                  pathLength={1}
                  className="metro-draw"
                  style={{ animationDelay: `${650 + i * 260}ms`, animationDuration: '520ms' }}
                />
              );
            })}
            {MAIN.map((m, i) => (
              <circle
                key={m.name}
                cx={sx[i]}
                cy={yMain}
                r={m.w * 0.5 + 7}
                fill="#0B0B0D"
                stroke="#F2EEE6"
                strokeWidth={4}
                className="metro-fade"
                style={{ animationDelay: `${900 + i * 260}ms` }}
              />
            ))}
          </svg>

          {/* rótulos dos canais (à esquerda, alinhados à origem de cada alimentadora) */}
          {CHANNELS.map(({ icon: Icon, name }, i) => (
            <div
              key={name}
              className="metro-fade absolute right-auto flex items-center justify-end gap-[0.55em] text-right text-[clamp(0.85rem,0.68rem+0.5vw,1.3rem)] leading-tight text-washi"
              style={{ left: 0, width: labelW, top: ys[i], transform: 'translateY(-50%)', animationDelay: `${i * 90}ms` }}
            >
              <span className="font-display text-[0.8em] tabular-nums" style={{ color: RED }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <Icon className="w-[1em] h-[1em] text-washi-dim shrink-0" aria-hidden />
              <span>{name}</span>
            </div>
          ))}

          {/* classificação dos números, sobre a linha principal */}
          <div className="absolute" style={{ left: xm, top: Math.max(0, yMain - 64) }}>
            <span className={`${T.label} mr-3`}>Primeiro ano</span>
            <Classification kind="projecao" className={T.seal}>
              Projeção • Metas propostas
            </Classification>
          </div>

          {/* estações da linha principal */}
          {MAIN.map((m, i) => {
            const last = i === MAIN.length - 1;
            return (
              <div
                key={m.name}
                className="metro-fade absolute -translate-x-1/2 text-center"
                style={{ left: sx[i], top: yMain + m.w * 0.5 + 18, width: colW, animationDelay: `${950 + i * 260}ms` }}
              >
                <div className={`text-[clamp(0.92rem,0.72rem+0.55vw,1.45rem)] leading-tight ${last ? 'text-washi font-semibold' : 'text-washi'}`}>{m.name}</div>
                {m.value && (
                  <div
                    className="mt-[0.15em] font-display text-[clamp(1.6rem,min(0.95rem+1.7vw,0.5rem+4vh),3.2rem)] leading-none tabular-nums"
                    style={{ color: last ? RED : '#F2EEE6' }}
                  >
                    {m.value}
                  </div>
                )}
                <div className="mt-[0.4em] text-[clamp(0.76rem,0.64rem+0.32vw,1.05rem)] leading-snug text-washi-muted">{m.detail}</div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

const Acquisition: React.FC = () => (
  <div className="h-full flex flex-col">
    <div className="shrink-0 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[clamp(1.25rem,4vw,5rem)] border-y border-washi/10 py-[clamp(0.5rem,1.8vh,1.25rem)]">
      <div>
        <div className={T.label}>Para quem</div>
        <p className={`mt-[0.35em] ${T.body}`}>Gestores e líderes de equipe em PMEs e empresas em crescimento.</p>
      </div>
      <div className="border-l-2 border-kin/70 pl-[clamp(0.75rem,1.4vw,1.5rem)]">
        <div className={T.label}>Mensagem</div>
        <p className="mt-[0.3em] font-display whitespace-nowrap text-[clamp(1rem,1.9vw,2.1rem)] leading-tight tracking-[0.08em] text-kin-soft">
          GLOBAL REACH. LOCAL TRUST.
        </p>
      </div>
    </div>
    <div className={`mt-[clamp(0.5rem,2vh,1.5rem)] ${T.label}`}>Canais de aquisição → percurso de conversão</div>
    <div className="mt-[clamp(0.4rem,1.4vh,1rem)] flex-1 min-h-0">
      <FeederMap />
    </div>
    <p className="shrink-0 mt-[clamp(0.4rem,1.4vh,1rem)] text-[clamp(0.8rem,0.68rem+0.32vw,1.08rem)] leading-snug text-washi-muted">
      Ainda não há clientes nem casos publicados: a prova social depende dos pilotos.
    </p>
  </div>
);

/**
 * Tela 09 • Estratégia de entrada (R3) e aquisição B2B (R4) — conceito "linha de metrô".
 * 09.1–09.3: título • linha com cinco estações e uma decisão • painel único do trecho atual.
 * 09.4: canais como linhas alimentadoras que convergem para a linha principal (funil).
 * Estações clicáveis usam setSceneIndex — a mesma função central que dispara as transições (SceneStage).
 * Sem cenário 3D nesta tela (ver WorldStage): a composição 2D é o elemento visual.
 */
export const EntrySection: React.FC = () => {
  const { sceneIndex, setSceneIndex } = usePresentation();
  const scene = Math.min(3, Math.max(0, sceneIndex));
  const isAcquisition = scene === 3;

  return (
    <div className="relative w-full h-full select-none">
      <LocalStyles />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-sumi/70" />
      <div className="relative h-full mx-auto w-[min(88%,1640px)] flex flex-col pt-[clamp(0.6rem,3.6vh,2.75rem)] pb-[clamp(0.5rem,3vh,2.25rem)]">
        <SceneStage index={isAcquisition ? 1 : 0} className="shrink-0">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
            <div>
              <Kicker
                code="09"
                label={isAcquisition ? 'R4 • Promoção e aquisição B2B' : 'R3 • Praça e modo de entrada'}
                jp="道"
                className="!text-[clamp(0.68rem,0.6rem+0.22vw,0.9rem)]"
              />
              <DisplayTitle className="mt-[clamp(0.4rem,1.4vh,1.1rem)] !text-[clamp(1.75rem,min(3.4vw,6.2vh),4.2rem)]">
                {isAcquisition ? (
                  <>
                    Confiança se constrói <Accent>antes da venda.</Accent>
                  </>
                ) : (
                  <>
                    Entrar no Japão <Accent>reduzindo o risco.</Accent>
                  </>
                )}
              </DisplayTitle>
            </div>
            {!isAcquisition && (
              // identificação do trecho atual, no estilo de placa de linha
              <div className="flex items-center gap-[0.7em] pb-[0.4em] text-[clamp(0.72rem,0.6rem+0.3vw,1rem)]">
                <span className="inline-flex items-center justify-center w-[1.9em] h-[1.9em] rounded-full border-[3px] font-bold text-washi" style={{ borderColor: RED }}>
                  {scene + 1}
                </span>
                <span className="leading-tight">
                  <span className="block uppercase tracking-[0.2em] text-washi-dim text-[0.85em]">Trecho {scene + 1} de 3</span>
                  <span className="block text-washi">{LEG[scene]}</span>
                </span>
              </div>
            )}
          </div>
        </SceneStage>

        <div className="mt-[clamp(0.75rem,3.6vh,2.75rem)] flex-1 min-h-0">
          <SceneStage index={isAcquisition ? 1 : 0} className="h-full" fill>
            {isAcquisition ? (
              <Acquisition />
            ) : (
              <div className="h-full flex flex-col gap-[clamp(0.6rem,3.6vh,3.5rem)]">
                <MetroLine scene={scene} onGo={setSceneIndex} />
                <SceneStage index={scene} className="min-h-0 flex-[0_1_41vh]" fill>
                  <LegPanel scene={scene} />
                </SceneStage>
              </div>
            )}
          </SceneStage>
        </div>
      </div>
    </div>
  );
};
export default EntrySection;
