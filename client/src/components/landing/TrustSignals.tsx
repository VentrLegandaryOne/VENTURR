import { motion } from "framer-motion";
import { TriangularStar, TriangularShield, TriangularCheck } from "@/components/branding/TriangularIcons";
import { Card } from "@/components/ui/card";
import { Shield, Award, Clock, TrendingUp, CheckCircle2, FileCheck } from "lucide-react";

// Real platform capabilities - no fake testimonials
const platformFeatures = [
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "256-bit encryption protects your quotes and personal data. SOC 2 compliant infrastructure.",
    highlight: "Enterprise Security",
  },
  {
    icon: FileCheck,
    title: "Australian Standards",
    description: "Verification against 24+ AS/NZS standards including AS 3000, AS 3500, and NCC 2022.",
    highlight: "Compliance Built-In",
  },
  {
    icon: Clock,
    title: "60-Second Analysis",
    description: "AI-powered verification delivers comprehensive reports in under a minute.",
    highlight: "Instant Results",
  },
];

const complianceStandards = [
  "AS/NZS 3000 - Electrical",
  "AS 3500 - Plumbing",
  "AS 4055 - Wind Loads",
  "AS 1684 - Timber Framing",
  "NCC 2022",
  "HB 39 - Installation Guide",
];

export default function TrustSignals() {
  return (
    <section className="py-24 bg-muted/30 triangle-pattern">
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4">
              Built for Australian Compliance
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Verify quotes against real Australian Standards and building codes. 
              Trusted by tradespeople, homeowners, and construction professionals.
            </p>
          </motion.div>
        </div>

        {/* Platform features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {platformFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ 
                y: -8, 
                transition: { duration: 0.3 } 
              }}
            >
              <Card className="p-6 h-full glass border-primary/20 hover:border-primary/40 transition-smooth hover:glow-primary group relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={false}
                />
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  
                  {/* Highlight badge */}
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-success/10 text-success rounded-full mb-3">
                    {feature.highlight}
                  </span>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Compliance standards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground mb-8 uppercase tracking-wider font-semibold">
            Verified Against Australian Standards
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {complianceStandards.map((standard, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-all duration-300"
              >
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {standard}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Platform capabilities - real metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto"
        >
          {[
            { value: "24+", label: "Australian Standards", icon: Award },
            { value: "8", label: "States & Territories", icon: Shield },
            { value: "<60s", label: "Analysis Time", icon: Clock },
            { value: "98%", label: "Accuracy Target", icon: TrendingUp },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 rounded-2xl glass border-primary/10 hover:border-primary/30 transition-smooth group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-3xl md:text-4xl font-bold mb-1 font-mono text-primary">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Beta notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
            <TriangularShield className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">
              Beta Version - Help us improve by providing feedback
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
