import * as THREE from 'three';
import type { FlightPlan } from './plans';
import { uiBus } from './uiBus';

/*
 * Etapa 11 • TransitionDirector — controle central das transições entre telas.
 * Não conhece os cenários: o WorldStage informa as poses e aplica os efeitos (âncora/rebase, visibilidade,
 * estados dos objetos). O diretor cuida do tempo, da trajetória, da interface 2D e das interrupções.
 *
 * Dois tipos:
 * - voo ("flight"): trajetória curva própria de um plano, no quadro ancorado. O progresso s (0–1) é medido
 *   SEMPRE no sentido de ida do plano (origem → destino); na volta, s diminui. Voltar durante um voo inverte
 *   o sentido a partir do ponto atual (sem salto).
 * - véu ("veil"): escurecimento curto (sobe, troca no pico, desce) — saltos pelo menu, trocas sem plano que
 *   envolvem a tela com rebase, movimento reduzido e qualquer troca que interrompa um voo sem ser a volta.
 */

const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const v3 = (p: [number, number, number]) => new THREE.Vector3(p[0], p[1], p[2]);

/**
 * Interpolação monotônica (PCHIP, Fritsch–Carlson) com derivada zero nas pontas: o tempo (x) vira progresso
 * no percurso (y) passando por marcos, com velocidade contínua, saída suave e chegada desacelerada.
 */
function pchip(xs: number[], ys: number[], x: number) {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  const h: number[] = [];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    h.push(Math.max(1e-6, xs[i + 1] - xs[i]));
    d.push((ys[i + 1] - ys[i]) / h[i]);
  }
  const m: number[] = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) m[i] = 0;
    else {
      const w1 = 2 * h[i] + h[i - 1];
      const w2 = h[i] + 2 * h[i - 1];
      m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
  }
  let k = 0;
  while (k < n - 2 && x > xs[k + 1]) k++;
  const t = (x - xs[k]) / h[k];
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * ys[k] + (t3 - 2 * t2 + t) * h[k] * m[k] + (-2 * t3 + 3 * t2) * ys[k + 1] + (t3 - t2) * h[k] * m[k + 1];
}

/** Fração do comprimento de arco em que a curva passa por cada ponto de controle. */
function controlFractions(curve: THREE.CatmullRomCurve3) {
  const L = curve.getLengths();
  const div = L.length - 1;
  const total = L[div] || 1;
  const n = curve.points.length;
  return curve.points.map((_, i) => L[Math.round((i / (n - 1)) * div)] / total);
}

/** Desacelera o percurso perto do limiar mantendo s(0)=0 e s(1)=1 (derivada 1−k·cos, monotônica com k<1). */
function lingerWarp(e: number, threshold: number, k: number) {
  const c = Math.sin(-2 * Math.PI * threshold);
  const w = Math.sin(2 * Math.PI * (e - threshold)) - c;
  return e - (k * w) / (2 * Math.PI);
}

export interface Flight {
  kind: 'flight';
  plan: FlightPlan;
  /** +1 indo (origem → destino), −1 voltando. */
  dir: 1 | -1;
  /** tempo normalizado (0–1) no sentido de ida. */
  tau: number;
  /** progresso por comprimento de arco no sentido de ida. */
  s: number;
  /** tela cuja interface está à mostra: 'from' (origem do plano) ou 'to'. */
  shown: 'from' | 'to';
  pos: THREE.CatmullRomCurve3;
  target: THREE.CatmullRomCurve3;
  /** extremos fixos (onde a câmera estava ao começar); o outro extremo acompanha a pose de destino. */
  fixedFrom: boolean;
  fixedTo: boolean;
}

export interface Veil {
  kind: 'veil';
  phase: 'up' | 'down';
  value: number;
  /** tela de destino (aplicada no pico). */
  target: number;
  peakDone: boolean;
  /** voo que continua por baixo do véu até o pico (interrupção), se houver. */
  under: Flight | null;
}

