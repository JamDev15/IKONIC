import { useState, useMemo } from 'react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

const VEHICLES: Record<string, { sqft: number; baseHours: number }> = {
  'Midsize Sedan':           { sqft: 280, baseHours: 18 },
  'Full Size Sedan':         { sqft: 300, baseHours: 20 },
  'Compact SUV':             { sqft: 310, baseHours: 20 },
  'Midsize SUV':             { sqft: 340, baseHours: 22 },
  'Full Size SUV':           { sqft: 380, baseHours: 25 },
  'Pickup Truck (Reg Cab)':  { sqft: 320, baseHours: 20 },
  'Pickup Truck (Crew Cab)': { sqft: 360, baseHours: 22 },
  'Cargo Van':               { sqft: 420, baseHours: 28 },
  'Full Size Van':           { sqft: 480, baseHours: 32 },
  'Box Truck (15 ft)':       { sqft: 580, baseHours: 36 },
  'Box Truck (20 ft+)':      { sqft: 720, baseHours: 44 },
};

const WRAP_COVERAGE: Record<string, number> = {
  'Full Wrap':     1.00,
  '¾ Wrap':        0.75,
  'Half Wrap':     0.50,
  'Quarter Wrap':  0.25,
};

const PRINT_COMBOS: Record<string, number> = {
  '3M IJ180Cv3 + 8518 Laminate':       3.20,
  'Avery MPI 1005 + DOL 1360':          2.95,
  'Arlon SLX + 3268 Laminate':          3.45,
  '3M 2080 Color Change Film':          4.50,
  'Avery Supreme Wrapping Film':        4.20,
  'Oracal 970RA Premium Wrapping Cast': 3.80,
  'Custom (manual entry)':              0,
};

