import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign,
  ArrowRight,
  Sparkles,
  Shield,
  FileCheck
} from "lucide-react";

export default function SavingsCalculator() {
  const [, setLocation] = useLocation();
  const [quoteValue, setQuoteValue] = useState([25000]);
  
  // Calculate potential savings (15-30% based on industry research)
  const minSavings = Math.round(quoteValue[0] * 0.15);
  const maxSavings = Math.round(quoteValue[0] * 0.30);
  const avgSavings = Math.round((minSavings + maxSavings) / 2);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Calculator */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8 glass border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Savings Calculator</h3>
                  <p className="text-sm text-muted-foreground">Estimate your potential savings</p>
                </div>
              </div>

              {/* Quote Value Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-foreground">Your Quote Value</label>
                  <span className="text-2xl font-bold font-mono text-primary">
                    {formatCurrency(quoteValue[0])}
                  </span>
                </div>
                <Slider
                  value={quoteValue}
                  onValueChange={setQuoteValue}
                  min={5000}
                  max={500000}
                  step={5000}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>$5,000</span>
                  <span>$500,000</span>
                </div>
              </div>

              {/* Savings Display */}
              <div className="bg-success/10 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium text-success">Potential Savings</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-mono text-success">
                    {formatCurrency(avgSavings)}
                  </span>
                  <span className="text-muted-foreground">estimated</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Range: {formatCurrency(minSavings)} - {formatCurrency(maxSavings)}
                </p>
              </div>

              {/* CTA */}
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => setLocation("/quote/upload")}
              >
                <span>Verify Your Quote Now</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Card>
          </motion.div>

          {/* Right: Value Props */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Make Informed Decisions
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Industry research shows that <strong className="text-foreground">overpriced quotes 
              are common in the construction industry</strong>. VENTURR VALDT helps you identify 
              pricing discrepancies, compliance issues, and potential red flags before you commit.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: DollarSign,
                  title: "Market Rate Comparison",
                  description: "Compare your quote against current Australian market rates for materials and labour"
                },
                {
                  icon: Shield,
                  title: "Compliance Verification",
                  description: "Check quotes against 24+ Australian Standards and building codes"
                },
                {
                  icon: FileCheck,
                  title: "License & Insurance Check",
                  description: "Verify contractor credentials with state licensing authorities"
                }
              ].map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Beta Notice */}
            <div className="mt-8 p-4 bg-accent/10 border border-accent/20 rounded-xl">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-accent mb-1">Beta Version</p>
                  <p className="text-sm text-muted-foreground">
                    Savings estimates are based on industry research. Actual savings vary 
                    depending on your specific quote and market conditions.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
