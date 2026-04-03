import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';

// ── Internal pricing constants (office use only) ──────────────────────────────
const _R  = 15;   // $/sqft base rate
const _O  = 1.15; // 15% overprint/waste buffer
const _D  = 500;  // flat design fee
const _M  = 2.5;  // final markup multiplier

// ── Vehicle categories with exact sqft ───────────────────────────────────────
const CATS = [
  { name: 'Cars', icon: '🚗', vehicles: [
    { id: 'compact_car',     label: 'Compact (Civic, Corolla, etc.)',       sqft: 45  },
    { id: 'midsize_sedan',   label: 'Mid-Size Sedan (Camry, Accord)',        sqft: 52  },
    { id: 'fullsize_sedan',  label: 'Full-Size Sedan (Charger, Impala)',     sqft: 60  },
  ]},
  { name: 'SUVs & Crossovers', icon: '🚙', vehicles: [
    { id: 'compact_suv',   label: 'Compact SUV (RAV4, CR-V)',               sqft: 55  },
    { id: 'midsize_suv',   label: 'Mid-Size SUV (4Runner, Explorer)',        sqft: 65  },
    { id: 'fullsize_suv',  label: 'Full-Size SUV (Tahoe, Expedition)',       sqft: 80  },
  ]},
  { name: 'Pickup Trucks', icon: '🛻', vehicles: [
    { id: 'reg_cab_pickup',   label: 'Regular / Extended Cab',              sqft: 50  },
    { id: 'crew_short_pickup',label: 'Crew Cab – Short Bed',                sqft: 58  },
    { id: 'crew_long_pickup', label: 'Crew Cab – Long Bed',                 sqft: 65  },
  ]},
  { name: 'Cargo Vans', icon: '🚐', vehicles: [
    { id: 'compact_cargo',  label: 'Compact (Transit Connect, NV200)',      sqft: 60  },
    { id: 'std_cargo',      label: 'Standard (Express, E-Series)',          sqft: 90  },
    { id: 'extended_cargo', label: 'Extended (Express LWB, E-350 Ext)',     sqft: 105 },
  ]},
  { name: 'Sprinter / Transit Vans', icon: '🚌', vehicles: [
    { id: 'sprinter_sr_short', label: 'Standard Roof – Short (144" WB)',    sqft: 105 },
    { id: 'sprinter_sr_long',  label: 'Standard Roof – Long (170" WB)',     sqft: 120 },
    { id: 'sprinter_hr_short', label: 'High Roof – Short (144" WB)',        sqft: 130 },
    { id: 'sprinter_hr_long',  label: 'High Roof – Long (170" WB)',         sqft: 148 },
    { id: 'sprinter_hr_ext',   label: 'High Roof – Extended (170E WB)',     sqft: 168 },
  ]},
  { name: 'Box Trucks', icon: '📦', vehicles: [
    { id: 'box_10', label: '10 ft Box Truck', sqft: 150, flat: true },
    { id: 'box_12', label: '12 ft Box Truck', sqft: 175, flat: true },
    { id: 'box_14', label: '14 ft Box Truck', sqft: 200, flat: true },
    { id: 'box_16', label: '16 ft Box Truck', sqft: 225, flat: true },
    { id: 'box_20', label: '20 ft Box Truck', sqft: 275, flat: true },
    { id: 'box_24', label: '24 ft Box Truck', sqft: 335, flat: true },
    { id: 'box_26', label: '26 ft Box Truck', sqft: 370, flat: true },
  ]},
  { name: 'Enclosed Trailers', icon: '🚛', vehicles: [
    { id: 'trailer_6x12',  label: '6×12 Enclosed Trailer',  sqft: 120, flat: true },
    { id: 'trailer_7x14',  label: '7×14 Enclosed Trailer',  sqft: 155, flat: true },
    { id: 'trailer_7x16',  label: '7×16 Enclosed Trailer',  sqft: 178, flat: true },
    { id: 'trailer_8x20',  label: '8×20 Enclosed Trailer',  sqft: 232, flat: true },
    { id: 'trailer_8x24',  label: '8×24 Enclosed Trailer',  sqft: 278, flat: true },
    { id: 'trailer_48_semi',label: '48 ft Semi Trailer',     sqft: 500, flat: true },
    { id: 'trailer_53_semi',label: '53 ft Semi Trailer',     sqft: 560, flat: true },
  ]},
] as const;

type Vehicle = { id: string; label: string; sqft: number; flat?: boolean };

