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

// ── Box truck & pickup identifiers ───────────────────────────────────────────
const BOX_TRUCK_IDS = new Set(['box_10','box_12','box_14','box_16','box_20','box_24','box_26']);
const PICKUP_IDS    = new Set(['reg_cab_pickup','crew_short_pickup','crew_long_pickup']);
const CAB_SQFT_BOX  = 40; // extra sqft when box truck cab is included
const PICKUP_CAB_SQFT: Record<string, number> = {
  'reg_cab_pickup':    20,
  'crew_short_pickup': 22,
  'crew_long_pickup':  22,
};

// ── Vehicle categories with exact sqft ───────────────────────────────────────
const CATS = [
  { name: 'Cars', icon: '🚗', vehicles: [
    { id: 'compact_car',     label: 'Compact (Civic, Corolla, etc.)',       sqft: 45  },
    { id: 'midsize_sedan',   label: 'Mid-Size Sedan (Camry, Accord)',        sqft: 52  },
    { id: 'fullsize_sedan',  label: 'Full-Size Sedan (Charger, Impala)',     sqft: 60  },
  ]},
  { name: 'SUVs & Crossovers', icon: '🚙', vehicles: [
    { id: 'compact_suv',   label: 'Compact SUV (RAV4, CR-V)',               sqft: 55,  price: 4036 },
    { id: 'midsize_suv',   label: 'Mid-Size SUV (4Runner, Explorer)',        sqft: 65,  price: 4527 },
    { id: 'fullsize_suv',  label: 'Full-Size SUV (Tahoe, Expedition)',       sqft: 80  },
  ]},
  { name: 'Pickup Trucks', icon: '🛻', vehicles: [
    { id: 'reg_cab_pickup',    label: 'Regular / Extended Cab',             sqft: 50,  price: 3867 },
    { id: 'crew_short_pickup', label: 'Crew Cab – Short Bed',               sqft: 58,  price: 4129 },
    { id: 'crew_long_pickup',  label: 'Crew Cab – Long Bed',                sqft: 65,  price: 4485 },
  ]},
  { name: 'Cargo Vans', icon: '🚐', vehicles: [
    { id: 'compact_cargo',  label: 'Compact (Transit Connect, NV200)',      sqft: 60  },
    { id: 'std_cargo',      label: 'Standard (Express, E-Series)',          sqft: 90,  price: 4528 },
    { id: 'extended_cargo', label: 'Extended (Express LWB, E-350 Ext)',     sqft: 105, price: 5280 },
  ]},
  { name: 'Sprinter / Transit Vans', icon: '🚌', vehicles: [
    { id: 'sprinter_sr_short', label: 'Standard Roof – Short (144" WB)',    sqft: 105, price: 4637 },
    { id: 'sprinter_sr_long',  label: 'Standard Roof – Long (170" WB)',     sqft: 120, price: 5173 },
    { id: 'sprinter_hr_short', label: 'High Roof – Short (144" WB)',        sqft: 130, price: 4863 },
    { id: 'sprinter_hr_long',  label: 'High Roof – Long (170" WB)',         sqft: 148, price: 5475 },
    { id: 'sprinter_hr_ext',   label: 'High Roof – Extended (170E WB)',     sqft: 168, price: 5838 },
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
    { id: 'trailer_5x12',   label: '5×12 Enclosed Trailer', sqft: 100, flat: true, price: 3217 },
    { id: 'trailer_6x12',   label: '6×12 Enclosed Trailer', sqft: 120, flat: true },
    { id: 'trailer_7x14',   label: '7×14 Enclosed Trailer', sqft: 155, flat: true, price: 4038 },
    { id: 'trailer_7x16',   label: '7×16 Enclosed Trailer', sqft: 178, flat: true, price: 4124 },
    { id: 'trailer_8x20',   label: '8×20 Enclosed Trailer', sqft: 232, flat: true },
    { id: 'trailer_8x24',   label: '8×24 Enclosed Trailer', sqft: 278, flat: true },
    { id: 'trailer_48_semi', label: '48 ft Semi Trailer',   sqft: 500, flat: true },
    { id: 'trailer_53_semi', label: '53 ft Semi Trailer',   sqft: 560, flat: true },
  ]},
] as const;

