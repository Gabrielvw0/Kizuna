import * as THREE from 'three';

/*
 * Etapa 9 • Ferramentas de arquitetura procedural para os ambientes das telas 09–11.
 * Tudo é gerado no navegador (canvas → textura): nenhum asset externo, funciona offline.
 * Os ambientes reutilizam estas peças, mas cada tela monta a sua própria composição.
 */

/** Gerador pseudoaleatório determinístico: o mesmo cenário em todas as execuções. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type FacadeStyle = {
  /** células (janelas) por textura */
  cols: number;
  rows: number;
  /** cor do caixilho / estrutura */
  frame: string;
  /** cores do vidro (escuro → claro), sorteadas por janela */
  glass: [string, string];
  /** fração de janelas acesas */
  lit: number;
  /** cores das janelas acesas (quente → frio) */
  litColors: string[];
  /** espessura do caixilho em fração da célula */
  mullion: number;
  /** janelas "furadas" em pedra (true) ou pele de vidro contínua (false) */
  punched?: boolean;
};

/** Textura de fachada (cor) e mapa de janelas acesas (emissivo), repetíveis. */
export function facadeTextures(style: FacadeStyle, seed: number, anisotropy = 4) {
  const S = 256;
  const rnd = seeded(seed);
  const mk = () => {
    const c = document.createElement('canvas');
    c.width = c.height = S;
    return c;
  };
  const cMap = mk();
  const cEmi = mk();
  const g = cMap.getContext('2d')!;
  const e = cEmi.getContext('2d')!;
  g.fillStyle = style.frame;
  g.fillRect(0, 0, S, S);
  e.fillStyle = '#000';
  e.fillRect(0, 0, S, S);
  const cw = S / style.cols;
  const ch = S / style.rows;
  const m = style.mullion;
  const lerpHex = (a: string, b: string, t: number) => {
    const pa = parseInt(a.slice(1), 16);
    const pb = parseInt(b.slice(1), 16);
    const ch3 = [16, 8, 0].map((sh) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t));
    return `rgb(${ch3[0]},${ch3[1]},${ch3[2]})`;
  };
  for (let r = 0; r < style.rows; r++) {
    // andares inteiros tendem a ter o mesmo padrão de ocupação
    const floorLit = rnd() < style.lit * 1.6;
    for (let k = 0; k < style.cols; k++) {
      const x = k * cw + cw * m;
      const y = r * ch + ch * (style.punched ? m * 1.6 : m);
      const w = cw * (1 - 2 * m);
      const h = ch * (1 - (style.punched ? 3.2 : 2) * m);
      g.fillStyle = lerpHex(style.glass[0], style.glass[1], rnd() * 0.8);
      g.fillRect(x, y, w, h);
      // reflexo sutil no topo do vidro
      g.fillStyle = 'rgba(255,255,255,0.05)';
      g.fillRect(x, y, w, h * 0.18);
      if (floorLit && rnd() < 0.62) {
        const col = style.litColors[Math.floor(rnd() * style.litColors.length)];
        const a = 0.55 + rnd() * 0.45;
        e.globalAlpha = a;
        e.fillStyle = col;
        e.fillRect(x, y, w, h);
        e.globalAlpha = 1;
        g.fillStyle = col;
        g.globalAlpha = 0.35 * a;
        g.fillRect(x, y, w, h);
        g.globalAlpha = 1;
      }
    }
  }
  const map = new THREE.CanvasTexture(cMap);
  const emissive = new THREE.CanvasTexture(cEmi);
  [map, emissive].forEach((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = anisotropy;
    t.colorSpace = THREE.SRGBColorSpace;
  });
  return { map, emissive };
}

/**
 * Caixa com UVs em escala de mundo: a janela tem sempre o mesmo tamanho, qualquer que seja o prédio.
 * `cellW`/`cellH`: largura e altura (em unidades de mundo) cobertas por uma repetição da textura.
 */
export function boxWorldUV(w: number, h: number, d: number, cellW: number, cellH: number) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  // ordem das faces do BoxGeometry: +x, -x, +y, -y, +z, -z (4 vértices cada)
  const faceW = [d, d, w, w, w, w];
  const faceH = [h, h, d, d, h, h];
  for (let f = 0; f < 6; f++) {
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v;
      uv.setXY(i, uv.getX(i) * (faceW[f] / cellW), uv.getY(i) * (faceH[f] / cellH));
    }
  }
  uv.needsUpdate = true;
  return geo;
}

