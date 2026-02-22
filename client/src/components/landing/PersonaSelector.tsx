import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { 
  Home, 
  Wrench, 
  Building2, 
  ArrowRight,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle2
} from "lucide-react";

interface PersonaCardProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  benefits: string[];
  ctaText: string;
  href: string;
  color: string;
  delay: number;
}

function PersonaCard({ icon: Icon, title, subtitle, benefits, ctaText, href, color, delay }: PersonaCardProps) {
  const [, setLocation] = useLocation();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: delay * 0.5 }}
      className="h-full"
    >
      <Card 
        onClick={() => setLocation(href)}
        className={`p-8 h-full cursor-pointer glass border-2 border-transparent hover:border-${color}/40 transition-all duration-300 group relative overflow-hidden`}
      >
        {/* Gradient background on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br from-${color}/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        <div className="relative z-10">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl bg-${color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-8 h-8 text-${color}`} />
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground mb-6">{subtitle}</p>
          
          {/* Benefits */}
          <ul className="space-y-3 mb-8">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className={`w-5 h-5 text-${color} shrink-0 mt-0.5`} />
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
          
          {/* CTA */}
          <div className={`flex items-center gap-2 text-${color} font-semibold group-hover:gap-4 transition-all duration-300`}>
            <span>{ctaText}</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function PersonaSelector() {
  const personas = [
    {
      icon: Home,
      title: "I'm a Homeowner",
      subtitle: "Getting quotes for home improvements",
      benefits: [
        "Verify if your quote is fair market price",
        "Detect hidden costs before you sign",
        "Check contractor licenses & insurance",
        "Compare multiple quotes side-by-side"
      ],
      ctaText: "Verify My Quote",
      href: "/quote/upload",
      color: "success",
      delay: 0
    },
    {
      icon: Wrench,
      title: "I'm a Tradie",
      subtitle: "Running my own trade business",
      benefits: [
        "Validate your pricing against market rates",
        "Ensure compliance with Australian Standards",
        "Generate professional branded reports",
        "Build trust with verified credentials"
      ],
      ctaText: "Check My Pricing",
      href: "/quote/upload",
      color: "primary",
      delay: 0.1
    },
    {
      icon: Building2,
      title: "I'm a Business Owner",
      subtitle: "Managing multiple projects & contractors",
      benefits: [
        "Streamline quote verification at scale",
        "Track compliance across all projects",
        "Reduce risk with automated checks",
        "Access detailed analytics & reports"
      ],
      ctaText: "View Dashboard",
      href: "/dashboard",
      color: "accent",
      delay: 0.2
    }
  ];

  return (
    <section className="py-12 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-4">How Can We Help You Today?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're verifying a single quote or managing hundreds of projects, 
            VENTURR VALDT adapts to your needs.
          </p>
        </motion.div>

        {/* Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {personas.map((persona, index) => (
            <PersonaCard key={index} {...persona} />
          ))}
        </div>

        {/* Trust Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-16"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-success" />
            <span className="text-muted-foreground">
              <strong className="text-foreground">ABN Verified</strong> Contractors
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-primary" />
            <span className="text-muted-foreground">
              <strong className="text-foreground">60 Second</strong> Analysis
            </span>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-accent" />
            <span className="text-muted-foreground">
              <strong className="text-foreground">$12M+</strong> Savings Identified
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
