import * as THREE from 'three';
import { boxWorldUV, facadeTextures, lightPoolTexture, seeded, skyDome, type FacadeStyle } from './architecture';

/*
 * Etapa 10 • Tela 02 — átrio corporativo monumental.
 * Um vão de ~34 m de altura entre duas alas de escritórios, com balcões em todos os pavimentos, guarda-corpos
 * de vidro, cobertura de vidro sob céu de início de noite e, ao fundo, uma fachada de vidro voltada para a cidade.
 * Duas passarelas aéreas atravessam o vão ligando as alas: a ideia de organização e de conexão entre regiões
 * (na 02.2, a câmera sobe em direção a elas, em eco à ponte histórica de 1908). Uma delas tem um friso vermelho fino.
 * Escala: 1 unidade ≈ 1 m. Piso em y = 0 (o grupo é posicionado pelo WorldStage, olho a ~1,6 m).
 */

export const ATRIUM_FOG = { color: new THREE.Color('#10141b'), density: 0.016 };

const HALF = 8; // meia largura do vão
const DEPTH = 3.2; // profundidade dos balcões até a fachada interna
const Z_NEAR = 10;
const Z_FAR = -62;
const LEVEL = 4.5; // pé-direito por pavimento
const LEVELS = 7;
const ROOF = LEVEL * LEVELS + 2; // ≈ 33,5 m

const INTERIOR: FacadeStyle = {
  cols: 6,
  rows: 2,
  frame: '#16191e',
  glass: ['#1d232b', '#232a33'],
  lit: 0.34,
  litColors: ['#d9c09a', '#cdb894', '#c9ced6'],
  mullion: 0.05
};
const CITY: FacadeStyle = {
  cols: 12,
  rows: 10,
  frame: '#1a1e25',
  glass: ['#1f2730', '#2b3542'],
  lit: 0.32,
  litColors: ['#f1d8a8', '#e6e9ee'],
  mullion: 0.09
};

