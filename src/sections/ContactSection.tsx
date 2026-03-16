import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Phone, MapPin, Send, Facebook, Instagram, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(headerRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Form animation
      gsap.fromTo(formRef.current,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Info animation
      gsap.fromTo(infoRef.current,
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: infoRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="contact" 
      className="relative bg-charcoal/90 backdrop-blur-sm py-24 lg:py-32 z-20"
    >
      <div className="px-[6vw]">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6">
            Let's <span className="text-mint">Build</span> Your<br />System
          </h2>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto">
            Got a quick ask? Looking to collaborate or send us a referral? 
            Share your message and we'll respond within one business day.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">
          {/* Form */}
          <div
            ref={formRef}
            className="bg-charcoal-light border border-white/10 rounded-2xl p-8 lg:p-10"
          >
            <h3 className="font-display text-2xl font-bold text-offwhite mb-6">
              Get Started
            </h3>

            <iframe
              src="https://crm.ikonic303.com/widget/form/YoKGheZ0aVCEaSOJQFxY"
              className="w-full h-[1199px] border-0 rounded-[3px] bg-charcoal-light"
              title="Client Information"
              loading="lazy"
            />
          </div>

          {/* Contact Info */}
          <div ref={infoRef} className="space-y-8">
            <div>
              <h3 className="font-display text-2xl font-bold text-offwhite mb-6">
                Connect With Us
              </h3>
              <p className="text-offwhite-dark mb-8">
                Have a question? Curious how our solutions perform? Whether you're ready 
                to begin or simply weighing options, our team is here for you.
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <a 
                href="mailto:info@ikonicmarketing303.com"
                className="flex items-center gap-4 p-4 bg-charcoal-light border border-white/10 rounded-xl hover:border-mint/30 transition-colors"
              >
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <p className="text-sm text-offwhite-dark">Email</p>
                  <p className="text-offwhite">info@ikonicmarketing303.com</p>
                </div>
              </a>
              
              <a 
                href="tel:+17206791230"
                className="flex items-center gap-4 p-4 bg-charcoal-light border border-white/10 rounded-xl hover:border-mint/30 transition-colors"
              >
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <p className="text-sm text-offwhite-dark">Phone</p>
                  <p className="text-offwhite">+1 (720) 679-1230</p>
                </div>
              </a>
              
              <div className="flex items-center gap-4 p-4 bg-charcoal-light border border-white/10 rounded-xl">
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <p className="text-sm text-offwhite-dark">Location</p>
                  <p className="text-offwhite">Colorado, USA</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <p className="text-sm text-offwhite-dark mb-4">Follow Us</p>
              <div className="flex gap-3">
                <a 
                  href="https://www.facebook.com/ikonic303"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-charcoal-light border border-white/10 rounded-lg flex items-center justify-center hover:border-mint/30 hover:bg-mint/10 transition-all"
                >
                  <Facebook className="w-5 h-5 text-offwhite" />
                </a>
                <a 
                  href="https://www.instagram.com/ikonic_303/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-charcoal-light border border-white/10 rounded-lg flex items-center justify-center hover:border-mint/30 hover:bg-mint/10 transition-all"
                >
                  <Instagram className="w-5 h-5 text-offwhite" />
                </a>
                <a 
                  href="https://www.tiktok.com/@ikonic_303"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-charcoal-light border border-white/10 rounded-lg flex items-center justify-center hover:border-mint/30 hover:bg-mint/10 transition-all"
                >
                  <svg className="w-5 h-5 text-offwhite" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-mint/20 to-mint/5 border border-mint/30 rounded-xl p-6">
              <p className="text-offwhite font-medium mb-2">
                Ready to Automate Your Sales & Lead Flow?
              </p>
              <p className="text-offwhite-dark text-sm mb-4">
                Book your free 15-minute GHL Audit. No commitment, just a clear plan to scale your business.
              </p>
              <a 
                href="tel:+17206791230"
                className="inline-flex items-center gap-2 text-mint font-medium hover:gap-3 transition-all"
              >
                Call Now
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 pt-12 border-t border-white/10">
        <div className="px-[6vw]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <img 
                src="/logo.png" 
                alt="Ikonic" 
                className="h-10 w-auto mb-4"
              />
              <p className="text-offwhite-dark text-sm">
                The Digital Agency That Works While You Sleep.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-offwhite font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {['Home', 'About', 'Services', 'Contact', 'Blogs'].map((link) => (
                  <li key={link}>
                    <a 
                      href={`#${link.toLowerCase()}`}
                      className="text-offwhite-dark text-sm hover:text-mint transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Services */}
            <div>
              <h4 className="text-offwhite font-medium mb-4">Services</h4>
              <ul className="space-y-2">
                {[
                  'Web Design & Funnels',
                  'CRM & Automations',
                  'Reputation Management',
                  'Speed to Lead Systems',
                  'Marketing Systems'
                ].map((service) => (
                  <li key={service}>
                    <a 
                      href="#services"
                      className="text-offwhite-dark text-sm hover:text-mint transition-colors"
                    >
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Newsletter */}
            <div>
              <h4 className="text-offwhite font-medium mb-4">Stay Connected</h4>
              <p className="text-offwhite-dark text-sm mb-4">
                Get business growth tips and strategies straight to your inbox.
              </p>
              <div className="flex gap-2">
                <input 
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-charcoal border border-white/20 rounded-lg text-offwhite text-sm focus:outline-none focus:border-mint"
                />
                <button className="px-4 py-2 bg-mint text-charcoal rounded-lg hover:bg-mint-dark transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="pt-8 border-t border-white/10 text-center">
            <p className="text-offwhite-dark text-sm">
              © 2026 Ikonic. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </section>
  );
}