export type Active = Flight | Veil | null;

export interface FrameIn {
  dt: number;
  /** pose de destino atual (já no quadro em que a câmera está). */
  destPos: THREE.Vector3;
  destTarget: THREE.Vector3;
}

export interface FrameOut {
  /** a câmera deve seguir estas coordenadas (null = comportamento normal do WorldStage). */
  pos: THREE.Vector3 | null;
  target: THREE.Vector3 | null;
  /** camada de passagem (névoa, sombra ou luz) do plano, se houver: cor, forma e opacidade. */
  overlay: { color: string; radial: number; opacity: number; sweep: number } | null;
  /** o voo terminou neste quadro (para o rebase). */
  flightDone: Flight | null;
  /** o véu atingiu o pico neste quadro (aplicar o destino). */
  veilPeak: Veil | null;
}

const VEIL_UP = 0.22;
const VEIL_DOWN = 0.32;

export class TransitionDirector {
  active: Active = null;
  private outPos = new THREE.Vector3();
  private outTarget = new THREE.Vector3();

  get flight(): Flight | null {
    if (!this.active) return null;
    if (this.active.kind === 'flight') return this.active;
    return this.active.under;
  }

  /** Inicia um voo. `camPos/camTarget` = câmera agora (no quadro ancorado). */
  startFlight(plan: FlightPlan, reverse: boolean, camPos: THREE.Vector3, camTarget: THREE.Vector3, destPos: THREE.Vector3, destTarget: THREE.Vector3) {
    const startP = camPos.clone();
    const startT = camTarget.clone();
    const ptsP = [reverse ? destPos.clone() : startP, ...plan.via.map(v3), reverse ? startP : destPos.clone()];
    const ptsT = [reverse ? destTarget.clone() : startT, ...plan.viaTarget.map(v3), reverse ? startT : destTarget.clone()];
    const f: Flight = {
      kind: 'flight',
      plan,
      dir: reverse ? -1 : 1,
      tau: reverse ? 1 : 0,
      s: reverse ? 1 : 0,
      shown: reverse ? 'to' : 'from',
      pos: new THREE.CatmullRomCurve3(ptsP, false, 'centripetal'),
      target: new THREE.CatmullRomCurve3(ptsT, false, 'centripetal'),
      fixedFrom: !reverse,
      fixedTo: reverse
    };
    this.active = f;
    return f;
  }

  /** Volta durante um voo: inverte o sentido a partir do ponto atual. */
  reverseFlight() {
    const f = this.flight;
    if (!f || this.active?.kind !== 'flight') return false;
    f.dir = f.dir === 1 ? -1 : 1;
    // o extremo para onde agora se vai passa a acompanhar a pose real daquela tela
    if (f.dir === -1) f.fixedFrom = false;
    else f.fixedTo = false;
    return true;
  }

  /** Véu curto até a tela `target`. Se um voo estiver em andamento, ele continua por baixo até o pico. */
  startVeil(target: number) {
    const a = this.active;
    if (a?.kind === 'veil') {
      a.target = target;
      if (a.phase === 'down') {
        a.phase = 'up';
        a.peakDone = false;
      }
      return a;
    }
    const v: Veil = { kind: 'veil', phase: 'up', value: 0, target, peakDone: false, under: null };
    this.active = v;
    return v;
  }

  cancel() {
    this.active = null;
  }

