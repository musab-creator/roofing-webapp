/**
 * Diversity Roofing logo (official brand assets, sourced from Drive).
 *
 * Files in /public:
 *   diversity-logo.png      — full stacked lockup: house icon + boxed wordmark
 *                             + "Protecting Homes. Respecting People" tagline
 *   diversity-logo-nav.png  — wordmark box only, cropped for slim horizontal
 *                             contexts like the navbar
 *
 * The artwork is white/light-blue and is intended for dark (navy)
 * backgrounds. A text wordmark renders as fallback if an image fails.
 */
import React from 'react';
import { cn } from '../../lib/utils';

type BrandLogoProps = {
  className?: string;
  /** 'nav' = compact wordmark strip; 'full' = complete stacked lockup */
  variant?: 'nav' | 'full';
};

export const BrandLogo = ({ className, variant = 'nav' }: BrandLogoProps) => {
  const [hasImage, setHasImage] = React.useState(true);

  if (hasImage) {
    return variant === 'full' ? (
      <img
        src="/diversity-logo.png"
        alt="Diversity Roofing — Protecting Homes. Respecting People"
        onError={() => setHasImage(false)}
        className={cn('h-24 w-auto', className)}
      />
    ) : (
      <img
        src="/diversity-logo-nav.png"
        alt="Diversity Roofing"
        onError={() => setHasImage(false)}
        className={cn('h-8 w-auto md:h-9', className)}
      />
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      {/* Roofline mark (fallback) */}
      <svg
        viewBox="0 0 40 40"
        aria-hidden="true"
        className="h-9 w-9 shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 22 L20 8 L36 22"
          stroke="hsl(var(--dr-amber))"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 24 v9 h18 v-9"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-extrabold tracking-tight text-white">
          Diversity Roofing
        </span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-dr-mist">
          Protecting Homes. Respecting People
        </span>
      </span>
    </span>
  );
};
