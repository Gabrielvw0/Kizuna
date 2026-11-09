import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usePresentation } from './PresentationContext';
import { getCameraPoseForSection } from './CameraDirector';
import { toStage } from './narrativeMap';
import { buildMarunouchi, MARUNOUCHI_FOG } from './environments/marunouchi';
import { buildOffice, OFFICE_FOG } from './environments/office';
import { buildPlanning, PLANNING_FOG } from './environments/planning';
import { buildPlanetarium } from './environments/planetarium';
import { buildAtrium, ATRIUM_FOG } from './environments/atrium';
import { buildCorridor, CORRIDOR_FOG, DOOR_W } from './environments/corridor';
import { buildPassage, PASSAGE_FOG } from './environments/passage';
import { buildWorkspace, WORKSPACE_FOG } from './environments/workspace';
import { buildEcosystem, ECOSYSTEM_FOG } from './environments/ecosystem';
import { buildPortal } from './environments/portal';
import { buildModular, HALL_DAIS } from './environments/modular';
import worldGeoJsonRaw from '../data/world.geojson?raw';
import { GLOBANT_PRESENCE, GLOBANT_PRESENCE_POINTS, JAPAN } from '../data/globantPresence';

const latLngToVec3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

// Paleta do globo (mesmos tons dos tokens sumi/washi/beni/ai)
const GLOBE_COLORS = {
  ocean: '#060A12',
  land: '#262D3A',
  border: 'rgba(160, 175, 200, 0.30)',
  coast: 'rgba(170, 186, 210, 0.38)',
  principal: '#F2EEE6', // principais centros da Globant
  subsidiaria: '#5B7DB3', // subsidiária registrada (azul discreto)
  japan: '#D7263D' // destino do projeto
};

/**
 * Textura equiretangular do planeta desenhada a partir do world.geojson.
 * x = (lng + 180) / 360, y = (90 − lat) / 180 — o mesmo mapeamento UV do SphereGeometry.
 */
function buildGlobeTexture(geojsonRaw: string, anisotropy: number): THREE.CanvasTexture {
  const W = 4096;
  const H = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Oceano escuro com leve variação para dar volume
  const ocean = ctx.createLinearGradient(0, 0, 0, H);
  ocean.addColorStop(0, '#05080F');
  ocean.addColorStop(0.5, GLOBE_COLORS.ocean);
  ocean.addColorStop(1, '#05080F');
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, W, H);

  // Retícula muito discreta (paralelos e meridianos a cada 30°)
  ctx.strokeStyle = 'rgba(120, 140, 175, 0.07)';
  ctx.lineWidth = 1.5;
  for (let lng = -180; lng <= 180; lng += 30) {
    const x = ((lng + 180) / 360) * W;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * H;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  const toXY = (pair: [number, number]): [number, number] => [((pair[0] + 180) / 360) * W, ((90 - pair[1]) / 180) * H];
  const tracePolygon = (poly: [number, number][][]) => {
    poly.forEach((ring) => {
      ring.forEach((pair, i) => {
        const [x, y] = toXY(pair);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
    });
  };

  let features: any[] = [];
  try {
    features = JSON.parse(geojsonRaw).features || [];
  } catch {
    features = [];
  }

  const colorFor = (name: string) =>
    name === 'Japan'
      ? GLOBE_COLORS.japan
      : GLOBANT_PRESENCE[name] === 'principal'
      ? GLOBE_COLORS.principal
      : GLOBANT_PRESENCE[name] === 'subsidiaria'
      ? GLOBE_COLORS.subsidiaria
      : GLOBE_COLORS.land;

  // Desenha primeiro os países neutros e depois os destacados (bordas por cima)
  const ordered = [...features].sort((a, b) => {
    const rank = (f: any) => (f.properties?.name === 'Japan' ? 2 : GLOBANT_PRESENCE[f.properties?.name] ? 1 : 0);
    return rank(a) - rank(b);
  });

  ordered.forEach((feat) => {
    const name: string = feat.properties?.name || '';
    const polys: [number, number][][][] =
      feat.geometry?.type === 'Polygon'
        ? [feat.geometry.coordinates]
        : feat.geometry?.type === 'MultiPolygon'
        ? feat.geometry.coordinates
        : [];
    const highlighted = name === 'Japan' || !!GLOBANT_PRESENCE[name];
    ctx.beginPath();
    polys.forEach(tracePolygon);
    ctx.fillStyle = colorFor(name);
    ctx.fill('evenodd');
    ctx.lineJoin = 'round';
    ctx.strokeStyle = name === 'Japan' ? 'rgba(255, 190, 196, 0.9)' : highlighted ? 'rgba(10, 14, 22, 0.55)' : GLOBE_COLORS.border;
    ctx.lineWidth = name === 'Japan' ? 3 : 1.6;
    ctx.stroke();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, anisotropy || 1);
  tex.needsUpdate = true;
  return tex;
}

/** Rótulo em sprite (canvas) — usado para identificar o Japão sem legenda. */
function makeLabelSprite(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '600 120px "Noto Serif JP", "Times New Roman", serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#F2EEE6';
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 24;
    ctx.fillText(text, 24, canvas.height / 2);
  };
  draw();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  // Redesenha quando a fonte editorial terminar de carregar
  document.fonts?.ready.then(() => {
    draw();
    tex.needsUpdate = true;
  });
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false });
  return new THREE.Sprite(mat);
}

/** Rotação do globo que coloca (lat, lng) no centro da visão (câmera no eixo +Z). */
const orientationFor = (lat: number, lng: number) => ({
  y: -Math.PI / 2 - (lng * Math.PI) / 180,
  x: (lat * Math.PI) / 180
});

/**
 * Enquadramento do globo independente da proporção da tela: as poses foram compostas em 16:9;
 * em telas mais estreitas (4:3, 800×600) a câmera recua e o deslocamento lateral acompanha,
 * para o planeta continuar à direita do texto e o Japão inteiro na tela.
 */
function frameGlobePose(pose: { pos: THREE.Vector3; target: THREE.Vector3 }, aspect: number) {
  const ref = 16 / 9;
  if (aspect >= ref) return pose;
  const k = Math.min(1.45, Math.pow(ref / aspect, 0.9));
  const pos = pose.pos.clone();
  const target = pose.target.clone();
  pos.z *= k;
  // mantém a mesma fração horizontal da tela: x ∝ distância × proporção
  const xScale = (k * aspect) / ref;
  pos.x *= xScale * 1.12;
  target.x = pos.x;
  return { pos, target };
}

/**
 * Etapa 8 • Campo de ondas no piso (telas 08.1 e 08.2): crescimento como linguagem visual.
 * - linhas de expansão radiais, que esmaecem com a distância;
 * - anéis-base (equipe → departamentos → empresa) que acendem até o nível escolhido;
 * - ondas ambientais lentas (uma a cada ~5 s, vida de ~10 s), sem girar nada;
 * - pulsos: uma onda mais clara parte de um raio quando o apresentador escolhe algo;
 * - campo de luz suave no centro, que respira devagar e acende com os pulsos.
 * Tudo baseado em tempo (elapsed/dt), não em quadros. Com movimento reduzido: sem ondas.
 */
function createWaveField(baseRadii: number[], maxR = 3.0) {
  const group = new THREE.Group();
  const unitCircle = (() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  })();
  const ring = (color: number, opacity: number) => {
    const m = new THREE.Line(unitCircle, new THREE.LineBasicMaterial({ color, transparent: true, opacity, fog: false }));
    group.add(m);
    return m;
  };

  // linhas radiais (arquitetura do piso)
  const radialMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, fog: false });
  const near = new THREE.Color(0x3a404c);
  const far = new THREE.Color(0x0b0b0d);
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3),
      new THREE.Vector3(Math.cos(a) * maxR, 0, Math.sin(a) * maxR)
    ]);
    g.setAttribute('color', new THREE.Float32BufferAttribute([near.r, near.g, near.b, far.r, far.g, far.b], 3));
    group.add(new THREE.Line(g, radialMat));
  }

  // campo de luz central
  const lightMat = new THREE.ShaderMaterial({
    uniforms: { uOpacity: { value: 0.05 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform float uOpacity; varying vec2 vUv; void main(){ float d = distance(vUv, vec2(0.5)); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(0.95, 0.92, 0.86, 1.0) * a * a * uOpacity; }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false
  });
  const lightField = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2), lightMat);
  lightField.rotation.x = -Math.PI / 2;
  lightField.position.y = -0.002;
  group.add(lightField);

  // anéis-base
  const bases = baseRadii.map((r) => {
    const m = ring(0xf2eee6, 0.1);
    m.scale.set(r, 1, r);
    return { mesh: m, litAt: Number.POSITIVE_INFINITY, lit: false };
  });

  // ondas ambientais e pulsos (pool fixo, sem criar objetos durante a apresentação)
  const ambient = Array.from({ length: 3 }, (_, i) => ({ mesh: ring(0xf2eee6, 0), born: -i * 5 }));
  const pulses = Array.from({ length: 3 }, () => ({ mesh: ring(0xec4a5c, 0), born: -99, from: 0.5, strength: 0 }));
  let nextPulse = 0;
  let lastAmbient = -99;
  let boost = 0;

  const setLit = (level: number, now: number) => {
    bases.forEach((b, i) => {
      const on = i <= level;
      // acende de dentro para fora (160 ms por anel); apaga de fora para dentro
      b.litAt = now + (on ? i * 0.16 : (bases.length - 1 - i) * 0.09);
      b.lit = on;
    });
  };
  const pulse = (from: number, strength: number, now: number) => {
    const p = pulses[nextPulse];
    nextPulse = (nextPulse + 1) % pulses.length;
    p.born = now;
    p.from = from;
    p.strength = strength;
    boost = Math.max(boost, 0.06 * strength);
  };

  const update = (elapsed: number, dt: number, reduced: boolean) => {
    // anéis-base: opacidade alvo depende de estarem acesos (com o atraso de cada um)
    bases.forEach((b) => {
      const target = elapsed >= b.litAt ? (b.lit ? 0.5 : 0.1) : (b.mesh.material as THREE.LineBasicMaterial).opacity > 0.3 ? 0.5 : 0.1;
      const mat = b.mesh.material as THREE.LineBasicMaterial;
      mat.opacity += (target - mat.opacity) * Math.min(1, dt * 5);
      mat.color.setHex(b.lit ? 0xec4a5c : 0xf2eee6);
    });
    // campo de luz: respiração lenta (~9 s) + reforço dos pulsos
    boost = Math.max(0, boost - dt * 0.03);
    lightMat.uniforms.uOpacity.value = 0.045 + (reduced ? 0 : Math.sin(elapsed * 0.7) * 0.012) + boost;
    if (reduced) {
      ambient.forEach((a) => ((a.mesh.material as THREE.LineBasicMaterial).opacity = 0));
      pulses.forEach((p) => ((p.mesh.material as THREE.LineBasicMaterial).opacity = 0));
      return;
    }
    // ondas ambientais: nascem a cada 5 s, crescem devagar e somem
    if (elapsed - lastAmbient > 5) {
      lastAmbient = elapsed;
      const a = ambient.reduce((o, x) => (x.born < o.born ? x : o));
      a.born = elapsed;
    }
    ambient.forEach((a) => {
      const t = (elapsed - a.born) / 10;
      const mat = a.mesh.material as THREE.LineBasicMaterial;
      if (t < 0 || t > 1) {
        mat.opacity = 0;
        return;
      }
      const r = 0.35 + (maxR - 0.35) * (1 - Math.pow(1 - t, 2));
      a.mesh.scale.set(r, 1, r);
      mat.opacity = Math.sin(t * Math.PI) * 0.16;
    });
    // pulsos: onda clara a partir do raio escolhido (2,4 s)
    pulses.forEach((p) => {
      const t = (elapsed - p.born) / 2.4;
      const mat = p.mesh.material as THREE.LineBasicMaterial;
      if (t < 0 || t > 1) {
        mat.opacity = 0;
        return;
      }
      const e = 1 - Math.pow(1 - t, 3);
      const r = p.from + (maxR - p.from) * e;
      p.mesh.scale.set(r, 1, r);
      mat.opacity = (1 - t) * 0.55 * p.strength;
    });
  };

  return { group, update, setLit, pulse };
}

