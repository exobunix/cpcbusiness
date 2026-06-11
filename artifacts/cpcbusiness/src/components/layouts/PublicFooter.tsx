import { Link } from "wouter";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="border-t border-white/5 bg-black/50 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="text-2xl font-black tracking-tighter text-white mb-4">
              CPC<span className="text-primary">BUSINESS</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Enterprise-grade digital solutions for ambitious companies worldwide.
            </p>
            <div className="mt-6 flex gap-3">
              {["X", "Li", "Gh", "Dr"].map((s) => (
                <div key={s} className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-xs text-gray-500 hover:border-primary hover:text-primary cursor-pointer transition-colors">
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-3">
              {["Web Development", "Mobile Apps", "AI Solutions", "SaaS Development", "UI/UX Design", "DevOps"].map((s) => (
                <li key={s}>
                  <Link href="/services">
                    <span className="text-gray-500 hover:text-primary text-sm transition-colors cursor-pointer">{s}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "Portfolio", href: "/portfolio" },
                { label: "Contact", href: "/contact" },
                { label: "Client Portal", href: "/login" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>
                    <span className="text-gray-500 hover:text-primary text-sm transition-colors cursor-pointer">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-500 text-sm">
                <Mail size={14} className="mt-0.5 text-primary shrink-0" />
                hello@cpcbusiness.com
              </li>
              <li className="flex items-start gap-3 text-gray-500 text-sm">
                <Phone size={14} className="mt-0.5 text-primary shrink-0" />
                +1 (800) CPC-BIZZ
              </li>
              <li className="flex items-start gap-3 text-gray-500 text-sm">
                <MapPin size={14} className="mt-0.5 text-primary shrink-0" />
                San Francisco, CA 94102
              </li>
            </ul>
            <Link href="/contact">
              <span className="inline-flex items-center gap-2 mt-6 text-primary text-sm font-semibold hover:gap-3 transition-all cursor-pointer">
                Get in touch <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-xs">
          <span>© 2026 CPCBusiness. All rights reserved.</span>
          <div className="flex gap-6">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-400 cursor-pointer">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
