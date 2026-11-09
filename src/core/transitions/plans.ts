/*
 * Etapa 11 • Planos de transição entre telas (por par de telas narrativas, índices 0–11).
 * Cada plano descreve uma conexão espacial específica; o TransitionDirector executa qualquer plano.
 *
 * Coordenadas: o "quadro ancorado" — o destino posicionado provisoriamente onde a narrativa pede em relação à
 * origem (ver `anchor`). Ao terminar, o WorldStage faz o rebase (destino e câmera voltam ao lugar natural no
 * mesmo quadro, sem salto visível).
 */

export type Vec3 = [number, number, number];

/** Ponto de passagem com instante próprio (τ, 0–1) — planos da Fase 3. */
export interface KeyPoint {
  pos: Vec3;
  target: Vec3;
  t: number;
  /** a troca de ambiente acontece neste instante (sob a camada de passagem) */
  swap?: boolean;
}

/** Camada de passagem desenhada sobre o mundo 3D: névoa atmosférica, sombra de oclusão ou luz. */
export interface PassageOverlay {
  color: string;
  /** 0 = uniforme; 1 = concentrada no centro do quadro */
  radial: number;
  /** sobe entre rise[0] e rise[1] (τ) e desce entre fall[0] e fall[1] */
  rise: [number, number];
  fall: [number, number];
}

/** Grupo de ambiente posicionado provisoriamente durante a transição (desfeito no rebase). */
export interface Anchor {
  cluster: 'c02' | 'c03' | 'c04';
  pos: Vec3;
  yaw?: number;
}

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
  /** Fase 3: pontos com instante próprio (a interface e a camada de passagem seguem o tempo τ). */
  keys?: KeyPoint[];
  /** Fase 3: instante (τ) da troca de ambiente; antes dele aparece a origem, depois o destino. */
  swapAt?: number;
  overlay?: PassageOverlay;
  anchor?: Anchor;
}

