/**
 * Camada de correspondência entre a NARRATIVA (12 telas) e o PALCO TÉCNICO (3D + câmera).
 *
 * O mundo 3D (WorldStage) e a câmera (CameraDirector) continuam organizados nos 15 "cenários"
 * técnicos originais (índices 0–14). As telas narrativas não usam mais esses índices diretamente:
 * cada cena de cada tela aponta para um cenário técnico e para o passo interno desse cenário.
 *
 * Regra: STAGE_MAP[tela].length deve ser igual ao sceneCount da tela (verificado em checkNarrativeMap).
 */

/** Índices das 12 telas narrativas (ordem de apresentação). */
export const SCREEN = {
  OPENING: 0, // 01 Abertura
  WHY_JAPAN: 1, // 02 Por que o Japão
  CONTEXT: 2, // 03 O Japão exige contexto (R1)
  START: 3, // 04 Kizuna Start
  DEMO: 4, // 05 Demonstração real do produto
  ADAPTATION: 5, // 06 Adaptação ao Japão (R2)
  TRUST: 6, // 07 Confiança e aprovação humana
  PLANS: 7, // 08 Planos e modelo de receita
  ENTRY: 8, // 09 Estratégia de entrada e aquisição B2B (R3 + R4)
  POSITIONING: 9, // 10 Posicionamento competitivo
  RISKS: 10, // 11 Riscos e planejamento de 12 meses
  CLOSING: 11 // 12 Encerramento
} as const;

/** Cenários técnicos do mundo 3D (índices históricos usados por WorldStage/CameraDirector). */
export const STAGE = {
  GLOBE_OPENING: 0,
  TOKYO_SKYLINE: 1,
  DOOR_CORRIDOR: 2,
  GLOBAL_LOCAL_FUSION: 3,
  THREAD_WEAVE: 4,
  TASK_PIPELINE: 5,
  MODULAR_RINGS: 6,
  ADAPTATION_MORPH: 7,
  VALIDATION_GATE: 8,
  RAILWAY: 9,
  BROADCAST: 10,
  CONSTELLATION: 11,
  FINANCIAL: 12,
  MISSION_CONTROL: 13,
  GLOBE_CLOSING: 14
} as const;

export interface StageRef {
  /** Cenário técnico (0–14). */
  stage: number;
  /** Passo interno do cenário técnico (pose de câmera, posição do trem, portas etc.). */
  scene: number;
}

const at = (stage: number, scene = 0): StageRef => ({ stage, scene });

/** Para cada tela narrativa, o cenário técnico de cada cena. */
export const STAGE_MAP: StageRef[][] = [
  // 01 Abertura: planeta → mergulho no Japão
  [at(STAGE.GLOBE_OPENING, 0), at(STAGE.GLOBE_OPENING, 3)],
  // 02 Por que o Japão: skyline → aproximação
  [at(STAGE.TOKYO_SKYLINE, 0), at(STAGE.TOKYO_SKYLINE, 2)],
  // 03 Contexto (R1): 4 portas → fusão global × local
  [
    at(STAGE.DOOR_CORRIDOR, 0),
    at(STAGE.DOOR_CORRIDOR, 1),
    at(STAGE.DOOR_CORRIDOR, 2),
    at(STAGE.DOOR_CORRIDOR, 3),
    at(STAGE.GLOBAL_LOCAL_FUSION, 2)
  ],
  // 04 Kizuna Start
  [at(STAGE.THREAD_WEAVE, 0)],
  // 05 Demonstração: a cápsula do pipeline acompanha cada passo
  [
    at(STAGE.TASK_PIPELINE, 0),
    at(STAGE.TASK_PIPELINE, 1),
    at(STAGE.TASK_PIPELINE, 2),
    at(STAGE.TASK_PIPELINE, 3),
    at(STAGE.TASK_PIPELINE, 4)
  ],
  // 06 Adaptação (R2)
  [at(STAGE.ADAPTATION_MORPH, 0), at(STAGE.ADAPTATION_MORPH, 1)],
  // 07 Confiança: 07.1 portão fechado • 07.2 sequência automática do Hanko (sem clique)
  [at(STAGE.VALIDATION_GATE, 1), at(STAGE.VALIDATION_GATE, 2)],
  // 08 Planos: anéis completos → painel financeiro do simulador
  [at(STAGE.MODULAR_RINGS, 2), at(STAGE.FINANCIAL, 0)],
  // 09 Entrada (R3) na linha do trem: pilotos → expansão → subsidiária; aquisição (R4)
  [at(STAGE.RAILWAY, 3), at(STAGE.RAILWAY, 5), at(STAGE.RAILWAY, 6), at(STAGE.BROADCAST, 0)],
  // 10 Posicionamento
  [at(STAGE.CONSTELLATION, 0), at(STAGE.CONSTELLATION, 1)],
  // 11 Riscos e 12 meses
  [at(STAGE.MISSION_CONTROL, 0), at(STAGE.MISSION_CONTROL, 1)],
  // 12 Encerramento: o fio volta ao globo
  [at(STAGE.GLOBE_CLOSING, 0)]
];

/** Converte (tela narrativa, cena) no cenário técnico correspondente. */
export const toStage = (screen: number, scene: number): StageRef => {
  const scenes = STAGE_MAP[screen];
  if (!scenes || scenes.length === 0) return at(STAGE.GLOBE_OPENING, 0);
  return scenes[Math.max(0, Math.min(scenes.length - 1, scene))];
};

/** Lista inconsistências entre o roteiro e o mapa técnico (vazia = tudo certo). */
export const checkNarrativeMap = (sceneCounts: number[]): string[] => {
  const problems: string[] = [];
  if (sceneCounts.length !== STAGE_MAP.length) {
    problems.push(`roteiro tem ${sceneCounts.length} telas, mapa técnico tem ${STAGE_MAP.length}`);
  }
  sceneCounts.forEach((count, i) => {
    const mapped = STAGE_MAP[i]?.length ?? 0;
    if (mapped !== count) problems.push(`tela ${i + 1}: ${count} cenas no roteiro, ${mapped} no mapa técnico`);
  });
  return problems;
};
