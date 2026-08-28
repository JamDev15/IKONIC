import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PanelsTopLeft, Sun, MapPin, ShieldCheck, Target, Zap, Shield, Heart } from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: PanelsTopLeft, label: 'Panes & Panels Installed', value: '10K+' },
  { icon: Sun, label: 'Heat & UV Rejected', value: 'up to 99%' },
  { icon: MapPin, label: 'Denver-Metro Service Radius', value: '30 mi' },
  { icon: ShieldCheck, label: 'Manufacturer Film Warranty', value: 'Lifetime' }
];

const values = [
  { icon: Target, title: 'Right Film, Right Glass', desc: 'We check every window against the manufacturer chart before we quote.' },
  { icon: Zap, title: 'Clean Installs', desc: 'Dust-controlled prep, finished edges, and a firm timeline we hold.' },
  { icon: Shield, title: 'One Honest Number', desc: 'No hidden fees and no surprise add-ons at the end of the job.' },
  { icon: Heart, title: 'One Consistent Look', desc: 'Film, graphics, and signage from the same shop so it all matches.' }
];

export default function About() {
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
        title="About ikonic303 | Denver Window Film & Graphics Shop"
        description="ikonic is a Wheat Ridge, CO shop for architectural window film, storefront and window graphics, and signage. Design, print, and installation in-house for the Denver metro."
        canonical="/about"
      />
      <MatrixBackground />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-[6vw] relative z-10">
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">ABOUT IKONIC</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            One Shop for Film,<br />
            <span className="text-mint">Graphics &amp; Signage</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto">
            ikonic is a Wheat Ridge, Colorado shop for the visible skin of a building — architectural
            window film, storefront and window graphics, and signage. We design, print, and install
            all of it in-house for the Denver metro.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6 text-center">
            Our <span className="text-mint">Story</span>
          </h2>
          <div className="space-y-6 text-offwhite-dark">
            <p>
              ikonic started with a pressure washer and an obsession with making things look
              flawless. That grew into a shop that handles the surfaces customers actually see:
              the film on your glass, the graphics on your windows, and the sign over your door.
            </p>
            <p>
              Most businesses hire three different vendors for those three things and end up with
              three slightly different looks. We do all of it under one roof in Wheat Ridge —
              design, printing, and installation — so it matches, and so nothing gets lost
              between companies.
            </p>
            <p>
              We serve the Denver metro: Wheat Ridge, Arvada, Lakewood, Golden, and greater
              Denver. Building and storefront work is installed on-site; printing and fabrication
              happen at the shop.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
                Our <span className="text-mint">Standard</span>
              </h2>
              <p className="text-offwhite-dark mb-6">
                We only install film a manufacturer's compatibility chart says is safe for your
                glass. Dual-pane, low-e, tempered, and annealed glass each behave differently, and
                the wrong film can crack a pane or void its seal warranty — so we check first.
              </p>
              <p className="text-offwhite-dark">
                The same care goes into graphics and signage: the right substrate for the surface,
                finished edges, and a firm timeline. Quality-first, every pane and every panel.
              </p>
            </div>
            <div className="bg-gradient-to-br from-mint/20 to-mint/5 border border-mint/30 rounded-2xl p-8">
              <h3 className="font-display text-xl font-bold text-offwhite mb-4">
                What Makes Us Different
              </h3>
              <ul className="space-y-3">
                {[
                  'Design, printing, and installation in-house',
                  'Glass checked against the film chart before quoting',
                  'One written quote — no surprise add-ons',
                  'Building & storefront work installed on-site',
                  'Film, graphics, and signage that match'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-offwhite">
                    <div className="w-1.5 h-1.5 bg-mint rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            Our <span className="text-mint">Values</span>
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            The rules we don't bend, on every job.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-charcoal border border-white/10 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-mint" />
                </div>
                <h3 className="font-display text-lg font-bold text-offwhite mb-2">{value.title}</h3>
                <p className="text-offwhite-dark text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            By the <span className="text-mint">Numbers</span>
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            What the work adds up to.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-charcoal-light border border-white/10 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-mint" />
                </div>
                <p className="text-3xl font-bold text-offwhite mb-1">{stat.value}</p>
                <p className="text-offwhite-dark text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Ready to Work With Us?
          </h2>
          <p className="text-offwhite-dark mb-8">
            Book a free on-site consultation — we'll check the glass or walk the site and send one quote.
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
