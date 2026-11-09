/*
 * Etapa 11 • Planos de transição entre telas (por par de telas narrativas, índices 0–11).
 * Cada plano descreve uma conexão espacial específica; o TransitionDirector executa qualquer plano.
 *
 * Coordenadas: o "quadro ancorado" — o destino posicionado provisoriamente onde a narrativa pede em relação à
 * origem (ver `anchor`). Ao terminar, o WorldStage faz o rebase (destino e câmera voltam ao lugar natural no
 * mesmo quadro, sem salto visível).
 */

export type Vec3 = [number, number, number];

export interface FlightPlan {
  id: string;
  from: number;
  to: number;
  /** Duração do voo de ida e de volta (s). */
  duration: number;
  reverseDuration: number;
  /** Pontos intermediários da câmera e do alvo (o início e o fim são as poses reais de origem e destino). */
  via: Vec3[];
  viaTarget: Vec3[];
  /** Posição, no percurso (0–1, por comprimento de arco), do limiar físico — onde a câmera desacelera. */
  threshold: number;
  /** Intensidade da desaceleração no limiar (0 = nenhuma; < 1). */
  linger: number;
  /** Progresso (0–1) em que a interface troca de tela (antes: origem; depois: destino). */
  uiRelease: number;
  /** Progresso em que a interface de origem já sumiu (ida). */
  uiOutEnd: number;
  /** Progresso a partir do qual a interface de destino fica plenamente visível (ida). */
  uiInFull: number;
  /** Progresso em que o destino começa a "acontecer" (ex.: a estrutura de crescimento sobe). */
  arrival: number;
  /** Deslocamento z do destino enquanto ancorado atrás da origem, relativo à sua posição natural. */
  anchorZ: number;
}

/** Telas narrativas envolvidas no piloto. */
export const SCREEN_TRUST = 6; // 07
export const SCREEN_PLANS = 7; // 08

export const PLANS: FlightPlan[] = [
  {
    // 07 → 08: atravessar o portão aprovado até a sala onde a plataforma cresce
    id: '07-08',
    from: SCREEN_TRUST,
    to: SCREEN_PLANS,
    duration: 3.0,
    reverseDuration: 2.4,
    via: [
      [0, 0.02, 3.4],
      [0.03, -0.1, 1.1],
      [0.14, -0.14, -1.7],
      [0.55, -0.12, -6.4]
    ],
    viaTarget: [
      [0, -0.12, -2.5],
      [0.08, -0.3, -6.2],
      [0.45, -0.6, -10.4],
      [0.9, -0.8, -12.3]
    ],
    threshold: 0.36,
    linger: 0.55,
    uiRelease: 0.7,
    uiOutEnd: 0.28,
    uiInFull: 0.9,
    arrival: 0.74,
    anchorZ: -12
  }
];

export function findPlan(from: number, to: number): { plan: FlightPlan; reverse: boolean } | null {
  for (const plan of PLANS) {
    if (plan.from === from && plan.to === to) return { plan, reverse: false };
    if (plan.from === to && plan.to === from) return { plan, reverse: true };
  }
  return null;
}

export type TransitionKind = 'flight' | 'veil' | 'none';

/**
 * Preferência de movimento reduzido do sistema. Para validação, `?motion=full` ou `?motion=reduced` na URL
 * forçam um dos modos (útil em máquinas com animações desligadas no sistema).
 */
export const prefersReducedMotion = () => {
  const forced = new URLSearchParams(window.location.search).get('motion');
  if (forced === 'full') return false;
  if (forced === 'reduced') return true;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
};

/**
 * Tipo de transição de uma troca de tela. 'none' mantém o comportamento existente (conexões ainda não
 * tratadas nesta fase). A tela 08 tem posição natural própria (rebase), então qualquer troca que entre ou saia
 * dela sem plano usa o véu curto — inclusive saltos pelo menu.
 */
export function transitionKind(from: number, to: number, reduced: boolean): TransitionKind {
  if (from === to) return 'none';
  if (findPlan(from, to)) return reduced ? 'veil' : 'flight';
  if (from === SCREEN_PLANS || to === SCREEN_PLANS) return 'veil';
  return 'none';
}
