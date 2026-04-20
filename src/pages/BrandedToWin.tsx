import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ChevronDown, ChevronUp, Star, BookOpen, Download, Package } from 'lucide-react';

const GOLD = '#F5A623';

const chapters = [
  { title: 'Part I: The Invisible Tax',      desc: 'Discover how a weak brand silently costs you jobs, customers, and credibility every single day.' },
  { title: 'Part II: The Brand Equation',    desc: 'The simple formula that separates premium service businesses from those stuck competing on price.' },
  { title: 'Part III: The Transformation',   desc: 'Step-by-step playbook for rebuilding your brand into one that commands attention and premium prices.' },
  { title: 'Part IV: The Playbook',          desc: 'Actionable templates, scripts, and systems to roll out your new brand across every touchpoint.' },
  { title: 'Part V: The Compound Effect',    desc: 'How a strong brand snowballs into reviews, referrals, and a reputation that does the selling for you.' },
];

const benefits = [
  { icon: '🏆', title: 'Build Instant Trust',       desc: 'Learn the branding signals that instantly communicate reliability and quality to potential customers in your area.' },
  { icon: '💰', title: 'Command Premium Prices',    desc: 'Discover how a strong brand allows you to charge what you\'re worth and attract clients who value quality over the lowest bid.' },
  { icon: '📍', title: 'Dominate Local Marketing',  desc: 'Use Joshua\'s frameworks to position yourself on every platform so local businesses always choose you over the competition.' },
];

const faqs = [
  { q: 'Who is this book specifically for?',               a: 'Local service business owners — plumbers, roofers, wrap shops, landscapers, detailers, and anyone who relies on their local reputation to win jobs.' },
  { q: 'Do I need a marketing background to understand it?', a: 'Not at all. The book is written in plain language with practical step-by-step guidance. No marketing degree required.' },
  { q: 'What formats are included in the Digital Edition?',  a: 'PDF, ePub, and Mobi — readable on any device, Kindle, iPad, or computer.' },
  { q: 'Is there a money-back guarantee?',                  a: 'Yes. The Complete Bundle comes with a 30-day money-back guarantee. If you don\'t find value, you get a full refund.' },
  { q: 'How quickly can I expect to see results?',          a: 'Most readers implement their first changes within a week. Visible reputation improvements typically show within 30–90 days.' },
];

