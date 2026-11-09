import * as THREE from 'three';
import { boxWorldUV, facadeTextures, seeded, skyDome, woodTexture, type FacadeStyle } from './architecture';

/*
 * Etapa 10 • Tela 05 — escritório contemporâneo onde a demonstração "acontece".
 * Planta aberta ao anoitecer: duas bancadas de mesas claras com monitores, cadeiras, luminárias lineares
 * pendentes, piso de carpete em placas, armários baixos com plantas à esquerda, sala de reunião de vidro
 * jateado à direita e, ao fundo, a fachada envidraçada para a cidade. O painel do produto cobre o centro;
 * o ambiente aparece nas margens, e o lado esquerdo (lista de passos) é mantido mais escuro.
 * Escala: 1 unidade ≈ 1 m. Piso em y = 0 (o grupo é posicionado pelo WorldStage).
 */

export const WORKSPACE_FOG = { color: new THREE.Color('#121417'), density: 0.04 };

const W = 7;
const H = 3.0;
const NEAR_Z = 4;
const WIN_Z = -10;

const NIGHT_CITY: FacadeStyle = {
  cols: 12,
  rows: 10,
  frame: '#181b21',
  glass: ['#1c232c', '#27303b'],
  lit: 0.3,
  litColors: ['#efd5a6', '#e2e6ec'],
  mullion: 0.09
};

