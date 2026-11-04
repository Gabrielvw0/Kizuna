import React from 'react';
import { usePresentation } from '../core/PresentationContext';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';

export const IntroSection: React.FC = () => {
  const { sceneIndex, setSceneIndex, nextStep, stageMode } = usePresentation();
  const scene = Math.min(3, Math.max(0, sceneIndex));

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-6 sm:px-12 py-6 max-w-7xl mx-auto overflow-hidden select-none">
      {/* Header Info / Story Beat Indicator */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-red-500 font-bold">
            01 / 15 • ESPAÇO &amp; ORIGEM • 赤い糸
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
            DO PLANETA AO DESTINO.
          </h1>
          <h3 className="text-xs sm:text-sm font-mono text-slate-300 mt-0.5">
            O fio vermelho parte do Brasil, conecta o ecossistema global e converge no Japão.
          </h3>
        </div>

        {!stageMode && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { idx: 0, label: '1. O PLANETA' },
              { idx: 1, label: '2. BRASIL (ORIGEM)' },
              { idx: 2, label: '3. TRAVESSIA' },
              { idx: 3, label: '4. TÓQUIO (絆)' }
            ].map((s) => (
              <button
                key={s.idx}
                onClick={() => setSceneIndex(s.idx)}
                className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                  scene === s.idx
                    ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center Cinematic Stage: Text Anchors reacting to the 3D Flight */}
      <div
        onClick={nextStep}
        className="relative z-10 my-auto flex flex-col items-center justify-center text-center py-6 cursor-pointer"
      >
        {scene === 0 && (
          <div className="max-w-2xl px-6 py-6 rounded-3xl bg-slate-950/40 backdrop-blur-sm border border-white/10 animate-fadeIn">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-[0.25em] text-slate-300 mb-3 inline-block">
              PERSPECTIVA GLOBAL
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              TECNOLOGIA EM ESCALA MUNDIAL.
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed font-light">
              Uma presença global que conecta talentos, inovação e arquitetura digital em múltiplos continentes.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
              <Compass className="w-3.5 h-3.5 text-red-400 animate-spin" />
              <span>Clique ou deslize a mão para aproximar do ponto de origem</span>
            </div>
          </div>
        )}

        {scene === 1 && (
          <div className="max-w-xl px-6 py-6 rounded-3xl bg-slate-950/60 backdrop-blur-md border border-amber-500/30 animate-fadeIn text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-[10px] font-mono font-bold text-amber-300">
                PONTO DE PARTIDA • BRASIL
              </span>
              <span className="text-[10px] font-mono text-slate-400">1908 • Kasato Maru</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              O VÍNCULO HISTÓRICO.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              O Brasil abriga a maior comunidade japonesa fora do Japão (2,0M+ descendentes). A história que começou em 1908 agora se transforma em conexão tecnológica e confiança empresarial.
            </p>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-amber-300 font-bold">
              <span>赤い糸 • O fio vermelho nasce no Brasil</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {scene === 2 && (
          <div className="max-w-xl px-6 py-6 rounded-3xl bg-slate-950/60 backdrop-blur-md border border-red-500/40 animate-fadeIn text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded bg-red-600/20 text-[10px] font-mono font-bold text-red-300">
                TRAVESSIA GLOBAL
              </span>
              <span className="text-[10px] font-mono text-slate-400">Mundo → Ásia</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              RUMO AO ARQUIPÉLAGO.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              O fio orbital cruza as Américas, Europa e Ásia, alinhando a capacidade internacional da Globant ao destino de maior rigor e valor agregado do planeta: o mercado japonês.
            </p>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-red-400 font-bold">
              <span>Convergência em Tóquio (東京)</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {scene === 3 && (
          <div className="flex flex-col items-center text-center animate-fadeIn">
            <div className="relative mb-2">
              <div className="text-7xl sm:text-9xl font-serif text-red-500 drop-shadow-[0_0_40px_rgba(225,29,72,0.7)] select-none">
                絆
              </div>
              <div className="absolute -bottom-2 -right-4 w-9 h-9 rounded-md border-2 border-red-500 bg-red-950/90 flex items-center justify-center text-[10px] font-serif text-red-300 rotate-6 shadow-xl">
                絆印
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-[0.25em] text-white">
              KIZUNA
            </h1>
            <div className="text-xs sm:text-sm font-serif tracking-[0.3em] text-slate-400 mt-1 mb-4">
              絆統合基幹業務システム
            </div>

            <div className="px-5 py-2 rounded-2xl bg-slate-950/80 border border-red-500/40 shadow-[0_0_25px_rgba(220,38,38,0.25)]">
              <div className="text-base sm:text-xl font-mono font-bold tracking-[0.22em] text-white">
                GLOBAL REACH. LOCAL TRUST.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Strip */}
      {!stageMode && (
        <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            {scene < 3 ? `Momento ${scene + 1} de 4 • Viagem orbital contínua` : 'Origem concluída • Próximo: Por que o Japão?'}
          </span>
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shadow-lg"
          >
            <span>{scene < 3 ? 'Avançar Ponto' : 'TELA 02 | POR QUE O JAPÃO?'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
export default IntroSection;