const COMPLEXITY_FACTORS = [
  { id: 'mirrors',      label: 'Mirrors',       waste: 2, hours: 0.5 },
  { id: 'roofRails',   label: 'Roof Rails',     waste: 3, hours: 1.0 },
  { id: 'rivets',      label: 'Rivets',         waste: 5, hours: 2.0 },
  { id: 'deepRecesses',label: 'Deep Recesses',  waste: 4, hours: 1.5 },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function WrapCalculator() {
  // Job Config
  const [wrapCategory, setWrapCategory] = useState<'color' | 'print'>('print');
  const [jobType, setJobType] = useState<'printInstall' | 'printOnly' | 'installOnly'>('installOnly');

  // Material
  const [printCombo, setPrintCombo] = useState('');
  const [customMaterialCost, setCustomMaterialCost] = useState(0);

  // Vehicle
  const [vehicleType, setVehicleType] = useState('Midsize Sedan');
  const [wrapType, setWrapType] = useState('Full Wrap');
  const [excludeRoof, setExcludeRoof] = useState(false);
  const [rollWidth, setRollWidth] = useState<54 | 60>(54);
  const [wasteBuffer, setWasteBuffer] = useState(15);

  // Complexity
  const [complexity, setComplexity] = useState<Record<string, boolean>>({
    mirrors: false, roofRails: false, rivets: false, deepRecesses: false,
  });

  // Pricing
  const [designFee, setDesignFee] = useState(500);
  const [overhead, setOverhead] = useState(100);
  const [pricingModel, setPricingModel] = useState<'margin' | 'markup'>('markup');
  const [markupPct, setMarkupPct] = useState(50);
  const [marginPct, setMarginPct] = useState(33);
  const [depositPct, setDepositPct] = useState(0);

  // Labor
  const [laborOverride, setLaborOverride] = useState('');
  const [laborRate, setLaborRate] = useState(75);

  // UI
  const [showBreakdown, setShowBreakdown] = useState(false);

  // ── Calculations ─────────────────────────────────────────────────────────────

  const calc = useMemo(() => {
    const vehicle = VEHICLES[vehicleType] || VEHICLES['Midsize Sedan'];

    // Sqft
    const coverage = WRAP_COVERAGE[wrapType] || 1;
    const roofDeduction = excludeRoof ? 22 : 0;
    const baseSqft = Math.round((vehicle.sqft - roofDeduction) * coverage);

    // Waste
    const complexityWaste = COMPLEXITY_FACTORS.reduce((sum, f) =>
      complexity[f.id] ? sum + f.waste : sum, 0);
    const totalWastePct = wasteBuffer + complexityWaste;
    const adjustedSqft = Math.round(baseSqft * (1 + totalWastePct / 100));

    // Linear feet
    const linearFeet = Math.round((adjustedSqft * 144) / rollWidth);

    // Hours
    const complexityHours = COMPLEXITY_FACTORS.reduce((sum, f) =>
      complexity[f.id] ? sum + f.hours : sum, 0);
    const baseHours = vehicle.baseHours * coverage;
    const totalHours = laborOverride ? parseFloat(laborOverride) : baseHours + complexityHours;

    // Costs
    const materialPricePerSqft = printCombo === 'Custom (manual entry)'
      ? customMaterialCost
      : (PRINT_COMBOS[printCombo] || 0);
    const materialCost = adjustedSqft * materialPricePerSqft;
    const laborCost = totalHours * laborRate;
    const applicableDesignFee = jobType === 'installOnly' ? 0 : designFee;
    const totalCost = materialCost + laborCost + applicableDesignFee + overhead;

    // Retail
    let retailPrice = 0;
    if (pricingModel === 'markup') {
      retailPrice = totalCost * (1 + markupPct / 100);
    } else {
      retailPrice = marginPct >= 100 ? totalCost : totalCost / (1 - marginPct / 100);
    }

    const profit = retailPrice - totalCost;
    const actualMargin = retailPrice > 0 ? (profit / retailPrice) * 100 : 0;
    const deposit = retailPrice * (depositPct / 100);

    return {
      baseSqft, adjustedSqft, linearFeet,
      baseHours: Math.round(baseHours * 10) / 10,
      complexityHours: Math.round(complexityHours * 10) / 10,
      totalHours: Math.round(totalHours * 10) / 10,
      materialCost, laborCost, applicableDesignFee, totalCost,
      retailPrice, profit, actualMargin, deposit,
    };
  }, [wrapCategory, jobType, printCombo, customMaterialCost, vehicleType, wrapType,
      excludeRoof, rollWidth, wasteBuffer, complexity, designFee, overhead,
      pricingModel, markupPct, marginPct, depositPct, laborRate, laborOverride]);

  const fmt = (n: number) => `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

  // ── UI Helpers ────────────────────────────────────────────────────────────────

  const ToggleBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
        active
          ? 'border-mint bg-mint/10 text-mint'
          : 'border-white/10 bg-charcoal-light text-offwhite-dark hover:border-white/30'
      }`}
    >
      {children}
    </button>
  );

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-charcoal border border-white/10 rounded-2xl p-6 mb-4">
      <h2 className="font-display text-lg font-bold text-offwhite mb-4">{title}</h2>
      {children}
    </div>
  );

  const Label = ({ children }: { children: React.ReactNode }) => (
    <p className="text-sm text-offwhite-dark mb-2">{children}</p>
  );

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-charcoal">
      <MatrixBackground />
      <Navigation />

      <div className="relative z-10 pt-28 pb-20 px-[4vw]">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-offwhite mb-1">Wrap Calculator</h1>
          <p className="text-offwhite-dark mb-8">Configure your wrap project and get instant pricing</p>

          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Left Column ── */}
            <div className="flex-1 min-w-0">

              {/* Job Configuration */}
              <Card title="Job Configuration">
                <Label>Wrap Category — Choose your wrap type first</Label>
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => setWrapCategory('color')}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm text-left transition-all ${
                      wrapCategory === 'color' ? 'border-mint bg-mint/10 text-mint' : 'border-white/10 bg-charcoal-light text-offwhite-dark hover:border-white/30'
                    }`}
                  >
                    <div className="font-semibold">Color Change</div>
                    <div className="text-xs opacity-70">Solid Vinyl</div>
                  </button>
                  <button
                    onClick={() => setWrapCategory('print')}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm text-left transition-all ${
                      wrapCategory === 'print' ? 'border-mint bg-mint/10 text-mint' : 'border-white/10 bg-charcoal-light text-offwhite-dark hover:border-white/30'
                    }`}
                  >
                    <div className="font-semibold">Commercial Print</div>
                    <div className="text-xs opacity-70">Printed Graphics</div>
                  </button>
                </div>

                <Label>Job Type</Label>
                <div className="flex gap-2">
                  {(['printInstall', 'printOnly', 'installOnly'] as const).map((jt) => (
                    <ToggleBtn key={jt} active={jobType === jt} onClick={() => setJobType(jt)}>
                      {jt === 'printInstall' ? 'Print + Install' : jt === 'printOnly' ? 'Print Only' : 'Install Only'}
                    </ToggleBtn>
                  ))}
                </div>
              </Card>

              {/* Material Selection */}
              <Card title="Material Selection">
                <Label>Print Vinyl + Laminate Combo — Select a combo to auto-populate costs</Label>
                <div className="relative">
                  <select
                    value={printCombo}
                    onChange={e => setPrintCombo(e.target.value)}
                    className="w-full bg-charcoal-light border border-white/10 rounded-lg px-4 py-3 text-offwhite text-sm appearance-none focus:outline-none focus:border-mint"
                  >
                    <option value="">Select print combo...</option>
                    {Object.keys(PRINT_COMBOS).map(k => (
                      <option key={k} value={k}>{k} {PRINT_COMBOS[k] ? `— $${PRINT_COMBOS[k].toFixed(2)}/sqft` : ''}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-offwhite-dark pointer-events-none" />
                </div>
                {printCombo === 'Custom (manual entry)' && (
                  <div className="mt-3">
                    <Label>Custom material cost ($/sqft)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-offwhite-dark text-sm">$</span>
                      <input
                        type="number"
                        value={customMaterialCost}
                        onChange={e => setCustomMaterialCost(parseFloat(e.target.value) || 0)}
                        className="w-full bg-charcoal-light border border-white/10 rounded-lg pl-7 pr-4 py-3 text-offwhite text-sm focus:outline-none focus:border-mint"
                      />
                    </div>
                  </div>
                )}
              </Card>

              {/* Vehicle & Wrap Type */}
              <Card title="Vehicle & Wrap Type">
                <Label>Vehicle Type</Label>
                <div className="relative mb-4">
                  <select
                    value={vehicleType}
                    onChange={e => setVehicleType(e.target.value)}
                    className="w-full bg-charcoal-light border border-white/10 rounded-lg px-4 py-3 text-offwhite text-sm appearance-none focus:outline-none focus:border-mint"
                  >
                    {Object.keys(VEHICLES).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-offwhite-dark pointer-events-none" />
                </div>

                <Label>Wrap Type</Label>
                <div className="relative mb-4">
                  <select
                    value={wrapType}
                    onChange={e => setWrapType(e.target.value)}
                    className="w-full bg-charcoal-light border border-white/10 rounded-lg px-4 py-3 text-offwhite text-sm appearance-none focus:outline-none focus:border-mint"
                  >
                    {Object.keys(WRAP_COVERAGE).map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-offwhite-dark pointer-events-none" />
                </div>

                <label className="flex items-center gap-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:border-white/30 mb-4">
                  <input
                    type="checkbox"
                    checked={excludeRoof}
                    onChange={e => setExcludeRoof(e.target.checked)}
                    className="w-4 h-4 accent-mint"
                  />
                  <div>
                    <div className="text-offwhite text-sm font-medium">Exclude Roof</div>
                    <div className="text-offwhite-dark text-xs">Remove roof from wrap coverage (saves ~22 sqft, ~3.0 hrs)</div>
                  </div>
                </label>

                <Label>Roll Width</Label>
                <div className="flex gap-3 mb-4">
                  {([54, 60] as const).map(w => (
                    <ToggleBtn key={w} active={rollWidth === w} onClick={() => setRollWidth(w)}>
                      {w}"
                    </ToggleBtn>
                  ))}
                </div>

                <div className="flex justify-between text-sm mb-1">
                  <Label>Base Waste Buffer</Label>
                  <span className="text-mint font-semibold">{wasteBuffer}%</span>
                </div>
                <input
                  type="range" min={5} max={30} value={wasteBuffer}
                  onChange={e => setWasteBuffer(parseInt(e.target.value))}
                  className="w-full accent-mint"
                />
                <div className="flex justify-between text-xs text-offwhite-dark mt-1">
                  <span>5%</span><span>30%</span>
                </div>
              </Card>

              {/* Complexity Factors */}
              <Card title="Complexity Factors">
                <p className="text-sm text-offwhite-dark mb-4">Select any factors that add complexity to this job</p>
                <div className="grid grid-cols-2 gap-3">
                  {COMPLEXITY_FACTORS.map(f => (
                    <label key={f.id} className="flex items-start gap-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:border-white/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={complexity[f.id]}
                        onChange={e => setComplexity(prev => ({ ...prev, [f.id]: e.target.checked }))}
                        className="w-4 h-4 accent-mint mt-0.5"
                      />
                      <div>
                        <div className="text-offwhite text-sm font-medium">{f.label}</div>
                        <div className="text-offwhite-dark text-xs">+{f.waste}% waste, +{f.hours} hrs</div>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Pricing */}
              <Card title="Pricing">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Design Fee (flat)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-offwhite-dark text-sm">$</span>
                      <input
                        type="number"
                        value={designFee}
                        onChange={e => setDesignFee(parseFloat(e.target.value) || 0)}
                        className="w-full bg-charcoal-light border border-white/10 rounded-lg pl-7 pr-4 py-3 text-offwhite text-sm focus:outline-none focus:border-mint"
                      />
                    </div>
                    {jobType === 'installOnly' && (
                      <p className="text-orange-400 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Design fee not applied for Install Only jobs
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Overhead & Supplies (flat)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-offwhite-dark text-sm">$</span>
                      <input
                        type="number"
                        value={overhead}
                        onChange={e => setOverhead(parseFloat(e.target.value) || 0)}
                        className="w-full bg-charcoal-light border border-white/10 rounded-lg pl-7 pr-4 py-3 text-offwhite text-sm focus:outline-none focus:border-mint"
                      />
                    </div>
                  </div>
                </div>

                <Label>Pricing Model</Label>
                <div className="flex gap-2 mb-4">
                  <ToggleBtn active={pricingModel === 'margin'} onClick={() => setPricingModel('margin')}>Margin-Based</ToggleBtn>
                  <ToggleBtn active={pricingModel === 'markup'} onClick={() => setPricingModel('markup')}>Markup-Based</ToggleBtn>
                </div>

                {pricingModel === 'markup' ? (
                  <>
                    <div className="flex justify-between text-sm mb-1">
                      <Label>Markup Percentage</Label>
                      <span className="text-mint font-semibold">{markupPct}%</span>
                    </div>
                    <input type="range" min={10} max={300} value={markupPct}
                      onChange={e => setMarkupPct(parseInt(e.target.value))}
                      className="w-full accent-mint mb-1"
                    />
                    <div className="flex justify-between text-xs text-offwhite-dark"><span>10%</span><span>300% (max)</span></div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm mb-1">
                      <Label>Margin Percentage</Label>
                      <span className="text-mint font-semibold">{marginPct}%</span>
                    </div>
                    <input type="range" min={1} max={90} value={marginPct}
                      onChange={e => setMarginPct(parseInt(e.target.value))}
                      className="w-full accent-mint mb-1"
                    />
                    <div className="flex justify-between text-xs text-offwhite-dark"><span>1%</span><span>90% (max)</span></div>
                  </>
                )}

                <div className="flex justify-between text-sm mt-4 mb-1">
                  <Label>Deposit Required</Label>
                  <span className="text-mint font-semibold">{depositPct}%</span>
                </div>
                <input type="range" min={0} max={100} value={depositPct}
                  onChange={e => setDepositPct(parseInt(e.target.value))}
                  className="w-full accent-mint mb-1"
                />
                <div className="flex justify-between text-xs text-offwhite-dark"><span>0% (None)</span><span>100% (Full)</span></div>
              </Card>

              {/* Labor Hours */}
              <Card title="Labor Hours">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Manual Override (hours)</Label>
                    <input
                      type="number"
                      placeholder="Auto-calculated"
                      value={laborOverride}
                      onChange={e => setLaborOverride(e.target.value)}
                      className="w-full bg-charcoal-light border border-white/10 rounded-lg px-4 py-3 text-offwhite text-sm focus:outline-none focus:border-mint placeholder:text-offwhite-dark/50"
                    />
                  </div>
                  <div>
                    <Label>Labor Rate ($/hour)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-offwhite-dark text-sm">$</span>
                      <input
                        type="number"
                        value={laborRate}
                        onChange={e => setLaborRate(parseFloat(e.target.value) || 0)}
                        className="w-full bg-charcoal-light border border-white/10 rounded-lg pl-7 pr-4 py-3 text-offwhite text-sm focus:outline-none focus:border-mint"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 bg-charcoal-light rounded-xl p-4">
                  <div>
                    <div className="text-xs text-offwhite-dark mb-1">Base Hours</div>
                    <div className="text-offwhite font-semibold">{calc.baseHours}</div>
                  </div>
                  <div>
                    <div className="text-xs text-offwhite-dark mb-1">Complexity Hours</div>
                    <div className="text-mint font-semibold">+{calc.complexityHours}</div>
                  </div>
                  <div>
                    <div className="text-xs text-offwhite-dark mb-1">Total Hours</div>
                    <div className="text-offwhite font-semibold">{calc.totalHours}</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* ── Right Column — Quote Summary ── */}
            <div className="lg:w-80 xl:w-96">
              <div className="sticky top-24">
                <div className="bg-charcoal border border-white/10 rounded-2xl p-6">
                  <h2 className="font-display text-lg font-bold text-offwhite mb-4">Quote Summary</h2>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-offwhite-dark">Base Sqft:</span>
                      <span className="text-offwhite font-medium">{calc.baseSqft} sqft</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-offwhite-dark">Adjusted Sqft:</span>
                      <span className="text-offwhite font-medium">{calc.adjustedSqft} sqft</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-offwhite-dark">Linear Feet:</span>
                      <span className="text-offwhite font-medium">{calc.linearFeet} ft</span>
                    </div>
                    {depositPct > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-offwhite-dark">Deposit ({depositPct}%):</span>
                        <span className="text-offwhite font-medium">{fmt(calc.deposit)}</span>
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
                        <span className="text-offwhite-dark">Material</span>
                        <span className="text-offwhite">{fmt(calc.materialCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-offwhite-dark">Labor ({calc.totalHours} hrs × ${laborRate})</span>
                        <span className="text-offwhite">{fmt(calc.laborCost)}</span>
                      </div>
                      {calc.applicableDesignFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-offwhite-dark">Design Fee</span>
                          <span className="text-offwhite">{fmt(calc.applicableDesignFee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-offwhite-dark">Overhead & Supplies</span>
                        <span className="text-offwhite">{fmt(overhead)}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-2 font-medium">
                        <span className="text-offwhite-dark">Total Cost</span>
                        <span className="text-offwhite">{fmt(calc.totalCost)}</span>
                      </div>
                    </div>
                  )}

                  {/* Retail Price */}
                  <div className="bg-mint/10 border border-mint/30 rounded-xl p-4 mb-4">
                    <div className="text-offwhite-dark text-xs mb-1">Retail Price</div>
                    <div className="text-mint font-display text-3xl font-bold">{fmt(calc.retailPrice)}</div>
                  </div>

                  {/* Office-only info */}
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-xs">
                    <div className="flex items-center gap-2 text-orange-400 font-semibold mb-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      FOR OFFICE USE ONLY — DO NOT SHARE WITH CLIENT
                    </div>
                    <div className="flex justify-between text-offwhite-dark mb-1">
                      <span>Profit:</span>
                      <span className="text-offwhite">{fmt(calc.profit)}</span>
                    </div>
                    <div className="flex justify-between text-offwhite-dark mb-1">
                      <span>Margin:</span>
                      <span className="text-offwhite">{calc.actualMargin.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-offwhite-dark">
                      <span>Cost:</span>
                      <span className="text-offwhite">{fmt(calc.totalCost)}</span>
                    </div>
                  </div>
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