/** Carpete em placas (tons de grafite levemente alternados). */
function carpetTexture() {
  const S = 256;
  const rnd = seeded(5050);
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const n = 4;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const l = 40 + Math.floor(rnd() * 6);
      g.fillStyle = `rgb(${l},${l + 1},${l + 3})`;
      g.fillRect((i * S) / n, (j * S) / n, S / n, S / n);
    }
  for (let k = 0; k < 4000; k++) {
    g.fillStyle = `rgba(255,255,255,${rnd() * 0.03})`;
    g.fillRect(rnd() * S, rnd() * S, 1, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildWorkspace(anisotropy: number) {
  const root = new THREE.Group();
  root.name = 'workspace';
  const rnd = seeded(5051);

  // ---------- céu de início de noite e cidade além da fachada
  const sky = skyDome(
    [
      [-0.2, '#14171d'],
      [0.0, '#2a303a'],
      [0.1, '#232a35'],
      [0.4, '#121821'],
      [0.9, '#0a0d13']
    ],
    new THREE.Vector3(0.3, 0.05, -1),
    '#c99064',
    12,
    0.12
  );
  root.add(sky.mesh);
  {
    const city = new THREE.Group();
    city.position.y = -40;
    root.add(city);
    const mats = [0, 1, 2].map((v) => {
      const t = facadeTextures(NIGHT_CITY, 5100 + v * 7, anisotropy);
      return new THREE.MeshStandardMaterial({ map: t.map, emissiveMap: t.emissive, emissive: 0xffffff, emissiveIntensity: 0.6, roughness: 0.5 });
    });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x15181d, roughness: 1 });
    for (let i = 0; i < 45; i++) {
      const x = (rnd() - 0.5) * 260;
      const z = WIN_Z - 50 - rnd() * 240;
      const h = 40 + rnd() * 80;
      const w = 16 + rnd() * 24;
      const m = mats[Math.floor(rnd() * 3)];
      const b = new THREE.Mesh(boxWorldUV(w, h, w, 12, 12), [m, m, roofMat, roofMat, m, m]);
      b.position.set(x, h / 2, z);
      city.add(b);
    }
  }

  // ---------- luz: interior quente e baixo; a cidade fica atrás do vidro
  root.add(new THREE.HemisphereLight(0xf2e6d4, 0x2a2724, 0.5));
  const key = new THREE.DirectionalLight(0xfff0dc, 0.55);
  key.position.set(2, 8, 3);
  root.add(key);

  // ---------- caixa do escritório
  const carpet = carpetTexture();
  carpet.repeat.set((W * 2) / 2, (NEAR_Z - WIN_Z) / 2);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, NEAR_Z - WIN_Z), new THREE.MeshStandardMaterial({ map: carpet, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, (NEAR_Z + WIN_Z) / 2);
  root.add(floor);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, NEAR_Z - WIN_Z), new THREE.MeshStandardMaterial({ color: 0x1d1e20, roughness: 1 }));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, H, (NEAR_Z + WIN_Z) / 2);
  root.add(ceiling);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x3a3936, roughness: 0.95 });
  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(NEAR_Z - WIN_Z, H), wallMat);
    wall.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    wall.position.set(side * W, H / 2, (NEAR_Z + WIN_Z) / 2);
    root.add(wall);
  }

  // fachada envidraçada do fundo
  const metal = new THREE.MeshStandardMaterial({ color: 0x24272c, roughness: 0.45, metalness: 0.6 });
  for (let x = -W; x <= W + 0.01; x += 1.75) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, H, 0.14), metal);
    m.position.set(x, H / 2, WIN_Z);
    root.add(m);
  }
  {
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, H), new THREE.MeshBasicMaterial({ color: 0x1a2028, transparent: true, opacity: 0.3, depthWrite: false }));
    glass.position.set(0, H / 2, WIN_Z + 0.02);
    root.add(glass);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(W * 2, 0.5, 0.3), metal);
    sill.position.set(0, 0.25, WIN_Z + 0.1);
    root.add(sill);
  }

  // ---------- bancadas de trabalho
  const deskTop = new THREE.MeshStandardMaterial({ color: 0xb9b4ab, roughness: 0.6 });
  const deskEdge = new THREE.MeshStandardMaterial({ map: woodTexture(5052, anisotropy, '#a07c58'), roughness: 0.6 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a1b1e, roughness: 0.6, metalness: 0.2 });
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x343c46 });
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.8 });
  const benchLen = 7.2;
  const benchZ = -5;
  for (const bx of [-2.5, 2.5]) {
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, benchLen), deskTop);
    top.position.set(bx, 0.74, benchZ);
    root.add(top);
    for (const s of [-1, 1]) {
      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, benchLen), deskEdge);
      edge.position.set(bx + s * 0.8, 0.74, benchZ);
      root.add(edge);
    }
    for (const z of [benchZ - benchLen / 2 + 0.1, benchZ, benchZ + benchLen / 2 - 0.1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.72, 0.04), dark);
      leg.position.set(bx, 0.36, z);
      root.add(leg);
    }
    // divisória baixa central
    const div = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.32, benchLen - 0.2), new THREE.MeshStandardMaterial({ color: 0x4a4e48, roughness: 1 }));
    div.position.set(bx, 0.92, benchZ);
    root.add(div);
    // postos: monitor + cadeira, dos dois lados
    for (let k = 0; k < 5; k++) {
      const z = benchZ - benchLen / 2 + 0.75 + k * 1.42;
      for (const s of [-1, 1]) {
        const mon = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.34, 0.56), dark);
        mon.add(body);
        const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.3), screenMat);
        scr.rotation.y = s < 0 ? -Math.PI / 2 : Math.PI / 2;
        scr.position.x = s * 0.02;
        mon.add(scr);
        mon.position.set(bx + s * 0.28, 1.0, z);
        root.add(mon);
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.07, 0.48), chairMat);
        seat.position.set(bx + s * 1.15, 0.47, z + (rnd() - 0.5) * 0.15);
        root.add(seat);
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.46), chairMat);
        back.position.set(bx + s * 1.38, 0.78, seat.position.z);
        root.add(back);
      }
    }
    // luminária linear pendente sobre a bancada
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, benchLen - 0.6), dark);
    lamp.position.set(bx, 2.55, benchZ);
    root.add(lamp);
    const lampLight = new THREE.Mesh(new THREE.PlaneGeometry(0.1, benchLen - 0.7), new THREE.MeshBasicMaterial({ color: 0x2e2b27 }));
    lampLight.rotation.x = Math.PI / 2;
    lampLight.position.set(bx, 2.52, benchZ);
    root.add(lampLight);
    for (const z of [benchZ - 2.6, benchZ + 2.6]) {
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, H - 2.55, 4), dark);
      cable.position.set(bx, 2.55 + (H - 2.55) / 2, z);
      root.add(cable);
    }
  }

  // ---------- à esquerda: armários baixos com plantas
  {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.95, 8), new THREE.MeshStandardMaterial({ color: 0x5b5852, roughness: 0.8 }));
    cab.position.set(-W + 0.3, 0.475, -4.5);
    root.add(cab);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.03, 8.02), deskEdge);
    top.position.set(-W + 0.3, 0.965, -4.5);
    root.add(top);
    const leaf = new THREE.MeshStandardMaterial({ color: 0x2f4a33, roughness: 0.9, flatShading: true });
    const pot = new THREE.MeshStandardMaterial({ color: 0x2c2b29, roughness: 0.9 });
    for (let i = 0; i < 4; i++) {
      const z = -1.5 - i * 2;
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.25, 12), pot);
      p.position.set(-W + 0.3, 1.1, z);
      root.add(p);
      for (let k = 0; k < 4; k++) {
        const l = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16 + rnd() * 0.1, 0), leaf);
        l.position.set(-W + 0.3 + (rnd() - 0.5) * 0.25, 1.35 + rnd() * 0.3, z + (rnd() - 0.5) * 0.25);
        root.add(l);
      }
    }
  }

  // ---------- à direita: sala de reunião de vidro jateado
  {
    const rx = W - 1.9;
    const rz = -3.5;
    const frost = new THREE.MeshBasicMaterial({ color: 0x9aa3ab, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide });
    const front = new THREE.Mesh(new THREE.PlaneGeometry(4.2, H), frost);
    front.rotation.y = Math.PI / 2;
    front.position.set(rx - 1.8, H / 2, rz);
    root.add(front);
    const bandMat = new THREE.MeshBasicMaterial({ color: 0xb8bec4, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide });
    const band = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.35), bandMat);
    band.rotation.y = Math.PI / 2;
    band.position.set(rx - 1.79, 1.25, rz);
    root.add(band);
    for (const z of [rz - 2.1, rz, rz + 2.1]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, H, 0.05), metal);
      m.position.set(rx - 1.8, H / 2, z);
      root.add(m);
    }
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 2.6), deskEdge);
    table.position.set(rx, 0.74, rz);
    root.add(table);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.2), new THREE.MeshBasicMaterial({ color: 0xe0d2b8 }));
    glow.rotation.x = Math.PI / 2;
    glow.position.set(rx, H - 0.05, rz);
    root.add(glow);
  }

  // cena estática
  const update = () => {};
  return { root, update };
}