export default function BrandedToWin() {
  const [openFaq, setOpenFaq]         = useState<number | null>(null);
  const [openChapter, setOpenChapter] = useState<number | null>(null);

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <Navigation />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-[6vw]">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Text */}
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: GOLD }}>
              The Essential Guide for Service Businesses
            </p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
              Branded <span style={{ color: GOLD }}>to Win.</span>
            </h1>
            <p className="text-xl text-white/80 mb-2 font-medium">
              How Local Service Businesses Turn Image Into Income
            </p>
            <p className="text-white/50 mb-8 max-w-lg">
              Stop competing on price. Learn the proven branding strategies that top local service businesses use to dominate their markets and increase profits.
            </p>
            <div className="flex items-center gap-3 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" style={{ color: GOLD }} />
              ))}
              <span className="text-white/60 text-sm">Joined by 10,000+ readers</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://brandedtowin.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-xl text-black transition-all hover:-translate-y-0.5 hover:shadow-lg text-lg"
                style={{ background: GOLD }}>
                <Package className="w-5 h-5" /> Get the Book Now
              </a>
              <a href="https://brandedtowin.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-xl border text-white transition-all hover:bg-white/10 text-lg"
                style={{ borderColor: GOLD, color: GOLD }}>
                <BookOpen className="w-5 h-5" /> Read a Free Chapter
              </a>
            </div>
          </div>

          {/* Book Cover */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl blur-3xl opacity-30" style={{ background: GOLD }} />
              <div className="relative w-72 h-96 rounded-2xl overflow-hidden border-2 shadow-2xl flex flex-col items-center justify-center text-center p-8"
                style={{ borderColor: GOLD, background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' }}>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3">BRANDED TO WIN</p>
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 text-5xl"
                  style={{ background: `${GOLD}20`, border: `2px solid ${GOLD}` }}>
                  💲
                </div>
                <h2 className="font-display text-xl font-bold text-white mb-2 leading-tight">
                  How Local Service Businesses Turn Image Into Income
                </h2>
                <div className="mt-4 pt-4 border-t border-white/10 w-full">
                  <p className="font-bold text-white tracking-widest text-sm uppercase">JOSHUA SODERBLOM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What You'll Discover ──────────────────────────────────────────────── */}
      <section className="py-20 px-[6vw] bg-[#111111]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
            Inside the Book
          </p>
          <h2 className="font-display text-4xl font-bold text-white text-center mb-4">
            What You'll Discover Inside
          </h2>
          <p className="text-white/50 text-center max-w-2xl mx-auto mb-14">
            This isn't just theory. It's a practical, step-by-step manual designed to fundamentally change how your local service business operates and grows.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map(b => (
              <div key={b.title} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 hover:border-[#F5A623]/30 transition-all">
                <div className="text-4xl mb-4">{b.icon}</div>
                <h3 className="font-display text-xl font-bold text-white mb-3">{b.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chapter Breakdown ─────────────────────────────────────────────────── */}
      <section className="py-20 px-[6vw]">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-white text-center mb-4">Chapter Breakdown</h2>
          <p className="text-white/50 text-center mb-12">
            Nearly 200 pages of dense, actionable insights. No fluff, just the exact frameworks you need to build a winning brand.
          </p>
          <div className="flex flex-col gap-3">
            {chapters.map((ch, i) => (
              <div key={i} className="border border-white/10 rounded-xl overflow-hidden hover:border-[#F5A623]/30 transition-all">
                <button
                  onClick={() => setOpenChapter(openChapter === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-semibold text-white">{ch.title}</span>
                  {openChapter === i
                    ? <ChevronUp className="w-4 h-4 text-white/40 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />}
                </button>
                {openChapter === i && (
                  <div className="px-6 pb-4">
                    <p className="text-white/50 text-sm">{ch.desc}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Joshua ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-[6vw] bg-[#111111]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: GOLD }}>The Author</p>
          <h2 className="font-display text-4xl font-bold text-white mb-8">Meet Joshua Soderblom</h2>
          <div className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center text-4xl border-2"
            style={{ background: `${GOLD}15`, borderColor: GOLD }}>
            JS
          </div>
          <p className="text-white/70 leading-relaxed mb-6 max-w-3xl mx-auto">
            Joshua Soderblom didn't start behind a desk. He started with a pressure washer, a polishing machine, and an obsession with making things look flawless. In 2020, Josh launched Ikonic as a premium vehicle detailing and protection company in Denver, Colorado — earning every certification he could get his hands on.
          </p>
          <p className="text-white/70 leading-relaxed mb-10 max-w-3xl mx-auto">
            But somewhere along the way, he had a realization that changed everything — the brand is the business. Today, he helps hundreds of local service business owners build brands so strong that customers choose them on sight. The result: businesses that charge more, win more, and grow on autopilot.
          </p>
          <div className="flex items-center justify-center gap-12">
            <div className="text-center">
              <p className="font-display text-3xl font-bold" style={{ color: GOLD }}>100s</p>
              <p className="text-white/50 text-sm">Businesses Transformed</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="font-display text-3xl font-bold" style={{ color: GOLD }}>5-Star</p>
              <p className="text-white/50 text-sm">Rated Framework</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-[6vw]">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>Pricing</p>
          <h2 className="font-display text-4xl font-bold text-white text-center mb-4">Choose Your Package</h2>
          <p className="text-white/50 text-center mb-14">
            Get instant access to the digital materials and start transforming your business today.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Digital */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 flex flex-col">
              <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-2">Digital Edition</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="font-display text-5xl font-bold text-white">$19</span>
                <span className="text-white/40 mb-2">/one-time</span>
              </div>
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {['Branded to Win eBook (PDF, ePub, Mobi)', 'Lifetime updates to digital editions'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-white/60 text-sm">
                    <span style={{ color: GOLD }} className="mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href="https://brandedtowin.com" target="_blank" rel="noopener noreferrer"
                className="w-full text-center font-bold py-3 rounded-xl border transition-all hover:bg-white/5 text-white"
                style={{ borderColor: `${GOLD}50` }}>
                Get Digital Edition
              </a>
            </div>

            {/* Complete Bundle */}
            <div className="rounded-2xl p-8 flex flex-col relative overflow-hidden border-2"
              style={{ background: 'linear-gradient(135deg, #1a1400 0%, #0a0a0a 100%)', borderColor: GOLD }}>
              <div className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full text-black"
                style={{ background: GOLD }}>
                MOST POPULAR
              </div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: GOLD }}>The Complete Bundle</p>
              <p className="text-white/50 text-xs mb-3">Designed for the serious owner ready to dominate their local market</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="font-display text-5xl font-bold text-white">$49</span>
                <span className="text-white/40 mb-2">/one-time</span>
              </div>
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {[
                  'Branded to Win eBook (All formats)',
                  'Actionable Audiobook (MP3)',
                  'Printable Branding Worksheets & Templates',
                  'Bonus: 30-Day Implementation Guide',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-white/80 text-sm">
                    <span style={{ color: GOLD }} className="mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href="https://brandedtowin.com" target="_blank" rel="noopener noreferrer"
                className="w-full text-center font-bold py-3 rounded-xl text-black transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: GOLD }}>
                Get the Complete Bundle
              </a>
              <p className="text-center text-white/30 text-xs mt-3">30-day money-back guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-[6vw] bg-[#111111]">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-white text-center mb-4">Frequently Asked Questions</h2>
          <p className="text-white/50 text-center mb-12">
            Everything you need to know about the book, the frameworks, and how it can transform your service business.
          </p>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-white/10 rounded-xl overflow-hidden hover:border-[#F5A623]/30 transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-semibold text-white text-sm">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-white/40 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-[6vw]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: GOLD }}>
            Insights for the Driven
          </p>
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Ready to Build a Brand That Wins?
          </h2>
          <p className="text-white/50 mb-8">
            Join thousands of local service business owners receiving weekly tips on building a brand that commands premium prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://brandedtowin.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-xl text-black transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: GOLD }}>
              <Download className="w-5 h-5" /> Get the Book — $49
            </a>
            <Link to="/contact"
              className="flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-xl border text-white transition-all hover:bg-white/5"
              style={{ borderColor: `${GOLD}50` }}>
              Work With Ikonic
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
