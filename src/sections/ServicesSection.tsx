import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  Settings, 
  Star, 
  Zap, 
  TrendingUp,
  ArrowRight 
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: Globe,
    title: 'Web Design & Funnels',
    description: 'Tailored, results-focused landing pages and sales funnels built directly within your GHL sub-account. Includes website migration and conversion-optimized design.',
    features: ['Custom website builds', 'Sales funnel design', 'GHL integration', 'Migration services'],
    link: '/services/web-design'
  },
  {
    icon: Settings,
    title: 'CRM & Automations',
    description: 'Complete CRM setup and optimization with automated workflows that nurture leads from first contact to closed deal.',
    features: ['Pipeline builds', 'Workflow automation', 'Lead tracking', 'AI agent integrations'],
    link: '/services/crm-automation'
  },
  {
    icon: Star,
    title: 'Reputation Management',
    description: 'Drive your rankings on Google Maps and local search. Automated 5-star review collection and strategic on-page SEO optimization.',
    features: ['Google Business Profile', 'Review automation', 'Local SEO', 'Reputation monitoring'],
    link: '/services/reputation'
  },
  {
    icon: Zap,
    title: 'Speed to Lead Systems',
    description: 'Turn cold leads into booked calls with action-based reminders, automated SMS/email sequences, and smart workflows.',
    features: ['Instant follow-up', 'SMS automation', 'Email sequences', 'Missed call text-back'],
    link: '/services/speed-to-lead'
  },
  {
    icon: TrendingUp,
    title: 'Marketing Systems',
    description: 'Full marketing automation that keeps your pipeline full 24/7 with integrated campaigns across all channels.',
    features: ['Campaign management', 'Social media', 'Paid ads', 'Analytics dashboard'],
    link: '/services/marketing'
  }
];

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

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

      // Cards animation
      const cards = cardsRef.current?.querySelectorAll('.service-card');
      if (cards) {
        gsap.fromTo(cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="services" 
      className="relative bg-charcoal/90 backdrop-blur-sm py-24 lg:py-32 z-20"
    >
      <div className="px-[6vw]">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <p className="text-micro text-mint mb-4">WHAT WE DO</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-offwhite mb-6">
            Our Core: Websites, Funnels &<br />
            <span className="text-mint">GoHighLevel (GHL) Systems</span>
          </h2>
          <p className="text-lg text-offwhite-dark max-w-3xl mx-auto">
            We build high-converting websites and sales funnels, then power them with fully 
            customized GoHighLevel systems — designed specifically for local service businesses 
            like fitness studios, dental practices, contractors, and law firms.
          </p>
        </div>

        {/* Services Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div 
              key={index}
              className="service-card group bg-charcoal-light border border-white/10 rounded-xl p-8 hover:border-mint/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,255,157,0.15)]"
            >
              <div className="w-14 h-14 bg-mint/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-mint/20 transition-colors">
                <service.icon className="w-7 h-7 text-mint" />
              </div>
              
              <h3 className="font-display text-xl font-bold text-offwhite mb-4">
                {service.title}
              </h3>
              
              <p className="text-offwhite-dark text-sm leading-relaxed mb-6">
                {service.description}
              </p>
              
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center gap-2 text-sm text-offwhite-dark">
                    <div className="w-1.5 h-1.5 bg-mint rounded-full" />
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

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-offwhite-dark mb-6">
            We don't just hand you software. We build and manage your complete growth system 
            so your business runs smarter, faster, and more profitably.
          </p>
          <Link 
            to="/contact"
            className="btn-primary inline-flex items-center gap-2"
          >
            Book Free Consultation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
