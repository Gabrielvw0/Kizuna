import React, { useState } from 'react';
import {
  Briefcase,
  Handshake,
  CalendarRange,
  Globe,
  Cloud,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Train,
  Building2
} from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import metricsData from '../data/metrics.json';

// Meta proposta de pilotos (ex.: "3–5" -> "3 a 5"): fonte única em metrics.json
const PILOT_TARGET = metricsData.phases.find((p) => p.id === 'm3_6')!.targetNumber.replace('–', ' a ');

const CHANNELS = [
  {
    code: '01',
    title: 'VENDA DIRETA',
    jp: '直販・コンサル営業',
    desc: 'Equipe comercial consultiva focada em contas corporativas.',
    icon: <Briefcase className="w-4 h-4" />
  },
  {
    code: '02',
    title: 'PARCEIROS LOCAIS',
    jp: '現地パートナー・SIer',
    desc: 'Integradores e consultorias japonesas que já possuem confiança local.',
    icon: <Handshake className="w-4 h-4" />
  },
  {
    code: '03',
    title: 'EVENTOS EMPRESARIAIS',
    jp: '展示会・ビジネス交流',
    desc: 'Feiras de tecnologia e encontros executivos presenciais.',
    icon: <CalendarRange className="w-4 h-4" />
  },
  {
    code: '04',
    title: 'CANAIS DIGITAIS',
    jp: 'デジタル獲得',
    desc: 'Aquisição qualificada e demonstração interativa online.',
    icon: <Globe className="w-4 h-4" />
  },
  {
    code: '05',
    title: 'SaaS EM NUVEM',
    jp: 'クラウド提供',
    desc: 'Entrega digital segura em nuvem com ativação rápida por equipe.',
    icon: <Cloud className="w-4 h-4" />
  }
];

const METRO_STATIONS = [
  {
    station: 'ESTAÇÃO 01',
    name: 'Brasil (origem do projeto)',
    jp: 'ブラジル（プロジェクトの起点）',
    location: 'Origem conceitual do projeto',
    detail: 'Origem acadêmica e conceitual do Kizuna, com a Globant como referência empresarial; validação prévia da arquitetura.',
    milestone: 'Base conceitual do projeto'
  },
  {
    station: 'ESTAÇÃO 02',
    name: 'Parceiro Local (SIer)',
    jp: '現地SIerパートナー候補の探索',
    location: 'Tóquio (alvo inicial)',
    detail: 'Identificar e aproximar consultorias e integradores de sistemas japoneses como possíveis parceiros de entrada. Nenhum parceiro foi confirmado.',
    milestone: 'Endosso de confiança local (objetivo)'
  },
  {
    station: 'ESTAÇÃO 03',
    name: 'Pilotos Controlados',
    jp: '限定パイロット導入',
    location: 'Região metropolitana de Tóquio (alvo)',
    detail: `Pilotos do Kizuna Start em ${PILOT_TARGET} PMEs selecionadas, para validar a aderência ao mercado japonês (meta proposta).`,
    milestone: 'Ajustes a partir dos pilotos'
  },
  {
    station: 'ESTAÇÃO 04',
    name: 'Casos de Referência',
    jp: '導入事例・社会的証明',
    location: 'Nagoya & Kanto',
    detail: 'Estudos de caso a partir dos pilotos, se autorizados pelos clientes e com resultados efetivamente medidos.',
    milestone: 'Referências locais (objetivo)'
  },
  {
    station: 'ESTAÇÃO 05',
    name: 'Expansão Comercial',
    jp: '全国展開・多拠点拡大',
    location: 'Osaka & Kansai',
    detail: 'Crescimento via modelo Land & Expand do Start para Business e Enterprise.',
    milestone: 'Escala nacional (projeção)'
  },
  {
    station: 'ESTAÇÃO 06',
    name: 'Avaliar subsidiária própria (hipótese futura)',
    jp: '現地法人（株式会社）設立の検討 — 将来の仮説',
    location: 'Decisão futura, condicionada à validação',
    detail: 'Avaliar a viabilidade de uma subsidiária japonesa (Kabushiki Kaisha) somente depois de pilotos validados, carteira de clientes e referências locais. Não existe entidade japonesa constituída.',
    milestone: 'Decisão sobre presença permanente (hipótese)',
    isFinal: true
  }
];

