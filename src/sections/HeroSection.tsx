import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// The hero is deliberately static — no GSAP, no scroll-pin, no entrance animation.
// It used to pin for 130% of the viewport and scrub its contents out on scroll, which
// made the real page content feel far away and slow to reach. Now it's a normal
// full-height section that paints instantly.
export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative bg-charcoal/80 backdrop-blur-sm z-10 flex items-center min-h-[100svh] py-24 lg:py-16"
    >
      <div className="relative z-20 w-full px-[6vw] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        {/* Left - Text content */}
        <div className="min-w-0 max-w-2xl">
          <h1 className="space-y-1 mb-6">
            <div className="text-headline text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl text-offwhite leading-[1.05] break-words">
              ARCHITECTURAL
            </div>
            <div className="text-headline text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl leading-[1.05] break-words">
              <span className="text-mint drop-shadow-[0_0_15px_rgba(0,255,157,0.8)]">WINDOW FILM</span>{' '}
              <span className="text-offwhite">&amp; GRAPHICS</span>
            </div>
            <div className="text-headline text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl text-offwhite leading-[1.05] break-words">
              FOR DENVER BUILDINGS
            </div>
          </h1>

          <p className="text-base md:text-lg xl:text-xl text-offwhite-dark leading-relaxed mb-8 max-w-xl">
            Residential and commercial window tint, storefront and window graphics, signage,
            and wayfinding — designed, printed, and installed in-house. We check your glass
            before we quote, then hand you one honest number.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="btn-primary flex items-center gap-2">
              Get a Quote
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/services" className="btn-outline">
              View Services
            </Link>
          </div>
        </div>

        {/* Right - Architectural window: sun on the glass, film applied across it */}
        <div className="hidden lg:flex min-w-0 justify-center items-center">
          <div className="relative w-full max-w-[20rem] xl:max-w-[24rem] aspect-square">
            {/* ambient glow */}
            <div className="absolute inset-8 bg-mint/15 blur-3xl rounded-full animate-glow" />

            <svg
              viewBox="0 0 400 400"
              className="relative w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              role="img"
              aria-label="Sunlight on an architectural window with solar film applied across the glass"
            >
              <defs>
                {/* clear glass — subtle sky reflection */}
                <linearGradient id="glassClear" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#dff7ec" stopOpacity="0.22" />
                  <stop offset="1" stopColor="#dff7ec" stopOpacity="0.06" />
                </linearGradient>
                {/* tinted glass — where the film is on */}
                <linearGradient id="glassTint" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#00FF9D" stopOpacity="0.20" />
                  <stop offset="0.55" stopColor="#0b6e4c" stopOpacity="0.42" />
                  <stop offset="1" stopColor="#0B0D10" stopOpacity="0.72" />
                </linearGradient>
                <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="0.4" stopColor="#eafff5" />
                  <stop offset="1" stopColor="#00FF9D" stopOpacity="0" />
                </radialGradient>
                {/* diagonal split: clear glass above the film line, tint below */}
                <clipPath id="filmBelow">
                  <polygon points="0,150 400,60 400,400 0,400" />
                </clipPath>
              </defs>

              {/* sun + rays behind the frame */}
              <g opacity="0.9">
                <circle cx="86" cy="70" r="70" fill="url(#sun)" />
                {[...Array(10)].map((_, i) => {
                  const a = (i * Math.PI) / 5;
                  return (
                    <line
                      key={i}
                      x1={86 + Math.cos(a) * 44}
                      y1={70 + Math.sin(a) * 44}
                      x2={86 + Math.cos(a) * 78}
                      y2={70 + Math.sin(a) * 78}
                      stroke="#eafff5"
                      strokeOpacity="0.55"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>

              {/* outer window frame */}
              <rect x="58" y="46" width="284" height="320" rx="14"
                fill="#0B0D10" stroke="#00FF9D" strokeOpacity="0.55" strokeWidth="3" />
              <rect x="72" y="60" width="256" height="292" rx="8"
                fill="#11161d" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="2" />

              {/* six glass panes */}
              <g>
                {[0, 1, 2].map((row) =>
                  [0, 1].map((col) => {
                    const x = 82 + col * 125;
                    const y = 70 + row * 94;
                    return (
                      <g key={`${row}-${col}`}>
                        <rect x={x} y={y} width="116" height="85" rx="4" fill="url(#glassClear)" />
                        <rect x={x} y={y} width="116" height="85" rx="4" fill="url(#glassTint)"
                          clipPath="url(#filmBelow)" />
                        <rect x={x} y={y} width="116" height="85" rx="4"
                          fill="none" stroke="#00FF9D" strokeOpacity="0.28" strokeWidth="1.5" />
                      </g>
                    );
                  })
                )}
              </g>

              {/* glare streak on the clear glass */}
              <polygon points="96,64 150,64 96,150 72,150" fill="#ffffff" opacity="0.14" />

              {/* the film line + squeegee, mid-application */}
              <line x1="72" y1="150" x2="328" y2="60" stroke="#00FF9D" strokeOpacity="0.9" strokeWidth="2.5" />
              <rect x="300" y="44" width="34" height="12" rx="3" fill="#00FF9D"
                transform="rotate(-18 317 50)" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
