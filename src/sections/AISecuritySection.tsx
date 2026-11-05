import React, { useEffect, useRef, useState } from 'react';
import { Bot, Lock, CheckCircle2, PlayCircle, Database, RotateCcw, ArrowRight } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { Kicker, DisplayTitle, Classification } from '../components/strategic/Editorial';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Linha do tempo do clique (ms) — ver index.css (.hanko-*)
const T_APPROVE = 520; // o selo toca o papel: a decisão é registrada
const T_NEXT_SCENE = 1750; // portão aberto: a cena 07.2 mostra a consequência

/**
 * Tela 07 • Confiança e aprovação humana — tríptico em volta do portão 3D.
 * Esquerda: a proposta da IA. Centro: o mecanismo de aprovação (o próprio Hanko é clicável).
 * Direita: execução e registro, que só mudam depois do carimbo.
 *
 * Cena 07.1 — a decisão está nas mãos do responsável (portão fechado, Hanko aguardando).
 * Cena 07.2 — a decisão foi registrada (selo aplicado, portão aberto, execução e registro).
 *
 * Segurança: só o clique de ponteiro no selo aprova. Teclas (setas, Enter, Espaço) e a
 * navegação entre cenas nunca aprovam; voltar a 07.1 ou sair da tela desfaz a aprovação
 * (PresentationContext). Chegar a 07.2 pelas setas mostra o portão ainda fechado.
 */
