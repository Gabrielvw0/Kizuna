import React, { useEffect, useRef } from 'react';
import { usePresentation } from './PresentationContext';

/**
 * VisualBackgroundEngine — Japanese Contemporary Corporate Identity & Safe Mode Fallback
 * - Contemporary Corporate Tokyo: Minimalist architectural vignette, subtle Shoji/Kumiko lines
 * - In normal mode: transparent overlay so 3D WorldStage (Layer 1) shines through with depth
 * - In Safe Mode (MODO SEGURO): acts as high-contrast, zero-WebGL fallback canvas
 */
export const VisualBackgroundEngine: React.FC = () => {
  const { currentIndex, sceneIndex, safeMode } = usePresentation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ currentIndex, sceneIndex });
  stateRef.current = { currentIndex, sceneIndex };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const drawShojiGrid = (w: number, h: number, alpha: number) => {
      ctx.strokeStyle = `rgba(225, 29, 72, ${alpha})`;
      ctx.lineWidth = 0.55;

      const stepX = 160;
      const stepY = 120;

      for (let x = 0; x <= w; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      for (let y = 0; y <= h; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    };

    const render = () => {
      time += 0.005;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      if (safeMode) {
        // High-contrast, dark Sumi ink background for emergency safe mode (zero WebGL load)
        const bgGrad = ctx.createRadialGradient(
          w * 0.5,
          h * 0.45,
          40,
          w * 0.5,
          h * 0.5,
          Math.max(w, h) * 0.85
        );
        bgGrad.addColorStop(0, '#0B101B');
        bgGrad.addColorStop(0.6, '#060911');
        bgGrad.addColorStop(1, '#020408');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        drawShojiGrid(w, h, 0.05);

      } else {
        // Transparent cinematic vignette + subtle architectural Shoji grid over WorldStage
        drawShojiGrid(w, h, 0.016);

        // Subtle dark corner vignette to focus center content
        const vignette = ctx.createRadialGradient(
          w * 0.5,
          h * 0.5,
          Math.min(w, h) * 0.45,
          w * 0.5,
          h * 0.5,
          Math.max(w, h) * 0.8
        );
        vignette.addColorStop(0, 'rgba(5, 8, 13, 0)');
        vignette.addColorStop(1, 'rgba(2, 4, 8, 0.6)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
      }

      if (!safeMode) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [safeMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] select-none"
    />
  );
};
export default VisualBackgroundEngine;
