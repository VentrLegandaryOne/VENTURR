import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Clock, TrendingDown } from "lucide-react";
import { Link } from "wouter";

const benefits = [
  {
    icon: Clock,
    title: "60-Second Analysis",
    description: "Instant results, no waiting",
  },
  {
    icon: Shield,
    title: "100% Confidential",
    description: "Your data stays private",
  },
  {
    icon: TrendingDown,
    title: "Save Thousands",
    description: "Average savings: $8,500",
  },
];

export default function CTA() {
  return (
    <section className="py-12 md:py-24 bg-gradient-to-br from-primary/10 via-accent/5 to-background relative overflow-hidden">
      {/* Simplified background for mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main CTA content */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="mb-4 md:mb-6 text-2xl md:text-4xl font-bold">
              Ready to Verify Your Quote?
            </h2>
            <p className="text-base md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto px-4">
              Join thousands of smart contractors and homeowners who never overpay. 
              Get your first verification report in under 60 seconds.
            </p>
          </motion.div>

          {/* Benefits grid */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 px-4"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 md:p-6 rounded-xl bg-card/80 border border-border/50 hover:border-primary/30 transition-colors duration-200"
              >
                <benefit.icon className="w-7 h-7 md:w-8 md:h-8 text-primary mb-2 md:mb-3 mx-auto" />
                <h4 className="mb-1 md:mb-2 text-card-foreground font-semibold">{benefit.title}</h4>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
          >
            <Link href="/quote/upload">
              <Button
                size="lg"
                className="w-full sm:w-auto group relative overflow-hidden px-8 md:px-10 py-5 md:py-7 text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 md:gap-3">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-6 md:mt-8 flex flex-wrap justify-center items-center gap-4 md:gap-6 text-sm text-muted-foreground px-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Free first verification</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
