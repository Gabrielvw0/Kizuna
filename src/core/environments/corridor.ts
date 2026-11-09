import * as THREE from 'three';
import { approach, seeded, woodTexture } from './architecture';

/*
 * Etapa 10 • Tela 03 — corredor japonês tradicional (madeira, pedra, papel).
 * Piso de tábuas escuras polidas, paredes de shoji iluminados por trás entre pilares de madeira, forro de ripas e,
 * ao fundo, QUATRO portas de correr — uma para cada dimensão da tela (cultura, idioma, hábitos, regulação).
 * A porta da cena atual desliza e deixa passar uma luz quente; na síntese (cena 5) as quatro estão abertas
 * e a fusão global × local acontece no limiar. Os cartões da interface continuam sendo o conteúdo.
 * Escala: 1 unidade ≈ 1 m. Piso em y = 0 (o grupo é posicionado pelo WorldStage, olho a ~1,55 m).
 */

export const CORRIDOR_FOG = { color: new THREE.Color('#0c0a09'), density: 0.045 };

const W = 4; // meia largura
const H = 2.6; // pé-direito
const END_Z = -6; // parede das quatro portas
export const DOOR_W = 1.9;
const DOOR_H = 2.1;
const NEAR_Z = 4;

/** Papel de shoji com grade kumiko (cor) — repetível. */
function shojiTexture(cols: number, rows: number) {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const grd = g.createLinearGradient(0, 0, 0, S);
  grd.addColorStop(0, '#e9dfcb');
  grd.addColorStop(1, '#d9cdb5');
  g.fillStyle = grd;
  g.fillRect(0, 0, S, S);
  // fibras do papel
  const rnd = seeded(77);
  g.strokeStyle = 'rgba(120,100,70,0.06)';
  for (let i = 0; i < 120; i++) {
    const x = rnd() * S;
    const y = rnd() * S;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (rnd() - 0.5) * 30, y + (rnd() - 0.5) * 30);
    g.stroke();
  }
  // kumiko
  g.fillStyle = '#3a2a1d';
  const t = 7;
  for (let k = 0; k <= cols; k++) g.fillRect(Math.round((k * S) / cols - t / 2), 0, t, S);
  for (let k = 0; k <= rows; k++) g.fillRect(0, Math.round((k * S) / rows - t / 2), S, t);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Luz quente do cômodo atrás das portas (gradiente). */
function warmRoomTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 150, 10, 128, 150, 200);
  grd.addColorStop(0, '#f1d3a0');
  grd.addColorStop(0.55, '#a8774a');
  grd.addColorStop(1, '#3a2617');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildCorridor(anisotropy: number) {
  const root = new THREE.Group();
  root.name = 'corridor';

  // ---------- luz: penumbra quente; a luz principal vem da porta aberta
  root.add(new THREE.HemisphereLight(0xf0dcc0, 0x24190f, 0.42));
  const doorLight = new THREE.PointLight(0xffd29a, 0, 9, 2);
  doorLight.position.set(0, 1.3, END_Z + 0.4);
  root.add(doorLight);

  const darkWood = new THREE.MeshStandardMaterial({ map: woodTexture(3101, anisotropy, '#3a2818'), color: 0x8a7a6a, roughness: 0.55 });
  const postMat = new THREE.MeshStandardMaterial({ color: 0x2c1f15, roughness: 0.6 });
  const plaster = new THREE.MeshStandardMaterial({ color: 0x6a6052, roughness: 0.95 });
  const stone = new THREE.MeshStandardMaterial({ color: 0x3b3a37, roughness: 0.9 });

  // ---------- piso de tábuas (no sentido do corredor), polido
  {
    const tex = woodTexture(3102, anisotropy, '#4a3424');
    tex.rotation = Math.PI / 2;
    tex.repeat.set(3, 4);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, NEAR_Z - END_Z + 2), new THREE.MeshStandardMaterial({ map: tex, color: 0x9a8a78, roughness: 0.32, metalness: 0.05 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, (NEAR_Z + END_Z - 2) / 2);
    root.add(floor);
    // soleira de pedra diante das portas
    const sill = new THREE.Mesh(new THREE.BoxGeometry(W * 2, 0.06, 0.5), stone);
    sill.position.set(0, 0.03, END_Z + 0.35);
    root.add(sill);
  }

  // ---------- forro: ripas escuras (sao-buchi) sobre fundo de madeira
  {
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, NEAR_Z - END_Z), new THREE.MeshStandardMaterial({ color: 0x1c140e, roughness: 0.9 }));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, H, (NEAR_Z + END_Z) / 2);
    root.add(ceil);
    const n = Math.floor((W * 2) / 0.45);
    const battens = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.04, NEAR_Z - END_Z), postMat, n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      o.position.set(-W + 0.225 + i * 0.45, H - 0.02, (NEAR_Z + END_Z) / 2);
      o.updateMatrix();
      battens.setMatrixAt(i, o.matrix);
    }
    root.add(battens);
  }

  // ---------- paredes laterais: pilares, rodapé de madeira, shoji iluminado, faixa de reboco
  {
    const BAY = 1.8;
    const shoji = shojiTexture(4, 8);
    const shojiMat = new THREE.MeshStandardMaterial({ map: shoji, emissiveMap: shoji, emissive: 0xffd9a8, emissiveIntensity: 0.16, roughness: 0.9 });
    for (const side of [-1, 1]) {
      for (let z = NEAR_Z; z > END_Z + 0.01; z -= BAY) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, H, 0.14), postMat);
        post.position.set(side * (W - 0.07), H / 2, z);
        root.add(post);
        // viga transversal no topo de cada par de pilares
        if (side < 0) {
          const beam = new THREE.Mesh(new THREE.BoxGeometry(W * 2, 0.14, 0.12), postMat);
          beam.position.set(0, H - 0.07, z);
          root.add(beam);
        }
        const zc = z - BAY / 2;
        if (zc < END_Z) continue;
        const panel = new THREE.Mesh(new THREE.PlaneGeometry(BAY - 0.14, 1.85), shojiMat);
        panel.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
        panel.position.set(side * W, 0.35 + 1.85 / 2, zc);
        root.add(panel);
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, BAY - 0.14), darkWood);
        base.position.set(side * (W - 0.02), 0.175, zc);
        root.add(base);
        const band = new THREE.Mesh(new THREE.PlaneGeometry(BAY - 0.14, H - 2.2), plaster);
        band.rotation.y = panel.rotation.y;
        band.position.set(side * W, 2.2 + (H - 2.2) / 2, zc);
        root.add(band);
        // trilho superior (kamoi)
        const kamoi = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, BAY - 0.14), postMat);
        kamoi.position.set(side * (W - 0.03), 2.2, zc);
        root.add(kamoi);
      }
    }
  }

  // ---------- parede do fundo: quatro portas de correr com bandeira (ranma)
  const doors: { mesh: THREE.Group; baseX: number; dir: number; open: number }[] = [];
  {
    // cômodo iluminado atrás das portas
    const room = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, H), new THREE.MeshBasicMaterial({ map: warmRoomTexture(), color: 0xb8a48c }));
    room.position.set(0, H / 2, END_Z - 1.2);
    root.add(room);
    const roomFloor = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, 1.3), new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 0.5 }));
    roomFloor.rotation.x = -Math.PI / 2;
    roomFloor.position.set(0, 0.002, END_Z - 0.6);
    root.add(roomFloor);

    // bandeira de ripas verticais acima das portas
    const ranmaBack = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, H - DOOR_H), new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.9 }));
    ranmaBack.position.set(0, DOOR_H + (H - DOOR_H) / 2, END_Z - 0.02);
    root.add(ranmaBack);
    const slatN = Math.floor((W * 2) / 0.09);
    const slats = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, H - DOOR_H - 0.08, 0.03), new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.7 }), slatN);
    const o = new THREE.Object3D();
    for (let i = 0; i < slatN; i++) {
      o.position.set(-W + 0.045 + i * 0.09, DOOR_H + (H - DOOR_H) / 2, END_Z + 0.01);
      o.updateMatrix();
      slats.setMatrixAt(i, o.matrix);
    }
    root.add(slats);
    const kamoi = new THREE.Mesh(new THREE.BoxGeometry(W * 2, 0.1, 0.18), postMat);
    kamoi.position.set(0, DOOR_H + 0.05, END_Z + 0.08);
    root.add(kamoi);
    // trechos de parede além das quatro portas
    const rest = W - 2 * DOOR_W;
    for (const side of [-1, 1]) {
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(rest, DOOR_H), plaster);
      wall.position.set(side * (W - rest / 2), DOOR_H / 2, END_Z + 0.16);
      root.add(wall);
    }

    // as portas: papel com kumiko e moldura de madeira; duas trilhas para deslizarem sem se cruzar
    const doorTex = shojiTexture(3, 6);
    const doorMat = new THREE.MeshStandardMaterial({ map: doorTex, emissiveMap: doorTex, emissive: 0xffd2a0, emissiveIntensity: 0.32, roughness: 0.9 });
    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      const paper = new THREE.Mesh(new THREE.PlaneGeometry(DOOR_W - 0.1, DOOR_H - 0.1), doorMat);
      g.add(paper);
      const frameT = 0.05;
      for (const [w, h, x, y] of [
        [DOOR_W, frameT, 0, (DOOR_H - frameT) / 2],
        [DOOR_W, frameT * 2, 0, -(DOOR_H - frameT * 2) / 2],
        [frameT, DOOR_H, -(DOOR_W - frameT) / 2, 0],
        [frameT, DOOR_H, (DOOR_W - frameT) / 2, 0]
      ] as const) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.04), postMat);
        f.position.set(x, y, 0.01);
        g.add(f);
      }
      const baseX = (i - 1.5) * DOOR_W;
      const front = i === 1 || i === 2;
      g.position.set(baseX, DOOR_H / 2, END_Z + (front ? 0.12 : 0.05));
      root.add(g);
      doors.push({ mesh: g, baseX, dir: i < 2 ? -1 : 1, open: 0 });
    }
    // trilho inferior (shikii)
    const shikii = new THREE.Mesh(new THREE.BoxGeometry(W * 2, 0.03, 0.2), postMat);
    shikii.position.set(0, 0.015, END_Z + 0.08);
    root.add(shikii);
  }

  /**
   * `openIndex`: porta aberta (0–3) nas cenas das portas; `all`: as quatro abertas (síntese).
   * O deslizar é suave (ou imediato com movimento reduzido).
   */
  const update = (dt: number, openIndex: number, all: boolean, reduced: boolean) => {
    let lightX = 0;
    let lightAmt = 0;
    doors.forEach((d, i) => {
      const target = all || i === openIndex ? 1 : 0;
      d.open = reduced ? target : approach(d.open, target, dt, 3.2);
      d.mesh.position.x = d.baseX + d.dir * d.open * (DOOR_W * 0.94);
      if (target) {
        lightX += d.baseX;
        lightAmt += 1;
      }
    });
    const tx = lightAmt ? lightX / lightAmt : 0;
    doorLight.position.x = reduced ? tx : approach(doorLight.position.x, tx, dt, 3);
    const ti = all ? 7 : lightAmt ? 5 : 0;
    doorLight.intensity = reduced ? ti : approach(doorLight.intensity, ti, dt, 2.5);
  };
  return { root, update };
}
