/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primarytheme: {
          DEFAULT: 'hsl(var(--primarytheme))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        /* Diversity Roofing marketing-site design system (see .dr-site in index.css) */
        dr: {
          navy: 'hsl(var(--dr-navy))',
          'navy-2': 'hsl(var(--dr-navy-2))',
          'navy-3': 'hsl(var(--dr-navy-3))',
          mist: 'hsl(var(--dr-mist))',
          paper: 'hsl(var(--dr-paper))',
          cream: 'hsl(var(--dr-cream))',
          ink: 'hsl(var(--dr-ink))',
          slate: 'hsl(var(--dr-slate))',
          line: 'hsl(var(--dr-line))',
          amber: 'hsl(var(--dr-amber))',
          'amber-deep': 'hsl(var(--dr-amber-deep))'
        }
      },
      fontFamily: {
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        },
        /* Marketing-site motion (magic-ui / animata style, CSS-only) */
        'dr-marquee': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' }
        },
        'dr-shimmer': {
          from: { transform: 'translateX(-150%) skewX(-12deg)' },
          to: { transform: 'translateX(250%) skewX(-12deg)' }
        },
        'dr-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'dr-marquee': 'dr-marquee 45s linear infinite',
        'dr-shimmer': 'dr-shimmer 2.75s ease-in-out infinite',
        'dr-float': 'dr-float 7s ease-in-out infinite'
      }
    }
  },
  plugins: [tailwindcssAnimate]
};
