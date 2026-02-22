import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Link } from "wouter";
import { TriangularUpload, TriangularCheck, TriangularArrowRight } from "@/components/branding/TriangularIcons";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload Your Quote",
      description: "Drag and drop your quote PDF, image, or document. We support all common formats including PDF, JPEG, PNG, and HEIC. Our system instantly extracts data using advanced OCR technology.",
      icon: <TriangularUpload className="w-12 h-12 text-primary" />,
      details: [
        "Supported formats: PDF, JPEG, PNG, HEIC",
        "Maximum file size: 16MB",
        "Instant OCR text extraction",
        "Secure encrypted upload",
        "Progress tracking in real-time"
      ]
    },
    {
      number: "02",
      title: "AI Analysis",
      description: "Our verification engine analyzes pricing, materials, compliance, and warranty terms against industry standards in under 60 seconds using proprietary AI algorithms.",
      icon: <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>,
      details: [
        "Pricing comparison against market rates",
        "Material specification verification",
        "Building code compliance check (HB-39, NCC)",
        "Warranty terms analysis",
        "Installation requirements validation"
      ]
    },
    {
      number: "03",
      title: "Get Your Report",
      description: "Receive a comprehensive verification report with actionable insights, red flags, and recommendations to negotiate confidently and save thousands on your project.",
      icon: <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>,
      details: [
        "Detailed pricing breakdown",
        "Material quality assessment",
        "Compliance status report",
        "Risk flags and warnings",
        "Negotiation recommendations"
      ]
    }
  ];

  const features = [
    {
      title: "Pricing Analysis",
      description: "Compare your quote against market rate estimates from our database of suppliers and contractors.",
      icon: <svg className="w-8 h-8 text-success" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 7H21V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    },
    {
      title: "Material Specifications",
      description: "Verify material quality, specifications, and compatibility with Australian standards (AS/NZS).",
      icon: <TriangularCheck className="w-8 h-8 text-success" />
    },
    {
      title: "Building Code Compliance",
      description: "Ensure compliance with HB-39, NCC, and local building regulations to avoid costly delays.",
      icon: <svg className="w-8 h-8 text-success" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    },
    {
      title: "Warranty Analysis",
      description: "Review warranty terms, coverage, and exclusions to ensure you're fully protected.",
      icon: <svg className="w-8 h-8 text-success" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    },
    {
      title: "Installation Requirements",
      description: "Validate installation methods, labor requirements, and timeline estimates.",
      icon: <svg className="w-8 h-8 text-success" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    },
    {
      title: "Safety Standards",
      description: "Verify adherence to workplace safety standards and risk mitigation protocols.",
      icon: <svg className="w-8 h-8 text-success" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    }
  ];

  const benefits = [
    {
      title: "AI-Powered Analysis",
      description: "Our AI model analyzes quotes against market data to provide pricing insights and identify potential areas for discussion."
    },
    {
      title: "Real-Time Market Data",
      description: "Access live pricing data from 5,000+ suppliers and contractors across Australia, updated daily."
    },
    {
      title: "Compliance with Standards",
      description: "Automated compliance checking against HB-39, NCC, AS/NZS standards, and local building regulations."
    },
    {
      title: "Instant PDF Reports",
      description: "Download professional verification reports in seconds, ready to share with stakeholders."
    },
    {
      title: "Secure & Confidential",
      description: "Bank-grade encryption (AES-256) ensures your quotes and data remain completely private."
    },
    {
      title: "Money-Back Guarantee",
      description: "If we don't find savings opportunities, get a full refund—no questions asked."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 triangle-pattern">
        {/* Hero Section */}
        <div className="container max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4 px-4 py-2 rounded-full glass-strong"
            >
              <span className="text-sm font-medium text-primary">AI-Powered Quote Verification</span>
            </motion.div>
            <h1 className="mb-6">How VENTURR VALDT Works</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get professional-grade quote verification in three simple steps. No technical knowledge required—just upload, analyze, and save.
            </p>
          </motion.div>

          {/* Steps Section */}
          <div className="space-fib-13 mb-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="p-8 floating-card glass-strong hover:glow-primary transition-smooth">
                  <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
                    {/* Step Number & Icon */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-6xl font-bold text-primary/20 venturr-wordmark">
                        {step.number}
                      </div>
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        {step.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h2 className="text-2xl font-bold mb-4">{step.title}</h2>
                      <p className="text-muted-foreground mb-6 text-lg">
                        {step.description}
                      </p>

                      {/* Details List */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        {step.details.map((detail, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <TriangularCheck className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-card-foreground">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What We Verify</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Our AI engine performs comprehensive analysis across six critical dimensions to ensure you never overpay.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 space-fib-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full floating-card glass-strong hover:glow-primary transition-smooth">
                    <div className="w-16 h-16 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose VENTURR VALDT</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Industry-leading technology, real-time data, and uncompromising security—all in one platform.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 space-fib-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full glass-strong hover:border-primary/50 transition-smooth">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <TriangularCheck className="w-5 h-5 text-primary" />
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="p-12 glass-strong border-primary/20">
              <h2 className="text-3xl font-bold mb-4">Ready to Verify Your Quote?</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of smart contractors and homeowners who never overpay. Get your first verification report in under 60 seconds.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/quote/upload">
                  <Button size="lg" className="shadow-md shadow-primary/20">
                    Verify Your Quote Now
                    <TriangularArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
