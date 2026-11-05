import React from 'react';
import { Handshake, FlaskConical, Award, TrendingUp, Building2, Briefcase, CalendarRange, MonitorPlay, Timer } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import metricsData from '../data/metrics.json';
import { Kicker, DisplayTitle, Accent, Classification } from '../components/strategic/Editorial';
import { SceneStage } from '../components/strategic/SceneStage';

const phase = (id: string) => metricsData.phases.find((p) => p.id === id)!;
const PILOTS = phase('m3_6');
const CONTRACTS = phase('m9_12');

type Kind = 'hipotese' | 'projecao' | 'proposta';

// Rota de entrada (R3): cinco estações; cada cena da tela destaca um trecho (group).
const STATIONS: { icon: React.FC<{ className?: string }>; name: string; tag: Kind; text: string; group: number }[] = [
  {
    icon: Handshake,
    name: 'Parceiro local',
    tag: 'hipotese',
    text: 'Aproximar integradores e consultorias japonesas (SIer). Nenhum parceiro confirmado.',
    group: 0
  },
  {
    icon: FlaskConical,
    name: 'Pilotos assistidos',
    tag: 'projecao',
    text: `${PILOTS.targetLabel} (${PILOTS.period.toLowerCase()}), para validar a aderência.`,
    group: 0
  },
  {
    icon: Award,
    name: 'Referências',
    tag: 'hipotese',
    text: 'Casos de uso publicados só se autorizados pelos clientes e com resultados medidos.',
    group: 1
  },
  {
    icon: TrendingUp,
    name: 'Expansão',
    tag: 'proposta',
    text: 'Do Start para Business e Enterprise dentro de cada cliente (Land & Expand).',
    group: 1
  },
  {
    icon: Building2,
    name: 'Subsidiária futura',
    tag: 'hipotese',
    text: 'Avaliar uma empresa japonesa (KK) só depois de pilotos, carteira e referências. Hoje não existe.',
    group: 2
  }
];

// Aquisição B2B (R4)
const CHANNELS = [
  { icon: Handshake, name: 'Parceiros locais (SIer)' },
  { icon: Briefcase, name: 'Venda consultiva' },
  { icon: CalendarRange, name: 'Eventos empresariais' },
  { icon: MonitorPlay, name: 'Demonstração guiada' },
  { icon: Timer, name: 'Piloto de até 30 dias (proposta)' }
];

// Funil do primeiro ano: cada etapa é uma fatia do mesmo funil (larguras em % do topo à base)
const FUNNEL = [
  { name: 'Interesse qualificado', value: null as string | null, detail: 'Parceiros, eventos e demonstrações • sem meta numérica definida', from: 100, to: 76 },
  { name: 'Pilotos assistidos', value: PILOTS.targetNumber, detail: `${PILOTS.targetUnit} • ${PILOTS.period.toLowerCase()}`, from: 76, to: 52 },
  { name: 'Clientes recorrentes', value: CONTRACTS.targetNumber, detail: `contratos • ${CONTRACTS.period.toLowerCase()}`, from: 52, to: 30 }
];


const pad = (n: number) => String(n).padStart(2, '0');

/*
 * Correção de composição da tela 09: escala fluida (vw/vh) em vez de degraus fixos,
 * para que a mesma diagramação funcione de 800×600 a 1920×1080 sem só "encolher tudo".
 */
const T = {
  label: 'text-[clamp(0.66rem,0.58rem+0.2vw,0.85rem)] uppercase tracking-[0.2em] text-washi-dim',
  seal: '!text-[clamp(0.62rem,0.52rem+0.22vw,0.82rem)] !px-[0.6em] !py-[0.25em]',
  cardTitle: 'font-display text-[clamp(1.2rem,min(0.85rem+1.5vw,0.35rem+3.1vh),2.75rem)] leading-tight text-washi',
  cardText: 'text-[clamp(0.88rem,min(0.72rem+0.8vw,0.3rem+1.9vh),1.55rem)] leading-relaxed text-washi-muted',
  numeral: 'font-display leading-none tabular-nums text-beni-soft',
  body: 'text-[clamp(0.95rem,0.72rem+0.62vw,1.5rem)] leading-snug text-washi'
};

