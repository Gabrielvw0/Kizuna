import React, { useEffect, useState } from 'react';
import { Bot, Lock, CheckCircle2, PlayCircle, Database, ArrowRight } from 'lucide-react';
import { usePresentation } from '../core/PresentationContext';
import { Kicker, DisplayTitle, Classification } from '../components/strategic/Editorial';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Mesma linha do tempo do portal 3D (WorldStage, cenário 8, cena 2), em ms desde a entrada na 07.2
const T_STAMP = 1100; // o Hanko toca a placa: 承認
const T_OPEN = 2300; // a passagem abre
const T_EXEC = 3000; // execução autorizada
const T_LOG = 3500; // registro documentado

/**
 * Tela 07 • Confiança e aprovação humana — Etapa 8.2.
 * O portal 3D é o protagonista e fica livre no centro; os textos ficam nas laterais,
 * fora dos montantes. Nada de painel opaco sobre o cenário.
 *
 * Cena 07.1 — a decisão aguarda: a IA recomenda, o portal está fechado, o Hanko não foi aplicado.
 * Cena 07.2 — a aprovação libera a execução: ao entrar na cena, a demonstração aplica o Hanko,
 * destrava e abre o portal; execução e registro se atualizam. Sem botão e sem clique.
 * Voltar à 07.1 fecha tudo; avançar de novo repete a sequência.
 */
