import * as THREE from 'three';
import { seeded, woodTexture } from './architecture';

/*
 * Etapa 10 • Tela 04 — espaço de transição japonês contemporâneo (Kizuna Start: "começamos pela equipe").
 * Vestíbulo moderno, distinto do corredor tradicional da tela 03: piso de concreto polido, brises verticais
 * de madeira clara à esquerda, parede de reboco com linha de luz baixa e banco à direita, forro de ripas claras
 * e, ao fundo, um pano de vidro aberto para um pequeno jardim interno (tsuboniwa) — cascalho rastelado,
 * uma pedra e uma árvore — ao entardecer. Concreto, vidro e madeira clara; cena estática.
 * Escala: 1 unidade ≈ 1 m. Piso em y = 0 (o grupo é posicionado pelo WorldStage, olho a ~1,6 m).
 */

export const PASSAGE_FOG = { color: new THREE.Color('#111214'), density: 0.035 };

const W = 3.6; // meia largura
const H = 3.0;
const NEAR_Z = 4;
const GLASS_Z = -6;
const YARD_Z = -10;

/** Cascalho rastelado (linhas paralelas com um círculo ao redor da pedra). */
function gravelTexture() {
  const S = 1024;
  const rnd = seeded(4040);
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  g.fillStyle = '#a3a097';
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 9000; i++) {
    const l = 110 + Math.floor(rnd() * 70);
    g.fillStyle = `rgba(${l},${l - 2},${l - 6},0.5)`;
    g.fillRect(rnd() * S, rnd() * S, 2, 2);
  }
  g.lineWidth = 3;
  const cx = S * 0.44;
  const cy = S * 0.55;
  for (let y = 12; y < S; y += 22) {
    g.strokeStyle = 'rgba(60,58,54,0.35)';
    g.beginPath();
    let pen = false;
    for (let x = 0; x <= S; x += 8) {
      const inside = Math.hypot(x - cx, y - cy) < 230;
      if (inside) {
        pen = false;
        continue;
      }
      if (!pen) {
        g.moveTo(x, y);
        pen = true;
      } else g.lineTo(x, y);
    }
    g.stroke();
  }
  for (let r = 140; r <= 230; r += 22) {
    g.strokeStyle = 'rgba(60,58,54,0.35)';
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildPassage(anisotropy: number) {
  const root = new THREE.Group();
  root.name = 'passage';
  const rnd = seeded(4041);

  // ---------- luz: penumbra neutra no vestíbulo, luz fria de entardecer no jardim, calor indireto nas paredes
  root.add(new THREE.HemisphereLight(0xdfe4ea, 0x2a2622, 0.6));
  const dusk = new THREE.DirectionalLight(0xc6d2e2, 0.7);
  dusk.position.set(-3, 12, -9);
  dusk.target.position.set(0, 0, -8);
  root.add(dusk, dusk.target);
  const warm = new THREE.DirectionalLight(0xffdcb6, 0.35);
  warm.position.set(4, 3, 6);
  root.add(warm);
  // luz quente rasante que banha o muro do jardim (vista através do vidro)
  const yardWash = new THREE.DirectionalLight(0xffd9b0, 0.85);
  yardWash.position.set(0.5, 0.5, -6.5);
  yardWash.target.position.set(0, 3, -10);
  root.add(yardWash, yardWash.target);

  const concrete = new THREE.MeshStandardMaterial({ color: 0x3c3d40, roughness: 0.3, metalness: 0.08 });
  const plaster = new THREE.MeshStandardMaterial({ color: 0x5f5d59, roughness: 0.95 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x1f2124, roughness: 0.4, metalness: 0.6 });
  const lightWood = new THREE.MeshStandardMaterial({ map: woodTexture(4042, anisotropy, '#b89a74'), color: 0x9c8a74, roughness: 0.6 });

  // ---------- piso de concreto polido
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, NEAR_Z - GLASS_Z), concrete);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, (NEAR_Z + GLASS_Z) / 2);
  root.add(floor);

  // ---------- forro: ripas claras no sentido do jardim
  {
    const back = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, NEAR_Z - GLASS_Z), new THREE.MeshStandardMaterial({ color: 0x1a1a1b, roughness: 1 }));
    back.rotation.x = Math.PI / 2;
    back.position.set(0, H + 0.04, (NEAR_Z + GLASS_Z) / 2);
    root.add(back);
    const n = Math.floor((W * 2) / 0.16);
    const slats = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.06, NEAR_Z - GLASS_Z), lightWood, n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      o.position.set(-W + 0.08 + i * 0.16, H - 0.03, (NEAR_Z + GLASS_Z) / 2);
      o.updateMatrix();
      slats.setMatrixAt(i, o.matrix);
    }
    root.add(slats);
  }

  // ---------- parede esquerda: brises verticais de madeira clara sobre fundo escuro
  {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(NEAR_Z - GLASS_Z, H), new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 1 }));
    wall.rotation.y = Math.PI / 2;
    wall.position.set(-W, H / 2, (NEAR_Z + GLASS_Z) / 2);
    root.add(wall);
    const n = Math.floor((NEAR_Z - GLASS_Z) / 0.17);
    const fins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, H, 0.045), lightWood, n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      o.position.set(-W + 0.12, H / 2, NEAR_Z - 0.1 - i * 0.17);
      o.updateMatrix();
      fins.setMatrixAt(i, o.matrix);
    }
    root.add(fins);
  }

  // ---------- parede direita: reboco, linha de luz baixa e banco de madeira
  {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(NEAR_Z - GLASS_Z, H), plaster);
    wall.rotation.y = -Math.PI / 2;
    wall.position.set(W, H / 2, (NEAR_Z + GLASS_Z) / 2);
    root.add(wall);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, NEAR_Z - GLASS_Z - 0.6), new THREE.MeshBasicMaterial({ color: 0xc9b190 }));
    slot.position.set(W - 0.01, 0.62, (NEAR_Z + GLASS_Z) / 2);
    root.add(slot);
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 4.2), lightWood);
    bench.position.set(W - 0.35, 0.44, GLASS_Z + 3.4);
    root.add(bench);
    const benchBase = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.41, 4.0), steel);
    benchBase.position.set(W - 0.4, 0.205, GLASS_Z + 3.4);
    root.add(benchBase);
  }

  // ---------- pano de vidro para o jardim (montantes finos de aço)
  {
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, H), new THREE.MeshBasicMaterial({ color: 0x1c242c, transparent: true, opacity: 0.1, depthWrite: false }));
    glass.position.set(0, H / 2, GLASS_Z);
    root.add(glass);
    for (const x of [-W, -W / 2, W / 2, W]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, H, 0.08), steel);
      m.position.set(x, H / 2, GLASS_Z);
      root.add(m);
    }
    const head = new THREE.Mesh(new THREE.BoxGeometry(W * 2, 0.08, 0.1), steel);
    head.position.set(0, H - 0.04, GLASS_Z);
    root.add(head);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(W * 2, 0.05, 0.3), steel);
    sill.position.set(0, 0.025, GLASS_Z);
    root.add(sill);
  }

  // ---------- jardim interno (tsuboniwa)
  {
    const gravel = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, GLASS_Z - YARD_Z), new THREE.MeshStandardMaterial({ map: gravelTexture(), roughness: 1 }));
    gravel.rotation.x = -Math.PI / 2;
    gravel.position.set(0, -0.05, (GLASS_Z + YARD_Z) / 2);
    root.add(gravel);
    // muro do fundo, de reboco claro, banhado por luz quente de baixo
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, 7), new THREE.MeshStandardMaterial({ color: 0x847e75, roughness: 1 }));
    backWall.position.set(0, 3.45, YARD_Z);
    root.add(backWall);
    const washC = document.createElement('canvas');
    washC.width = 64;
    washC.height = 256;
    const wg = washC.getContext('2d')!;
    const wgrd = wg.createLinearGradient(0, 256, 0, 0);
    wgrd.addColorStop(0, 'rgba(255,214,170,0.55)');
    wgrd.addColorStop(1, 'rgba(255,214,170,0)');
    wg.fillStyle = wgrd;
    wg.fillRect(0, 0, 64, 256);
    const washT = new THREE.CanvasTexture(washC);
    washT.colorSpace = THREE.SRGBColorSpace;
    const wash = new THREE.Mesh(
      new THREE.PlaneGeometry(W * 2, 3.2),
      new THREE.MeshBasicMaterial({ map: washT, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    wash.position.set(0, 1.55, YARD_Z + 0.02);
    root.add(wash);
    for (const side of [-1, 1]) {
      const sw = new THREE.Mesh(new THREE.PlaneGeometry(GLASS_Z - YARD_Z, 7), new THREE.MeshStandardMaterial({ color: 0x45433f, roughness: 1 }));
      sw.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      sw.position.set(side * W, 3.45, (GLASS_Z + YARD_Z) / 2);
      root.add(sw);
    }
    // pedra
    const stoneGeo = new THREE.DodecahedronGeometry(0.42, 1);
    stoneGeo.scale(1.5, 0.6, 1.1);
    const stone = new THREE.Mesh(stoneGeo, new THREE.MeshStandardMaterial({ color: 0x4b4a47, roughness: 0.95, flatShading: true }));
    stone.position.set(-0.4, 0.12, -7.6);
    stone.rotation.y = 0.5;
    root.add(stone);
    // árvore: tronco esguio e copa de folhagem em camadas (bordo)
    const tree = new THREE.Group();
    tree.position.set(2.7, 0, -8.6);
    root.add(tree);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2c241e, roughness: 0.9 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 2.6, 8), trunkMat);
    trunk.position.y = 1.3;
    trunk.rotation.z = 0.06;
    tree.add(trunk);
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 1.2, 6), trunkMat);
    branch.position.set(0.35, 2.1, 0);
    branch.rotation.z = -0.9;
    tree.add(branch);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x5a3a26, roughness: 0.9, flatShading: true });
    for (let i = 0; i < 9; i++) {
      const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32 + rnd() * 0.22, 0), leafMat);
      leaf.position.set((rnd() - 0.4) * 1.5, 2.3 + rnd() * 0.9, (rnd() - 0.5) * 0.9);
      leaf.scale.y = 0.55;
      tree.add(leaf);
    }
  }

  // cena estática
  const update = () => {};
  return { root, update };
}
