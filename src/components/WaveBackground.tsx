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

const LAYERS: WaveLayer[] = [
  { amplitude: 34, wavelength: 420, speed: 0.35, yRatio: 0.40, color: '196,181,253', opacity: 0.40 }, // lavender
  { amplitude: 44, wavelength: 340, speed: 0.50, yRatio: 0.58, color: '165,180,252', opacity: 0.38 }, // indigo
  { amplitude: 30, wavelength: 260, speed: 0.65, yRatio: 0.76, color: '147,197,253', opacity: 0.42 }, // blue
];

/** Waves are drawn within the top band of the parent so they stay visible even when the
 *  parent (the hero section) is much taller than one screen. */
const WAVE_BAND_HEIGHT = 640;

/** Interactive wave background that ripples toward the cursor. Fills its positioned parent. */
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
      time += reduceMotion ? 0.002 : 0.012;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const bandHeight = Math.min(height, WAVE_BAND_HEIGHT);

      LAYERS.forEach((layer, li) => {
        const baseline = bandHeight * layer.yRatio;
        const step = 8;
        const points: { x: number; y: number }[] = [];

        for (let x = 0; x <= width; x += step) {
          const wave = Math.sin(x / layer.wavelength + time * layer.speed + li) * layer.amplitude;
          const dist = x - mouse.x;
          const influence = Math.exp(-(dist * dist) / (2 * 160 * 160));
          const ripple = influence * 46 * Math.sin(time * 1.6 + li * 0.6);
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
        ctx.strokeStyle = `rgba(${layer.color},${Math.min(layer.opacity + 0.25, 0.85)})`;
        ctx.lineWidth = 1.5;
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
