/**
 * Diversity Roofing logo slot.
 *
 * TO USE THE REAL LOGO: drop the official logo file at
 *   public/diversity-logo.png   (transparent background, ~512px wide works best)
 * and it will render automatically — no code change needed.
 *
 * Until that file exists, a built-in wordmark (roofline mark + company name)
 * renders as the fallback.
 */
import React from 'react';
import { cn } from '../../lib/utils';

type BrandLogoProps = {
  className?: string;
  /** 'dark' = for use on navy backgrounds, 'light' = for use on paper backgrounds */
  tone?: 'dark' | 'light';
};

export const BrandLogo = ({ className, tone = 'dark' }: BrandLogoProps) => {
  const [hasImage, setHasImage] = React.useState(true);

  if (hasImage) {
    return (
      <img
        src="/diversity-logo.png"
        alt="Diversity Roofing"
        onError={() => setHasImage(false)}
        className={cn('h-9 w-auto', className)}
      />
    );
  }

  const text = tone === 'dark' ? 'text-white' : 'text-dr-ink';
  const sub = tone === 'dark' ? 'text-dr-mist' : 'text-dr-slate';

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      {/* Roofline mark */}
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
          stroke={tone === 'dark' ? 'white' : 'hsl(var(--dr-ink))'}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={cn('font-display text-[15px] font-extrabold tracking-tight', text)}>
          Diversity Roofing
        </span>
        <span className={cn('mt-1 text-[9.5px] font-semibold uppercase tracking-[0.22em]', sub)}>
          North Florida
        </span>
      </span>
    </span>
  );
};
