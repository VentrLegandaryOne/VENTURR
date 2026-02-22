import { Shield, Smartphone, Apple, Play } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Features", href: "/#features" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none">VENTURR</span>
                <span className="text-xs text-secondary-foreground/70 leading-none">VALDT</span>
              </div>
            </div>
            <p className="text-sm text-secondary-foreground/70 max-w-sm mb-4">
              AI-powered quote verification for the construction industry. 
              Never overpay for a quote again.
            </p>
            <p className="text-xs text-secondary-foreground/50">
              © {currentYear} VENTURR VALDT. All rights reserved.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* App Download Section */}
        <div className="py-8 border-t border-b border-secondary-foreground/10 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-base">Get the App</h4>
                <p className="text-sm text-secondary-foreground/70">Verify quotes on the go</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* App Store Badge */}
              <Link href="/download">
                <span className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer min-w-[140px]">
                  <Apple className="w-6 h-6" />
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] leading-none">Download on the</span>
                    <span className="text-sm font-semibold leading-tight">App Store</span>
                  </div>
                </span>
              </Link>
              
              {/* Google Play Badge */}
              <Link href="/download">
                <span className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer min-w-[140px]">
                  <Play className="w-6 h-6" />
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] leading-none">GET IT ON</span>
                    <span className="text-sm font-semibold leading-tight">Google Play</span>
                  </div>
                </span>
              </Link>
              
              {/* PWA Install Link */}
              <Link href="/download">
                <span className="flex items-center gap-2 px-4 py-2.5 border border-secondary-foreground/20 rounded-lg hover:bg-secondary-foreground/5 transition-colors cursor-pointer">
                  <Smartphone className="w-5 h-5" />
                  <span className="text-sm font-medium">Install Web App</span>
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-secondary-foreground/50">
              Built with precision for the Australian construction industry
            </p>
            <div className="flex items-center gap-6 text-xs text-secondary-foreground/50">
              <span>HB-39 Referenced</span>
              <span>•</span>
              <span>NCC 2022 Referenced</span>
              <span>•</span>
              <span>Secure Platform</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
