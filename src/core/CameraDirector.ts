import * as THREE from 'three';

export interface CameraPose {
  pos: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
}

export interface EnvironmentState {
  globeVisibility: number; // STRICT RULE: 1.0 only for section 0 and 14; 0.0 for 1..13
  globeRotationY: number;
  globeScale: number;

  // Bespoke 3D group visibilities for scenes 01..15
  tokyoSkylineVisibility: number;      // Scene 02 (Por que Japão)
  corridorVisibility: number;         // Scene 03 (Choque Cultural - 4 Doors)
  fusionVisibility: number;           // Scene 04 (Global x Local Fusion)
  threadWeaveVisibility: number;      // Scene 05 (Kizuna Threads Weaving UI)
  taskPipelineVisibility: number;     // Scene 06 (Como Funciona - Live Task Pipeline)
  modularScaleVisibility: number;     // Scene 07 (Planos - Modular Lattice)
  adaptationMorphVisibility: number;  // Scene 08 (Adaptação - 7 Pilares UI Morph)
  gateVisibility: number;             // Scene 09 (Confiança - Red Gate / Vault)
  railwayVisibility: number;          // Scene 10 (Entrada - Metro/Rail Expansion)
  broadcastVisibility: number;        // Scene 11 (Promoção - City Radiating Waves)
  constellationVisibility: number;    // Scene 12 (Concorrência - 3D Star Constellation)
  financial3DVisibility: number;      // Scene 13 (Preço - Volumetric Financial Dashboard)
  missionControlVisibility: number;   // Scene 14 (Riscos/KPIs - Tactical Command Center)

  sceneStep: number; // current internal scene step
}

/**
 * Maps each TECHNICAL stage index (0-14) and internal stage step
 * to cinematic camera coordinates and specialized 3D world parameters.
 * Os comentários "TELA NN" abaixo usam a numeração antiga dos cenários; a ordem narrativa
 * de 12 telas fica em narrativeMap.ts (STAGE_MAP).
 * 
 * CORE GRAMMAR RULE:
 * Globe is visible ONLY on Section 0 (Abertura) and Section 14 (Encerramento).
 * In all other sections (1 to 13), globeVisibility is strictly 0.0.
 */
