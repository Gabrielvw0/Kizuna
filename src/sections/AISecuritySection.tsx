import React from 'react';
import { Bot, Lock, CheckCircle2, PlayCircle, Database, Stamp, Undo2 } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { ScreenTitle, InfoTag } from '../components/strategic/ScreenTitle';

/**
 * Tela 07 • Confiança e aprovação humana.
 * Cena 1: a proposta para no portão fechado. Cena 2: a decisão humana.
 * O portão (inclusive o 3D) só abre pelo clique explícito no Hanko; navegar nunca aprova.
 */
export const AISecuritySection: React.FC = () => {
  const { sceneIndex, gateApproved, approveGate, revokeGate, setSceneIndex } = usePresentation();
  const scene = Math.min(1, Math.max(0, sceneIndex));
  const decision = scene === 1;
  const open = decision && gateApproved;

  const handleHanko = () => {
    setSceneIndex(1);
    approveGate();
  };

  const step = (active: boolean) =>
    `p-5 rounded-2xl border flex flex-col gap-2 transition-all duration-500 ${
      active ? 'bg-slate-900/95 border-white/25' : 'bg-slate-950/60 border-white/10 opacity-40'
    }`;

  return (
    <div className="relative w-full h-full flex flex-col justify-center gap-5 px-6 md:px-14 py-4 max-w-6xl mx-auto overflow-y-auto select-none">
      <ScreenTitle
        kicker="07 • Confiança • 守"
        title={
          <>
            A IA propõe. <span className="text-rose-500">O humano valida.</span>{' '}
            <span className="text-emerald-400">O sistema registra.</span>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={step(true)}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">1 • PROPOSTA</span>
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-sm text-white">“Realocar 2 pessoas da equipe de Atendimento para o projeto em atraso.”</p>
          <InfoTag kind="demo" />
        </div>

        <div
          className={`p-5 rounded-2xl border-2 flex flex-col gap-2 transition-all duration-500 ${
            open ? 'bg-emerald-950/40 border-emerald-500/80' : 'bg-rose-950/80 border-rose-500 shadow-[0_0_35px_rgba(220,38,38,0.4)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-rose-300">2 • PORTÃO 承認門</span>
            {open ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-rose-400" />}
          </div>
          <div className="text-base font-black text-white">{open ? 'Aprovado pelo responsável' : 'Fechado'}</div>
          <p className="text-xs text-slate-200">
            {open ? 'O carimbo (Hanko) registrou quem decidiu.' : 'Nada é executado sem o aval formal de um responsável.'}
          </p>
          <div
            className={`self-end w-10 h-10 rounded-md border-2 flex items-center justify-center font-serif text-[11px] transition-all duration-300 ${
              open ? 'border-rose-400 bg-rose-600 text-white rotate-6 scale-110' : 'border-white/20 bg-white/5 text-slate-500'
            }`}
          >
            承認
          </div>
        </div>

        <div className={step(open)}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">3 • EXECUÇÃO</span>
            <PlayCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-sm text-white">{open ? 'Mudança aplicada.' : 'Aguardando aprovação.'}</p>
        </div>

        <div className={step(open)}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">4 • REGISTRO</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs font-mono text-emerald-300">
            {open ? 'Quem aprovou, quando e o quê ficam na trilha de auditoria.' : 'Nada a registrar ainda.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/85 border border-white/15">
        <p className="text-sm text-slate-200">
          {!decision
            ? 'Avançar leva à decisão — mas avançar não aprova.'
            : open
            ? 'Execução autorizada e registrada.'
            : 'A decisão é do responsável: só o clique no Hanko abre o portão.'}
          <span className="block text-[11px] text-slate-400 mt-0.5">
            IA assistiva e fluxo de aprovação: recursos propostos do Kizuna Business. No Start, o registro já vale: toda mudança em atividades entra no histórico.
          </span>
        </p>
        {decision &&
          (open ? (
            <button
              onClick={revokeGate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono"
            >
              <Undo2 className="w-4 h-4" /> Desfazer aprovação
            </button>
          ) : (
            <button
              onClick={handleHanko}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-sm font-mono font-bold border border-rose-300 shadow-[0_0_20px_rgba(225,29,72,0.4)]"
            >
              <Stamp className="w-4 h-4 text-amber-200" /> Aprovar com Hanko (押印)
            </button>
          ))}
      </div>
    </div>
  );
};
export default AISecuritySection;
