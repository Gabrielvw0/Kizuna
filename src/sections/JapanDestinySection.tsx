import React from 'react';
import { usePresentation } from '../core/PresentationContext';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface CulturalDoor {
  id: number;
  code: string;
  kanji: string;
  title: string;
  items: string[];
  problem: string;
  consequence: string;
}

const FOUR_DOORS: CulturalDoor[] = [
  {
    id: 0,
    code: '01',
    kanji: '文化',
    title: 'CULTURA',
    items: ['Hierarquia explícita', 'Formalidade', 'Consenso coletivo', 'Relacionamento de longo prazo'],
    problem: 'Sistemas de estrutura horizontal podem não refletir as alçadas formais de aprovação e gerar insegurança.',
    consequence: 'O produto precisa refletir papéis claros: 経営 (Direção) → 管理職 (Gerência) → チーム (Equipe) → 個人 (Indivíduo).'
  },
  {
    id: 1,
    code: '02',
    kanji: '言語',
    title: 'IDIOMA',
    items: ['Japonês nativo', 'Etiqueta corporativa (Keigo)', 'Documentação precisa', 'Suporte local'],
    problem: 'Tradução literal pode desrespeitar a hierarquia comunicativa e reduzir a percepção de seriedade.',
    consequence: 'Interface, termos de status e notificações devem seguir Keigo corporativo sem jargões soltos.'
  },
  {
    id: 2,
    code: '03',
    kanji: '商習慣',
    title: 'HÁBITOS EMPRESARIAIS',
    items: ['Alinhamento prévio (Nemawashi)', 'Aprovação formal (Ringi)', 'Carimbo digital (Hanko)', 'Previsibilidade'],
    problem: 'Tentar fechar contratos ou impor adoção de software por decisão individual isolada tende a gerar rejeição.',
    consequence: 'O software precisa incorporar fluxos nativos de Nemawashi (根回し) e carimbos formais de Ringi (稟議).'
  },
  {
    id: 3,
    code: '04',
    kanji: '規制',
    title: 'REGULAÇÃO',
    items: ['Proteção de dados', 'Documentos eletrônicos', 'Fiscalidade', 'Segurança da informação'],
    problem: 'Confundir exigências fiscais/legais do Japão com normas técnicas pode dificultar a homologação corporativa.',
    consequence: 'Separação estrita entre Legislação obrigatória e Certificações internacionais de segurança.'
  }
];

