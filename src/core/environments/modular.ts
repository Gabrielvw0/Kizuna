import * as THREE from 'three';
import { lightPoolTexture, seeded } from './architecture';

/*
 * Etapa 10 • Tela 08 — a sala depois do portão.
 * O paredão monumental da tela 07 separa a fachada (07) desta sala (08): ao abrir o portão vê-se o seu interior
 * e, na troca de tela, a câmera atravessa o vão até aqui. Mesma linguagem do portal — cantaria escura, laca e
 * dourado envelhecido — agora em arquitetura modular: paredes de painéis de madeira escura em grade com frisos
 * dourados, teto em caixotões com claraboia sobre a estrutura de crescimento, e um estrado de pedra onde a
 * estrutura (Start → Business → Enterprise) cresce. O eixo de lajes claras continua do portão até o estrado.
 * `setLight(k)`: 0 = sala na penumbra (portão fechado, tela 07), 1 = sala acesa (abertura e tela 08).
 * Todos os materiais ignoram a névoa. Coordenadas de mundo.
 */

const FLOOR = -1.53; // nível da soleira do portal
const WALL_BACK = -0.98; // face interna do paredão (portal.ts)
const BACK_Z = -24;
const X0 = -8;
const X1 = 10;
const CEIL = 5.6;
/** Centro do estrado onde a estrutura de crescimento fica (o WorldStage posiciona a estrutura aqui). */
export const HALL_DAIS = { x: 1.55, z: -12.6, top: -1.07 };

