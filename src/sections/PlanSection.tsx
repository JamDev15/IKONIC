import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function PlanSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const topPanelRef = useRef<HTMLDivElement>(null);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        }
      });

      // ENTRANCE (0% - 30%)
      scrollTl
        .fromTo(bgRef.current, 
          { scale: 1.08, opacity: 0.6 }, 
          { scale: 1, opacity: 1, ease: 'none' }, 
          0
        )
        .fromTo(topPanelRef.current, 
          { x: '-70vw' }, 
          { x: 0, ease: 'power2.out' }, 
          0
        )
        .fromTo(bottomPanelRef.current, 
          { x: '70vw' }, 
          { x: 0, ease: 'power2.out' }, 
          0.06
        )
        .fromTo(headlineRef.current, 
          { x: '-60vw', opacity: 0 }, 
          { x: 0, opacity: 1, ease: 'power2.out' }, 
          0.08
        )
        .fromTo(contentRef.current, 
          { y: '-30vh', opacity: 0 }, 
          { y: 0, opacity: 1, ease: 'power2.out' }, 
          0.10
        );

      // SETTLE (30% - 70%): Hold

      // EXIT (70% - 100%)
      scrollTl
        .to(headlineRef.current, 
          { x: '-40vw', opacity: 0.25, ease: 'power2.in' }, 
          0.70
        )
        .to(headlineRef.current, 
          { opacity: 0, ease: 'power2.in' }, 
          0.94
        )
        .to(topPanelRef.current, 
          { x: '-70vw', ease: 'power2.in' }, 
          0.78
        )
        .to(bottomPanelRef.current, 
          { x: '70vw', ease: 'power2.in' }, 
          0.78
        )
        .to(bgRef.current, 
          { scale: 1.05, opacity: 0.6, ease: 'power2.in' }, 
          0.80
        );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="section-pinned z-20"
    >
      {/* Background image */}
      <div 
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
      >
        <img 
          src="/plan_workspace.jpg" 
          alt="Workspace"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/40" />
      </div>

      {/* Top-left dark panel */}
      <div 
        ref={topPanelRef}
        className="absolute left-0 top-0 w-[62vw] h-[34vh] bg-charcoal z-10"
      />

      {/* Bottom-right dark panel */}
      <div 
        ref={bottomPanelRef}
        className="absolute right-0 bottom-0 w-[62vw] h-[34vh] bg-charcoal z-10"
      />

      {/* Content */}
      <div 
        ref={contentRef}
        className="absolute left-[7vw] top-[10vh] z-20 max-w-[44vw]"
      >
        <p className="text-body text-lg text-offwhite leading-relaxed">
          We map the customer journey, define channels, and build a campaign architecture that scales.
        </p>
        <div className="mt-6 flex gap-3">
          {['Strategy', 'Media Planning', 'Forecasting'].map((chip) => (
            <span 
              key={chip}
              className="px-4 py-2 border border-white/35 text-offwhite text-sm font-mono uppercase tracking-wider"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* Oversized headline */}
      <div 
        ref={headlineRef}
        className="absolute left-[6vw] top-[56vh] z-20"
      >
        <h2 className="text-headline text-display text-offwhite">
          PLAN
        </h2>
      </div>
    </section>
  );
}