/**
 * Etapa 8.2 • Estrutura de crescimento da tela 08 (uma composição só, que evolui por cena).
 * Nível 1 Start (equipe) • 2 Business (departamentos) • 3 Enterprise (empresa) • 4 simulador (visão consolidada).
 * - piso: anéis concêntricos (equipe → departamentos → empresa) que acendem até o nível;
 * - núcleo: três plataformas de laca com aro dourado e filete vermelho, ligadas por um eixo;
 * - colunas de dados que sobem em cada anel (4, 8 e 12), mais altas a cada nível;
 * - conexões que convergem das colunas para o núcleo, desenhadas progressivamente;
 * - nível 4: anel de receita com 12 segmentos (1 mês = MRR; 12 meses = ARR).
 * Tudo por tempo (elapsed/dt), sem rotação contínua. Movimento reduzido: estados finais.
 */
function createGrowthStructure() {
  const group = new THREE.Group();
  const RADII = [0.6, 1.1, 1.6];
  const floor = createWaveField(RADII, 2.7);
  group.add(floor.group);

  const lacquer = new THREE.MeshStandardMaterial({ color: 0x1d1d23, roughness: 0.28, metalness: 0.2 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xb08a45, roughness: 0.35, metalness: 0.7, emissive: new THREE.Color(0x2a1d08) });
  const red = new THREE.MeshStandardMaterial({ color: 0xc21d33, roughness: 0.45, metalness: 0.05, emissive: new THREE.Color(0x5a0814) });
  const key = new THREE.DirectionalLight(0xfff1dc, 1.8);
  key.position.set(-1.5, 3, 2.5);
  const fill = new THREE.AmbientLight(0x8a90a0, 0.55);
  group.add(key, fill);

  const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
  type El = { level: number; delay: number; dur: number; p: number; apply: (e: number) => void };
  const els: El[] = [];
  const track = (level: number, delay: number, dur: number, apply: (e: number) => void) => {
    const el = { level, delay, dur, p: 0, apply };
    els.push(el);
    apply(0);
    return el;
  };

  // Núcleo: três plataformas que sobem uma por nível
  const TIER_Y = [0.06, 0.42, 0.78];
  const TIER_R = [0.36, 0.27, 0.18];
  const spineGeo = new THREE.CylinderGeometry(0.016, 0.016, 1, 16);
  spineGeo.translate(0, 0.5, 0);
  const spine = new THREE.Mesh(spineGeo, gold);
  group.add(spine);
  const tiers = TIER_Y.map((y, i) => {
    const tier = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(TIER_R[i], TIER_R[i] * 1.06, 0.06, 64), lacquer);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(TIER_R[i] * 1.0, 0.009, 8, 96), gold);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.032;
    const band = new THREE.Mesh(new THREE.TorusGeometry(TIER_R[i] * 1.07, 0.007, 8, 96), red);
    band.rotation.x = Math.PI / 2;
    band.position.y = -0.012;
    tier.add(disc, rim, band);
    group.add(tier);
    return track(i + 1, 0.05, 0.8, (e) => {
      tier.visible = e > 0.001;
      tier.scale.set(0.6 + 0.4 * e, Math.max(0.001, e), 0.6 + 0.4 * e);
      tier.position.y = y - 0.14 * (1 - e);
    });
  });
  // Remate do Enterprise: haste dourada e ponto vermelho no topo
  const crown = new THREE.Group();
  const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, 0.16, 16), gold);
  finial.position.y = 0.08;
  const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.035, 24, 16), red);
  jewel.position.y = 0.18;
  crown.add(finial, jewel);
  crown.position.y = TIER_Y[2] + 0.03;
  group.add(crown);
  track(3, 1.1, 0.6, (e) => {
    crown.visible = e > 0.001;
    crown.scale.setScalar(Math.max(0.001, e));
  });

  // Colunas de dados por anel e conexões que convergem para o núcleo
  const pillarGeo = new THREE.CylinderGeometry(0.006, 0.006, 1, 8);
  pillarGeo.translate(0, 0.5, 0);
  const pillarMat = new THREE.MeshBasicMaterial({ color: 0xd9c493, transparent: true, opacity: 0.7, fog: false });
  const capGeo = new THREE.SphereGeometry(0.022, 16, 12);
  const capMat = new THREE.MeshBasicMaterial({ color: 0xec4a5c, fog: false });
  const COUNTS = [4, 8, 12];
  const BASE_H = [0.22, 0.38, 0.56];
  const linkMats = COUNTS.map(() => new THREE.LineBasicMaterial({ color: 0xec4a5c, transparent: true, opacity: 0.5, fog: false }));
  const SEG = 28;
  COUNTS.forEach((n, ring) => {
    const r = RADII[ring];
    const offset = ring * 0.37;
    for (let k = 0; k < n; k++) {
      const a = offset + (k / n) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const h = BASE_H[ring] + 0.09 * Math.abs(Math.sin(k * 1.7 + ring));
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(x, 0, z);
      const cap = new THREE.Mesh(capGeo, capMat);
      group.add(pillar, cap);
      track(ring + 1, 0.3 + k * 0.045, 0.7, (e) => {
        pillar.visible = e > 0.001;
        cap.visible = e > 0.001;
        pillar.scale.set(1, Math.max(0.001, h * e), 1);
        cap.position.set(x, h * e, z);
      });
      // conexão: do topo da coluna até a plataforma do mesmo nível, em arco
      const to = new THREE.Vector3(0, TIER_Y[ring] + 0.04, 0);
      const from = new THREE.Vector3(x, h, z);
      const ctrl = new THREE.Vector3(x * 0.45, Math.max(h, to.y) + 0.22, z * 0.45);
      const pts = new THREE.QuadraticBezierCurve3(from, ctrl, to).getPoints(SEG);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, linkMats[ring]);
      group.add(line);
      track(ring + 1, 0.75 + k * 0.035, 0.7, (e) => {
        line.visible = e > 0.001;
        geo.setDrawRange(0, Math.max(0, Math.round((SEG + 1) * e)));
      });
    }
  });

  // Anel de receita (nível 4): 12 segmentos = 12 meses; o primeiro é o MRR
  const REV_R = 2.05;
  const revMats = Array.from({ length: 12 }, (_, i) =>
    new THREE.MeshBasicMaterial({ color: i === 0 ? 0xf2eee6 : 0xd7263d, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, fog: false })
  );
  revMats.forEach((m, i) => {
    const gap = 0.05;
    const start = Math.PI / 2 + (i / 12) * Math.PI * 2 + gap / 2;
    const seg = new THREE.Mesh(new THREE.RingGeometry(REV_R, REV_R + 0.07, 24, 1, start, (Math.PI * 2) / 12 - gap), m);
    seg.rotation.x = -Math.PI / 2;
    seg.position.y = 0.006;
    group.add(seg);
  });

  let level = 0;
  let changedAt = 0;
  let revenueAt = -99;

  const setLevel = (next: number, now: number) => {
    if (next === level) return;
    if (next === 0) {
      els.forEach((el) => {
        el.p = 0;
        el.apply(0);
      });
      revMats.forEach((m) => (m.opacity = 0));
    } else {
      floor.setLit(Math.min(3, next) - 1, now);
      if (next > level && next <= 3) floor.pulse(RADII[next - 1], 1, now);
      if (next === 4) {
        revenueAt = now;
        floor.pulse(1.6, 0.8, now);
      }
    }
    level = next;
    changedAt = now;
  };

  const revenuePulse = (strength: number, now: number) => {
    if (level !== 4) return;
    revenueAt = now;
    floor.pulse(0.6, strength, now);
  };

  const update = (elapsed: number, dt: number, reduced: boolean) => {
    floor.update(elapsed, dt, reduced);
    els.forEach((el) => {
      const on = level >= el.level;
      let p = el.p;
      if (on) {
        if (reduced) p += dt / 0.3;
        else if (p > 0 || elapsed - changedAt >= el.delay) p += dt / el.dur;
      } else p -= dt / (reduced ? 0.25 : 0.45);
      p = Math.min(1, Math.max(0, p));
      if (p !== el.p) {
        el.p = p;
        el.apply(on ? easeOut(p) : p * p);
      }
    });
    // eixo do núcleo acompanha a plataforma mais alta já erguida
    let top = 0;
    tiers.forEach((t, i) => (top = Math.max(top, (TIER_Y[i] + 0.03) * easeOut(t.p))));
    spine.visible = top > 0.01;
    spine.scale.set(1, Math.max(0.001, top), 1);
    // anel de receita: MRR (1 mês) e depois os outros 11 meses → ARR, no ritmo da conta na tela
    const t = level === 4 ? (reduced ? 99 : elapsed - revenueAt) : -1;
    revMats.forEach((m, i) => {
      let target = 0;
      if (t >= 0) {
        const start = i === 0 ? 0.5 : 1.45 + ((i - 1) / 11) * 0.8;
        target = (i === 0 ? 0.95 : 0.8) * Math.min(1, Math.max(0, (t - start) / 0.3));
      }
      if (t < 0) m.opacity = Math.max(0, m.opacity - dt * 3);
      else if (reduced) m.opacity += (target - m.opacity) * Math.min(1, dt * 8);
      else m.opacity = target;
    });
    linkMats.forEach((m) => (m.opacity = level >= 3 ? 0.62 : 0.5));
  };

  return { group, setLevel, update, revenuePulse };
}

