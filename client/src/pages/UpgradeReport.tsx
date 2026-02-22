import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  CheckCircle2,
  FileText,
  TrendingUp,
  AlertTriangle,
  Download,
  Lock,
  CreditCard,
  ArrowLeft,
  Star,
  Users,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function UpgradeReport() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !cardNumber || !expiry || !cvc || !name) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.success("Payment successful! Generating your detailed report...");
    
    // Redirect to report page
    setTimeout(() => {
      setLocation(`/quote/${quoteId}`);
    }, 1500);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <span className="flex items-center gap-2 font-bold text-xl text-cyan-700">
              <Shield className="w-6 h-6" />
              VENTURR VALDT
            </span>
          </Link>
          <Link href="/free-check">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quote Check
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* What You Get */}
            <div>
              <Badge className="mb-4 bg-cyan-100 text-cyan-700 hover:bg-cyan-100">
                One-Time Purchase
              </Badge>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                Get Your Full Detailed Report
              </h1>
              <p className="text-slate-600 mb-8">
                See exactly what you're paying for. No subscriptions, no hidden fees – 
                just the complete analysis you need to make an informed decision.
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Line-by-Line Breakdown</h3>
                    <p className="text-sm text-slate-600">
                      Every item analysed with fair price ranges for your area
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Market Comparison</h3>
                    <p className="text-sm text-slate-600">
                      See how this quote stacks up against current market rates
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Red Flags Explained</h3>
                    <p className="text-sm text-slate-600">
                      Any concerns clearly explained with recommendations
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Download className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Downloadable PDF</h3>
                    <p className="text-sm text-slate-600">
                      Keep a permanent record or share with family
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Signals */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Money-Back Guarantee</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div>
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-slate-900 mb-1">$9.95</div>
                  <p className="text-slate-500">One-time payment • Instant access</p>
                </div>

                <form onSubmit={handlePurchase} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      We'll send your report here
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="name">Name on Card</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="card">Card Number</Label>
                    <div className="relative">
                      <Input
                        id="card"
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        className="mt-1 pr-12"
                      />
                      <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input
                        id="expiry"
                        type="text"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        type="text"
                        placeholder="123"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        maxLength={4}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Pay $9.95 & Get Report
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-500">
                    Not satisfied? Full refund, no questions asked.
                  </p>
                </div>

                {/* Payment Security */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Lock className="w-3 h-3" />
                    <span>256-bit SSL encryption</span>
                    <span>•</span>
                    <span>Powered by Stripe</span>
                  </div>
                </div>
              </Card>

              {/* Social Proof */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600">
                  "Saved me $2,400 on my bathroom reno. Worth every cent."
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  – Sarah M., Parramatta
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-8 mt-16">
        <div className="container text-center text-slate-500 text-sm">
          <p className="mb-2">Built by Australians, for Australians</p>
          <p>See exactly what you're paying for. No hidden fees.</p>
        </div>
      </footer>
    </div>
  );
}
