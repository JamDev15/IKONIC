import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageSEO from './components/PageSEO';
import MatrixBackground from './components/MatrixBackground';
import Navigation from './components/Navigation';
import HeroSection from './sections/HeroSection';
import { services } from './pages/services/serviceData';
import './App.css';

// Below-fold home sections — lazy loaded
const ServicesSection = lazy(() => import('./sections/ServicesSection'));
const AboutSection = lazy(() => import('./sections/AboutSection'));
const TestimonialsSection = lazy(() => import('./sections/TestimonialsSection'));
const ContactSection = lazy(() => import('./sections/ContactSection'));

// All route pages — lazy loaded
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const AllServices = lazy(() => import('./pages/AllServices'));
const LearnMore = lazy(() => import('./pages/LearnMore'));
const Careers = lazy(() => import('./pages/Careers'));
const Blogs = lazy(() => import('./pages/Blogs'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const ProofManager = lazy(() => import('./pages/ProofManager'));
const ProofClient = lazy(() => import('./pages/ProofClient'));
const Gallery = lazy(() => import('./pages/Gallery'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Service pages — one shared <ServicePage> renderer, driven by serviceData. Paths
// are unchanged from the old prerendered static HTML (/window-tint, /signage, …)
// so no SEO equity moves. Crawler shells live in scripts/prerender-routes.mjs.
const ServicePage = lazy(() => import('./pages/services/ServicePage'));

// ---------------------------------------------------------------------------
// HIDDEN 2026-08-29 — site refocused on architectural window film & graphics
// only (window film / residential + commercial tint / storefront + window
// graphics / signage). The pages below are digital-marketing, AI, print-shop,
// and book offerings that no longer fit that scope. Files are kept in
// src/pages/ (nothing deleted); their imports, <Route>s, and all nav/footer
// links are commented out so they are unreachable and unlinked. To bring one
// back, un-comment its import + <Route> here and restore its nav entry.
// ---------------------------------------------------------------------------
// const WebDesign = lazy(() => import('./pages/WebDesign'));
// const CRMAutomation = lazy(() => import('./pages/CRMAutomation'));
// const ReputationManagement = lazy(() => import('./pages/ReputationManagement'));
// const SpeedToLead = lazy(() => import('./pages/SpeedToLead'));
// const MarketingSystems = lazy(() => import('./pages/MarketingSystems'));
// const PrintAndShip = lazy(() => import('./pages/PrintAndShip'));
// const LostCallCalculator = lazy(() => import('./pages/LostCallCalculator'));
// const BrandedToWin = lazy(() => import('./pages/BrandedToWin'));
// const StickerBuilder = lazy(() => import('./pages/StickerBuilder'));
// const AIWebsiteGenerator = lazy(() => import('./pages/AIWebsiteGenerator'));
// ViralBot routes were already removed 2026-07-21 (security audit); pages remain
// in src/pages/ but are not wired up.

function HomePage() {
  return (
    <>
      <PageSEO
        title="Architectural Window Film, Tint & Graphics — Denver, CO | ikonic303"
        description="Denver architectural window film and graphics: residential and commercial window tint, storefront and window graphics, signage, and wayfinding. Designed, printed, and installed in-house. Call (720) 679-1230."
        canonical="/"
      />
      <Navigation />
      <main className="relative z-10">
        <HeroSection />
        {/* Reserve space while the below-fold section chunks load so the page
            doesn't collapse to the hero and then jump as each one arrives. */}
        <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
          <ServicesSection />
          <AboutSection />
          <TestimonialsSection />
          <ContactSection />
        </Suspense>
      </main>
    </>
  );
}

function App() {
  useEffect(() => {
    // Meta Pixel — inject immediately so it fires on every page load
    if (!(window as any).fbq) {
      const fbq: any = function() {
        fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
      };
      (window as any).fbq = fbq;
      (window as any)._fbq = fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);
      fbq('init', '694226731767712');
      fbq('track', 'PageView');
    }

    // Load all third-party widgets after 6s — well outside the TBT measurement window
    const t = setTimeout(() => {
      // GHL chat widget
      const scriptId = 'ghl-chat-widget-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://widgets.leadconnectorhq.com/loader.js';
        script.setAttribute('data-resources-url', 'https://widgets.leadconnectorhq.com/chat-widget/loader.js');
        script.setAttribute('data-widget-id', '69965105f3036706b875cf61');
        script.async = true;
        document.body.appendChild(script);
      }

      // HIDDEN 2026-08-29 — the scroll-triggered "Free GHL Checklist" popup form was a
      // digital-marketing lead magnet and no longer fits the site (architectural window
      // film & graphics only). The injection is disabled; the GHL form itself
      // (fz0LYqKFNeclNyuSnVZg) still exists in the CRM if it's ever wanted back.
    }, 6000);

    return () => clearTimeout(t);
  }, []);

  return (
    <Router>
      <div className="relative bg-charcoal min-h-screen">
        <MatrixBackground />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<AllServices />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/post/:slug" element={<BlogPost />} />

            {/* Service pages (same URLs as the former static HTML) */}
            <Route path="/window-tint" element={<ServicePage data={services.windowFilm} />} />
            <Route path="/window-tint/home" element={<ServicePage data={services.residentialTint} />} />
            <Route path="/window-tint/office" element={<ServicePage data={services.commercialTint} />} />
            <Route path="/storefront-graphics" element={<ServicePage data={services.storefrontGraphics} />} />
            <Route path="/signage" element={<ServicePage data={services.signage} />} />
            <Route path="/wayfinding" element={<ServicePage data={services.wayfinding} />} />
            <Route path="/proof-manager" element={<ProofManager />} />
            <Route path="/proof/:token" element={<ProofClient />} />
            <Route path="/gallery" element={<Gallery />} />
            {/* HIDDEN 2026-08-29 — off-scope pages (digital marketing, AI, print,
                book). Kept in src/pages/ but not routed. vercel.json 301-redirects
                these old paths to /services so the URLs never dead-end.
            <Route path="/services/web-design" element={<WebDesign />} />
            <Route path="/services/crm-automation" element={<CRMAutomation />} />
            <Route path="/services/reputation" element={<ReputationManagement />} />
            <Route path="/services/speed-to-lead" element={<SpeedToLead />} />
            <Route path="/services/marketing" element={<MarketingSystems />} />
            <Route path="/print-ship" element={<PrintAndShip />} />
            <Route path="/lost-call-calculator" element={<LostCallCalculator />} />
            <Route path="/branded-to-win" element={<BrandedToWin />} />
            <Route path="/sticker-builder" element={<StickerBuilder />} />
            <Route path="/ai-website-generator" element={<AIWebsiteGenerator />} />
            */}
            {/* Catch-all. Must stay LAST — react-router matches in order. */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
