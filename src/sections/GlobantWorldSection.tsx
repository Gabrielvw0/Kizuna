import React from 'react';
import { usePresentation } from '../core/PresentationContext';
import { MapPin, ArrowRight, CheckCircle2, Anchor, Building2, TrendingUp, Users } from 'lucide-react';

interface VerifiedJapanDatum {
  number: string;
  description: string;
  source: string;
  year: string;
  cityTag: string;
}

const VERIFIED_JAPAN_DATA: VerifiedJapanDatum[] = [
  {
    number: '99,7%',
    description: 'Das empresas no Japão são PMEs (~3,36 milhões de empresas ativas)',
    source: 'METI — White Paper on Small and Medium Enterprises',
    year: '2023 / 2024',
    cityTag: 'TOKYO • KANTO'
  },
  {
    number: '¥12 Tri / ano',
    description: 'Risco estimado de perda anual (“Digital Cliff”) por sistemas legados obsoletos',
    source: 'METI — DX Report (Digital Cliff Warning)',
    year: '2018–2025',
    cityTag: 'OSAKA • KANSAI'
  },
  {
    number: '86%',
    description: 'Das empresas japonesas relatam escassez crítica de engenheiros e talentos de TI',
    source: 'MIC / METI IT Talent Supply Survey',
    year: '2024',
    cityTag: 'NAGOYA • CHUBU'
  },
  {
    number: 'US$ 4,2 Tri',
    description: '4ª maior economia mundial com alta densidade tecnológica e demanda por governança',
    source: 'IMF World Economic Outlook / Cabinet Office',
    year: '2024',
    cityTag: 'GLOBAL VALUE HUB'
  }
];

const OPPORTUNITY_PILLARS = [
  'Mercado tecnológico maduro e altamente estruturado',
  'Alta exigência corporativa por confiabilidade e governança',
  'Pressão governamental urgente por modernização (DX)',
  'Abertura a parceiros globais com respeito cultural comprovado'
];

export const GlobantWorldSection: React.FC = () => {
  const { sceneIndex, setSceneIndex, nextStep, stageMode } = usePresentation();
  const scene = Math.min(2, Math.max(0, sceneIndex));

  return (
    <div className="w-full h-full flex flex-col justify-between px-6 sm:px-12 py-6 max-w-7xl mx-auto overflow-y-auto select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-rose-500">
            <MapPin className="w-3.5 h-3.5" />
            <span>TELA 02 / 15 • JAPÃO</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            POR QUE O JAPÃO?
          </h1>
          <h3 className="text-sm sm:text-lg text-rose-300 font-light mt-0.5">
            Um mercado que exige contexto, escala e compromisso de longo prazo.
          </h3>
        </div>

        {!stageMode && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { idx: 0, label: '01 DADOS COMPROVADOS' },
              { idx: 1, label: '02 OPORTUNIDADE DX' },
              { idx: 2, label: '03 PONTE BRASIL–JAPÃO (1908)' }
            ].map((s) => (
              <button
                key={s.idx}
                onClick={() => setSceneIndex(s.idx)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                  scene === s.idx
                    ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                    : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto py-4">
        {/* LEFT (5 cols): TOKYO, OSAKA & NAGOYA TRIAD OVERLAY */}
        <div
          onClick={nextStep}
          className="lg:col-span-5 bg-[#080C15]/75 backdrop-blur-md border border-white/15 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden cursor-pointer shadow-2xl"
        >
          <div className="w-full flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3">
            <span>SKYLINE CORPORATIVO</span>
            <span className="text-rose-400 font-bold">東京 • 名古屋 • 大阪</span>
          </div>

          <div className="space-y-3 my-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-red-500/40 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-red-400">TOKYO (東京) • SEDE CORPORATIVA</div>
                <div className="text-sm font-black text-white mt-0.5">Centro Financeiro &amp; Marunouchi</div>
                <div className="text-[11px] text-slate-300">Decisão estratégica e presença direta da Globant</div>
              </div>
              <span className="text-lg font-serif text-red-300 font-bold">東</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-400/40 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-amber-300">NAGOYA (名古屋) • INDÚSTRIA &amp; OPERAÇÕES</div>
                <div className="text-sm font-black text-white mt-0.5">Hub Industrial do Chubu</div>
                <div className="text-[11px] text-slate-300">Cadeia produtiva e rigor operacional de manufatura</div>
              </div>
              <span className="text-lg font-serif text-amber-300 font-bold">名</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-400/40 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-cyan-300">OSAKA (大阪) • POLO COMERCIAL DO KANSAI</div>
                <div className="text-sm font-black text-white mt-0.5">Dinamismo Comercial &amp; PMEs</div>
                <div className="text-[11px] text-slate-300">Grande densidade de empresas comerciais ativas</div>
              </div>
              <span className="text-lg font-serif text-cyan-300 font-bold">阪</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>A cidade 3D reage à aproximação da câmera</span>
            <span className="text-rose-400 font-bold">Triângulo Econômico</span>
          </div>
        </div>

        {/* RIGHT (7 cols): 4 VERIFIED DATA LANTERNS + OPPORTUNITY + HISTORIC BRIDGE */}
        <div className="lg:col-span-7 space-y-4">
          {/* 4 Verified Data Lanterns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {VERIFIED_JAPAN_DATA.map((item) => (
              <div
                key={item.number}
                onClick={nextStep}
                className="p-4 rounded-2xl bg-[#0B101C]/90 backdrop-blur-md border border-rose-500/35 hover:border-rose-500 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.6)] cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-rose-400 mb-1">
                    <span>{item.cityTag}</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-amber-300 border border-amber-400/30">
                      {item.year}
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-white">
                    {item.number}
                  </div>
                  <p className="text-xs text-slate-200 mt-1.5 leading-snug">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-mono text-slate-400">
                  Fonte: <span className="text-slate-300">{item.source}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Oportunidade DX */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              scene === 1
                ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_25px_rgba(225,29,72,0.25)]'
                : 'bg-[#090D16]/90 border-white/15'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.28em] text-rose-400 font-bold mb-2.5">
              <Building2 className="w-4 h-4" />
              <span>A OPORTUNIDADE ESTRATÉGICA</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {OPPORTUNITY_PILLARS.map((pillar) => (
                <div
                  key={pillar}
                  className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2 text-xs font-semibold text-white"
                >
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{pillar}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ponte Histórica Brasil-Japão (1908 • Kasato Maru) */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              scene === 2
                ? 'bg-amber-950/35 border-amber-400/70 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                : 'bg-[#090D16]/85 border-white/10'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Anchor className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-mono font-bold tracking-widest text-amber-300">
                  1908 • KASATO MARU • BRASIL ↔ JAPÃO
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Fonte: MOFA Japan / Museu da Imigração SP
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white font-medium mt-1.5">
              “O Brasil abriga a maior comunidade japonesa fora do Japão (2,0M+ descendentes). A história que começou no mar agora se consolida como ponte de confiança tecnológica.”
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      {!stageMode ? (
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            METI DX Report • 99,7% PMEs • Escassez de TI • Kasato Maru (1908)
          </span>
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shadow-lg"
          >
            <span>{scene < 2 ? `PRÓXIMA ETAPA (${scene + 2}/3)` : 'TELA 03 | R1 • CHOQUE CULTURAL'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};
export default GlobantWorldSection;
