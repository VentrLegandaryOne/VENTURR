import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ChevronDown,
  ChevronRight,
  Search,
  FileText,
  Upload,
  Shield,
  Users,
  BarChart3,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  Video,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// FAQ Data organized by category
const faqCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    faqs: [
      {
        question: "What is VENTURR VALDT?",
        answer: "VENTURR VALDT is an AI-powered quote verification platform designed specifically for the Australian construction industry. We help homeowners verify quotes from tradespeople (electricians, plumbers, roofers, builders, landscapers) by checking pricing against market rates, verifying compliance with Australian Standards, and validating contractor credentials.",
      },
      {
        question: "How do I get started?",
        answer: "Simply click 'Verify Quote' in the navigation bar, upload your quote (PDF, image, or photo), and our AI will analyze it within 60 seconds. You'll receive a comprehensive report covering pricing analysis, materials verification, compliance checking, and warranty assessment.",
      },
      {
        question: "What file formats are supported?",
        answer: "We support PDF documents, JPEG/JPG images, PNG images, and HEIC photos (from iPhone). You can also use your phone's camera to take a photo directly. Maximum file size is 16MB per document.",
      },
      {
        question: "Is my data secure?",
        answer: "Yes, absolutely. We use bank-grade encryption (TLS 1.3), store data in secure Australian data centers, and never share your information with third parties. Your quotes and personal data are protected under Australian Privacy Principles.",
      },
    ],
  },
  {
    id: "quote-verification",
    title: "Quote Verification",
    icon: FileText,
    faqs: [
      {
        question: "How accurate is the AI verification?",
        answer: "Our AI achieves 95%+ accuracy in compliance detection and pricing analysis. We cross-reference quotes against Rawlinsons Construction Handbook, HIA pricing data, Fair Work Commission rates, and 24 Australian Standards. All findings are cited with authoritative sources.",
      },
      {
        question: "What does the verification report include?",
        answer: "Each report includes: Pricing Analysis (comparison to market rates), Materials Verification (quality and standards compliance), Compliance Check (Australian Standards, NCC 2022, state building codes), Warranty Assessment, and an Overall Score with recommendations.",
      },
      {
        question: "What do the score colors mean?",
        answer: "Green (80-100): Quote is well-priced and compliant - safe to proceed. Amber (60-79): Some concerns identified - review recommended items before proceeding. Red (0-59): Significant issues found - we recommend getting additional quotes or addressing concerns with the contractor.",
      },
      {
        question: "How long does verification take?",
        answer: "Most quotes are verified within 60 seconds. Complex quotes with multiple pages or handwritten content may take up to 2 minutes. You'll see real-time progress during the analysis.",
      },
      {
        question: "Can I verify multiple quotes at once?",
        answer: "Yes! You can upload 2-20 quotes simultaneously for comparison. Our AI will analyze each quote and provide a side-by-side comparison highlighting the best value option, pricing differences, and compliance variations.",
      },
    ],
  },
  {
    id: "pricing-market-rates",
    title: "Pricing & Market Rates",
    icon: BarChart3,
    faqs: [
      {
        question: "Where do your market rates come from?",
        answer: "Our market rates are sourced from: Rawlinsons Australian Construction Handbook (2024 edition), Housing Industry Association (HIA) pricing data, Fair Work Commission award rates, Master Builders Association surveys, and Australian Bureau of Statistics (ABS) construction indices.",
      },
      {
        question: "Are rates different for each city?",
        answer: "Yes, we maintain separate rate databases for Sydney, Melbourne, Brisbane, Adelaide, and Perth. We also apply regional adjustments for metro, regional, remote, and very remote areas based on ABS geographic classifications.",
      },
      {
        question: "How often are rates updated?",
        answer: "Market rates are updated quarterly (January, April, July, October) using CPI adjustments from ABS and labor cost indices from Fair Work Commission. Major rate revisions occur annually when new Rawlinsons data is published.",
      },
      {
        question: "What if my quote is outside the expected range?",
        answer: "Quotes within ±15% of market rates are considered normal. Quotes 15-30% above may indicate premium materials or complex work. Quotes >30% above warrant further investigation. We'll highlight specific line items that appear overpriced.",
      },
    ],
  },
  {
    id: "compliance-standards",
    title: "Compliance & Standards",
    icon: Shield,
    faqs: [
      {
        question: "Which Australian Standards do you check?",
        answer: "We verify compliance with 24 Australian Standards including: AS/NZS 3000 (Wiring Rules), AS 3500 (Plumbing), AS 4055 (Wind Loads), AS 1684 (Timber Framing), AS 4100 (Steel Structures), NCC 2022 (Building Code), and state-specific variations for NSW, VIC, QLD, SA, WA, TAS, NT, and ACT.",
      },
      {
        question: "Do you check contractor licenses?",
        answer: "Yes, we verify contractor credentials against state licensing authorities: NSW Fair Trading, Victorian Building Authority (VBA), Queensland Building and Construction Commission (QBCC), SA Consumer and Business Services, WA Building Commission, and others. We also validate ABN numbers using the official checksum algorithm.",
      },
      {
        question: "What if compliance issues are found?",
        answer: "We'll clearly identify which standards are not met, explain the requirements, and provide recommendations. For critical safety issues (electrical, structural, fire), we recommend not proceeding until the contractor addresses the concerns in writing.",
      },
    ],
  },
  {
    id: "contractors",
    title: "For Contractors",
    icon: Users,
    faqs: [
      {
        question: "How can I register as a contractor?",
        answer: "Visit the Contractor Registration page, enter your ABN (we'll verify it automatically), provide your license details, and upload proof of insurance. Once verified, you can claim and manage your profile, respond to reviews, and update your credentials.",
      },
      {
        question: "How are contractor ratings calculated?",
        answer: "Ratings are based on: Quote accuracy (how close your quotes are to final costs), Compliance score (adherence to Australian Standards), Customer reviews (1-5 stars), On-time completion rate, and Response time to inquiries. Each factor is weighted to produce an overall score.",
      },
      {
        question: "Can I dispute a negative review?",
        answer: "Yes, you can submit a dispute through your contractor portal. Provide evidence supporting your position, and our team will review within 5 business days. If the review violates our guidelines or contains factual errors, it may be removed or amended.",
      },
      {
        question: "How do I update my credentials?",
        answer: "Log into your contractor portal, navigate to 'Credentials', and upload updated license certificates, insurance documents, or qualifications. Changes are verified within 24-48 hours.",
      },
    ],
  },
  {
    id: "account-billing",
    title: "Account & Billing",
    icon: MessageCircle,
    faqs: [
      {
        question: "Is VENTURR VALDT free to use?",
        answer: "We offer a free tier with 3 quote verifications per month. Professional plans start at $29/month for unlimited verifications, priority processing, and PDF report downloads. Enterprise plans include API access, bulk uploads, and white-label options.",
      },
      {
        question: "How do I upgrade my account?",
        answer: "Visit the Pricing page and select your preferred plan. Payment is processed securely through Stripe. You can upgrade, downgrade, or cancel at any time - changes take effect at the start of your next billing cycle.",
      },
      {
        question: "Can I get a refund?",
        answer: "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact support within 14 days of purchase for a full refund. No questions asked.",
      },
    ],
  },
];

