import { motion } from "framer-motion";
import { 
  Shield, 
  CheckCircle2, 
  Award, 
  Lock,
  FileCheck,
  BadgeCheck
} from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "ABN Verified",
    description: "All contractors verified against Australian Business Register",
    color: "success"
  },
  {
    icon: FileCheck,
    title: "AS/NZS Compliant",
    description: "Quotes checked against Australian Standards",
    color: "primary"
  },
  {
    icon: BadgeCheck,
    title: "License Verified",
    description: "Trade licenses validated with state authorities",
    color: "accent"
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description: "256-bit encryption protects your data",
    color: "success"
  },
  {
    icon: Award,
    title: "Insurance Checked",
    description: "Public liability & professional indemnity verified",
    color: "warning"
  },
  {
    icon: CheckCircle2,
    title: "Fair Work Compliant",
    description: "Labor rates checked against Fair Work standards",
    color: "primary"
  }
];

export default function TrustBadges() {
  return (
    <section className="py-10 md:py-16 bg-muted/20 border-y border-border/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            Trusted & Verified
          </p>
          <h3 className="text-2xl font-bold text-foreground">
            Australian Standards Compliance Built-In
          </h3>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="flex flex-col items-center text-center p-3 md:p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors duration-200 group"
            >
              <div className={`w-12 h-12 rounded-full bg-${badge.color}/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <badge.icon className={`w-6 h-6 text-${badge.color}`} />
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">{badge.title}</h4>
              <p className="text-xs text-muted-foreground leading-tight">{badge.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