function panelTexture(seed: number) {
  const S = 512;
  const rnd = seeded(seed);
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const n = 4;
  const cell = S / n;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const l = 0.85 + rnd() * 0.25;
      g.fillStyle = `rgb(${Math.round(46 * l)},${Math.round(34 * l)},${Math.round(25 * l)})`;
      g.fillRect(i * cell, j * cell, cell, cell);
      g.strokeStyle = 'rgba(15,10,6,0.25)';
      for (let k = 0; k < 10; k++) {
        const x = i * cell + rnd() * cell;
        g.beginPath();
        g.moveTo(x, j * cell);
        g.bezierCurveTo(x + (rnd() - 0.5) * 8, j * cell + cell * 0.3, x + (rnd() - 0.5) * 8, j * cell + cell * 0.7, x + (rnd() - 0.5) * 6, (j + 1) * cell);
        g.stroke();
      }
    }
  // juntas escuras e friso dourado fino
  g.fillStyle = '#0e0b09';
  for (let k = 0; k <= n; k++) {
    g.fillRect(k * cell - 3, 0, 6, S);
    g.fillRect(0, k * cell - 3, S, 6);
  }
  g.fillStyle = 'rgba(176,138,69,0.55)';
  for (let k = 0; k <= n; k++) {
    g.fillRect(k * cell - 0.75, 0, 1.5, S);
    g.fillRect(0, k * cell - 0.75, S, 1.5);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function slabTexture() {
  const S = 512;
  const rnd = seeded(8090);
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const n = 2;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const l = 22 + Math.floor(rnd() * 5);
      g.fillStyle = `rgb(${l + 2},${l},${l - 1})`;
      g.fillRect((i * S) / n, (j * S) / n, S / n, S / n);
    }
  for (let k = 0; k < 3000; k++) {
    g.fillStyle = `rgba(255,255,255,${rnd() * 0.02})`;
    g.fillRect(rnd() * S, rnd() * S, 2, 2);
  }
  g.fillStyle = '#0d0c0b';
  for (let k = 0; k <= n; k++) {
    g.fillRect((k * S) / n - 2, 0, 4, S);
    g.fillRect(0, (k * S) / n - 2, S, 4);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildModular() {
  const root = new THREE.Group();
  root.name = 'hall-after-gate';
  const W = X1 - X0;
  const XC = (X0 + X1) / 2;
  const D = WALL_BACK - BACK_Z;
  const ZC = (WALL_BACK + BACK_Z) / 2;
  const H = CEIL - FLOOR;

  // materiais registrados para o controle de luz (penumbra ↔ acesa)
  const dimmable: { m: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial; base: THREE.Color }[] = [];
  const reg = <T extends THREE.MeshStandardMaterial | THREE.MeshBasicMaterial>(m: T) => {
    dimmable.push({ m, base: m.color.clone() });
    return m;
  };

  // ---------- luz própria da sala (quente, do alto e da claraboia)
  const hemi = new THREE.HemisphereLight(0xf2e2c8, 0x2a2018, 0.5);
  const sky = new THREE.DirectionalLight(0xfff0d8, 0.9);
  sky.position.set(HALL_DAIS.x, 12, HALL_DAIS.z + 2);
  sky.target.position.set(HALL_DAIS.x, FLOOR, HALL_DAIS.z);
  root.add(hemi, sky, sky.target);
  const lights: [THREE.Light, number][] = [
    [hemi, 0.5],
    [sky, 0.9]
  ];

  // ---------- piso de pedra escura em lajes grandes
  {
    const t = slabTexture();
    t.repeat.set(W / 3.2, D / 3.2);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), reg(new THREE.MeshStandardMaterial({ map: t, roughness: 0.7, metalness: 0.05, fog: false })));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(XC, FLOOR, ZC);
    root.add(floor);
  }
  // eixo de lajes claras: continua do portão até o estrado
  {
    const pale = reg(new THREE.MeshStandardMaterial({ color: 0x4a4744, roughness: 0.6, fog: false }));
    for (let z = WALL_BACK - 0.6; z > HALL_DAIS.z + 2.4; z -= 1.0) {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.02, 0.9), pale);
      slab.position.set(0, FLOOR + 0.01, z);
      root.add(slab);
    }
  }

  // ---------- estrado de pedra onde a estrutura cresce (degraus com friso dourado)
  {
    const stone = reg(new THREE.MeshStandardMaterial({ color: 0x1a1817, roughness: 0.9, metalness: 0, fog: false }));
    const gold = reg(new THREE.MeshStandardMaterial({ color: 0xb08a45, roughness: 0.35, metalness: 0.7, fog: false }));
    const steps = [
      [2.35, FLOOR, 0.16],
      [2.12, FLOOR + 0.16, 0.16],
      [1.95, FLOOR + 0.32, 0.135]
    ] as const;
    steps.forEach(([r, y, h]) => {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 96), stone);
      s.position.set(HALL_DAIS.x, y + h / 2, HALL_DAIS.z);
      root.add(s);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 6, 160), gold);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(HALL_DAIS.x, y + h, HALL_DAIS.z);
      root.add(rim);
    });
    // luz da claraboia pousada no estrado
    const pool = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 4.4),
      reg(new THREE.MeshBasicMaterial({ map: lightPoolTexture('255,226,186'), transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }))
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(HALL_DAIS.x, HALL_DAIS.top - 0.005, HALL_DAIS.z);
    root.add(pool);
  }

  // ---------- paredes de painéis modulares de madeira escura (fundo e laterais)
  {
    const mk = (w: number, seed: number) => {
      const t = panelTexture(seed);
      t.repeat.set(w / 4.8, H / 4.8);
      return reg(new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, metalness: 0.1, fog: false }));
    };
    const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mk(W, 8091));
    back.position.set(XC, FLOOR + H / 2, BACK_Z);
    root.add(back);
    const left = new THREE.Mesh(new THREE.PlaneGeometry(D, H), mk(D, 8092));
    left.rotation.y = Math.PI / 2;
    left.position.set(X0, FLOOR + H / 2, ZC);
    root.add(left);
    const right = new THREE.Mesh(new THREE.PlaneGeometry(D, H), mk(D, 8093));
    right.rotation.y = -Math.PI / 2;
    right.position.set(X1, FLOOR + H / 2, ZC);
    root.add(right);
    // pilastras de pedra no ritmo dos módulos
    const stoneMat = reg(new THREE.MeshStandardMaterial({ color: 0x2b2826, roughness: 0.85, fog: false }));
    for (let x = X0 + 2.4; x < X1 - 0.5; x += 4.8) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, H, 0.3), stoneMat);
      p.position.set(x, FLOOR + H / 2, BACK_Z + 0.15);
      root.add(p);
    }
    for (const x of [X0 + 0.15, X1 - 0.15]) {
      for (let z = WALL_BACK - 2.4; z > BACK_Z; z -= 4.8) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, H, 0.5), stoneMat);
        p.position.set(x, FLOOR + H / 2, z);
        root.add(p);
      }
    }
  }

  // ---------- teto em caixotões com claraboia sobre o estrado
  {
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), reg(new THREE.MeshStandardMaterial({ color: 0x141210, roughness: 0.9, fog: false })));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(XC, CEIL, ZC);
    root.add(ceil);
    const beamMat = reg(new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.7, fog: false }));
    for (let x = X0 + 2.4; x < X1; x += 2.4) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.4, D), beamMat);
      b.position.set(x, CEIL - 0.2, ZC);
      root.add(b);
    }
    for (let z = WALL_BACK - 2.4; z > BACK_Z; z -= 2.4) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(W, 0.4, 0.18), beamMat);
      b.position.set(XC, CEIL - 0.2, z);
      root.add(b);
    }
    const skylight = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), reg(new THREE.MeshBasicMaterial({ color: 0x8c8274, fog: false })));
    skylight.rotation.x = Math.PI / 2;
    skylight.position.set(HALL_DAIS.x, CEIL - 0.05, HALL_DAIS.z);
    root.add(skylight);
  }

  // ---------- linha de luz baixa (sanca) ao longo das paredes laterais
  {
    const cove = reg(new THREE.MeshBasicMaterial({ color: 0x5e4c36, fog: false }));
    for (const x of [X0 + 0.32, X1 - 0.32]) {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, D - 1), cove);
      l.position.set(x, FLOOR + 0.12, ZC);
      root.add(l);
    }
  }

  const DARK = 0.1;
  /** 0 = penumbra (portão fechado), 1 = acesa. */
  const setLight = (k: number) => {
    const c = Math.max(0, Math.min(1, k));
    const f = DARK + (1 - DARK) * c;
    dimmable.forEach(({ m, base }) => m.color.copy(base).multiplyScalar(f));
    lights.forEach(([l, i]) => (l.intensity = i * c));
  };
  setLight(1);
  return { root, setLight };
}
