import * as THREE from 'three';
import { seeded } from './architecture';

/*
 * Etapa 10 • Tela 07 — portal monumental em torno do portal de validação existente (que NÃO muda).
 * Um paredão de cantaria escura com uma abertura exatamente atrás do portal, emoldurada por três molduras de pedra
 * escalonadas em recuo; uma fenda vertical de luz acima; um eixo de aproximação com lajes claras ladeado por
 * espelhos d'água. Atrás do paredão fica a sala da tela 08 (modular.ts), revelada quando os shoji se abrem.
 * Todos os materiais ignoram a névoa (fog: false): a névoa padrão continua valendo para o portal, que fica igual.
 * Sem luzes próprias.
 * Escala: o portal tem ~2 m; piso em y = 0 local (o WorldStage posiciona o grupo no nível da soleira).
 */

const OPEN_HW = 1.48; // meia largura da abertura (folga para o lintel do portal)
const OPEN_H = 2.45;
const WALL_Z = -0.38; // face frontal do paredão
const WALL_T = 0.6;
const WALL_HW = 11;
const WALL_H = 15;

function stoneTexture(seed: number, base: [number, number, number]) {
  const S = 512;
  const rnd = seeded(seed);
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  g.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
  g.fillRect(0, 0, S, S);
  const rows = 6;
  const h = S / rows;
  for (let r = 0; r < rows; r++) {
    let x = -rnd() * 120;
    while (x < S) {
      const w = 120 + rnd() * 140;
      const l = 0.88 + rnd() * 0.2;
      g.fillStyle = `rgb(${Math.round(base[0] * l)},${Math.round(base[1] * l)},${Math.round(base[2] * l)})`;
      g.fillRect(x + 2, r * h + 2, w - 4, h - 4);
      x += w;
    }
  }
  for (let i = 0; i < 2500; i++) {
    g.fillStyle = `rgba(255,255,255,${rnd() * 0.025})`;
    g.fillRect(rnd() * S, rnd() * S, 2, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildPortal() {
  const root = new THREE.Group();
  root.name = 'portal-hall';

  const stoneTex = stoneTexture(7070, [34, 32, 30]);
  const wallTex = stoneTex.clone();
  wallTex.repeat.set((WALL_HW * 2) / 3, WALL_H / 3);
  wallTex.needsUpdate = true;
  const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9, fog: false });
  const frameMats = [0x2e2b28, 0x272522, 0x211f1d].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, fog: false }));
  const darkStone = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.35, metalness: 0.2, fog: false });
  const paleStone = new THREE.MeshStandardMaterial({ color: 0x4a4744, roughness: 0.6, fog: false });
  const water = new THREE.MeshStandardMaterial({ color: 0x07090c, roughness: 0.06, metalness: 0.85, fog: false });

  // ---------- paredão com a abertura do portal (três peças: esquerda, direita, acima)
  {
    const sideW = WALL_HW - OPEN_HW;
    for (const s of [-1, 1]) {
      const piece = new THREE.Mesh(new THREE.BoxGeometry(sideW, WALL_H, WALL_T), wallMat);
      piece.position.set(s * (OPEN_HW + sideW / 2), WALL_H / 2, WALL_Z - WALL_T / 2);
      root.add(piece);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(OPEN_HW * 2, WALL_H - OPEN_H, WALL_T), wallMat);
    top.position.set(0, OPEN_H + (WALL_H - OPEN_H) / 2, WALL_Z - WALL_T / 2);
    root.add(top);
  }

  // ---------- três molduras escalonadas em recuo (jambas + verga), da maior (mais funda) à menor
  for (let k = 2; k >= 0; k--) {
    const hw = OPEN_HW + 0.18 + k * 0.5;
    const h = OPEN_H + 0.18 + k * 0.42;
    const t = 0.36;
    const d = 0.12 + (2 - k) * 0.12;
    const z = WALL_Z + d / 2;
    const m = frameMats[k];
    for (const s of [-1, 1]) {
      const jamb = new THREE.Mesh(new THREE.BoxGeometry(t, h, d), m);
      jamb.position.set(s * (hw - t / 2), h / 2, z);
      root.add(jamb);
    }
    const head = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, t, d), m);
    head.position.set(0, h - t / 2, z);
    root.add(head);
  }

  // ---------- fenda vertical de luz acima da moldura e cornija alta
  {
    const slit = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 7.5), new THREE.MeshBasicMaterial({ color: 0x4a3f33, fog: false }));
    slit.position.set(0, 5.0 + 7.5 / 2, WALL_Z + 0.005);
    root.add(slit);
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(WALL_HW * 2, 0.3, 0.4), frameMats[2]);
    cornice.position.set(0, 12.6, WALL_Z + 0.2);
    root.add(cornice);
  }

  // ---------- pilastras altas no paredão (ritmo monumental)
  for (const x of [-8.4, -5.6, 5.6, 8.4]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.7, WALL_H, 0.3), frameMats[1]);
    p.position.set(x, WALL_H / 2, WALL_Z + 0.15);
    root.add(p);
  }

  // ---------- piso: pedra escura polida, eixo de lajes claras e espelhos d'água laterais
  {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(WALL_HW * 2, 16), darkStone);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -0.002, WALL_Z + 8);
    root.add(floor);
    for (let i = 0; i < 9; i++) {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.02, 0.9), paleStone);
      slab.position.set(0, 0.01, WALL_Z + 0.85 + i * 1.0);
      root.add(slab);
    }
    for (const s of [-1, 1]) {
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 9), water);
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(s * 2.9, 0.004, WALL_Z + 5);
      root.add(pool);
      for (const [w, d, x, z] of [
        [2.6, 0.12, s * 2.9, WALL_Z + 0.44],
        [0.12, 9.2, s * 1.64, WALL_Z + 5],
        [0.12, 9.2, s * 4.16, WALL_Z + 5]
      ] as const) {
        const rim = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), paleStone);
        rim.position.set(x, 0.025, z);
        root.add(rim);
      }
    }
  }

  // A "câmara interior" é a própria sala da tela 08 (modular.ts), vista pela abertura quando o portão abre.

  const update = () => {};
  return { root, update };
}