/** Céu em gradiente vertical (sem textura), com brilho opcional numa direção. Não sofre névoa. */
export function skyDome(stops: [number, string][], glowDir?: THREE.Vector3, glowColor = '#ffb070', glowPower = 24, glowStrength = 0.3) {
  const n = stops.length;
  const uniforms: Record<string, THREE.IUniform> = {
    uStopsY: { value: stops.map((s) => s[0]).concat(new Array(8 - n).fill(2)) },
    uStopsC: { value: stops.map((s) => new THREE.Color(s[1])).concat(new Array(8 - n).fill(new THREE.Color(stops[n - 1][1]))) },
    uCount: { value: n },
    uGlowDir: { value: (glowDir ?? new THREE.Vector3(0, 0, -1)).clone().normalize() },
    uGlowColor: { value: new THREE.Color(glowColor) },
    uGlowPower: { value: glowPower },
    uGlowStrength: { value: glowDir ? glowStrength : 0 },
    uExposure: { value: 1 }
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform float uStopsY[8];
      uniform vec3 uStopsC[8];
      uniform int uCount;
      uniform vec3 uGlowDir;
      uniform vec3 uGlowColor;
      uniform float uGlowPower;
      uniform float uGlowStrength;
      uniform float uExposure;
      varying vec3 vDir;
      void main() {
        float y = vDir.y;
        vec3 col = uStopsC[0];
        for (int i = 1; i < 8; i++) {
          if (i >= uCount) break;
          float t = clamp((y - uStopsY[i - 1]) / max(1e-4, uStopsY[i] - uStopsY[i - 1]), 0.0, 1.0);
          col = mix(col, uStopsC[i], t);
        }
        float g = pow(max(dot(normalize(vDir), uGlowDir), 0.0), uGlowPower) * uGlowStrength;
        col += uGlowColor * g;
        gl_FragColor = vec4(col * uExposure, 1.0);
        #include <colorspace_fragment>
      }`
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(400, 48, 24), mat);
  mesh.renderOrder = -10;
  return { mesh, uniforms };
}

/** Aproxima um valor do alvo por tempo (não por quadro). */
export const approach = (cur: number, target: number, dt: number, rate: number) => cur + (target - cur) * (1 - Math.exp(-dt * rate));

/** Piso de tábuas de madeira (cor), repetível; `seed` muda o desenho das tábuas. */
export function woodTexture(seed: number, anisotropy = 4, base = '#7a5a3e') {
  const S = 512;
  const rnd = seeded(seed);
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);
  const rows = 8;
  const h = S / rows;
  for (let r = 0; r < rows; r++) {
    let x = -rnd() * S * 0.5;
    while (x < S) {
      const w = S * (0.35 + rnd() * 0.45);
      const l = 0.82 + rnd() * 0.3;
      g.fillStyle = `rgba(${Math.round(122 * l)},${Math.round(90 * l)},${Math.round(62 * l)},1)`;
      g.fillRect(x, r * h, w, h);
      // veios
      g.strokeStyle = 'rgba(40,25,15,0.18)';
      g.lineWidth = 1;
      for (let k = 0; k < 5; k++) {
        const y = r * h + rnd() * h;
        g.beginPath();
        g.moveTo(x, y);
        g.bezierCurveTo(x + w * 0.3, y + (rnd() - 0.5) * 6, x + w * 0.7, y + (rnd() - 0.5) * 6, x + w, y);
        g.stroke();
      }
      // junta
      g.fillStyle = 'rgba(25,16,10,0.55)';
      g.fillRect(x, r * h, 2, h);
      x += w;
    }
    g.fillStyle = 'rgba(25,16,10,0.6)';
    g.fillRect(0, r * h, S, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = anisotropy;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Mancha de luz suave (gradiente radial) para simular sol entrando pela janela. */
export function lightPoolTexture(color = '255,214,160') {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grd.addColorStop(0, `rgba(${color},0.9)`);
  grd.addColorStop(0.5, `rgba(${color},0.35)`);
  grd.addColorStop(1, `rgba(${color},0)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
