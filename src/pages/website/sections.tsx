/**
 * Diversity Roofing — marketing site sections.
 * Built with the claude-design / 21st-dev / vercel-v0 / magic-ui /
 * motionshop / animata skills. Motion primitives live in
 * src/components/website/motion.tsx.
 *
 * CONTENT TODOs (marked inline): stats, testimonials, phone number and
 * license number are placeholders — swap in real figures before launch.
 */
import React from 'react';
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Check,
  ClipboardCheck,
  Clock,
  CloudLightning,
  Gem,
  Home,
  Mail,
  MapPin,
  ShieldCheck,
  Star,
  Wrench
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { BrandLogo } from '../../components/website/brand-logo';
import {
  BlurFade,
  Marquee,
  NumberTicker,
  ShimmerLink,
  TiltCard,
  useParallax
} from '../../components/website/motion';

const BOOKING_URL = 'https://www.diversity-roofing.com/appointments';
const CONTACT_EMAIL = 'musab@diversity-roofing.com';

/* ---------------------------------------------------------------- */
/* Navbar                                                            */
/* ---------------------------------------------------------------- */
export const SiteNav = () => {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#services', label: 'Services' },
    { href: '#process', label: 'Process' },
    { href: '#storm', label: 'Storm & Insurance' },
    { href: '#reviews', label: 'Reviews' },
    { href: '#areas', label: 'Service Area' }
  ];

  return (
    <nav
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-white/10 bg-dr-navy/85 py-2.5 backdrop-blur-xl'
          : 'bg-transparent py-4'
      )}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5">
        <a href="#top" aria-label="Diversity Roofing — home">
          <BrandLogo tone="dark" />
        </a>
        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-dr-mist transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
        </div>
        <a
          href={BOOKING_URL}
          className="inline-flex items-center gap-2 rounded-lg bg-dr-amber px-4 py-2 text-sm font-bold text-dr-navy transition-transform hover:-translate-y-0.5">
          <CalendarCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Free Inspection</span>
          <span className="sm:hidden">Book</span>
        </a>
      </div>
    </nav>
  );
};

