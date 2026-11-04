import React, { useState } from 'react';
import {
  Users,
  Megaphone,
  MonitorPlay,
  Award,
  ArrowRight,
  CheckCircle2,
  Building,
  Globe,
  Radio,
  FileCode,
  Handshake,
  Layers
} from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import metricsData from '../data/metrics.json';

// Meta proposta de pilotos (3–5 empresas): fonte única em metrics.json
const PILOT_TARGET = metricsData.phases.find((p) => p.id === 'm3_6')!.targetNumber;

const SLOGAN_WORDS = [
  { word: 'GLOBAL', sub: 'Escala & Engenharia' },
  { word: 'REACH.', sub: 'Presença Internacional' },
  { word: 'LOCAL', sub: 'Contexto & Idioma' },
  { word: 'TRUST.', sub: 'Vínculo Duradouro (絆)' }
];

const SEVEN_CHANNELS = [
  { id: 1, name: 'Eventos Executivos', jp: 'エグゼクティブ・フォーラム', tag: 'C-Level & Meishi' },
  { id: 2, name: 'Casos de Referência', jp: '導入事例（パイロット後）', tag: 'Prova Social (pós-piloto)' },
  { id: 3, name: 'Parcerias Estratégicas', jp: 'SIer・コンサルとの提携検討', tag: 'Distribuição Local' },
  { id: 4, name: 'Conteúdo Técnico', jp: '技術ホワイトペーパー', tag: 'Segurança & APPI' },
  { id: 5, name: 'Demonstrações Guiadas', jp: '対話型ライブデモ', tag: 'Experiência Kizuna' },
  { id: 6, name: 'Prova de Conceito (PoC)', jp: '30日間実証導入', tag: 'Adoção com risco reduzido' },
  { id: 7, name: 'Presença Local (futura)', jp: '現地拠点（将来の選択肢）', tag: 'Hipótese futura' }
];

const FUNNEL_STAGES = [
  { stage: 'LEAD', jp: '見込み客', metric: '100+', desc: 'Contatos qualificados em feiras, webinars e busca B2B.' },
  { stage: 'PILOT', jp: '実証パイロット', metric: PILOT_TARGET, desc: 'Equipes testando o Kizuna Start por 30 dias em ambiente real.' },
  { stage: 'CUSTOMER', jp: '正規顧客化', metric: 'A definir', desc: 'Conversão dos pilotos em contratos pagos (Business/Enterprise): meta a definir após os pilotos.' }
];

export const MarketingMixSection: React.FC = () => {
  const { sceneIndex, setSceneIndex, nextStep } = usePresentation();
  const [selectedChannel, setSelectedChannel] = useState<number>(1);
  // Cena 1: mensagem e público-alvo • Cena 2: os 7 canais • Cena 3: funil e prova social
  const scene = Math.min(2, Math.max(0, sceneIndex));

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-6 md:px-14 pt-6 pb-6 overflow-y-auto select-none">
      {/* Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/10 pb-3.5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-[10px] font-mono font-bold tracking-[0.2em] text-amber-300 uppercase">
              R4 • PROMOÇÃO
            </span>
            <span className="text-[11px] font-mono text-slate-400 tracking-widest">
              TELA 11 / 15 • COMUNICAÇÃO &amp; TRANSMISSÃO DE CONFIANÇA
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
            A CIDADE REAGE <span className="text-red-500">À CAMPANHA.</span>
          </h1>
        </div>

        {/* Official Slogan Bar: GLOBAL REACH. LOCAL TRUST. */}
        <div className={`grid grid-cols-4 gap-1.5 bg-slate-950/90 p-1.5 rounded-2xl border border-red-500/40 transition-all duration-500 ${scene === 0 ? 'ring-2 ring-red-400/70 shadow-[0_0_25px_rgba(239,68,68,0.35)]' : 'opacity-70'}`}>
          {SLOGAN_WORDS.map((item, idx) => (
            <div
              key={item.word}
              className={`px-3 py-1.5 rounded-xl text-center ${
                idx >= 2 ? 'bg-red-600/25 border border-red-500/50' : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className="text-xs md:text-sm font-black tracking-wider text-white font-mono">
                {item.word}
              </div>
              <div className="text-[9px] font-mono text-slate-300 hidden sm:block">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: 7 Acquisition Channels + Live Transmission Funnel */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch my-auto py-2">
        {/* Left 7 Cols: The 7 Broadcasting Channels */}
        <div className={`lg:col-span-7 rounded-3xl bg-slate-950/95 border border-white/15 p-5 flex flex-col justify-between shadow-2xl transition-opacity duration-500 ${scene === 1 ? '' : 'opacity-60'}`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-400 font-bold flex items-center gap-2">
              <Radio className="w-3.5 h-3.5" /> 7 CANAIS DE TRANSMISSÃO CONCÊNTRICA
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Ondas irradiadas sobre o ecossistema corporativo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-auto py-2">
            {SEVEN_CHANNELS.map((ch) => {
              const active = selectedChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    setSelectedChannel(ch.id);
                    setSceneIndex(1);
                  }}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    active
                      ? 'bg-gradient-to-r from-red-950/70 to-slate-900 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                      : 'bg-slate-900/80 border-white/10 hover:border-white/25'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-mono text-red-400 font-bold">0{ch.id}</span>
                      <span className="text-xs font-bold text-white">{ch.name}</span>
                    </div>
                    <div className="text-[10px] font-serif text-amber-200/90">{ch.jp}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/5 text-slate-300 border border-white/10">
                    {ch.tag}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-slate-400 border-t border-white/10 pt-2 flex items-center justify-between gap-3">
            {scene === 0 ? (
              <span>
                Público-alvo:{' '}
                <strong className="text-white">
                  Gestores, líderes de equipes, PMEs, empresas em crescimento e executivos de tecnologia
                </strong>
              </span>
            ) : scene === 1 ? (
              <>
                <span>Mensagem central unificada:</span>
                <strong className="text-white">GLOBAL REACH. LOCAL TRUST.</strong>
              </>
            ) : (
              <span>
                Prova social (depois dos pilotos):{' '}
                <strong className="text-white">pilotos • cases • clientes de referência • parceiros locais</strong>
              </span>
            )}
          </div>
        </div>

        {/* Right 5 Cols: The Conversion Funnel: LEAD -> PILOT -> CUSTOMER */}
        <div className={`lg:col-span-5 rounded-3xl bg-slate-950/95 border border-red-500/30 p-5 flex flex-col justify-between shadow-2xl transition-opacity duration-500 ${scene === 2 ? '' : 'opacity-60'}`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300 font-bold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> FUNIL DE RECONHECIMENTO &amp; ADOÇÃO
            </span>
            <span className="text-[10px] font-mono text-amber-300">Projeção ilustrativa</span>
          </div>

          <div className="space-y-3 my-auto py-2">
            {FUNNEL_STAGES.map((fn, idx) => (
              <div
                key={fn.stage}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                      idx === 2
                        ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : idx === 1
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    0{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{fn.stage}</span>
                      <span className="text-xs font-serif text-amber-300">({fn.jp})</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug mt-0.5">{fn.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-lg font-black font-mono text-white">{fn.metric}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Validação prática de confiança</span>
            <button
              onClick={nextStep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer"
            >
              <span>{scene === 0 ? 'Ver os 7 canais' : scene === 1 ? 'Ver o funil de adoção' : 'Avançar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MarketingMixSection;