// Quick start guides
const quickStartGuides = [
  {
    title: "Upload Your First Quote",
    description: "Learn how to upload and verify a construction quote in under 2 minutes",
    icon: Upload,
    steps: [
      "Click 'Verify Quote' in the navigation",
      "Drag and drop your quote file or click to browse",
      "Wait 60 seconds for AI analysis",
      "Review your comprehensive verification report",
    ],
    link: "/quote/upload",
  },
  {
    title: "Compare Multiple Quotes",
    description: "Get the best value by comparing 2-5 quotes side by side",
    icon: BarChart3,
    steps: [
      "Upload multiple quotes at once (2-20 files)",
      "AI analyzes each quote independently",
      "View side-by-side comparison with recommendations",
      "Download comparison report as PDF",
    ],
    link: "/compare",
  },
  {
    title: "Verify Contractor Credentials",
    description: "Check if your contractor is licensed and insured",
    icon: Shield,
    steps: [
      "Go to Contractors in the navigation",
      "Search by name, ABN, or license number",
      "View verified credentials and ratings",
      "Check insurance and license expiry dates",
    ],
    link: "/contractors",
  },
  {
    title: "Understand Your Report",
    description: "Learn what each section of your verification report means",
    icon: FileText,
    steps: [
      "Overall Score: Green (safe), Amber (review), Red (caution)",
      "Pricing Analysis: Comparison to market rates",
      "Compliance: Australian Standards verification",
      "Recommendations: Actionable next steps",
    ],
    link: "/dashboard",
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("getting-started");

  // Filter FAQs based on search
  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => searchQuery === "" || category.faqs.length > 0);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 triangle-pattern opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              <HelpCircle className="w-3 h-3 mr-1" />
              Help Center
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
              How Can We Help?
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Find answers to common questions, learn how to use VENTURR VALDT, or contact our support team.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg rounded-full border-2 focus:border-primary"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Start Guides */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Quick Start Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStartGuides.map((guide, index) => (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <guide.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2 text-sm text-muted-foreground mb-4">
                      {guide.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                    <Link href={guide.link}>
                      <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Get Started <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="max-w-4xl mx-auto">
            <TabsList className="flex flex-wrap justify-center gap-2 mb-8 h-auto bg-transparent">
              {filteredCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-full"
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.title}
                  {searchQuery && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {category.faqs.length}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {filteredCategories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="space-y-4">
                  {category.faqs.map((faq, index) => {
                    const faqId = `${category.id}-${index}`;
                    const isExpanded = expandedFaq === faqId;
                    
                    return (
                      <motion.div
                        key={faqId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all ${
                            isExpanded ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
                          }`}
                          onClick={() => toggleFaq(faqId)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base font-medium pr-4">
                                {faq.question}
                              </CardTitle>
                              <ChevronDown
                                className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </CardHeader>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <CardContent className="pt-0 text-muted-foreground">
                                  {faq.answer}
                                </CardContent>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {searchQuery && filteredCategories.every((c) => c.faqs.length === 0) && (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any FAQs matching "{searchQuery}"
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Still Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Email Support</CardTitle>
                <CardDescription>Get a response within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <a href="mailto:support@venturr.com.au" className="text-primary hover:underline font-medium">
                  support@venturr.com.au
                </a>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-green-500" />
                </div>
                <CardTitle>Phone Support</CardTitle>
                <CardDescription>Mon-Fri, 9am-5pm AEST</CardDescription>
              </CardHeader>
              <CardContent>
                <a href="tel:1300VENTURR" className="text-primary hover:underline font-medium">
                  1300 VENTURR
                </a>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
                <CardTitle>Response Times</CardTitle>
                <CardDescription>We aim to respond quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Email: Within 24 hours</li>
                  <li>Phone: Immediate</li>
                  <li>Disputes: 5 business days</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Status Indicators */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Quote Verification Service</span>
                    <Badge className="bg-green-500">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Contractor Database</span>
                    <Badge className="bg-green-500">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Market Rates API</span>
                    <Badge className="bg-green-500">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>PDF Report Generation</span>
                    <Badge className="bg-green-500">Operational</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Last updated: {new Date().toLocaleString("en-AU")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
