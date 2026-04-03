import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

// ── Internal pricing constants (office use only — not shown to client) ────────
const _RATE        = 15;    // $/sqft base rate
const _OVERPRINT   = 1.15;  // 15% overprint/waste buffer
const _DESIGN_FEE  = 500;   // flat design fee
const _MARKUP      = 2.5;   // final markup multiplier

// ── Vehicle data [minSqft, maxSqft] ──────────────────────────────────────────
const VEHICLES: Record<string, { sqft: [number, number]; icon: string; flat: boolean }> = {
  'Sedan / Coupe':           { sqft: [50,  65],  icon: '🚗', flat: false },
  'SUV / Crossover':         { sqft: [60,  80],  icon: '🚙', flat: false },
  'Pickup Truck':            { sqft: [55,  75],  icon: '🛻', flat: false },
  'Cargo Van':               { sqft: [80,  120], icon: '🚐', flat: false },
  'Sprinter / Transit':      { sqft: [120, 180], icon: '🚌', flat: false },
  'Box Truck (16–26 ft)':    { sqft: [180, 350], icon: '📦', flat: true  },
  'Flatbed / Trailer':       { sqft: [200, 400], icon: '🚛', flat: true  },
  'Fleet Vehicle (per unit)':{ sqft: [50,  120], icon: '🏢', flat: false },
};

// ── Coverage types ────────────────────────────────────────────────────────────
const COVERAGE: Record<string, { multiplier: number; desc: string; spotBase?: boolean }> = {
  'Full Wrap':                   { multiplier: 1.00, desc: 'Complete coverage — maximum impact' },
  'Partial Wrap':                { multiplier: 0.55, desc: 'Strategic panels — great ROI' },
  'Spot Graphics / Lettering':   { multiplier: 0.25, desc: 'Logo, phone, essentials', spotBase: true },
};

