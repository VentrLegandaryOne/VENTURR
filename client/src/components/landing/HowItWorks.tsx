import { motion } from "framer-motion";
import { Upload, Cpu, FileText, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Upload Your Quote",
    description: "Drag and drop your quote PDF, image, or document. We support all common formats and extract data instantly.",
    icon: Upload,
    color: "from-primary to-accent",
  },
  {
    number: "02",
    title: "AI Analysis",
    description: "Our verification engine analyzes pricing, materials, compliance, and warranty terms against industry standards in under 60 seconds.",
    icon: Cpu,
    color: "from-accent to-success",
  },
  {
    number: "03",
    title: "Get Your Report",
    description: "Receive a comprehensive verification report with actionable insights, red flags, and recommendations to negotiate confidently.",
    icon: FileText,
    color: "from-success to-primary",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-12 md:py-24 bg-background">
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
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get professional-grade quote verification in three simple steps. No technical knowledge required.
            </p>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative"
            >
              <Card className="p-5 md:p-8 h-full bg-card/80 border-border/50 hover:border-primary/30 transition-colors duration-200 group">
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-primary-foreground shadow-lg">
                  {step.number}
                </div>

                {/* Icon with gradient background */}
                <div className="mb-6 relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} p-0.5 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="mb-3 text-card-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow connector (hidden on last item) */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                    className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2"
                  >
                    <ArrowRight className="w-8 h-8 text-primary/30" />
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <Card className="p-8 bg-gradient-to-br from-primary/5 via-accent/5 to-success/5 border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="mb-4 text-card-foreground">What We Verify</h4>
                <ul className="space-y-3">
                  {[
                    "Pricing against market rates",
                    "Material specifications & quality",
                    "Building code compliance",
                    "Warranty terms & coverage",
                    "Installation requirements",
                    "Safety standards adherence",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.7 + i * 0.05 }}
                      className="flex items-center gap-3 text-muted-foreground"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-card-foreground">Why Choose VENTURR</h4>
                <ul className="space-y-3">
                  {[
                    "AI-powered analysis",
                    "Market data comparison",
                    "References HB-39, NCC standards",
                    "Instant PDF report generation",
                    "Secure & confidential processing",
                    "Satisfaction-focused service",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.7 + i * 0.05 }}
                      className="flex items-center gap-3 text-muted-foreground"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
