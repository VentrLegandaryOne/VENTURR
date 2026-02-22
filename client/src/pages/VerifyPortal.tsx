import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TriangleLogo } from "@/components/branding/TriangleLogo";

/**
 * VALIDT Public Trust Engine - Verification Portal
 * Simple, professional page for verifying certification codes
 * Design: Dark Graphite Black background, Electric Blue accents, minimal
 */
export default function VerifyPortal() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) return;

    setIsVerifying(true);

    try {
      // Validate certification code format: VALIDT-XXXXXX-XXXX
      const codePattern = /^VALIDT-[A-Z0-9]{6}-[A-Z0-9]{4}$/i;
      const trimmedCode = code.trim().toUpperCase();
      
      if (!codePattern.test(trimmedCode)) {
        setLocation(`/verification/failure?reason=invalid_format`);
        return;
      }

      // Extract verification ID from code and redirect to report
      const parts = trimmedCode.split('-');
      const verificationId = parts[1];
      setLocation(`/verification/success?code=${encodeURIComponent(trimmedCode)}&id=${verificationId}`);
    } catch (error) {
      setLocation(`/verification/failure?reason=verification_error`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-slate-300 triangle-pattern">
      {/* Minimalist Header */}
      <header className="border-b border-slate-800 bg-[#1a1a1a]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TriangleLogo size={32} />
            <div className="flex flex-col">
              <span className="venturr-wordmark text-lg leading-none text-slate-100">VENTURR</span>
              <span className="text-xs text-slate-400 leading-none tracking-widest">VALIDT</span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/about" className="text-sm hover:text-[#00A8FF] transition-colors">
              About
            </a>
            <a href="/library" className="text-sm hover:text-[#00A8FF] transition-colors">
              Compliance Library
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Triangle Logo with Ethereal Halo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <TriangleLogo size={120} />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-5xl md:text-6xl font-bold text-slate-100 mb-4"
          >
            Verify Your Document.{" "}
            <span className="text-[#00A8FF]">Instantly.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-xl text-slate-400 mb-12"
          >
            Enter a VALIDT certification code to verify document authenticity and compliance status.
          </motion.p>

          {/* Input Field + Verify Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
          >
            <div className="flex-1 relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                type="text"
                placeholder="VALIDT-2025-XXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="w-full h-14 pl-12 pr-4 bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 text-lg focus:border-[#00A8FF] focus:ring-[#00A8FF]/20"
                disabled={isVerifying}
              />
            </div>
            <Button
              onClick={handleVerify}
              disabled={!code.trim() || isVerifying}
              className="h-14 px-8 bg-[#00A8FF] hover:bg-[#0090DD] text-white font-semibold text-lg shadow-lg shadow-[#00A8FF]/20 hover:shadow-[#00A8FF]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed halo-hover"
            >
              {isVerifying ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Shield className="w-5 h-5" />
                </motion.div>
              ) : (
                <>
                  Verify
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00A8FF] mb-2">100%</div>
              <div className="text-sm text-slate-500">Secure</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00A8FF] mb-2">&lt;1s</div>
              <div className="text-sm text-slate-500">Verification Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00A8FF] mb-2">24/7</div>
              <div className="text-sm text-slate-500">Available</div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-slate-500">
          <p>© 2025 VENTURR VALIDT. Public Trust Engine for Document Verification.</p>
          <p className="mt-2">
            Powered by <span className="text-[#00A8FF]">Sacred Geometry</span> and{" "}
            <span className="text-[#00A8FF]">Cryptographic Security</span>.
          </p>
        </div>
      </footer>
    </div>
  );
}