/** Piso de pedra em placas grandes, com juntas finas. */
function stoneFloorTexture(anisotropy: number) {
  const S = 512;
  const rnd = seeded(3030);
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const n = 4;
  const cell = S / n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const l = 26 + Math.floor(rnd() * 6);
      g.fillStyle = `rgb(${l},${l + 2},${l + 6})`;
      g.fillRect(i * cell, j * cell, cell, cell);
    }
  }
  g.fillStyle = 'rgba(8,9,12,0.9)';
  for (let k = 0; k <= n; k++) {
    g.fillRect(k * cell - 1, 0, 2, S);
    g.fillRect(0, k * cell - 1, S, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = anisotropy;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildAtrium(anisotropy: number) {
  const root = new THREE.Group();
  root.name = 'atrium';
  const rnd = seeded(2020);
  const LEN = Z_NEAR - Z_FAR;
  const ZC = (Z_NEAR + Z_FAR) / 2;

  // ---------- céu de início de noite (visto pela cobertura e pela fachada do fundo)
  const sky = skyDome(
    [
      [-0.2, '#141820'],
      [0.0, '#2b3442'],
      [0.08, '#3a4352'],
      [0.3, '#1e2736'],
      [0.8, '#0d121b']
    ],
    new THREE.Vector3(0, 0.06, -1),
    '#d79a6a',
    14,
    0.16
  );
  root.add(sky.mesh);

  // ---------- luz: céu frio + luz quente vinda do interior dos escritórios
  root.add(new THREE.HemisphereLight(0x9fb2c8, 0x2a2420, 0.55));
  const warm = new THREE.DirectionalLight(0xffdcb2, 0.55);
  warm.position.set(-10, 20, 25);
  root.add(warm);
  const cool = new THREE.DirectionalLight(0xb7c8de, 0.35);
  cool.position.set(8, 30, -70);
  root.add(cool);

  // ---------- piso de pedra
  const floorTex = stoneFloorTexture(anisotropy);
  floorTex.repeat.set((HALF * 2) / 4.8, LEN / 4.8);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2 + DEPTH * 2, LEN), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.4, metalness: 0.15 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, ZC);
  root.add(floor);
  // reflexos quentes do lobby no piso
  {
    const pool = lightPoolTexture('230,200,160');
    for (const z of [-6, -26, -46]) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 14),
        new THREE.MeshBasicMaterial({ map: pool, transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending })
      );
      m.rotation.x = -Math.PI / 2;
      m.position.set(0, 0.01, z);
      root.add(m);
    }
  }

  const concrete = new THREE.MeshStandardMaterial({ color: 0x8a8781, roughness: 0.85 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x2a2e35, roughness: 0.45, metalness: 0.6 });
  const glassRail = new THREE.MeshBasicMaterial({ color: 0x9fb4c6, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide });
  const underLight = new THREE.MeshBasicMaterial({ color: 0x8c8170 });

  // ---------- alas laterais: fachada interna iluminada + balcões em todos os pavimentos
  const interiorMats = [0, 1, 2].map((v) => {
    const t = facadeTextures(INTERIOR, 2100 + v * 17, anisotropy);
    return new THREE.MeshStandardMaterial({ map: t.map, emissiveMap: t.emissive, emissive: 0xffffff, emissiveIntensity: 0.22, roughness: 0.35, metalness: 0.2 });
  });
  for (const side of [-1, 1]) {
    // fachada interna (escritórios), em painéis por trecho para variar a ocupação
    const SEG = 18;
    for (let z = Z_NEAR; z > Z_FAR; z -= SEG) {
      const len = Math.min(SEG, z - Z_FAR);
      const geo = boxWorldUV(0.2, ROOF - 2, len, 7.2, LEVEL * 2);
      const m = interiorMats[Math.floor(rnd() * 3)];
      const panel = new THREE.Mesh(geo, m);
      panel.position.set(side * (HALF + DEPTH), (ROOF - 2) / 2, z - len / 2);
      root.add(panel);
    }
    for (let l = 1; l <= LEVELS; l++) {
      const y = l * LEVEL;
      // laje do balcão (borda de concreto claro)
      const slab = new THREE.Mesh(new THREE.BoxGeometry(DEPTH, 0.42, LEN), concrete);
      slab.position.set(side * (HALF + DEPTH / 2), y - 0.21, ZC);
      root.add(slab);
      // linha de luz quente sob a borda da laje
      const ul = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, LEN), underLight);
      ul.position.set(side * (HALF + 0.25), y - 0.43, ZC);
      root.add(ul);
      // guarda-corpo de vidro com corrimão metálico
      const rail = new THREE.Mesh(new THREE.PlaneGeometry(LEN, 1.1), glassRail);
      rail.rotation.y = Math.PI / 2;
      rail.position.set(side * HALF, y + 0.55, ZC);
      root.add(rail);
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, LEN), metal);
      hand.position.set(side * HALF, y + 1.1, ZC);
      root.add(hand);
    }
    // colunas do térreo, alinhadas com a borda do vão
    for (let z = Z_NEAR - 2; z > Z_FAR; z -= 7.2) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.55, LEVEL - 0.42, 0.55), concrete);
      col.position.set(side * (HALF + 0.4), (LEVEL - 0.42) / 2, z);
      root.add(col);
    }
  }

  // ---------- cobertura de vidro: grelha de vigas metálicas
  {
    const beamsX = new THREE.InstancedMesh(new THREE.BoxGeometry(HALF * 2 + DEPTH * 2, 0.35, 0.18), metal, Math.ceil(LEN / 3.6) + 1);
    const o = new THREE.Object3D();
    let i = 0;
    for (let z = Z_NEAR; z >= Z_FAR; z -= 3.6) {
      o.position.set(0, ROOF, z);
      o.updateMatrix();
      beamsX.setMatrixAt(i++, o.matrix);
    }
    beamsX.count = i;
    root.add(beamsX);
    for (const x of [-HALF, -HALF / 2, 0, HALF / 2, HALF]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.5, LEN), metal);
      b.position.set(x, ROOF + 0.05, ZC);
      root.add(b);
    }
  }

  // ---------- fachada de vidro do fundo, voltada para a cidade
  {
    for (let x = -HALF - DEPTH; x <= HALF + DEPTH + 0.01; x += 1.6) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, ROOF, 0.25), metal);
      m.position.set(x, ROOF / 2, Z_FAR);
      root.add(m);
    }
    for (let y = LEVEL; y < ROOF; y += LEVEL) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(HALF * 2 + DEPTH * 2, 0.1, 0.26), metal);
      t.position.set(0, y, Z_FAR);
      root.add(t);
    }
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(HALF * 2 + DEPTH * 2, ROOF),
      new THREE.MeshBasicMaterial({ color: 0x1a2330, transparent: true, opacity: 0.35, depthWrite: false })
    );
    glass.position.set(0, ROOF / 2, Z_FAR + 0.05);
    root.add(glass);
    // cidade além do vidro
    const city = new THREE.Group();
    root.add(city);
    const cityMats = [0, 1, 2].map((v) => {
      const t = facadeTextures(CITY, 2200 + v * 11, anisotropy);
      return new THREE.MeshStandardMaterial({ map: t.map, emissiveMap: t.emissive, emissive: 0xffffff, emissiveIntensity: 0.7, roughness: 0.5 });
    });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x15181d, roughness: 1 });
    for (let i = 0; i < 40; i++) {
      const x = (rnd() - 0.5) * 220;
      const z = Z_FAR - 40 - rnd() * 260;
      const h = 30 + rnd() * 90;
      const w = 14 + rnd() * 22;
      const m = cityMats[Math.floor(rnd() * 3)];
      const b = new THREE.Mesh(boxWorldUV(w, h, w, 12, 12), [m, m, roofMat, roofMat, m, m]);
      b.position.set(x, h / 2 - 6, z);
      city.add(b);
    }
  }

  // ---------- passarelas aéreas atravessando o vão
  const bridge = (y: number, z: number, accent: boolean) => {
    const g = new THREE.Group();
    g.position.set(0, y, z);
    const W = HALF * 2 + 0.4;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(W, 0.5, 3.2), concrete);
    g.add(deck);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(W, 0.18, 3.4), metal);
    roof.position.y = 2.6;
    g.add(roof);
    for (const s of [-1, 1]) {
      const side = new THREE.Mesh(
        new THREE.PlaneGeometry(W, 2.3),
        new THREE.MeshBasicMaterial({ color: 0xa9bccd, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide })
      );
      side.position.set(0, 1.4, s * 1.6);
      g.add(side);
      for (let x = -HALF; x <= HALF + 0.01; x += 2) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.35, 0.06), metal);
        post.position.set(x, 1.4, s * 1.6);
        g.add(post);
      }
      // linha de luz interna (calor de quem atravessa)
      const l = new THREE.Mesh(new THREE.BoxGeometry(W, 0.03, 0.05), new THREE.MeshBasicMaterial({ color: 0xdcc59c }));
      l.position.set(0, 2.48, s * 1.2);
      g.add(l);
    }
    // linhas de luz sob o tabuleiro: a passarela se lê contra o vão escuro
    for (const s of [-1, 1]) {
      const u = new THREE.Mesh(new THREE.BoxGeometry(W, 0.03, 0.06), new THREE.MeshBasicMaterial({ color: 0x9a8b72 }));
      u.position.set(0, -0.27, s * 1.45);
      g.add(u);
    }
    if (accent) {
      // friso vermelho fino na face da passarela: o vínculo
      const red = new THREE.Mesh(new THREE.BoxGeometry(W, 0.05, 0.02), new THREE.MeshBasicMaterial({ color: 0x9b1b2b }));
      red.position.set(0, -0.12, 1.62);
      g.add(red);
    }
    root.add(g);
  };
  bridge(LEVEL * 3, -24, true);
  bridge(LEVEL * 5, -40, false);

  // cena estática
  const update = () => {};
  return { root, update };
}
