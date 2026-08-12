/**
 * Diversity Roofing — public marketing website.
 * Route: /website (no auth, no CRM chrome — Layout bypasses this path).
 */
import React from 'react';
import {
  ContactCTA,
  Hero,
  Process,
  ServiceArea,
  Services,
  SiteFooter,
  SiteNav,
  StatsBand,
  StormCallout,
  Testimonials
} from './sections';

const WebsitePage = () => {
  React.useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Diversity Roofing — Roof Replacement, Repairs & Storm Damage | North Florida';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="dr-site bg-dr-navy font-body">
      <SiteNav />
      <main>
        <Hero />
        <StatsBand />
        <Services />
        <Process />
        <StormCallout />
        <Testimonials />
        <ServiceArea />
        <ContactCTA />
      </main>
      <SiteFooter />
    </div>
  );
};

export default WebsitePage;
