/*
 * Etapa 11 • Canal entre o mundo 3D (TransitionDirector, no WorldStage) e a interface 2D (App).
 * - `release()`: o diretor avisa que a interface já pode trocar para a tela de destino (a câmera chegou
 *   ao ponto narrativo combinado). O App mantém a tela de origem congelada até esse aviso.
 * - Opacidade da interface e véu escuro: variáveis CSS escritas direto no documento, a cada quadro, sem
 *   provocar renderizações do React.
 */

type Listener = () => void;
let releaseSeq = 0;
const listeners = new Set<Listener>();
let lastOpacity = -1;
let lastVeil = -1;

export const uiBus = {
  getReleaseSeq: () => releaseSeq,
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  release() {
    releaseSeq += 1;
    listeners.forEach((l) => l());
  },
  /** Opacidade da interface (1 = normal) e do véu escuro (0 = sem véu). */
  setVisuals(opacity: number, veil: number) {
    const o = Math.round(Math.max(0, Math.min(1, opacity)) * 1000) / 1000;
    const v = Math.round(Math.max(0, Math.min(1, veil)) * 1000) / 1000;
    if (o === lastOpacity && v === lastVeil) return;
    lastOpacity = o;
    lastVeil = v;
    const st = document.documentElement.style;
    st.setProperty('--kz-ui-opacity', String(o));
    st.setProperty('--kz-veil', String(v));
  }
};
