import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usePresentation } from './PresentationContext';
import { getCameraPoseForSection } from './CameraDirector';
import { toStage } from './narrativeMap';
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

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const WorldStage: React.FC = () => {
  const { currentIndex, sceneIndex, safeMode, gateApproved } = usePresentation();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef({ currentIndex, sceneIndex, gateApproved });
  stateRef.current = { currentIndex, sceneIndex, gateApproved };

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
    // 07. MODULAR EXPANSION LATTICE GROUP (SCENE 07: PLANOS)
    // =========================================================================
    const modularScaleGroup = new THREE.Group();
    scene.add(modularScaleGroup);

    // Etapa 8: os cubos saíram. Três anéis finos no piso (equipe → departamentos → empresa)
    // acendem em sequência, de dentro para fora: a ideia de crescimento dos planos.
    const planField = createWaveField([0.55, 1.0, 1.45]);
    modularScaleGroup.add(planField.group);
    planField.setLit(0, 0); // Start aceso por padrão (a tela confirma o plano ao entrar)
    // centro do campo sob os anéis da tela (à esquerda)
    modularScaleGroup.position.set(-0.7, -1.05, -0.6);

    // =========================================================================
    // 08. ADAPTATION METAMORPHOSIS GROUP (SCENE 08: ADAPTAÇÃO)
    // =========================================================================
    const adaptationMorphGroup = new THREE.Group();
    scene.add(adaptationMorphGroup);

    // Etapa 8: a moldura aramada (linha diagonal sobre o conteúdo) foi removida; o cenário fica limpo.

    // Etapa 8: disco vermelho decorativo removido (o vermelho fica para o que tem função)

    // =========================================================================
    // 09. SECURITY RED GATE & VAULT GROUP (SCENE 09: CONFIANÇA)
    // =========================================================================
    const gateGroup = new THREE.Group();
    scene.add(gateGroup);

    // Etapa 8: torii estilizado — duas colunas finas, viga superior escura (kasagi) sobre viga
    // vermelha (shimaki) e travessa (nuki); o painel central de aprovação é o da tela.
    // Fechado: uma barreira fina atravessa o vão. Aprovado pelo Hanko: a barreira sobe e some,
    // e as colunas continuam como moldura.
    const toriiRed = new THREE.MeshBasicMaterial({ color: 0xc41f35, transparent: true, opacity: 0.82, fog: false });
    const toriiDark = new THREE.MeshBasicMaterial({ color: 0x1a1c22, fog: false });
    const COL_X = 1.1;
    [-COL_X, COL_X].forEach((x) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.9, 24), toriiRed);
      col.position.set(x, 0, 0);
      gateGroup.add(col);
    });
    const shimaki = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.045, 0.08), toriiRed);
    shimaki.position.set(0, 0.97, 0);
    const kasagi = new THREE.Mesh(new THREE.BoxGeometry(2.86, 0.07, 0.11), toriiDark);
    kasagi.position.set(0, 1.035, 0);
    // pontas levemente erguidas da viga superior
    [-1, 1].forEach((side) => {
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.11), toriiDark);
      tip.position.set(side * 1.48, 1.065, 0);
      tip.rotation.z = side * 0.18;
      gateGroup.add(tip);
    });
    const nuki = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.03, 0.06), toriiRed);
    nuki.position.set(0, 0.72, 0);
    // o painel central de aprovação é o painel da própria tela, pendurado sob as vigas
    gateGroup.add(shimaki, kasagi, nuki);
    // Etapa 8: o portão desce para ficar abaixo do título e emoldurar a decisão no centro
    gateGroup.position.y = -0.52;

    // Barreira única (fechado) — sobe e some quando o Hanko aprova
    const barrierMat = new THREE.MeshBasicMaterial({ color: 0xd7263d, transparent: true, opacity: 0.7, fog: false });
    const barrier = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, COL_X * 2, 12), barrierMat);
    barrier.rotation.z = Math.PI / 2;
    barrier.position.set(0, -0.05, 0);
    gateGroup.add(barrier);

    // Luz dirigida ao mecanismo de aprovação (cai de cima, cresce com o carimbo)
    const gateLight = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 2.1),
      new THREE.ShaderMaterial({ ...beamShader, uniforms: { uOpacity: { value: 0.0 } }, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
    );
    gateLight.position.set(0, 0.05, -0.2);
    gateGroup.add(gateLight);

    // =========================================================================
    // 10. RAILWAY EXPANSION TRACK GROUP (SCENE 10: ENTRADA)
    // =========================================================================
    const railwayGroup = new THREE.Group();
    scene.add(railwayGroup);

    // Double Track Lines
    const railPts1 = [new THREE.Vector3(-2.2, -0.4, -0.5), new THREE.Vector3(-1, -0.1, 0), new THREE.Vector3(0.5, 0.2, 0), new THREE.Vector3(2.2, 0.5, -0.3)];
    const railCurve = new THREE.CatmullRomCurve3(railPts1);
    const railTube = new THREE.Mesh(
      new THREE.TubeGeometry(railCurve, 64, 0.015, 8, false),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 })
    );
    railwayGroup.add(railTube);

    // Bullet Train Pod
    const trainPod = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.08, 0.35, 8, 16),
      new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true })
    );
    trainPod.rotation.z = -Math.PI / 6;
    railwayGroup.add(trainPod);

    // 6 Station Nodes (origem + 5 fases)
    for (let i = 0; i < 6; i++) {
      const st = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xd4af37 })
      );
      const pt = railCurve.getPoint(i / 5);
      st.position.copy(pt);
      railwayGroup.add(st);
    }

    // =========================================================================
    // 11. BROADCAST CITY RAYS GROUP (SCENE 11: PROMOÇÃO)
    // =========================================================================
    const broadcastGroup = new THREE.Group();
    scene.add(broadcastGroup);

    const towerSpire = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 1.6, 8),
      new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true })
    );
    towerSpire.position.set(0, 0.4, 0);
    broadcastGroup.add(towerSpire);

    // 3 Concentric Emission Rings
    const emitRings: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const r = new THREE.Mesh(
        new THREE.RingGeometry(0.25 + i * 0.4, 0.28 + i * 0.4, 32),
        new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6 - i * 0.12, side: THREE.DoubleSide })
      );
      r.position.set(0, 1.2, 0);
      r.rotation.x = Math.PI / 2;
      broadcastGroup.add(r);
      emitRings.push(r);
    }

    // =========================================================================
    // 12. COMPETITIVE CONSTELLATION 3D (SCENE 12: CONCORRÊNCIA)
    // =========================================================================
    const constellationGroup = new THREE.Group();
    scene.add(constellationGroup);

    // X and Y Coordinate Axes
    const xAxisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.8, -1.0, 0), new THREE.Vector3(1.8, -1.0, 0)]);
    const yAxisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.8, -1.0, 0), new THREE.Vector3(-1.8, 1.2, 0)]);
    const axisMat = new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.45 });
    constellationGroup.add(new THREE.Line(xAxisGeo, axisMat));
    constellationGroup.add(new THREE.Line(yAxisGeo, axisMat));

    // Competitor Star Nodes
    const competitors = [
      { name: 'SAP / Oracle', x: 1.4, y: -0.7, color: 0x6366f1, size: 0.08 },
      { name: 'OBIC / Bugyo', x: -1.2, y: 0.8, color: 0xf59e0b, size: 0.07 },
      { name: 'Freee / MF', x: -0.6, y: -0.2, color: 0x38bdf8, size: 0.06 },
      { name: 'Notion / Asana', x: -1.3, y: -0.6, color: 0x94a3b8, size: 0.05 },
      { name: 'KIZUNA', x: 1.2, y: 0.9, color: 0xef4444, size: 0.12, isHero: true }
    ];

    competitors.forEach((c) => {
      const star = new THREE.Mesh(
        new THREE.SphereGeometry(c.size, 16, 16),
        new THREE.MeshBasicMaterial({ color: c.color })
      );
      star.position.set(c.x, c.y, 0);
      constellationGroup.add(star);

      if (c.isHero) {
        const halo = new THREE.Mesh(
          new THREE.RingGeometry(0.15, 0.22, 32),
          new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
        );
        halo.position.set(c.x, c.y, 0.02);
        constellationGroup.add(halo);
      }
    });

    // =========================================================================
    // 13. VOLUMETRIC FINANCIAL 3D GROUP (SCENE 13: PREÇO)
    // =========================================================================
    const financial3DGroup = new THREE.Group();
    scene.add(financial3DGroup);

    // Etapa 8: as barras genéricas saíram; o piso de ondas acompanha a conta da receita
    financial3DGroup.position.set(0.4, -1.05, -0.8);
    const revenueField = createWaveField([]);
    financial3DGroup.add(revenueField.group);

    // =========================================================================
    // 14. MISSION CONTROL RADAR GROUP (SCENE 14: RISCOS & KPIS)
    // =========================================================================
    const missionControlGroup = new THREE.Group();
    scene.add(missionControlGroup);

    const radarDisc = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 1.4, 48),
      new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
    );
    radarDisc.rotation.x = Math.PI / 2.4;
    missionControlGroup.add(radarDisc);

    const sweepLineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(1.3, 0, 0)]);
    const sweepLine = new THREE.Line(
      sweepLineGeo,
      new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.85 })
    );
    sweepLine.rotation.x = Math.PI / 2.4;
    missionControlGroup.add(sweepLine);

    // 4 Floating Telemetry Node Points
    const quadPoints = [
      { x: -0.8, y: 0.4, color: 0x10b981 }, // Mercado
      { x: 0.8, y: 0.4, color: 0xef4444 },  // Produto
      { x: -0.8, y: -0.4, color: 0xf59e0b }, // Comercial
      { x: 0.8, y: -0.4, color: 0x38bdf8 }  // Financeiro
    ];
    quadPoints.forEach((qp) => {
      const qMesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.1, 0),
        new THREE.MeshBasicMaterial({ color: qp.color, wireframe: true })
      );
      qMesh.position.set(qp.x, qp.y, 0.2);
      missionControlGroup.add(qMesh);
    });

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
    // RENDER & ANIMATION LOOP
    // =========================================================================
    let animId: number;
    let clock = new THREE.Clock();
    // Tela 08 avisa o 3D: plano escolhido (nível 0–2) e mudança no simulador
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const planRadii = [0.55, 1.0, 1.45];
    const onPlan = (e: Event) => {
      const level = Math.max(0, Math.min(2, Number((e as CustomEvent).detail?.level) || 0));
      const now = clock.getElapsedTime();
      planField.setLit(level, now);
      planField.pulse(planRadii[level], 1, now);
    };
    const onRevenue = (e: Event) => {
      const strength = Math.max(0.4, Math.min(1, Number((e as CustomEvent).detail?.strength) || 0.6));
      revenueField.pulse(0.4, strength, clock.getElapsedTime());
    };
    window.addEventListener('kizuna:plan', onPlan);
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
      const { currentIndex, sceneIndex, gateApproved: gateOk } = stateRef.current;
      const { stage: sIdx, scene: scIdx } = toStage(currentIndex, sceneIndex);
      const { pose, env } = getCameraPoseForSection(sIdx, scIdx);

      const dt = Math.min(0.25, elapsed - lastElapsed);
      lastElapsed = elapsed;

      // Camera smooth lerp (no globo, aproximação mais lenta e cinematográfica)
      // por tempo (não por quadro): mesmo ritmo em 60 ou 30 fps; 2,75/s ≈ o antigo 0,045 por quadro a 60 fps
      const camK = 1 - Math.exp(-dt * (sIdx === 0 || sIdx === 14 ? 0.9 : 2.75));
      const framed = sIdx === 0 ? frameGlobePose(pose, camera.aspect) : pose;
      currentPos.lerp(framed.pos, camK);
      currentTarget.lerp(framed.target, camK);
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
      tokyoSkylineGroup.visible = sIdx === 1;
      if (sIdx === 1) {
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
        const targetX = (Math.min(3, scIdx) - 1.5) * 1.05;
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
      modularScaleGroup.visible = sIdx === 6;
      if (sIdx === 6) {
        planField.update(elapsed, dt, reducedMotion);
      }

      // -----------------------------------------------------------------------
      // 8. Adaptation Metamorphosis (Scene 08)
      // -----------------------------------------------------------------------
      adaptationMorphGroup.visible = sIdx === 7;
      if (sIdx === 7) {
      }

      // -----------------------------------------------------------------------
      // 9. Red Gate / Vault (Scene 09)
      // -----------------------------------------------------------------------
      gateGroup.visible = sIdx === 8;
      if (sIdx === 8) {
        // em telas 4:3 o portão estreita um pouco para os pilares continuarem nos vãos entre as colunas
        gateGroup.scale.x = camera.aspect < 1.5 ? 0.86 : 1;
        const isOpen = gateOk;
        const k = Math.min(1, dt * 4);
        barrier.position.y += ((isOpen ? 0.62 : -0.05) - barrier.position.y) * k;
        barrierMat.opacity += ((isOpen ? 0 : 0.7) - barrierMat.opacity) * k;
        barrier.visible = barrierMat.opacity > 0.01;
        const gl = (gateLight.material as THREE.ShaderMaterial).uniforms.uOpacity;
        gl.value += ((isOpen ? 0.26 : 0.11) - gl.value) * Math.min(1, dt * 2.5);
      }

      // -----------------------------------------------------------------------
      // 10. Railway Expansion (Scene 10)
      // -----------------------------------------------------------------------
      railwayGroup.visible = sIdx === 9;
      if (sIdx === 9) {
        // cena 0 = canais (trem na origem); cenas 1..6 = estações 01..06
        const trainTargetPt = railCurve.getPoint(Math.min(1.0, Math.max(0, (scIdx - 1) / 5)));
        trainPod.position.lerp(trainTargetPt, 0.08);
      }

      // -----------------------------------------------------------------------
      // 11. Broadcast Waves (Scene 11)
      // -----------------------------------------------------------------------
      broadcastGroup.visible = sIdx === 10;
      if (sIdx === 10) {
        emitRings.forEach((r, i) => {
          const s = 1 + ((elapsed * 0.8 + i * 0.3) % 2.5);
          r.scale.set(s, s, s);
        });
      }

      // -----------------------------------------------------------------------
      // 12. Competitive Constellation (Scene 12)
      // -----------------------------------------------------------------------
      constellationGroup.visible = sIdx === 11;
      if (sIdx === 11) {
        constellationGroup.rotation.y = Math.sin(elapsed * 0.3) * 0.04;
      }

      // -----------------------------------------------------------------------
      // 13. Financial Volumetric 3D (Scene 13)
      // -----------------------------------------------------------------------
      financial3DGroup.visible = sIdx === 12;
      if (sIdx === 12) {
        revenueField.update(elapsed, dt, reducedMotion);
      }

      // -----------------------------------------------------------------------
      // 14. Mission Control Radar (Scene 14)
      // -----------------------------------------------------------------------
      missionControlGroup.visible = sIdx === 13;
      if (sIdx === 13) {
        sweepLine.rotation.z -= 0.035;
      }

      // Ambient background drift
      starField.rotation.y += 0.0002;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('kizuna:plan', onPlan);
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
