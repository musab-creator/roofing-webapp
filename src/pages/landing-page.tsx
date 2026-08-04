import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  ShieldCheck,
  Star,
  ArrowRight,
  Home,
  Wrench,
  CloudLightning,
  Search,
  Building2,
  Droplets,
  BadgeCheck,
  Clock,
  ThumbsUp,
  DollarSign,
  ChevronDown,
  CheckCircle2,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';
import Reveal from '../components/landing/reveal';
import HeroScene from '../components/landing/hero-scene';
import BgVideo from '../components/landing/bg-video';

const PHONE_DISPLAY = '(904) 979-0556';
const PHONE_HREF = 'tel:+19049790556';
const EMAIL = 'Jacksonville@diversity-roofing.com';

const services = [
  {
    icon: Home,
    title: 'Roof Replacement',
    desc: 'Full tear-off and installation with premium architectural shingles built to last decades.',
    accent: 'from-blue-500 to-blue-700'
  },
  {
    icon: Wrench,
    title: 'Roof Repair',
    desc: 'Fast, reliable fixes for leaks, missing shingles and flashing — done right the first time.',
    accent: 'from-amber-400 to-orange-600'
  },
  {
    icon: CloudLightning,
    title: 'Storm Damage',
    desc: 'Rapid response and insurance-claim support after wind, hail and heavy-storm damage.',
    accent: 'from-sky-500 to-indigo-600'
  },
  {
    icon: Search,
    title: 'Free Inspections',
    desc: 'Detailed drone and hands-on roof inspections with an honest, no-pressure report.',
    accent: 'from-emerald-500 to-teal-600'
  },
  {
    icon: Building2,
    title: 'Commercial Roofing',
    desc: 'Flat, TPO and metal systems for businesses — minimal downtime, maximum protection.',
    accent: 'from-violet-500 to-purple-700'
  },
  {
    icon: Droplets,
    title: 'Gutters & More',
    desc: 'Seamless gutters, soffit, fascia and ventilation to keep your whole home protected.',
    accent: 'from-cyan-500 to-blue-600'
  }
];

const features = [
  {
    icon: BadgeCheck,
    title: 'Licensed & Insured',
    desc: 'Fully credentialed crews you can trust on your property.'
  },
  {
    icon: ShieldCheck,
    title: 'Lifetime Warranty',
    desc: 'Manufacturer-backed materials and our own workmanship guarantee.'
  },
  {
    icon: Clock,
    title: '24/7 Storm Response',
    desc: 'Emergency tarping and repairs when you need them most.'
  },
  {
    icon: DollarSign,
    title: 'Flexible Financing',
    desc: 'Affordable monthly plans with $0-down options available.'
  },
  {
    icon: ThumbsUp,
    title: 'Insurance Specialists',
    desc: 'We handle the paperwork and fight for a fair claim.'
  },
  {
    icon: Star,
    title: '5-Star Reputation',
    desc: 'Hundreds of happy homeowners across the region.'
  }
];

const steps = [
  {
    n: '01',
    title: 'Free Inspection',
    desc: 'We assess your roof and give you a clear, honest report — no obligation.'
  },
  {
    n: '02',
    title: 'Custom Quote',
    desc: 'Transparent pricing and material options tailored to your home and budget.'
  },
  {
    n: '03',
    title: 'Expert Installation',
    desc: 'Our certified crews get it done fast, clean and to code.'
  },
  {
    n: '04',
    title: 'Final Walkthrough',
    desc: 'We inspect together and back it with our workmanship warranty.'
  }
];

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Homeowner',
    quote:
      'Diversity Roofing replaced our entire roof in two days. The crew was professional, clean, and the new roof looks incredible. Highly recommend!',
    initials: 'SM'
  },
  {
    name: 'James R.',
    role: 'Business Owner',
    quote:
      'They handled our commercial building and the insurance claim after a storm. Stress-free from start to finish and a beautiful result.',
    initials: 'JR'
  },
  {
    name: 'Priya K.',
    role: 'Homeowner',
    quote:
      'Honest inspection, fair price, and no upselling. The team went above and beyond. Our home has never looked better.',
    initials: 'PK'
  }
];

