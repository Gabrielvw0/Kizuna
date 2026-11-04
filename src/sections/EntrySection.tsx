import React from 'react';
import { Handshake, FlaskConical, Award, TrendingUp, Building2, Briefcase, CalendarRange, MonitorPlay, Timer } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import metricsData from '../data/metrics.json';
import { ScreenTitle, InfoTag } from '../components/strategic/ScreenTitle';

const phase = (id: string) => metricsData.phases.find((p) => p.id === id)!;
const PILOTS = phase('m3_6');
const CONTRACTS = phase('m9_12');

// Rota de entrada (R3). Cada cena da tela destaca um trecho da rota.
const STATIONS = [
  {
    icon: Handshake,
    name: 'Parceiro local',
    text: 'Aproximar integradores e consultorias japonesas (SIer). Nenhum parceiro confirmado.',
    group: 0
  },
  {
    icon: FlaskConical,
    name: 'Pilotos assistidos',
    text: `${PILOTS.targetLabel} (${PILOTS.period.toLowerCase()}), para validar a aderência.`,
    group: 0
  },
  {
    icon: Award,
    name: 'Referências',
    text: 'Casos de uso publicados só se autorizados pelos clientes e com resultados medidos.',
    group: 1
  },
  {
    icon: TrendingUp,
    name: 'Expansão',
    text: 'Do Start para Business e Enterprise dentro de cada cliente (Land & Expand).',
    group: 1
  },
  {
    icon: Building2,
    name: 'Subsidiária?',
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

/** Tela 09 • Estratégia de entrada (R3) e aquisição B2B (R4). */
export const EntrySection: React.FC = () => {
  const { sceneIndex, setSceneIndex } = usePresentation();
  const scene = Math.min(3, Math.max(0, sceneIndex));
  const isAcquisition = scene === 3;

  return (
    <div className="relative w-full h-full flex flex-col justify-center gap-5 px-6 md:px-14 py-4 max-w-6xl mx-auto overflow-y-auto select-none">
      <ScreenTitle
        kicker={isAcquisition ? '09 • R4 • Promoção e aquisição B2B' : '09 • R3 • Praça e modo de entrada • 道'}
        title={
          isAcquisition ? (
            <>
              Confiança se constrói <span className="text-rose-500">antes da venda.</span>
            </>
          ) : (
            <>
              Entrar no Japão <span className="text-rose-500">reduzindo o risco.</span>
            </>
          )
        }
      />

      {!isAcquisition ? (
        <div key="route" className="flex flex-col gap-5 animate-fadeIn">
          {/* Linha da rota: escolher uma estação leva ao trecho dela (o trem 3D acompanha) */}
          <div className="relative grid grid-cols-5 gap-2">
            <div className="absolute left-[10%] right-[10%] top-6 h-0.5 bg-rose-500/30" aria-hidden />
            {STATIONS.map((st) => {
              const Icon = st.icon;
              const active = st.group === scene;
              const passed = st.group < scene;
              return (
                <button
                  key={st.name}
                  onClick={() => setSceneIndex(st.group)}
                  aria-current={active}
                  className="relative flex flex-col items-center text-center gap-2"
                >
                  <span
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                      active
                        ? 'bg-rose-600 border-rose-300 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)]'
                        : passed
                        ? 'bg-slate-900 border-rose-500/60 text-rose-300'
                        : 'bg-slate-950 border-white/20 text-slate-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className={`text-xs sm:text-sm font-bold ${active ? 'text-white' : 'text-slate-400'}`}>{st.name}</span>
                </button>
              );
            })}
          </div>

          <div key={scene} className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            {STATIONS.filter((st) => st.group === scene).map((st) => (
              <div key={st.name} className="p-5 rounded-2xl bg-slate-950/85 border border-white/15">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-black text-white">{st.name}</span>
                  <InfoTag kind={st.group === 2 ? 'hipotese' : 'proposta'} />
                </div>
                <p className="mt-2 text-sm text-slate-200 leading-snug">{st.text}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div key="acquisition" className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-slate-950/85 border border-white/15">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Para quem</div>
              <p className="mt-1 text-sm text-white">
                Gestores e líderes de equipe em PMEs e empresas em crescimento.
              </p>
              <div className="mt-3 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Mensagem</div>
              <p className="mt-1 text-lg font-mono font-bold text-white tracking-wider">GLOBAL REACH. LOCAL TRUST.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CHANNELS.map(({ icon: Icon, name }) => (
                <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white">
                  <Icon className="w-4 h-4 text-rose-400 shrink-0" />
                  {name}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-slate-950/85 border border-rose-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Funil do primeiro ano</span>
              <InfoTag kind="proposta">METAS PROPOSTAS</InfoTag>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="text-sm font-bold text-white">Interesse qualificado</div>
              <div className="text-xs text-slate-400">Parceiros, eventos e demonstrações • sem meta numérica definida</div>
            </div>
            <div className="mx-6 p-2.5 rounded-xl bg-white/[0.05] border border-white/15">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-white">Pilotos assistidos</span>
                <span className="text-xl font-black font-mono text-white whitespace-nowrap">{PILOTS.targetNumber}</span>
              </div>
              <div className="text-xs text-slate-400">{PILOTS.targetUnit} • {PILOTS.period.toLowerCase()}</div>
            </div>
            <div className="mx-12 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-white">Clientes recorrentes</span>
                <span className="text-xl font-black font-mono text-white whitespace-nowrap">{CONTRACTS.targetNumber}</span>
              </div>
              <div className="text-xs text-slate-400">contratos • {CONTRACTS.period.toLowerCase()}</div>
            </div>
            <p className="text-[11px] text-slate-500">Ainda não há clientes nem casos publicados: a prova social depende dos pilotos.</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default EntrySection;