  private stepFlight(f: Flight, fi: FrameIn) {
    const dur = f.dir === 1 ? f.plan.duration : f.plan.reverseDuration;
    f.tau = Math.max(0, Math.min(1, f.tau + (f.dir * fi.dt) / dur));
    // limitado a [0, 1]: arredondamentos (ex.: −1e−17) fariam a curva ler um ponto inexistente
    f.s = Math.max(0, Math.min(1, lingerWarp(easeInOutCubic(f.tau), f.plan.threshold, f.plan.linger)));
    // o extremo de chegada acompanha a pose real (troca de cena durante o voo, redimensionamento)
    const pts = f.pos.points;
    const tps = f.target.points;
    if (!f.fixedTo && f.dir === 1) {
      pts[pts.length - 1].copy(fi.destPos);
      tps[tps.length - 1].copy(fi.destTarget);
    }
    if (!f.fixedFrom && f.dir === -1) {
      pts[0].copy(fi.destPos);
      tps[0].copy(fi.destTarget);
    }
    f.pos.updateArcLengths();
    f.target.updateArcLengths();
    const keys = f.plan.keys;
    if (keys) {
      // planos com marcos de tempo: cada ponto de passagem tem o seu instante (Fase 3)
      const xs = [0, ...keys.map((k) => k.t), 1];
      const sp = Math.max(0, Math.min(1, pchip(xs, controlFractions(f.pos), f.tau)));
      const st = Math.max(0, Math.min(1, pchip(xs, controlFractions(f.target), f.tau)));
      f.s = sp;
      f.pos.getPointAt(sp, this.outPos);
      f.target.getPointAt(st, this.outTarget);
    } else {
      f.pos.getPointAt(f.s, this.outPos);
      f.target.getPointAt(f.s, this.outTarget);
    }
    // nos planos com marcos, interface e camada de passagem seguem o tempo (τ); no piloto 07 ↔ 08, o percurso (s)
    const u = keys ? f.tau : f.s;

    // interface: troca no ponto narrativo combinado
    if (f.dir === 1 && f.shown === 'from' && u >= f.plan.uiRelease) {
      f.shown = 'to';
      uiBus.release();
    } else if (f.dir === -1 && f.shown === 'to' && u < f.plan.uiRelease) {
      f.shown = 'from';
      uiBus.release();
    }
    const opacity = f.shown === 'from' ? 1 - smoothstep(0, f.plan.uiOutEnd, u) : smoothstep(f.plan.uiRelease, f.plan.uiInFull, u);
    const ov = f.plan.overlay;
    const overlay = ov
      ? {
          color: ov.color,
          radial: ov.radial,
          opacity: Math.min(smoothstep(ov.rise[0], ov.rise[1], f.tau), 1 - smoothstep(ov.fall[0], ov.fall[1], f.tau)),
          // reflexo em faixa: posição da faixa ao longo da passagem (−1 = sem faixa)
          sweep: ov.sweep ? Math.max(0, Math.min(1, (f.tau - ov.rise[0]) / Math.max(1e-4, ov.fall[1] - ov.rise[0]))) : -1
        }
      : null;
    return { opacity, overlay, done: f.dir === 1 ? f.tau >= 1 : f.tau <= 0 };
  }

  update(fi: FrameIn): FrameOut {
    const out: FrameOut = { pos: null, target: null, overlay: null, flightDone: null, veilPeak: null };
    const a = this.active;
    if (!a) {
      uiBus.setVisuals(1, 0);
      return out;
    }
    if (a.kind === 'flight') {
      const r = this.stepFlight(a, fi);
      out.pos = this.outPos;
      out.target = this.outTarget;
      out.overlay = r.overlay;
      uiBus.setVisuals(r.opacity, 0);
      if (r.done) {
        out.flightDone = a;
        this.active = null;
      }
      return out;
    }
    // véu
    if (a.under) {
      this.stepFlight(a.under, fi);
      out.pos = this.outPos;
      out.target = this.outTarget;
    }
    if (a.phase === 'up') {
      a.value = Math.min(1, a.value + fi.dt / VEIL_UP);
      if (a.value >= 1) {
        a.phase = 'down';
        a.peakDone = true;
        a.under = null;
        out.veilPeak = a;
        out.pos = null;
        out.target = null;
        uiBus.release();
      }
    } else {
      a.value = Math.max(0, a.value - fi.dt / VEIL_DOWN);
      if (a.value <= 0) this.active = null;
    }
    uiBus.setVisuals(1, smoothstep(0, 1, a.value));
    return out;
  }
}
