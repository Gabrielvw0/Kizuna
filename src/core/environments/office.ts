import * as THREE from 'three';
import { boxWorldUV, facadeTextures, lightPoolTexture, seeded, skyDome, woodTexture, type FacadeStyle } from './architecture';

/*
 * Etapa 9 • Tela 10 — o ambiente corporativo onde o Kizuna pretende competir.
 * Andar executivo de pé-direito duplo: piso de madeira, pilares de concreto, painel de ripas de
 * madeira (tategoshi) à esquerda e uma parede de vidro do piso ao teto voltada para Tóquio, vista do alto
 * em luz natural, através de vidro levemente fumê. Uma faixa de sol entra pela janela à direita, atrás da
 * coluna do Kizuna — destaque sutil, sem efeito publicitário. Cena estática (tela contemplativa).
 * Escala: 1 unidade ≈ 1 m. Piso em y = 0 (o grupo é posicionado pelo WorldStage, olho a 1,6 m).
 */

const DAY_GLASS: FacadeStyle = {
  cols: 14,
  rows: 8,
  frame: '#59616b',
  glass: ['#6f8296', '#9fb0c0'],
  lit: 0.05,
  litColors: ['#f3f1ea'],
  mullion: 0.08
};
const DAY_STONE: FacadeStyle = {
  cols: 10,
  rows: 6,
  frame: '#a7a39a',
  glass: ['#56606b', '#75818d'],
  lit: 0.03,
  litColors: ['#f3f1ea'],
  mullion: 0.2,
  punched: true
};

/** Névoa (neblina clara de dia, distante) — aplicada pelo WorldStage só com o cenário ativo. */
export const OFFICE_FOG = { color: new THREE.Color('#8f9aa6'), density: 0.0022 };