// ── Material combos ───────────────────────────────────────────────────────────
const MATERIALS: Record<string, { multiplier: number; flatOnly: boolean; desc: string }> = {
  'Premium Cast Vinyl (3M / Avery)': { multiplier: 1.0, flatOnly: false, desc: 'Industry gold standard — vibrant, durable, 7+ year life' },
  'Standard Calendered Vinyl':        { multiplier: 0.9, flatOnly: true,  desc: 'Made for flat surfaces — trailers, storefronts & box trucks' },
  'Reflective Vinyl':                 { multiplier: 2.0, flatOnly: false, desc: 'Visible day & night — ideal for service vehicles' },
  'Chrome / Specialty Finish':        { multiplier: 2.0, flatOnly: false, desc: 'Head-turning metallic & specialty looks — 1 year warranty' },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function WrapCalculator() {
  const [searchParams] = useSearchParams();
  const fromWrap     = searchParams.get('coverage');
  const fromBusiness = searchParams.get('business');

  const [vehicleType, setVehicleType]   = useState('Sedan / Coupe');
  const [coverageType, setCoverageType] = useState(fromWrap && COVERAGE[fromWrap] ? fromWrap : 'Full Wrap');
  const [material, setMaterial]         = useState('Premium Cast Vinyl (3M / Avery)');
  const [qty, setQty]                   = useState(1);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const vehicle   = VEHICLES[vehicleType];
  const isFlat    = vehicle.flat;

  // If selected material is flatOnly but vehicle isn't flat — reset
  const effectiveMaterial = MATERIALS[material]?.flatOnly && !isFlat
    ? 'Premium Cast Vinyl (3M / Avery)'
    : material;

  // ── Price calculation ─────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const [minSqft, maxSqft] = vehicle.sqft;
    const cov = COVERAGE[coverageType];
    const mat = MATERIALS[effectiveMaterial];

    let unitLow: number, unitHigh: number;

    if (cov.spotBase) {
      // Special spot graphics pricing: $800 base + $8/sqft above 50
      unitLow  = Math.round(800 + Math.max(0, minSqft - 50) * 8);
      unitHigh = Math.round(800 + Math.max(0, maxSqft - 50) * 8);
    } else {
      unitLow  = Math.round((minSqft * cov.multiplier * _OVERPRINT * _RATE * mat.multiplier + _DESIGN_FEE) * _MARKUP);
      unitHigh = Math.round((maxSqft * cov.multiplier * _OVERPRINT * _RATE * mat.multiplier + _DESIGN_FEE) * _MARKUP);
    }

    const priceLow  = unitLow  * qty;
    const priceHigh = unitHigh * qty;

    // Internal cost breakdown (not shown to client)
    const costLow  = Math.round(minSqft * cov.multiplier * _OVERPRINT * _RATE * mat.multiplier + _DESIGN_FEE);
    const costHigh = Math.round(maxSqft * cov.multiplier * _OVERPRINT * _RATE * mat.multiplier + _DESIGN_FEE);

    const sqftLow  = Math.round(minSqft * cov.multiplier * _OVERPRINT);
    const sqftHigh = Math.round(maxSqft * cov.multiplier * _OVERPRINT);

    const impressionsLow  = Math.round(minSqft * 500);
    const impressionsHigh = Math.round(maxSqft * 900);

    const profitLow  = priceLow  - costLow  * qty;
    const profitHigh = priceHigh - costHigh * qty;

    const marginLow  = priceLow  > 0 ? ((profitLow  / priceLow)  * 100).toFixed(1) : '0';
    const marginHigh = priceHigh > 0 ? ((profitHigh / priceHigh) * 100).toFixed(1) : '0';

    return {
      priceLow, priceHigh, unitLow, unitHigh,
      costLow: costLow * qty, costHigh: costHigh * qty,
      sqftLow, sqftHigh, impressionsLow, impressionsHigh,
      profitLow, profitHigh, marginLow, marginHigh,
    };
  }, [vehicleType, coverageType, effectiveMaterial, qty, vehicle]);

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  // ── UI helpers ────────────────────────────────────────────────────────────
  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-charcoal border border-white/10 rounded-2xl p-6 mb-4">
      <h2 className="font-display text-lg font-bold text-offwhite mb-4">{title}</h2>
      {children}
    </div>
  );

  const Label = ({ children }: { children: React.ReactNode }) => (
    <p className="text-sm text-offwhite-dark mb-2">{children}</p>
  );

  return (
    <div className="relative min-h-screen bg-charcoal">
      <MatrixBackground />
      <Navigation />

      <div className="relative z-10 pt-28 pb-20 px-[4vw]">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-offwhite mb-1">Wrap Calculator</h1>
          <p className="text-offwhite-dark mb-4">Configure your wrap project and get instant pricing</p>
          {fromBusiness && (
            <div className="bg-mint/10 border border-mint/30 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-mint font-semibold">Design imported from AI Wrap Generator</p>
                <p className="text-offwhite-dark text-sm">Business: <span className="text-offwhite">{fromBusiness}</span> · Coverage pre-filled to <span className="text-offwhite">{coverageType}</span></p>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Left Column ── */}
            <div className="flex-1 min-w-0">

              {/* Step 1 — Vehicle Type */}
              <Card title="Step 1 — Vehicle Type">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(VEHICLES).map(([name, data]) => (
                    <button
                      key={name}
                      onClick={() => {
                        setVehicleType(name);
                        // reset calendered if switching away from flat
                        if (!data.flat && MATERIALS[material]?.flatOnly) {
                          setMaterial('Premium Cast Vinyl (3M / Avery)');
                        }
                      }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm transition-all ${
                        vehicleType === name
                          ? 'border-mint bg-mint/10 text-mint'
                          : 'border-white/10 bg-charcoal-light text-offwhite-dark hover:border-white/30'
                      }`}
                    >
                      <span className="text-2xl">{data.icon}</span>
                      <span className="text-xs text-center leading-tight">{name}</span>
                      <span className="text-xs opacity-60">{data.sqft[0]}–{data.sqft[1]} sqft</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Step 2 — Wrap Coverage */}
              <Card title="Step 2 — Wrap Coverage">
                <div className="flex flex-col sm:flex-row gap-3">
                  {Object.entries(COVERAGE).map(([name, data]) => (
                    <button
                      key={name}
                      onClick={() => setCoverageType(name)}
                      className={`flex-1 py-4 px-4 rounded-xl border text-left transition-all ${
                        coverageType === name
                          ? 'border-mint bg-mint/10'
                          : 'border-white/10 bg-charcoal-light hover:border-white/30'
                      }`}
                    >
                      <div className={`font-semibold text-sm mb-1 ${coverageType === name ? 'text-mint' : 'text-offwhite'}`}>
                        {name}
                      </div>
                      <div className="text-xs text-offwhite-dark">{data.desc}</div>
                      <div className={`text-xs mt-1 font-medium ${coverageType === name ? 'text-mint' : 'text-offwhite-dark'}`}>
                        {data.spotBase ? 'From $800' : `${Math.round(data.multiplier * 100)}% coverage`}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Step 3 — Material */}
              <Card title="Step 3 — Material Selection">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(MATERIALS).map(([name, data]) => {
                    const disabled = data.flatOnly && !isFlat;
                    return (
                      <button
                        key={name}
                        onClick={() => !disabled && setMaterial(name)}
                        disabled={disabled}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          disabled
                            ? 'border-white/5 opacity-30 cursor-not-allowed'
                            : effectiveMaterial === name
                            ? 'border-mint bg-mint/10'
                            : 'border-white/10 bg-charcoal-light hover:border-white/30'
                        }`}
                      >
                        <div className={`font-semibold text-sm mb-1 ${effectiveMaterial === name && !disabled ? 'text-mint' : 'text-offwhite'}`}>
                          {name}
                        </div>
                        <div className="text-xs text-offwhite-dark">{data.desc}</div>
                        {data.flatOnly && (
                          <div className="text-xs text-orange-400 mt-1">Flat surfaces only</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Step 4 — Quantity */}
              <Card title="Step 4 — Quantity / Fleet">
                <Label>Number of Vehicles</Label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-lg border border-white/10 bg-charcoal-light text-offwhite font-bold text-lg hover:border-mint transition-colors"
                  >−</button>
                  <span className="text-2xl font-bold text-offwhite w-12 text-center">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-10 h-10 rounded-lg border border-white/10 bg-charcoal-light text-offwhite font-bold text-lg hover:border-mint transition-colors"
                  >+</button>
                  {qty > 1 && (
                    <span className="text-mint text-sm font-medium">Fleet pricing applied ✓</span>
                  )}
                </div>
              </Card>
            </div>

            {/* ── Right Column — Quote Summary ── */}
            <div className="lg:w-80 xl:w-96">
              <div className="sticky top-24">
                <div className="bg-charcoal border border-white/10 rounded-2xl p-6">
                  <h2 className="font-display text-lg font-bold text-offwhite mb-4">Quote Summary</h2>

                  {/* Vehicle summary */}
                  <div className="bg-charcoal-light rounded-xl p-4 mb-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-offwhite-dark">Vehicle:</span>
                      <span className="text-offwhite">{VEHICLES[vehicleType].icon} {vehicleType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-offwhite-dark">Coverage:</span>
                      <span className="text-offwhite">{coverageType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-offwhite-dark">Material:</span>
                      <span className="text-offwhite text-right max-w-[160px] leading-tight">{effectiveMaterial}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-offwhite-dark">Est. Sqft:</span>
                      <span className="text-offwhite">{calc.sqftLow}–{calc.sqftHigh} sqft</span>
                    </div>
                    {qty > 1 && (
                      <div className="flex justify-between">
                        <span className="text-offwhite-dark">Vehicles:</span>
                        <span className="text-offwhite">{qty} units</span>
                      </div>
                    )}
                  </div>

                  {/* Cost Breakdown toggle */}
                  <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="flex items-center justify-between w-full text-sm text-offwhite-dark hover:text-offwhite transition-colors mb-3"
                  >
                    <span>Cost Breakdown</span>
                    {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showBreakdown && (
                    <div className="space-y-2 mb-4 text-sm border-t border-white/10 pt-3">
                      <div className="flex justify-between">
                        <span className="text-offwhite-dark">Base Rate:</span>
                        <span className="text-offwhite">${_RATE}/sqft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-offwhite-dark">Waste Buffer:</span>
                        <span className="text-offwhite">15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-offwhite-dark">Design Fee:</span>
                        <span className="text-offwhite">{fmt(_DESIGN_FEE)}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-2">
                        <span className="text-offwhite-dark">Total Range:</span>
                        <span className="text-offwhite">{fmt(calc.priceLow)} – {fmt(calc.priceHigh)}</span>
                      </div>
                    </div>
                  )}

                  {/* Retail Price */}
                  <div className="bg-mint/10 border border-mint/30 rounded-xl p-4 mb-4">
                    <div className="text-offwhite-dark text-xs mb-1">Estimated Retail Price</div>
                    <div className="text-mint font-display text-2xl font-bold">
                      {fmt(calc.priceLow)} – {fmt(calc.priceHigh)}
                    </div>
                    {qty > 1 && (
                      <div className="text-offwhite-dark text-xs mt-1">
                        {fmt(calc.unitLow)} – {fmt(calc.unitHigh)} per unit
                      </div>
                    )}
                  </div>

                  {/* Impressions */}
                  <div className="bg-charcoal-light rounded-xl p-4 mb-4 text-sm">
                    <div className="text-offwhite-dark text-xs mb-2">Estimated Ad Impressions / Year</div>
                    <div className="text-offwhite font-semibold">
                      {calc.impressionsLow.toLocaleString()} – {calc.impressionsHigh.toLocaleString()}
                    </div>
                    <div className="flex justify-between text-xs text-offwhite-dark mt-2">
                      <span>Est. CPM: ~$0.04</span>
                      <span>Wrap Life: 5–7 yrs</span>
                    </div>
                  </div>

                  {/* Office-only section */}
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-xs">
                    <div className="flex items-center gap-2 text-orange-400 font-semibold mb-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      FOR OFFICE USE ONLY — DO NOT SHARE WITH CLIENT
                    </div>
                    <div className="flex justify-between text-offwhite-dark mb-1">
                      <span>Internal Cost:</span>
                      <span className="text-offwhite">{fmt(calc.costLow)} – {fmt(calc.costHigh)}</span>
                    </div>
                    <div className="flex justify-between text-offwhite-dark mb-1">
                      <span>Profit:</span>
                      <span className="text-offwhite">{fmt(calc.profitLow)} – {fmt(calc.profitHigh)}</span>
                    </div>
                    <div className="flex justify-between text-offwhite-dark mb-1">
                      <span>Margin:</span>
                      <span className="text-offwhite">{calc.marginLow}% – {calc.marginHigh}%</span>
                    </div>
                    <div className="flex justify-between text-offwhite-dark">
                      <span>Markup:</span>
                      <span className="text-offwhite">{_MARKUP}x</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <a
                    href="tel:+17206791230"
                    className="btn-primary w-full text-center mt-4 block"
                  >
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
