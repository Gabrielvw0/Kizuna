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
  redThreadProgress: number; // 0.0 to 1.0 along orbital curve

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
 * Maps each presentation section index (0-14) and internal sceneIndex
 * to cinematic camera coordinates and specialized 3D world parameters.
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
    redThreadProgress: 0.0,
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
      if (sceneIdx === 0) {
        // Deep Space
        pose.pos.set(0, 0.4, 4.6);
        pose.target.set(0, 0, 0);
        env.globeRotationY = -0.4;
        env.redThreadProgress = 0.08;
      } else if (sceneIdx === 1) {
        // Orbit towards Brazil (São Paulo hub)
        pose.pos.set(-0.8, -0.2, 3.4);
        pose.target.set(-0.2, -0.1, 0);
        env.globeRotationY = -0.85;
        env.redThreadProgress = 0.3;
      } else if (sceneIdx === 2) {
        // Thread traverses towards Japan via Globant global hubs
        pose.pos.set(0.6, 0.3, 3.0);
        pose.target.set(0.2, 0.1, 0);
        env.globeRotationY = 1.35;
        env.redThreadProgress = 0.8;
      } else {
        // Dive in towards Tokyo
        pose.pos.set(0.35, 0.45, 2.3);
        pose.target.set(0.1, 0.15, 0);
        env.globeRotationY = 1.85;
        env.redThreadProgress = 1.0;
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

    case 2: // TELA 03: CHOQUE CULTURAL • CORREDOR DAS 4 PORTAS
      env.globeVisibility = 0.0;
      env.corridorVisibility = 1.0;
      // Step controls active portal focus
      pose.pos.set((sceneIdx - 1.5) * 0.45, 0.2, 2.6);
      pose.target.set((sceneIdx - 1.5) * 0.3, 0.1, 0);
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
      pose.pos.set(0, 0, 2.8 - sceneIdx * 0.25);
      pose.target.set(0, 0, 0);
      break;

    case 7: // TELA 08: ADAPTAÇÃO • 7 TRANSFORMAÇÕES DA INTERFACE
      env.globeVisibility = 0.0;
      env.adaptationMorphVisibility = 1.0;
      pose.pos.set(0.1, 0, 2.55);
      pose.target.set(0, 0, 0);
      break;

    case 8: // TELA 09: CONFIANÇA • COFRE / PORTÃO VERMELHO DE VALIDAÇÃO
      env.globeVisibility = 0.0;
      env.gateVisibility = 1.0;
      pose.pos.set(0, 0.15, 2.4);
      pose.target.set(0, 0, 0);
      break;

    case 9: // TELA 10: ENTRADA NO MERCADO • LINHA FERROVIÁRIA METROVIÁRIA
      env.globeVisibility = 0.0;
      env.railwayVisibility = 1.0;
      pose.pos.set(-0.2 + sceneIdx * 0.25, 0.2, 2.5);
      pose.target.set(0, 0, 0);
      break;

    case 10: // TELA 11: PROMOÇÃO • CIDADE REAGINDO À CAMPANHA (ONDAS ELETROMAGNÉTICAS)
      env.globeVisibility = 0.0;
      env.broadcastVisibility = 1.0;
      pose.pos.set(0, 0.6, 2.9);
      pose.target.set(0, 0.1, 0);
      break;

    case 11: // TELA 12: CONCORRÊNCIA • CONSTELAÇÃO COMPETITIVA 3D
      env.globeVisibility = 0.0;
      env.constellationVisibility = 1.0;
      pose.pos.set(0, 0, 2.85);
      pose.target.set(0, 0, 0);
      break;

    case 12: // TELA 13: PREÇO • PAINEL FINANCEIRO VOLUMÉTRICO VIVO
      env.globeVisibility = 0.0;
      env.financial3DVisibility = 1.0;
      pose.pos.set(0, 0, 2.6);
      pose.target.set(0, 0, 0);
      break;

    case 13: // TELA 14: RISCOS & KPIS • CENTRO DE COMANDO 4 QUADRANTES
      env.globeVisibility = 0.0;
      env.missionControlVisibility = 1.0;
      pose.pos.set(0, 0, 2.7);
      pose.target.set(0, 0, 0);
      break;

    case 14: // TELA 15: ENCERRAMENTO • O FIO RETORNA AO MUNDO (Globo 3D)
      env.globeVisibility = 1.0;
      pose.pos.set(0, 0.35, 4.4);
      pose.target.set(0, 0, 0);
      env.globeRotationY = 2.85;
      env.globeScale = 1.08;
      env.redThreadProgress = 1.0;
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
