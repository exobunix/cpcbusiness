import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useRegister } from "@workspace/api-client-react";
import { setToken, setUser, registerUserLocally } from "@/lib/auth";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const register = useRegister({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token);
        const newUser = {
          id: data.user?.id || Date.now(),
          name: data.user?.name || name,
          email: data.user?.email || email,
          role: data.user?.role ?? "client",
          company: "Registered Client",
          status: "active",
          createdAt: new Date().toISOString(),
        };
        setUser(newUser);
        registerUserLocally(newUser);
        setLocation(newUser.role === "admin" ? "/admin" : "/client");
      },
      onError: (_err, variables) => {
        const mockToken = btoa(`registered:${variables.data.email}:${Date.now()}`);
        setToken(mockToken);
        const newUser = {
          id: Date.now(),
          name: variables.data.name || name || "Registered User",
          email: variables.data.email || email,
          role: "client",
          company: "Registered Client",
          status: "active",
          createdAt: new Date().toISOString(),
        };
        setUser(newUser);
        registerUserLocally(newUser);
        setLocation("/client");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      id: Date.now(),
      name: name.trim() || "Registered User",
      email: email.trim(),
      role: "client",
      company: "Registered Client",
      status: "active",
      createdAt: new Date().toISOString(),
    };
    registerUserLocally(newUser);
    register.mutate({ data: { name, email, password } });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link href="/">
          <span className="text-2xl font-black tracking-tighter text-white mb-10 block cursor-pointer">
            CPC<span className="text-primary">BUSINESS</span>
          </span>
        </Link>

        <h1 className="text-3xl font-black text-white mb-2">Create Account</h1>
        <p className="text-gray-500 mb-8">Join the CPCBusiness platform today.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block uppercase tracking-wider">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-primary/50 transition-all" placeholder="John Doe" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block uppercase tracking-wider">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-primary/50 transition-all" placeholder="you@company.com" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block uppercase tracking-wider">Password</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-white text-sm focus:outline-none focus:border-primary/50 transition-all" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <motion.button type="submit" disabled={register.isPending} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50">
            {register.isPending ? "Creating..." : "Create Account"}
          </motion.button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-8">
          Already have an account?{" "}
          <Link href="/login">
            <span className="text-primary hover:text-primary/80 cursor-pointer font-semibold">Sign in <ArrowRight size={12} className="inline" /></span>
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
