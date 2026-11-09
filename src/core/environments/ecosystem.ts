import * as THREE from 'three';
import { seeded, skyDome } from './architecture';

/*
 * Etapa 10 • Tela 06 — ecossistema integrado de vidro e metal (adaptação ao Japão).
 * Pavilhão de vidro jateado e alumínio claro, em camadas: as duas treliças kumiko já existentes passam a ler como
 * gravações em DIVISÓRIAS de vidro jateado com luz própria suave (mesmas posições). Entre e além das camadas, um
 * jardim interno com luz fria — o "ecossistema" que as camadas integram. Piso escuro polido com reflexo suave das
 * divisórias. Colunas finas e afastadas para as bordas (nada pesado atrás do texto). A divisória da frente tem um
 * vão central: na 06.2 a câmera atravessa por ele até a camada de decisão. Cena estática.
 * Coordenadas no mesmo referencial das treliças (WorldStage); o piso fica em y = FLOOR.
 */

export const ECOSYSTEM_FOG = { color: new THREE.Color('#0d1014'), density: 0.035 };

const FLOOR = -1.9;
const TOP = 2.6;
const W = 7;
const NEAR_Z = 4;
const FAR_Z = -13;
const CX = 0.5; // centro das treliças

/** Vidro jateado com luz própria: mais claro no meio, apagando nas bordas e no alto. */
function frostTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;
  const v = g.createLinearGradient(0, 256, 0, 0);
  v.addColorStop(0, 'rgba(200,214,228,0.75)');
  v.addColorStop(0.45, 'rgba(180,196,214,0.45)');
  v.addColorStop(1, 'rgba(160,176,196,0.12)');
  g.fillStyle = v;
  g.fillRect(0, 0, 256, 256);
  const h = g.createLinearGradient(0, 0, 256, 0);
  h.addColorStop(0, 'rgba(0,0,0,0.85)');
  h.addColorStop(0.18, 'rgba(0,0,0,0)');
  h.addColorStop(0.82, 'rgba(0,0,0,0)');
  h.addColorStop(1, 'rgba(0,0,0,0.85)');
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = h;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Reflexo suave no piso polido (gradiente que some com a distância da divisória). */
function reflectionTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const g = c.getContext('2d')!;
  const v = g.createLinearGradient(0, 0, 0, 256);
  v.addColorStop(0, 'rgba(190,205,222,0.5)');
  v.addColorStop(1, 'rgba(190,205,222,0)');
  g.fillStyle = v;
  g.fillRect(0, 0, 128, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildEcosystem() {
  const root = new THREE.Group();
  root.name = 'ecosystem';
  const rnd = seeded(6060);

  const sky = skyDome(
    [
      [-0.2, '#0e1116'],
      [0.0, '#1c232c'],
      [0.2, '#141a22'],
      [0.9, '#090c11']
    ],
    new THREE.Vector3(0, 0.15, -1),
    '#8ea2bb',
    6,
    0.1
  );
  root.add(sky.mesh);

  // ---------- luz fria e contida; o jardim recebe uma luz própria, de cima
  root.add(new THREE.HemisphereLight(0xd6dee8, 0x1d2024, 0.55));
  const key = new THREE.DirectionalLight(0xe6edf6, 0.5);
  key.position.set(-3, 8, 4);
  root.add(key);
  const gardenLight = new THREE.DirectionalLight(0xd8e4f0, 0.9);
  gardenLight.position.set(1, 10, -8);
  gardenLight.target.position.set(0.5, FLOOR, -8.5);
  root.add(gardenLight, gardenLight.target);

  const alu = new THREE.MeshStandardMaterial({ color: 0x8d949c, roughness: 0.4, metalness: 0.7 });
  const aluDark = new THREE.MeshStandardMaterial({ color: 0x4a5058, roughness: 0.45, metalness: 0.7 });
  const frost = frostTexture();

  // ---------- piso escuro polido com juntas claras finas
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, NEAR_Z - FAR_Z), new THREE.MeshStandardMaterial({ color: 0x15181c, roughness: 0.2, metalness: 0.35 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, FLOOR, (NEAR_Z + FAR_Z) / 2);
  root.add(floor);
  {
    const jointMat = new THREE.MeshBasicMaterial({ color: 0x2a2f36 });
    for (let x = -W + 1.4; x < W; x += 1.4) {
      const j = new THREE.Mesh(new THREE.PlaneGeometry(0.012, NEAR_Z - FAR_Z), jointMat);
      j.rotation.x = -Math.PI / 2;
      j.position.set(x, FLOOR + 0.002, (NEAR_Z + FAR_Z) / 2);
      root.add(j);
    }
  }

  // ---------- estrutura: poucas colunas finas, nas bordas; cobertura com linhas claras finas
  for (let z = 2.4; z >= FAR_Z; z -= 4.2) {
    for (const x of [-W + 0.6, W - 0.6]) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.09, TOP - FLOOR, 0.09), alu);
      col.position.set(x, (TOP + FLOOR) / 2, z);
      root.add(col);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(W * 2, 0.06, 0.06), aluDark);
    beam.position.set(0, TOP + 0.03, z);
    root.add(beam);
  }
  {
    const roof = new THREE.Mesh(
      new THREE.PlaneGeometry(W * 2, NEAR_Z - FAR_Z),
      new THREE.MeshBasicMaterial({ color: 0x1a2028, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide })
    );
    roof.rotation.x = Math.PI / 2;
    roof.position.set(0, TOP + 0.08, (NEAR_Z + FAR_Z) / 2);
    root.add(roof);
  }

  // ---------- jardim interno entre as camadas e além delas (cascalho claro, pedras, bambus)
  {
    const gravel = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.2), new THREE.MeshStandardMaterial({ color: 0x3a3c3e, roughness: 1 }));
    gravel.rotation.x = -Math.PI / 2;
    gravel.position.set(CX, FLOOR + 0.01, -8.6);
    root.add(gravel);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(8.1, 0.06, 0.08), alu);
    edge.position.set(CX, FLOOR + 0.03, -6.45);
    root.add(edge);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4a4b4c, roughness: 0.95, flatShading: true });
    for (const [x, z, s] of [
      [-1.2, -8.2, 0.42],
      [1.9, -9.1, 0.32],
      [0.2, -9.6, 0.25]
    ] as const) {
      const g = new THREE.DodecahedronGeometry(s, 1);
      g.scale(1.5, 0.6, 1.1);
      const st = new THREE.Mesh(g, stoneMat);
      st.position.set(x, FLOOR + s * 0.25, z);
      st.rotation.y = rnd() * 3;
      root.add(st);
    }
    // bosque de bambus esguios
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0x4d5a43, roughness: 0.8 });
    const n = 26;
    const bamboo = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.025, 0.03, TOP - FLOOR + 3, 6), bambooMat, n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const x = CX - 3.5 + rnd() * 7;
      const z = -9.8 - rnd() * 0.9;
      o.position.set(x, (TOP + FLOOR + 3) / 2, z);
      o.rotation.set((rnd() - 0.5) * 0.06, 0, (rnd() - 0.5) * 0.06);
      o.updateMatrix();
      bamboo.setMatrixAt(i, o.matrix);
    }
    root.add(bamboo);
    // nós do bambu: anéis finos a cada ~0,5 m (sem folhagem em "discos")
    const nodeMat = new THREE.MeshStandardMaterial({ color: 0x5e6b52, roughness: 0.7 });
    const nodes = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.034, 0.034, 0.02, 6), nodeMat, n * 9);
    let ni = 0;
    const m4 = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      bamboo.getMatrixAt(i, m4);
      pos.setFromMatrixPosition(m4);
      for (let k = 0; k < 9; k++) {
        o.position.set(pos.x, FLOOR + 0.4 + k * 0.52, pos.z);
        o.rotation.set(0, 0, 0);
        o.updateMatrix();
        nodes.setMatrixAt(ni++, o.matrix);
      }
    }
    root.add(nodes);
    // muro claro atrás do bambu, banhado de luz fria
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(9, TOP - FLOOR + 1), new THREE.MeshStandardMaterial({ color: 0x6c727a, roughness: 1 }));
    wall.position.set(CX, (TOP + FLOOR + 1) / 2, -11);
    root.add(wall);
  }

  // ---------- divisórias de vidro jateado nas posições das treliças kumiko
  const reflection = reflectionTexture();
  const partition = (z: number, w: number, doorway: boolean, glow: number) => {
    const h = TOP - FLOOR;
    const cy = (TOP + FLOOR) / 2;
    const pieces: [number, number][] = doorway
      ? [
          [CX - w / 2, -0.35],
          [0.75, CX + w / 2]
        ]
      : [[CX - w / 2, CX + w / 2]];
    const paneMat = new THREE.MeshBasicMaterial({ map: frost, color: 0xffffff, transparent: true, opacity: glow, depthWrite: false, side: THREE.DoubleSide });
    for (const [x0, x1] of pieces) {
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, h), paneMat);
      pane.position.set((x0 + x1) / 2, cy, z - 0.1);
      root.add(pane);
      // caixilho fino de alumínio claro: só contorno e poucos montantes
      const nSeg = Math.max(1, Math.round((x1 - x0) / 1.8));
      for (let k = 0; k <= nSeg; k++) {
        const x = x0 + (k * (x1 - x0)) / nSeg;
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.025, h, 0.04), alu);
        m.position.set(x, cy, z - 0.1);
        root.add(m);
      }
      for (const y of [FLOOR + 0.03, TOP - 0.03]) {
        const t = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.04, 0.05), alu);
        t.position.set((x0 + x1) / 2, y, z - 0.1);
        root.add(t);
      }
      // reflexo da divisória no piso polido
      const refl = new THREE.Mesh(
        new THREE.PlaneGeometry(x1 - x0, 1.6),
        new THREE.MeshBasicMaterial({ map: reflection, transparent: true, opacity: glow * 0.6, depthWrite: false, blending: THREE.AdditiveBlending })
      );
      refl.rotation.x = -Math.PI / 2;
      refl.position.set((x0 + x1) / 2, FLOOR + 0.004, z - 0.1 + 0.8);
      root.add(refl);
    }
  };
  // camada da frente mais discreta (fica atrás do texto na 06.1); a de trás um pouco mais luminosa
  partition(-1.4, 6.4, true, 0.15);
  partition(-4.8, 7.2, false, 0.24);

  // cena estática
  const update = () => {};
  return { root, update };
}