/* ---------------------------------------------------------------- */
/* Hero — parallax navy sky, layered rooflines, floating tilt card   */
/* ---------------------------------------------------------------- */
export const Hero = () => {
  const ref = useParallax<HTMLElement>();

  return (
    <header id="top" ref={ref} className="relative overflow-hidden bg-dr-navy">
      {/* Ambient glow + faint grid, drifting slower than content */}
      <div
        data-speed="0.25"
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-dr-amber/15 blur-[130px]"
      />
      <div
        data-speed="0.15"
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-24 h-[28rem] w-[28rem] rounded-full bg-blue-500/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:56px_56px]"
      />

      <div className="relative mx-auto grid max-w-6xl gap-14 px-5 pb-40 pt-32 md:pb-52 md:pt-40 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
        <div>
          <BlurFade>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-dr-mist">
              <ShieldCheck className="h-3.5 w-3.5 text-dr-amber" />
              Licensed &amp; Insured · North Florida
            </p>
          </BlurFade>
          <BlurFade delay={90}>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Roofs built to
              <span className="relative mx-3 inline-block text-dr-amber">
                outlast
                <svg
                  aria-hidden="true"
                  viewBox="0 0 120 12"
                  className="absolute -bottom-2 left-0 w-full"
                  preserveAspectRatio="none">
                  <path
                    d="M2 9 Q60 1 118 8"
                    stroke="hsl(var(--dr-amber))"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.6"
                  />
                </svg>
              </span>
              the storm.
            </h1>
          </BlurFade>
          <BlurFade delay={180}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-dr-mist">
              Residential, designer, and commercial roofing for Jacksonville, St.&nbsp;Augustine,
              Orange Park, and surrounding communities. From minor repairs to full replacements —
              simple, transparent, and stress-free.
            </p>
          </BlurFade>
          <BlurFade delay={270}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <ShimmerLink href={BOOKING_URL}>
                Schedule Free Inspection
                <ArrowRight className="h-4 w-4" />
              </ShimmerLink>
              <a
                href="#services"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5">
                Explore Services
              </a>
            </div>
          </BlurFade>
          <BlurFade delay={360}>
            <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-dr-mist">
              {['Insurance claims handled', 'Storm damage specialists', 'Top-grade materials'].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-dr-amber" />
                    {t}
                  </li>
                )
              )}
            </ul>
          </BlurFade>
        </div>

        {/* Floating 3D-tilt inspection card (motionshop rung 1) */}
        <div className="relative hidden lg:block">
          <div data-speed="-0.06" className="animate-dr-float">
            <TiltCard className="mx-auto mt-6 max-w-sm">
              <div className="rounded-2xl border border-white/12 bg-dr-navy-2/90 p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.65)] backdrop-blur">
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-bold text-white">
                    Free 21-Point Inspection
                  </p>
                  <span className="rounded-full bg-dr-amber/15 px-2.5 py-1 text-[11px] font-bold text-dr-amber">
                    $0
                  </span>
                </div>
                <ul className="mt-5 space-y-3.5">
                  {[
                    'Shingles, flashing & penetrations',
                    'Gutters, downspouts & siding',
                    'Attic & ceiling moisture check',
                    'Photo report + honest quote'
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-dr-mist">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dr-amber/15">
                        <Check className="h-3 w-3 text-dr-amber" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-white/10 pt-4 text-xs text-dr-mist">
                  Mon–Fri 8am–6pm · Sat 9am–2pm
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>

      {/* Layered parallax rooflines */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0">
        <svg
          data-speed="0.08"
          viewBox="0 0 1440 140"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-28 w-full text-dr-navy-3/60 md:h-36">
          <path
            fill="currentColor"
            d="M0 140 V96 l90-38 90 38 40-16 80 34 60-52 120 52 70-28 90 38 80-60 140 60 60-24 90 38 60-46 120 46 90-38 60 24 40-10V140Z"
          />
        </svg>
        <svg
          data-speed="0.03"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-20 w-full text-dr-navy-2 md:h-28">
          <path
            fill="currentColor"
            d="M0 120 V70 l120-46 120 46 60-22 100 40 80-58 140 58 80-30 110 44 90-64 150 64 80-32 110 44 60-18 40 14V120Z"
          />
        </svg>
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-14 w-full text-dr-paper md:h-20">
          <path
            fill="currentColor"
            d="M0 90 V60 l180-40 200 44 160-30 220 36 200-44 240 44 240-28V90Z"
          />
        </svg>
      </div>
    </header>
  );
};

/* ---------------------------------------------------------------- */
/* Stats band — v0-style KPI row with number tickers                 */
/* ---------------------------------------------------------------- */
export const StatsBand = () => {
  // TODO: replace with real company figures before launch.
  const stats: {
    value: number;
    prefix?: string;
    suffix: string;
    label: string;
    decimals?: number;
  }[] = [
    { value: 24, suffix: 'hr', label: 'Storm response time' },
    { value: 21, suffix: '-pt', label: 'Free roof inspection' },
    { value: 100, suffix: '%', label: 'Licensed & insured crews' },
    { value: 0, prefix: '$', suffix: '', label: 'Cost for estimates & inspections' }
  ];

  return (
    <section className="bg-dr-paper">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-5 py-16 md:grid-cols-4 md:py-20">
        {stats.map((s, i) => (
          <BlurFade key={s.label} delay={i * 80}>
            <div className="text-center">
              <p className="font-display text-4xl font-extrabold tracking-tight text-dr-ink md:text-5xl">
                <NumberTicker
                  value={s.value}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  decimals={s.decimals ?? 0}
                />
              </p>
              <p className="mt-2 text-sm font-medium text-dr-slate">{s.label}</p>
            </div>
          </BlurFade>
        ))}
      </div>
    </section>
  );
};

/* ---------------------------------------------------------------- */
/* Services — bento grid with animata-style hover treatment          */
/* ---------------------------------------------------------------- */
type Service = {
  icon: React.ElementType;
  title: string;
  desc: string;
  span?: string;
  featured?: boolean;
};

const services: Service[] = [
  {
    icon: Home,
    title: 'Roof Replacement',
    desc: 'Full tear-off and replacement built to last, using top-grade materials and proven techniques — with clear pricing before we start.',
    span: 'md:col-span-2',
    featured: true
  },
  {
    icon: CloudLightning,
    title: 'Storm Damage & Insurance',
    desc: 'We document the damage, handle the insurance claim, and restore your roof — one team, start to finish.'
  },
  {
    icon: Wrench,
    title: 'Roof Repairs',
    desc: 'Leaks, missing shingles, flashing failures — fast, reliable fixes that solve the real problem.'
  },
  {
    icon: ClipboardCheck,
    title: 'Inspections & Maintenance',
    desc: 'Roof, gutters, downspouts, siding, plus attic and ceiling moisture checks — catch issues before they spread.'
  },
  {
    icon: Gem,
    title: 'Designer Roofing',
    desc: 'Architectural and designer shingle systems that lift your curb appeal along with your protection.'
  },
  {
    icon: Building2,
    title: 'Commercial Roofing',
    desc: 'Dependable flat and low-slope systems for businesses that can’t afford downtime.'
  }
];

export const Services = () => (
  <section id="services" className="bg-dr-paper">
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-4 md:pb-32">
      <BlurFade>
        <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-dr-amber-deep">
          What we do
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center font-display text-3xl font-extrabold tracking-tight text-dr-ink md:text-4xl">
          Every roof. Every challenge. Handled.
        </h2>
      </BlurFade>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {services.map((s, i) => (
          <BlurFade key={s.title} delay={(i % 3) * 90} className={s.span}>
            <div
              className={cn(
                'group relative h-full overflow-hidden rounded-2xl border p-7 transition-all duration-300',
                'hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-24px_rgba(15,23,42,0.28)]',
                s.featured
                  ? 'border-dr-navy bg-dr-navy text-white'
                  : 'border-dr-line bg-white text-dr-ink'
              )}>
              {/* animata-style amber sweep underline */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-dr-amber transition-transform duration-300 ease-out group-hover:scale-x-100"
              />
              <span
                className={cn(
                  'inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                  s.featured
                    ? 'bg-dr-amber/15 text-dr-amber'
                    : 'bg-dr-cream text-dr-amber-deep group-hover:bg-dr-amber/15'
                )}>
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold tracking-tight">{s.title}</h3>
              <p
                className={cn(
                  'mt-2.5 text-sm leading-relaxed',
                  s.featured ? 'text-dr-mist' : 'text-dr-slate'
                )}>
                {s.desc}
              </p>
            </div>
          </BlurFade>
        ))}
        {/* CTA tile completes the bento grid */}
        <BlurFade delay={180} className="md:col-span-2">
          <a
            href={BOOKING_URL}
            className="group flex h-full items-center justify-between gap-6 rounded-2xl border-2 border-dashed border-dr-amber/50 bg-dr-amber/5 p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-dr-amber hover:bg-dr-amber/10">
            <div>
              <h3 className="font-display text-lg font-bold tracking-tight text-dr-ink">
                Not sure what your roof needs?
              </h3>
              <p className="mt-1.5 text-sm text-dr-slate">
                Start with a free inspection — we’ll tell you honestly, photos included.
              </p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-dr-amber text-dr-navy transition-transform duration-300 group-hover:translate-x-1.5">
              <ArrowRight className="h-5 w-5" />
            </span>
          </a>
        </BlurFade>
      </div>
    </div>
  </section>
);

/* ---------------------------------------------------------------- */
/* Process — 4 steps                                                 */
/* ---------------------------------------------------------------- */
const steps = [
  {
    n: '01',
    title: 'Inspect',
    desc: 'A free 21-point inspection of your roof, gutters, siding, and attic — with photos.'
  },
  {
    n: '02',
    title: 'Report & Quote',
    desc: 'A clear photo report and an honest, itemized quote. No pressure, no surprises.'
  },
  {
    n: '03',
    title: 'Build',
    desc: 'Licensed, insured crews install with top-grade materials and proven techniques.'
  },
  {
    n: '04',
    title: 'Clean-up & Warranty',
    desc: 'Magnet-swept yard, hauled debris, and warranty paperwork in your hand.'
  }
];

export const Process = () => (
  <section id="process" className="border-t border-dr-line bg-dr-cream">
    <div className="mx-auto max-w-6xl px-5 py-24 md:py-28">
      <BlurFade>
        <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-dr-amber-deep">
          How it works
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center font-display text-3xl font-extrabold tracking-tight text-dr-ink md:text-4xl">
          Simple. Transparent. Stress-free.
        </h2>
      </BlurFade>
      <div className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-dr-line md:block"
        />
        {steps.map((s, i) => (
          <BlurFade key={s.n} delay={i * 110}>
            <div className="relative">
              <span className="relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-dr-navy font-display text-base font-extrabold text-dr-amber shadow-lg">
                {s.n}
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-dr-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dr-slate">{s.desc}</p>
            </div>
          </BlurFade>
        ))}
      </div>
    </div>
  </section>
);

/* ---------------------------------------------------------------- */
/* Storm & insurance callout                                         */
/* ---------------------------------------------------------------- */
export const StormCallout = () => (
  <section id="storm" className="relative overflow-hidden bg-dr-navy">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-24 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full bg-dr-amber/10 blur-[110px]"
    />
    <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 md:py-28 lg:grid-cols-2">
      <div>
        <BlurFade>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-dr-mist">
            <CloudLightning className="h-3.5 w-3.5 text-dr-amber" />
            Storm damage
          </p>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Storm hit? We handle the insurance headache.
          </h2>
          <p className="mt-4 max-w-lg leading-relaxed text-dr-mist">
            After hail, wind, or hurricane damage, you shouldn’t have to fight your insurer alone.
            Our team documents everything, files with your insurance, and manages your claim while
            we make your roof whole again.
          </p>
        </BlurFade>
        <BlurFade delay={150}>
          <div className="mt-8">
            <ShimmerLink href={BOOKING_URL}>
              Get a Storm Damage Inspection
              <ArrowRight className="h-4 w-4" />
            </ShimmerLink>
          </div>
        </BlurFade>
      </div>
      <BlurFade delay={120}>
        <ul className="space-y-4">
          {[
            'Full photo documentation for your claim',
            'We work directly with your insurance company',
            'Emergency tarping & repairs to stop further damage',
            'Rebuilt with top-grade, storm-rated materials'
          ].map((t) => (
            <li
              key={t}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-colors hover:border-dr-amber/40">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dr-amber/15">
                <Check className="h-4 w-4 text-dr-amber" />
              </span>
              <span className="text-sm font-medium leading-relaxed text-white">{t}</span>
            </li>
          ))}
        </ul>
      </BlurFade>
    </div>
  </section>
);

/* ---------------------------------------------------------------- */
/* Testimonials — magic-ui marquee                                   */
/* ---------------------------------------------------------------- */
// TODO: replace these placeholder quotes with real Google/Facebook reviews.
const reviews = [
  {
    name: 'Homeowner · Jacksonville',
    text: 'Inspection was thorough and the quote was honest. New roof done in two days, yard spotless.'
  },
  {
    name: 'Homeowner · Orange Park',
    text: 'They handled our whole insurance claim after the storm. Zero stress on our end.'
  },
  {
    name: 'Homeowner · St. Augustine',
    text: 'Repaired a leak two other companies misdiagnosed. Fair price, fixed right.'
  },
  {
    name: 'Business owner · Jacksonville',
    text: 'Re-roofed our shop with no downtime for the business. Professional crew.'
  },
  {
    name: 'Homeowner · Fleming Island',
    text: 'Designer shingles completely transformed the house. Neighbors keep asking who did it.'
  },
  {
    name: 'Homeowner · Middleburg',
    text: 'Showed up when they said they would, finished when they said they would.'
  }
];

export const Testimonials = () => (
  <section id="reviews" className="bg-dr-paper">
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-24">
      <BlurFade>
        <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-dr-amber-deep">
          Reviews
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center font-display text-3xl font-extrabold tracking-tight text-dr-ink md:text-4xl">
          Neighbors who trusted us with their roof
        </h2>
      </BlurFade>
    </div>
    <div className="pb-24 md:pb-28">
      <Marquee className="mx-auto max-w-7xl">
        {reviews.map((r) => (
          <figure
            key={r.name}
            className="w-[19rem] shrink-0 rounded-2xl border border-dr-line bg-white p-6 shadow-sm">
            <div className="flex gap-1 text-dr-amber" aria-label="5 star review">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-4 text-sm leading-relaxed text-dr-ink">“{r.text}”</blockquote>
            <figcaption className="mt-4 text-xs font-semibold uppercase tracking-wide text-dr-slate">
              {r.name}
            </figcaption>
          </figure>
        ))}
      </Marquee>
    </div>
  </section>
);

/* ---------------------------------------------------------------- */
/* Service area                                                      */
/* ---------------------------------------------------------------- */
const areas = [
  'Jacksonville',
  'St. Augustine',
  'Orange Park',
  'Ponte Vedra',
  'Fleming Island',
  'Middleburg',
  'Green Cove Springs',
  'Nocatee'
];

export const ServiceArea = () => (
  <section id="areas" className="border-t border-dr-line bg-dr-cream">
    <div className="mx-auto max-w-6xl px-5 py-20 text-center md:py-24">
      <BlurFade>
        <p className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-dr-amber-deep">
          <MapPin className="h-4 w-4" />
          Proudly serving North Florida
        </p>
        <div className="mx-auto mt-7 flex max-w-3xl flex-wrap items-center justify-center gap-3">
          {areas.map((a, i) => (
            <BlurFade key={a} delay={i * 60}>
              <span className="rounded-full border border-dr-line bg-white px-5 py-2 text-sm font-semibold text-dr-ink transition-colors hover:border-dr-amber hover:text-dr-amber-deep">
                {a}
              </span>
            </BlurFade>
          ))}
        </div>
        <p className="mt-6 text-sm text-dr-slate">…and surrounding communities.</p>
      </BlurFade>
    </div>
  </section>
);

/* ---------------------------------------------------------------- */
/* Final CTA + contact                                               */
/* ---------------------------------------------------------------- */
export const ContactCTA = () => (
  <section id="contact" className="relative overflow-hidden bg-dr-navy">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-0 h-[24rem] w-[42rem] -translate-x-1/2 rounded-full bg-dr-amber/12 blur-[120px]"
    />
    <div className="relative mx-auto max-w-4xl px-5 py-24 text-center md:py-32">
      <BlurFade>
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-white md:text-5xl">
          Your roof has a lifespan.
          <br />
          <span className="text-dr-amber">Let’s find out where it is.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-dr-mist">
          Book a free, no-obligation inspection. You’ll get a photo report and an honest answer —
          even if that answer is “your roof is fine.”
        </p>
      </BlurFade>
      <BlurFade delay={140}>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <ShimmerLink href={BOOKING_URL}>
            Book My Free Inspection
            <ArrowRight className="h-4 w-4" />
          </ShimmerLink>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5">
            <Mail className="h-4 w-4" />
            {CONTACT_EMAIL}
          </a>
        </div>
      </BlurFade>
      <BlurFade delay={220}>
        <p className="mt-8 inline-flex items-center gap-2 text-sm text-dr-mist">
          <Clock className="h-4 w-4 text-dr-amber" />
          Mon–Fri 8:00am–6:00pm · Sat 9:00am–2:00pm
        </p>
      </BlurFade>
    </div>
  </section>
);

/* ---------------------------------------------------------------- */
/* Footer                                                            */
/* ---------------------------------------------------------------- */
export const SiteFooter = () => (
  <footer className="border-t border-white/10 bg-dr-navy">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 py-10 md:flex-row">
      <BrandLogo tone="dark" />
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-dr-mist">
        <a href="#services" className="transition-colors hover:text-white">
          Services
        </a>
        <a href="#process" className="transition-colors hover:text-white">
          Process
        </a>
        <a href="#reviews" className="transition-colors hover:text-white">
          Reviews
        </a>
        <a href={BOOKING_URL} className="transition-colors hover:text-white">
          Appointments
        </a>
      </div>
      {/* TODO: add FL roofing license number */}
      <p className="text-xs text-dr-mist/70">
        © {new Date().getFullYear()} Diversity Roofing. Licensed &amp; Insured.
      </p>
    </div>
  </footer>
);
