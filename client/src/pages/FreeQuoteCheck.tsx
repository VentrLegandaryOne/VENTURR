import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Shield,
  TrendingUp,
  Users,
  Star,
  RefreshCw,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

type TrafficLight = "green" | "amber" | "red" | null;

interface QuoteResult {
  trafficLight: TrafficLight;
  insight: string;
  quoteId: string;
  contractorName: string;
  totalAmount: number;
  workType: string;
}

export default function FreeQuoteCheck() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const uploadMutation = trpc.quotes.uploadForFreeCheck.useMutation();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF or image file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setIsUploading(false);
      setIsAnalyzing(true);

      // Upload and analyze
      const response = await uploadMutation.mutateAsync({
        fileName: file.name,
        fileData: base64,
        fileType: file.type,
      });

      setResult({
        trafficLight: response.trafficLight as TrafficLight,
        insight: response.insight,
        quoteId: response.quoteId,
        contractorName: response.contractorName,
        totalAmount: response.totalAmount,
        workType: response.workType,
      });
    } catch (error) {
      toast.error("Failed to analyze quote. Please try again.");
      console.error(error);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const resetCheck = () => {
    setResult(null);
    setUploadedFile(null);
  };

  const getTrafficLightConfig = (light: TrafficLight) => {
    switch (light) {
      case "green":
        return {
          icon: CheckCircle2,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          label: "Fair Price",
          description: "This quote appears to be fairly priced for the work described.",
        };
      case "amber":
        return {
          icon: AlertTriangle,
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          label: "Review Recommended",
          description: "Some aspects of this quote may warrant closer inspection.",
        };
      case "red":
        return {
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          label: "Concerns Detected",
          description: "We've identified potential issues that you should be aware of.",
        };
      default:
        return null;
    }
  };

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
          <Link href="/pricing">
            <Button variant="outline">View Pricing</Button>
          </Link>
        </div>
      </header>

      <main className="container py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="mb-4 bg-cyan-100 text-cyan-700 hover:bg-cyan-100">
            100% Free • No Signup Required
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Check Your Quote in Seconds
          </h1>
          <p className="text-xl text-slate-600">
            Upload any tradie quote and get an instant, honest assessment. 
            No tricks, no blurring – just straight-up advice from someone who knows the industry.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              {/* Upload Area */}
              <Card
                className={`p-12 border-2 border-dashed transition-all cursor-pointer ${
                  isDragging
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-slate-200 hover:border-cyan-300 hover:bg-slate-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={handleFileInput}
                />
                
                <div className="text-center">
                  {isUploading || isAnalyzing ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-cyan-100 flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-slate-900">
                          {isUploading ? "Uploading..." : "Analysing your quote..."}
                        </p>
                        <p className="text-slate-500 mt-1">
                          {isAnalyzing && "This usually takes about 10-15 seconds"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-900 mb-2">
                        Drop your quote here
                      </p>
                      <p className="text-slate-500 mb-4">
                        or click to browse • PDF or image files up to 10MB
                      </p>
                      <Button variant="outline" className="pointer-events-none">
                        <FileText className="w-4 h-4 mr-2" />
                        Select File
                      </Button>
                    </>
                  )}
                </div>
              </Card>

              {/* Trust Indicators */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="p-4">
                  <div className="w-10 h-10 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">100% Secure</p>
                  <p className="text-xs text-slate-500">Your data is encrypted</p>
                </div>
                <div className="p-4">
                  <div className="w-10 h-10 mx-auto rounded-full bg-cyan-100 flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-cyan-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Market Data</p>
                  <p className="text-xs text-slate-500">Real Australian prices</p>
                </div>
                <div className="p-4">
                  <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">47,000+ Checks</p>
                  <p className="text-xs text-slate-500">Trusted by Aussies</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Traffic Light Result */}
              {result.trafficLight && (
                <Card className={`p-8 mb-6 ${getTrafficLightConfig(result.trafficLight)?.bgColor} ${getTrafficLightConfig(result.trafficLight)?.borderColor} border-2`}>
                  <div className="flex items-start gap-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                      result.trafficLight === "green" ? "bg-green-200" :
                      result.trafficLight === "amber" ? "bg-amber-200" : "bg-red-200"
                    }`}>
                      {result.trafficLight === "green" && <CheckCircle2 className="w-10 h-10 text-green-600" />}
                      {result.trafficLight === "amber" && <AlertTriangle className="w-10 h-10 text-amber-600" />}
                      {result.trafficLight === "red" && <XCircle className="w-10 h-10 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className={`text-2xl font-bold ${getTrafficLightConfig(result.trafficLight)?.color}`}>
                          {getTrafficLightConfig(result.trafficLight)?.label}
                        </h2>
                      </div>
                      <p className="text-slate-600 mb-4">
                        {getTrafficLightConfig(result.trafficLight)?.description}
                      </p>
                      
                      {/* Quote Summary */}
                      <div className="bg-white/60 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Contractor:</span>
                            <span className="ml-2 font-medium text-slate-900">{result.contractorName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Work Type:</span>
                            <span className="ml-2 font-medium text-slate-900">{result.workType}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-500">Total Amount:</span>
                            <span className="ml-2 font-bold text-slate-900 text-lg">
                              ${result.totalAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Free Insight */}
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="flex items-start gap-3">
                          <Star className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-slate-900 mb-1">Your Free Insight</p>
                            <p className="text-slate-700">{result.insight}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Upgrade CTA */}
              <Card className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">Want the Full Picture?</h3>
                    <p className="text-slate-300 mb-4">
                      Get the complete detailed report with line-by-line breakdown, 
                      market comparisons, and all red flags explained.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Line-by-line price breakdown
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Market rate comparison for your area
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        All red flags explained in detail
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Downloadable PDF report
                      </li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">$9.95</div>
                    <p className="text-slate-400 text-sm mb-4">One-time payment</p>
                    <Link href={`/upgrade/${result.quoteId}`}>
                      <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                        Get Full Report
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <p className="text-xs text-slate-400 mt-3">
                      Money-back guarantee if not satisfied
                    </p>
                  </div>
                </div>
              </Card>

              {/* Check Another Quote */}
              <div className="text-center mt-6">
                <Button variant="ghost" onClick={resetCheck} className="text-slate-600">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Another Quote
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 mb-6">Trusted by Australian families and tradies</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 text-slate-600">4.9/5 from 2,847 reviews</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-8 mt-16">
        <div className="container text-center text-slate-500 text-sm">
          <p className="mb-2">Built by Australians, for Australians</p>
          <p>No hidden fees, no subscriptions you'll forget about</p>
        </div>
      </footer>
    </div>
  );
}