export function getCameraPoseForSection(sectionIdx: number, sceneIdx: number): {
  pose: CameraPose;
  env: EnvironmentState;
} {
  const pose: CameraPose = {
    pos: new THREE.Vector3(0, 0, 4.2),
    target: new THREE.Vector3(0, 0, 0),
    fov: 42
  };

  const env: EnvironmentState = {
    globeVisibility: 0.0,
    globeRotationY: 0,
    globeScale: 1.0,
    tokyoSkylineVisibility: 0,
    corridorVisibility: 0,
    fusionVisibility: 0,
    threadWeaveVisibility: 0,
    taskPipelineVisibility: 0,
    modularScaleVisibility: 0,
    adaptationMorphVisibility: 0,
    gateVisibility: 0,
    railwayVisibility: 0,
    broadcastVisibility: 0,
    constellationVisibility: 0,
    financial3DVisibility: 0,
    missionControlVisibility: 0,
    sceneStep: sceneIdx
  };

  switch (sectionIdx) {
    case 0: // TELA 01: ABERTURA • O MUNDO AO JAPÃO (Globo 3D Cinematográfico)
      env.globeVisibility = 1.0;
      // A orientação do planeta (Américas → Europa/Índia → Japão) é feita por tomadas em WorldStage.
      // Aqui só a câmera: o globo fica à direita, deixando a esquerda para o texto.
      if (sceneIdx === 0) {
        // Visão ampla do planeta e da presença internacional da Globant
        pose.pos.set(-1.45, 0.1, 5.0);
        pose.target.set(-1.45, 0.05, 0);
      } else if (sceneIdx === 1 || sceneIdx === 2) {
        pose.pos.set(-0.9, 0.1, 4.2);
        pose.target.set(-0.9, 0.05, 0);
      } else {
        // Aproximação: o Japão termina dominante, à direita do título
        pose.pos.set(-0.78, 0.02, 2.75);
        pose.target.set(-0.78, 0.02, 0);
      }
      break;

    case 1: // TELA 02: POR QUE JAPÃO? • CIDADE 3D / SKYLINE DE TÓQUIO
      // Globe strictly HIDDEN
      env.globeVisibility = 0.0;
      env.tokyoSkylineVisibility = 1.0;
      if (sceneIdx === 0) {
        // High altitude over Tokyo skyline
        pose.pos.set(0, 1.8, 3.8);
        pose.target.set(0, 0.3, 0);
      } else if (sceneIdx === 1) {
        // Descending into Marunouchi / Chiyoda financial corridor
        pose.pos.set(0.4, 0.8, 2.9);
        pose.target.set(0.1, 0.2, -0.4);
      } else {
        // Approaching corporate tower with glowing red anchor
        pose.pos.set(0, 0.3, 2.2);
        pose.target.set(0, 0.1, -0.8);
      }
      break;

    case 2: // TELA 03: CHOQUE CULTURAL • CORREDOR ESCURO (portas identificadas na camada da tela)
      env.globeVisibility = 0.0;
      env.corridorVisibility = 1.0;
      // Etapa 8: olhar fixo pelo corredor, com leve deriva lateral acompanhando a porta aberta
      pose.pos.set((Math.min(3, sceneIdx) - 1.5) * 0.12, 0.05, 2.9);
      pose.target.set((Math.min(3, sceneIdx) - 1.5) * 0.2, 0.0, -3);
      break;

    case 3: // TELA 04: GLOBAL × LOCAL • DUAS ESTRUTURAS SE FUNDINDO (KANJI 絆)
      env.globeVisibility = 0.0;
      env.fusionVisibility = 1.0;
      pose.pos.set(0, 0, 2.7);
      pose.target.set(0, 0, 0);
      break;

    case 4: // TELA 05: KIZUNA • FIOS VERMELHOS TECENDO A INTERFACE
      env.globeVisibility = 0.0;
      env.threadWeaveVisibility = 1.0;
      pose.pos.set(0, 0.1, 2.5);
      pose.target.set(0, 0, 0);
      break;

    case 5: // TELA 06: COMO FUNCIONA • FLUXO VIVO DE TAREFAS (PIPELINE)
      env.globeVisibility = 0.0;
      env.taskPipelineVisibility = 1.0;
      pose.pos.set((sceneIdx - 2) * 0.35, 0, 2.6);
      pose.target.set((sceneIdx - 2) * 0.25, 0, 0);
      break;

    case 6: // TELA 07: PLANOS • SISTEMA MODULAR CRESCENDO (LATTICE)
      env.globeVisibility = 0.0;
      env.modularScaleVisibility = 1.0;
      // Etapa 8.2: a câmera recua e sobe a cada nível da estrutura de crescimento (à direita)
      if (sceneIdx <= 0) {
        pose.pos.set(0.95, -0.12, 1.45);
        pose.target.set(0.95, -0.85, -0.6);
      } else if (sceneIdx === 1) {
        pose.pos.set(0.6, 0.45, 2.5);
        pose.target.set(0.6, -0.7, -0.6);
      } else {
        pose.pos.set(0.4, 0.9, 3.45);
        pose.target.set(0.45, -0.68, -0.6);
      }
      break;

    case 7: // TELA 08: ADAPTAÇÃO • 7 TRANSFORMAÇÕES DA INTERFACE
      env.globeVisibility = 0.0;
      env.adaptationMorphVisibility = 1.0;
      // Etapa 8 • transições: 06.1 diante da camada de comunicação; 06.2 atravessa para a de decisão
      if (sceneIdx <= 0) {
        pose.pos.set(0.1, 0, 2.55);
        pose.target.set(0, 0, 0);
      } else {
        pose.pos.set(0.2, 0.05, -2.3);
        pose.target.set(0.15, 0, -6.5);
      }
      break;

    case 8: // TELA 09: CONFIANÇA • COFRE / PORTÃO VERMELHO DE VALIDAÇÃO
      env.globeVisibility = 0.0;
      env.gateVisibility = 1.0;
      // Etapa 8: câmera afastada — os pilares caem nos vãos entre as três colunas da tela
      // e o portão (deslocado para baixo em WorldStage) emoldura a decisão no centro
      // 07.2: antes do Hanko, a câmera se aproxima um pouco e sobe para a placa
      if (sceneIdx >= 2) {
        pose.pos.set(0, 0.2, 5.82);
        pose.target.set(0, 0.08, 0);
      } else {
        pose.pos.set(0, 0.05, 6.0);
        pose.target.set(0, 0, 0);
      }
      break;

    case 9: // TELA 10: ENTRADA NO MERCADO • LINHA FERROVIÁRIA METROVIÁRIA
      env.globeVisibility = 0.0;
      env.railwayVisibility = 1.0;
      // Tela 09.1–09.3 (Etapa 9): a câmera avança pela avenida de Marunouchi a cada trecho da rota.
      // O horizonte fica no terço superior, na altura da linha de metrô da interface.
      {
        const s = Math.min(2, Math.max(0, sceneIdx));
        pose.pos.set(s * 0.25, 1.9, 3.0 - s * 2.6);
        pose.target.set(s * 0.25, -3.6, -40 - s * 2.6);
      }
      break;

    case 10: // TELA 11: PROMOÇÃO • CIDADE REAGINDO À CAMPANHA (ONDAS ELETROMAGNÉTICAS)
      env.globeVisibility = 0.0;
      env.broadcastVisibility = 1.0;
      // Tela 09.4 (Etapa 9): a câmera sobe e olha mais longe — a cidade como mercado a conquistar
      pose.pos.set(0.6, 2.6, -6.5);
      pose.target.set(0.3, -3.2, -50);
      break;

    case 11: // TELA 12: CONCORRÊNCIA • CONSTELAÇÃO COMPETITIVA 3D
      env.globeVisibility = 0.0;
      env.constellationVisibility = 1.0;
      // Tela 10 (Etapa 9, cena única): tomada fixa no andar executivo, de frente para a fachada de vidro
      pose.pos.set(0, 0, 3.0);
      pose.target.set(0, 0.35, -9);
      break;

    case 12: // TELA 13: PREÇO • PAINEL FINANCEIRO VOLUMÉTRICO VIVO
      env.globeVisibility = 0.0;
      env.financial3DVisibility = 1.0;
      // Etapa 8.2: visão consolidada da mesma estrutura (cenário 6), com o anel de receita
      env.modularScaleVisibility = 1.0;
      pose.pos.set(-0.15, 1.55, 4.5);
      pose.target.set(0.05, -0.78, -0.6);
      break;

    case 13: // TELA 14: RISCOS & KPIS • CENTRO DE COMANDO 4 QUADRANTES
      env.globeVisibility = 0.0;
      env.missionControlVisibility = 1.0;
      // Tela 11 (Etapa 9): sala de planejamento; na 11.2 a câmera desliza um pouco em direção à parede do roadmap
      if (sceneIdx >= 1) {
        pose.pos.set(0.6, 0.05, 2.3);
        pose.target.set(0.55, 0.1, -7.5);
      } else {
        pose.pos.set(0, 0, 3.0);
        pose.target.set(0, 0.05, -7.5);
      }
      break;

    case 14: // TELA 15: ENCERRAMENTO • O FIO RETORNA AO MUNDO (Globo 3D)
      env.globeVisibility = 1.0;
      pose.pos.set(0, 0.35, 4.4);
      pose.target.set(0, 0, 0);
      env.globeRotationY = 2.85;
      env.globeScale = 1.08;
      break;

    default:
      break;
  }

  return { pose, env };
}

/**
 * Projects a 3D world vector onto 2D screen coordinates.
 */
export function worldToScreen(
  pos: THREE.Vector3,
  camera: THREE.Camera,
  width: number,
  height: number
): { x: number; y: number; visible: boolean } {
  const p = pos.clone().project(camera);
  const x = ((p.x + 1) * 0.5) * width;
  const y = ((-p.y + 1) * 0.5) * height;
  const visible = p.z < 1.0 && p.z > -1.0;
  return { x, y, visible };
}