// Flat lookup map
const VEH_MAP: Record<string, Vehicle> = {};
CATS.forEach(c => c.vehicles.forEach((v: any) => { VEH_MAP[v.id] = v; }));

// ── Coverage ──────────────────────────────────────────────────────────────────
const COVERAGE: Record<string, { mult: number; desc: string; spot?: boolean; reflectiveSpot?: boolean }> = {
  'Full Wrap':                       { mult: 1.00, desc: 'Complete coverage — maximum impact' },
  'Half Wrap':                       { mult: 0.55, desc: 'Strategic panels — great ROI' },
  'Spot Graphics / Lettering':       { mult: 0.25, desc: 'Logo, phone, essentials — starting at $800', spot: true },
  'Reflective Spot Graphics':        { mult: 0.25, desc: 'High-visibility reflective lettering & logos', reflectiveSpot: true },
};

// ── Materials ─────────────────────────────────────────────────────────────────
const MATERIALS: Record<string, { _m: number; flatOnly?: boolean; desc: string }> = {
  'Premium Cast Vinyl (3M / Avery)': { _m: 1.0, desc: 'Industry gold standard — vibrant, durable, 7+ year life' },
  'Standard Calendered Vinyl':       { _m: 0.9, flatOnly: true, desc: 'Made for flat surfaces — trailers, storefronts & box trucks' },
  'Reflective Vinyl':                { _m: 2.0, desc: 'Visible day & night — ideal for service vehicles' },
  'Chrome / Specialty Finish':       { _m: 2.0, desc: 'Head-turning metallic & specialty looks — 1 year warranty' },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function WrapCalculator() {
  const [searchParams] = useSearchParams();
  const fromWrap     = searchParams.get('coverage');
  const fromBusiness = searchParams.get('business');

  const [vehicleId, setVehicleId]   = useState('');
  const [coverage, setCoverage]     = useState(fromWrap && COVERAGE[fromWrap] ? fromWrap : 'Full Wrap');
  const [material, setMaterial]     = useState('Premium Cast Vinyl (3M / Avery)');
  const [qty, setQty]               = useState(1);
  const [showResult, setShowResult] = useState(false);

  const vehicle  = vehicleId ? VEH_MAP[vehicleId] : null;
  const isFlat   = !!vehicle?.flat;
  const effMat   = MATERIALS[material]?.flatOnly && !isFlat ? 'Premium Cast Vinyl (3M / Avery)' : material;
  const ready    = !!vehicle;

  const calc = useMemo(() => {
    if (!vehicle) return null;
    const sqft = vehicle.sqft;
    const cov  = COVERAGE[coverage];
    const mat  = MATERIALS[effMat];

    let unit: number;
    if (cov.spot) {
      unit = Math.round(800 + Math.max(0, sqft - 50) * 8);
    } else if (cov.reflectiveSpot) {
      // Reflective spot: same base as spot graphics but with reflective vinyl multiplier (2x)
      unit = Math.round((800 + Math.max(0, sqft - 50) * 8) * 2);
    } else {
      unit = Math.round((sqft * cov.mult * _O * _R * mat._m + _D) * _M);
    }
    const total  = unit * qty;
    const impLow  = Math.round(sqft * 500);
    const impHigh = Math.round(sqft * 900);

    return { unit, total, impLow, impHigh, sqft };
  }, [vehicleId, coverage, effMat, qty, vehicle]);

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div className="relative min-h-screen bg-charcoal">
      <MatrixBackground />
      <Navigation />

      <div className="relative z-10 pt-28 pb-20 px-[4vw]">
        <div className="max-w-7xl mx-auto">

          {/* Page Header */}
          <h1 className="font-display text-3xl font-bold text-offwhite mb-1">Wrap Calculator</h1>
          <p className="text-offwhite-dark mb-4">Select your vehicle, coverage, and material to get an instant estimate</p>

          {fromBusiness && (
            <div className="bg-mint/10 border border-mint/30 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-mint font-semibold">Design imported from AI Wrap Generator</p>
                <p className="text-offwhite-dark text-sm">Business: <span className="text-offwhite">{fromBusiness}</span> · Coverage pre-filled to <span className="text-offwhite">{coverage}</span></p>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Left Column ─────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Step 1 — Vehicle */}
              <div className="bg-charcoal border border-white/10 rounded-2xl p-6 mb-4">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-xs font-semibold text-blue-400 font-mono opacity-70">01</span>
                  <h2 className="font-display text-lg font-bold text-offwhite">Vehicle Type</h2>
                </div>

                {CATS.map(cat => (
                  <div key={cat.name} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-xs font-semibold text-offwhite-dark uppercase tracking-wider">{cat.name}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {cat.vehicles.map((v: any) => (
                        <button
                          key={v.id}
                          onClick={() => {
                            setVehicleId(v.id);
                            if (!v.flat && MATERIALS[material]?.flatOnly) setMaterial('Premium Cast Vinyl (3M / Avery)');
                            setShowResult(false);
                          }}
                          className={`p-3 rounded-xl border text-left text-sm transition-all ${
                            vehicleId === v.id
                              ? 'border-blue-500/40 bg-blue-500/10 text-offwhite'
                              : 'border-white/10 bg-charcoal-light text-offwhite-dark hover:border-white/30'
                          }`}
                        >
                          <div className="font-semibold text-xs leading-tight">{v.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Step 2 — Coverage */}
              <div className={`bg-charcoal border border-white/10 rounded-2xl p-6 mb-4 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-xs font-semibold text-blue-400 font-mono opacity-70">02</span>
                  <h2 className="font-display text-lg font-bold text-offwhite">Wrap Coverage</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  {Object.entries(COVERAGE).map(([name, data]) => (
                    <button
                      key={name}
                      onClick={() => { setCoverage(name); setShowResult(false); }}
                      className={`flex-1 py-4 px-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                        coverage === name
                          ? 'border-blue-500/40 bg-blue-500/10'
                          : 'border-white/10 bg-charcoal-light hover:border-white/30'
                      }`}
                    >
                      <div>
                        <div className={`font-semibold text-sm mb-1 ${coverage === name ? 'text-offwhite' : 'text-offwhite-dark'}`}>{name}</div>
                        <div className="text-xs text-offwhite-dark/60">{data.desc}</div>
                      </div>
                      {coverage === name && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ml-2">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3 — Material */}
              <div className={`bg-charcoal border border-white/10 rounded-2xl p-6 mb-4 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-xs font-semibold text-blue-400 font-mono opacity-70">03</span>
                  <h2 className="font-display text-lg font-bold text-offwhite">Material</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(MATERIALS).map(([name, data]) => {
                    const disabled = !!data.flatOnly && !isFlat;
                    return (
                      <button
                        key={name}
                        onClick={() => { if (!disabled) { setMaterial(name); setShowResult(false); } }}
                        disabled={disabled}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                          disabled
                            ? 'border-white/5 opacity-30 cursor-not-allowed'
                            : effMat === name
                            ? 'border-blue-500/40 bg-blue-500/10'
                            : 'border-white/10 bg-charcoal-light hover:border-white/30'
                        }`}
                      >
                        <div>
                          <div className={`font-semibold text-sm mb-1 ${effMat === name && !disabled ? 'text-offwhite' : 'text-offwhite-dark'}`}>{name}</div>
                          <div className="text-xs text-offwhite-dark/60">{data.desc}</div>
                          {data.flatOnly && <div className="text-xs text-orange-400 mt-1">Flat surfaces only</div>}
                        </div>
                        {effMat === name && !disabled && (
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ml-2">✓</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4 — Quantity */}
              <div className={`bg-charcoal border border-white/10 rounded-2xl p-6 mb-4 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-xs font-semibold text-blue-400 font-mono opacity-70">04</span>
                  <h2 className="font-display text-lg font-bold text-offwhite">How Many Vehicles?</h2>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => { setQty(q => Math.max(1, q - 1)); setShowResult(false); }} className="w-11 h-11 rounded-xl border border-white/10 bg-charcoal-light text-offwhite font-bold text-xl hover:border-blue-500/40 transition-colors flex items-center justify-center">−</button>
                  <span className="text-3xl font-bold text-offwhite w-14 text-center font-mono">{qty}</span>
                  <button onClick={() => { setQty(q => q + 1); setShowResult(false); }} className="w-11 h-11 rounded-xl border border-white/10 bg-charcoal-light text-offwhite font-bold text-xl hover:border-blue-500/40 transition-colors flex items-center justify-center">+</button>
                  {qty > 1 && <span className="text-blue-400 text-sm font-medium">Fleet pricing applied ✓</span>}
                </div>
              </div>

              {/* Calculate Button */}
              {ready && !showResult && (
                <div className="text-center py-6">
                  <button
                    onClick={() => setShowResult(true)}
                    className="btn-primary px-12 py-4 text-base font-bold"
                  >
                    Get My Estimate →
                  </button>
                </div>
              )}

              {/* Result Card */}
              {showResult && calc && (
                <div className="mb-6 animate-fade-up">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-8 text-center relative overflow-hidden">
                    <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-72 h-28 bg-[radial-gradient(ellipse,rgba(59,130,246,.15),transparent)] pointer-events-none" />

                    <div className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">Estimated Price</div>
                    <div className="font-display text-5xl font-bold text-offwhite mb-2">{fmt(calc.total)}</div>
                    <div className="text-sm text-offwhite-dark mb-6">
                      for {coverage.toLowerCase()} on {vehicle?.label}{qty > 1 ? ` × ${qty} vehicles` : ''}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 mb-6">
                      <div>
                        <div className="text-lg font-bold text-offwhite font-mono">{calc.impLow.toLocaleString()}–{calc.impHigh.toLocaleString()}</div>
                        <div className="text-xs text-offwhite-dark uppercase tracking-wider mt-1">Daily Impressions</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-offwhite font-mono">~$0.04</div>
                        <div className="text-xs text-offwhite-dark uppercase tracking-wider mt-1">Est. CPM</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-offwhite font-mono">5–7 yrs</div>
                        <div className="text-xs text-offwhite-dark uppercase tracking-wider mt-1">Wrap Life</div>
                      </div>
                    </div>

                    <p className="text-xs text-offwhite-dark bg-charcoal-light rounded-xl px-4 py-3 mb-6 text-left leading-relaxed">
                      This is a ballpark estimate and includes custom design. Final pricing depends on vehicle condition, design complexity, and turnaround. We'll give you an exact quote after a quick look at the vehicle.
                    </p>

                    <a href="tel:7206791230" className="btn-primary inline-flex items-center gap-2 mb-4">
                      📞 Call (720) 679-1230
                    </a>

                    <div>
                      <button
                        onClick={() => { setVehicleId(''); setCoverage('Full Wrap'); setMaterial('Premium Cast Vinyl (3M / Avery)'); setQty(1); setShowResult(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="btn-outline text-sm"
                      >↺ Start Over</button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* ── Right Column — Quote Summary ─────────────────────────────── */}
            <div className="lg:w-80 xl:w-96">
              <div className="sticky top-24">
                <div className="bg-charcoal border border-white/10 rounded-2xl p-6">
                  <h2 className="font-display text-lg font-bold text-offwhite mb-4">Quote Summary</h2>

                  <div className="bg-charcoal-light rounded-xl p-4 mb-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-offwhite-dark">Vehicle:</span>
                      <span className="text-offwhite text-right max-w-[180px] leading-tight">{vehicle ? vehicle.label : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-offwhite-dark">Coverage:</span>
                      <span className="text-offwhite">{coverage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-offwhite-dark">Material:</span>
                      <span className="text-offwhite text-right max-w-[160px] leading-tight">{effMat}</span>
                    </div>

                    {qty > 1 && (
                      <div className="flex justify-between">
                        <span className="text-offwhite-dark">Vehicles:</span>
                        <span className="text-offwhite">{qty} units</span>
                      </div>
                    )}
                  </div>

                  {/* Cost Breakdown toggle */}
                  {/* Retail Price */}
                  <div className="bg-mint/10 border border-mint/30 rounded-xl p-4 mb-4">
                    <div className="text-offwhite-dark text-xs mb-1">Estimated Retail Price</div>
                    <div className="text-mint font-display text-2xl font-bold">
                      {calc ? fmt(calc.total) : '—'}
                    </div>
                    {calc && qty > 1 && (
                      <div className="text-offwhite-dark text-xs mt-1">{fmt(calc.unit)} per unit</div>
                    )}
                  </div>

                  {/* Impressions */}
                  {calc && (
                    <div className="bg-charcoal-light rounded-xl p-4 mb-4 text-sm">
                      <div className="text-offwhite-dark text-xs mb-2">Estimated Daily Impressions</div>
                      <div className="text-offwhite font-semibold">
                        {calc.impLow.toLocaleString()} – {calc.impHigh.toLocaleString()}
                      </div>
                      <div className="flex justify-between text-xs text-offwhite-dark mt-2">
                        <span>Est. CPM: ~$0.04</span>
                        <span>Wrap Life: 5–7 yrs</span>
                      </div>
                    </div>
                  )}


                  <a href="tel:+17206791230" className="btn-primary w-full text-center block">
                    Get Your Quote — (720) 679-1230
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
