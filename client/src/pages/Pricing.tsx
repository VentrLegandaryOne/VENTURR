import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Shield,
  CheckCircle2,
  FileText,
  Users,
  Building2,
  Star,
  ArrowRight,
  BadgeCheck,
  Home,
  Briefcase,
} from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      id: "single",
      name: "Single Report",
      price: "$9.95",
      period: "one-time",
      description: "For one-time home projects",
      tagline: "Get the full analysis when you need it",
      icon: FileText,
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
      features: [
        "Complete line-by-line breakdown",
        "Market rate comparison for your area",
        "All red flags explained in detail",
        "Downloadable PDF report",
        "Money-back guarantee",
      ],
      cta: "Get Started",
      ctaLink: "/free-check",
      popular: false,
    },
    {
      id: "household",
      name: "Household Plan",
      price: "$49",
      period: "/year",
      description: "For families and property owners",
      tagline: "Unlimited checks, one simple price",
      icon: Home,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      features: [
        "Unlimited quote verifications",
        "Protect everyone in your household",
        "Priority processing",
        "Historical quote tracking",
        "Family sharing (up to 5 members)",
        "Email alerts for price changes",
      ],
      cta: "Start Household Plan",
      ctaLink: "/signup?plan=household",
      popular: true,
    },
    {
      id: "tradie",
      name: "Tradie Verified",
      price: "$29",
      period: "/month",
      description: "For contractors who quote fairly",
      tagline: "Prove you're one of the good ones",
      icon: BadgeCheck,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      features: [
        "VENTURR Verified trust badge",
        "Display badge on your website & quotes",
        "Listed in verified contractor directory",
        "Customer review management",
        "Quote compliance pre-check",
        "Priority dispute resolution",
      ],
      cta: "Get Verified",
      ctaLink: "/contractor-registration",
      popular: false,
    },
  ];

  const testimonials = [
    {
      quote: "Saved me $3,200 on my roof replacement. The detailed breakdown showed exactly where the quote was inflated.",
      name: "Michael Thompson",
      location: "Parramatta, NSW",
      savings: "$3,200",
    },
    {
      quote: "As a single mum, I was worried about getting ripped off. VENTURR gave me the confidence to negotiate.",
      name: "Sarah Chen",
      location: "Brunswick, VIC",
      savings: "$1,850",
    },
    {
      quote: "The Tradie Verified badge has brought me 40% more enquiries. Customers trust verified contractors.",
      name: "Dave Wilson",
      location: "Tradesperson, QLD",
      savings: "40% more leads",
    },
  ];

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
          <div className="flex items-center gap-4">
            <Link href="/free-check">
              <Button variant="ghost">Free Quote Check</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge className="mb-4 bg-cyan-100 text-cyan-700 hover:bg-cyan-100">
            Simple, Honest Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Three Options. No Tricks.
          </h1>
          <p className="text-xl text-slate-600">
            See exactly what you're paying for. No hidden fees, no subscriptions you'll forget about.
            Built by Australians, for Australians.
          </p>
        </motion.div>

        {/* Free Check CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <Card className="p-6 bg-gradient-to-r from-cyan-50 to-teal-50 border-cyan-200">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-8 h-8 text-cyan-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Start with a Free Check</h3>
                <p className="text-slate-600">
                  Upload any quote and get an instant traffic light result – no signup required.
                  Green, amber, or red. One free insight included.
                </p>
              </div>
              <Link href="/free-check">
                <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 whitespace-nowrap">
                  Check a Quote Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className={`p-8 h-full relative ${
                  plan.popular 
                    ? "border-2 border-green-500 shadow-lg shadow-green-100" 
                    : "border border-slate-200"
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-green-500 text-white hover:bg-green-500">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`w-14 h-14 rounded-full ${plan.iconBg} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-7 h-7 ${plan.iconColor}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                    <p className="text-sm text-slate-500">{plan.description}</p>
                  </div>

                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                      <span className="text-slate-500 ml-1">{plan.period}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{plan.tagline}</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={plan.ctaLink}>
                    <Button
                      size="lg"
                      className={`w-full ${
                        plan.popular
                          ? "bg-green-600 hover:bg-green-700"
                          : plan.id === "tradie"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-cyan-600 hover:bg-cyan-700"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Trusted by Australian Families
            </h2>
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <Users className="w-5 h-5" />
              <span>47,832 quotes checked and counting</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full bg-slate-50 border-0">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.location}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {testimonial.savings}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Money-Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-20"
        >
          <Card className="p-8 text-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <Shield className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
            <h3 className="text-2xl font-bold mb-2">Money-Back Guarantee</h3>
            <p className="text-slate-300 mb-4">
              Not satisfied? Full refund, no questions asked. We're confident you'll find value,
              but if you don't, we'll make it right.
            </p>
            <p className="text-sm text-slate-400">
              Valid for 30 days from purchase
            </p>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Common Questions
          </h2>

          <div className="space-y-6">
            <div className="border-b pb-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                What's included in the free quote check?
              </h3>
              <p className="text-slate-600">
                Upload any tradie quote and get an instant traffic light result (green, amber, or red)
                plus one key insight about the pricing. No signup required, no tricks.
              </p>
            </div>

            <div className="border-b pb-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                How is the $9.95 report different from the free check?
              </h3>
              <p className="text-slate-600">
                The full report includes a complete line-by-line breakdown of every item,
                market rate comparisons for your specific area, all red flags explained in detail,
                and a downloadable PDF you can keep or share.
              </p>
            </div>

            <div className="border-b pb-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                What's the Household Plan for?
              </h3>
              <p className="text-slate-600">
                If you're a homeowner, landlord, or have multiple properties, the Household Plan
                gives you unlimited quote checks for a year. Perfect for families who want to
                protect everyone from overpriced quotes.
              </p>
            </div>

            <div className="border-b pb-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                I'm a tradie. Why should I get verified?
              </h3>
              <p className="text-slate-600">
                The VENTURR Verified badge shows customers you quote fairly. You'll be listed
                in our verified contractor directory, get more enquiries from trust-conscious
                customers, and have access to our dispute resolution service.
              </p>
            </div>

            <div className="pb-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                Is my data secure?
              </h3>
              <p className="text-slate-600">
                Absolutely. We use bank-grade encryption, store data in Australian data centres,
                and never share your quotes with third parties. Your privacy is protected under
                Australian Privacy Principles.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-12">
        <div className="container">
          <div className="text-center">
            <p className="text-slate-600 mb-2">
              Built by Australians, for Australians
            </p>
            <p className="text-sm text-slate-500">
              See exactly what you're paying for. No hidden fees, no subscriptions you'll forget about.
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-500">
              <Link href="/terms">
                <span className="hover:text-slate-700">Terms of Service</span>
              </Link>
              <Link href="/privacy">
                <span className="hover:text-slate-700">Privacy Policy</span>
              </Link>
              <Link href="/help">
                <span className="hover:text-slate-700">Help Centre</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
