import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Link } from "wouter";
import { TriangularUpload, TriangularCheck, TriangularArrowRight } from "@/components/branding/TriangularIcons";
import { X } from "lucide-react";

export default function CompareQuotes() {
  const [uploadedQuotes, setUploadedQuotes] = useState<Array<{ id: string; name: string; size: string }>>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      addQuote(file);
    });
  };

  const addQuote = (file: File) => {
    const newQuote = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB'
    };
    setUploadedQuotes(prev => [...prev, newQuote]);
  };

  const removeQuote = (id: string) => {
    setUploadedQuotes(prev => prev.filter(q => q.id !== id));
  };

  const comparisonFeatures = [
    {
      title: "Side-by-Side Pricing",
      description: "Compare line items across multiple quotes to identify pricing discrepancies and find the best value.",
      icon: <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 7H21V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    },
    {
      title: "Material Quality Analysis",
      description: "Evaluate material specifications, quality grades, and compliance across all quotes to ensure consistency.",
      icon: <TriangularCheck className="w-8 h-8 text-primary" />
    },
    {
      title: "Warranty Comparison",
      description: "Review warranty terms, coverage periods, and exclusions side-by-side to make informed decisions.",
      icon: <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    },
    {
      title: "Timeline Comparison",
      description: "Compare project timelines, milestones, and completion dates to find the most efficient contractor.",
      icon: <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    },
    {
      title: "Compliance Verification",
      description: "Ensure all quotes meet HB-39, NCC, and local building code requirements with automated compliance checking.",
      icon: <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    },
    {
      title: "Contractor Reputation",
      description: "Access contractor ratings, reviews, and verified credentials to assess reliability and quality.",
      icon: <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    }
  ];

  const benefits = [
    "Save 15-30% by identifying overpriced quotes",
    "Spot hidden fees and markup inconsistencies",
    "Ensure material quality consistency",
    "Verify compliance across all quotes",
    "Compare warranty coverage terms",
    "Identify the best value proposition"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 triangle-pattern">
        <div className="container max-w-7xl">
          {/* Hero Section */}
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
              <span className="text-sm font-medium text-primary">AI-Powered Quote Comparison</span>
            </motion.div>
            <h1 className="mb-6">Compare Multiple Quotes</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Upload multiple quotes and let our AI analyze pricing, materials, and compliance side-by-side to help you make the smartest decision.
            </p>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16"
          >
            <Card className="p-8 glass-strong">
              <h2 className="text-2xl font-bold mb-6 text-center">Upload Quotes to Compare</h2>
              
              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-primary bg-primary/5 scale-105'
                    : 'border-border hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center hover:glow-primary transition-smooth">
                  <TriangularUpload className="w-10 h-10 text-primary" />
                </div>
                <h3 className="mb-2 text-card-foreground">
                  {isDragging ? 'Drop your quotes here' : 'Drag and drop multiple quotes'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  or click to browse from your device (2-5 quotes recommended)
                </p>
                <Button variant="outline">
                  Choose Files
                </Button>
              </div>

              {/* Uploaded Quotes List */}
              <AnimatePresence>
                {uploadedQuotes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8"
                  >
                    <h3 className="text-lg font-semibold mb-4">Uploaded Quotes ({uploadedQuotes.length})</h3>
                    <div className="space-y-3">
                      {uploadedQuotes.map((quote, index) => (
                        <motion.div
                          key={quote.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{quote.name}</p>
                              <p className="text-xs text-muted-foreground">{quote.size}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeQuote(quote.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    
                    <Button
                      size="lg"
                      className="w-full mt-6 shadow-md shadow-primary/20"
                      disabled={uploadedQuotes.length < 2}
                    >
                      Compare {uploadedQuotes.length} Quotes
                      <TriangularArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    
                    {uploadedQuotes.length < 2 && (
                      <p className="text-sm text-muted-foreground text-center mt-3">
                        Upload at least 2 quotes to start comparison
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What We Compare</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Our AI performs comprehensive side-by-side analysis across six critical dimensions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 space-fib-8">
              {comparisonFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full floating-card glass-strong hover:glow-primary transition-smooth">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
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
            <Card className="p-8 glass-strong">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Why Compare with VENTURR VALDT?</h2>
                  <p className="text-muted-foreground mb-6">
                    Stop second-guessing your contractor choices. Our AI-powered comparison engine analyzes every detail to ensure you get the best value without compromising quality.
                  </p>
                  <div className="space-y-3">
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={benefit}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2"
                      >
                        <TriangularCheck className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-primary mb-2">15-30%</div>
                      <p className="text-lg font-medium">Average Savings</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Identified through quote comparison
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="p-12 glass-strong border-primary/20">
              <h2 className="text-3xl font-bold mb-4">Ready to Find the Best Quote?</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Upload your quotes now and let our AI do the heavy lifting. Get a comprehensive comparison report in under 60 seconds.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/quote/upload">
                  <Button size="lg" className="shadow-md shadow-primary/20">
                    Start Comparing Now
                    <TriangularArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button size="lg" variant="outline">
                    Learn How It Works
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
