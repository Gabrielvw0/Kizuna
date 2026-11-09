import * as THREE from 'three';
import { lightPoolTexture, seeded } from './architecture';

/*
 * Etapa 10 • Tela 01 — salão corporativo em forma de planetário, ao redor do globo.
 * O globo continua sendo o protagonista: este módulo NÃO cria outro globo nem novas luzes.
 * Os materiais iluminados usam as luzes já existentes do globo (globeLights) e TODOS ignoram a névoa
 * (fog: false): a névoa padrão da apresentação continua valendo para o globo, o halo do Japão e os
 * pontos de presença, que ficam exatamente como estavam.
 * Composição: piso circular de pedra escura polida com meridianos gravados, pedestal sob o globo,
 * colunata de lâminas escuras com sanca de luz, cornija luminosa e cúpula com projeção estelar discreta.
 * Escala: o globo tem raio 1,18 na origem; o piso fica em y = FLOOR.
 */

const FLOOR = -2.2;
const R = 10.5; // raio do salão
const CORNICE = 4.2; // altura da cornija (início da cúpula)

/** Piso: anéis concêntricos e meridianos gravados na pedra (sem texto, sem números). */
function floorTexture(anisotropy: number) {
  const S = 2048;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const cx = S / 2;
  const grd = g.createRadialGradient(cx, cx, 0, cx, cx, cx);
  grd.addColorStop(0, '#1a1e25');
  grd.addColorStop(0.6, '#11141a');
  grd.addColorStop(1, '#0b0d11');
  g.fillStyle = grd;
  g.fillRect(0, 0, S, S);
  const px = S / 2 / R; // pixels por metro
  // veios suaves da pedra
  const rnd = seeded(101);
  g.strokeStyle = 'rgba(255,255,255,0.018)';
  g.lineWidth = 2;
  for (let i = 0; i < 60; i++) {
    const y = rnd() * S;
    g.beginPath();
    g.moveTo(0, y);
    g.bezierCurveTo(S * 0.3, y + (rnd() - 0.5) * 200, S * 0.7, y + (rnd() - 0.5) * 200, S, y + (rnd() - 0.5) * 120);
    g.stroke();
  }
  // anéis concêntricos (juntas gravadas)
  g.strokeStyle = 'rgba(150,170,200,0.10)';
  g.lineWidth = 2;
  for (const r of [3.4, 5.2, 7.2, 9.4]) {
    g.beginPath();
    g.arc(cx, cx, r * px, 0, Math.PI * 2);
    g.stroke();
  }
  // meridianos: do anel do pedestal até a borda do salão
  g.strokeStyle = 'rgba(150,170,200,0.07)';
  g.lineWidth = 1.5;
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * 3.4 * px, cx + Math.sin(a) * 3.4 * px);
    g.lineTo(cx + Math.cos(a) * 10.3 * px, cx + Math.sin(a) * 10.3 * px);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = anisotropy;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildPlanetarium(anisotropy: number) {
  const root = new THREE.Group();
  root.name = 'planetarium';
  const rnd = seeded(2010);

  // ---------- piso de pedra escura polida
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(R + 0.2, 128),
    new THREE.MeshStandardMaterial({ map: floorTexture(anisotropy), roughness: 0.38, metalness: 0.25, fog: false })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR;
  root.add(floor);

  // luz fria e suave no piso ao redor do pedestal (reflexo do globo)
  const pool = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshBasicMaterial({ map: lightPoolTexture('120,150,200'), transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = FLOOR + 0.012;
  root.add(pool);

  // ---------- pedestal sob o globo
  const stone = new THREE.MeshStandardMaterial({ color: 0x161a21, roughness: 0.42, metalness: 0.3, fog: false });
  const dais = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.95, 0.45, 96), stone);
  dais.position.y = FLOOR + 0.225;
  root.add(dais);
  const step = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.35, 0.08, 96), stone);
  step.position.y = FLOOR + 0.04;
  root.add(step);
  // friso de luz fria na borda do pedestal
  const edge = new THREE.Mesh(new THREE.TorusGeometry(1.752, 0.007, 6, 160), new THREE.MeshBasicMaterial({ color: 0x323d52, fog: false }));
  edge.rotation.x = Math.PI / 2;
  edge.position.y = FLOOR + 0.45;
  root.add(edge);
  // anel vermelho fino embutido no piso: o vínculo com o Japão
  const inlay = new THREE.Mesh(new THREE.RingGeometry(2.62, 2.645, 160), new THREE.MeshBasicMaterial({ color: 0x7e1b28, fog: false }));
  inlay.rotation.x = -Math.PI / 2;
  inlay.position.y = FLOOR + 0.006;
  root.add(inlay);

  // ---------- parede circular escura
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, CORNICE - FLOOR, 128, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x080a0e, roughness: 0.95, side: THREE.BackSide, fog: false })
  );
  wall.position.y = (CORNICE + FLOOR) / 2;
  root.add(wall);

  // ---------- colunata: lâminas verticais radiais
  {
    const N = 72;
    const finMat = new THREE.MeshStandardMaterial({ color: 0x11151b, roughness: 0.7, metalness: 0.25, fog: false });
    const fins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, CORNICE - FLOOR, 0.9), finMat, N);
    const o = new THREE.Object3D();
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      o.position.set(Math.sin(a) * (R - 0.45), (CORNICE + FLOOR) / 2, Math.cos(a) * (R - 0.45));
      o.rotation.set(0, a, 0);
      o.updateMatrix();
      fins.setMatrixAt(i, o.matrix);
    }
    root.add(fins);
  }

  // ---------- sanca de luz na base e cornija luminosa (linhas finas, luz indireta)
  {
    const cove = new THREE.Mesh(new THREE.TorusGeometry(R - 0.95, 0.015, 6, 256), new THREE.MeshBasicMaterial({ color: 0x2c3646, fog: false }));
    cove.rotation.x = Math.PI / 2;
    cove.position.y = FLOOR + 0.04;
    root.add(cove);
    const cornice = new THREE.Mesh(
      new THREE.CylinderGeometry(R - 0.85, R - 0.85, 0.32, 256, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x151a22, roughness: 0.75, metalness: 0.2, side: THREE.DoubleSide, fog: false })
    );
    cornice.position.y = CORNICE + 0.16;
    root.add(cornice);
    const lightLine = new THREE.Mesh(new THREE.TorusGeometry(R - 0.88, 0.012, 6, 256), new THREE.MeshBasicMaterial({ color: 0x2f3a4b, fog: false }));
    lightLine.rotation.x = Math.PI / 2;
    lightLine.position.y = CORNICE - 0.02;
    root.add(lightLine);
  }

  // ---------- cúpula com projeção estelar discreta
  const dome = new THREE.Group();
  dome.position.y = CORNICE + 0.3;
  root.add(dome);
  dome.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(R, 96, 32, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x06080c, side: THREE.BackSide, fog: false })
    )
  );
  {
    // grade celeste: paralelos e meridianos muito sutis
    const pts: number[] = [];
    const r = R - 0.15;
    for (const lat of [10, 25, 40, 55, 70]) {
      const phi = (lat * Math.PI) / 180;
      for (let k = 0; k < 128; k++) {
        const a0 = (k / 128) * Math.PI * 2;
        const a1 = ((k + 1) / 128) * Math.PI * 2;
        pts.push(Math.cos(a0) * Math.cos(phi) * r, Math.sin(phi) * r, Math.sin(a0) * Math.cos(phi) * r);
        pts.push(Math.cos(a1) * Math.cos(phi) * r, Math.sin(phi) * r, Math.sin(a1) * Math.cos(phi) * r);
      }
    }
    for (let m = 0; m < 24; m++) {
      const a = (m / 24) * Math.PI * 2;
      for (let k = 0; k < 16; k++) {
        const p0 = ((k / 16) * 80 * Math.PI) / 180;
        const p1 = (((k + 1) / 16) * 80 * Math.PI) / 180;
        pts.push(Math.cos(a) * Math.cos(p0) * r, Math.sin(p0) * r, Math.sin(a) * Math.cos(p0) * r);
        pts.push(Math.cos(a) * Math.cos(p1) * r, Math.sin(p1) * r, Math.sin(a) * Math.cos(p1) * r);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    dome.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x6f86a8, transparent: true, opacity: 0.07, depthWrite: false, fog: false })));

    // estrelas projetadas
    const N = 1100;
    const sp = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = rnd() * Math.PI * 2;
      const phi = Math.asin(0.04 + rnd() * 0.94);
      const rr = R - 0.25;
      sp[i * 3] = Math.cos(a) * Math.cos(phi) * rr;
      sp[i * 3 + 1] = Math.sin(phi) * rr;
      sp[i * 3 + 2] = Math.sin(a) * Math.cos(phi) * rr;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    dome.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xa9b8cf, size: 0.045, transparent: true, opacity: 0.55, depthWrite: false, fog: false })));
  }

  // a projeção da cúpula gira muito devagar (como o campo de estrelas que substitui); parada com movimento reduzido
  const update = (dt: number, reduced: boolean) => {
    if (!reduced) dome.rotation.y += dt * 0.006;
  };
  return { root, update };
}
