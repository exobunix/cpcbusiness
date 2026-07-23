import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";

export default function PublicFooter() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    customFetch<any>("/api/site-settings")
      .then(setSettings)
      .catch(() => {});
  }, []);

  const footerAbout = settings?.footerAbout ?? "Enterprise-grade digital solutions for ambitious companies worldwide.";
  const footerCopyright = settings?.footerCopyright ?? "© 2026 CPCBusiness. All rights reserved.";
  
  const socialTwitter = settings?.socialTwitter ?? "https://x.com";
  const socialLinkedin = settings?.socialLinkedin ?? "https://linkedin.com";
  const socialGithub = settings?.socialGithub ?? "https://github.com";
  const socialInstagram = settings?.socialInstagram ?? "https://instagram.com";

  const footerEmail = settings?.footerEmail ?? "hello@cpcbusiness.com";
  const footerPhone = settings?.footerPhone ?? "+1 (800) CPC-BIZZ";
  const footerAddress = settings?.footerAddress ?? "San Francisco, CA 94102";

  return (
    <footer className="border-t border-border bg-card/30 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="mb-4">
              <img src={settings?.logoUrl || "/logo.png"} alt="CPCBusiness" style={{ height: `${Math.min(settings?.logoHeight || 56, 60)}px` }} className="w-auto object-contain dark:invert-[0.1]" />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {footerAbout}
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { label: "X", url: socialTwitter },
                { label: "Li", url: socialLinkedin },
                { label: "Gh", url: socialGithub },
                { label: "In", url: socialInstagram },
              ].map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-xs text-muted-foreground hover:border-primary hover:text-primary cursor-pointer transition-colors bg-secondary/30">
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-5 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-3">
              {["Web Development", "Mobile Apps", "AI Solutions", "SaaS Development", "UI/UX Design", "DevOps"].map((s) => (
                <li key={s}>
                  <Link href="/services">
                    <span className="text-muted-foreground hover:text-primary text-sm transition-colors cursor-pointer">{s}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-5 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "Portfolio", href: "/portfolio" },
                { label: "Contact", href: "/contact" },
                { label: "Client Portal", href: "/login" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>
                    <span className="text-muted-foreground hover:text-primary text-sm transition-colors cursor-pointer">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-5 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <Mail size={14} className="mt-0.5 text-primary shrink-0" />
                {footerEmail}
              </li>
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <Phone size={14} className="mt-0.5 text-primary shrink-0" />
                {footerPhone}
              </li>
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin size={14} className="mt-0.5 text-primary shrink-0" />
                {footerAddress}
              </li>
            </ul>
            <Link href="/contact">
              <span className="inline-flex items-center gap-2 mt-6 text-primary text-sm font-semibold hover:gap-3 transition-all cursor-pointer">
                Get in touch <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground/60 text-xs">
          <span>{footerCopyright}</span>
          <div className="flex gap-6">
            <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
