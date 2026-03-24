import { Send, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 pt-12 border-t border-white/10 relative z-10">
      <div className="px-[6vw]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <img
              src="/logo-ikonic.webp"
              alt="Ikonic"
              style={{ height: '64px', width: 'auto' }}
              className="mb-4"
            />
            <p className="text-offwhite-dark text-sm">
              The Digital Agency That Works While You Sleep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-offwhite font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Home', href: '/' },
                { label: 'About', href: '/about' },
                { label: 'Services', href: '/services' },
                { label: 'Contact', href: '/contact' },
                { label: 'Blogs', href: '/blogs' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-offwhite-dark text-sm hover:text-mint transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-offwhite font-medium mb-4">Services</h4>
            <ul className="space-y-2">
              {[
                { label: 'Web Design & Funnels', href: '/services/web-design' },
                { label: 'CRM & Automations', href: '/services/crm-automation' },
                { label: 'Reputation Management', href: '/services/reputation' },
                { label: 'Speed to Lead Systems', href: '/services/speed-to-lead' },
                { label: 'Marketing Systems', href: '/services/marketing' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-offwhite-dark text-sm hover:text-mint transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-offwhite font-medium mb-4">Stay Connected</h4>
            <p className="text-offwhite-dark text-sm mb-4">
              Get business growth tips and strategies straight to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 bg-charcoal border border-white/20 rounded-lg text-offwhite text-sm focus:outline-none focus:border-mint"
              />
              <button className="px-4 py-2 bg-mint text-charcoal rounded-lg hover:bg-mint-dark transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <p className="text-sm text-offwhite-dark mb-4">Follow Us</p>
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/ikonic303"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-charcoal-light border border-white/10 rounded-lg flex items-center justify-center hover:border-mint/30 hover:bg-mint/10 transition-all"
                >
                  <Facebook className="w-4 h-4 text-offwhite" />
                </a>
                <a
                  href="https://www.instagram.com/ikonic_303/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-charcoal-light border border-white/10 rounded-lg flex items-center justify-center hover:border-mint/30 hover:bg-mint/10 transition-all"
                >
                  <Instagram className="w-4 h-4 text-offwhite" />
                </a>
                <a
                  href="https://www.tiktok.com/@ikonic_303"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-charcoal-light border border-white/10 rounded-lg flex items-center justify-center hover:border-mint/30 hover:bg-mint/10 transition-all"
                >
                  <svg className="w-4 h-4 text-offwhite" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-offwhite-dark text-sm">
            © 2026 Ikonic. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