/** Monta um plano da Fase 3 a partir dos pontos com instante. */
function keyed(p: {
  id: string;
  from: number;
  to: number;
  duration: number;
  reverseDuration: number;
  keys: KeyPoint[];
  overlay: PassageOverlay;
  anchor: Anchor;
  uiOutEnd: number;
  uiRelease: number;
  uiInFull: number;
}): FlightPlan {
  const swap = p.keys.find((k) => k.swap);
  return {
    ...p,
    via: p.keys.map((k) => k.pos),
    viaTarget: p.keys.map((k) => k.target),
    threshold: swap ? swap.t : 0.5,
    swapAt: swap ? swap.t : undefined,
    linger: 0,
    arrival: p.uiRelease,
    anchorZ: 0
  };
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
  },

  // 01 → 02 · ENTRADA NA ATMOSFERA. Mergulho sobre o Japão até a superfície tomar o quadro; uma névoa fria
  // e longa sobe; sob ela, o planeta dá lugar ao céu sobre o átrio (ancorado logo abaixo do ponto de contato)
  // e a câmera desce pela cobertura de vidro até o térreo. Âncora: o ponto (2; 38; 1) do átrio coincide com o
  // contato sobre o Japão (0,02; 0,066; 1,30).
  keyed({
    id: '01-02',
    from: 0,
    to: 1,
    duration: 3.4,
    reverseDuration: 2.7,
    keys: [
      { pos: [-0.42, 0.04, 2.25], target: [-0.12, 0.05, 0], t: 0.2 },
      { pos: [-0.06, 0.06, 1.62], target: [0.02, 0.066, 0], t: 0.36 },
      { pos: [0.02, 0.066, 1.3], target: [0.02, 0.066, 0], t: 0.46, swap: true },
      { pos: [0.02, -1.334, 1.45], target: [0.02, -7.934, -1.2], t: 0.53 },
      { pos: [-0.08, -8.434, 1.8], target: [-0.38, -27.934, -5.7], t: 0.66 },
      { pos: [-0.58, -21.934, 3.3], target: [-1.38, -35.934, -17.7], t: 0.82 },
      { pos: [-1.48, -33.934, 5.5], target: [-1.78, -35.534, -27.7], t: 0.94 }
    ],
    overlay: { color: '#9fb4ca', radial: 0.2, rise: [0.3, 0.44], fall: [0.51, 0.64] },
    anchor: { cluster: 'c02', pos: [-1.98, -37.934, 0.3] },
    uiOutEnd: 0.3,
    uiRelease: 0.8,
    uiInFull: 0.95
  }),

  // 02 → 03 · A FRONTEIRA PELA COLUNATA. Do alto do átrio, a câmera desce ao térreo, entra na colunata da
  // ala esquerda (caminho livre sob a laje) e segue rente a um pilar; quando ele cobre o quadro, a sombra
  // breve dá lugar ao corredor japonês (ancorado com o primeiro montante no lugar do pilar). A câmera sai de
  // trás do montante e chega à 03.1. Nada é atravessado.
  keyed({
    id: '02-03',
    from: 1,
    to: 2,
    duration: 3.6,
    reverseDuration: 2.9,
    keys: [
      { pos: [-1.8, 5.2, -6.5], target: [-4.5, 3.5, -22], t: 0.18 },
      { pos: [-5.2, 2.6, -10.5], target: [-7.6, 0.6, -26], t: 0.36 },
      { pos: [-7.6, 0.6, -14.2], target: [-8.4, 0.1, -32], t: 0.52 },
      { pos: [-8.4, 0.08, -18.8], target: [-8.4, 0.05, -40], t: 0.66 },
      { pos: [-8.4, 0.05, -20.385], target: [-8.4, 0.05, -40], t: 0.76, swap: true },
      { pos: [-7.95, 0.04, -20.45], target: [-7.2, 0, -35], t: 0.81 },
      { pos: [-6.6, 0, -21.15], target: [-5.6, -0.05, -30], t: 0.9 }
    ],
    overlay: { color: '#07080a', radial: 0, rise: [0.7, 0.752], fall: [0.77, 0.81] },
    anchor: { cluster: 'c03', pos: [-4.47, -0.1, -24.595] },
    uiOutEnd: 0.3,
    uiRelease: 0.82,
    uiInFull: 0.95
  }),

  // 03 → 04 · A PORTA E A LUZ. Da síntese, a câmera contorna a fusão pela direita, cruza a porta 03 (aberta)
  // e entra no cômodo iluminado; a luz quente se concentra no centro e, nela, surge o vestíbulo contemporâneo
  // (ancorado logo à frente), de frente para o jardim.
  keyed({
    id: '03-04',
    from: 2,
    to: 3,
    duration: 2.6,
    reverseDuration: 2.1,
    keys: [
      { pos: [0.6, -0.04, 1.9], target: [1.0, -0.1, -6], t: 0.16 },
      { pos: [1.1, -0.08, 0.3], target: [1.0, -0.1, -8], t: 0.34 },
      { pos: [0.98, -0.1, -3.4], target: [0.95, -0.1, -9], t: 0.55 },
      { pos: [0.95, -0.1, -5.9], target: [0.95, -0.1, -9], t: 0.68 },
      { pos: [0.95, -0.1, -6.98], target: [0.9, -0.1, -12], t: 0.78, swap: true },
      { pos: [0.75, -0.12, -7.9], target: [0.55, -0.18, -12], t: 0.86 }
    ],
    overlay: { color: '#f3d6a6', radial: 0.75, rise: [0.66, 0.765], fall: [0.79, 0.87] },
    anchor: { cluster: 'c04', pos: [0.45, -0.2, -11.8] },
    uiOutEnd: 0.28,
    uiRelease: 0.84,
    uiInFull: 0.96
  })
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
  // Fase 3: saltos não adjacentes que envolvem as telas com âncora do Grupo A (01–04) usam o véu
  if (Math.abs(from - to) > 1 && (from <= 3 || to <= 3)) return 'veil';
  return 'none';
}
