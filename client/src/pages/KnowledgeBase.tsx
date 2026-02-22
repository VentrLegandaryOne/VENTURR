import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Zap, 
  Droplets, 
  Home, 
  Hammer, 
  Wind, 
  Paintbrush, 
  Grid3X3, 
  Square, 
  Trees, 
  GlassWater,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Shield,
  Clock,
  BookOpen,
  ChevronRight,
  ArrowLeft,
  Info,
  Star,
  Target
} from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

type TradeType = "electrical" | "plumbing" | "roofing" | "building" | "carpentry" | "hvac" | "painting" | "tiling" | "concreting" | "landscaping" | "glazing" | "fencing";

interface TradeInfo {
  id: TradeType;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const TRADES: TradeInfo[] = [
  { id: "electrical", name: "Electrical", icon: <Zap className="h-6 w-6" />, color: "bg-yellow-500", description: "Wiring, switchboards, solar, lighting" },
  { id: "plumbing", name: "Plumbing", icon: <Droplets className="h-6 w-6" />, color: "bg-blue-500", description: "Hot water, drainage, gas fitting" },
  { id: "roofing", name: "Roofing", icon: <Home className="h-6 w-6" />, color: "bg-red-500", description: "Metal roofing, tiles, gutters" },
  { id: "building", name: "Building", icon: <Hammer className="h-6 w-6" />, color: "bg-orange-500", description: "Structural, renovations, extensions" },
  { id: "hvac", name: "HVAC", icon: <Wind className="h-6 w-6" />, color: "bg-cyan-500", description: "Air conditioning, heating, ventilation" },
  { id: "painting", name: "Painting", icon: <Paintbrush className="h-6 w-6" />, color: "bg-purple-500", description: "Interior, exterior, protective coatings" },
  { id: "tiling", name: "Tiling", icon: <Grid3X3 className="h-6 w-6" />, color: "bg-emerald-500", description: "Floor tiles, wall tiles, waterproofing" },
  { id: "concreting", name: "Concreting", icon: <Square className="h-6 w-6" />, color: "bg-gray-500", description: "Slabs, driveways, foundations" },
  { id: "landscaping", name: "Landscaping", icon: <Trees className="h-6 w-6" />, color: "bg-green-500", description: "Retaining walls, paving, gardens" },
  { id: "glazing", name: "Glazing", icon: <GlassWater className="h-6 w-6" />, color: "bg-sky-500", description: "Windows, doors, pool fencing" },
];

export default function KnowledgeBase() {
  const [selectedTrade, setSelectedTrade] = useState<TradeType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("best-practices");

  // Fetch data for selected trade
  const { data: bestPractices, isLoading: loadingPractices, error: errorBestPractices } = trpc.tradeKnowledge.getBestPractices.useQuery(
    { trade: selectedTrade! },
    { enabled: !!selectedTrade, retry: 2 }
  );

  const { data: sops, isLoading: loadingSOPs, error: errorSops } = trpc.tradeKnowledge.getSOPs.useQuery(
    { trade: selectedTrade! },
    { enabled: !!selectedTrade, retry: 2 }
  );

  const { data: defects, isLoading: loadingDefects, error: errorDefects } = trpc.tradeKnowledge.getCommonDefects.useQuery(
    { trade: selectedTrade! },
    { enabled: !!selectedTrade, retry: 2 }
  );

  const { data: benchmarks, isLoading: loadingBenchmarks, error: errorBenchmarks } = trpc.tradeKnowledge.getQualityBenchmarks.useQuery(
    { trade: selectedTrade! },
    { enabled: !!selectedTrade, retry: 2 }
  );

  const { data: warranties, isLoading: loadingWarranties, error: errorWarranties } = trpc.tradeKnowledge.getWarrantyInfo.useQuery(
    { trade: selectedTrade! },
    { enabled: !!selectedTrade, retry: 2 }
  );

  // Search functionality
  const { data: searchResults, error: errorSearchResults } = trpc.tradeKnowledge.search.useQuery(
    { keyword: searchQuery },
    { enabled: searchQuery.length >= 2, retry: 2 }
  );

  const selectedTradeInfo = TRADES.find(t => t.id === selectedTrade);

  // Filter content based on search within selected trade
  const filteredPractices = useMemo(() => {
    if (!bestPractices || !searchQuery) return bestPractices;
    const query = searchQuery.toLowerCase();
    return bestPractices.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.requirements.some(r => r.toLowerCase().includes(query))
    );
  }, [bestPractices, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">Knowledge Base</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/quote/upload">
              <Button>Upload Quote</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search best practices, standards, SOPs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
          {searchQuery.length >= 2 && searchResults && (
            <div className="max-w-2xl mx-auto mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Found {searchResults.length} results for "{searchQuery}"
              </p>
              {searchResults.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <ScrollArea className="h-64">
                      {searchResults.map((result, idx) => (
                        <div 
                          key={idx} 
                          className="p-3 hover:bg-muted rounded-lg cursor-pointer mb-2"
                          onClick={() => {
                            setSelectedTrade(result.trade as TradeType);
                            setSearchQuery("");
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{result.trade}</Badge>
                            <span className="font-medium">{result.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{result.description}</p>
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Trade Selection Grid */}
        {!selectedTrade && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Select a Trade</h2>
              <p className="text-muted-foreground">
                Explore Australian Standards, best practices, and SOPs for each trade
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {TRADES.map((trade) => (
                <motion.div
                  key={trade.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="cursor-pointer hover:border-primary transition-colors h-full"
                    onClick={() => setSelectedTrade(trade.id)}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className={`${trade.color} text-white p-3 rounded-xl mb-3`}>
                        {trade.icon}
                      </div>
                      <h3 className="font-semibold mb-1">{trade.name}</h3>
                      <p className="text-xs text-muted-foreground">{trade.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Trade Detail View */}
        <AnimatePresence mode="wait">
          {selectedTrade && selectedTradeInfo && (
            <motion.div
              key={selectedTrade}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Trade Header */}
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedTrade(null)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  All Trades
                </Button>
                <div className="flex items-center gap-3">
                  <div className={`${selectedTradeInfo.color} text-white p-2 rounded-lg`}>
                    {selectedTradeInfo.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTradeInfo.name}</h2>
                    <p className="text-muted-foreground">{selectedTradeInfo.description}</p>
                  </div>
                </div>
              </div>

              {/* Content Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                  <TabsTrigger value="best-practices" className="gap-2">
                    <Star className="h-4 w-4" />
                    <span className="hidden sm:inline">Best Practices</span>
                  </TabsTrigger>
                  <TabsTrigger value="sops" className="gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">SOPs</span>
                  </TabsTrigger>
                  <TabsTrigger value="quality" className="gap-2">
                    <Target className="h-4 w-4" />
                    <span className="hidden sm:inline">Quality</span>
                  </TabsTrigger>
                  <TabsTrigger value="defects" className="gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="hidden sm:inline">Defects</span>
                  </TabsTrigger>
                  <TabsTrigger value="warranty" className="gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Warranty</span>
                  </TabsTrigger>
                </TabsList>

                {/* Best Practices Tab */}
                <TabsContent value="best-practices" className="space-y-4">
                  {loadingPractices ? (
                    <LoadingSkeleton />
                  ) : filteredPractices && filteredPractices.length > 0 ? (
                    <div className="grid gap-4">
                      {filteredPractices.map((practice, idx) => (
                        <Card key={idx}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{practice.title}</CardTitle>
                                <CardDescription>{practice.description}</CardDescription>
                              </div>
                              <Badge variant="outline" className="shrink-0">
                                {practice.category}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Standard References */}
                            <div>
                              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Australian Standards
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {practice.standardReferences.map((ref, i) => (
                                  <Badge key={i} variant="secondary">{ref}</Badge>
                                ))}
                              </div>
                            </div>

                            {/* Requirements */}
                            <div>
                              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Requirements
                              </h4>
                              <ul className="space-y-2">
                                {practice.requirements.map((req, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <span>{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Quality Benchmarks */}
                            {practice.qualityBenchmarks && practice.qualityBenchmarks.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  Quality Benchmarks
                                </h4>
                                <div className="grid gap-2">
                                  {practice.qualityBenchmarks.slice(0, 3).map((benchmark, i) => (
                                    <div key={i} className="bg-muted/50 p-3 rounded-lg text-sm">
                                      <div className="font-medium">{benchmark.metric}</div>
                                      <div className="text-muted-foreground">
                                        Acceptable: {benchmark.acceptableRange}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No best practices found for this trade" />
                  )}
                </TabsContent>

                {/* SOPs Tab */}
                <TabsContent value="sops" className="space-y-4">
                  {loadingSOPs ? (
                    <LoadingSkeleton />
                  ) : sops && sops.length > 0 ? (
                    <Accordion type="single" collapsible className="space-y-4">
                      {sops.map((sop, idx) => (
                        <AccordionItem key={idx} value={`sop-${idx}`} className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                              <div className="bg-primary/10 p-2 rounded-lg">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-semibold">{sop.title}</div>
                                <div className="text-sm text-muted-foreground">{sop.purpose}</div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 pb-6">
                            <div className="space-y-6">
                              {/* Scope */}
                              <div>
                                <h4 className="text-sm font-semibold mb-2">Scope</h4>
                                <p className="text-sm text-muted-foreground">{sop.scope}</p>
                              </div>

                              {/* Steps */}
                              <div>
                                <h4 className="text-sm font-semibold mb-3">Procedure Steps</h4>
                                <div className="space-y-3">
                                  {sop.steps.map((step, i) => (
                                    <div key={i} className="flex gap-3">
                                      <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                                        {step.stepNumber}
                                      </div>
                                      <div>
                                        <div className="font-medium">{step.action}</div>
                                        <div className="text-sm text-muted-foreground">{step.details}</div>
                                        {step.safetyNote && (
                                          <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded text-sm">
                                            <span className="font-medium text-yellow-700 dark:text-yellow-400">Safety Note: </span>
                                            {step.safetyNote}
                                          </div>
                                        )}
                                        {step.qualityCheck && (
                                          <div className="mt-2 bg-green-50 dark:bg-green-900/20 p-2 rounded text-sm">
                                            <span className="font-medium text-green-700 dark:text-green-400">Quality Check: </span>
                                            {step.qualityCheck}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Safety Requirements */}
                              <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-red-500" />
                                  Safety Requirements
                                </h4>
                                <ul className="grid gap-1">
                                  {sop.safetyRequirements.map((req, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                      <AlertTriangle className="h-3 w-3 text-red-500" />
                                      {req}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Quality Checks */}
                              <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  Quality Checks
                                </h4>
                                <ul className="grid gap-1">
                                  {sop.qualityChecks.map((check, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                                      {check}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Documentation */}
                              <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-blue-500" />
                                  Required Documentation
                                </h4>
                                <ul className="grid gap-1">
                                  {sop.documentation.map((doc, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                      <FileText className="h-3 w-3 text-blue-500" />
                                      {doc}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <EmptyState message="No SOPs found for this trade" />
                  )}
                </TabsContent>

                {/* Quality Benchmarks Tab */}
                <TabsContent value="quality" className="space-y-4">
                  {loadingBenchmarks ? (
                    <LoadingSkeleton />
                  ) : benchmarks && benchmarks.length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Quality Benchmarks</CardTitle>
                        <CardDescription>
                          Industry-standard quality metrics and acceptable ranges
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-4 font-semibold">Metric</th>
                                <th className="text-left py-3 px-4 font-semibold">Acceptable Range</th>
                                <th className="text-left py-3 px-4 font-semibold">Measurement Method</th>
                              </tr>
                            </thead>
                            <tbody>
                              {benchmarks.map((benchmark, idx) => (
                                <tr key={idx} className="border-b last:border-0 hover:bg-muted/50">
                                  <td className="py-3 px-4 font-medium">{benchmark.metric}</td>
                                  <td className="py-3 px-4">
                                    <Badge variant="outline" className="font-mono">
                                      {benchmark.acceptableRange}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-muted-foreground text-sm">
                                    {benchmark.measurementMethod}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <EmptyState message="No quality benchmarks found for this trade" />
                  )}
                </TabsContent>

                {/* Common Defects Tab */}
                <TabsContent value="defects" className="space-y-4">
                  {loadingDefects ? (
                    <LoadingSkeleton />
                  ) : defects && defects.length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          Common Defects to Watch For
                        </CardTitle>
                        <CardDescription>
                          These are the most frequently identified defects in {selectedTradeInfo.name.toLowerCase()} work
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {defects.map((defect, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                            >
                              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                              <span className="text-sm">{defect}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <EmptyState message="No common defects documented for this trade" />
                  )}
                </TabsContent>

                {/* Warranty Tab */}
                <TabsContent value="warranty" className="space-y-4">
                  {loadingWarranties ? (
                    <LoadingSkeleton />
                  ) : warranties && warranties.length > 0 ? (
                    <div className="grid gap-4">
                      {warranties.map((warranty, idx) => (
                        <Card key={idx}>
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">Warranty #{idx + 1}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  Minimum Period: {warranty.minimumPeriod}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Coverage */}
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Coverage Includes</h4>
                              <ul className="grid gap-1">
                                {warranty.coverage.map((item, i) => (
                                  <li key={i} className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Exclusions */}
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Exclusions</h4>
                              <ul className="grid gap-1">
                                {warranty.exclusions.map((item, i) => (
                                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="h-4 w-4 flex items-center justify-center">✗</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Statutory Requirements */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <Info className="h-4 w-4 text-blue-500" />
                                Statutory Requirements
                              </h4>
                              <p className="text-sm">{warranty.statutoryRequirements}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No warranty information found for this trade" />
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Links */}
        {!selectedTrade && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="hover:border-primary transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Link href="/credentials">
                      <span className="font-medium hover:underline cursor-pointer">Credential Verification</span>
                    </Link>
                    <p className="text-sm text-muted-foreground">Verify ABN & licenses</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:border-primary transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Link href="/market-rates">
                      <span className="font-medium hover:underline cursor-pointer">Market Rates</span>
                    </Link>
                    <p className="text-sm text-muted-foreground">Compare pricing by city</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:border-primary transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Link href="/templates">
                      <span className="font-medium hover:underline cursor-pointer">Quote Templates</span>
                    </Link>
                    <p className="text-sm text-muted-foreground">Reference templates</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-5 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
