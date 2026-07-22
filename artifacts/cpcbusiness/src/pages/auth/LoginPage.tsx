import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, ArrowRight } from "lucide-react";
import { useLogin } from "@workspace/api-client-react";
import { setToken, setUser } from "@/lib/auth";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("admin@cpcbusiness.com");
  const [password, setPassword] = useState("admin123");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const login = useLogin({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token);
        if (data.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role ?? "client",
          });
          setLocation(data.user.role === "admin" ? "/admin" : "/client");
        } else {
          setLocation("/admin");
        }
      },
      onError: () => {
        setError("Invalid email or password. Please try again.");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login.mutate({ data: { email, password } });
  };

  const fillAndSubmit = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError("");
    login.mutate({ data: { email: e, password: p } });
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-start justify-between p-16">
        <div className="absolute inset-0 aurora-bg" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10">
          <Link href="/">
            <span className="text-3xl font-black tracking-tighter text-white cursor-pointer">
              CPC<span className="text-primary">BUSINESS</span>
            </span>
          </Link>
        </div>
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-5xl font-black text-white leading-tight mb-6">
              Your Mission<br />Control Center
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Manage clients, projects, leads, and your entire agency — from a single, powerful platform.
            </p>
          </motion.div>
          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { value: "500+", label: "Projects" },
              { value: "200+", label: "Clients" },
              { value: "99%", label: "Uptime" },
              { value: "24/7", label: "Support" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-4">
                <div className="text-2xl font-black gradient-text">{s.value}</div>
                <div className="text-gray-500 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-gray-600 text-sm">
          © 2026 CPCBusiness. All rights reserved.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-10">
            <Link href="/">
              <span className="text-2xl font-black tracking-tighter text-white">
                CPC<span className="text-primary">BUSINESS</span>
              </span>
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
            <p className="text-gray-500">Sign in to access your command center.</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-white text-sm focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-white/20" />
                <span className="text-sm text-gray-500">Remember me</span>
              </label>
              <span className="text-sm text-primary hover:text-primary/80 cursor-pointer transition-colors">Forgot password?</span>
            </div>

            <motion.button
              type="submit"
              disabled={login.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 emerald-glow-sm"
            >
              {login.isPending ? "Signing in..." : <><Zap size={15} /> Sign In</>}
            </motion.button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-8">
            Don't have an account?{" "}
            <Link href="/register">
              <span className="text-primary hover:text-primary/80 cursor-pointer font-semibold transition-colors">
                Create account <ArrowRight size={12} className="inline" />
              </span>
            </Link>
          </p>

          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-center text-xs text-gray-700 mb-4">Quick access demo</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fillAndSubmit("admin@cpcbusiness.com", "admin123")}
                disabled={login.isPending}
                className="text-xs border border-white/10 rounded-lg py-2.5 text-gray-500 hover:text-white hover:border-primary/30 transition-colors disabled:opacity-50"
              >
                Admin Demo
              </button>
              <button
                onClick={() => fillAndSubmit("client@example.com", "client123")}
                disabled={login.isPending}
                className="text-xs border border-white/10 rounded-lg py-2.5 text-gray-500 hover:text-white hover:border-primary/30 transition-colors disabled:opacity-50"
              >
                Client Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
