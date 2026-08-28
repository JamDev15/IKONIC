import type { ServiceData } from './ServicePage';

/**
 * Content for the six architectural-film & graphics service pages. Each entry is
 * rendered by <ServicePage>. Paths are unchanged from the old prerendered static
 * HTML so no SEO equity is lost:
 *   /window-tint  /window-tint/home  /window-tint/office
 *   /storefront-graphics  /signage  /wayfinding
 * Crawler shells for these routes live in scripts/prerender-routes.mjs — keep the
 * copy there roughly in sync with the leads/FAQ below.
 */

const windowFilm: ServiceData = {
  path: '/window-tint',
  seoTitle: 'Architectural Window Film in Denver | ikonic303',
  seoDescription:
    'Architectural window film for Denver homes and businesses — heat, glare, UV, privacy, security, and decorative films on flat glass. We check your glass first. Free on-site quote.',
  schemaServiceType: 'Architectural Window Film',
  schemaName: 'Architectural Window Film — Flat Glass',
  schemaDescription:
    "Architectural (flat-glass) window film for residential and commercial buildings in the Denver metro — heat-rejection, glare, UV, privacy, security, anti-graffiti, and decorative films. Every window is checked against the film manufacturer's glass compatibility chart before a quote is issued.",
  eyebrow: 'ARCHITECTURAL WINDOW FILM',
  h1: (
    <>
      Architectural Window Film in <span className="text-mint">Denver, Colorado</span>
    </>
  ),
  lead: "ikonic installs architectural window film on the flat glass in homes and buildings across the Denver metro — film that rejects solar heat, cuts glare, blocks UV, adds privacy or security, or creates a frosted or decorative look, all without replacing a single window. We identify your glass and match it to the film before we quote, so nothing cracks a pane or voids a seal warranty.",
  sections: [
    {
      heading: 'What architectural film does',
      body: (
        <>
          <p>
            <strong>Heat &amp; glare rejection.</strong> Spectrally-selective film turns down the
            solar heat on west- and south-facing glass while staying nearly clear, so a room stops
            overheating in the afternoon without losing its daylight. Less heat gain means a lower
            cooling load all summer.
          </p>
          <p>
            <strong>UV protection.</strong> Quality film blocks up to 99% of ultraviolet light —
            the main cause of fading in wood floors, upholstery, artwork, and retail merchandise
            near the glass.
          </p>
          <p>
            <strong>Privacy &amp; decorative film.</strong> Frosted, etched-glass, gradient, and
            patterned films add privacy to conference rooms, bathrooms, and street-facing glass,
            or brand a lobby — without bricking up the window.
          </p>
          <p>
            <strong>Security &amp; safety film.</strong> Thick, tear-resistant film holds broken
            glass in the frame after an impact, slowing forced entry and containing storm and
            accident damage.
          </p>
          <p>
            <strong>Anti-graffiti film.</strong> A clear sacrificial layer on storefront and
            ground-floor glass: if it gets etched or tagged, the film is peeled and replaced for a
            fraction of the cost of the glass.
          </p>
        </>
      ),
    },
    {
      heading: 'We check your glass first',
      body: (
        <p>
          Dual-pane, low-e, tempered, laminated, and single-pane annealed glass each handle
          absorbed heat differently. The wrong film on the wrong glass is the most common cause of
          thermal-stress cracks and voided window warranties, so every quote starts with us
          identifying the glass on-site and matching it to the film manufacturer's compatibility
          chart. If a window isn't a safe candidate, we tell you before you commit.
        </p>
      ),
    },
    {
      heading: 'Residential & commercial',
      body: (
        <p>
          For homes, film fixes hot upstairs rooms, sun-faded floors, and harsh afternoon light
          without changing how the house looks from the street. For businesses, it cuts cooling
          costs and screen glare across offices, clinics, and multi-tenant buildings — and
          commercial installs can be scheduled after hours so no one loses a workday. Building and
          storefront film is installed on-site across Wheat Ridge, Arvada, Lakewood, Golden, and
          greater Denver.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: 'What is architectural window film?',
      a: 'A thin, optically clear film applied to existing flat glass that can reject heat, cut glare, block UV, add privacy, hold broken glass together, or create a decorative look — without replacing the window.',
    },
    {
      q: 'Will it make my rooms dark?',
      a: 'Not with a spectrally-selective heat film, which stays nearly clear. Darker and reflective films are options when privacy or a specific look is the point.',
    },
    {
      q: 'Does film help with energy bills?',
      a: 'Yes — it lowers the cooling load on the glass that gains the most summer heat, and evens out hot and cold spots so a space is comfortable at the same thermostat setting.',
    },
    {
      q: 'Why do you check the glass before quoting?',
      a: "Because the wrong film on the wrong glass can cause thermal-stress cracks or void the window's seal warranty. We match your specific glass to the film manufacturer's chart first.",
    },
  ],
  related: [
    { label: 'Residential Window Tint', to: '/window-tint/home' },
    { label: 'Commercial Window Tint', to: '/window-tint/office' },
    { label: 'Storefront Window Film', to: '/window-tint/storefront', external: true },
    { label: 'Security & Safety Film', to: '/window-tint/security-film', external: true },
    { label: 'Decorative & Privacy Film', to: '/window-tint/decorative-privacy', external: true },
    { label: 'Storefront & Window Graphics', to: '/storefront-graphics' },
  ],
  ctaTitle: 'Get a free on-site quote',
  ctaBody:
    'Tell us the building, the windows, and what you want the glass to do. We check the glass, confirm the right film, and send you one written number — no surprise add-ons.',
};

const residentialTint: ServiceData = {
  path: '/window-tint/home',
  seoTitle: 'Home Window Tinting in Denver | ikonic303',
  seoDescription:
    'Home window film for hot upstairs rooms, sun-faded floors, and harsh afternoon glare in the Denver west metro. Free written quote after we check your glass.',
  schemaServiceType: 'Residential Window Tinting',
  schemaName: 'Residential Window Tint',
  schemaDescription:
    'Flat-glass residential window film in the Denver metro for heat, glare, UV fade protection, and privacy — installed in a single visit after the home’s glass is checked against the film compatibility chart.',
  eyebrow: 'RESIDENTIAL WINDOW TINT',
  h1: (
    <>
      Home Window Tinting in the <span className="text-mint">Denver West Metro</span>
    </>
  ),
  lead: "The upstairs bedroom nobody wants to sleep in. The west-facing living room that turns into a greenhouse every afternoon. The hardwood floor that's noticeably lighter in the one patch that gets direct sun. These are the calls ikonic gets most from homeowners in Wheat Ridge, Arvada, Lakewood, and Golden — and window film is usually the fix, without losing the view or the light that made you buy the house.",
  sections: [
    {
      heading: 'What home window film actually fixes',
      body: (
        <p>
          Most homeowners come to us for one of four things: a room that's too hot to use in the
          afternoon, glare that makes a TV or laptop screen unusable at certain times of day, UV
          fading on floors, furniture, and artwork, or privacy on windows that face the street or
          a neighbor without living behind closed blinds. Solar film addresses the first three
          directly by rejecting heat and UV before it comes through the glass. Privacy is a
          separate product choice — frosted or decorative film for a bathroom or street-facing
          window, versus a lighter solar film for a living room where you still want to see out.
        </p>
      ),
    },
    {
      heading: 'We check your glass before we quote',
      body: (
        <p>
          The wrong film on the wrong glass can cause real problems, from uneven heat absorption
          to a cracked pane on older or dual-pane windows. Before any home job gets a number, we
          identify the glass — single or dual-pane, coated or clear — and check it against the
          film manufacturer's compatibility chart. If something needs a closer look before we can
          safely quote it, we'll tell you instead of guessing.
        </p>
      ),
    },
    {
      heading: 'How it works',
      body: (
        <p>
          <strong>1. Tell us about your windows.</strong> A phone call or the contact form covers
          pane type, rough size, and what you're trying to fix. <strong>2. Get a written
          quote.</strong> Within one business day, with an exact number — no price until your
          specific glass is confirmed safe for the film. <strong>3. One-day installation at your
          home.</strong> Most houses are finished in a single visit, by appointment.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: 'Will home window film make my rooms dark?',
      a: "Not unless you want it to. Solar films are built to cut heat and glare while staying close to clear; a darker or frosted look for a specific room is a separate choice.",
    },
    {
      q: 'Can film protect my hardwood floors and furniture from fading?',
      a: 'Yes — UV is the biggest driver of fading, and film blocks the large majority of it without changing how a room looks.',
    },
    {
      q: "Do you tint nursery or kids' room windows?",
      a: "Often, yes. UV and heat control matter most in rooms that get direct afternoon sun, and we'll flag if your specific glass needs a closer look first.",
    },
  ],
  related: [
    { label: 'Architectural Window Film', to: '/window-tint' },
    { label: 'Commercial Window Tint', to: '/window-tint/office' },
    { label: 'Decorative & Privacy Film', to: '/window-tint/decorative-privacy', external: true },
  ],
  ctaTitle: 'See what your specific windows need',
  ctaBody:
    "Tell us which rooms and what you're trying to fix. We check the glass and send one written quote, usually within a business day.",
};

const commercialTint: ServiceData = {
  path: '/window-tint/office',
  seoTitle: 'Office Window Tinting & Glare Control Denver | ikonic303',
  seoDescription:
    'Office and commercial window film in the Denver metro for screen glare, heat load, and conference-room privacy. Scoped room by room, installed around your business hours.',
  schemaServiceType: 'Commercial Window Tinting',
  schemaName: 'Commercial & Office Window Tint',
  schemaDescription:
    'Flat-glass commercial window film for offices, clinics, and multi-tenant buildings in the Denver metro — glare control, solar heat reduction, and privacy film, scoped room by room and installed after hours.',
  eyebrow: 'COMMERCIAL WINDOW TINT',
  h1: (
    <>
      Office Window Tinting &amp; <span className="text-mint">Glare Control</span>
    </>
  ),
  lead: 'Screen glare that forces someone to close the blinds at 2pm every day. A conference room with a wall of glass and zero privacy for a sensitive conversation. A west-facing floor where the HVAC runs constantly from noon to close. These are office problems, and they’re solvable with the right film on the right glass — not a whole-building retrofit.',
  sections: [
    {
      heading: 'Where office film earns its keep',
      body: (
        <p>
          Glare control is the most common request: monitor glare that makes a workstation
          unusable at certain times of day, especially on west-facing glass in the afternoon.
          Second is heat — glass walls and floor-to-ceiling windows look great and also turn a
          room into a greenhouse, running the HVAC harder than it should. Third is privacy:
          conference rooms and executive offices with interior or exterior glass that need to go
          opaque for certain conversations without permanent construction.
        </p>
      ),
    },
    {
      heading: 'We check your glass before we quote',
      body: (
        <p>
          Commercial glass varies more than most people expect — coated, low-e, tempered,
          laminated, single or dual-pane — and the wrong film on the wrong glass can cause thermal
          stress or void a warranty. Before any office job gets a number, we identify the glass
          and confirm the film against the manufacturer's compatibility chart.
        </p>
      ),
    },
    {
      heading: 'Multi-tenant and property-manager jobs',
      body: (
        <p>
          A meaningful share of ikonic's office work comes through property managers handling
          several tenants in one building — one floor wants glare control, another wants
          conference-room privacy, and a shared lobby wants something intentional rather than a
          patchwork of blinds. Because jobs are quoted room by room, a property manager can roll
          film out floor by floor as budget allows instead of committing to the whole building at
          once. Installation is scheduled around business hours so it doesn't disrupt the workday.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: 'Will tinting our office windows help with the AC bill?',
      a: 'It reduces the heat load coming through the glass, which reduces what the HVAC has to fight — particularly on west- and south-facing glass in the afternoon.',
    },
    {
      q: 'Can you do just the conference room, not the whole floor?',
      a: 'Yes. Most office jobs are scoped room by room or window by window, not the whole building at once.',
    },
    {
      q: 'Does film interfere with WiFi or cell signal?',
      a: "Standard solar and privacy films don't block RF signal; that's specific to older metallized films, which we'll flag if it's ever relevant to your glass.",
    },
  ],
  related: [
    { label: 'Architectural Window Film', to: '/window-tint' },
    { label: 'Storefront Window Film', to: '/window-tint/storefront', external: true },
    { label: 'Storefront & Window Graphics', to: '/storefront-graphics' },
  ],
  ctaTitle: 'Scope your office glass in a quick call',
  ctaBody:
    "Tell us the building, the rooms, and whether it's glare, heat, or privacy. We scope the actual rooms involved and send one written quote.",
};

const storefrontGraphics: ServiceData = {
  path: '/storefront-graphics',
  seoTitle: 'Storefront Window Graphics & Wall Murals Denver | ikonic303',
  seoDescription:
    'Custom storefront window graphics, frosted privacy vinyl, perforated film, wall murals, and interior branding — designed and printed in-house, installed on-site across the Denver metro.',
  schemaServiceType: 'Storefront Graphics and Window Graphics',
  schemaName: 'Storefront & Window Graphics',
  schemaDescription:
    'Design, print, and on-site installation of storefront window graphics, frosted and perforated window film, wall murals, interior branding, and floor and door graphics for businesses across the Denver metro.',
  eyebrow: 'STOREFRONT & WINDOW GRAPHICS',
  h1: (
    <>
      Storefront Graphics &amp; Wall Murals That{' '}
      <span className="text-mint">Pull Customers In</span>
    </>
  ),
  lead: "Your windows are the cheapest billboard you'll ever own. Custom-designed window graphics, privacy vinyl, perforated film, and wall murals — designed in-house, printed in-house, and installed at your storefront.",
  sections: [
    {
      heading: 'Storefront window graphics',
      body: (
        <p>
          Hours, logo, offers, full-window art. Every blank pane is a customer walking past —
          window graphics turn that glass into the highest-traffic marketing surface your business
          owns, seen by everyone on the sidewalk whether they walk in or not. Perforated film
          reads as a solid graphic from outside while you still see out from inside.
        </p>
      ),
    },
    {
      heading: 'Frosted & etched privacy vinyl',
      body: (
        <p>
          Conference rooms, clinics, gyms, offices: privacy that looks intentional, light that
          still comes through. Frosted and etched-glass films pass daylight while blocking the
          view.
        </p>
      ),
    },
    {
      heading: 'Wall murals & interior branding',
      body: (
        <p>
          Lobby logos, feature walls, menu walls, culture walls. Printed and installed to fit your
          wall, not a template — every mural is designed around the actual space, not resized from
          a stock layout. Directional arrows, door hours, and floor decals round out the set.
        </p>
      ),
    },
    {
      heading: 'Designed for your brand — not clip-art on a window',
      body: (
        <p>
          Every job includes design by ikonic's in-house designer. We work from your logo and
          brand — or build the look with you — and you approve the artwork before anything is
          printed. Two revision rounds are included with every project.
        </p>
      ),
    },
    {
      heading: 'How it works',
      body: (
        <p>
          <strong>1. Free storefront walkthrough</strong> — we measure your glass and walls, talk
          goals, and photograph the space. <strong>2. Design + written quote</strong> — an artwork
          proof and an exact number, approved before anything prints. <strong>3. Installation at
          your building</strong> — a clean install, by appointment, most storefronts in a day.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: 'How long do window graphics last?',
      a: 'Quality exterior vinyl typically serves for years; lifespan depends on sun exposure and film type — we spec the right material for how long you need it, from a 3-month promo to a long-term brand install.',
    },
    {
      q: 'Will graphics block light or the view out?',
      a: 'Only if you want them to. Perforated films read as solid graphics outside while you still see out from inside; frosted films pass light while blocking the view.',
    },
    {
      q: 'Can you match my brand colors?',
      a: 'Yes — we print from your brand files and proof against them. You approve the artwork before it prints.',
    },
    {
      q: 'What about removal?',
      a: 'Professional vinyl removes cleanly from glass. We handle removal and replacement when your promotion or branding changes.',
    },
    {
      q: 'Do you do murals on textured walls?',
      a: "Depends on the surface — that's one of the things the free walkthrough checks. Some textures need a different material; we'll tell you before you spend anything.",
    },
    {
      q: 'How much does it cost?',
      a: 'Priced by the job — size, material, and design scope. The walkthrough gets you an exact written quote.',
    },
  ],
  related: [
    { label: 'Signage & Visual Graphics', to: '/signage' },
    { label: 'Wayfinding & ADA Signage', to: '/wayfinding' },
    { label: 'Architectural Window Film', to: '/window-tint' },
  ],
  ctaTitle: "Walk us around your storefront — we'll show you what it could look like",
  ctaBody:
    'Book a free walkthrough. We measure the glass and walls, talk goals, and come back with a design proof and one written quote.',
};

const signage: ServiceData = {
  path: '/signage',
  seoTitle: 'Storefront & Building Signage in Denver | ikonic303',
  seoDescription:
    'Storefront and building signage, channel and dimensional letters, monument and blade signs, banners, and window graphics — designed, fabricated, and installed on-site by ikonic in Wheat Ridge, CO.',
  schemaServiceType: 'Storefront and Building Signage',
  schemaName: 'Signage & Visual Graphics',
  schemaDescription:
    'Design, fabrication, and on-site installation of storefront and building signage — channel and dimensional letters, illuminated signs, monument and blade signs, vinyl lettering, banners, window graphics, and interior branding — across the Denver metro. Permit drawings prepared.',
  eyebrow: 'SIGNAGE & VISUAL GRAPHICS',
  h1: (
    <>
      Storefront &amp; Building Signage in <span className="text-mint">Denver, Colorado</span>
    </>
  ),
  lead: 'ikonic designs, fabricates, and installs storefront and building signage across the Denver metro — from clean vinyl lettering and window graphics to illuminated channel letters and monument signs. The sign on your building is the first thing a customer reads about you; we make it say the right thing, clearly, and on-brand.',
  sections: [
    {
      heading: 'What we make',
      body: (
        <p>
          Illuminated channel letters and lit signs, monument and pylon signs, dimensional letters
          and logos, blade signs, vinyl lettering, banners, and full storefront window graphics
          and branding. If it puts your brand on your building, we build and hang it.
        </p>
      ),
    },
    {
      heading: 'Window graphics & storefront branding',
      body: (
        <p>
          Turn plain glass into a storefront that sells — window graphics, frosted privacy vinyl,
          hours and service lists, and full storefront branding that matches your signage, so
          every touchpoint looks like the same company.
        </p>
      ),
    },
    {
      heading: 'Installed on-site, done right',
      body: (
        <p>
          Building and storefront signage is installed on-site at your location — surveyed,
          mounted, and finished by our team. We confirm the surface and mounting on-site so the
          sign goes up safely and stays up.
        </p>
      ),
    },
    {
      heading: 'Design, permit, fabricate, install',
      body: (
        <p>
          We handle it end to end: design that matches your brand, the drawings your city's permit
          process needs, fabrication, and a clean install. Many exterior and illuminated signs
          must meet local sign code — we help you get it right the first time instead of redoing
          it.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: 'What kinds of signage do you make?',
      a: 'Storefront and building signs, channel letters, monument and pylon signs, dimensional letters, blade signs, vinyl lettering, window graphics and storefront branding, banners, and interior branding.',
    },
    {
      q: 'Do you install on-site?',
      a: 'Yes — building and storefront signage is installed on-site across the Denver metro.',
    },
    {
      q: 'Do you handle permits?',
      a: 'Many exterior and illuminated signs need a city permit and must meet local sign code. We help identify what’s required and prepare the drawings the permit needs.',
    },
    {
      q: 'How long does a storefront sign take?',
      a: 'Vinyl and window graphics are fast; fabricated and illuminated signs take longer, plus any permit time. You get a firm timeline with your quote.',
    },
  ],
  related: [
    { label: 'Storefront & Window Graphics', to: '/storefront-graphics' },
    { label: 'Wayfinding & ADA Signage', to: '/wayfinding' },
    { label: 'Architectural Window Film', to: '/window-tint' },
  ],
  ctaTitle: 'Get a quote on your sign',
  ctaBody:
    "Tell us your business, the location, and what you're picturing — we'll walk the space (or the photos), then send you one honest number. No surprise add-ons.",
};

const wayfinding: ServiceData = {
  path: '/wayfinding',
  seoTitle: 'Wayfinding, ADA & Safety Signage in Denver | ikonic303',
  seoDescription:
    'Wayfinding, ADA-compliant, and safety signage for offices, clinics, warehouses, and multi-tenant buildings across the Denver metro — designed and installed on-site by ikonic.',
  schemaServiceType: 'Wayfinding and ADA Signage',
  schemaName: 'Wayfinding, ADA & Safety Signage',
  schemaDescription:
    'Design and on-site installation of wayfinding systems, ADA-compliant room and restroom signage, directional signage, and OSHA/safety signage for buildings and campuses across the Denver metro.',
  eyebrow: 'WAYFINDING & ADA SIGNAGE',
  h1: (
    <>
      Wayfinding, ADA &amp; Safety Signage in <span className="text-mint">Denver, Colorado</span>
    </>
  ),
  lead: 'ikonic designs and installs wayfinding, ADA-compliant, and safety signage for offices, clinics, warehouses, and multi-tenant buildings across the Denver metro. Signs that help people find their way, meet code, and keep your space safe — installed on-site by our team.',
  sections: [
    {
      heading: 'Wayfinding & directional signage',
      body: (
        <p>
          A consistent system of directories, directional arrows, floor and suite numbers, and
          room identification that moves people through your building without them asking the
          front desk. Good wayfinding is invisible when it works — and obvious when it's missing.
        </p>
      ),
    },
    {
      heading: 'ADA-compliant signage',
      body: (
        <p>
          Room and restroom signs built to ADA requirements — tactile characters, braille, proper
          contrast, and correct mounting height. Getting these right keeps your building compliant
          and genuinely usable for everyone who walks in.
        </p>
      ),
    },
    {
      heading: 'Safety & facility signage',
      body: (
        <p>
          OSHA and safety signage, exits and egress, restricted-area and equipment labeling, and
          the everyday facility signs a working building needs. Clear, durable, and correct.
        </p>
      ),
    },
    {
      heading: 'Free signage audit',
      body: (
        <p>
          We can walk your building and flag the wayfinding gaps and the ADA or safety signage
          that's missing, outdated, or out of compliance — the kind of thing a facilities team or
          a current vendor often never flagged. Then we quote only what you actually need.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: 'What is wayfinding signage?',
      a: 'The system of directional and identification signs — directories, arrows, floor and suite numbers, room IDs — that helps people move through a building without getting lost.',
    },
    {
      q: 'Do you make ADA-compliant signs?',
      a: 'Yes — room and restroom signage with tactile characters, braille, contrast, and mounting height to ADA requirements.',
    },
    {
      q: 'Do you offer a signage audit?',
      a: 'We can walk your building and flag missing or non-compliant wayfinding, ADA, and safety signage, then quote only what you need.',
    },
    {
      q: 'Do you install on-site?',
      a: 'Yes — wayfinding, ADA, and safety signage is surveyed and installed on-site across the Denver metro.',
    },
  ],
  related: [
    { label: 'Signage & Visual Graphics', to: '/signage' },
    { label: 'Storefront & Window Graphics', to: '/storefront-graphics' },
    { label: 'Architectural Window Film', to: '/window-tint' },
  ],
  ctaTitle: 'Get a walkthrough of your building',
  ctaBody:
    "Tell us your building and what you're dealing with — we'll survey it, flag the gaps, and send one honest quote for exactly what you need.",
};

export const services: Record<string, ServiceData> = {
  windowFilm,
  residentialTint,
  commercialTint,
  storefrontGraphics,
  signage,
  wayfinding,
};