export const JapanDestinySection: React.FC = () => {
  const { sceneIndex, setSceneIndex, nextStep, stageMode } = usePresentation();
  const scene = Math.min(4, Math.max(0, sceneIndex));

  const activeDoor = FOUR_DOORS[Math.min(3, scene)];

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-6 sm:px-12 py-6 max-w-7xl mx-auto overflow-y-auto select-none">
      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded bg-red-600/25 border border-red-500/60 text-[11px] font-mono font-bold tracking-[0.2em] text-red-200">
              R1 • CHOQUE CULTURAL
            </span>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-slate-400">
              TELA 03 / 15
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1.5">
            O JAPÃO NÃO É APENAS OUTRO MERCADO.
          </h1>
          <h3 className="text-xs sm:text-sm font-mono text-red-300">
            A câmera adentra o ambiente corporativo japonês: selecione cada portal para ver a resposta.
          </h3>
        </div>

        {/* 4 Portals + Convergência Tabs */}
        {!stageMode && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { idx: 0, kanji: '文化', label: 'CULTURA' },
              { idx: 1, kanji: '言語', label: 'IDIOMA' },
              { idx: 2, kanji: '商習慣', label: 'HÁBITOS' },
              { idx: 3, kanji: '規制', label: 'REGULAÇÃO' },
              { idx: 4, kanji: '統合', label: 'CONVERGÊNCIA' }
            ].map((tab) => (
              <button
                key={tab.idx}
                onClick={() => setSceneIndex(tab.idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  scene === tab.idx
                    ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-sm font-serif">{tab.kanji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Interactive Stage: The 4 Floating Portals & Dynamic Spatial State */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-auto py-3">
        {/* Left 4 Cols: 4 Floating Elements in Environment */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-2.5">
          <div className="grid grid-cols-2 gap-2.5 flex-1">
            {FOUR_DOORS.map((door) => {
              const isActive = scene === door.id;
              return (
                <button
                  key={door.id}
                  onClick={() => setSceneIndex(door.id)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-gradient-to-br from-red-950/70 to-slate-900 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.3)]'
                      : 'bg-slate-900/75 border-white/10 hover:border-white/25 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl sm:text-3xl font-serif text-white">{door.kanji}</span>
                    <span className="text-[10px] font-mono text-red-400 font-bold">{door.code}</span>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-white">{door.title}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1 line-clamp-1">
                      {door.items[0]} • {door.items[1]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setSceneIndex(4)}
            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
              scene === 4
                ? 'bg-red-600 border-red-400 text-white font-bold shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/30'
            }`}
          >
            <span className="text-xs font-mono uppercase tracking-widest font-bold">
              統合 • 05 CONVERGÊNCIA DAS 4 PORTAS
            </span>
          </button>
        </div>

        {/* Right 7 Cols: The Spatial Reaction of the Corporate Environment */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          {scene < 4 ? (
            <div className="p-6 rounded-3xl bg-slate-950/90 border border-red-500/30 flex-1 flex flex-col justify-between shadow-2xl animate-fadeIn">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-serif text-red-500">{activeDoor.kanji}</span>
                    <div>
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest block">
                        PORTA DE ENTRADA {activeDoor.code}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white">{activeDoor.title}</h2>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    4 pilares fundamentais
                  </span>
                </div>

                {/* Cultural Hierarchy Visualisation for Door 01 */}
                {scene === 0 && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold">
                      HIERARQUIA VISUAL CORPORATIVA (経営 → 個人)
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 font-bold">
                        1. 経営<br /><span className="text-[9px] font-normal text-slate-300">Direção</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold">
                        2. 管理職<br /><span className="text-[9px] font-normal text-slate-300">Gerência</span>
                      </div>
                      <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-200 font-bold">
                        3. チーム<br /><span className="text-[9px] font-normal text-slate-300">Equipe</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold">
                        4. 個人<br /><span className="text-[9px] font-normal text-slate-400">Indivíduo</span>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-red-400 text-center">
                      赤い糸 • O fio vermelho conecta a decisão da direção à rotina do indivíduo.
                    </div>
                  </div>
                )}

                {/* Regulation Distinction for Door 04 */}
                {scene === 3 && (
                  <div className="mb-4 grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-red-300 font-bold mb-1">
                        LEGISLAÇÃO (OBRIGATÓRIO)
                      </div>
                      <div className="text-xs text-white font-mono space-y-0.5">
                        <div>• APPI (Dados pessoais)</div>
                        <div>• Elec. Books Preserv. Act</div>
                        <div>• Qualified Invoice System</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-950/25 border border-amber-400/40">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold mb-1">
                        PADRÕES / CERTIFICAÇÕES
                      </div>
                      <div className="text-xs text-white font-mono space-y-0.5">
                        <div>• ISO/IEC 27001</div>
                        <div>• JIS Q 27001 (Padrão Japão)</div>
                        <div>• Auditabilidade contínua</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Problem vs Consequence Matrix */}
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold block mb-1">
                      O PROBLEMA DE MERCADO:
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                      {activeDoor.problem}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                      CONSEQUÊNCIA DIRETA PARA O KIZUNA:
                    </span>
                    <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                      {activeDoor.consequence}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Porta {scene + 1} de 4 • Clique para avançar
                </span>
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase font-bold tracking-wider transition-all cursor-pointer"
                >
                  <span>{scene < 3 ? 'Próxima Porta' : 'Ver Convergência'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Scene 4: Convergência das 4 Portas */
            <div className="p-6 rounded-3xl bg-slate-950/95 border border-red-500/50 flex-1 flex flex-col justify-between shadow-2xl animate-fadeIn">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-red-600/20 text-[10px] font-mono font-bold text-red-300 uppercase tracking-widest">
                  CONVERGÊNCIA DAS 4 DIMENSÕES
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 mb-3">
                  O PRODUTO NÃO É APENAS TRADUZIDO: ELE É INTEGRADO.
                </h2>
                <div className="grid grid-cols-2 gap-2.5 my-3">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-200">Hierarquia &amp; papéis claros</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-200">Keigo nativo &amp; documentação</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-200">Nemawashi (根回し) &amp; Ringi (稟議)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-200">APPI + ISO 27001 (JIS Q 27001)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-amber-300 font-bold">
                  Próximo: A colisão entre capacidade Global e contexto Local
                </span>
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase font-bold tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  <span>TELA 04 | GLOBAL × LOCAL</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default JapanDestinySection;
