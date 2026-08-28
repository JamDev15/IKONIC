import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Phone, Check, Target, TrendingUp, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

gsap.registerPlugin(ScrollTrigger);

const howItWorks = [
  {
    step: '1',
    title: 'On-Site Check',
    description: 'We look at the actual glass or walk the site — glass type, orientation, condition, and what you want it to do.'
  },
  {
    step: '2',
    title: 'Written Quote',
    description: 'One number, with the specific film or material spec’d to your surface. No surprise add-ons later.'
  },
  {
    step: '3',
    title: 'Install',
    description: 'Dust-controlled prep, clean application, finished edges — scheduled after hours for businesses that need it.'
  },
  {
    step: '4',
    title: 'Warranty',
    description: 'Manufacturer film warranty plus our workmanship guarantee. We come back if anything isn’t right.'
  }
];

const benefits = [
  { icon: Clock, title: 'Lower Cooling Bills', desc: 'Heat-rejection film cuts the load on west- and south-facing glass all summer.' },
  { icon: TrendingUp, title: 'Protect Interiors', desc: '99% UV blocking slows fading on floors, furniture, and merchandise.' },
  { icon: Target, title: 'Privacy & Security', desc: 'Frosted, reflective, and safety films — comfort and protection without losing daylight.' },
  { icon: Shield, title: 'One Consistent Look', desc: 'Film, window graphics, and signage from one shop, so every surface matches.' }
];

export default function LearnMore() {
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
        title="How It Works | Window Film & Graphics Process | ikonic303"
        description="How ikonic scopes and installs architectural window film and graphics in the Denver metro: on-site glass check, one written quote, clean install, and a manufacturer-backed warranty."
        canonical="/learn-more"
      />
      <MatrixBackground />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-[6vw] relative z-10">
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">ABOUT OUR APPROACH</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            Checked First,<br />
            <span className="text-mint">Installed Clean</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto mb-8">
            The wrong film on the wrong glass can crack a pane or void its warranty. So every
            ikonic job starts with a look at the actual windows — then one written quote, a
            clean install, and a warranty behind it.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/contact" className="btn-primary inline-flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Get a Free On-Site Quote
            </a>
            <Link to="/services" className="btn-outline">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6 text-center">
            The Problem With <span className="text-mint">Quoting Blind</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Film applied to incompatible glass can crack the pane or fail the seal',
              'A phone quote misses orientation, glass type, and access',
              'Cheap film hazes, purples, or peels within a couple of Colorado summers',
              'Three vendors for tint, graphics, and signage means three different looks',
              'Surprise add-ons after the crew is already on site'
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-charcoal rounded-lg">
                <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-red-400 text-sm">✕</span>
                </div>
                <span className="text-offwhite-dark">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6 text-center">
            The <span className="text-mint">Ikonic</span> Way
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Every window checked against the film manufacturer’s compatibility chart',
              'Professional-grade film with a real manufacturer warranty',
              'One written quote — the number you see is the number you pay',
              'Dust-controlled prep and finished edges on every pane',
              'Film, graphics, and signage from one shop so it all matches'
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-charcoal-light rounded-lg border border-mint/30">
                <div className="w-6 h-6 bg-mint/20 rounded flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-mint" />
                </div>
                <span className="text-offwhite">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            How It <span className="text-mint">Works</span>
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            Four steps from first call to warranty.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <div key={index} className="bg-charcoal border border-white/10 rounded-xl p-6 text-center relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-mint rounded-full flex items-center justify-center text-charcoal font-bold text-lg">
                  {step.step}
                </div>
                <h3 className="font-display text-lg font-bold text-offwhite mb-3 mt-4">{step.title}</h3>
                <p className="text-offwhite-dark text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            Benefits of Working With <span className="text-mint">Us</span>
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            What the right film and graphics actually do for a building.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-charcoal-light border border-white/10 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-mint" />
                </div>
                <h3 className="font-display text-lg font-bold text-offwhite mb-2">{benefit.title}</h3>
                <p className="text-offwhite-dark text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Help */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            Who We <span className="text-mint">Help</span>
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            Homes and businesses across the Denver metro.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Homeowners',
              'Offices & Coworking',
              'Medical & Dental',
              'Retail & Storefronts',
              'Restaurants & Cafés',
              'Property Managers',
              'Fitness & Studios',
              'Schools & Churches'
            ].map((business, index) => (
              <div key={index} className="bg-charcoal border border-white/10 rounded-lg p-4 text-center">
                <span className="text-offwhite">{business}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Ready for a Free On-Site Quote?
          </h2>
          <p className="text-offwhite-dark mb-8">
            No commitment — we check the glass or walk the site and send one honest number.
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
