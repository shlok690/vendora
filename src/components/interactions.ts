import { useCallback, useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Reveals `.reveal` elements as they scroll into view. Re-scans when `deps` change. */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.visible)'));
    if (!targets.length) return;

    if (prefersReducedMotion()) {
      targets.forEach((t) => t.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Pointer-reactive card surface: writes the cursor position into `--px`/`--py`
 * (0–100%) for the glare gradient, and tilts the card toward the cursor.
 */
export function useTilt(maxTilt = 6) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--px', `${x * 100}%`);
      el.style.setProperty('--py', `${y * 100}%`);
      el.style.setProperty('--rx', `${(0.5 - y) * maxTilt}deg`);
      el.style.setProperty('--ry', `${(x - 0.5) * maxTilt}deg`);
    },
    [maxTilt]
  );

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--px', '50%');
    el.style.setProperty('--py', '50%');
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}

/** Button that drifts toward the cursor while hovered. */
export function useMagnetic(strength = 0.28) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * strength}px, ${dy * strength * 0.7}px)`;
    },
    [strength]
  );

  const onPointerLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = '';
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}

/** 0–1 scroll progress of the whole document. */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return progress;
}

/** Cycles through placeholder strings with a typewriter effect. */
export function useTypewriter(words: string[], active: boolean) {
  const [text, setText] = useState(words[0] ?? '');

  useEffect(() => {
    if (!active || prefersReducedMotion() || words.length === 0) return;

    let wordIndex = 0;
    let charIndex = words[0].length;
    let deleting = true;
    let timer: ReturnType<typeof setTimeout>;

    const step = () => {
      const word = words[wordIndex];
      charIndex += deleting ? -1 : 1;
      setText(word.slice(0, charIndex));

      let delay = deleting ? 28 : 62;
      if (!deleting && charIndex === word.length) {
        deleting = true;
        delay = 2100;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 140;
      }
      timer = setTimeout(step, delay);
    };

    timer = setTimeout(step, 2200);
    return () => clearTimeout(timer);
  }, [words, active]);

  return text;
}