export const AISecuritySection: React.FC = () => {
  const { sceneIndex, gateApproved, approveGate, revokeGate, setSceneIndex } = usePresentation();
  const scene = Math.min(1, Math.max(0, sceneIndex));
  const approved = gateApproved;
  const [stamping, setStamping] = useState(false);
  const [stampedNow, setStampedNow] = useState(false); // a tinta entra animada só no clique
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    []
  );
  // Se a aprovação for desfeita (R, voltar a 07.1, sair da tela), o mecanismo volta ao início.
  useEffect(() => {
    if (!approved && !stamping) setStampedNow(false);
  }, [approved, stamping]);

  const applyHanko = (e: React.MouseEvent<HTMLDivElement>) => {
    // detail === 0: "clique" sintético de teclado/assistivo — não aprova
    if (e.detail === 0 || approved || stamping) return;
    if (prefersReducedMotion()) {
      approveGate();
      setSceneIndex(1);
      return;
    }
    setStamping(true);
    setStampedNow(true);
    timers.current.push(
      window.setTimeout(() => approveGate(), T_APPROVE),
      window.setTimeout(() => {
        setSceneIndex(1);
        setStamping(false);
      }, T_NEXT_SCENE)
    );
  };

  const restore = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setStamping(false);
    setStampedNow(false);
    revokeGate();
    setSceneIndex(0);
  };

  // execução e registro acendem em sequência, depois da tinta e da abertura
  const after = (delayMs: number) => ({
    className: `transition-opacity duration-700 ${approved ? 'opacity-100' : 'opacity-35'}`,
    style: { transitionDelay: approved && stampedNow ? `${delayMs}ms` : '0ms' }
  });
  const showSeal = !approved || stamping;
  const showInk = approved || (stamping && stampedNow);

  return (
    <div className="relative w-full h-full select-none">
      <div className="relative h-full max-w-6xl mx-auto px-6 md:px-14 py-4 short:py-1 flex flex-col justify-center gap-5 md:gap-7 short:gap-2 overflow-y-auto">
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

          {/* 02 • dentro do portão: o mecanismo de aprovação */}
          <div
            className={`relative mx-auto w-full max-w-[290px] text-center px-4 pt-3 pb-4 short:px-3 short:pt-2 short:pb-2 border border-washi/10 bg-[linear-gradient(180deg,#141418_0%,#0d0d10_100%)] shadow-[0_30px_60px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(242,238,230,0.06)] ${approved ? 'gate-open' : ''} ${approved && !stampedNow ? 'gate-open-now' : ''}`}
          >
            <div className="flex items-center justify-center gap-2 text-[11px] md:text-xs uppercase tracking-[0.2em] text-washi-dim">
              <span className="font-display text-base text-beni-soft tabular-nums normal-case tracking-normal">02</span>
              Portão <span className="font-display normal-case tracking-normal">承認門</span>
              {approved ? <CheckCircle2 className="w-4 h-4 text-washi" aria-hidden /> : <Lock className="w-4 h-4 text-beni-soft" aria-hidden />}
            </div>
            <div key={approved ? 'ok' : 'wait'} className="mt-1.5 font-display text-2xl md:text-3xl short:text-xl text-washi animate-fadeIn">
              {approved ? 'Aprovado pelo responsável' : 'Fechado'}
            </div>
            <p className="mt-1 short:mt-0.5 text-sm short:text-xs text-washi-muted">
              {approved ? 'O carimbo (Hanko) registrou quem decidiu.' : 'Nada é executado sem o aval formal de um responsável.'}
            </p>

            {/* Nicho do carimbo, com luz dirigida de cima */}
            <div className="relative mx-auto mt-3 short:mt-1.5 h-[124px] short:h-[86px] w-full max-w-[220px] flex items-center justify-center">
              <div
                aria-hidden
                className="absolute inset-x-6 inset-y-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(242,238,230,0.16)_0%,rgba(242,238,230,0.04)_45%,transparent_75%)]"
              />
              <div
                aria-hidden
                className="absolute w-[92px] h-[92px] short:w-[66px] short:h-[66px] rounded-[10px] bg-sumi-900/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.05)]"
              />
              {showInk && (
                <div
                  className={`hanko-ink absolute w-[70px] h-[70px] short:w-[50px] short:h-[50px] flex flex-col items-center justify-center text-[22px] short:text-[16px] leading-[1.05] ${
                    stampedNow ? 'hanko-ink-enter' : ''
                  }`}
                  role="img"
                  aria-label="Marca do Hanko: 承認 (aprovado)"
                >
                  <span>承</span>
                  <span>認</span>
                </div>
              )}
              {showSeal && (
                <div
                  className={`relative ${stamping ? 'hanko-stamping' : 'hanko-idle'}`}
                  role="button"
                  aria-label="Hanko 承認: clique para aplicar o carimbo e autorizar (somente com clique)"
                  onClick={applyHanko}
                  title="Aplicar Hanko para autorizar"
                >
                  {!stamping && <span className="hanko-halo" aria-hidden />}
                  <span className="hanko-impact w-[84px] h-[84px] short:w-[60px] short:h-[60px]" aria-hidden />
                  <div className="hanko-seal w-[76px] h-[76px] short:w-[54px] short:h-[54px]">
                    <span className="hanko-seal-glyph flex flex-col items-center text-[22px] short:text-[16px]">
                      <span>承</span>
                      <span>認</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-1.5 short:mt-1 min-h-[34px] short:min-h-[28px]">
              {approved ? (
                <div className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-washi animate-fadeIn">Carimbado pelo responsável</div>
              ) : (
                <>
                  <div className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-beni-soft">Aplicar Hanko para autorizar</div>
                  <div className="mt-0.5 text-[10px] md:text-[11px] text-washi-dim">Somente o clique aprova • setas e Enter não aprovam</div>
                </>
              )}
            </div>

            {/* Folhas do portão: fechadas até o carimbo; depois deslizam para as colunas */}
            <div className="relative mx-auto mt-2 short:mt-1 h-[40px] short:h-[26px] w-full overflow-hidden border-y border-washi/10">
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(242,238,230,0.10),rgba(242,238,230,0.02))]"
              />
              {(['left', 'right'] as const).map((side) => (
                <div
                  key={side}
                  aria-hidden
                  className={`gate-leaf gate-leaf-${side} absolute top-0 bottom-0 w-1/2 ${side === 'left' ? 'left-0 border-r' : 'right-0 border-l'} border-beni/60 bg-[linear-gradient(180deg,#1d1d22_0%,#121215_100%)] shadow-[inset_0_1px_0_rgba(242,238,230,0.07)]`}
                />
              ))}
            </div>

            {approved && (
              <button
                onClick={restore}
                className="mt-2 short:mt-1 inline-flex items-center gap-1.5 text-[11px] text-washi-dim hover:text-washi border-b border-washi/20 hover:border-washi/50 pb-0.5"
              >
                <RotateCcw className="w-3 h-3" aria-hidden /> Restaurar demonstração
              </button>
            )}
          </div>

          {/* 03 e 04 • depois do portão: execução e registro */}
          <div className="flex flex-col gap-4 short:gap-3">
            <div {...after(900)}>
              <div className="flex items-center gap-2 text-[11px] md:text-xs uppercase tracking-[0.2em] text-washi-dim">
                <span className="font-display text-base text-washi-muted tabular-nums normal-case tracking-normal">03</span>
                Execução <PlayCircle className="w-4 h-4" aria-hidden />
              </div>
              <p className="mt-1 text-base text-washi">{approved ? 'Mudança autorizada.' : 'Aguardando aprovação.'}</p>
            </div>
            <div className={`border-t border-washi/10 pt-3 ${after(1250).className}`} style={after(1250).style}>
              <div className="flex items-center gap-2 text-[11px] md:text-xs uppercase tracking-[0.2em] text-washi-dim">
                <span className="font-display text-base text-washi-muted tabular-nums normal-case tracking-normal">04</span>
                Registro <Database className="w-4 h-4" aria-hidden />
              </div>
              {approved ? (
                <>
                  <p className="mt-1 text-sm text-washi">Quem aprovou, quando e o quê ficam na trilha de auditoria.</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-washi-muted">
                    <span className="font-display text-beni-soft">承認</span> Responsável da equipe • ref. 21/10/2026
                    <Classification kind="demo" />
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-washi">Nada a registrar ainda.</p>
              )}
            </div>
          </div>
        </div>

        <div className="text-center max-w-md short:max-w-xl mx-auto px-4 py-2 short:py-1 bg-sumi-800/85">
          <p className="text-sm md:text-base short:text-sm text-washi">
            {approved
              ? 'Execução autorizada e registrada.'
              : scene === 0
              ? 'Avançar leva à decisão — mas avançar não aprova.'
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
