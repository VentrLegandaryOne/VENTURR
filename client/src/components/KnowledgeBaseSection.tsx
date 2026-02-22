import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Shield, 
  ChevronDown, 
  ChevronUp,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

interface KnowledgeBaseSectionProps {
  trade: string;
  compactMode?: boolean;
  showInReport?: boolean;
}

// Map common project types to valid trade types
const TRADE_TYPE_MAP: Record<string, string> = {
  // Direct matches
  "electrical": "electrical",
  "plumbing": "plumbing",
  "roofing": "roofing",
  "building": "building",
  "carpentry": "carpentry",
  "hvac": "hvac",
  "painting": "painting",
  "tiling": "tiling",
  "landscaping": "landscaping",
  "concreting": "concreting",
  "glazing": "glazing",
  "fencing": "fencing",
  // Common variations
  "electrician": "electrical",
  "plumber": "plumbing",
  "roofer": "roofing",
  "builder": "building",
  "carpenter": "carpentry",
  "airconditioning": "hvac",
  "airconditioner": "hvac",
  "painter": "painting",
  "tiler": "tiling",
  "landscaper": "landscaping",
  "concretor": "concreting",
  "glazier": "glazing",
  // Fallbacks for general terms
  "generalconstruction": "building",
  "general": "building",
  "construction": "building",
  "renovation": "building",
  "homeimprovement": "building",
  "residential": "building",
  "commercial": "building",
};

function normalizeTradeType(trade: string): string {
  const normalized = trade.toLowerCase().replace(/[\s_-]+/g, "");
  
  // Direct match
  if (TRADE_TYPE_MAP[normalized]) {
    return TRADE_TYPE_MAP[normalized];
  }
  
  // Partial match - check if any key is contained in the trade string
  for (const [key, value] of Object.entries(TRADE_TYPE_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  // Default to building for unknown trades
  return "building";
}

export function KnowledgeBaseSection({ 
  trade, 
  compactMode = false,
  showInReport = false 
}: KnowledgeBaseSectionProps) {
  const [isExpanded, setIsExpanded] = useState(!compactMode);
  const [activeTab, setActiveTab] = useState("practices");

  // Normalize trade name for API with smart mapping
  const normalizedTrade = normalizeTradeType(trade) as any;

  // Fetch knowledge base data
  const { data: bestPractices, isLoading: loadingPractices } = trpc.tradeKnowledge.getBestPractices.useQuery(
    { trade: normalizedTrade },
    { enabled: !!trade }
  );

  const { data: defects, isLoading: loadingDefects } = trpc.tradeKnowledge.getCommonDefects.useQuery(
    { trade: normalizedTrade },
    { enabled: !!trade }
  );

  const { data: warranties, isLoading: loadingWarranties } = trpc.tradeKnowledge.getWarrantyInfo.useQuery(
    { trade: normalizedTrade },
    { enabled: !!trade }
  );

  const isLoading = loadingPractices || loadingDefects || loadingWarranties;

  // Get top items for compact view
  const topPractices = bestPractices?.slice(0, 3) || [];
  const topDefects = defects?.slice(0, 5) || [];
  const topWarranty = warranties?.[0];

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't render if no data
  if (!bestPractices?.length && !defects?.length && !warranties?.length) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Industry Knowledge Base</CardTitle>
              <CardDescription>
                Best practices and standards for {trade} work
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/knowledge-base">
              <Button variant="outline" size="sm" className="gap-1">
                <ExternalLink className="h-3 w-3" />
                Explore
              </Button>
            </Link>
            {compactMode && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
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
            <CardContent className="p-6">
              {showInReport ? (
                <div className="space-y-6">
                  {topPractices.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Key Best Practices
                      </h4>
                      <div className="space-y-3">
                        {topPractices.map((practice, idx) => (
                          <div key={idx} className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <div className="font-medium text-sm mb-1">{practice.title}</div>
                            <div className="text-xs text-muted-foreground mb-2">{practice.description}</div>
                            <div className="flex flex-wrap gap-1">
                              {practice.standardReferences.slice(0, 3).map((ref, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {ref}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {topDefects.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Common Defects to Watch
                      </h4>
                      <ul className="space-y-2">
                        {topDefects.map((defect, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                            <span>{defect}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topWarranty && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        Warranty Requirements
                      </h4>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <div className="text-sm mb-2">
                          <span className="font-medium">Minimum Period:</span> {topWarranty.minimumPeriod}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {topWarranty.statutoryRequirements}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="practices" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Practices
                    </TabsTrigger>
                    <TabsTrigger value="defects" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Defects
                    </TabsTrigger>
                    <TabsTrigger value="warranty" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Warranty
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="practices" className="mt-4 space-y-3">
                    {topPractices.map((practice, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="font-medium text-sm">{practice.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{practice.description}</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {practice.standardReferences.slice(0, 3).map((ref, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {ref}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                    {bestPractices && bestPractices.length > 3 && (
                      <Link href="/knowledge-base">
                        <Button variant="link" size="sm" className="w-full">
                          View all {bestPractices.length} best practices
                        </Button>
                      </Link>
                    )}
                  </TabsContent>

                  <TabsContent value="defects" className="mt-4">
                    <ul className="space-y-2">
                      {topDefects.map((defect, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                          <span>{defect}</span>
                        </li>
                      ))}
                    </ul>
                    {defects && defects.length > 5 && (
                      <Link href="/knowledge-base">
                        <Button variant="link" size="sm" className="w-full mt-2">
                          View all {defects.length} common defects
                        </Button>
                      </Link>
                    )}
                  </TabsContent>

                  <TabsContent value="warranty" className="mt-4">
                    {topWarranty ? (
                      <div className="space-y-3">
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <div className="text-sm font-medium mb-1">Minimum Period</div>
                          <div className="text-lg font-bold text-primary">{topWarranty.minimumPeriod}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-2">Coverage Includes:</div>
                          <ul className="space-y-1">
                            {topWarranty.coverage.slice(0, 4).map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                          {topWarranty.statutoryRequirements}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        No warranty information available
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default KnowledgeBaseSection;