type Vehicle = { id: string; label: string; sqft: number; flat?: boolean; price?: number };

// Flat lookup map
const VEH_MAP: Record<string, Vehicle> = {};
CATS.forEach(c => c.vehicles.forEach((v: any) => { VEH_MAP[v.id] = v; }));

// ── Fleet discount tiers ──────────────────────────────────────────────────────
const FLEET_TIERS = [
  { min: 10, pct: 0.15, label: '15% fleet discount' },
  { min: 5,  pct: 0.10, label: '10% fleet discount' },
  { min: 3,  pct: 0.05, label: '5% fleet discount'  },
];
function getFleetDiscount(qty: number) {
  return FLEET_TIERS.find(t => qty >= t.min) ?? null;
}

// ── Coverage ──────────────────────────────────────────────────────────────────
const COVERAGE: Record<string, { mult: number; desc: string; spot?: boolean; reflectiveSpot?: boolean; cabOnly?: boolean }> = {
  'Full Wrap':                 { mult: 1.00, desc: 'Complete coverage — maximum impact' },
  'Half Wrap':                 { mult: 0.55, desc: 'Strategic panels — great ROI' },
  'Cab Only':                  { mult: 1.00, desc: 'Cab wrap only — pickup trucks', cabOnly: true },
  'Spot Graphics / Lettering': { mult: 0.25, desc: 'Logo, phone, essentials — starting at $600', spot: true },
  'Reflective Spot Graphics':  { mult: 0.25, desc: 'High-visibility reflective lettering & logos', reflectiveSpot: true },
};

// ── Materials ─────────────────────────────────────────────────────────────────
const MATERIALS: Record<string, { _m: number; flatOnly?: boolean; desc: string }> = {
  'Premium Cast Vinyl (3M / Avery)': { _m: 1.0, desc: 'Industry gold standard — vibrant, durable, 7+ year life' },
  'Standard Calendered Vinyl':       { _m: 0.9, flatOnly: true, desc: 'Budget-friendly for flat surfaces — box trucks, trailers & storefronts. 3–5 yr life.' },
  'Reflective Vinyl':                { _m: 2.0, desc: 'Visible day & night — ideal for service vehicles' },
  'Chrome / Specialty Finish':       { _m: 2.0, desc: 'Head-turning metallic & specialty looks — 1 year warranty' },
};

// ── Finishes ──────────────────────────────────────────────────────────────────
const FINISHES: Record<string, { mult: number; desc: string }> = {
  'Gloss':             { mult: 1.00, desc: 'Classic high-shine finish — most popular' },
  'Satin':             { mult: 1.06, desc: 'Smooth matte sheen — premium look' },
  'Satin / Gloss Mix': { mult: 1.10, desc: 'Contrast gloss & satin panels for a custom two-tone effect' },
};

