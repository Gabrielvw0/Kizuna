import React from 'react';
import { Handshake, FlaskConical, Award, TrendingUp, Building2, Briefcase, CalendarRange, MonitorPlay, Timer } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import metricsData from '../data/metrics.json';
import { Kicker, DisplayTitle, Accent, Classification, LegibilityVeil } from '../components/strategic/Editorial';
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

/** Rota com as cinco estações: indica a progressão; ao clicar usa a mesma navegação central de cenas. */
const Route: React.FC<{ scene: number; onGo: (scene: number) => void }> = ({ scene, onGo }) => {
  // última estação do trecho atual (a linha vermelha avança até ela)
  const lastActive = STATIONS.reduce((acc, st, i) => (st.group === scene ? i : acc), 0);
  const progress = (lastActive / (STATIONS.length - 1)) * 100;
  return (
    <ol className="relative grid grid-cols-5" aria-label="Rota de entrada no Japão">
      {/* linha-base e trecho percorrido, de centro a centro das estações extremas */}
      <span aria-hidden className="absolute left-[10%] right-[10%] top-[22px] h-px bg-washi/15" />
      <span
        aria-hidden
        className="absolute left-[10%] top-[22px] h-px bg-beni transition-[width] duration-700 ease-out motion-reduce:transition-none"
        style={{ width: `${progress * 0.8}%` }}
      />
      {STATIONS.map((st, i) => {
        const Icon = st.icon;
        const current = st.group === scene;
        const done = st.group < scene;
        return (
          <li key={st.name} className="relative flex flex-col items-center text-center">
            <button
              onClick={() => onGo(st.group)}
              aria-current={current ? 'step' : undefined}
              aria-label={`${pad(i + 1)} ${st.name}`}
              className="group flex flex-col items-center gap-2 focus:outline-none"
            >
              <span
                className={`relative w-11 h-11 rounded-full flex items-center justify-center border transition-colors duration-500 bg-sumi ${
                  current ? 'border-beni text-washi' : done ? 'border-beni/50 text-beni-soft' : 'border-washi/20 text-washi-dim group-hover:border-washi/40'
                }`}
              >
                {current && <span aria-hidden className="absolute -inset-[5px] rounded-full border border-kin/60" />}
                {current && <span aria-hidden className="absolute inset-0 rounded-full bg-beni/20" />}
                <Icon className="relative w-[18px] h-[18px]" />
              </span>
              <span className={`font-display text-xs tabular-nums transition-colors duration-500 ${current ? 'text-kin-soft' : 'text-washi-dim'}`}>
                {pad(i + 1)}
              </span>
              <span
                className={`-mt-1.5 text-xs sm:text-sm leading-tight transition-colors duration-500 ${
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
  );
};

/** Cartões do trecho atual da rota. Na 09.3 há um só cartão: fica centralizado. */
const StationCards: React.FC<{ scene: number }> = ({ scene }) => {
  const cards = STATIONS.map((st, i) => ({ st, i })).filter(({ st }) => st.group === scene);
  return (
    <div className={cards.length > 1 ? 'grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4' : 'max-w-xl mx-auto'}>
      {cards.map(({ st, i }) => (
        <article key={st.name} className="border-t border-washi/15 pt-4 short:pt-2.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl md:text-2xl short:text-xl text-washi">
              <span className="mr-2 text-base text-beni-soft tabular-nums">{pad(i + 1)}</span>
              {st.name}
            </h2>
            <Classification kind={st.tag} />
          </div>
          <p className="mt-2 text-sm md:text-base short:text-sm text-washi-muted leading-snug">{st.text}</p>
        </article>
      ))}
    </div>
  );
};

/** Cena 09.4: público, mensagem e canais (esquerda) + funil do primeiro ano (direita). */
const Acquisition: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 short:gap-5">
    <div className="flex flex-col gap-5 short:gap-3">
      <div className="step-in">
        <div className="text-[11px] uppercase tracking-[0.2em] text-washi-dim">Para quem</div>
        <p className="mt-1 text-base md:text-lg short:text-base text-washi leading-snug">
          Gestores e líderes de equipe em PMEs e empresas em crescimento.
        </p>
      </div>
      <div className="step-in border-l-2 border-kin/70 pl-4" style={{ animationDelay: '120ms' }}>
        <div className="text-[11px] uppercase tracking-[0.2em] text-washi-dim">Mensagem</div>
        <p className="mt-1 font-display text-xl md:text-2xl short:text-xl tracking-[0.08em] text-kin-soft">GLOBAL REACH. LOCAL TRUST.</p>
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-washi-dim">Canais</div>
        <ol className="mt-1.5">
          {CHANNELS.map(({ icon: Icon, name }, i) => (
            <li
              key={name}
              className="step-in flex items-center gap-3 py-1.5 short:py-1 border-b border-washi/10 text-sm md:text-base short:text-sm text-washi"
              style={{ animationDelay: `${220 + i * 80}ms` }}
            >
              <span className="w-5 font-display text-xs text-beni-soft tabular-nums">{pad(i + 1)}</span>
              <Icon className="w-4 h-4 text-washi-dim shrink-0" aria-hidden />
              {name}
            </li>
          ))}
        </ol>
      </div>
    </div>

    <div className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-washi-dim">Funil do primeiro ano</span>
        <Classification kind="projecao">Projeção • Metas propostas</Classification>
      </div>
      <ol className="mt-3">
        {FUNNEL.map((f, i) => {
          const last = i === FUNNEL.length - 1;
          return (
            <li
              key={f.name}
              className="step-in grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-stretch gap-4"
              style={{ animationDelay: `${300 + i * 160}ms` }}
            >
              {/* fatia do funil: as três se encaixam e formam um único funil */}
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full min-h-[56px]" aria-hidden>
                <polygon
                  points={`${(100 - f.from) / 2},0 ${100 - (100 - f.from) / 2},0 ${100 - (100 - f.to) / 2},40 ${(100 - f.to) / 2},40`}
                  className={last ? 'fill-beni/35 stroke-kin' : i === 1 ? 'fill-washi/[0.08] stroke-washi/30' : 'fill-washi/[0.04] stroke-washi/20'}
                  strokeWidth={0.6}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className={`py-2.5 short:py-1.5 ${i > 0 ? 'border-t border-washi/10' : ''}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className={`text-sm md:text-base short:text-sm ${last ? 'text-washi font-medium' : 'text-washi'}`}>{f.name}</span>
                  {f.value && (
                    <span className={`font-display text-2xl md:text-3xl short:text-2xl tabular-nums whitespace-nowrap ${last ? 'text-kin-soft' : 'text-washi'}`}>
                      {f.value}
                    </span>
                  )}
                </div>
                <div className="text-xs text-washi-dim leading-snug">{f.detail}</div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-washi-dim">Ainda não há clientes nem casos publicados: a prova social depende dos pilotos.</p>
    </div>
  </div>
);

/**
 * Tela 09 • Estratégia de entrada (R3) e aquisição B2B (R4) — Bloco 1 da Etapa 8.
 * 09.1–09.3: a rota fica fixa; a estação ativa avança e os cartões do trecho trocam (SceneStage).
 * 09.4: a rota cede lugar à aquisição B2B (SceneStage externo). O 3D acompanha (WorldStage, cenários 9 e 10).
 * As estações clicáveis usam setSceneIndex — a mesma função central (limitada à tela) que dispara as transições.
 */
export const EntrySection: React.FC = () => {
  const { sceneIndex, setSceneIndex } = usePresentation();
  const scene = Math.min(3, Math.max(0, sceneIndex));
  const isAcquisition = scene === 3;

  return (
    <div className="relative w-full h-full select-none">
      <LegibilityVeil side="center" />
      <div className="relative h-full max-w-6xl mx-auto px-6 md:px-14 py-4 short:py-1 flex flex-col justify-center gap-6 md:gap-8 short:gap-3 overflow-y-auto">
        <SceneStage index={isAcquisition ? 1 : 0}>
          <div>
            <Kicker
              code="09"
              label={isAcquisition ? 'R4 • Promoção e aquisição B2B' : 'R3 • Praça e modo de entrada'}
              jp="道"
            />
            <DisplayTitle className="mt-4 short:mt-2 short:!text-[1.8rem] short:lg:!text-[2.15rem]">
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

        <SceneStage index={isAcquisition ? 1 : 0}>
          {isAcquisition ? (
            <Acquisition />
          ) : (
            <div className="flex flex-col gap-7 md:gap-9 short:gap-4">
              <Route scene={scene} onGo={setSceneIndex} />
              <SceneStage index={scene}>
                <StationCards scene={scene} />
              </SceneStage>
            </div>
          )}
        </SceneStage>
      </div>
    </div>
  );
};
export default EntrySection;
