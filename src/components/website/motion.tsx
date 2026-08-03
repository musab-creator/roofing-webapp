/**
 * Lightweight motion primitives for the Diversity Roofing marketing site.
 * Patterns adapted from Magic UI (https://magicui.design) and Animata
 * (https://animata.design), rebuilt on CSS + rAF so no animation runtime is
 * needed (per the magic-ui/motionshop skills: prefer the lightest rung).
 * All primitives respect prefers-reduced-motion.
 */
import React from 'react';
import { cn } from '../../lib/utils';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- */
/* BlurFade — scroll-reveal wrapper (Magic UI "blur-fade" pattern)  */
/* ---------------------------------------------------------------- */
type BlurFadeProps = {
  children: React.ReactNode;
  /** stagger delay in ms */
  delay?: number;
  className?: string;
};

export const BlurFade = ({ children, delay = 0, className }: BlurFadeProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (prefersReducedMotion()) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // Reveal when entering the viewport — or if already above it
        // (anchor jumps / fast scrolling must never leave sections hidden).
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700 ease-out will-change-transform',
        visible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-5 blur-[6px]',
        className
      )}>
      {children}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* NumberTicker — count-up stat (Magic UI "number-ticker" pattern)  */
/* ---------------------------------------------------------------- */
type NumberTickerProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  durationMs?: number;
  className?: string;
};

export const NumberTicker = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  durationMs = 1600,
  className
}: NumberTickerProps) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const started = React.useRef(false);
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        if (prefersReducedMotion()) {
          setDisplay(value);
          return;
        }
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min((t - t0) / durationMs, 1);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
          setDisplay(value * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, durationMs]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
};

/* ---------------------------------------------------------------- */
/* Marquee — infinite scroll row (Magic UI "marquee" pattern)       */
/* ---------------------------------------------------------------- */
type MarqueeProps = {
  children: React.ReactNode;
  className?: string;
};

export const Marquee = ({ children, className }: MarqueeProps) => (
  <div
    className={cn(
      'group relative overflow-hidden',
      '[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
      className
    )}>
    <div className="flex w-max animate-dr-marquee gap-5 pr-5 group-hover:[animation-play-state:paused]">
      {children}
      <div aria-hidden="true" className="flex gap-5 pr-5">
        {children}
      </div>
    </div>
  </div>
);

/* ---------------------------------------------------------------- */
/* ShimmerLink — CTA with shimmer sweep (Magic UI "shimmer-button") */
/* ---------------------------------------------------------------- */
type ShimmerLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export const ShimmerLink = ({ href, children, className }: ShimmerLinkProps) => (
  <a
    href={href}
    className={cn(
      'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl',
      'bg-dr-amber px-7 py-3.5 font-display text-sm font-bold text-dr-navy',
      'shadow-[0_8px_30px_-6px_hsl(var(--dr-amber)/0.55)] transition-transform duration-200',
      'hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-6px_hsl(var(--dr-amber)/0.6)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dr-amber focus-visible:ring-offset-2 focus-visible:ring-offset-dr-navy',
      className
    )}>
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 w-1/3 animate-dr-shimmer bg-white/40 blur-md"
    />
    <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
  </a>
);

/* ---------------------------------------------------------------- */
/* TiltCard — pointer-tracked 3D tilt (motionshop rung 1: CSS 3D)   */
/* ---------------------------------------------------------------- */
type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  /** max tilt in degrees */
  max?: number;
};

export const TiltCard = ({ children, className, max = 8 }: TiltCardProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const raf = React.useRef(0);

  const enabled = () => !prefersReducedMotion() && window.matchMedia('(pointer: fine)').matches;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !enabled()) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(
        px * max
      ).toFixed(2)}deg) translateZ(0)`;
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  };

  React.useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn('transition-transform duration-300 ease-out will-change-transform', className)}>
      {children}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* useParallax — scroll-linked layer drift (motionshop rung 2)      */
/* Layers opt in with data-speed="0.15" etc.                        */
/* ---------------------------------------------------------------- */
export const useParallax = <T extends HTMLElement>() => {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const root = ref.current;
        if (!root) return;
        const y = window.scrollY;
        root.querySelectorAll<HTMLElement>('[data-speed]').forEach((layer) => {
          const speed = parseFloat(layer.dataset.speed ?? '0');
          layer.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`;
        });
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
};
