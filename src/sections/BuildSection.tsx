import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function BuildSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const topImgRef = useRef<HTMLDivElement>(null);
  const bottomImgRef = useRef<HTMLDivElement>(null);
  const accentPanelRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const topTextRef = useRef<HTMLDivElement>(null);
  const bottomTextRef = useRef<HTMLDivElement>(null);

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
        .fromTo(topImgRef.current, 
          { x: '-60vw', opacity: 0 }, 
          { x: 0, opacity: 1, ease: 'power2.out' }, 
          0
        )
        .fromTo(bottomImgRef.current, 
          { x: '60vw', opacity: 0 }, 
          { x: 0, opacity: 1, ease: 'power2.out' }, 
          0.06
        )
        .fromTo(accentPanelRef.current, 
          { x: '-40vw' }, 
          { x: 0, ease: 'power2.out' }, 
          0.08
        )
        .fromTo(headlineRef.current, 
          { y: '40vh', opacity: 0 }, 
          { y: 0, opacity: 1, ease: 'power2.out' }, 
          0.10
        )
        .fromTo(topTextRef.current, 
          { x: '20vw', opacity: 0 }, 
          { x: 0, opacity: 1, ease: 'power2.out' }, 
          0.12
        )
        .fromTo(bottomTextRef.current, 
          { x: '-20vw', opacity: 0 }, 
          { x: 0, opacity: 1, ease: 'power2.out' }, 
          0.14
        );

      // SETTLE (30% - 70%): Hold

      // EXIT (70% - 100%)
      scrollTl
        .to(topImgRef.current, 
          { x: '60vw', opacity: 0.2, ease: 'power2.in' }, 
          0.70
        )
        .to(topImgRef.current, 
          { opacity: 0, ease: 'power2.in' }, 
          0.95
        )
        .to(bottomImgRef.current, 
          { x: '-60vw', opacity: 0.2, ease: 'power2.in' }, 
          0.70
        )
        .to(bottomImgRef.current, 
          { opacity: 0, ease: 'power2.in' }, 
          0.95
        )
        .to(headlineRef.current, 
          { y: '30vh', opacity: 0.2, ease: 'power2.in' }, 
          0.72
        )
        .to(headlineRef.current, 
          { opacity: 0, ease: 'power2.in' }, 
          0.94
        )
        .to(accentPanelRef.current, 
          { x: '40vw', ease: 'power2.in' }, 
          0.82
        );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="section-pinned bg-charcoal z-[70]"
    >
      {/* Accent diagonal panel */}
      <div 
        ref={accentPanelRef}
        className="absolute left-[36vw] top-0 w-[18vw] h-full bg-coral z-0"
        style={{ transform: 'skewX(-12deg)' }}
      />

      {/* Top image (left) */}
      <div 
        ref={topImgRef}
        className="absolute left-[6vw] top-[10vh] w-[44vw] h-[34vh] overflow-hidden z-10"
      >
        <img 
          src="/build_top.jpg" 
          alt="Building partnerships"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bottom image (right) */}
      <div 
        ref={bottomImgRef}
        className="absolute right-[6vw] top-[56vh] w-[44vw] h-[34vh] overflow-hidden z-10"
      >
        <img 
          src="/build_bottom.jpg" 
          alt="Professional partnership"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Top-right paragraph */}
      <div 
        ref={topTextRef}
        className="absolute left-[54vw] top-[14vh] w-[40vw] z-20"
      >
        <p className="text-body text-lg text-offwhite leading-relaxed">
          We partner with teams who want accountability, candor, and continuous improvement.
        </p>
      </div>

      {/* Oversized headline */}
      <div 
        ref={headlineRef}
        className="absolute left-[6vw] top-[52vh] z-20"
      >
        <h2 className="text-headline text-display text-offwhite">
          BUILD
        </h2>
      </div>

      {/* Bottom-left paragraph */}
      <div 
        ref={bottomTextRef}
        className="absolute left-[6vw] top-[72vh] w-[44vw] z-20"
      >
        <p className="text-body text-lg text-offwhite-dark leading-relaxed">
          Retention, loyalty, and community—designed into every campaign.
        </p>
      </div>
    </section>
  );
}
