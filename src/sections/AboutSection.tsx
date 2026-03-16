import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, Clock, TrendingUp, Headphones } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: Users, label: 'Leads Captured', value: '10K+' },
  { icon: Clock, label: 'Hours Saved', value: '5K+' },
  { icon: TrendingUp, label: 'Avg. ROI Increase', value: '340%' },
  { icon: Headphones, label: 'Support', value: '24/7' }
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Content animation
      gsap.fromTo(contentRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Image animation
      gsap.fromTo(imageRef.current,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: imageRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Stats animation
      const statItems = statsRef.current?.querySelectorAll('.stat-item');
      if (statItems) {
        gsap.fromTo(statItems,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
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
      id="about" 
      className="relative bg-charcoal/90 backdrop-blur-sm py-24 lg:py-32 z-20"
    >
      <div className="px-[6vw]">
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Left - Image */}
          <div ref={imageRef} className="relative">
            <div className="relative rounded-2xl overflow-hidden">
              <img 
                src="/innovate_team.jpg" 
                alt="Ikonic Team"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 bg-mint rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,157,0.4)]">
              <p className="text-4xl font-bold text-charcoal">5+</p>
              <p className="text-charcoal/80 text-sm">Years Experience</p>
            </div>
          </div>

          {/* Right - Content */}
          <div ref={contentRef}>
            <p className="text-micro text-mint mb-4">ABOUT US</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-offwhite mb-6 leading-tight">
              The Digital Agency That<br />
              <span className="text-mint">Works While You Sleep</span>
            </h2>
            
            <div className="space-y-4 text-offwhite-dark leading-relaxed">
              <p>
                Running a business shouldn't feel chaotic. We help companies scale with smart 
                automation, a powerful CRM, trained virtual assistants, and done-for-you social 
                media — so your operations keep moving even when you're off the clock.
              </p>
              <p>
                Instead of juggling tools, tasks, and inconsistent workflows, we turn your entire 
                backend into a smooth, automated engine. From lead capture to follow-ups, client 
                onboarding to daily operations, we build systems that remove the manual work and 
                let you focus on growth.
              </p>
              <p>
                Whether you're a local service business, a fast-moving startup, or a growing online 
                brand, our team builds everything inside GoHighLevel — clean, organized, and designed 
                to run effortlessly on autopilot.
              </p>
            </div>

            {/* Mission */}
            <div className="mt-8 p-6 bg-charcoal-light border border-mint/30 rounded-xl">
              <h3 className="font-display text-lg font-bold text-mint mb-3">Our Mission</h3>
              <p className="text-offwhite-dark text-sm">
                We're here to skip the fluff and equip you with tools that actually drive impact. 
                No heavy platforms. No copy-paste setups. Just tailored systems built to capture 
                leads, nurture relationships, and scale your business.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div 
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="stat-item bg-charcoal-light border border-white/10 rounded-xl p-6 text-center hover:border-mint/30 transition-colors"
            >
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
  );
}
