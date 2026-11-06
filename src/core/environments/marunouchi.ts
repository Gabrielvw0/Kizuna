import * as THREE from 'three';
import { approach, boxWorldUV, facadeTextures, seeded, skyDome, type FacadeStyle } from './architecture';

/*
 * Etapa 9 • Tela 09 — Tóquio como território de expansão.
 * Uma avenida empresarial inspirada em Marunouchi ao entardecer: edifícios com base de pedra até a
 * "linha dos 31 m" e torres de vidro recuadas acima dela; ginkgos e postes ao longo das calçadas;
 * ao fundo, no eixo da avenida, uma estação de tijolo vermelho com cúpulas (referência à infraestrutura
 * ferroviária de Tóquio). Sem assets externos: geometria simples + texturas geradas no navegador.
 * Escala: ~1 unidade ≈ 2,5 m. Chão em y = 0 (o grupo é posicionado pelo WorldStage).
 */

const STONE: FacadeStyle = {
  cols: 10,
  rows: 6,
  frame: '#a99d8a',
  glass: ['#1d2027', '#2a2e36'],
  lit: 0.3,
  litColors: ['#ffd49a', '#ffe2b8', '#f2c385'],
  mullion: 0.21,
  punched: true
};
const GLASS: FacadeStyle = {
  cols: 14,
  rows: 8,
  frame: '#2f353d',
  glass: ['#26303b', '#3a4757'],
  lit: 0.2,
  litColors: ['#ffe2b5', '#eef1ff', '#ffd09a'],
  mullion: 0.08
};
const BRICK: FacadeStyle = {
  cols: 5,
  rows: 3,
  frame: '#7d3427',
  glass: ['#1c1514', '#2a1f1c'],
  lit: 0.6,
  litColors: ['#ffcf8f', '#ffdcaa'],
  mullion: 0.22,
  punched: true
};

/** Névoa da tela (cor e densidade) — aplicada pelo WorldStage só enquanto o cenário estiver ativo. */
export const MARUNOUCHI_FOG = { color: new THREE.Color('#3a2f35'), density: 0.0052 };