export const AISecuritySection: React.FC = () => {
  const { sceneIndex } = usePresentation();
  const scene = Math.min(1, Math.max(0, sceneIndex));
  const [phase, setPhase] = useState(0); // 0 aguardando • 1 carimbado • 2 aberto • 3 executado • 4 registrado

  useEffect(() => {
    if (scene === 0) {
      setPhase(0);
      return;
    }
    if (prefersReducedMotion()) {
      setPhase(4);
      return;
    }
    setPhase(0);
    const timers = [
      window.setTimeout(() => setPhase(1), T_STAMP),
      window.setTimeout(() => setPhase(2), T_OPEN),
      window.setTimeout(() => setPhase(3), T_EXEC),
      window.setTimeout(() => setPhase(4), T_LOG)
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [scene]);

  const lit = (from: number) => `transition-opacity duration-700 ${phase >= from ? 'opacity-100' : 'opacity-40'}`;
  const status =
    phase === 0 ? 'Aguardando o Hanko do responsável' : phase === 1 ? 'Hanko aplicado • 承認' : 'Passagem aberta';

  return (
    <div className="relative w-full h-full select-none">
      <div className="relative h-full max-w-6xl mx-auto px-6 md:px-14 py-4 short:py-1 flex flex-col justify-between gap-3 short:gap-1.5 overflow-hidden">
        <div className="text-center pt-2 short:pt-0">
          <Kicker code="07" label="Confiança" jp="守" className="justify-center" />
          <DisplayTitle className="mt-3 short:mt-1 short:!text-[1.8rem] short:lg:!text-[2.15rem]">
            A IA propõe. <span className="text-beni-soft">O humano valida.</span>{' '}
            <span className="text-washi-muted">O sistema registra.</span>
          </DisplayTitle>
        </div>

        {/* Três colunas: o centro fica livre para o portal; as laterais ficam fora dos montantes */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 items-center gap-4 short:gap-y-2 md:gap-x-16">
          <div className="relative">
            <div className="absolute -inset-4 -z-10 bg-[radial-gradient(ellipse_at_30%_50%,rgba(11,11,13,0.85),transparent_70%)]" aria-hidden />
            <div className="flex items-center gap-2 text-[11px] md:text-xs uppercase tracking-[0.2em] text-washi-dim">
              <span className="font-display text-base text-washi-muted tabular-nums normal-case tracking-normal">01</span>
              Recomendação da IA <Bot className="w-4 h-4" aria-hidden />
            </div>
            <p className="mt-2 font-display text-lg md:text-xl short:text-lg text-washi leading-snug border-l-2 border-washi/25 pl-3">
              “Realocar 2 pessoas da equipe de Atendimento para o projeto em atraso.”
            </p>
            <div className="mt-2 pl-3">
              <Classification kind="demo" />
            </div>
            <p className="mt-2 pl-3 text-xs text-washi-dim">A IA recomenda; não tem autoridade para executar.</p>
            <ArrowRight className="hidden md:block mt-2 w-5 h-5 text-washi-dim ml-auto" aria-hidden />
          </div>

          {/* centro: espaço do portal (3D) */}
          <div className="hidden md:block h-full" aria-hidden />

          <div className="relative flex flex-col gap-4 short:gap-3">
            <div className="absolute -inset-4 -z-10 bg-[radial-gradient(ellipse_at_70%_50%,rgba(11,11,13,0.85),transparent_70%)]" aria-hidden />
            <div className={lit(3)}>
              <div className="flex items-center gap-2 text-[11px] md:text-xs uppercase tracking-[0.2em] text-washi-dim">
                <span className="font-display text-base text-washi-muted tabular-nums normal-case tracking-normal">03</span>
                Execução <PlayCircle className="w-4 h-4" aria-hidden />
              </div>
              <p key={phase >= 3 ? 'ok' : 'wait'} className="mt-1 text-base text-washi animate-fadeIn">
                {phase >= 3 ? 'Mudança autorizada.' : 'Aguardando aprovação.'}
              </p>
            </div>
            <div className={`border-t border-washi/10 pt-3 ${lit(4)}`}>
              <div className="flex items-center gap-2 text-[11px] md:text-xs uppercase tracking-[0.2em] text-washi-dim">
                <span className="font-display text-base text-washi-muted tabular-nums normal-case tracking-normal">04</span>
                Registro <Database className="w-4 h-4" aria-hidden />
              </div>
              {phase >= 4 ? (
                <div className="animate-fadeIn">
                  <p className="mt-1 text-sm text-washi">Quem aprovou, quando e o quê ficam na trilha de auditoria.</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-washi-muted">
                    <span className="font-display text-beni-soft">承認</span> Responsável da equipe • ref. 21/10/2026
                    <Classification kind="demo" />
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-sm text-washi">Nada a registrar ainda.</p>
              )}
            </div>
          </div>
        </div>

        {/* Estado do portal e mensagem — sobre gradiente, sem caixa opaca */}
        <div className="relative text-center pb-1">
          <div className="absolute inset-x-0 -top-6 bottom-0 -z-10 bg-gradient-to-t from-sumi/90 via-sumi/60 to-transparent" aria-hidden />
          <div className="inline-flex items-center gap-2 text-[11px] md:text-xs uppercase tracking-[0.2em] text-washi-dim">
            <span className="font-display text-base text-beni-soft tabular-nums normal-case tracking-normal">02</span>
            Portão <span className="font-display normal-case tracking-normal">承認門</span>
            {phase >= 1 ? <CheckCircle2 className="w-4 h-4 text-washi" aria-hidden /> : <Lock className="w-4 h-4 text-beni-soft" aria-hidden />}
            <span key={status} className={`normal-case tracking-normal text-sm animate-fadeIn ${phase >= 1 ? 'text-washi' : 'text-beni-soft'}`}>
              {status}
            </span>
          </div>
          <p className="mt-1 text-sm md:text-base short:text-sm text-washi">
            {scene === 0
              ? 'A IA recomenda, mas não executa: a decisão aguarda o responsável.'
              : 'O responsável aplica o Hanko: só então a mudança é executada e registrada.'}
          </p>
          <p className="mt-0.5 text-xs short:text-[11px] text-washi-dim max-w-2xl mx-auto">
            IA assistiva e fluxo de aprovação: recursos propostos do Kizuna Business. No Start, o registro já vale: toda mudança em atividades entra no histórico.
          </p>
        </div>
      </div>
    </div>
  );
};
export default AISecuritySection;
