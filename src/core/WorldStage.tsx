import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usePresentation } from './PresentationContext';
import { getCameraPoseForSection } from './CameraDirector';
import worldGeoJsonRaw from '../data/world.geojson?raw';

interface GlobalHub {
  name: string;
  lat: number;
  lng: number;
  isJapan?: boolean;
  isBrazil?: boolean;
}

const GLOBAL_HUBS: GlobalHub[] = [
  { name: 'São Paulo (Brasil)', lat: -23.55, lng: -46.63, isBrazil: true },
  { name: 'Buenos Aires', lat: -34.6, lng: -58.38 },
  { name: 'New York', lat: 40.71, lng: -74.0 },
  { name: 'San Francisco', lat: 37.77, lng: -122.41 },
  { name: 'Madrid', lat: 40.41, lng: -3.7 },
  { name: 'London', lat: 51.5, lng: -0.12 },
  { name: 'Pune / India', lat: 18.52, lng: 73.85 },
  { name: 'Singapore', lat: 1.35, lng: 103.81 },
  { name: 'Tokyo (Japão)', lat: 35.68, lng: 139.76, isJapan: true }
];

const latLngToVec3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

export const WorldStage: React.FC = () => {
  const { currentIndex, sceneIndex, safeMode } = usePresentation();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef({ currentIndex, sceneIndex });
  stateRef.current = { currentIndex, sceneIndex };

  useEffect(() => {
    if (safeMode) return;
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05080d, 0.16);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.4, 4.6);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // =========================================================================
    // 01 & 15. EARTH GLOBE GROUP (ONLY VISIBLE ON SCENE 01 AND SCENE 15)
    // =========================================================================
    const globeRoot = new THREE.Group();
    scene.add(globeRoot);

    const globeGeo = new THREE.SphereGeometry(1.18, 48, 48);
    const globeMat = new THREE.MeshBasicMaterial({ color: 0x070c16, transparent: true, opacity: 0.95 });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeRoot.add(globeMesh);

    const atmosGeo = new THREE.SphereGeometry(1.23, 36, 36);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          gl_FragColor = vec4(0.22, 0.45, 0.85, 1.0) * intensity * 0.7;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeRoot.add(atmosMesh);

    // Meridians
    const meridiansGroup = new THREE.Group();
    globeRoot.add(meridiansGroup);
    const merMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.12 });
    for (let i = 0; i < 8; i++) {
      const ringGeo = new THREE.BufferGeometry();
      const pts: THREE.Vector3[] = [];
      const angle = (i * Math.PI) / 8;
      for (let j = 0; j <= 64; j++) {
        const theta = (j * Math.PI * 2) / 64;
        pts.push(new THREE.Vector3(Math.cos(theta) * 1.185 * Math.sin(angle), Math.sin(theta) * 1.185, Math.cos(theta) * 1.185 * Math.cos(angle)));
      }
      ringGeo.setFromPoints(pts);
      meridiansGroup.add(new THREE.Line(ringGeo, merMat));
    }

    // Continents
    const continentsGroup = new THREE.Group();
    const japanGroup = new THREE.Group();
    globeRoot.add(continentsGroup);
    globeRoot.add(japanGroup);

    try {
      const geo = JSON.parse(worldGeoJsonRaw);
      const landMat = new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.5 });
      const japanMat = new THREE.LineBasicMaterial({ color: 0xe11d48, transparent: true, opacity: 0.98 });

      geo.features?.forEach((feat: any) => {
        const iso = feat.properties?.ISO_A3 || feat.properties?.iso_a3 || feat.properties?.ADM0_A3 || '';
        const name = feat.properties?.NAME || feat.properties?.name || '';
        const isJapan = iso === 'JPN' || name === 'Japan';

        const coordsList =
          feat.geometry?.type === 'Polygon'
            ? [feat.geometry.coordinates]
            : feat.geometry?.type === 'MultiPolygon'
            ? feat.geometry.coordinates
            : [];

        coordsList.forEach((poly: any) => {
          const ring = poly[0];
          if (!ring || ring.length < 3) return;
          const pts: THREE.Vector3[] = [];
          ring.forEach((pair: [number, number]) => {
            pts.push(latLngToVec3(pair[1], pair[0], isJapan ? 1.192 : 1.185));
          });
          const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), isJapan ? japanMat : landMat);
          if (isJapan) japanGroup.add(line);
          else continentsGroup.add(line);
        });
      });
    } catch {
      // Fallback
    }

    // Hubs
    const hubsGroup = new THREE.Group();
    globeRoot.add(hubsGroup);
    GLOBAL_HUBS.forEach((hub) => {
      const pos = latLngToVec3(hub.lat, hub.lng, 1.196);
      const dotGeo = new THREE.SphereGeometry(hub.isJapan ? 0.032 : hub.isBrazil ? 0.026 : 0.016, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({
        color: hub.isJapan ? 0xe11d48 : hub.isBrazil ? 0xf59e0b : 0x38bdf8
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      hubsGroup.add(dot);

      if (hub.isBrazil || hub.isJapan) {
        const haloGeo = new THREE.RingGeometry(0.02, hub.isJapan ? 0.065 : 0.05, 32);
        const haloMat = new THREE.MeshBasicMaterial({
          color: hub.isJapan ? 0xe11d48 : 0xf59e0b,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.copy(pos.clone().multiplyScalar(1.002));
        halo.lookAt(pos.clone().multiplyScalar(2));
        hubsGroup.add(halo);
      }
    });

    // Orbital Red Thread Spline
    const threadPoints = [
      latLngToVec3(-23.55, -46.63, 1.22), // Sao Paulo (Brasil)
      latLngToVec3(-34.6, -58.38, 1.25),  // Buenos Aires
      latLngToVec3(0, -60, 1.45),         // Orbital Atlantic lift
      latLngToVec3(40.71, -74.0, 1.26),   // New York
      latLngToVec3(37.77, -122.41, 1.35), // San Francisco
      latLngToVec3(51.5, -0.12, 1.38),    // London
      latLngToVec3(40.41, -3.7, 1.28),    // Madrid
      latLngToVec3(18.52, 73.85, 1.36),   // Pune / India
      latLngToVec3(1.35, 103.81, 1.32),   // Singapore
      latLngToVec3(35.68, 139.76, 1.21),  // Tokyo (Japão)
      latLngToVec3(-23.55, -46.63, 1.22)  // Closing the loop back to Brazil
    ];
    const threadCurve = new THREE.CatmullRomCurve3(threadPoints, false, 'catmullrom', 0.25);
    const threadGeo = new THREE.TubeGeometry(threadCurve, 140, 0.0075, 8, false);
    const threadMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.88 });
    const threadMesh = new THREE.Mesh(threadGeo, threadMat);
    globeRoot.add(threadMesh);

    // =========================================================================
    // 02. TOKYO 3D SKYLINE GROUP (SCENE 02: POR QUE JAPÃO)
    // =========================================================================
    const tokyoSkylineGroup = new THREE.Group();
    scene.add(tokyoSkylineGroup);

    // Ground Neon Grid
    const gridHelper = new THREE.GridHelper(18, 36, 0xef4444, 0x1e293b);
    gridHelper.position.y = -1.2;
    tokyoSkylineGroup.add(gridHelper);

    // Skyscraper Monoliths
    const bldgMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, wireframe: true, transparent: true, opacity: 0.35 });
    const bldgSolidMat = new THREE.MeshBasicMaterial({ color: 0x080d1a, transparent: true, opacity: 0.85 });
    const bldgGroup = new THREE.Group();
    tokyoSkylineGroup.add(bldgGroup);

    const cityTowers: { mesh: THREE.Mesh; beacon?: THREE.Mesh; isHub?: boolean }[] = [];
    const towerCoords = [
      { x: -1.2, z: -1.8, h: 2.8, w: 0.45, label: 'Tokyo Central', color: 0xef4444 },
      { x: 1.4, z: -2.2, h: 2.3, w: 0.4, label: 'Osaka Kansai', color: 0xf59e0b },
      { x: 0.2, z: -3.2, h: 2.1, w: 0.35, label: 'Nagoya Chubu', color: 0x38bdf8 },
      { x: -2.2, z: -2.8, h: 1.8, w: 0.3 },
      { x: 2.4, z: -1.5, h: 1.9, w: 0.35 },
      { x: -0.5, z: -1.2, h: 2.4, w: 0.5 },
      { x: 0.8, z: -1.4, h: 2.0, w: 0.4 },
      { x: -1.8, z: -0.8, h: 1.4, w: 0.3 },
      { x: 1.8, z: -0.9, h: 1.6, w: 0.35 },
      { x: 0, z: -2.4, h: 3.1, w: 0.55, isHub: true, color: 0xe11d48 }
    ];

    towerCoords.forEach((t) => {
      const geo = new THREE.BoxGeometry(t.w, t.h, t.w);
      const wire = new THREE.Mesh(geo, bldgMat);
      const solid = new THREE.Mesh(geo, bldgSolidMat);
      const tower = new THREE.Group();
      tower.add(solid);
      tower.add(wire);
      tower.position.set(t.x, -1.2 + t.h / 2, t.z);

      if (t.color) {
        const beaconGeo = new THREE.SphereGeometry(0.045, 12, 12);
        const beaconMat = new THREE.MeshBasicMaterial({ color: t.color });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(0, t.h / 2 + 0.05, 0);
        tower.add(beacon);
      }

      bldgGroup.add(tower);
      cityTowers.push({ mesh: solid, isHub: t.isHub });
    });

    // =========================================================================
    // 03. CORRIDOR OF 4 DOORS GROUP (SCENE 03: CHOQUE CULTURAL)
    // =========================================================================
    const corridorGroup = new THREE.Group();
    scene.add(corridorGroup);

    const doors = [
      { id: 0, x: -1.6, color: 0xef4444, kanji: '文化' },
      { id: 1, x: -0.55, color: 0x38bdf8, kanji: '言語' },
      { id: 2, x: 0.55, color: 0xf59e0b, kanji: '商習慣' },
      { id: 3, x: 1.6, color: 0x10b981, kanji: '規制' }
    ];

    const doorMeshes: THREE.Group[] = [];
    doors.forEach((d) => {
      const doorRoot = new THREE.Group();
      doorRoot.position.set(d.x, 0, 0);

      // Frame
      const frameMat = new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.45 });
      const leftP = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.8, 0.08), frameMat);
      leftP.position.x = -0.42;
      const rightP = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.8, 0.08), frameMat);
      rightP.position.x = 0.42;
      const topP = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.08), frameMat);
      topP.position.y = 0.9;
      doorRoot.add(leftP, rightP, topP);

      // Inner glowing pane
      const paneGeo = new THREE.PlaneGeometry(0.78, 1.72);
      const paneMat = new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
      const pane = new THREE.Mesh(paneGeo, paneMat);
      doorRoot.add(pane);

      corridorGroup.add(doorRoot);
      doorMeshes.push(doorRoot);
    });

    // =========================================================================
    // 04. GLOBAL × LOCAL FUSION GROUP (SCENE 04)
    // =========================================================================
    const fusionGroup = new THREE.Group();
    scene.add(fusionGroup);

    // Left Global Block (Blue crystalline structure)
    const globalBlockGeo = new THREE.IcosahedronGeometry(0.65, 1);
    const globalBlockMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.65 });
    const globalBlock = new THREE.Mesh(globalBlockGeo, globalBlockMat);
    fusionGroup.add(globalBlock);

    // Right Local Block (Warm Gold / Kumiko Lattice cube)
    const localBlockGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
    const localBlockMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: 0.75 });
    const localBlock = new THREE.Mesh(localBlockGeo, localBlockMat);
    fusionGroup.add(localBlock);

    // Central Kanji Spark Ring
    const sparkRingGeo = new THREE.RingGeometry(0.5, 0.65, 32);
    const sparkRingMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    const sparkRing = new THREE.Mesh(sparkRingGeo, sparkRingMat);
    sparkRing.visible = false;
    fusionGroup.add(sparkRing);

    // =========================================================================
    // 05. THREAD WEAVING UI GROUP (SCENE 05: KIZUNA)
    // =========================================================================
    const threadWeaveGroup = new THREE.Group();
    scene.add(threadWeaveGroup);

    // 4 Nodes: People, Tasks, Projects, Decisions
    const weaveNodes = [
      { x: -1.2, y: 0.5, z: 0, label: 'Pessoas' },
      { x: 1.2, y: 0.5, z: 0, label: 'Tarefas' },
      { x: 1.2, y: -0.5, z: 0, label: 'Projetos' },
      { x: -1.2, y: -0.5, z: 0, label: 'Decisões' }
    ];

    weaveNodes.forEach((n) => {
      const nodeGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.85 });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(n.x, n.y, n.z);
      threadWeaveGroup.add(node);
    });

    // Connecting Looping Ribbon
    const weavePts = [
      new THREE.Vector3(-1.2, 0.5, 0),
      new THREE.Vector3(0, 0.8, 0.3),
      new THREE.Vector3(1.2, 0.5, 0),
      new THREE.Vector3(0.5, 0, -0.2),
      new THREE.Vector3(1.2, -0.5, 0),
      new THREE.Vector3(0, -0.7, 0.2),
      new THREE.Vector3(-1.2, -0.5, 0),
      new THREE.Vector3(-0.4, 0, -0.1),
      new THREE.Vector3(-1.2, 0.5, 0)
    ];
    const weaveCurve = new THREE.CatmullRomCurve3(weavePts, true);
    const weaveTube = new THREE.Mesh(
      new THREE.TubeGeometry(weaveCurve, 64, 0.015, 8, true),
      new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.9 })
    );
    threadWeaveGroup.add(weaveTube);

    // Floating UI wireframe plane
    const uiBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.0),
      new THREE.MeshBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.25, wireframe: true })
    );
    threadWeaveGroup.add(uiBoard);

    // =========================================================================
    // 06. LIVE TASK PIPELINE GROUP (SCENE 06: COMO FUNCIONA)
    // =========================================================================
    const taskPipelineGroup = new THREE.Group();
    scene.add(taskPipelineGroup);

    // Pipeline Rail
    const pipeLineGeo = new THREE.CylinderGeometry(0.02, 0.02, 3.2, 16);
    const pipeLineMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });
    const pipeLine = new THREE.Mesh(pipeLineGeo, pipeLineMat);
    pipeLine.rotation.z = Math.PI / 2;
    taskPipelineGroup.add(pipeLine);

    // 5 Station Stations along pipeline
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.015, 8, 24),
        new THREE.MeshBasicMaterial({ color: i === 3 ? 0xef4444 : 0x64748b, transparent: true, opacity: 0.6 })
      );
      ring.position.x = -1.4 + i * 0.7;
      taskPipelineGroup.add(ring);
    }

    // Moving Task Capsule
    const taskCapsule = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.06, 0.12, 8, 16),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true })
    );
    taskCapsule.rotation.z = Math.PI / 2;
    taskPipelineGroup.add(taskCapsule);

    // =========================================================================
    // 07. MODULAR EXPANSION LATTICE GROUP (SCENE 07: PLANOS)
    // =========================================================================
    const modularScaleGroup = new THREE.Group();
    scene.add(modularScaleGroup);

    const centerCell = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.55, 0.55),
      new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true, transparent: true, opacity: 0.85 })
    );
    modularScaleGroup.add(centerCell);

    const satelliteCells: THREE.Mesh[] = [];
    const satOffsets = [
      [-0.8, 0, 0], [0.8, 0, 0], [0, 0.8, 0], [0, -0.8, 0],
      [-0.8, 0.8, 0], [0.8, 0.8, 0], [-0.8, -0.8, 0], [0.8, -0.8, 0]
    ];
    satOffsets.forEach(([ox, oy, oz]) => {
      const sat = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.35, 0.35),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.4 })
      );
      sat.position.set(ox, oy, oz);
      modularScaleGroup.add(sat);
      satelliteCells.push(sat);
    });

    // =========================================================================
    // 08. ADAPTATION METAMORPHOSIS GROUP (SCENE 08: ADAPTAÇÃO)
    // =========================================================================
    const adaptationMorphGroup = new THREE.Group();
    scene.add(adaptationMorphGroup);

    const morphFrame = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.1),
      new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: 0.5 })
    );
    adaptationMorphGroup.add(morphFrame);

    // Hanko 3D Seal
    const hankoMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.04, 32),
      new THREE.MeshBasicMaterial({ color: 0xe11d48, transparent: true, opacity: 0.85 })
    );
    hankoMesh.position.set(0.6, -0.3, 0.05);
    hankoMesh.rotation.x = Math.PI / 2;
    adaptationMorphGroup.add(hankoMesh);

    // =========================================================================
    // 09. SECURITY RED GATE & VAULT GROUP (SCENE 09: CONFIANÇA)
    // =========================================================================
    const gateGroup = new THREE.Group();
    scene.add(gateGroup);

    const gatePillarMat = new THREE.MeshBasicMaterial({ color: 0xe11d48, transparent: true, opacity: 0.85 });
    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.9, 0.12), gatePillarMat);
    leftPillar.position.set(-1.1, 0, 0);
    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.9, 0.12), gatePillarMat);
    rightPillar.position.set(1.1, 0, 0);
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.14, 0.15), gatePillarMat);
    topBar.position.set(0, 0.95, 0);

    gateGroup.add(leftPillar, rightPillar, topBar);

    // Sliding Iron Bars
    const gateBars: THREE.Mesh[] = [];
    for (let i = 0; i < 7; i++) {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.8, 12),
        new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.85 })
      );
      bar.position.set(-0.75 + i * 0.25, 0, 0);
      gateGroup.add(bar);
      gateBars.push(bar);
    }

    // =========================================================================
    // 10. RAILWAY EXPANSION TRACK GROUP (SCENE 10: ENTRADA)
    // =========================================================================
    const railwayGroup = new THREE.Group();
    scene.add(railwayGroup);

    // Double Track Lines
    const railPts1 = [new THREE.Vector3(-2.2, -0.4, -0.5), new THREE.Vector3(-1, -0.1, 0), new THREE.Vector3(0.5, 0.2, 0), new THREE.Vector3(2.2, 0.5, -0.3)];
    const railCurve = new THREE.CatmullRomCurve3(railPts1);
    const railTube = new THREE.Mesh(
      new THREE.TubeGeometry(railCurve, 64, 0.015, 8, false),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 })
    );
    railwayGroup.add(railTube);

    // Bullet Train Pod
    const trainPod = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.08, 0.35, 8, 16),
      new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true })
    );
    trainPod.rotation.z = -Math.PI / 6;
    railwayGroup.add(trainPod);

    // 5 Station Nodes
    for (let i = 0; i < 5; i++) {
      const st = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xd4af37 })
      );
      const pt = railCurve.getPoint(i / 4);
      st.position.copy(pt);
      railwayGroup.add(st);
    }

    // =========================================================================
    // 11. BROADCAST CITY RAYS GROUP (SCENE 11: PROMOÇÃO)
    // =========================================================================
    const broadcastGroup = new THREE.Group();
    scene.add(broadcastGroup);

    const towerSpire = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 1.6, 8),
      new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true })
    );
    towerSpire.position.set(0, 0.4, 0);
    broadcastGroup.add(towerSpire);

    // 3 Concentric Emission Rings
    const emitRings: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const r = new THREE.Mesh(
        new THREE.RingGeometry(0.25 + i * 0.4, 0.28 + i * 0.4, 32),
        new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6 - i * 0.12, side: THREE.DoubleSide })
      );
      r.position.set(0, 1.2, 0);
      r.rotation.x = Math.PI / 2;
      broadcastGroup.add(r);
      emitRings.push(r);
    }

    // =========================================================================
    // 12. COMPETITIVE CONSTELLATION 3D (SCENE 12: CONCORRÊNCIA)
    // =========================================================================
    const constellationGroup = new THREE.Group();
    scene.add(constellationGroup);

    // X and Y Coordinate Axes
    const xAxisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.8, -1.0, 0), new THREE.Vector3(1.8, -1.0, 0)]);
    const yAxisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.8, -1.0, 0), new THREE.Vector3(-1.8, 1.2, 0)]);
    const axisMat = new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.45 });
    constellationGroup.add(new THREE.Line(xAxisGeo, axisMat));
    constellationGroup.add(new THREE.Line(yAxisGeo, axisMat));

    // Competitor Star Nodes
    const competitors = [
      { name: 'SAP / Oracle', x: 1.4, y: -0.7, color: 0x6366f1, size: 0.08 },
      { name: 'OBIC / Bugyo', x: -1.2, y: 0.8, color: 0xf59e0b, size: 0.07 },
      { name: 'Freee / MF', x: -0.6, y: -0.2, color: 0x38bdf8, size: 0.06 },
      { name: 'Notion / Asana', x: -1.3, y: -0.6, color: 0x94a3b8, size: 0.05 },
      { name: 'KIZUNA', x: 1.2, y: 0.9, color: 0xef4444, size: 0.12, isHero: true }
    ];

    competitors.forEach((c) => {
      const star = new THREE.Mesh(
        new THREE.SphereGeometry(c.size, 16, 16),
        new THREE.MeshBasicMaterial({ color: c.color })
      );
      star.position.set(c.x, c.y, 0);
      constellationGroup.add(star);

      if (c.isHero) {
        const halo = new THREE.Mesh(
          new THREE.RingGeometry(0.15, 0.22, 32),
          new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
        );
        halo.position.set(c.x, c.y, 0.02);
        constellationGroup.add(halo);
      }
    });

    // =========================================================================
    // 13. VOLUMETRIC FINANCIAL 3D GROUP (SCENE 13: PREÇO)
    // =========================================================================
    const financial3DGroup = new THREE.Group();
    scene.add(financial3DGroup);

    const finBars: THREE.Mesh[] = [];
    const barValues = [0.4, 0.7, 1.1, 1.6, 2.2];
    for (let i = 0; i < 5; i++) {
      const bGeo = new THREE.CylinderGeometry(0.08, 0.08, barValues[i], 16);
      const bMat = new THREE.MeshBasicMaterial({
        color: i === 4 ? 0xef4444 : 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.7
      });
      const bar = new THREE.Mesh(bGeo, bMat);
      bar.position.set(-1.0 + i * 0.5, -0.8 + barValues[i] / 2, 0);
      financial3DGroup.add(bar);
      finBars.push(bar);
    }

    // =========================================================================
    // 14. MISSION CONTROL RADAR GROUP (SCENE 14: RISCOS & KPIS)
    // =========================================================================
    const missionControlGroup = new THREE.Group();
    scene.add(missionControlGroup);

    const radarDisc = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 1.4, 48),
      new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
    );
    radarDisc.rotation.x = Math.PI / 2.4;
    missionControlGroup.add(radarDisc);

    const sweepLineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(1.3, 0, 0)]);
    const sweepLine = new THREE.Line(
      sweepLineGeo,
      new THREE.LineBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.85 })
    );
    sweepLine.rotation.x = Math.PI / 2.4;
    missionControlGroup.add(sweepLine);

    // 4 Floating Telemetry Node Points
    const quadPoints = [
      { x: -0.8, y: 0.4, color: 0x10b981 }, // Mercado
      { x: 0.8, y: 0.4, color: 0xef4444 },  // Produto
      { x: -0.8, y: -0.4, color: 0xf59e0b }, // Comercial
      { x: 0.8, y: -0.4, color: 0x38bdf8 }  // Financeiro
    ];
    quadPoints.forEach((qp) => {
      const qMesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.1, 0),
        new THREE.MeshBasicMaterial({ color: qp.color, wireframe: true })
      );
      qMesh.position.set(qp.x, qp.y, 0.2);
      missionControlGroup.add(qMesh);
    });

    // =========================================================================
    // BACKGROUND STAR FIELD
    // =========================================================================
    const starCount = 380;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 18;
      starPositions[i + 1] = (Math.random() - 0.5) * 18;
      starPositions[i + 2] = (Math.random() - 0.5) * 18;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.035, transparent: true, opacity: 0.55 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // =========================================================================
    // RENDER & ANIMATION LOOP
    // =========================================================================
    let animId: number;
    let clock = new THREE.Clock();
    const currentPos = camera.position.clone();
    const currentTarget = new THREE.Vector3(0, 0, 0);

    const onResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      const { currentIndex: sIdx, sceneIndex: scIdx } = stateRef.current;
      const { pose, env } = getCameraPoseForSection(sIdx, scIdx);

      // Camera smooth lerp
      currentPos.lerp(pose.pos, 0.045);
      currentTarget.lerp(pose.target, 0.045);
      camera.position.copy(currentPos);
      camera.lookAt(currentTarget);

      // -----------------------------------------------------------------------
      // 1. Globe Visibility (STRICT: ONLY ACTIVE ON SCENE 00 AND SCENE 14)
      // -----------------------------------------------------------------------
      const isGlobeActive = sIdx === 0 || sIdx === 14;
      globeRoot.visible = isGlobeActive;
      if (isGlobeActive) {
        globeRoot.scale.lerp(new THREE.Vector3(env.globeScale, env.globeScale, env.globeScale), 0.05);
        globeRoot.rotation.y = THREE.MathUtils.lerp(globeRoot.rotation.y, env.globeRotationY, 0.04);
        atmosMesh.material.opacity = env.globeVisibility * 0.7;
        globeMesh.material.opacity = env.globeVisibility * 0.95;
        merMat.opacity = env.globeVisibility * 0.12;

        if (sIdx === 0 && scIdx === 0) {
          globeRoot.rotation.y += 0.0006;
        }
      }

      // -----------------------------------------------------------------------
      // 2. Tokyo Skyline (Scene 02)
      // -----------------------------------------------------------------------
      tokyoSkylineGroup.visible = sIdx === 1;
      if (sIdx === 1) {
        bldgGroup.children.forEach((tw, i) => {
          tw.position.y = -1.2 + towerCoords[i].h / 2 + Math.sin(elapsed * 1.5 + i) * 0.02;
        });
      }

      // -----------------------------------------------------------------------
      // 3. Corridor 4 Doors (Scene 03)
      // -----------------------------------------------------------------------
      corridorGroup.visible = sIdx === 2;
      if (sIdx === 2) {
        doorMeshes.forEach((dm, i) => {
          const isActive = i === scIdx;
          dm.scale.lerp(new THREE.Vector3(isActive ? 1.08 : 0.94, isActive ? 1.08 : 0.94, 1), 0.08);
        });
      }

      // -----------------------------------------------------------------------
      // 4. Global x Local Fusion (Scene 04)
      // -----------------------------------------------------------------------
      fusionGroup.visible = sIdx === 3;
      if (sIdx === 3) {
        globalBlock.rotation.x += 0.008;
        globalBlock.rotation.y += 0.01;
        localBlock.rotation.y -= 0.01;
        localBlock.rotation.z += 0.005;

        if (scIdx === 0) {
          // Separated
          globalBlock.position.lerp(new THREE.Vector3(-0.95, 0, 0), 0.06);
          localBlock.position.lerp(new THREE.Vector3(0.95, 0, 0), 0.06);
          sparkRing.visible = false;
        } else if (scIdx === 1) {
          // Approaching
          globalBlock.position.lerp(new THREE.Vector3(-0.4, 0, 0), 0.06);
          localBlock.position.lerp(new THREE.Vector3(0.4, 0, 0), 0.06);
          sparkRing.visible = false;
        } else {
          // Locked in center
          globalBlock.position.lerp(new THREE.Vector3(-0.15, 0, 0), 0.06);
          localBlock.position.lerp(new THREE.Vector3(0.15, 0, 0), 0.06);
          sparkRing.visible = true;
          sparkRing.rotation.z += 0.02;
        }
      }

      // -----------------------------------------------------------------------
      // 5. Thread Weaving UI (Scene 05)
      // -----------------------------------------------------------------------
      threadWeaveGroup.visible = sIdx === 4;
      if (sIdx === 4) {
        weaveTube.rotation.z = Math.sin(elapsed * 0.8) * 0.05;
        uiBoard.rotation.y = Math.sin(elapsed * 0.6) * 0.08;
      }

      // -----------------------------------------------------------------------
      // 6. Live Task Pipeline (Scene 06)
      // -----------------------------------------------------------------------
      taskPipelineGroup.visible = sIdx === 5;
      if (sIdx === 5) {
        const targetX = -1.4 + scIdx * 0.7;
        taskCapsule.position.x = THREE.MathUtils.lerp(taskCapsule.position.x, targetX, 0.08);
        taskCapsule.rotation.x += 0.05;
      }

      // -----------------------------------------------------------------------
      // 7. Modular Expansion Lattice (Scene 07)
      // -----------------------------------------------------------------------
      modularScaleGroup.visible = sIdx === 6;
      if (sIdx === 6) {
        centerCell.rotation.y += 0.01;
        centerCell.rotation.x += 0.006;
        const spread = scIdx === 0 ? 0.35 : scIdx === 1 ? 0.8 : 1.3;
        satelliteCells.forEach((sat, i) => {
          sat.position.lerp(new THREE.Vector3(satOffsets[i][0] * spread, satOffsets[i][1] * spread, satOffsets[i][2] * spread), 0.06);
          sat.visible = scIdx === 0 ? i < 2 : scIdx === 1 ? i < 4 : true;
        });
      }

      // -----------------------------------------------------------------------
      // 8. Adaptation Metamorphosis (Scene 08)
      // -----------------------------------------------------------------------
      adaptationMorphGroup.visible = sIdx === 7;
      if (sIdx === 7) {
        morphFrame.rotation.y = Math.sin(elapsed * 0.5) * 0.06;
        hankoMesh.rotation.z += 0.015;
      }

      // -----------------------------------------------------------------------
      // 9. Red Gate / Vault (Scene 09)
      // -----------------------------------------------------------------------
      gateGroup.visible = sIdx === 8;
      if (sIdx === 8) {
        const isOpen = scIdx >= 2;
        gateBars.forEach((bar, i) => {
          const barTargetY = isOpen ? 1.5 : 0;
          bar.position.y = THREE.MathUtils.lerp(bar.position.y, barTargetY, 0.08);
        });
      }

      // -----------------------------------------------------------------------
      // 10. Railway Expansion (Scene 10)
      // -----------------------------------------------------------------------
      railwayGroup.visible = sIdx === 9;
      if (sIdx === 9) {
        const trainTargetPt = railCurve.getPoint(Math.min(1.0, Math.max(0, scIdx / 4)));
        trainPod.position.lerp(trainTargetPt, 0.08);
      }

      // -----------------------------------------------------------------------
      // 11. Broadcast Waves (Scene 11)
      // -----------------------------------------------------------------------
      broadcastGroup.visible = sIdx === 10;
      if (sIdx === 10) {
        emitRings.forEach((r, i) => {
          const s = 1 + ((elapsed * 0.8 + i * 0.3) % 2.5);
          r.scale.set(s, s, s);
        });
      }

      // -----------------------------------------------------------------------
      // 12. Competitive Constellation (Scene 12)
      // -----------------------------------------------------------------------
      constellationGroup.visible = sIdx === 11;
      if (sIdx === 11) {
        constellationGroup.rotation.y = Math.sin(elapsed * 0.3) * 0.04;
      }

      // -----------------------------------------------------------------------
      // 13. Financial Volumetric 3D (Scene 13)
      // -----------------------------------------------------------------------
      financial3DGroup.visible = sIdx === 12;
      if (sIdx === 12) {
        finBars.forEach((b, i) => {
          b.rotation.y += 0.01;
        });
      }

      // -----------------------------------------------------------------------
      // 14. Mission Control Radar (Scene 14)
      // -----------------------------------------------------------------------
      missionControlGroup.visible = sIdx === 13;
      if (sIdx === 13) {
        sweepLine.rotation.z -= 0.035;
      }

      // Ambient background drift
      starField.rotation.y += 0.0002;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [safeMode]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#05080D]"
    />
  );
};
export default WorldStage;
