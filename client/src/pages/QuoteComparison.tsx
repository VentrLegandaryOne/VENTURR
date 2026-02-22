import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle2, Trophy, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { toast } from "sonner";

interface UploadedQuote {
  id: string;
  file: File;
  name: string;
}

export default function QuoteComparison() {
  const [quotes, setQuotes] = useState<UploadedQuote[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (quotes.length + files.length > 4) {
      toast.error("Maximum 4 quotes can be compared at once");
      return;
    }

    const newQuotes: UploadedQuote[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
    }));

    setQuotes([...quotes, ...newQuotes]);
    toast.success(`${files.length} quote(s) added`);
  };

  const removeQuote = (id: string) => {
    setQuotes(quotes.filter((q) => q.id !== id));
  };

  const handleCompare = async () => {
    if (quotes.length < 2) {
      toast.error("Please upload at least 2 quotes to compare");
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      setComparisonResult({
        winner: quotes[0].id,
        quotes: quotes.map((q, index) => ({
          id: q.id,
          name: q.name,
          totalPrice: 45000 + index * 5000,
          pricePerSqm: 450 + index * 50,
          score: 92 - index * 10,
          savings: index === 0 ? 0 : (index * 5000),
          strengths: [
            "Competitive pricing",
            "Quality materials specified",
            "Comprehensive warranty",
          ],
          weaknesses: index > 0 ? [
            "Above market rate",
            "Limited warranty coverage",
          ] : [],
        })),
        recommendation: "Quote 1 offers the best value with competitive pricing and comprehensive coverage.",
      });
      setIsAnalyzing(false);
      toast.success("Comparison complete!");
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="mb-4">Compare Quotes</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload 2-4 quotes to get AI-powered comparative analysis and identify the best value proposition.
            </p>
          </motion.div>

          {/* Upload section */}
          {!comparisonResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {[...Array(4)].map((_, index) => (
                    <div
                      key={index}
                      className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
                        quotes[index]
                          ? 'border-success bg-success/5'
                          : 'border-border hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    >
                      {quotes[index] ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-success" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-card-foreground truncate">
                              {quotes[index].name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Quote {index + 1}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuote(quotes[index].id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                            <Upload className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Quote {index + 1}
                            {index < 2 && <span className="text-destructive"> *</span>}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="quote-upload"
                  />
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => document.getElementById('quote-upload')?.click()}
                    className="flex-1"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Add Quotes
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleCompare}
                    disabled={quotes.length < 2 || isAnalyzing}
                    className="flex-1"
                  >
                    {isAnalyzing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                        />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Compare Quotes
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Comparison results */}
          <AnimatePresence>
            {comparisonResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Winner card */}
                <Card className="p-8 glass border-success/30 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <h3 className="text-success">Best Value</h3>
                        <p className="text-sm text-muted-foreground">
                          {comparisonResult.quotes.find((q: any) => q.id === comparisonResult.winner)?.name}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{comparisonResult.recommendation}</p>
                  </div>
                </Card>

                {/* Comparison table */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {comparisonResult.quotes.map((quote: any, index: number) => (
                    <motion.div
                      key={quote.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`p-6 h-full ${
                        quote.id === comparisonResult.winner
                          ? 'border-success/30 bg-success/5'
                          : 'border-border'
                      }`}>
                        {/* Winner badge */}
                        {quote.id === comparisonResult.winner && (
                          <div className="flex items-center gap-2 mb-4 text-success">
                            <Trophy className="w-4 h-4" />
                            <span className="text-sm font-semibold">BEST VALUE</span>
                          </div>
                        )}

                        {/* Quote name */}
                        <h4 className="mb-4 truncate">{quote.name}</h4>

                        {/* Price */}
                        <div className="mb-4">
                          <p className="text-3xl font-bold text-card-foreground">
                            ${quote.totalPrice.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${quote.pricePerSqm}/m²
                          </p>
                        </div>

                        {/* Score */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Overall Score</span>
                            <span className="text-sm font-semibold text-primary">{quote.score}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${quote.score}%` }}
                              transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            />
                          </div>
                        </div>

                        {/* Savings */}
                        {quote.savings > 0 && (
                          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-destructive/10">
                            <TrendingUp className="w-4 h-4 text-destructive" />
                            <span className="text-sm text-destructive font-medium">
                              ${quote.savings.toLocaleString()} more expensive
                            </span>
                          </div>
                        )}

                        {quote.savings === 0 && (
                          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-success/10">
                            <TrendingDown className="w-4 h-4 text-success" />
                            <span className="text-sm text-success font-medium">
                              Best price
                            </span>
                          </div>
                        )}

                        {/* Strengths */}
                        <div className="mb-4">
                          <p className="text-sm font-medium text-card-foreground mb-2">Strengths</p>
                          <ul className="space-y-1">
                            {quote.strengths.slice(0, 3).map((strength: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        {quote.weaknesses.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-card-foreground mb-2">Concerns</p>
                            <ul className="space-y-1">
                              {quote.weaknesses.slice(0, 2).map((weakness: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                                  <span>{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      setComparisonResult(null);
                      setQuotes([]);
                    }}
                  >
                    Compare New Quotes
                  </Button>
                  <Button size="lg">
                    Download Comparison Report
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
