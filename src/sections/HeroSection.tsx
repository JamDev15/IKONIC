import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Load animation
      const loadTl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      
      loadTl
        .fromTo(headlineRef.current?.querySelectorAll('.headline-line') || [], 
          { y: 60, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 }, 
          0.2
        )
        .fromTo(subheadRef.current, 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.6 }, 
          0.5
        )
        .fromTo(ctaRef.current, 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.5 }, 
          0.7
        )
        .fromTo(robotRef.current, 
          { x: 100, opacity: 0, scale: 0.8 }, 
          { x: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.2)' }, 
          0.4
        );

      // Scroll-driven exit animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            gsap.set([headlineRef.current, subheadRef.current, ctaRef.current, robotRef.current], { 
              opacity: 1, x: 0, y: 0 
            });
          }
        }
      });

      // EXIT phase (70% - 100%)
      scrollTl
        .fromTo(headlineRef.current, 
          { y: 0, opacity: 1 }, 
          { y: '-30vh', opacity: 0.2, ease: 'power2.in' }, 
          0.70
        )
        .to(headlineRef.current, 
          { opacity: 0, ease: 'power2.in' }, 
          0.95
        )
        .fromTo(subheadRef.current, 
          { y: 0, opacity: 1 }, 
          { y: '-20vh', opacity: 0, ease: 'power2.in' }, 
          0.72
        )
        .fromTo(ctaRef.current, 
          { y: 0, opacity: 1 }, 
          { y: '-15vh', opacity: 0, ease: 'power2.in' }, 
          0.74
        )
        .fromTo(robotRef.current, 
          { x: 0, opacity: 1 }, 
          { x: '30vw', opacity: 0.2, ease: 'power2.in' }, 
          0.70
        )
        .to(robotRef.current, 
          { opacity: 0, ease: 'power2.in' }, 
          0.95
        );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      id="home"
      className="section-pinned bg-charcoal/80 backdrop-blur-sm z-10 overflow-hidden"
    >
      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="w-full px-[6vw] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left - Text content */}
          <div className="max-w-2xl">
            <div ref={headlineRef} className="space-y-2 mb-8">
              <div className="headline-line text-headline text-4xl md:text-5xl lg:text-6xl text-offwhite leading-tight">
                DIGITAL MARKETING
              </div>
              <div className="headline-line text-headline text-4xl md:text-5xl lg:text-6xl leading-tight">
                <span className="text-offwhite">AUTOMATION: YOUR</span>{' '}
                <span className="text-mint drop-shadow-[0_0_15px_rgba(0,255,157,0.8)]">24/7</span>
              </div>
              <div className="headline-line text-headline text-4xl md:text-5xl lg:text-6xl text-offwhite leading-tight">
                LEAD CAPTURE SYSTEM
              </div>
            </div>

            <p 
              ref={subheadRef}
              className="text-lg md:text-xl text-offwhite-dark leading-relaxed mb-10 max-w-xl"
            >
              We Build & Manage Your Complete Business System — From High-Converting Websites 
              and Sales Funnels to CRM, Automation, and Lead Flow — All Inside One Powerful, 
              Custom Platform.
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-4">
              <Link 
                to="/contact"
                className="btn-primary flex items-center gap-2"
              >
                Start Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/learn-more"
                className="btn-outline"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right - Robot mascot */}
          <div 
            ref={robotRef}
            className="hidden lg:flex justify-center items-center"
          >
            <div className="relative">
              <div className="w-80 h-80 relative">
                {/* Robot body */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-56 bg-gradient-to-b from-mint/80 to-mint-dark/80 rounded-3xl relative shadow-2xl">
                    {/* Head */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-36 h-32 bg-gradient-to-b from-white to-mint/20 rounded-2xl shadow-lg">
                      {/* Eyes */}
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-3">
                        <div className="w-8 h-8 bg-mint rounded-full animate-pulse shadow-[0_0_20px_rgba(0,255,157,1)]" />
                        <div className="w-8 h-8 bg-mint rounded-full animate-pulse shadow-[0_0_20px_rgba(0,255,157,1)]" />
                      </div>
                    </div>
                    {/* Body details */}
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-20 h-20 bg-mint/30 rounded-full animate-glow" />
                    {/* Arms */}
                    <div className="absolute top-16 -left-8 w-8 h-24 bg-gradient-to-b from-mint/60 to-mint-dark/60 rounded-full rotate-12" />
                    <div className="absolute top-16 -right-8 w-8 h-24 bg-gradient-to-b from-mint/60 to-mint-dark/60 rounded-full -rotate-12" />
                  </div>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-mint/20 blur-3xl rounded-full animate-glow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