const stats = [
  { value: '500+', label: 'Roofs Installed' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '15+', label: 'Years Experience' },
  { value: '100%', label: 'Satisfaction Focus' }
];

const faqs = [
  {
    q: 'How much does a new roof cost?',
    a: 'Every roof is different. Size, pitch, materials and existing damage all factor in. We provide a detailed, no-obligation quote after a free inspection so you know exactly what to expect — no surprises.'
  },
  {
    q: 'Do you help with insurance claims?',
    a: 'Yes. Storm and hail damage is often covered by your homeowner’s policy. Our specialists document everything and work directly with your adjuster to get you a fair settlement.'
  },
  {
    q: 'How long does a roof replacement take?',
    a: 'Most residential roofs are completed in 1–3 days depending on size and weather. We’ll give you a clear timeline up front and keep the job site clean throughout.'
  },
  {
    q: 'What areas do you serve?',
    a: 'We proudly serve homeowners and businesses throughout Jacksonville, Florida and the surrounding communities. Call us to confirm coverage for your address.'
  }
];

function BrandLogo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30 ring-1 ring-white/20 overflow-hidden"
      style={{ width: size, height: size }}>
      <img
        src="/company-logo.png"
        alt="Diversity Roofing logo"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);
  const [formSent, setFormSent] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: 'Services', href: '#services' },
    { label: 'Why Us', href: '#why' },
    { label: 'Process', href: '#process' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'FAQ', href: '#faq' }
  ];

  return (
    <div className="w-full bg-slate-950 text-slate-100 antialiased">
      {/* Top announcement bar */}
      <div className="hidden bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs font-medium tracking-wide">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Licensed &amp; Insured · Free Estimates · 24/7 Storm
            Response
          </span>
          <a href={PHONE_HREF} className="flex items-center gap-2 transition hover:text-amber-300">
            <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
          </a>
        </div>
      </div>

      {/* Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'border-b border-white/10 bg-slate-950/80 backdrop-blur-xl' : 'bg-transparent'
        }`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-6">
          <a href="#top" className="flex items-center gap-3">
            <BrandLogo />
            <div className="leading-tight">
              <p className="text-base font-extrabold tracking-tight text-white">
                Diversity <span className="text-amber-400">Roofing</span>
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
                Roof Right. Roof Once.
              </p>
            </div>
          </a>

          <div className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-300 transition hover:text-white">
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 transition hover:text-white">
              Client Login
            </Link>
            <a
              href="#quote"
              className="dr-shine inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-orange-500/30 transition hover:shadow-orange-500/50">
              Free Estimate <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg text-white lg:hidden"
            aria-label="Toggle menu">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-white/10 bg-slate-950/95 px-5 py-4 lg:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-200 transition hover:bg-white/5">
                  {item.label}
                </a>
              ))}
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-200 transition hover:bg-white/5">
                Client Login
              </Link>
              <a
                href="#quote"
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-base font-bold text-slate-900">
                Get Free Estimate <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ============================ HERO ============================ */}
      <section id="top" className="relative overflow-hidden">
        {/* Layered gradient / graphic backdrop */}
        <div className="dr-hero-gradient absolute inset-0 bg-[radial-gradient(1200px_600px_at_70%_-10%,#1e40af_0%,transparent_55%),radial-gradient(900px_500px_at_10%_20%,#0c4a6e_0%,transparent_50%),linear-gradient(180deg,#020617_0%,#0b1220_100%)]" />
        {/* Ambient hero video (renders only when /videos/hero-bg.mp4 exists) */}
        <BgVideo
          src="/videos/hero-bg.mp4"
          className="opacity-40"
          overlayClassName="bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/80"
        />
        <div className="dr-grid-bg absolute inset-0 opacity-40" />
        <div className="absolute -left-20 top-40 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -right-16 top-10 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:pb-28 lg:pt-20">
          <div className="max-w-xl">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Rated 4.9 / 5 by
                local homeowners
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                A roof that
                <span className="relative mx-2 inline-block">
                  <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                    protects
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 12"
                    fill="none"
                    preserveAspectRatio="none">
                    <path
                      d="M2 9 C50 2 150 2 198 9"
                      stroke="#f59e0b"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                what matters most.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 text-lg leading-relaxed text-slate-300">
                Premium residential &amp; commercial roofing done right — the first time. Free
                inspections, honest pricing, and a lifetime workmanship guarantee from a crew your
                neighbors trust.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#quote"
                  className="dr-shine inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-7 py-3.5 text-base font-bold text-slate-900 shadow-xl shadow-orange-500/30 transition hover:scale-[1.02]">
                  Get Your Free Estimate <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href={PHONE_HREF}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10">
                  <Phone className="h-5 w-5" /> {PHONE_DISPLAY}
                </a>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Licensed &amp; Insured
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Lifetime Warranty
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Financing Available
                </span>
              </div>
            </Reveal>
          </div>

          {/* Hero graphic */}
          <div className="relative">
            <div className="dr-anim-float-slow relative">
              <HeroScene className="w-full max-w-xl mx-auto drop-shadow-2xl" />
            </div>

            {/* Floating glass stat cards */}
            <div className="dr-anim-float absolute -left-2 top-6 hidden rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md sm:block">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Lifetime</p>
                  <p className="text-[11px] text-slate-300">Warranty</p>
                </div>
              </div>
            </div>
            <div
              className="dr-anim-float absolute -right-1 bottom-10 hidden rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md sm:block"
              style={{ animationDelay: '1.2s' }}>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20">
                  <Star className="h-5 w-5 fill-amber-300 text-amber-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">4.9 / 5</p>
                  <p className="text-[11px] text-slate-300">500+ Reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roof-line divider */}
        <svg
          className="relative block w-full text-white"
          viewBox="0 0 1440 80"
          fill="none"
          preserveAspectRatio="none">
          <path d="M0 80 L720 12 L1440 80 Z" fill="currentColor" />
        </svg>
      </section>

      {/* ============================ STATS ============================ */}
      <section className="bg-white text-slate-900">
        <div className="mx-auto max-w-7xl px-5 pb-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-white p-6 text-center shadow-sm ring-1 ring-slate-100">
                  <p className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
                    {s.value}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-500">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ SERVICES ============================ */}
      <section id="services" className="bg-white py-20 text-slate-900 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">What We Do</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Complete roofing services, <span className="text-blue-600">start to finish</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              From a quick repair to a full replacement, our certified crews handle it all with
              craftsmanship you can count on.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <Reveal key={svc.title} delay={(i % 3) * 100}>
                  <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-600/10">
                    <div
                      className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${svc.accent} opacity-10 transition-transform duration-500 group-hover:scale-150`}
                    />
                    <div
                      className={`relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${svc.accent} text-white shadow-lg`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="relative mt-5 text-xl font-bold">{svc.title}</h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-slate-600">
                      {svc.desc}
                    </p>
                    <a
                      href="#quote"
                      className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition group-hover:gap-2.5">
                      Learn more <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ WHY US ============================ */}
      <section id="why" className="relative overflow-hidden bg-slate-950 py-20 text-white sm:py-24">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
              Why Diversity Roofing
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Built on trust. Backed by a guarantee.
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              We treat every roof like it’s our own home. Here’s why homeowners keep choosing us.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={(i % 3) * 100}>
                  <div className="group flex h-full items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-amber-400/30 hover:bg-white/[0.08]">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg transition group-hover:from-amber-400 group-hover:to-orange-500 group-hover:text-slate-900">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{f.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-300">{f.desc}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ PROCESS ============================ */}
      <section id="process" className="bg-white py-20 text-slate-900 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              How It Works
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Four simple steps to a better roof
            </h2>
          </Reveal>

          <div className="relative mt-16 grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Connector line */}
            <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-amber-300 md:block" />
            {steps.map((step, i) => (
              <Reveal key={step.n} delay={i * 120} className="relative">
                <div className="relative flex flex-col items-center text-center">
                  <div className="z-10 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-xl font-black text-white shadow-xl shadow-blue-600/30">
                    {step.n}
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ GALLERY ============================ */}
      <section id="gallery" className="bg-slate-50 py-20 text-slate-900 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">Our Work</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Craftsmanship you can see
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              A glimpse of the roofs we’ve transformed across the community.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Architectural Shingle Replacement',
                tag: 'Residential',
                g: 'from-blue-600 to-indigo-800'
              },
              {
                title: 'Standing Seam Metal Roof',
                tag: 'Modern Home',
                g: 'from-slate-700 to-slate-900'
              },
              {
                title: 'Storm Damage Restoration',
                tag: 'Insurance Claim',
                g: 'from-amber-500 to-orange-700'
              },
              { title: 'Commercial TPO System', tag: 'Commercial', g: 'from-cyan-600 to-blue-800' },
              {
                title: 'Full Tear-Off & Rebuild',
                tag: 'Residential',
                g: 'from-emerald-600 to-teal-800'
              },
              {
                title: 'Gutter & Fascia Package',
                tag: 'Add-On',
                g: 'from-violet-600 to-purple-800'
              }
            ].map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 100}>
                <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl shadow-md">
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.g}`} />
                  {/* Stylized roof graphic */}
                  <svg
                    className="absolute inset-0 h-full w-full opacity-90"
                    viewBox="0 0 400 300"
                    fill="none">
                    <path d="M0 300 L200 120 L400 300 Z" fill="rgba(255,255,255,0.10)" />
                    <path d="M60 300 L200 175 L340 300 Z" fill="rgba(255,255,255,0.14)" />
                    <g stroke="rgba(255,255,255,0.25)" strokeWidth="2">
                      <path d="M90 300 L200 200 L310 300" fill="none" />
                      <path d="M110 280 L200 200 L290 280" fill="none" />
                      <path d="M130 260 L200 200 L270 260" fill="none" />
                    </g>
                    <circle cx="330" cy="60" r="26" fill="rgba(255,255,255,0.5)" />
                  </svg>
                  {/* Project video (renders only when /videos/work-N.mp4 exists) */}
                  <BgVideo
                    src={`/videos/work-${i + 1}.mp4`}
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                      {p.tag}
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-white">{p.title}</h3>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ REVIEWS ============================ */}
      <section id="reviews" className="bg-white py-20 text-slate-900 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">Reviews</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Homeowners love the results
            </h2>
            <div className="mt-4 flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 font-semibold text-slate-600">4.9 out of 5</span>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 120}>
                <figure className="flex h-full flex-col rounded-3xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-7 shadow-sm">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-700">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-sm font-bold text-white">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ QUOTE / CONTACT ============================ */}
      <section
        id="quote"
        className="relative overflow-hidden bg-slate-950 py-20 text-white sm:py-24">
        <div className="dr-hero-gradient absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_0%,#1e40af_0%,transparent_55%),radial-gradient(700px_500px_at_90%_100%,#b45309_0%,transparent_50%),linear-gradient(180deg,#020617,#0b1220)]" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
              Free Estimate
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Ready for a roof that lasts?
            </h2>
            <p className="mt-4 max-w-md text-lg text-slate-300">
              Tell us about your project and we’ll reach out within 24 hours with a free,
              no-pressure inspection and quote.
            </p>

            <div className="mt-8 space-y-4">
              <a
                href={PHONE_HREF}
                className="flex items-center gap-4 text-slate-200 transition hover:text-white">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
                  <Phone className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Call us</p>
                  <p className="text-lg font-bold">{PHONE_DISPLAY}</p>
                </div>
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-4 text-slate-200 transition hover:text-white">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
                  <Mail className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Email us</p>
                  <p className="text-lg font-bold">{EMAIL}</p>
                </div>
              </a>
              <div className="flex items-center gap-4 text-slate-200">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
                  <MapPin className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Service area</p>
                  <p className="text-lg font-bold">Jacksonville, FL &amp; surrounding areas</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl sm:p-8">
              {formSent ? (
                <div className="flex h-full min-h-[380px] flex-col items-center justify-center text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/20">
                    <CheckCircle2 className="h-9 w-9 text-emerald-400" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold">Thank you!</h3>
                  <p className="mt-2 max-w-xs text-slate-300">
                    Your request is in. Our team will reach out within 24 hours to schedule your
                    free inspection.
                  </p>
                  <button
                    onClick={() => setFormSent(false)}
                    className="mt-6 text-sm font-semibold text-amber-400 hover:text-amber-300">
                    Send another request
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFormSent(true);
                  }}
                  className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Full name">
                      <input required type="text" placeholder="Jane Doe" className="dr-input" />
                    </Field>
                    <Field label="Phone">
                      <input
                        required
                        type="tel"
                        placeholder="(904) 555-0123"
                        className="dr-input"
                      />
                    </Field>
                  </div>
                  <Field label="Email">
                    <input
                      required
                      type="email"
                      placeholder="jane@email.com"
                      className="dr-input"
                    />
                  </Field>
                  <Field label="Service needed">
                    <div className="relative">
                      <select required defaultValue="" className="dr-input appearance-none pr-10">
                        <option value="" disabled>
                          Select a service…
                        </option>
                        {services.map((s) => (
                          <option key={s.title} value={s.title} className="text-slate-900">
                            {s.title}
                          </option>
                        ))}
                        <option value="Other" className="text-slate-900">
                          Other / Not sure
                        </option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    </div>
                  </Field>
                  <Field label="Project details">
                    <textarea
                      rows={3}
                      placeholder="Tell us a little about your roof…"
                      className="dr-input resize-none"
                    />
                  </Field>
                  <button
                    type="submit"
                    className="dr-shine mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3.5 text-base font-bold text-slate-900 shadow-xl shadow-orange-500/30 transition hover:scale-[1.01]">
                    Request My Free Estimate <ArrowRight className="h-5 w-5" />
                  </button>
                  <p className="text-center text-xs text-slate-400">
                    No spam, ever. We respect your privacy.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ FAQ ============================ */}
      <section id="faq" className="bg-white py-20 text-slate-900 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <Reveal className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">FAQ</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Questions? We’ve got answers.
            </h2>
          </Reveal>
          <div className="mt-12 space-y-3">
            {faqs.map((item, i) => {
              const open = openFaq === i;
              return (
                <Reveal key={item.q} delay={i * 70}>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                      <span className="text-base font-bold sm:text-lg">{item.q}</span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-blue-600 transition-transform duration-300 ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ${
                        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}>
                      <div className="overflow-hidden">
                        <p className="px-6 pb-5 text-slate-600">{item.a}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ CTA BAND ============================ */}
      <section className="bg-white pb-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-8 py-12 text-center shadow-2xl shadow-blue-600/30 sm:px-12 sm:py-14">
              <div className="dr-grid-bg absolute inset-0 opacity-30" />
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/30 blur-2xl" />
              <div className="relative">
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Protect your home today.
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-blue-100">
                  Book your free, no-obligation roof inspection with Diversity Roofing.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href="#quote"
                    className="dr-shine inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-3.5 text-base font-bold text-slate-900 shadow-xl transition hover:scale-[1.02]">
                    Get Free Estimate <ArrowRight className="h-5 w-5" />
                  </a>
                  <a
                    href={PHONE_HREF}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-white/10">
                    <Phone className="h-5 w-5" /> {PHONE_DISPLAY}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ FOOTER ============================ */}
      <footer className="border-t border-white/10 bg-slate-950 py-14 text-slate-300">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <BrandLogo />
                <p className="text-lg font-extrabold text-white">
                  Diversity <span className="text-amber-400">Roofing</span>
                </p>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                Premium residential and commercial roofing built on honesty, craftsmanship and a
                lifetime workmanship guarantee. Roof right. Roof once.
              </p>
              <div className="mt-5 flex gap-3">
                {[Facebook, Instagram, Youtube].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-amber-400/40 hover:text-amber-400"
                    aria-label="Social link">
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-white">Services</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {services.map((s) => (
                  <li key={s.title}>
                    <a href="#services" className="text-slate-400 transition hover:text-white">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-white">Get in touch</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a
                    href={PHONE_HREF}
                    className="flex items-center gap-2 text-slate-400 transition hover:text-white">
                    <Phone className="h-4 w-4 text-amber-400" /> {PHONE_DISPLAY}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="flex items-center gap-2 text-slate-400 transition hover:text-white">
                    <Mail className="h-4 w-4 text-amber-400" /> {EMAIL}
                  </a>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <MapPin className="h-4 w-4 text-amber-400" /> Jacksonville, FL
                </li>
                <li className="pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 font-semibold text-slate-300 transition hover:text-white">
                    Client Login <ArrowRight className="h-4 w-4" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
            <p>© {new Date().getFullYear()} Diversity Roofing. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Licensed &amp; Insured
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-200">{label}</span>
      {children}
    </label>
  );
}
