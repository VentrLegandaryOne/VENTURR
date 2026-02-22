import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Shield,
  Eye,
  FileSearch,
  ArrowRight,
  XCircle
} from "lucide-react";

export default function HomeownerGuide() {
  const [, setLocation] = useLocation();

  const redFlags = [
    {
      icon: DollarSign,
      title: "Vague Pricing",
      description: "No itemized breakdown of materials, labor, and fees",
      severity: "high"
    },
    {
      icon: AlertTriangle,
      title: "Hidden Costs",
      description: "Surprise charges for 'extras' not in original quote",
      severity: "high"
    },
    {
      icon: XCircle,
      title: "No ABN/License",
      description: "Missing Australian Business Number or trade license",
      severity: "critical"
    },
    {
      icon: Eye,
      title: "No Written Quote",
      description: "Verbal estimates with no documentation",
      severity: "medium"
    }
  ];

  const whatWeCheck = [
    {
      icon: DollarSign,
      title: "Market Rate Analysis",
      description: "Compare prices against current Australian market rates"
    },
    {
      icon: Shield,
      title: "License Verification",
      description: "Verify contractor licenses with state authorities"
    },
    {
      icon: FileSearch,
      title: "Compliance Check",
      description: "Ensure quote meets AS/NZS building standards"
    },
    {
      icon: CheckCircle2,
      title: "Hidden Cost Detection",
      description: "AI identifies potential surprise charges"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            For Homeowners
          </p>
          <h2 className="mb-4">Don't Get Caught Out by a Bad Quote</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            88% of Australians say clear pricing builds trust. We help you spot 
            red flags before you sign on the dotted line.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Red Flags Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Red Flags to Watch For
            </h3>
            <div className="space-y-4">
              {redFlags.map((flag, index) => (
                <Card 
                  key={index}
                  className={`p-4 border-l-4 ${
                    flag.severity === 'critical' 
                      ? 'border-l-destructive bg-destructive/5' 
                      : flag.severity === 'high'
                      ? 'border-l-warning bg-warning/5'
                      : 'border-l-muted-foreground bg-muted/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      flag.severity === 'critical' 
                        ? 'bg-destructive/10' 
                        : flag.severity === 'high'
                        ? 'bg-warning/10'
                        : 'bg-muted'
                    }`}>
                      <flag.icon className={`w-5 h-5 ${
                        flag.severity === 'critical' 
                          ? 'text-destructive' 
                          : flag.severity === 'high'
                          ? 'text-warning'
                          : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{flag.title}</h4>
                      <p className="text-sm text-muted-foreground">{flag.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* What We Check Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              What VENTURR VALDT Checks
            </h3>
            <div className="space-y-4">
              {whatWeCheck.map((item, index) => (
                <Card key={index} className="p-4 border-l-4 border-l-success bg-success/5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8"
            >
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => setLocation("/quote/upload")}
              >
                <span>Verify Your Quote Now - It's Free</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-3">
                No credit card required • Results in 60 seconds
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Trust Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 p-8 bg-muted/30 rounded-2xl max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold font-mono text-primary">88%</p>
              <p className="text-sm text-muted-foreground">Say clear pricing builds trust</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-mono text-success">70%</p>
              <p className="text-sm text-muted-foreground">Would pay more to avoid surprises</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-mono text-accent">55%</p>
              <p className="text-sm text-muted-foreground">Want detailed reviews with photos</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-mono text-warning">51%</p>
              <p className="text-sm text-muted-foreground">Say no pricing is a dealbreaker</p>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Source: Elevate 2025 Homeowner Study
          </p>
        </motion.div>
      </div>
    </section>
  );
}