export const RoadmapSection: React.FC = () => {
  const { sceneIndex, setSceneIndex, nextStep } = usePresentation();
  // Cena 1: os 5 canais • Cenas 2 a 7: estações 01 a 06 (origem + 5 fases), em sequência
  const scene = Math.min(METRO_STATIONS.length, Math.max(0, sceneIndex));
  const selectedStationIdx = Math.max(0, scene - 1);

  const activeStation = METRO_STATIONS[selectedStationIdx] || METRO_STATIONS[0];

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-6 md:px-14 pt-6 pb-6 overflow-y-auto select-none">
      {/* Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/10 pb-3.5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-[10px] font-mono font-bold tracking-[0.2em] text-amber-300 uppercase">
              R3 • PRAÇA
            </span>
            <span className="text-[11px] font-mono text-slate-400 tracking-widest">
              TELA 10 / 15 • CANAIS &amp; LINHA DE EXPANSÃO
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
            COMO CHEGAMOS <span className="text-red-500">AO CLIENTE?</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSceneIndex(0)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-mono uppercase transition-all cursor-pointer ${
              scene === 0
                ? 'bg-red-600 border-red-400 text-white font-bold'
                : 'bg-slate-900/80 border-white/15 text-slate-300'
            }`}
          >
            Parte 1: 5 Canais
          </button>
          <button
            onClick={() => setSceneIndex(1)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-mono uppercase transition-all cursor-pointer ${
              scene >= 1
                ? 'bg-red-600 border-red-400 text-white font-bold'
                : 'bg-slate-900/80 border-white/15 text-slate-300'
            }`}
          >
            Parte 2: Linha Metroviária (6 Estações)
          </button>
        </div>
      </div>

      {/* 5 Distribution Channels Pill Grid */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-5 gap-3 my-2">
        {CHANNELS.map((ch) => (
          <div
            key={ch.code}
            onClick={() => setSceneIndex(0)}
            className={`p-3.5 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${
              scene === 0
                ? 'bg-slate-900/95 border-red-500/45 shadow-lg'
                : 'bg-slate-900/75 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold text-red-400">{ch.code}</span>
              <div className="p-1.5 rounded-lg bg-white/5 text-slate-200">{ch.icon}</div>
            </div>
            <div className="text-xs md:text-sm font-black text-white mb-0.5">{ch.title}</div>
            <div className="text-[10px] font-serif text-amber-300/80 mb-1">{ch.jp}</div>
            <p className="text-[11px] text-slate-300 leading-snug">{ch.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Interactive Stage: The Metro Line Expansion (6 Stations) */}
      <div className="relative z-10 flex-1 rounded-3xl bg-slate-950/95 border border-white/15 p-5 md:p-6 flex flex-col justify-between shadow-2xl my-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Train className="w-4 h-4 text-red-400" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-slate-300 font-bold">
              LINHA DE EXPANSÃO METROVIÁRIA • 絆 TRAIN ROUTE
            </span>
          </div>
          <span className="text-xs font-mono text-amber-300">
            {scene === 0 ? (
              'Origem + 5 fases • avance para percorrer a linha'
            ) : (
              <>
                Estação Ativa: <strong>{activeStation.name}</strong> ({activeStation.location})
              </>
            )}
          </span>
        </div>
        <p className="pt-2 text-[10px] font-mono text-slate-500 leading-snug">
          Roteiro de entrada = hipótese estratégica do projeto acadêmico. Parcerias, pilotos e subsidiária ainda não existem.
        </p>

        {/* Metro Track Visual Bar */}
        <div className="relative my-6 px-2">
          {/* Continuous Glowing Rail */}
          <div className="absolute top-1/2 left-6 right-6 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 -translate-y-1/2 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]" />

          {/* 6 Stations */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-6 gap-3">
            {METRO_STATIONS.map((st, idx) => {
              const isSelected = selectedStationIdx === idx;
              return (
                <button
                  key={st.station}
                  onClick={() => setSceneIndex(idx + 1)}
                  className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? st.isFinal
                        ? 'bg-amber-950/70 border-amber-300 shadow-[0_0_30px_rgba(212,175,55,0.4)] scale-105'
                        : 'bg-red-950/70 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)] scale-105'
                      : scene >= 1 && idx < selectedStationIdx
                      ? 'bg-slate-900/90 border-red-500/40 hover:border-red-400/60'
                      : 'bg-slate-900/90 border-white/15 hover:border-white/30'
                  }`}
                >
                  {/* Station Node Badge */}
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold mb-2 ${
                      isSelected
                        ? st.isFinal
                          ? 'border-amber-300 bg-amber-500 text-slate-950'
                          : 'border-red-300 bg-red-600 text-white'
                        : 'border-white/30 bg-slate-800 text-slate-300'
                    }`}
                  >
                    0{idx + 1}
                  </div>
                  <div className="text-xs font-black text-white">{st.name}</div>
                  <div className="text-[10px] font-serif text-amber-200/90 line-clamp-1 mt-0.5">
                    {st.jp}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 mt-1 line-clamp-1">
                    {st.location}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Station Deep-Dive Drawer */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-red-600/30 border border-red-400/50 text-[10px] font-mono text-red-300">
                {activeStation.station}
              </span>
              <span className="text-sm font-bold text-white">{activeStation.name}</span>
              <span className="text-xs font-serif text-amber-300">({activeStation.jp})</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {activeStation.detail}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-slate-400">Marco Estratégico</div>
              <div className="text-xs font-mono font-bold text-amber-300">{activeStation.milestone}</div>
            </div>
            <button
              onClick={nextStep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer"
            >
              <span>
                {scene === 0
                  ? 'Percorrer a linha de entrada'
                  : scene < METRO_STATIONS.length
                  ? 'Próxima estação'
                  : 'Avançar'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RoadmapSection;