/** Rota com as cinco estações, em faixa própria. A linha fica atrás dos círculos; clicar usa a navegação central. */
const Route: React.FC<{ scene: number; onGo: (scene: number) => void }> = ({ scene, onGo }) => {
  // última estação do trecho atual (a linha vermelha avança até ela)
  const lastActive = STATIONS.reduce((acc, st, i) => (st.group === scene ? i : acc), 0);
  const progress = (lastActive / (STATIONS.length - 1)) * 100;
  return (
    <div
      className="relative shrink-0 border-y border-washi/10 bg-sumi/50 py-[clamp(0.6rem,2.6vh,2.1rem)]"
      style={{ '--c': 'clamp(2.35rem, 6.4vh, 4.6rem)' } as React.CSSProperties}
    >
      <ol className="relative grid grid-cols-5" aria-label="Rota de entrada no Japão">
        {/* linha-base e trecho percorrido, de centro a centro das estações extremas, na altura do centro dos círculos */}
        <span aria-hidden className="absolute left-[10%] right-[10%] top-[calc(var(--c)/2)] h-px bg-washi/15" />
        <span
          aria-hidden
          className="absolute left-[10%] top-[calc(var(--c)/2)] h-px bg-beni transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: `${progress * 0.8}%` }}
        />
        {STATIONS.map((st, i) => {
          const Icon = st.icon;
          const current = st.group === scene;
          const done = st.group < scene;
          return (
            <li key={st.name} className="relative flex justify-center text-center">
              <button
                onClick={() => onGo(st.group)}
                aria-current={current ? 'step' : undefined}
                aria-label={`${pad(i + 1)} ${st.name}`}
                className="group flex flex-col items-center gap-[clamp(0.3rem,1.1vh,0.8rem)] focus:outline-none"
              >
                <span
                  className={`relative rounded-full flex items-center justify-center border bg-sumi transition-[color,border-color,transform] duration-500 motion-reduce:transition-none motion-reduce:!scale-100 ${
                    current
                      ? 'border-beni text-washi scale-[1.08]'
                      : done
                        ? 'border-beni/50 text-beni-soft'
                        : 'border-washi/20 text-washi-dim group-hover:border-washi/40'
                  }`}
                  style={{ width: 'var(--c)', height: 'var(--c)' }}
                >
                  {current && <span aria-hidden className="absolute -inset-[6px] rounded-full border border-kin/60" />}
                  {current && <span aria-hidden className="absolute inset-0 rounded-full bg-beni/25" />}
                  <Icon className="relative w-[calc(var(--c)*0.4)] h-[calc(var(--c)*0.4)]" />
                </span>
                <span
                  className={`font-display text-[clamp(0.7rem,0.6rem+0.25vw,0.95rem)] tabular-nums transition-colors duration-500 ${
                    current ? 'text-kin-soft' : 'text-washi-dim'
                  }`}
                >
                  {pad(i + 1)}
                </span>
                <span
                  className={`-mt-[0.2em] text-[clamp(0.8rem,0.55rem+0.7vw,1.3rem)] leading-tight transition-colors duration-500 ${
                    current ? 'text-washi font-medium' : done ? 'text-washi-muted' : 'text-washi-dim'
                  }`}
                >
                  {st.name}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

/** Cartões do trecho atual: dois lado a lado (09.1 e 09.2) ou um cartão largo, editorial (09.3). */
const StationCards: React.FC<{ scene: number }> = ({ scene }) => {
  const cards = STATIONS.map((st, i) => ({ st, i })).filter(({ st }) => st.group === scene);

  if (cards.length === 1) {
    const { st, i } = cards[0];
    const Icon = st.icon;
    return (
      <article className="relative h-full grid grid-cols-[minmax(0,1fr)_minmax(0,2.3fr)] bg-sumi-800/80 border border-washi/10">
        <span aria-hidden className="absolute left-0 top-0 h-[2px] w-[clamp(2.5rem,5vw,5.5rem)] bg-beni" />
        <div className="flex flex-col justify-between gap-4 p-[clamp(1rem,3.2vh,2.75rem)] border-r border-washi/10">
          <span className={`${T.numeral} text-[clamp(2.4rem,1.2rem+4.2vh,5rem)]`}>{pad(i + 1)}</span>
          <div className="flex items-center gap-3 text-washi-dim">
            <Icon className="w-[clamp(1.25rem,3.4vh,2.4rem)] h-[clamp(1.25rem,3.4vh,2.4rem)] shrink-0" aria-hidden />
            <span className={T.label}>Última estação da rota</span>
          </div>
        </div>
        <div className="flex flex-col justify-center p-[clamp(1rem,3.2vh,2.75rem)] pl-[clamp(1.25rem,3.5vw,4.5rem)]">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <h2 className="font-display text-[clamp(1.5rem,0.9rem+1.7vw,3.1rem)] leading-tight text-washi">{st.name}</h2>
            <Classification kind={st.tag} className={T.seal} />
          </div>
          <p className="mt-[clamp(0.6rem,2vh,1.6rem)] max-w-[44ch] text-[clamp(1rem,0.75rem+0.7vw,1.65rem)] leading-relaxed text-washi-muted">
            {st.text}
          </p>
        </div>
      </article>
    );
  }

  return (
    <div className="grid h-full grid-cols-2 gap-[clamp(1rem,2.6vw,3.5rem)]">
      {cards.map(({ st, i }) => {
        const Icon = st.icon;
        return (
          <article
            key={st.name}
            className="relative h-full min-h-0 flex flex-col bg-sumi-800/80 border border-washi/10 p-[clamp(1rem,3.2vh,2.75rem)]"
          >
            <span aria-hidden className="absolute left-0 top-0 h-[2px] w-[clamp(2.5rem,5vw,5.5rem)] bg-beni" />
            <div className="flex items-start justify-between gap-4">
              <span className={`${T.numeral} text-[clamp(1.5rem,-0.5rem+6.5vh,4.5rem)]`}>{pad(i + 1)}</span>
              <Icon className="w-[clamp(1.25rem,3.2vh,2.25rem)] h-[clamp(1.25rem,3.2vh,2.25rem)] text-washi-dim shrink-0" aria-hidden />
            </div>
            <div className="mt-auto pt-[clamp(0.5rem,2vh,1.5rem)]">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h2 className={T.cardTitle}>{st.name}</h2>
                <Classification kind={st.tag} className={T.seal} />
              </div>
              <p className={`mt-[clamp(0.5rem,1.6vh,1.25rem)] max-w-[42ch] ${T.cardText}`}>{st.text}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
};

/** Cena 09.4: público, mensagem e canais (esquerda) + funil do primeiro ano (direita), ocupando a altura da cena. */
const Acquisition: React.FC = () => (
  <div className="grid h-full grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-[clamp(1.5rem,4.5vw,6.5rem)]">
    <div className="min-h-0 flex flex-col gap-[clamp(0.6rem,2.6vh,2.1rem)]">
      <div className="step-in">
        <div className={T.label}>Para quem</div>
        <p className={`mt-[0.4em] ${T.body}`}>Gestores e líderes de equipe em PMEs e empresas em crescimento.</p>
      </div>
      <div className="step-in border-l-2 border-kin/70 pl-[clamp(0.75rem,1.4vw,1.5rem)]" style={{ animationDelay: '120ms' }}>
        <div className={T.label}>Mensagem</div>
        <p className="mt-[0.3em] font-display whitespace-nowrap text-[clamp(1rem,1.9vw,2.1rem)] leading-tight tracking-[0.08em] text-kin-soft">
          GLOBAL REACH. LOCAL TRUST.
        </p>
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        <div className={T.label}>Canais</div>
        <ol className="mt-[0.5em] flex-1 min-h-0 flex flex-col border-t border-washi/10">
          {CHANNELS.map(({ icon: Icon, name }, i) => (
            <li
              key={name}
              className="step-in flex-1 min-h-0 max-h-[4.5rem] flex items-center gap-[clamp(0.6rem,1.2vw,1.25rem)] border-b border-washi/10 text-[clamp(0.92rem,0.72rem+0.55vw,1.4rem)] text-washi"
              style={{ animationDelay: `${220 + i * 80}ms` }}
            >
              <span className="w-[2ch] font-display text-[0.8em] text-beni-soft tabular-nums">{pad(i + 1)}</span>
              <Icon className="w-[1.05em] h-[1.05em] text-washi-dim shrink-0" aria-hidden />
              {name}
            </li>
          ))}
        </ol>
      </div>
    </div>

    <div className="min-h-0 flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={T.label}>Funil do primeiro ano</span>
        <Classification kind="projecao" className={T.seal}>
          Projeção • Metas propostas
        </Classification>
      </div>
      <ol className="mt-[clamp(0.5rem,1.6vh,1.25rem)] flex-1 min-h-0 flex flex-col">
        {FUNNEL.map((f, i) => {
          const last = i === FUNNEL.length - 1;
          return (
            <li
              key={f.name}
              className="step-in flex-1 min-h-0 max-h-[10rem] grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-stretch gap-[clamp(0.75rem,2vw,2.5rem)]"
              style={{ animationDelay: `${300 + i * 160}ms` }}
            >
              {/* fatia do funil: as três se encaixam e formam um único funil */}
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full min-h-[2.5rem]" aria-hidden>
                <polygon
                  points={`${(100 - f.from) / 2},0 ${100 - (100 - f.from) / 2},0 ${100 - (100 - f.to) / 2},40 ${(100 - f.to) / 2},40`}
                  className={last ? 'fill-beni/35 stroke-kin' : i === 1 ? 'fill-washi/[0.08] stroke-washi/30' : 'fill-washi/[0.04] stroke-washi/20'}
                  strokeWidth={0.6}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className={`flex flex-col justify-center ${i > 0 ? 'border-t border-washi/10' : ''}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className={`text-[clamp(0.95rem,0.75rem+0.55vw,1.45rem)] leading-tight ${last ? 'text-washi font-medium' : 'text-washi'}`}>
                    {f.name}
                  </span>
                  {f.value && (
                    <span
                      className={`font-display text-[clamp(1.6rem,0.95rem+1.6vw,3.1rem)] leading-none tabular-nums whitespace-nowrap ${
                        last ? 'text-kin-soft' : 'text-washi'
                      }`}
                    >
                      {f.value}
                    </span>
                  )}
                </div>
                <div className="mt-[0.35em] text-[clamp(0.78rem,0.66rem+0.32vw,1.08rem)] leading-snug text-washi-muted">{f.detail}</div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-[clamp(0.5rem,1.6vh,1.25rem)] text-[clamp(0.8rem,0.68rem+0.32vw,1.08rem)] leading-snug text-washi-muted">
        Ainda não há clientes nem casos publicados: a prova social depende dos pilotos.
      </p>
    </div>
  </div>
);

/**
 * Tela 09 • Estratégia de entrada (R3) e aquisição B2B (R4).
 * Correção de composição: três faixas horizontais em ~85% da largura útil —
 *  1. cabeçalho e título; 2. rota em faixa própria (09.1–09.3); 3. cartões do trecho, grandes.
 * 09.4 usa a mesma altura para duas colunas amplas (canais | funil).
 * A faixa livre abaixo do conteúdo é marcada com data-world-anchor: é ali que o 3D se acomoda (WorldStage),
 * nunca atrás de textos ou cartões.
 * As estações clicáveis usam setSceneIndex — a mesma função central que dispara as transições (SceneStage).
 */
export const EntrySection: React.FC = () => {
  const { sceneIndex, setSceneIndex } = usePresentation();
  const scene = Math.min(3, Math.max(0, sceneIndex));
  const isAcquisition = scene === 3;

  return (
    <div className="relative w-full h-full select-none">
      {/* véu de legibilidade largo: cobre toda a área de leitura; o 3D fica na faixa inferior, fora dele */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_72%_at_50%_42%,rgba(11,11,13,0.88)_0%,rgba(11,11,13,0.62)_58%,rgba(11,11,13,0.1)_100%)]"
      />
      <div className="relative h-full mx-auto w-[min(88%,1640px)] flex flex-col pt-[clamp(0.6rem,4vh,3rem)] pb-[clamp(0.25rem,1.2vh,1rem)]">
        <SceneStage index={isAcquisition ? 1 : 0} className="shrink-0">
          <div>
            <Kicker
              code="09"
              label={isAcquisition ? 'R4 • Promoção e aquisição B2B' : 'R3 • Praça e modo de entrada'}
              jp="道"
              className="!text-[clamp(0.68rem,0.6rem+0.22vw,0.9rem)]"
            />
            <DisplayTitle className="mt-[clamp(0.4rem,1.6vh,1.25rem)] !text-[clamp(1.75rem,min(3.5vw,6.6vh),4.4rem)]">
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
        </SceneStage>

        {/* corpo: base de 60% da altura da janela; encolhe se faltar espaço (telas baixas) */}
        <div className="mt-[clamp(0.6rem,3.6vh,2.75rem)] flex-[0_1_60vh] min-h-0">
          <SceneStage index={isAcquisition ? 1 : 0} className="h-full" fill>
            {isAcquisition ? (
              <Acquisition />
            ) : (
              <div className="h-full flex flex-col gap-[clamp(0.6rem,3.4vh,2.5rem)]">
                <Route scene={scene} onGo={setSceneIndex} />
                <SceneStage index={scene} className="flex-1 min-h-0" fill>
                  <StationCards scene={scene} />
                </SceneStage>
              </div>
            )}
          </SceneStage>
        </div>

        {/* faixa livre inferior: o cenário 3D da tela 09 se acomoda aqui */}
        <div data-world-anchor="entry" aria-hidden className="flex-1 min-h-0" />
      </div>
    </div>
  );
};
export default EntrySection;
