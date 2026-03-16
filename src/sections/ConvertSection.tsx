import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ConvertSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const topBandRef = useRef<HTMLDivElement>(null);
  const bottomBandRef = useRef<HTMLDivElement>(null);
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
          { scale: 1.06, opacity: 0.7 }, 
          { scale: 1, opacity: 1, ease: 'none' }, 
          0
        )
        .fromTo(topBandRef.current, 
          { y: '-25vh' }, 
          { y: 0, ease: 'power2.out' }, 
          0
        )
        .fromTo(bottomBandRef.current, 
          { y: '25vh' }, 
          { y: 0, ease: 'power2.out' }, 
          0.06
        )
        .fromTo(headlineRef.current, 
          { x: '-70vw', opacity: 0 }, 
          { x: 0, opacity: 1, ease: 'power2.out' }, 
          0.10
        )
        .fromTo(contentRef.current, 
          { y: '-20vh', opacity: 0 }, 
          { y: 0, opacity: 1, ease: 'power2.out' }, 
          0.12
        );

      // SETTLE (30% - 70%): Hold

      // EXIT (70% - 100%)
      scrollTl
        .to(headlineRef.current, 
          { x: '35vw', opacity: 0.25, ease: 'power2.in' }, 
          0.70
        )
        .to(headlineRef.current, 
          { opacity: 0, ease: 'power2.in' }, 
          0.94
        )
        .to(topBandRef.current, 
          { y: '-25vh', ease: 'power2.in' }, 
          0.78
        )
        .to(bottomBandRef.current, 
          { y: '25vh', ease: 'power2.in' }, 
          0.78
        )
        .to(bgRef.current, 
          { opacity: 0.85, ease: 'power2.in' }, 
          0.90
        );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="section-pinned z-[80]"
    >
      {/* Background image */}
      <div 
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
      >
        <img 
          src="/convert_portrait.jpg" 
          alt="Conversion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/50" />
      </div>

      {/* Top dark band */}
      <div 
        ref={topBandRef}
        className="absolute left-0 top-0 w-full h-[22vh] bg-charcoal z-10"
      />

      {/* Bottom dark band */}
      <div 
        ref={bottomBandRef}
        className="absolute left-0 bottom-0 w-full h-[22vh] bg-charcoal z-10"
      />

      {/* Content */}
      <div 
        ref={contentRef}
        className="absolute left-[7vw] top-[10vh] z-20 max-w-[46vw]"
      >
        <p className="text-body text-lg text-offwhite leading-relaxed">
          Landing experiences, offers, and nurture flows that turn interest into action.
        </p>
      </div>

      {/* CTA */}
      <div className="absolute right-[7vw] top-[10vh] z-20">
        <button className="btn-outline">
          Request a proposal
        </button>
      </div>

      {/* Oversized headline */}
      <div 
        ref={headlineRef}
        className="absolute left-[6vw] top-[54vh] z-20"
      >
        <h2 className="text-headline text-display text-offwhite">
          CONVERT
        </h2>
      </div>
    </section>
  );
}