export function buildOffice(anisotropy: number) {
  const root = new THREE.Group();
  root.name = 'office';
  const rnd = seeded(1010);

  const WIN_Z = -9; // parede de vidro
  const CEIL = 6.4; // pé-direito duplo
  const HALF = 9; // meia largura da sala

  // ---------- céu diurno, suave (a cor real chega já atenuada pelo vidro fumê)
  const sky = skyDome(
    [
      [-0.3, '#6c727a'],
      [0.0, '#b9bec2'],
      [0.05, '#c9cdcf'],
      [0.25, '#9fb2c4'],
      [0.6, '#6f8aa6']
    ],
    new THREE.Vector3(0.5, 0.35, -1),
    '#fff2dc',
    10,
    0.18
  );
  root.add(sky.mesh);

  // ---------- luz natural: céu claro + sol entrando pela janela, vindo da direita
  root.add(new THREE.HemisphereLight(0xdfe7f0, 0x6b5a48, 0.85));
  const sun = new THREE.DirectionalLight(0xfff2de, 1.35);
  sun.position.set(14, 18, -30);
  root.add(sun, sun.target);
  const bounce = new THREE.DirectionalLight(0xffe6c8, 0.25);
  bounce.position.set(-6, 2, 10);
  root.add(bounce);

  // ---------- Tóquio vista do alto, além do vidro (o andar está a ~120 m)
  const city = new THREE.Group();
  city.position.y = -120;
  root.add(city);
  const mats = (style: FacadeStyle, base: number) =>
    [0, 1, 2].map((v) => {
      const t = facadeTextures(style, base + v * 13, anisotropy);
      return new THREE.MeshStandardMaterial({ map: t.map, emissiveMap: t.emissive, emissive: 0xffffff, emissiveIntensity: 0.15, roughness: 0.4, metalness: 0.2 });
    });
  const glassMats = mats(DAY_GLASS, 301);
  const stoneMats = mats(DAY_STONE, 333);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x5d6168, roughness: 0.9 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshStandardMaterial({ color: 0x5b5f62, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  city.add(ground);
  for (let i = 0; i < 150; i++) {
    // leque à frente da janela; torres altas mais raras
    const ang = (rnd() - 0.5) * 2.1;
    const dist = 90 + Math.pow(rnd(), 0.7) * 650;
    const x = Math.sin(ang) * dist;
    const z = WIN_Z - Math.cos(ang) * dist;
    const tall = rnd() < 0.18;
    const h = tall ? 140 + rnd() * 110 : 30 + rnd() * 90;
    const w = 18 + rnd() * 30;
    const d = w * (0.7 + rnd() * 0.6);
    const useGlass = tall || rnd() < 0.55;
    const m = (useGlass ? glassMats : stoneMats)[Math.floor(rnd() * 3)];
    const geo = boxWorldUV(w, h, d, 12, 12.8);
    const b = new THREE.Mesh(geo, [m, m, roofMat, roofMat, m, m]);
    b.position.set(x, h / 2, z);
    b.rotation.y = (rnd() - 0.5) * 0.3;
    city.add(b);
  }

  // ---------- interior
  const wood = woodTexture(1012, anisotropy);
  wood.repeat.set(5, 4);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, 16), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.55, metalness: 0.05 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, WIN_Z + 8);
  root.add(floor);

  const concrete = new THREE.MeshStandardMaterial({ color: 0x8d8a85, roughness: 0.92 });
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, 16), concrete);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, CEIL, WIN_Z + 8);
  root.add(ceiling);

  // caixilhos da fachada de vidro (montantes verticais e travessas)
  const metal = new THREE.MeshStandardMaterial({ color: 0x2c3036, roughness: 0.45, metalness: 0.6 });
  for (let x = -HALF; x <= HALF + 0.01; x += 2.25) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.09, CEIL, 0.22), metal);
    m.position.set(x, CEIL / 2, WIN_Z);
    root.add(m);
  }
  for (const y of [0.06, 3.2, CEIL - 0.06]) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(HALF * 2, 0.1, 0.24), metal);
    t.position.set(0, y, WIN_Z);
    root.add(t);
  }
  // vidro fumê: atenua a cidade e dá a sensação de pele de vidro
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(HALF * 2, CEIL),
    new THREE.MeshBasicMaterial({ color: 0x1f2a33, transparent: true, opacity: 0.32, depthWrite: false, fog: false })
  );
  glass.position.set(0, CEIL / 2, WIN_Z + 0.02);
  root.add(glass);

  // pilares de concreto junto à janela
  for (const x of [-6.2, 6.2]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.9, CEIL, 0.9), concrete);
    p.position.set(x, CEIL / 2, WIN_Z + 1.4);
    root.add(p);
  }
  // parede lateral esquerda: ripas verticais de madeira (tategoshi) sobre fundo escuro
  {
    const back = new THREE.Mesh(new THREE.PlaneGeometry(16, CEIL), new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 1 }));
    back.rotation.y = Math.PI / 2;
    back.position.set(-HALF, CEIL / 2, WIN_Z + 8);
    root.add(back);
    const slatMat = new THREE.MeshStandardMaterial({ map: woodTexture(1013, anisotropy, '#8a6646'), roughness: 0.6 });
    const slats = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, CEIL, 0.05), slatMat, 64);
    const o = new THREE.Object3D();
    for (let i = 0; i < 64; i++) {
      o.position.set(-HALF + 0.08, CEIL / 2, WIN_Z + 0.4 + i * 0.25);
      o.updateMatrix();
      slats.setMatrixAt(i, o.matrix);
    }
    root.add(slats);
  }
  // parede lateral direita: concreto liso
  {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, CEIL), concrete);
    wall.rotation.y = -Math.PI / 2;
    wall.position.set(HALF, CEIL / 2, WIN_Z + 8);
    root.add(wall);
  }
  // linhas de luz embutidas no teto, em direção à janela
  {
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf4efe6 });
    for (const x of [-4.5, 0, 4.5]) {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 14), lineMat);
      l.position.set(x, CEIL - 0.02, WIN_Z + 8);
      root.add(l);
    }
  }

  // ---------- sol entrando pela janela à direita (atrás da coluna do Kizuna): faixas de luz quente no piso
  {
    const pool = lightPoolTexture();
    const mk = (w: number, d: number, x: number, z: number, o: number) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, d),
        new THREE.MeshBasicMaterial({ map: pool, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })
      );
      m.rotation.x = -Math.PI / 2;
      m.rotation.z = -0.35;
      m.position.set(x, 0.01, z);
      root.add(m);
    };
    mk(5.5, 9, 4.6, WIN_Z + 4.2, 0.2);
    mk(3.2, 6, 2.2, WIN_Z + 3.4, 0.1);
  }

  // cena estática: nada a atualizar por quadro
  const update = () => {};
  return { root, update };
}
