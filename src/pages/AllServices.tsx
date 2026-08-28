import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sun, Building2, LayoutGrid, Signpost, Shield, Home, ArrowRight, Phone, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

gsap.registerPlugin(ScrollTrigger);

// Service pages are React Router routes (src/pages/services) — internal <Link>s.

const services = [
  {
    icon: Sun,
    title: 'Architectural Window Film',
    description: 'Flat-glass film for homes and buildings — heat, glare, UV, privacy, and security.',
    features: ['Heat & glare rejection', '99% UV blocking', 'Privacy & security films', 'Glass compatibility checked'],
    link: '/window-tint'
  },
  {
    icon: Home,
    title: 'Residential Window Tint',
    description: 'Fix hot rooms, faded floors, and harsh afternoon light without changing your home’s look.',
    features: ['West-facing room relief', 'Fade protection', 'Low-profile finish', 'Lifetime film warranty'],
    link: '/window-tint/home'
  },
  {
    icon: Building2,
    title: 'Commercial Window Tint',
    description: 'Cut cooling costs and screen glare across offices, clinics, and multi-tenant buildings.',
    features: ['Lower cooling load', 'Screen-glare control', 'Tenant-consistent look', 'After-hours install'],
    link: '/window-tint/office'
  },
  {
    icon: LayoutGrid,
    title: 'Storefront & Window Graphics',
    description: 'Window graphics, frosted privacy vinyl, perforated film, wall murals, and interior branding.',
    features: ['Cut vinyl & full-color prints', 'Frosted & etched looks', 'See-through perforated film', 'Wall & feature-wall murals'],
    link: '/storefront-graphics'
  },
  {
    icon: Signpost,
    title: 'Signage & Visual Graphics',
    description: 'Storefront and building signage designed, fabricated, and installed on-site.',
    features: ['Dimensional & lit letters', 'Monument & blade signs', 'Banners & event graphics', 'Permit drawings handled'],
    link: '/signage'
  },
  {
    icon: Shield,
    title: 'Wayfinding & ADA Signage',
    description: 'Directional, room ID, and ADA-compliant signage systems for offices and campuses.',
    features: ['ADA-compliant room ID', 'Directional systems', 'Parking & exterior wayfinding', 'Brand-matched design'],
    link: '/wayfinding'
  }
];

export default function AllServices() {
  const heroRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative bg-charcoal min-h-screen">
      <PageSEO
        title="Window Film & Graphics Services Denver CO | ikonic303"
        description="Architectural window film, residential and commercial window tint, storefront and window graphics, signage, and wayfinding for the Denver metro. Designed, printed, and installed in-house."
        canonical="/services"
      />
      <MatrixBackground />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-[6vw] relative z-10">
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">OUR SERVICES</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            The Visible Skin of<br />
            <span className="text-mint">Your Building</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto mb-8">
            Architectural window film, storefront and window graphics, signage, and wayfinding
            for the Denver metro — designed, printed, and installed by one Wheat Ridge shop so
            every surface matches.
          </p>
          <a href="/contact" className="btn-primary inline-flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Get a Free On-Site Quote
          </a>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div 
                key={index}
                className="bg-charcoal border border-white/10 rounded-xl p-8 hover:border-mint/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-mint/10 rounded-lg flex items-center justify-center mb-6">
                  <service.icon className="w-7 h-7 text-mint" />
                </div>
                
                <h3 className="font-display text-xl font-bold text-offwhite mb-3">
                  {service.title}
                </h3>
                
                <p className="text-offwhite-dark text-sm mb-6">
                  {service.description}
                </p>
                
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2 text-sm text-offwhite-dark">
                      <Check className="w-4 h-4 text-mint" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link
                  to={service.link}
                  className="inline-flex items-center gap-2 text-mint text-sm font-medium hover:gap-3 transition-all"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            Why Choose <span className="text-mint">Ikonic</span>?
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            Not a broker and not a franchise — the shop that does the work.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'In-House, End to End', desc: 'Design, printing, and installation under one roof — no subcontractors.' },
              { title: 'Glass Checked First', desc: 'We confirm your windows against the film compatibility chart before quoting.' },
              { title: 'One Consistent Look', desc: 'Film, graphics, and signage from the same team so every surface matches.' }
            ].map((item, index) => (
              <div key={index} className="bg-charcoal-light border border-white/10 rounded-xl p-6 text-center">
                <h3 className="font-display text-lg font-bold text-offwhite mb-3">{item.title}</h3>
                <p className="text-offwhite-dark text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-offwhite-dark mb-8">
            Book a free on-site consultation and we'll scope the film, graphics, or signage your building needs.
          </p>
          <a href="/contact" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            <Phone className="w-5 h-5" />
            Call (720) 679-1230
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
