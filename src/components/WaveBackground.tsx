import { useEffect, useRef } from 'react';
import './WaveBackground.css';

interface WaveLayer {
  amplitude: number;
  wavelength: number;
  speed: number;
  yRatio: number;
  color: string;
  opacity: number;
}

/* Warm dune palette — terracotta, saffron and jade, matching the theme tokens. */
const LAYERS: WaveLayer[] = [
  { amplitude: 30, wavelength: 460, speed: 0.30, yRatio: 0.42, color: '226,182,150', opacity: 0.46 },
  { amplitude: 42, wavelength: 350, speed: 0.44, yRatio: 0.60, color: '224,163,46',  opacity: 0.26 },
  { amplitude: 34, wavelength: 270, speed: 0.58, yRatio: 0.78, color: '193,85,58',   opacity: 0.22 },
  { amplitude: 22, wavelength: 200, speed: 0.74, yRatio: 0.92, color: '46,94,78',    opacity: 0.16 },
];

/** Waves are drawn within the top band of the parent so they stay visible even when the
 *  parent (the hero section) is much taller than one screen. */
const WAVE_BAND_HEIGHT = 660;

/** Interactive dune background that ripples toward the cursor. Fills its positioned parent. */
export default function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    const mouse = { x: -9999, y: -9999, targetX: -9999, targetY: -9999 };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const onPointerMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };
    const onPointerLeave = () => {
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);

    let raf = 0;
    let time = 0;

    const draw = () => {
      time += reduceMotion ? 0.002 : 0.010;
      mouse.x += (mouse.targetX - mouse.x) * 0.07;
      mouse.y += (mouse.targetY - mouse.y) * 0.07;

      ctx.clearRect(0, 0, width, height);

      const bandHeight = Math.min(height, WAVE_BAND_HEIGHT);

      /* Warm glow trailing the cursor, under the waves. */
      if (mouse.x > -1000) {
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 260);
        glow.addColorStop(0, 'rgba(224,163,46,.16)');
        glow.addColorStop(1, 'rgba(224,163,46,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      LAYERS.forEach((layer, li) => {
        const baseline = bandHeight * layer.yRatio;
        const step = 8;
        const points: { x: number; y: number }[] = [];

        for (let x = 0; x <= width; x += step) {
          /* Two harmonics per layer keep the silhouette organic rather than a clean sine. */
          const wave =
            Math.sin(x / layer.wavelength + time * layer.speed + li) * layer.amplitude +
            Math.sin(x / (layer.wavelength * 0.42) - time * layer.speed * 1.4 + li * 2) * layer.amplitude * 0.28;

          const dist = x - mouse.x;
          const influence = Math.exp(-(dist * dist) / (2 * 180 * 180));
          const ripple = influence * 52 * Math.sin(time * 1.5 + li * 0.6);

          points.push({ x, y: baseline + wave - ripple });
        }

        ctx.beginPath();
        ctx.moveTo(0, bandHeight);
        points.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.lineTo(width, bandHeight);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, baseline - layer.amplitude - 40, 0, bandHeight);
        gradient.addColorStop(0, `rgba(${layer.color},${layer.opacity})`);
        gradient.addColorStop(1, `rgba(${layer.color},0)`);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.strokeStyle = `rgba(${layer.color},${Math.min(layer.opacity + 0.28, 0.8)})`;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="wave-bg" aria-hidden="true" />;
}
