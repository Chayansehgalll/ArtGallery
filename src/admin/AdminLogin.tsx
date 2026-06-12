import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { adminLogin } from "./api";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Enter your email and password");
      return;
    }
    setLoading(true);
    setError("");
    const res = await adminLogin(email, password);
    setLoading(false);
    if (res.ok) {
      onSuccess();
    } else {
      setError(res.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Backdrop glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.05), transparent 60%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 mx-auto mb-5 border border-white/20 flex items-center justify-center">
            <Lock size={18} className="text-white/70" />
          </div>
          <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-2">
            Yashika's — Admin
          </p>
          <h1 className="text-white text-2xl font-light tracking-tight">
            Restricted Access
          </h1>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              type="email"
              autoComplete="username"
              placeholder="Admin email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="w-full bg-white/5 border border-white/10 text-white text-sm pl-11 pr-4 py-3.5 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
            />
          </div>

          <div className="relative">
            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className="w-full bg-white/5 border border-white/10 text-white text-sm pl-11 pr-11 py-3.5 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400/80 text-xs bg-red-500/5 border border-red-500/15 px-4 py-3">
              <ShieldAlert size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white text-black text-xs tracking-[0.2em] uppercase font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Verifying…</> : "Sign In"}
          </button>
        </form>

        <p className="text-white/15 text-[10px] text-center mt-8 tracking-wider leading-relaxed">
          This area is restricted to the gallery owner.<br />
          Credentials are configured on the server.
        </p>
      </motion.div>
    </div>
  );
}
