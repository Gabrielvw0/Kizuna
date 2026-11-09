import * as THREE from 'three';
import { seeded, woodTexture } from './architecture';

/*
 * Etapa 9 • Tela 11 — centro de planejamento e controle estratégico.
 * Sala de estratégia corporativa contemporânea: paredes de concreto, mesa longa de madeira escura,
 * cadeiras discretas, linhas de luz fria no teto e, na parede do fundo, três painéis de vidro escuro com
 * gráficos ABSTRATOS (curvas, barras e grade sem números nem texto: nada pode ser lido como dado real).
 * Uma linha vermelha fina atravessa a parede, ecoando o roadmap. Luz fria e sóbria; cena sem movimento
 * próprio — só a câmera desliza um pouco entre as duas cenas (WorldStage/CameraDirector).
 * Escala: 1 unidade ≈ 1 m. Piso em y = 0 (o grupo é posicionado pelo WorldStage).
 */

export const PLANNING_FOG = { color: new THREE.Color('#14171c'), density: 0.012 };

/** Painel abstrato: grade, curvas e barras sem valores — apenas atmosfera de acompanhamento. */
function abstractPanelTexture(seed: number) {
  const W = 640;
  const H = 380;
  const rnd = seeded(seed);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#121821');
  bg.addColorStop(1, '#0b0f15');
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  // grade muito discreta
  g.strokeStyle = 'rgba(150,170,195,0.07)';
  g.lineWidth = 1;
  for (let x = 40; x < W; x += 40) {
    g.beginPath();
    g.moveTo(x, 20);
    g.lineTo(x, H - 20);
    g.stroke();
  }
  for (let y = 40; y < H; y += 40) {
    g.beginPath();
    g.moveTo(20, y);
    g.lineTo(W - 20, y);
    g.stroke();
  }
  // barras abstratas (sem escala nem rótulos)
  const n = 9;
  for (let i = 0; i < n; i++) {
    const h = (0.15 + rnd() * 0.45) * H * 0.5;
    g.fillStyle = 'rgba(120,145,175,0.15)';
    g.fillRect(40 + i * ((W * 0.45) / n), H - 40 - h, (W * 0.45) / n - 8, h);
  }
  // curvas suaves
  const curve = (color: string, width: number, amp: number, off: number) => {
    g.strokeStyle = color;
    g.lineWidth = width;
    g.beginPath();
    for (let x = 0; x <= W - 60; x += 8) {
      const y = H * off + Math.sin(x * 0.012 + rnd() * 0.05 + seed) * amp + Math.sin(x * 0.031 + seed * 2) * amp * 0.35;
      if (x === 0) g.moveTo(30 + x, y);
      else g.lineTo(30 + x, y);
    }
    g.stroke();
  };
  curve('rgba(170,195,220,0.24)', 2, 26, 0.38);
  curve('rgba(170,195,220,0.18)', 1.5, 18, 0.52);
  curve('rgba(215,38,61,0.32)', 2, 14, 0.3);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildPlanning(anisotropy: number) {
  const root = new THREE.Group();
  root.name = 'planning';
  const rnd = seeded(1111);

  const BACK_Z = -7.5;
  const CEIL = 3.3;
  const HALF = 7;

  // ---------- luz fria e sóbria
  root.add(new THREE.HemisphereLight(0xcfd8e3, 0x2e3036, 0.75));
  const key = new THREE.DirectionalLight(0xe8f0ff, 0.95);
  key.position.set(2, 8, 6);
  root.add(key);
  const rim = new THREE.DirectionalLight(0xb9c8dc, 0.35);
  rim.position.set(-6, 3, -2);
  root.add(rim);

  const concrete = new THREE.MeshStandardMaterial({ color: 0x6f716f, roughness: 0.95 });
  const concreteDark = new THREE.MeshStandardMaterial({ color: 0x4d4f50, roughness: 0.95 });

  // ---------- caixa da sala
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, 14), new THREE.MeshStandardMaterial({ color: 0x2a2b2e, roughness: 0.75 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, BACK_Z + 7);
  root.add(floor);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, 14), concreteDark);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, CEIL, BACK_Z + 7);
  root.add(ceiling);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, CEIL), concrete);
  back.position.set(0, CEIL / 2, BACK_Z);
  root.add(back);
  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, CEIL), side < 0 ? concreteDark : concrete);
    wall.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    wall.position.set(side * HALF, CEIL / 2, BACK_Z + 7);
    root.add(wall);
  }
  // juntas das placas de concreto na parede do fundo
  {
    const jointMat = new THREE.MeshBasicMaterial({ color: 0x3b3d3f });
    for (let x = -HALF + 2.4; x < HALF; x += 2.4) {
      const j = new THREE.Mesh(new THREE.PlaneGeometry(0.02, CEIL), jointMat);
      j.position.set(x, CEIL / 2, BACK_Z + 0.005);
      root.add(j);
    }
    const jh = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, 0.02), jointMat);
    jh.position.set(0, 1.2, BACK_Z + 0.005);
    root.add(jh);
  }

  // ---------- painéis integrados à parede: vidro escuro com gráficos abstratos (sem números)
  {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1b1d21, roughness: 0.4, metalness: 0.5 });
    [-3.7, 0, 3.7].forEach((x, i) => {
      const w = 3.2;
      const h = 1.85;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.06), frameMat);
      frame.position.set(x, 1.95, BACK_Z + 0.04);
      root.add(frame);
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: abstractPanelTexture(200 + i * 37), color: 0x9a9a9a, toneMapped: false })
      );
      screen.position.set(x, 1.95, BACK_Z + 0.075);
      root.add(screen);
    });
    // linha vermelha fina na parede, sob os painéis: eco do roadmap
    const line = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2 - 1.2, 0.025), new THREE.MeshBasicMaterial({ color: 0xb3192e }));
    line.position.set(0, 0.86, BACK_Z + 0.01);
    root.add(line);
    // quatro marcos discretos na linha (sem rótulos)
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xd8d4cc });
    [-4.5, -1.5, 1.5, 4.5].forEach((x) => {
      const d = new THREE.Mesh(new THREE.CircleGeometry(0.045, 20), dotMat);
      d.position.set(x, 0.86, BACK_Z + 0.015);
      root.add(d);
    });
  }

  // ---------- ripas de madeira nas laterais da parede do fundo
  {
    const slatMat = new THREE.MeshStandardMaterial({ map: woodTexture(1112, anisotropy, '#5e4632'), roughness: 0.7 });
    const slats = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, CEIL, 0.06), slatMat, 36);
    const o = new THREE.Object3D();
    let i = 0;
    for (const side of [-1, 1]) {
      for (let k = 0; k < 18; k++) {
        o.position.set(side * (5.55 + k * 0.08), CEIL / 2, BACK_Z + 0.06);
        o.updateMatrix();
        slats.setMatrixAt(i++, o.matrix);
      }
    }
    root.add(slats);
  }

  // ---------- mesa longa de madeira escura e cadeiras discretas
  {
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 0.06, 1.7),
      new THREE.MeshStandardMaterial({ map: woodTexture(1113, anisotropy, '#3c2c20'), roughness: 0.45, metalness: 0.05 })
    );
    tableTop.position.set(0, 0.74, BACK_Z + 3.4);
    root.add(tableTop);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x3a3c40, roughness: 0.5, metalness: 0.6 });
    for (const x of [-2.2, 2.2]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.72, 0.9), legMat);
      leg.position.set(x, 0.36, BACK_Z + 3.4);
      root.add(leg);
    }
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x2b2d31, roughness: 0.8 });
    // só a fileira do outro lado da mesa: as cadeiras do lado da câmera ficariam como blocos escuros em primeiro plano
    for (const side of [-1]) {
      for (let k = 0; k < 4; k++) {
        const x = -2.25 + k * 1.5 + (rnd() - 0.5) * 0.1;
        const z = BACK_Z + 3.4 + side * 1.25;
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), chairMat);
        seat.position.set(x, 0.46, z);
        const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.48, 0.05), chairMat);
        backrest.position.set(x, 0.74, z + side * 0.23);
        root.add(seat, backrest);
      }
    }
  }

  // ---------- linhas de luz fria no teto
  {
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x7d8792 });
    for (const x of [-2.2, 2.2]) {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 4.5), lineMat);
      l.position.set(x, CEIL - 0.02, BACK_Z + 2.6);
      root.add(l);
    }
  }

  const update = () => {};
  return { root, update };
}