/** Impressão do Hanko 承認 em tinta vermelha (fundo transparente) para a placa de washi. */
function makeSealTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const draw = () => {
    ctx.clearRect(0, 0, 256, 256);
    ctx.strokeStyle = '#b8142a';
    ctx.lineWidth = 14;
    ctx.beginPath();
    const r = 26;
    ctx.moveTo(24 + r, 24);
    ctx.arcTo(232, 24, 232, 232, r);
    ctx.arcTo(232, 232, 24, 232, r);
    ctx.arcTo(24, 232, 24, 24, r);
    ctx.arcTo(24, 24, 232, 24, r);
    ctx.stroke();
    ctx.fillStyle = '#b8142a';
    ctx.font = '700 92px "Noto Serif JP", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('承', 128, 84);
    ctx.fillText('認', 128, 176);
  };
  draw();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  document.fonts?.ready.then(() => {
    draw();
    tex.needsUpdate = true;
  });
  return tex;
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const WorldStage: React.FC = () => {
  const { currentIndex, sceneIndex, safeMode } = usePresentation();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef({ currentIndex, sceneIndex });
  stateRef.current = { currentIndex, sceneIndex };

  useEffect(() => {
    if (safeMode) return;
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05080d, 0.16);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.4, 4.6);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // =========================================================================
    // 01 & 15. GLOBO GEOGRÁFICO (TELA 01 E TELA 12)
    // Etapa 8: a geografia é o elemento narrativo. Países com presença da Globant
    // (Form 20-F 2025) em branco/azul discreto; o Japão, destino do projeto, em vermelho.
    // =========================================================================
    const globeRoot = new THREE.Group();
    scene.add(globeRoot);
    const GLOBE_R = 1.18;

    const globeTexture = buildGlobeTexture(worldGeoJsonRaw, renderer.capabilities.getMaxAnisotropy());
    const globeGeo = new THREE.SphereGeometry(GLOBE_R, 128, 96);
    const globeMat = new THREE.MeshPhongMaterial({
      map: globeTexture,
      emissiveMap: globeTexture,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.5, // o lado em sombra continua legível
      specular: new THREE.Color(0x2a3a55),
      shininess: 18,
      transparent: true,
      opacity: 1,
      fog: false // a névoa da cena apagava a geografia
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeRoot.add(globeMesh);

    // Atmosfera discreta (borda azul fria)
    const atmosGeo = new THREE.SphereGeometry(GLOBE_R * 1.045, 64, 48);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.2);
          gl_FragColor = vec4(0.36, 0.52, 0.82, 1.0) * intensity * 0.55 * uOpacity;
        }
      `,
      uniforms: { uOpacity: { value: 1 } },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      fog: false
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeRoot.add(atmosMesh);

    // Iluminação controlada: luz-chave fria do alto à esquerda + preenchimento baixo.
    // Fica fora do globeRoot (não gira com o planeta) e só existe quando o globo aparece.
    const globeLights = new THREE.Group();
    scene.add(globeLights);
    const keyLight = new THREE.DirectionalLight(0xdfe8ff, 1.35);
    keyLight.position.set(-3.2, 2.4, 3.6);
    globeLights.add(keyLight);
    globeLights.add(new THREE.AmbientLight(0x8090b0, 0.38));

    // Japão: halo vermelho e rótulo, para ser identificado sem legenda
    const japanPos = latLngToVec3(JAPAN.lat, JAPAN.lng, GLOBE_R * 1.004);
    const japanHaloMat = new THREE.MeshBasicMaterial({
      color: 0xd7263d,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const japanHalo = new THREE.Mesh(new THREE.RingGeometry(0.105, 0.118, 64), japanHaloMat);
    japanHalo.position.copy(japanPos);
    japanHalo.lookAt(japanPos.clone().multiplyScalar(2));
    globeRoot.add(japanHalo);

    const japanLabel = makeLabelSprite('日本  JAPÃO');
    japanLabel.position.copy(latLngToVec3(JAPAN.lat + 12, JAPAN.lng - 2, GLOBE_R * 1.08));
    japanLabel.scale.set(0.42, 0.105, 1);
    (japanLabel.material as THREE.SpriteMaterial).opacity = 0;
    globeRoot.add(japanLabel);

    // Jurisdições pequenas demais para o mapa base (Singapura, Hong Kong)
    GLOBANT_PRESENCE_POINTS.forEach((pt) => {
      const dot = new THREE.Mesh(
        new THREE.CircleGeometry(0.012, 20),
        new THREE.MeshBasicMaterial({ color: 0x86a3cf, transparent: true, opacity: 0.95, side: THREE.DoubleSide })
      );
      const pos = latLngToVec3(pt.lat, pt.lng, GLOBE_R * 1.003);
      dot.position.copy(pos);
      dot.lookAt(pos.clone().multiplyScalar(2));
      globeRoot.add(dot);
    });

    // =========================================================================
    // 02. TOKYO 3D SKYLINE GROUP (SCENE 02: POR QUE JAPÃO)
    // =========================================================================
    const tokyoSkylineGroup = new THREE.Group();
    scene.add(tokyoSkylineGroup);

    // Ground Neon Grid
    const gridHelper = new THREE.GridHelper(18, 36, 0xef4444, 0x1e293b);
    gridHelper.position.y = -1.2;
    tokyoSkylineGroup.add(gridHelper);

    // Skyscraper Monoliths
    const bldgMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, wireframe: true, transparent: true, opacity: 0.35 });
    const bldgSolidMat = new THREE.MeshBasicMaterial({ color: 0x080d1a, transparent: true, opacity: 0.85 });
    const bldgGroup = new THREE.Group();
    tokyoSkylineGroup.add(bldgGroup);

    const cityTowers: { mesh: THREE.Mesh; beacon?: THREE.Mesh; isHub?: boolean }[] = [];
    const towerCoords = [
      { x: -1.2, z: -1.8, h: 2.8, w: 0.45, label: 'Tokyo Central', color: 0xef4444 },
      { x: 1.4, z: -2.2, h: 2.3, w: 0.4, label: 'Osaka Kansai', color: 0xf59e0b },
      { x: 0.2, z: -3.2, h: 2.1, w: 0.35, label: 'Nagoya Chubu', color: 0x38bdf8 },
      { x: -2.2, z: -2.8, h: 1.8, w: 0.3 },
      { x: 2.4, z: -1.5, h: 1.9, w: 0.35 },
      { x: -0.5, z: -1.2, h: 2.4, w: 0.5 },
      { x: 0.8, z: -1.4, h: 2.0, w: 0.4 },
      { x: -1.8, z: -0.8, h: 1.4, w: 0.3 },
      { x: 1.8, z: -0.9, h: 1.6, w: 0.35 },
      { x: 0, z: -2.4, h: 3.1, w: 0.55, isHub: true, color: 0xe11d48 }
    ];

    towerCoords.forEach((t) => {
      const geo = new THREE.BoxGeometry(t.w, t.h, t.w);
      const wire = new THREE.Mesh(geo, bldgMat);
      const solid = new THREE.Mesh(geo, bldgSolidMat);
      const tower = new THREE.Group();
      tower.add(solid);
      tower.add(wire);
      tower.position.set(t.x, -1.2 + t.h / 2, t.z);

      if (t.color) {
        const beaconGeo = new THREE.SphereGeometry(0.045, 12, 12);
        const beaconMat = new THREE.MeshBasicMaterial({ color: t.color });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(0, t.h / 2 + 0.05, 0);
        tower.add(beacon);
      }

      bldgGroup.add(tower);
      cityTowers.push({ mesh: solid, isHub: t.isHub });
    });

    // =========================================================================
    // 03. CORREDOR ESCURO EM PERSPECTIVA (TELA 03, CENAS 1–4)
    // Etapa 8: as quatro molduras coloridas saíram; as portas identificadas ficam na
    // camada da tela. O 3D dá profundidade: corredor de pilares e uma luz que acompanha a porta aberta.
    // =========================================================================
    const corridorGroup = new THREE.Group();
    scene.add(corridorGroup);

    // Sem névoa: a profundidade vem das próprias cores (claro na frente, escuro ao fundo)
    const corridorLineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, fog: false });
    const NEAR_C = new THREE.Color(0x323843);
    const FAR_C = new THREE.Color(0x0b0b0d);
    const depthColor = (z: number) => NEAR_C.clone().lerp(FAR_C, Math.min(1, Math.max(0, (1.5 - z) / 10.5)));
    const addLine = (pts: THREE.Vector3[]) => {
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      const cols: number[] = [];
      pts.forEach((pt) => {
        const c = depthColor(pt.z);
        cols.push(c.r, c.g, c.b);
      });
      g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
      corridorGroup.add(new THREE.Line(g, corridorLineMat));
    };
    const HALF_W = 2.3;
    const FLOOR_Y = -1.05;
    const CEIL_Y = 1.25;
    // linhas longitudinais do piso e do teto (fogem para o fundo)
    [-HALF_W, -1.15, 0, 1.15, HALF_W].forEach((x) => {
      addLine([new THREE.Vector3(x, FLOOR_Y, 1.5), new THREE.Vector3(x, FLOOR_Y, -9)]);
      addLine([new THREE.Vector3(x, CEIL_Y, 1.5), new THREE.Vector3(x, CEIL_Y, -9)]);
    });
    // pilares e vigas (ritmo arquitetônico), cada vez mais distantes
    for (let i = 0; i < 7; i++) {
      const z = 0.8 - i * 1.45;
      const shade = depthColor(z).multiplyScalar(0.42);
      const pillarMat = new THREE.MeshBasicMaterial({ color: shade, fog: false });
      const beamMat = new THREE.MeshBasicMaterial({ color: shade.clone().multiplyScalar(1.15), fog: false });
      [-HALF_W, HALF_W].forEach((x) => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.12, CEIL_Y - FLOOR_Y, 0.12), pillarMat);
        pillar.position.set(x, (CEIL_Y + FLOOR_Y) / 2, z);
        corridorGroup.add(pillar);
      });
      const beam = new THREE.Mesh(new THREE.BoxGeometry(HALF_W * 2 + 0.12, 0.08, 0.12), beamMat);
      beam.position.set(0, CEIL_Y, z);
      corridorGroup.add(beam);
      addLine([new THREE.Vector3(-HALF_W, FLOOR_Y, z), new THREE.Vector3(HALF_W, FLOOR_Y, z)]);
    }

    // luz suave (branco quente, sem vermelho) que segue a porta aberta
    const beamShader = {
      uniforms: { uOpacity: { value: 0.0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float h = smoothstep(0.0, 0.45, 1.0 - abs(vUv.x - 0.5) * 2.0);
          float v = smoothstep(0.0, 0.9, vUv.y) * (1.0 - smoothstep(0.92, 1.0, vUv.y));
          gl_FragColor = vec4(0.95, 0.92, 0.86, 1.0) * h * v * uOpacity;
        }
      `
    };
    const lightShaft = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, CEIL_Y - FLOOR_Y),
      new THREE.ShaderMaterial({ ...beamShader, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
    );
    lightShaft.position.set(0, (CEIL_Y + FLOOR_Y) / 2, -1.2);
    corridorGroup.add(lightShaft);
    const floorPool = new THREE.Mesh(
      new THREE.CircleGeometry(0.75, 48),
      new THREE.MeshBasicMaterial({ color: 0xf2eee6, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })
    );
    floorPool.rotation.x = -Math.PI / 2;
    floorPool.scale.set(1, 0.45, 1);
    floorPool.position.set(0, FLOOR_Y + 0.005, -1.2);
    corridorGroup.add(floorPool);

    // =========================================================================
    // 04. GLOBAL × LOCAL FUSION GROUP (SCENE 04)
    // =========================================================================
    const fusionGroup = new THREE.Group();
    scene.add(fusionGroup);

    // Left Global Block (Blue crystalline structure)
    const globalBlockGeo = new THREE.IcosahedronGeometry(0.65, 1);
    const globalBlockMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.65 });
    const globalBlock = new THREE.Mesh(globalBlockGeo, globalBlockMat);
    fusionGroup.add(globalBlock);

    // Right Local Block (Warm Gold / Kumiko Lattice cube)
    const localBlockGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
    const localBlockMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: 0.75 });
    const localBlock = new THREE.Mesh(localBlockGeo, localBlockMat);
    fusionGroup.add(localBlock);

    // Central Kanji Spark Ring
    const sparkRingGeo = new THREE.RingGeometry(0.5, 0.65, 32);
    const sparkRingMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    const sparkRing = new THREE.Mesh(sparkRingGeo, sparkRingMat);
    sparkRing.visible = false;
    fusionGroup.add(sparkRing);

    // =========================================================================
    // 05. THREAD WEAVING UI GROUP (SCENE 05: KIZUNA)
    // =========================================================================
    const threadWeaveGroup = new THREE.Group();
    scene.add(threadWeaveGroup);

    // Etapa 8: tubo e nós vermelhos decorativos removidos.

    // Floating UI wireframe plane
    const uiBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.0),
      new THREE.MeshBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.25, wireframe: true })
    );
    threadWeaveGroup.add(uiBoard);

    // =========================================================================
    // 06. LIVE TASK PIPELINE GROUP (SCENE 06: COMO FUNCIONA)
    // =========================================================================
    const taskPipelineGroup = new THREE.Group();
    scene.add(taskPipelineGroup);
    // Etapa 8: trilho abaixo do painel de estado (não passa atrás dos números da tela 05)
    taskPipelineGroup.position.y = -0.45;

    // Pipeline Rail
    const pipeLineGeo = new THREE.CylinderGeometry(0.02, 0.02, 3.2, 16);
    const pipeLineMat = new THREE.MeshBasicMaterial({ color: 0x3a404c, transparent: true, opacity: 0.4 });
    const pipeLine = new THREE.Mesh(pipeLineGeo, pipeLineMat);
    pipeLine.rotation.z = Math.PI / 2;
    taskPipelineGroup.add(pipeLine);

    // 5 estações = 5 passos da demonstração (a do passo atual acende em vermelho)
    const pipelineStations: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.015, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0x5c6474, transparent: true, opacity: 0.5 })
      );
      ring.position.x = -1.4 + i * 0.7;
      taskPipelineGroup.add(ring);
      pipelineStations.push(ring);
    }

    // Moving Task Capsule
    const taskCapsule = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.06, 0.12, 8, 16),
      new THREE.MeshBasicMaterial({ color: 0xf2eee6, wireframe: true, transparent: true, opacity: 0.8 })
    );
    taskCapsule.rotation.z = Math.PI / 2;
    taskPipelineGroup.add(taskCapsule);

    // =========================================================================
    // 07. ESTRUTURA DE CRESCIMENTO (TELA 08: PLANOS E RECEITA) — Etapa 8.2
    // Uma composição só para as 4 cenas: cenário 6 (Start, Business, Enterprise) e
    // cenário 12 (simulador). Fica à direita; o texto da tela fica à esquerda.
    // =========================================================================
    const modularScaleGroup = new THREE.Group();
    scene.add(modularScaleGroup);
    const growth = createGrowthStructure();
    modularScaleGroup.add(growth.group);
    // Etapa 10: a estrutura fica no estrado da sala depois do portão (atrás do paredão da tela 07)
    modularScaleGroup.position.set(HALL_DAIS.x, -1.05, HALL_DAIS.z);
    modularScaleGroup.scale.setScalar(0.72);

    // =========================================================================
    // 08. ADAPTATION METAMORPHOSIS GROUP (SCENE 08: ADAPTAÇÃO)
    // =========================================================================
    const adaptationMorphGroup = new THREE.Group();
    scene.add(adaptationMorphGroup);
    // Etapa 8 • transições: duas camadas de treliça kumiko em profundidade. Cena 06.1 ilumina a da frente
    // (comunicação: idioma e formatos); na 06.2 a câmera atravessa para a de trás (decisão e conformidade),
    // que tem o detalhe vermelho. Linhas finas e discretas, atrás do texto.
    const makeKumiko = (z: number, w: number, h: number, cols: number, rows: number) => {
      const g = new THREE.Group();
      const pts: number[] = [];
      const seg = (x1: number, y1: number, x2: number, y2: number) => pts.push(x1, y1, 0, x2, y2, 0);
      for (let i = 0; i <= cols; i++) seg(-w / 2 + (i * w) / cols, -h / 2, -w / 2 + (i * w) / cols, h / 2);
      for (let j = 0; j <= rows; j++) seg(-w / 2, -h / 2 + (j * h) / rows, w / 2, -h / 2 + (j * h) / rows);
      // losangos em células alternadas (padrão de treliça)
      const cw = w / cols;
      const ch = h / rows;
      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++) {
          if ((i + j) % 2) continue;
          const cx = -w / 2 + (i + 0.5) * cw;
          const cy = -h / 2 + (j + 0.5) * ch;
          seg(cx, cy + ch / 2, cx + cw / 2, cy);
          seg(cx + cw / 2, cy, cx, cy - ch / 2);
          seg(cx, cy - ch / 2, cx - cw / 2, cy);
          seg(cx - cw / 2, cy, cx, cy + ch / 2);
        }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      const mat = new THREE.LineBasicMaterial({ color: 0xd9c493, transparent: true, opacity: 0, fog: false, depthWrite: false });
      g.add(new THREE.LineSegments(geo, mat));
      const glowMat = new THREE.ShaderMaterial({
        uniforms: { uOpacity: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform float uOpacity; varying vec2 vUv; void main(){ vec2 c = vUv - 0.5; float a = smoothstep(0.55, 0.0, length(c * vec2(1.0, 1.4))); gl_FragColor = vec4(1.0, 0.9, 0.76, 1.0) * a * uOpacity; }`,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false
      });
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.1, h * 1.1), glowMat);
      glow.position.z = -0.08;
      g.add(glow);
      g.position.set(0.5, 0, z);
      adaptationMorphGroup.add(g);
      return { mat, glowMat };
    };
    const kumikoFront = makeKumiko(-1.4, 5.4, 3.2, 12, 7);
    const kumikoBack = makeKumiko(-4.8, 6.4, 3.8, 12, 7);
    // detalhe vermelho da camada de decisão: um quadro de selo no alto, à direita
    const kumikoSealMat = new THREE.LineBasicMaterial({ color: 0xd7263d, transparent: true, opacity: 0, fog: false, depthWrite: false });
    {
      const s = 0.36;
      const p = [-s, -s, 0, s, -s, 0, s, -s, 0, s, s, 0, s, s, 0, -s, s, 0, -s, s, 0, -s, -s, 0];
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
      const seal = new THREE.LineSegments(geo, kumikoSealMat);
      seal.position.set(1.55, 0.7, -4.75);
      adaptationMorphGroup.add(seal);
    }

    // Etapa 8: a moldura aramada (linha diagonal sobre o conteúdo) foi removida; o cenário fica limpo.

    // Etapa 8: disco vermelho decorativo removido (o vermelho fica para o que tem função)

    // =========================================================================
    // 09. PORTAL DE APROVAÇÃO (TELA 07) — Etapa 8.2
    // Peça arquitetônica: montantes de laca preta com capitéis em dourado envelhecido,
    // lintel com faixa vermelha, placa de washi para o Hanko, dois painéis shoji deslizantes
    // com trava dourada na emenda e, atrás, um espaço iluminado revelado ao abrir.
    // Cena 07.1: fechado. Cena 07.2: sequência automática (ver animate).
    // =========================================================================
    const gateGroup = new THREE.Group();
    scene.add(gateGroup);
    gateGroup.position.y = -0.5;

    const lacquer = new THREE.MeshStandardMaterial({ color: 0x1b1b21, roughness: 0.26, metalness: 0.2 });
    const lacquerSoft = new THREE.MeshStandardMaterial({ color: 0x1a1a1f, roughness: 0.45, metalness: 0.1 });
    const kizunaRed = new THREE.MeshStandardMaterial({ color: 0xb3182c, roughness: 0.5, metalness: 0.05 });
    const agedGold = new THREE.MeshStandardMaterial({ color: 0xb08a45, roughness: 0.35, metalness: 0.7, emissive: new THREE.Color(0x2a1d08) });
    const box = (w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      mesh.position.set(x, y, z);
      return mesh;
    };

    // luzes do portal (só existem quando o portal está visível)
    const portalKey = new THREE.DirectionalLight(0xfff1dc, 2.0);
    portalKey.position.set(0.6, 2.6, 3.2);
    const portalFill = new THREE.AmbientLight(0x9098aa, 0.6);
    const portalPoint = new THREE.PointLight(0xffe2c4, 0, 3, 2); // pulso do carimbo
    portalPoint.position.set(0, 0.8, 0.6);
    gateGroup.add(portalKey, portalFill, portalPoint);

    const POST_X = 1.0;
    [-1, 1].forEach((s) => {
      gateGroup.add(box(0.11, 2.05, 0.11, lacquer, s * POST_X, 0, 0.04));
      gateGroup.add(box(0.15, 0.05, 0.15, agedGold, s * POST_X, -1.0, 0.04)); // base
      gateGroup.add(box(0.15, 0.05, 0.15, agedGold, s * POST_X, 0.98, 0.04)); // capitel
      gateGroup.add(box(0.018, 1.86, 0.004, kizunaRed, s * POST_X, -0.02, 0.1)); // filete vermelho
    });
    gateGroup.add(box(2.6, 0.09, 0.17, lacquer, 0, 1.12, 0.04)); // lintel (kasagi)
    gateGroup.add(box(2.4, 0.05, 0.13, kizunaRed, 0, 1.045, 0.04)); // faixa vermelha
    [-1, 1].forEach((s) => gateGroup.add(box(0.07, 0.11, 0.18, agedGold, s * 1.31, 1.12, 0.04)));
    gateGroup.add(box(2.0, 0.05, 0.09, lacquerSoft, 0, 0.6, 0.0)); // trilho superior dos shoji
    gateGroup.add(box(2.2, 0.06, 0.2, lacquer, 0, -1.0, 0.02)); // soleira

    // Placa do Hanko: moldura de laca, borda dourada, centro de washi
    const plaqueY = 0.82;
    gateGroup.add(box(0.38, 0.3, 0.05, lacquer, 0, plaqueY, 0.04));
    const plaqueEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.38, 0.3, 0.05)),
      new THREE.LineBasicMaterial({ color: 0xb8954f })
    );
    plaqueEdge.position.set(0, plaqueY, 0.04);
    gateGroup.add(plaqueEdge);
    const washiFace = new THREE.Mesh(
      new THREE.PlaneGeometry(0.28, 0.22),
      new THREE.MeshStandardMaterial({ color: 0xece2cf, roughness: 0.9, metalness: 0, emissive: new THREE.Color(0x6a5f4c) })
    );
    washiFace.position.set(0, plaqueY, 0.067);
    gateGroup.add(washiFace);
    const sealMat = new THREE.MeshBasicMaterial({ map: makeSealTexture(), transparent: true, opacity: 0, depthWrite: false });
    const sealMark = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.19), sealMat);
    sealMark.position.set(0, plaqueY, 0.069);
    sealMark.rotation.z = -0.06;
    gateGroup.add(sealMark);

    // Painéis shoji (moldura de laca, kumiko, papel washi translúcido)
    const PANEL_W = 0.96;
    const PANEL_H = 1.52;
    const PANEL_Y = -0.18;
    const washiMat = new THREE.MeshBasicMaterial({ color: 0xf6e3c2, transparent: true, opacity: 0.22, depthWrite: false });
    const kumikoMat = new THREE.MeshStandardMaterial({ color: 0x2b2620, roughness: 0.6, metalness: 0.2 });
    const makeShoji = () => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.PlaneGeometry(PANEL_W - 0.04, PANEL_H - 0.04), washiMat));
      g.add(box(PANEL_W, 0.04, 0.05, lacquer, 0, PANEL_H / 2, 0));
      g.add(box(PANEL_W, 0.04, 0.05, lacquer, 0, -PANEL_H / 2, 0));
      g.add(box(0.04, PANEL_H, 0.05, lacquer, -PANEL_W / 2, 0, 0));
      g.add(box(0.04, PANEL_H, 0.05, lacquer, PANEL_W / 2, 0, 0));
      [-0.27, 0, 0.27].forEach((x) => g.add(box(0.012, PANEL_H, 0.02, kumikoMat, x, 0, 0.01)));
      [-0.5, -0.17, 0.17, 0.5].forEach((y) => g.add(box(PANEL_W, 0.012, 0.02, kumikoMat, 0, y, 0.01)));
      return g;
    };
    const shojiL = makeShoji();
    const shojiR = makeShoji();
    shojiL.position.set(-PANEL_W / 2, PANEL_Y, 0);
    shojiR.position.set(PANEL_W / 2, PANEL_Y, 0);
    gateGroup.add(shojiL, shojiR);
    // costura vermelha entre os painéis
    const seam = box(0.012, PANEL_H, 0.06, kizunaRed, 0, PANEL_Y, 0.01);
    gateGroup.add(seam);

    // Trava dourada na emenda: disco com centro vermelho e lingueta horizontal
    const lockGroup = new THREE.Group();
    const lockDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.025, 40), agedGold);
    lockDisc.rotation.x = Math.PI / 2;
    const lockCore = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 32), kizunaRed);
    lockCore.rotation.x = Math.PI / 2;
    lockCore.position.z = 0.006;
    const latch = box(0.24, 0.03, 0.03, agedGold, 0, 0, 0.02);
    lockGroup.add(lockDisc, lockCore, latch);
    lockGroup.position.set(0, PANEL_Y + 0.05, 0.05);
    gateGroup.add(lockGroup);

    // Espaço do outro lado: luz quente e um caminho que segue para o fundo
    const beyondMat = new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 0.24 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform float uOpacity; varying vec2 vUv; void main(){ vec2 c = vUv - vec2(0.5, 0.42); float d = length(c * vec2(1.0, 0.8)); float a = smoothstep(0.62, 0.0, d); gl_FragColor = vec4(1.0, 0.93, 0.82, 1.0) * a * uOpacity; }`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false
    });
    const beyond = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.1), beyondMat);
    beyond.position.set(0, -0.05, -0.55);
    gateGroup.add(beyond);
    const pathMat = new THREE.LineBasicMaterial({ color: 0xe9dcc4, transparent: true, opacity: 0, fog: false });
    [-0.5, 0, 0.5].forEach((x) => {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, -0.97, -0.1), new THREE.Vector3(x * 0.25, -0.97, -4.5)]);
      gateGroup.add(new THREE.Line(g, pathMat));
    });
    for (let i = 0; i < 6; i++) {
      const z = -0.6 - i * 0.7;
      const w = 1.1 - i * 0.12;
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-w / 2, -0.97, z), new THREE.Vector3(w / 2, -0.97, z)]);
      gateGroup.add(new THREE.Line(g, pathMat));
    }

    // O Hanko: cabo de laca, base e face vermelha; aproxima-se de frente e carimba a placa
    const hanko = new THREE.Group();
    const hankoMats: THREE.MeshStandardMaterial[] = [];
    const hm = (m: THREE.MeshStandardMaterial) => {
      const c = m.clone();
      c.transparent = true;
      c.opacity = 0;
      hankoMats.push(c);
      return c;
    };
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.26, 32), hm(lacquer));
    handle.position.y = 0.17;
    const block = box(0.2, 0.09, 0.2, hm(lacquer), 0, 0, 0);
    const face = box(0.18, 0.014, 0.18, hm(kizunaRed), 0, -0.05, 0);
    const ring = box(0.205, 0.012, 0.205, hm(agedGold), 0, 0.05, 0);
    hanko.add(handle, block, face, ring);
    hanko.rotation.x = -Math.PI / 2; // face voltada para a placa (−z)
    hanko.position.set(0, plaqueY, 1.4);
    hanko.visible = false;
    gateGroup.add(hanko);

    let gateSceneSeen = -1;
    let gateSceneAt = 0;
    // último estado aberto (para fechar o portal com animação ao voltar à 07.1)
    const gateSnap = { focus: 0, seal: 0, unlock: 0, open: 0, reveal: 0 };

    // =========================================================================
    // 10–11. TELA 09 (rota de entrada e aquisição): sem cenário 3D.
    // A reformulação "linha de metrô" desenha a jornada em 2D na própria interface (EntrySection);
    // um 3D só para preencher espaço competiria com o percurso e o painel.
    // =========================================================================

    // =========================================================================
    // 12. TELA 10 (posicionamento): sem constelação 3D.
    // A comparação editorial em três blocos (PositioningSection) substitui o mapa 2×2 e os pontos flutuantes.
    // =========================================================================

    // =========================================================================
    // 14. TELA 11 (riscos e 12 meses): sem radar 3D.
    // A matriz de riscos e o roadmap 2D (RisksSection) são o elemento visual.
    // =========================================================================

    // =========================================================================
    // BACKGROUND STAR FIELD
    // =========================================================================
    const starCount = 380;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 18;
      starPositions[i + 1] = (Math.random() - 0.5) * 18;
      starPositions[i + 2] = (Math.random() - 0.5) * 18;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.035, transparent: true, opacity: 0.55 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // =========================================================================
    // ETAPA 9 • AMBIENTES DE FUNDO DAS TELAS 09–11
    // Tela 09 (cenários 9 e 10): avenida de Marunouchi ao entardecer. A névoa e o céu próprios só valem
    // enquanto o cenário está ativo; fora dele, a névoa padrão da apresentação é restaurada.
    // =========================================================================
    const DEFAULT_FOG = { color: (scene.fog as THREE.FogExp2).color.clone(), density: (scene.fog as THREE.FogExp2).density };
    const marunouchi = buildMarunouchi(renderer.capabilities.getMaxAnisotropy());
    marunouchi.root.position.y = -1.4;
    marunouchi.root.visible = false;
    scene.add(marunouchi.root);
    // Tela 10 (cenário 11): andar executivo com fachada de vidro voltada para Tóquio
    const office = buildOffice(renderer.capabilities.getMaxAnisotropy());
    office.root.position.y = -1.6;
    office.root.visible = false;
    scene.add(office.root);
    // Tela 11 (cenário 13): sala de planejamento estratégico
    const planning = buildPlanning(renderer.capabilities.getMaxAnisotropy());
    planning.root.position.y = -1.45;
    planning.root.visible = false;
    scene.add(planning.root);

    // =========================================================================
    // ETAPA 10 • AMBIENTES DAS TELAS 01 E 02
    // Tela 01 (cenário 0): salão-planetário ao redor do globo. Sem luzes próprias e sem névoa nos materiais:
    // o globo, o halo do Japão e os pontos de presença continuam exatamente como antes. A tela 12 (cenário 14),
    // que reutiliza o globo, NÃO recebe o salão.
    // =========================================================================
    const planetarium = buildPlanetarium(renderer.capabilities.getMaxAnisotropy());
    planetarium.root.visible = false;
    scene.add(planetarium.root);
    // Tela 02 (cenário 1): átrio corporativo monumental (substitui a grade em wireframe, preservada no código)
    const atrium = buildAtrium(renderer.capabilities.getMaxAnisotropy());
    atrium.root.position.y = -1.6;
    atrium.root.visible = false;
    scene.add(atrium.root);
    // Tela 03 (cenários 2 e 3): corredor japonês tradicional com as quatro portas de correr. As linhas e
    // pilares abstratos do corredor antigo ficam ocultos (código preservado); a luz que acompanha a porta
    // aberta passa a nascer da própria porta.
    const corridorEnv = buildCorridor(renderer.capabilities.getMaxAnisotropy());
    corridorEnv.root.position.y = -1.5;
    corridorEnv.root.visible = false;
    scene.add(corridorEnv.root);
    corridorGroup.children.forEach((c) => {
      if (c !== lightShaft && c !== floorPool) c.visible = false;
    });
    lightShaft.position.set(0, -1.5 + 1.05, -5.62);
    lightShaft.scale.set(DOOR_W * 0.95, 2.1 / 2.3, 1);
    floorPool.position.set(0, -1.5 + 0.006, -5.0);
    floorPool.scale.set(1.6, 1.2, 1);
    // Tela 04 (cenário 4): espaço de transição contemporâneo com jardim interno
    const passage = buildPassage(renderer.capabilities.getMaxAnisotropy());
    passage.root.position.y = -1.6;
    passage.root.visible = false;
    scene.add(passage.root);
    // Tela 05 (cenário 5): escritório contemporâneo atrás da demonstração (o trilho de estações continua à frente)
    const workspace = buildWorkspace(renderer.capabilities.getMaxAnisotropy());
    workspace.root.position.y = -1.35;
    workspace.root.visible = false;
    scene.add(workspace.root);
    // Tela 06 (cenário 7): pavilhão de vidro e aço; as treliças kumiko ficam gravadas nas divisórias
    const ecosystem = buildEcosystem();
    ecosystem.root.visible = false;
    scene.add(ecosystem.root);
    // Tela 07 (cenário 8): paredão monumental em torno do portal de validação (névoa padrão preservada)
    const portalHall = buildPortal();
    portalHall.root.position.y = -1.53;
    portalHall.root.visible = false;
    scene.add(portalHall.root);
    // Tela 08 (cenários 6 e 12): arquitetura modular em torno da estrutura de crescimento
    const modular = buildModular();
    modular.root.visible = false;
    scene.add(modular.root);

    // =========================================================================
    // RENDER & ANIMATION LOOP
    // =========================================================================
    let animId: number;
    let clock = new THREE.Clock();
    // Tela 08 avisa o 3D quando o número de usuários muda no simulador
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const onRevenue = (e: Event) => {
      const strength = Math.max(0.4, Math.min(1, Number((e as CustomEvent).detail?.strength) || 0.6));
      growth.revenuePulse(strength, clock.getElapsedTime());
    };
    window.addEventListener('kizuna:revenue', onRevenue);

    // Começa já no enquadramento da cena atual (sem "deslizar" o globo por baixo do texto)
    const initialShot = (() => {
      const { currentIndex: ci, sceneIndex: si } = stateRef.current;
      const st = toStage(ci, si);
      const p0 = getCameraPoseForSection(st.stage, st.scene).pose;
      return st.stage === 0 ? { ...p0, ...frameGlobePose(p0, width / height) } : p0;
    })();
    camera.position.copy(initialShot.pos);
    camera.lookAt(initialShot.target);
    const currentPos = initialShot.pos.clone();
    const currentTarget = initialShot.target.clone();
    let lastElapsed = 0;
    // Etapa 10: a tela 08 foi alcançada atravessando o portão da tela 07 (o portão fica aberto atrás da câmera)
    let gatePassage = false;
    // Tomada de câmera entre CENAS da mesma tela: tween com easing (acelera e desacelera) a partir de onde
    // a câmera está. Entre TELAS continua a aproximação exponencial já aprovada.
    const camShot = {
      screen: stateRef.current.currentIndex,
      scene: stateRef.current.sceneIndex,
      tween: false,
      at: 0,
      dur: 1.0,
      fromPos: new THREE.Vector3(),
      fromTarget: new THREE.Vector3(),
      // Etapa 10: voo pelo portão (07 → 08) — trajetória curva própria em vez de reta
      path: null as null | { pos: THREE.CatmullRomCurve3; target: THREE.CatmullRomCurve3 }
    };

    // Orientação do globo: tomadas com duração e suavização, sem rotação infinita.
    // Tela 01.1: visão ampla nas Américas → passa lentamente pela Europa, África e Índia (presença da Globant).
    // Tela 01.2: rotação controlada até o Japão, que termina dominante.
    type GlobeShot = { lat: number; lng: number; dur: number; delay?: number };
    const GLOBE_SHOTS: Record<string, GlobeShot[]> = {
      '0:0': [
        { lat: 8, lng: -64, dur: 0 },
        { lat: 20, lng: 40, dur: 12, delay: 1.2 }
      ],
      '0:1': [{ lat: 15, lng: -20, dur: 4 }],
      '0:2': [{ lat: 25, lng: 80, dur: 4 }],
      '0:3': [{ lat: 33, lng: 137, dur: 5.5 }]
    };
    let shotKey = '';
    let shotQueue: GlobeShot[] = [];
    let shotNextAt = 0;
    let tween: { fromX: number; fromY: number; toX: number; toY: number; start: number; dur: number } | null = null;
    let firstGlobeFrame = true;
    const startShot = (shot: GlobeShot, now: number) => {
      const o = orientationFor(shot.lat, shot.lng);
      // menor caminho angular a partir da rotação atual
      const cur = globeRoot.rotation.y;
      const delta = Math.atan2(Math.sin(o.y - cur), Math.cos(o.y - cur));
      if (firstGlobeFrame) {
        // primeira aparição: começa já na orientação planejada
        globeRoot.rotation.set(o.x, cur + delta, 0);
        tween = null;
        return;
      }
      // voltar de outra tomada nunca "salta": no mínimo 3,5 s de transição
      const dur = shot.dur > 0 ? shot.dur : 3.5;
      tween = { fromX: globeRoot.rotation.x, fromY: cur, toX: o.x, toY: cur + delta, start: now, dur };
    };

    const onResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Tela narrativa → cenário técnico (ver narrativeMap.ts)
      const { currentIndex, sceneIndex } = stateRef.current;
      const { stage: sIdx, scene: scIdx } = toStage(currentIndex, sceneIndex);
      const { pose, env } = getCameraPoseForSection(sIdx, scIdx);

      const dt = Math.min(0.25, elapsed - lastElapsed);
      lastElapsed = elapsed;

      // Camera smooth lerp (no globo, aproximação mais lenta e cinematográfica)
      // por tempo (não por quadro): mesmo ritmo em 60 ou 30 fps; 2,75/s ≈ o antigo 0,045 por quadro a 60 fps
      const camK = 1 - Math.exp(-dt * (sIdx === 0 || sIdx === 14 ? 0.9 : 2.75));
      const framed = sIdx === 0 ? frameGlobePose(pose, camera.aspect) : pose;
      if (currentIndex !== camShot.screen) {
        // (A) troca de tela: comportamento existente
        // Etapa 10: da tela 07 para a 08 a câmera atravessa o portão aberto até a sala (voo contínuo).
        // Qualquer outra troca que entre ou saia da tela 08 é um corte (a sala fica 12 m atrás do paredão
        // e um voo longo cruzaria outros cenários). O voo acontece também com "movimento reduzido" no sistema
        // (é a transição narrativa pedida para a apresentação), apenas mais curto.
        const prevScreen = camShot.screen;
        const intoHall = prevScreen === 6 && currentIndex === 7;
        if (currentIndex === 7) gatePassage = intoHall;
        camShot.screen = currentIndex;
        camShot.scene = sceneIndex;
        camShot.tween = false;
        camShot.path = null;
        if ((prevScreen === 7 || currentIndex === 7) && !intoHall) {
          currentPos.copy(framed.pos);
          currentTarget.copy(framed.target);
        } else if (intoHall) {
          // Voo de ~2,8 s com aceleração e desaceleração: alinha-se ao eixo diante do portão, atravessa o vão
          // olhando para dentro da sala e acomoda-se no enquadramento da 08.1. (A aproximação exponencial
          // padrão cruzaria os 17 m em ~0,2 s e pareceria um corte.)
          const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
          camShot.path = {
            pos: new THREE.CatmullRomCurve3([currentPos.clone(), V(0, -0.05, 2.6), V(0.05, -0.12, 0.6), V(0.25, -0.15, -2.6), V(0.7, -0.1, -7.2), framed.pos.clone()], false, 'centripetal'),
            target: new THREE.CatmullRomCurve3([currentTarget.clone(), V(0, -0.2, -3), V(0.1, -0.35, -6.5), V(0.5, -0.6, -10.5), V(0.9, -0.8, -12.2), framed.target.clone()], false, 'centripetal')
          };
          camShot.at = elapsed;
          camShot.dur = reducedMotion ? 2.2 : 2.8;
          camShot.tween = true;
        }
      } else if (sceneIndex !== camShot.scene) {
        // (B) troca de cena na mesma tela: nova tomada (o globo mantém a aproximação lenta própria)
        camShot.scene = sceneIndex;
        camShot.path = null;
        if (sIdx !== 0 && sIdx !== 14) {
          camShot.fromPos.copy(currentPos);
          camShot.fromTarget.copy(currentTarget);
          camShot.at = elapsed;
          camShot.dur = reducedMotion ? 0.8 : 1.0;
          camShot.tween = true;
        }
      }
      if (camShot.tween) {
        const p = Math.min(1, (elapsed - camShot.at) / camShot.dur);
        const e = easeInOutCubic(p);
        if (camShot.path) {
          camShot.path.pos.getPoint(e, currentPos);
          camShot.path.target.getPoint(e, currentTarget);
        } else {
          currentPos.lerpVectors(camShot.fromPos, framed.pos, e);
          currentTarget.lerpVectors(camShot.fromTarget, framed.target, e);
        }
        if (p >= 1) {
          camShot.tween = false;
          camShot.path = null;
        }
      } else {
        currentPos.lerp(framed.pos, camK);
        currentTarget.lerp(framed.target, camK);
      }
      camera.position.copy(currentPos);
      camera.lookAt(currentTarget);

      // -----------------------------------------------------------------------
      // 1. Globe Visibility (STRICT: ONLY ACTIVE ON SCENE 00 AND SCENE 14)
      // -----------------------------------------------------------------------
      const isGlobeActive = sIdx === 0 || sIdx === 14;
      globeRoot.visible = isGlobeActive;
      globeLights.visible = isGlobeActive;
      if (isGlobeActive) {
        globeRoot.scale.lerp(new THREE.Vector3(env.globeScale, env.globeScale, env.globeScale), 0.05);
        atmosMat.uniforms.uOpacity.value = env.globeVisibility;
        globeMat.opacity = env.globeVisibility;

        const key = sIdx + ':' + scIdx;
        if (key !== shotKey) {
          shotKey = key;
          shotQueue = [...(GLOBE_SHOTS[key] || [{ lat: 12, lng: (-(env.globeRotationY + Math.PI / 2) * 180) / Math.PI, dur: 3 }])];
          const first = shotQueue.shift()!;
          startShot(first, elapsed);
          shotNextAt = Number.POSITIVE_INFINITY;
          if (!tween && shotQueue.length) shotNextAt = elapsed + (shotQueue[0].delay || 0);
        }
        firstGlobeFrame = false;
        if (tween) {
          const t = Math.min(1, (elapsed - tween.start) / tween.dur);
          const e = easeInOutCubic(t);
          globeRoot.rotation.x = tween.fromX + (tween.toX - tween.fromX) * e;
          globeRoot.rotation.y = tween.fromY + (tween.toY - tween.fromY) * e;
          if (t >= 1) {
            tween = null;
            if (shotQueue.length) shotNextAt = elapsed + (shotQueue[0].delay || 0);
          }
        } else if (shotQueue.length && elapsed >= shotNextAt) {
          startShot(shotQueue.shift()!, elapsed);
          shotNextAt = Number.POSITIVE_INFINITY;
        }

        // Japão: halo e rótulo só quando a rotação o traz para a frente
        const japanFront = japanPos.clone().applyMatrix4(globeRoot.matrixWorld).normalize().z;
        const showJapan = sIdx === 0 && scIdx === 3 ? Math.max(0, Math.min(1, (japanFront - 0.55) / 0.3)) : sIdx === 14 ? Math.max(0, Math.min(1, (japanFront - 0.4) / 0.3)) * 0.8 : 0;
        japanHaloMat.opacity += (showJapan * 0.95 - japanHaloMat.opacity) * Math.min(1, dt * 3);
        const labelMat = japanLabel.material as THREE.SpriteMaterial;
        const labelTarget = sIdx === 0 && scIdx === 3 ? showJapan : 0;
        labelMat.opacity += (labelTarget - labelMat.opacity) * Math.min(1, dt * 3);
      } else {
        shotKey = '';
      }

      // -----------------------------------------------------------------------
      // 2. Tokyo Skyline (Scene 02)
      // -----------------------------------------------------------------------
      // Etapa 10: a grade em wireframe deu lugar ao átrio corporativo (ver "Ambientes" abaixo); o grupo fica oculto
      tokyoSkylineGroup.visible = false;
      if (tokyoSkylineGroup.visible) {
        bldgGroup.children.forEach((tw, i) => {
          tw.position.y = -1.2 + towerCoords[i].h / 2 + Math.sin(elapsed * 1.5 + i) * 0.02;
        });
      }

      // -----------------------------------------------------------------------
      // 3. Corredor escuro (tela 03, cenas 1–4)
      // -----------------------------------------------------------------------
      corridorGroup.visible = sIdx === 2;
      if (sIdx === 2) {
        // a luz desliza até a posição da porta aberta (mesma ordem das portas da tela)
        const targetX = (Math.min(3, scIdx) - 1.5) * DOOR_W; // Etapa 10: centro da porta aberta
        lightShaft.position.x += (targetX - lightShaft.position.x) * Math.min(1, dt * 3);
        floorPool.position.x = lightShaft.position.x;
        const shaftMat = lightShaft.material as THREE.ShaderMaterial;
        shaftMat.uniforms.uOpacity.value += (0.24 - shaftMat.uniforms.uOpacity.value) * Math.min(1, dt * 2);
        const poolMat = floorPool.material as THREE.MeshBasicMaterial;
        poolMat.opacity += (0.07 - poolMat.opacity) * Math.min(1, dt * 2);
      }

      // -----------------------------------------------------------------------
      // 4. Global x Local Fusion (Scene 04)
      // -----------------------------------------------------------------------
      fusionGroup.visible = sIdx === 3;
      if (sIdx === 3) {
        globalBlock.rotation.x += 0.008;
        globalBlock.rotation.y += 0.01;
        localBlock.rotation.y -= 0.01;
        localBlock.rotation.z += 0.005;

        if (scIdx === 0) {
          // Separated
          globalBlock.position.lerp(new THREE.Vector3(-0.95, 0, 0), 0.06);
          localBlock.position.lerp(new THREE.Vector3(0.95, 0, 0), 0.06);
          sparkRing.visible = false;
        } else if (scIdx === 1) {
          // Approaching
          globalBlock.position.lerp(new THREE.Vector3(-0.4, 0, 0), 0.06);
          localBlock.position.lerp(new THREE.Vector3(0.4, 0, 0), 0.06);
          sparkRing.visible = false;
        } else {
          // Locked in center
          globalBlock.position.lerp(new THREE.Vector3(-0.15, 0, 0), 0.06);
          localBlock.position.lerp(new THREE.Vector3(0.15, 0, 0), 0.06);
          sparkRing.visible = true;
          sparkRing.rotation.z += 0.02;
        }
      }

      // -----------------------------------------------------------------------
      // 5. Quadro discreto da tela 04
      // -----------------------------------------------------------------------
      threadWeaveGroup.visible = sIdx === 4;
      if (sIdx === 4) {
        uiBoard.rotation.y = Math.sin(elapsed * 0.6) * 0.08;
      }

      // -----------------------------------------------------------------------
      // 6. Live Task Pipeline (Scene 06)
      // -----------------------------------------------------------------------
      taskPipelineGroup.visible = sIdx === 5;
      if (sIdx === 5) {
        const targetX = -1.4 + scIdx * 0.7;
        taskCapsule.position.x = THREE.MathUtils.lerp(taskCapsule.position.x, targetX, 0.08);
        taskCapsule.rotation.x += 0.05;
        pipelineStations.forEach((st, i) => {
          (st.material as THREE.MeshBasicMaterial).color.setHex(i === scIdx ? 0xd7263d : i < scIdx ? 0x8a8f99 : 0x5c6474);
        });
      }

      // -----------------------------------------------------------------------
      // 7. Modular Expansion Lattice (Scene 07)
      // -----------------------------------------------------------------------
      // nível da estrutura: 08.1 Start • 08.2 Business • 08.3 Enterprise • 08.4 simulador
      const growthLevel = sIdx === 6 ? Math.min(3, scIdx + 1) : sIdx === 12 ? 4 : 0;
      growth.setLevel(growthLevel, elapsed);
      modularScaleGroup.visible = growthLevel > 0;
      if (growthLevel > 0) {
        // em telas 4:3 a estrutura encolhe um pouco para não invadir a coluna de texto
        const narrowGrowth = camera.aspect < 1.5;
        modularScaleGroup.scale.setScalar(narrowGrowth ? 0.6 : 0.72);
        modularScaleGroup.position.x = narrowGrowth ? 1.62 : 1.55;
        growth.update(elapsed, dt, reducedMotion);
      }

      // -----------------------------------------------------------------------
      // 8. Adaptation Metamorphosis (Scene 08)
      // -----------------------------------------------------------------------
      adaptationMorphGroup.visible = sIdx === 7;
      if (sIdx === 7) {
        // a luz acompanha a cena: a camada ativa acende, a outra recua (por tempo; mov. reduzido = mais curto)
        const k = 1 - Math.exp(-dt * (reducedMotion ? 7 : 2.4));
        const front = scIdx === 0;
        kumikoFront.mat.opacity += ((front ? 0.22 : 0.05) - kumikoFront.mat.opacity) * k;
        kumikoFront.glowMat.uniforms.uOpacity.value += ((front ? 0.09 : 0.0) - kumikoFront.glowMat.uniforms.uOpacity.value) * k;
        kumikoBack.mat.opacity += ((front ? 0.07 : 0.18) - kumikoBack.mat.opacity) * k;
        kumikoBack.glowMat.uniforms.uOpacity.value += ((front ? 0.015 : 0.1) - kumikoBack.glowMat.uniforms.uOpacity.value) * k;
        kumikoSealMat.opacity += ((front ? 0.12 : 0.8) - kumikoSealMat.opacity) * k;
      } else {
        kumikoFront.mat.opacity = 0;
        kumikoFront.glowMat.uniforms.uOpacity.value = 0;
        kumikoBack.mat.opacity = 0;
        kumikoBack.glowMat.uniforms.uOpacity.value = 0;
        kumikoSealMat.opacity = 0;
      }

      // -----------------------------------------------------------------------
      // 9. Red Gate / Vault (Scene 09)
      // -----------------------------------------------------------------------
      // Etapa 10: na tela 08 alcançada pelo portão, o portão continua visível e aberto (a câmera passa por ele)
      const gateOpenBeyond = (sIdx === 6 || sIdx === 12) && gatePassage;
      gateGroup.visible = sIdx === 8 || gateOpenBeyond;
      if (sIdx === 8) {
        // em telas 4:3 o portal estreita um pouco para os montantes ficarem nos vãos entre as colunas
        gateGroup.scale.x = camera.aspect < 1.5 ? 0.86 : 1;
        // Linha do tempo da cena 07.2 (segundos desde a entrada na cena). Na 07.1, tudo fechado.
        if (scIdx !== gateSceneSeen) {
          gateSceneSeen = scIdx;
          gateSceneAt = elapsed;
        }
        const tr = elapsed - gateSceneAt;
        // 07.2: a câmera ajusta o enquadramento primeiro (GATE_LEAD) e só então o Hanko entra.
        // Movimento reduzido: sem o Hanko em movimento; selo, trava, abertura e luz em ~0,6 s.
        const GATE_LEAD = 0.45;
        const t = scIdx === 2 ? (reducedMotion ? (tr <= 0.1 ? -1 : 1.05 + (tr - 0.1) * 4.3) : tr - GATE_LEAD) : -1;
        const seg = (a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
        const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
        const easeIn = (x: number) => x * x * x;

        // 1. mudança breve de iluminação: o ambiente baixa, a luz-chave foca a placa
        let focus = seg(0, 0.6);

        // 2. o Hanko surge de frente, 3. desce e carimba, recua e some
        const appear = easeOut(seg(0.35, 0.8));
        const press = easeIn(seg(0.8, 1.05));
        const retract = easeOut(seg(1.25, 1.7));
        let hz = 1.6 - 0.6 * appear; // 1.6 → 1.0
        hz = hz - (1.0 - 0.075) * press; // → encosta na placa
        hz = hz + (1.0 - 0.075) * retract; // volta
        hanko.position.z = hz;
        hanko.visible = !reducedMotion && t > 0.3 && t < 1.8;
        const hOpacity = appear * (1 - retract);
        hankoMats.forEach((m) => (m.opacity = hOpacity));
        // impacto: leve compressão e um pulso de luz quente (sem flash)
        const impact = seg(1.05, 1.4);
        const bell = impact > 0 && impact < 1 ? Math.sin(impact * Math.PI) : 0;
        hanko.scale.set(1 + 0.04 * bell, 1 - 0.06 * bell, 1 + 0.04 * bell);
        portalPoint.intensity = 2.2 * bell;
        let seal = seg(1.05, 1.35);
        let unlock = easeOut(seg(1.75, 2.15));
        let open = easeInOutCubic(seg(2.15, 3.35));
        let reveal = easeOut(seg(2.3, 3.6));
        if (scIdx === 2) {
          Object.assign(gateSnap, { focus, seal, unlock, open, reveal });
        } else {
          // voltar à 07.1: o portal fecha (não salta) — a luz recolhe, os painéis voltam, a trava fecha
          const c = 1 - easeInOutCubic(Math.min(1, tr / (reducedMotion ? 0.4 : 0.9)));
          focus = gateSnap.focus * c;
          seal = gateSnap.seal * c;
          unlock = gateSnap.unlock * c;
          open = gateSnap.open * c;
          reveal = gateSnap.reveal * c;
        }
        portalFill.intensity = 0.6 - 0.2 * focus;
        portalKey.intensity = 2.0 + 0.8 * focus;
        sealMat.opacity = seal;

        // 4. a trava gira e destrava
        latch.rotation.z = (Math.PI / 2) * unlock;
        lockDisc.rotation.y = (Math.PI / 2) * unlock;

        // 5. os painéis deslizam para os montantes (recolhem por trás deles)
        const sx = 1 - 0.88 * open;
        shojiL.scale.x = sx;
        shojiR.scale.x = sx;
        shojiL.position.x = -(POST_X - 0.06) + (PANEL_W * sx) / 2;
        shojiR.position.x = POST_X - 0.06 - (PANEL_W * sx) / 2;
        lockGroup.visible = open < 0.98;
        lockGroup.scale.setScalar(1 - 0.6 * open);
        seam.visible = open < 0.02;

        // 6. a luz atravessa o portal e revela o espaço do outro lado
        // fechado: luz contida atrás do papel; aberto: a luz atravessa
        beyondMat.uniforms.uOpacity.value = 0.24 + 0.55 * reveal;
        pathMat.opacity = 0.32 * reveal;
        washiMat.opacity = 0.22 + 0.12 * reveal;
        // Etapa 10: a sala depois do portão (tela 08) acende junto com a abertura
        modular.setLight(reveal);
      } else {
        gateSceneSeen = -1;
        Object.assign(gateSnap, { focus: 0, seal: 0, unlock: 0, open: 0, reveal: 0 });
        if (gateOpenBeyond) {
          // portão aberto (estado final da 07.2), só visual; a luz do portal some quando a câmera entra na sala
          shojiL.scale.x = shojiR.scale.x = 0.12;
          shojiL.position.x = -(POST_X - 0.06) + (PANEL_W * 0.12) / 2;
          shojiR.position.x = POST_X - 0.06 - (PANEL_W * 0.12) / 2;
          lockGroup.visible = false;
          seam.visible = false;
          latch.rotation.z = Math.PI / 2;
          lockDisc.rotation.y = Math.PI / 2;
          sealMat.opacity = 1;
          hanko.visible = false;
          beyondMat.uniforms.uOpacity.value = 0.79;
          pathMat.opacity = 0.32;
          washiMat.opacity = 0.34;
          const outside = Math.max(0, Math.min(1, (camera.position.z + 3) / 4));
          portalKey.intensity = 2.0 * outside;
          portalFill.intensity = 0.6 * outside;
          portalPoint.intensity = 0;
        }
      }

      // 10–11. Tela 09: a linha de metrô 2D da interface é o elemento principal; ao fundo, a avenida de
      // Marunouchi (Etapa 9). A câmera avança pela avenida a cada trecho e sobe na cena de aquisição.
      const onCity = sIdx === 9 || sIdx === 10;
      marunouchi.root.visible = onCity;
      if (onCity) marunouchi.update(dt, sIdx === 10 ? 3 : Math.min(2, scIdx), reducedMotion);
      // 12. Tela 10: escritório corporativo (Etapa 9), cena estática
      const onOffice = sIdx === 11;
      office.root.visible = onOffice;
      // 14. Tela 11: sala de planejamento (Etapa 9); a câmera desliza um pouco na 11.2
      const onPlanning = sIdx === 13;
      planning.root.visible = onPlanning;
      // Etapa 10 • Tela 01: salão-planetário (a névoa padrão continua valendo para o globo)
      const onHall = sIdx === 0;
      planetarium.root.visible = onHall;
      if (onHall) planetarium.update(dt, reducedMotion);
      // Etapa 10 • Tela 02: átrio corporativo, cena estática
      const onAtrium = sIdx === 1;
      atrium.root.visible = onAtrium;
      // Etapa 10 • Tela 03: corredor tradicional (portas = cenas 1–4; na síntese, todas abertas)
      const onCorridor = sIdx === 2 || sIdx === 3;
      corridorEnv.root.visible = onCorridor;
      if (onCorridor) corridorEnv.update(dt, sIdx === 2 ? Math.min(3, scIdx) : -1, sIdx === 3, reducedMotion);
      // Etapa 10 • Tela 04: espaço de transição contemporâneo, cena estática
      const onPassage = sIdx === 4;
      passage.root.visible = onPassage;
      // Etapa 10 • Telas 05 e 06: escritório e pavilhão de vidro e aço, cenas estáticas
      const onWorkspace = sIdx === 5;
      workspace.root.visible = onWorkspace;
      const onEcosystem = sIdx === 7;
      ecosystem.root.visible = onEcosystem;
      // Etapa 10 • Telas 07 e 08: portal monumental e arquitetura modular (materiais sem névoa)
      const onPortal = sIdx === 8;
      const onModular = sIdx === 6 || sIdx === 12;
      portalHall.root.visible = onPortal || (onModular && gatePassage);
      // a sala existe atrás do paredão também na tela 07 (vista pela abertura); na 08 fica acesa
      modular.root.visible = onPortal || onModular;
      if (onModular) modular.setLight(1);
      {
        const fog = scene.fog as THREE.FogExp2;
        const target = onCity ? MARUNOUCHI_FOG : onOffice ? OFFICE_FOG : onPlanning ? PLANNING_FOG : onAtrium ? ATRIUM_FOG : onCorridor ? CORRIDOR_FOG : onPassage ? PASSAGE_FOG : onWorkspace ? WORKSPACE_FOG : onEcosystem ? ECOSYSTEM_FOG : DEFAULT_FOG;
        fog.color.copy(target.color);
        fog.density = target.density;
      }
      // a cúpula do salão substitui o campo de estrelas solto na tela 01
      starField.visible = !onCity && !onOffice && !onPlanning && !onHall && !onAtrium && !onCorridor && !onPassage && !onWorkspace && !onEcosystem && !onPortal && !onModular;



      // Ambient background drift
      starField.rotation.y += 0.0002;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('kizuna:revenue', onRevenue);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [safeMode]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#05080D]"
    />
  );
};
export default WorldStage;
