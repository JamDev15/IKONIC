import { Link } from 'react-router-dom';
import { Sun, Building2, LayoutGrid, Signpost } from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

// ---------------------------------------------------------------------------
// HIDDEN 2026-08-29 — the vehicle-wrap photo/video gallery and the website-
// project showcase were removed when the site refocused on architectural
// window film & graphics. The old implementation (wrap + website tabs,
// lightbox, and the wrapGallery/websiteGallery data) is preserved in git
// history and the data files remain in src/data/. This page now shows the
// current work categories; swap in a real photo gallery when film/graphics/
// signage photography is ready.
// ---------------------------------------------------------------------------

const categories = [
  {
    icon: Sun,
    title: 'Architectural Window Film',
    blurb:
      'Heat, glare, UV, privacy, and security film on flat glass for homes and buildings across the Denver metro.',
    href: '/window-tint',
  },
  {
    icon: Building2,
    title: 'Commercial & Residential Tint',
    blurb:
      'West-facing rooms made usable, cooling load cut on office towers, and fade protection for floors and merchandise.',
    href: '/window-tint/office',
  },
  {
    icon: LayoutGrid,
    title: 'Storefront & Window Graphics',
    blurb:
      'Cut vinyl, full-color prints, frosted privacy film, perforated see-through film, wall murals, and interior branding.',
    href: '/storefront-graphics',
  },
  {
    icon: Signpost,
    title: 'Signage & Wayfinding',
    blurb:
      'Dimensional and illuminated letters, monument and blade signs, banners, and ADA-compliant wayfinding systems.',
    href: '/signage',
  },
];

export default function Gallery() {
  return (
    <div className="relative bg-charcoal min-h-screen">
      <PageSEO
        title="Our Work | Window Film, Graphics & Signage | ikonic303"
        description="A look at ikonic's work across the Denver metro — architectural window film, residential and commercial window tint, storefront and window graphics, signage, and wayfinding."
        canonical="/gallery"
      />
      <MatrixBackground />
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-12 px-[6vw] relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">OUR WORK</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            Film, Graphics &amp;<br />
            <span className="text-mint">Signage We&rsquo;ve Installed</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto">
            Window film for homes and buildings, storefront and window graphics, and signage
            across Wheat Ridge, Arvada, Lakewood, Golden, and greater Denver. A full photo
            gallery of recent installs is on the way &mdash; in the meantime, here&rsquo;s what we do.
          </p>
        </div>
      </section>

      {/* Category grid */}
      <section className="px-[6vw] pb-24 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((c) => (
            <Link
              key={c.title}
              to={c.href}
              className="group bg-charcoal-light border border-white/10 rounded-2xl p-8 hover:border-mint/40 transition-colors"
            >
              <div className="w-14 h-14 bg-mint/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-mint/20 transition-colors">
                <c.icon className="w-7 h-7 text-mint" />
              </div>
              <h2 className="font-display text-xl font-bold text-offwhite mb-3">{c.title}</h2>
              <p className="text-offwhite-dark text-sm leading-relaxed">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Want This for Your Building?
          </h2>
          <p className="text-offwhite-dark mb-8">
            Book a free on-site consultation &mdash; we check the glass or walk the site and send one written quote.
          </p>
          <a href="/contact" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Get a Quote
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
