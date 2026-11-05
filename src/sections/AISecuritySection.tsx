import React from 'react';
import { Bot, Lock, CheckCircle2, PlayCircle, Database, Stamp, Undo2, ArrowRight } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { Kicker, DisplayTitle, Classification } from '../components/strategic/Editorial';

/**
 * Tela 07 • Confiança e aprovação humana — tríptico em volta do portão 3D.
 * Esquerda (fora do portão): a proposta. Centro (dentro do portão): a decisão humana.
 * Direita (depois do portão): execução e registro.
 * Cena 1: a proposta para no portão fechado. Cena 2: a decisão humana.
 * O portão (inclusive o 3D) só abre pelo clique explícito no Hanko; navegar nunca aprova.
 */
export const AISecuritySection: React.FC = () => {
  const { sceneIndex, gateApproved, approveGate, revokeGate, setSceneIndex } = usePresentation();
  const scene = Math.min(1, Math.max(0, sceneIndex));
  const decision = scene === 1;
  const open = decision && gateApproved;

  // Só o clique com o ponteiro aprova. Enter/Espaço num botão em foco geram um "click" com
  // detail === 0 — esse é ignorado, para que nenhuma tecla aprove o Hanko.
  const handleHanko = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.detail === 0) return;
    setSceneIndex(1);
    approveGate();
  };

  const after = `transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-35'}`;

  return (
    <div className="relative w-full h-full select-none">
      <div className="relative h-full max-w-6xl mx-auto px-6 md:px-14 py-4 flex flex-col justify-center gap-5 md:gap-8 short:gap-2 py-4 short:py-1 overflow-y-auto">
        <div className="text-center">
          <Kicker code="07" label="Confiança" jp="守" className="justify-center" />
          <DisplayTitle className="mt-3 short:mt-1 short:!text-[1.8rem] short:lg:!text-[2.15rem]">
            A IA propõe. <span className="text-beni-soft">O humano valida.</span>{' '}
            <span className="text-washi-muted">O sistema registra.</span>
          </DisplayTitle>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 short:gap-y-2 md:gap-x-16">
          {/* 01 • fora do portão: a proposta */}
          <div>
            <div className="flex items-center gap-2 text-[11px] md:text-xs uppercase tracking-[0.2em] text-washi-dim">
              <span className="font-display text-base text-washi-muted tabular-nums normal-case tracking-normal">01</span>
              Proposta da IA <Bot className="w-4 h-4" aria-hidden />
            </div>
            <p className="mt-2 font-display text-lg md:text-xl short:text-lg text-washi leading-snug">
              “Realocar 2 pessoas da equipe de Atendimento para o projeto em atraso.”
            </p>
            <div className="mt-2">
              <Classification kind="demo" />
            </div>
            <ArrowRight className="hidden md:block mt-3 w-5 h-5 text-washi-dim ml-auto" aria-hidden />
          </div>

          {/* 02 • dentro do portão: a decisão humana */}
          <div
            className={`relative p-5 short:p-3 border text-center bg-sumi-800/90 transition-colors duration-500 ${
              open ? 'border-washi/30' : 'border-beni/70'
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-[11px] md:text-xs uppercase tracking-[0.2em] text-washi-dim">
              <span className="font-display text-base text-beni-soft tabular-nums normal-case tracking-normal">02</span>
              Portão <span className="font-display normal-case tracking-normal">承認門</span>
              {open ? <CheckCircle2 className="w-4 h-4 text-washi" aria-hidden /> : <Lock className="w-4 h-4 text-beni-soft" aria-hidden />}
            </div>
            <div className="mt-2 font-display text-2xl md:text-3xl short:text-2xl text-washi">
              {open ? 'Aprovado pelo responsável' : 'Fechado'}
            </div>
            <p className="mt-1 short:mt-0.5 text-sm short:text-xs text-washi-muted">
              {open ? 'O carimbo (Hanko) registrou quem decidiu.' : 'Nada é executado sem o aval formal de um responsável.'}
            </p>
            {/* Espaço do carimbo: vazio e tracejado até o clique; depois, o Hanko vermelho */}
            <div className="mt-3 short:mt-1 flex flex-col items-center gap-1.5 short:gap-1">
              <div
                className={`w-20 h-20 short:w-12 short:h-12 flex items-center justify-center font-display transition-all duration-300 ${
                  open
                    ? 'bg-beni text-washi text-2xl short:text-base -rotate-6 hanko-animate shadow-[0_0_30px_rgba(215,38,61,0.45)]'
                    : 'border-2 border-dashed border-beni/60 text-beni/40 text-3xl short:text-xl'
                }`}
                role="img"
                aria-label={open ? 'Carimbo Hanko aplicado' : 'Espaço do carimbo Hanko, ainda vazio'}
              >
                {open ? '承認' : '印'}
              </div>
              <div className={`text-[11px] md:text-xs uppercase tracking-[0.16em] ${open ? 'text-washi' : 'text-beni-soft'}`}>
                {open ? 'Carimbado pelo responsável' : 'Aguardando o carimbo (Hanko)'}
              </div>
            </div>
            {decision && (
              <div className="mt-4 short:mt-1.5 flex justify-center">
                {open ? (
                  <button
                    onClick={revokeGate}
                    className="flex items-center gap-2 px-4 py-2 border border-washi/20 bg-sumi-700 hover:border-washi/40 text-washi-muted text-xs"
                  >
                    <Undo2 className="w-4 h-4" /> Desfazer aprovação
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={handleHanko}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
                      }}
                      className="flex items-center justify-center gap-2 text-center lg:whitespace-nowrap px-3 lg:px-6 py-3 short:py-2 bg-beni hover:bg-beni-soft text-washi text-sm lg:text-base short:text-sm font-semibold"
                    >
                      <Stamp className="w-5 h-5 shrink-0" /> <span>Aprovar com Hanko <span className="whitespace-nowrap">(押印)</span></span>
                    </button>
                    <span className="text-[11px] short:text-[10px] text-washi-dim">Somente o clique aprova • setas e Enter não aprovam</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 03 e 04 • depois do portão: execução e registro */}
          <div className="flex flex-col gap-4 short:gap-3">
            <div className={after}>
              <div className="flex items-center gap-2 text-[11px] md:text-xs uppercase tracking-[0.2em] text-washi-dim">
                <span className="font-display text-base text-washi-muted tabular-nums normal-case tracking-normal">03</span>
                Execução <PlayCircle className="w-4 h-4" aria-hidden />
              </div>
              <p className="mt-1 text-base text-washi">{open ? 'Mudança aplicada.' : 'Aguardando aprovação.'}</p>
            </div>
            <div className={`border-t border-washi/10 pt-3 ${after}`}>
              <div className="flex items-center gap-2 text-[11px] md:text-xs uppercase tracking-[0.2em] text-washi-dim">
                <span className="font-display text-base text-washi-muted tabular-nums normal-case tracking-normal">04</span>
                Registro <Database className="w-4 h-4" aria-hidden />
              </div>
              <p className="mt-1 text-sm text-washi">
                {open ? 'Quem aprovou, quando e o quê ficam na trilha de auditoria.' : 'Nada a registrar ainda.'}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center max-w-md short:max-w-xl mx-auto px-4 py-2 short:py-1 bg-sumi-800/85">
          <p className="text-sm md:text-base short:text-sm text-washi">
            {!decision
              ? 'Avançar leva à decisão — mas avançar não aprova.'
              : open
              ? 'Execução autorizada e registrada.'
              : 'A decisão é do responsável: só o clique no Hanko abre o portão.'}
          </p>
          <p className="mt-1 short:mt-0 text-xs short:text-[11px] text-washi-dim">
            IA assistiva e fluxo de aprovação: recursos propostos do Kizuna Business. No Start, o registro já vale: toda mudança em atividades entra no histórico.
          </p>
        </div>
      </div>
    </div>
  );
};
export default AISecuritySection;