export function buildMarunouchi(anisotropy: number) {
  const root = new THREE.Group();
  root.name = 'marunouchi';
  const rnd = seeded(908);

  // ---------- céu de entardecer (gradiente + brilho do sol já posto atrás da estação)
  const sky = skyDome(
    [
      [-0.2, '#121116'],
      [0.0, '#3a2a2c'],
      [0.02, '#9a5d3c'],
      [0.07, '#6d4648'],
      [0.16, '#33314a'],
      [0.36, '#171c30'],
      [0.75, '#0b0f1c']
    ],
    new THREE.Vector3(-0.22, 0.015, -1),
    '#ffb27a',
    16,
    0.34
  );
  root.add(sky.mesh);

  // ---------- luz: céu frio + sol baixo e quente vindo do fundo, à esquerda (fachadas da direita recebem a luz)
  root.add(new THREE.HemisphereLight(0x6a6f99, 0x3a2a22, 0.75));
  const sun = new THREE.DirectionalLight(0xffb27a, 1.25);
  sun.position.set(-70, 22, -170);
  root.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0x8fa3d9, 0.35);
  fill.position.set(40, 30, 30);
  root.add(fill);

  // ---------- materiais de fachada (3 variações por estilo, para não repetir janelas)
  const facadeMats = (style: FacadeStyle, base: number, mat: Partial<THREE.MeshStandardMaterialParameters>) =>
    [0, 1, 2].map((v) => {
      const t = facadeTextures(style, base + v * 17, anisotropy);
      return new THREE.MeshStandardMaterial({ map: t.map, emissiveMap: t.emissive, emissive: 0xffffff, emissiveIntensity: 0.6, ...mat });
    });
  const stoneMats = facadeMats(STONE, 11, { roughness: 0.82, metalness: 0 });
  const glassMats = facadeMats(GLASS, 41, { roughness: 0.28, metalness: 0.25 });
  const brickMats = facadeMats(BRICK, 77, { roughness: 0.9, metalness: 0 });
  const litMats = [...stoneMats, ...glassMats, ...brickMats];
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x24262b, roughness: 0.9 });

  const building = (mats: THREE.MeshStandardMaterial[], w: number, h: number, d: number, cellW: number, cellH: number) => {
    const geo = boxWorldUV(w, h, d, cellW, cellH);
    const m = mats[Math.floor(rnd() * mats.length)];
    // topo e base sem janelas
    const mesh = new THREE.Mesh(geo, [m, m, roofMat, roofMat, m, m]);
    return mesh;
  };

  // ---------- chão: avenida, calçadas, praça da estação e entorno
  const plane = (w: number, d: number, color: number, x: number, z: number, y = 0, rough = 0.85) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.05 }));
    p.rotation.x = -Math.PI / 2;
    p.position.set(x, y, z);
    root.add(p);
    return p;
  };
  plane(600, 600, 0x18171b, 0, -150, -0.02);
  plane(20, 140, 0x26262a, 0, -66, 0, 0.92); // avenida (levemente brilhante: asfalto ao entardecer)
  plane(5, 140, 0x5a554e, -12.5, -66, 0.01); // calçadas de pedra
  plane(5, 140, 0x5a554e, 12.5, -66, 0.01);
  plane(130, 20, 0x5f5a52, 0, -146, 0.012); // praça diante da estação

  // faixas de rolamento discretas (tracejado claro)
  {
    const dash = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.18, 2.4), new THREE.MeshStandardMaterial({ color: 0x9d968a, roughness: 0.7 }), 2 * 26);
    const o = new THREE.Object3D();
    let i = 0;
    for (const x of [-3.4, 3.4]) {
      for (let k = 0; k < 26; k++) {
        o.position.set(x, 0.015, 2 - k * 6.4);
        o.rotation.set(-Math.PI / 2, 0, 0);
        o.updateMatrix();
        dash.setMatrixAt(i++, o.matrix);
      }
    }
    root.add(dash);
  }

  // ---------- quarteirões dos dois lados: base de pedra (31 m) + torre de vidro recuada
  const FRONT = 15; // alinhamento das fachadas
  const PODIUM_H = 12.4;
  for (const side of [-1, 1]) {
    let z = -6;
    while (z > -128) {
      const len = 20 + rnd() * 10;
      const depth = 22;
      const cx = side * (FRONT + depth / 2);
      const cz = z - len / 2;
      const podium = building(stoneMats, depth, PODIUM_H, len, 12, 9.6);
      podium.position.set(cx, PODIUM_H / 2, cz);
      root.add(podium);
      // cornija na linha dos 31 m
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(depth + 0.5, 0.35, len + 0.5), roofMat);
      cornice.position.set(cx, PODIUM_H + 0.17, cz);
      root.add(cornice);
      if (rnd() < 0.82) {
        const th = 26 + rnd() * 44;
        const tw = depth - 7;
        const tl = len * (0.62 + rnd() * 0.25);
        const tower = building(glassMats, tw, th, tl, 12, 12.8);
        tower.position.set(cx + side * 3.2, PODIUM_H + th / 2, cz);
        root.add(tower);
      }
      z -= len + 6 + rnd() * 3; // ruas transversais
    }
  }

  // ---------- skyline de fundo, atrás dos quarteirões (dá profundidade às laterais)
  for (let i = 0; i < 46; i++) {
    const side = i % 2 ? 1 : -1;
    const x = side * (48 + rnd() * 70);
    const z = -30 - rnd() * 200;
    const h = 24 + rnd() * 70;
    const w = 10 + rnd() * 14;
    const b = building(rnd() < 0.7 ? glassMats : stoneMats, w, h, w * (0.8 + rnd() * 0.6), 12, 12.8);
    b.position.set(x, h / 2, z);
    root.add(b);
  }

  // ---------- estação de tijolo vermelho no eixo da avenida (corpo baixo, faixas claras e cúpulas)
  {
    const st = new THREE.Group();
    st.position.set(0, 0, -162);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.8 });
    const body = building(brickMats, 130, 9.5, 12, 10, 6.6);
    body.position.y = 4.75;
    st.add(body);
    for (const y of [3.2, 6.6, 9.5]) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(130.4, 0.35, 12.4), bandMat);
      band.position.y = y;
      st.add(band);
    }
    const center = building(brickMats, 16, 12.5, 14, 10, 6.6);
    center.position.set(0, 6.25, 0.6);
    st.add(center);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0x2c2f33, roughness: 0.55, metalness: 0.35 });
    for (const x of [-46, 46]) {
      const pav = building(brickMats, 14, 13, 15, 10, 6.6);
      pav.position.set(x, 6.5, 0.8);
      st.add(pav);
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.6, 3.2, 8), bandMat);
      drum.position.set(x, 14.6, 0.8);
      st.add(drum);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(6.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
      dome.scale.y = 0.85;
      dome.position.set(x, 16.2, 0.8);
      st.add(dome);
    }
    // telhado
    const roof = new THREE.Mesh(new THREE.BoxGeometry(130, 0.6, 12), roofMat);
    roof.position.y = 9.8;
    st.add(roof);
    root.add(st);
  }

  // ---------- ginkgos (instanciados) e postes com luminária quente
  {
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.14, 0.2, 3.2, 6), new THREE.MeshStandardMaterial({ color: 0x2b2420, roughness: 1 }), 28);
    const crowns = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1.45, 1),
      new THREE.MeshStandardMaterial({ color: 0x46543a, roughness: 1, flatShading: true }),
      28
    );
    const o = new THREE.Object3D();
    let i = 0;
    for (const side of [-1, 1]) {
      for (let k = 0; k < 14; k++) {
        const z = -16 - k * 8 + (rnd() - 0.5) * 0.8;
        const s = 0.85 + rnd() * 0.25;
        o.position.set(side * 11.6, 1.6 * s, z);
        o.scale.setScalar(s);
        o.rotation.set(0, rnd() * Math.PI, 0);
        o.updateMatrix();
        trunks.setMatrixAt(i, o.matrix);
        o.position.y = 3.2 * s + 1.1 * s;
        o.scale.set(s, s * 1.3, s);
        o.updateMatrix();
        crowns.setMatrixAt(i, o.matrix);
        i++;
      }
    }
    root.add(trunks, crowns);

    const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.08, 4.6, 6), new THREE.MeshStandardMaterial({ color: 0x1d1f23, roughness: 0.6, metalness: 0.5 }), 24);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xffcf96 });
    const lamps = new THREE.InstancedMesh(new THREE.SphereGeometry(0.22, 10, 8), lampMat, 24);
    i = 0;
    for (const side of [-1, 1]) {
      for (let k = 0; k < 12; k++) {
        const z = -7 - k * 13;
        o.position.set(side * 10.4, 2.3, z);
        o.scale.setScalar(1);
        o.rotation.set(0, 0, 0);
        o.updateMatrix();
        poles.setMatrixAt(i, o.matrix);
        o.position.y = 4.65;
        o.updateMatrix();
        lamps.setMatrixAt(i, o.matrix);
        i++;
      }
    }
    root.add(poles, lamps);
  }

  // ---------- estado: as janelas acendem um pouco mais na cena de aquisição (anoitecer), sem ciclo
  const state = { lit: 0.6, glow: 0.34 };
  const update = (dt: number, scene: number, reduced: boolean) => {
    const litTarget = scene >= 3 ? 0.85 : 0.6;
    const glowTarget = scene >= 3 ? 0.24 : 0.34;
    const rate = reduced ? 50 : 1.1;
    state.lit = approach(state.lit, litTarget, dt, rate);
    state.glow = approach(state.glow, glowTarget, dt, rate);
    for (const m of litMats) m.emissiveIntensity = state.lit;
    sky.uniforms.uGlowStrength.value = state.glow;
  };

  return { root, update };
}