// ── Toggle Button ─────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-blue-500' : 'bg-white/20'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function WrapCalculator() {
  const [searchParams] = useSearchParams();
  const fromWrap     = searchParams.get('coverage');
  const fromBusiness = searchParams.get('business');

  const [vehicleId, setVehicleId]                   = useState('');
  const [coverage, setCoverage]                     = useState(fromWrap && COVERAGE[fromWrap] ? fromWrap : 'Full Wrap');
  const [material, setMaterial]                     = useState('Premium Cast Vinyl (3M / Avery)');
  const [qty, setQty]                               = useState(1);
  const [showResult, setShowResult]                 = useState(false);
  const [cabWrap, setCabWrap]                       = useState(true);
  const [reflectiveOverlay, setReflectiveOverlay]   = useState(false);
  const [finish, setFinish]                         = useState('Gloss');

  const vehicle    = vehicleId ? VEH_MAP[vehicleId] : null;
  const isFlat     = !!vehicle?.flat;
  const isBoxTruck = BOX_TRUCK_IDS.has(vehicleId);
  const isPickup   = PICKUP_IDS.has(vehicleId);
  const effMat     = MATERIALS[material]?.flatOnly && !isFlat ? 'Premium Cast Vinyl (3M / Avery)' : material;
  const ready      = !!vehicle;

  const calc = useMemo(() => {
    if (!vehicle) return null;
    const cov = COVERAGE[coverage];
    if (!cov) return null;

    // Effective sqft
    let sqft = vehicle.sqft;
    if (isBoxTruck && cabWrap) sqft += CAB_SQFT_BOX;
    if (cov.cabOnly && isPickup) sqft = PICKUP_CAB_SQFT[vehicleId] ?? 20;

    const mat     = MATERIALS[effMat];
    const finMult = (!cov.spot && !cov.reflectiveSpot) ? FINISHES[finish].mult : 1;

    let unit: number;
    if (cov.spot) {
      unit = Math.round(600 + Math.max(0, sqft - 50) * 8);
    } else if (cov.reflectiveSpot) {
      unit = Math.round((600 + Math.max(0, sqft - 50) * 8) * 2);
    } else if (vehicle.price && !cov.cabOnly) {
      // Use exact price for full wrap, scale for partial coverage and material
      unit = Math.round(vehicle.price * cov.mult * mat._m * finMult);
    } else {
      unit = Math.round((sqft * cov.mult * _O * _R * mat._m + _D) * _M * finMult);
    }

    // Reflective overlay surcharge over full wrap (+25%)
    if (coverage === 'Full Wrap' && reflectiveOverlay) {
      unit = Math.round(unit * 1.25);
    }

    // Fleet discount
    const fleetDisc    = getFleetDiscount(qty);
    const discMult     = fleetDisc ? (1 - fleetDisc.pct) : 1;
    const subtotal     = unit * qty;
    const savings      = fleetDisc ? Math.round(subtotal * fleetDisc.pct) : 0;
    const total        = Math.round(subtotal * discMult);
    const impLow       = Math.round(sqft * 500);
    const impHigh      = Math.round(sqft * 900);

    return { unit, total, savings, fleetDisc, impLow, impHigh, sqft };
  }, [vehicleId, coverage, effMat, qty, vehicle, cabWrap, reflectiveOverlay, finish, isBoxTruck, isPickup]);

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  const handleVehicleSelect = (v: any) => {
    setVehicleId(v.id);
    if (!v.flat && MATERIALS[material]?.flatOnly) setMaterial('Premium Cast Vinyl (3M / Avery)');
    // If we're leaving a pickup and Cab Only was selected, reset coverage
    if (!PICKUP_IDS.has(v.id) && coverage === 'Cab Only') setCoverage('Full Wrap');
    setShowResult(false);
  };

  const handleCoverageSelect = (name: string) => {
    setCoverage(name);
    // Clear reflective overlay when leaving Full Wrap
    if (name !== 'Full Wrap') setReflectiveOverlay(false);
    setShowResult(false);
  };

  const handleStartOver = () => {
    setVehicleId('');
    setCoverage('Full Wrap');
    setMaterial('Premium Cast Vinyl (3M / Avery)');
    setQty(1);
    setShowResult(false);
    setCabWrap(true);
    setReflectiveOverlay(false);
    setFinish('Gloss');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
                          onClick={() => handleVehicleSelect(v)}
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

                {/* Box Truck — Cab Wrap Toggle */}
                {isBoxTruck && (
                  <div className="mt-2 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-offwhite">Include Cab Wrap?</div>
                        <div className="text-xs text-offwhite-dark mt-0.5">
                          Wraps the driver cab area — adds ~{CAB_SQFT_BOX} sqft to pricing
                        </div>
                      </div>
                      <Toggle on={cabWrap} onToggle={() => { setCabWrap(w => !w); setShowResult(false); }} />
                    </div>
                    <div className="text-xs mt-2 text-offwhite-dark/60">
                      {cabWrap ? '✓ Cab included in pricing' : '— Box body only pricing'}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2 — Coverage */}
              <div className={`bg-charcoal border border-white/10 rounded-2xl p-6 mb-4 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-xs font-semibold text-blue-400 font-mono opacity-70">02</span>
                  <h2 className="font-display text-lg font-bold text-offwhite">Wrap Coverage</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                  {Object.entries(COVERAGE)
                    .filter(([, data]) => !data.cabOnly || isPickup)
                    .map(([name, data]) => (
                    <button
                      key={name}
                      onClick={() => handleCoverageSelect(name)}
                      className={`flex-1 py-4 px-4 rounded-xl border text-left transition-all flex items-center justify-between min-w-[140px] ${
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

                {/* Reflective Overlay Toggle — only when Full Wrap is selected */}
                {coverage === 'Full Wrap' && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-offwhite">Add Reflective Graphics Overlay?</div>
                        <div className="text-xs text-offwhite-dark mt-0.5">
                          High-visibility reflective accents applied over the full wrap — adds 25%
                        </div>
                      </div>
                      <Toggle on={reflectiveOverlay} onToggle={() => { setReflectiveOverlay(o => !o); setShowResult(false); }} />
                    </div>
                    {reflectiveOverlay && (
                      <div className="text-xs text-blue-400 mt-2">✓ Reflective overlay included — ideal for emergency, utility & service fleets</div>
                    )}
                  </div>
                )}
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

              {/* Step 4 — Finish */}
              <div className={`bg-charcoal border border-white/10 rounded-2xl p-6 mb-4 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-xs font-semibold text-blue-400 font-mono opacity-70">04</span>
                  <h2 className="font-display text-lg font-bold text-offwhite">Finish</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  {Object.entries(FINISHES).map(([name, data]) => (
                    <button
                      key={name}
                      onClick={() => { setFinish(name); setShowResult(false); }}
                      className={`flex-1 py-4 px-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                        finish === name
                          ? 'border-blue-500/40 bg-blue-500/10'
                          : 'border-white/10 bg-charcoal-light hover:border-white/30'
                      }`}
                    >
                      <div>
                        <div className={`font-semibold text-sm mb-1 ${finish === name ? 'text-offwhite' : 'text-offwhite-dark'}`}>
                          {name}
                          {data.mult > 1 && (
                            <span className="ml-2 text-xs text-orange-400">+{Math.round((data.mult - 1) * 100)}%</span>
                          )}
                        </div>
                        <div className="text-xs text-offwhite-dark/60">{data.desc}</div>
                      </div>
                      {finish === name && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ml-2">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 5 — Quantity */}
              <div className={`bg-charcoal border border-white/10 rounded-2xl p-6 mb-4 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-xs font-semibold text-blue-400 font-mono opacity-70">05</span>
                  <h2 className="font-display text-lg font-bold text-offwhite">How Many Vehicles?</h2>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <button onClick={() => { setQty(q => Math.max(1, q - 1)); setShowResult(false); }} className="w-11 h-11 rounded-xl border border-white/10 bg-charcoal-light text-offwhite font-bold text-xl hover:border-blue-500/40 transition-colors flex items-center justify-center">−</button>
                  <span className="text-3xl font-bold text-offwhite w-14 text-center font-mono">{qty}</span>
                  <button onClick={() => { setQty(q => q + 1); setShowResult(false); }} className="w-11 h-11 rounded-xl border border-white/10 bg-charcoal-light text-offwhite font-bold text-xl hover:border-blue-500/40 transition-colors flex items-center justify-center">+</button>
                  {getFleetDiscount(qty) && (
                    <span className="text-green-400 text-sm font-semibold">{getFleetDiscount(qty)!.label} applied ✓</span>
                  )}
                </div>
                {/* Fleet tier ladder */}
                <div className="flex gap-2 flex-wrap">
                  {FLEET_TIERS.slice().reverse().map(t => (
                    <div key={t.min} className={`text-xs px-3 py-1.5 rounded-lg border ${qty >= t.min ? 'border-green-500/40 bg-green-500/10 text-green-400' : 'border-white/10 text-offwhite-dark'}`}>
                      {t.min}+ vehicles → {Math.round(t.pct * 100)}% off
                    </div>
                  ))}
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
                    <div className="font-display text-5xl font-bold text-offwhite mb-1">{fmt(calc.total)}</div>
                    {calc.savings > 0 && (
                      <div className="text-green-400 text-sm font-semibold mb-1">You save {fmt(calc.savings)} with fleet pricing 🎉</div>
                    )}
                    <div className="text-sm text-offwhite-dark mb-6">
                      {coverage.toLowerCase()} on {vehicle?.label}
                      {isBoxTruck && ` (${cabWrap ? 'cab included' : 'box body only'})`}
                      {qty > 1 ? ` × ${qty} vehicles` : ''}
                      {reflectiveOverlay && ' · reflective overlay'}
                      {finish !== 'Gloss' && ` · ${finish} finish`}
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
                      Custom design is <span className="text-offwhite font-semibold">included</span> in this price — design + print + install, all in. Final pricing depends on vehicle condition and turnaround. We'll confirm your exact quote after a quick look at the vehicle.
                    </p>

                    <a href="tel:7206791230" className="btn-primary inline-flex items-center gap-2 mb-4">
                      📞 Call (720) 679-1230
                    </a>

                    <div>
                      <button onClick={handleStartOver} className="btn-outline text-sm">↺ Start Over</button>
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
                    {isBoxTruck && (
                      <div className="flex justify-between">
                        <span className="text-offwhite-dark">Cab Wrap:</span>
                        <span className={cabWrap ? 'text-offwhite' : 'text-offwhite-dark'}>
                          {cabWrap ? 'Yes (included)' : 'No (box only)'}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-offwhite-dark">Coverage:</span>
                      <span className="text-offwhite">{coverage}</span>
                    </div>
                    {coverage === 'Full Wrap' && (
                      <div className="flex justify-between">
                        <span className="text-offwhite-dark">Reflective Overlay:</span>
                        <span className={reflectiveOverlay ? 'text-blue-400' : 'text-offwhite-dark'}>
                          {reflectiveOverlay ? 'Yes (+25%)' : 'No'}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-offwhite-dark">Material:</span>
                      <span className="text-offwhite text-right max-w-[160px] leading-tight">{effMat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-offwhite-dark">Finish:</span>
                      <span className="text-offwhite">
                        {finish}
                        {FINISHES[finish].mult > 1 && (
                          <span className="text-orange-400 text-xs ml-1">+{Math.round((FINISHES[finish].mult - 1) * 100)}%</span>
                        )}
                      </span>
                    </div>
                    {qty > 1 && (
                      <div className="flex justify-between">
                        <span className="text-offwhite-dark">Vehicles:</span>
                        <span className="text-offwhite">{qty} units</span>
                      </div>
                    )}
                    {calc?.fleetDisc && (
                      <div className="flex justify-between">
                        <span className="text-offwhite-dark">Fleet Discount:</span>
                        <span className="text-green-400 font-semibold">−{Math.round(calc.fleetDisc.pct * 100)}% (save {fmt(calc.savings)})</span>
                      </div>
                    )}
                  </div>

                  {/* Retail Price */}
                  <div className="bg-mint/10 border border-mint/30 rounded-xl p-4 mb-4">
                    <div className="text-offwhite-dark text-xs mb-1">Estimated Retail Price</div>
                    <div className="text-mint font-display text-2xl font-bold">
                      {calc ? fmt(calc.total) : '—'}
                    </div>
                    {calc && qty > 1 && (
                      <div className="text-offwhite-dark text-xs mt-1">
                        {fmt(Math.round(calc.total / qty))} per unit{calc.fleetDisc ? ` after ${Math.round(calc.fleetDisc.pct * 100)}% fleet discount` : ''}
                      </div>
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
