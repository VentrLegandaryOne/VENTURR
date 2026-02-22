/**
 * StandardsTooltip Component
 * 
 * Displays interactive tooltips for Australian Standards references (AS/NZS, NCC, HB)
 * with relevant best practices from the knowledge base.
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  ExternalLink, 
  Info, 
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2
} from "lucide-react";
import { Link } from "wouter";

// Map standard codes to trade types
const STANDARD_TO_TRADE_MAP: Record<string, string> = {
  // Electrical
  "AS/NZS 3000": "electrical",
  "AS/NZS 3008": "electrical",
  "AS/NZS 3017": "electrical",
  "AS/NZS 3018": "electrical",
  "AS/NZS 3019": "electrical",
  "AS/NZS 3820": "electrical",
  "AS/NZS 4836": "electrical",
  "AS/NZS 5033": "electrical",
  "AS/NZS 5139": "electrical",
  "AS 3012": "electrical",
  
  // Plumbing
  "AS/NZS 3500": "plumbing",
  "AS/NZS 2845": "plumbing",
  "AS/NZS 4020": "plumbing",
  "AS 3660": "plumbing",
  "AS 4032": "plumbing",
  
  // Roofing
  "AS 4046": "roofing",
  "AS 1562": "roofing",
  "HB 39": "roofing",
  "SA HB 39": "roofing",
  
  // Building/Structural
  "NCC": "building",
  "NCC-2022": "building",
  "AS 3600": "building",
  "AS 4100": "building",
  "AS 1684": "building",
  "AS 2870": "building",
  "AS 3700": "building",
  "AS 4055": "building",
  
  // HVAC
  "AS/NZS 3823": "hvac",
  "AS 1668": "hvac",
  "AS/NZS 1668": "hvac",
  
  // Painting
  "AS/NZS 2311": "painting",
  "AS 4361": "painting",
  
  // Tiling
  "AS 3958": "tiling",
  "AS 4654": "tiling",
  
  // Concreting
  "AS 3610": "concreting",
  "AS 1379": "concreting",
  
  // Landscaping
  "AS 4419": "landscaping",
  "AS 4678": "landscaping",
  
  // Glazing
  "AS 1288": "glazing",
  "AS 2047": "glazing",
};

// Standard descriptions
const STANDARD_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  "AS/NZS 3000": {
    title: "Wiring Rules",
    description: "Electrical installations - Safety requirements for electrical installations"
  },
  "AS/NZS 3008": {
    title: "Cable Selection",
    description: "Electrical installations - Selection of cables"
  },
  "AS/NZS 3500": {
    title: "Plumbing and Drainage",
    description: "National plumbing and drainage code covering water services, sanitary plumbing, and stormwater drainage"
  },
  "AS 4046": {
    title: "Roof Tiles",
    description: "Terracotta and concrete roof tiles - Design and installation requirements"
  },
  "HB 39": {
    title: "Installation of Roof Tiles",
    description: "Handbook for the installation of roof tiles and shingles"
  },
  "SA HB 39": {
    title: "Installation of Roof Tiles",
    description: "Standards Australia Handbook for roof tile installation"
  },
  "NCC": {
    title: "National Construction Code",
    description: "Australia's primary building code covering structural, fire safety, health, amenity, and sustainability requirements"
  },
  "NCC-2022": {
    title: "National Construction Code 2022",
    description: "Current edition of Australia's building code with updated energy efficiency and accessibility requirements"
  },
  "AS 1684": {
    title: "Residential Timber-framed Construction",
    description: "Design criteria and construction requirements for timber-framed buildings"
  },
  "AS 3600": {
    title: "Concrete Structures",
    description: "Design and construction requirements for concrete structures"
  },
  "AS/NZS 3823": {
    title: "Air Conditioning Equipment",
    description: "Performance requirements for air conditioning and heat pump equipment"
  },
  "AS/NZS 2311": {
    title: "Guide to Painting Buildings",
    description: "Comprehensive guide for painting and coating of buildings"
  },
  "AS 3958": {
    title: "Ceramic Tiles",
    description: "Guide to the installation of ceramic tiles"
  },
  "AS 4419": {
    title: "Soils for Landscaping",
    description: "Requirements for soils used in landscaping and garden applications"
  },
  "AS 4678": {
    title: "Earth Retaining Structures",
    description: "Design and construction of earth-retaining structures"
  },
  "AS 1288": {
    title: "Glass in Buildings",
    description: "Selection and installation requirements for glass in buildings"
  },
};

interface StandardsTooltipProps {
  standard: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  variant?: "inline" | "badge";
}

export function StandardsTooltip({ 
  standard, 
  children,
  showIcon = true,
  variant = "inline"
}: StandardsTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Extract the base standard code (e.g., "AS/NZS 3000" from "AS/NZS 3000:2018")
  const baseStandard = useMemo(() => {
    // Match patterns like AS/NZS 3000, AS 1684, NCC-2022, HB 39, SA HB 39
    const match = standard.match(/^(SA\s+)?(AS\/NZS|AS|NCC|HB)\s*[-]?\s*(\d+)/i);
    if (match) {
      const prefix = match[1] || "";
      const type = match[2].toUpperCase();
      const number = match[3];
      return `${prefix}${type} ${number}`.trim();
    }
    // Handle NCC without number
    if (standard.toUpperCase().startsWith("NCC")) {
      return "NCC";
    }
    return standard;
  }, [standard]);

  // Get trade type for this standard
  const tradeType = useMemo(() => {
    // Try exact match first
    if (STANDARD_TO_TRADE_MAP[baseStandard]) {
      return STANDARD_TO_TRADE_MAP[baseStandard];
    }
    // Try partial matches
    for (const [key, trade] of Object.entries(STANDARD_TO_TRADE_MAP)) {
      if (baseStandard.includes(key) || key.includes(baseStandard)) {
        return trade;
      }
    }
    return null;
  }, [baseStandard]);

  // Get standard info
  const standardInfo = useMemo(() => {
    return STANDARD_DESCRIPTIONS[baseStandard] || null;
  }, [baseStandard]);

  // Fetch best practices for the related trade
  const { data: bestPractices, isLoading } = trpc.tradeKnowledge.getBestPractices.useQuery(
    { trade: tradeType as any },
    { enabled: isOpen && !!tradeType }
  );

  // Filter practices that reference this standard
  const relevantPractices = useMemo(() => {
    if (!bestPractices) return [];
    return bestPractices.filter(practice => 
      practice.standardReferences.some(ref => 
        ref.includes(baseStandard) || baseStandard.includes(ref.split(" ")[0])
      )
    ).slice(0, 3);
  }, [bestPractices, baseStandard]);

  const content = children || standard;

  // For mobile, use Popover; for desktop, use Tooltip
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span 
          className={`
            inline-flex items-center gap-1 cursor-pointer
            ${variant === "badge" 
              ? "bg-primary/10 text-primary px-2 py-0.5 rounded-md text-sm font-medium hover:bg-primary/20 transition-colors" 
              : "text-primary underline decoration-dotted underline-offset-2 hover:text-primary/80 transition-colors"
            }
          `}
        >
          {content}
          {showIcon && <Info className="h-3 w-3 opacity-60" />}
        </span>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="start"
        side="top"
      >
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-lg shrink-0">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-sm">{baseStandard}</h4>
              {standardInfo && (
                <p className="text-xs text-muted-foreground">{standardInfo.title}</p>
              )}
            </div>
          </div>

          {/* Description */}
          {standardInfo && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {standardInfo.description}
            </p>
          )}

          {/* Trade Badge */}
          {tradeType && (
            <Badge variant="secondary" className="text-xs capitalize">
              {tradeType} Trade
            </Badge>
          )}

          <Separator />

          {/* Best Practices */}
          <div>
            <h5 className="text-xs font-semibold mb-2 flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Related Best Practices
            </h5>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : relevantPractices.length > 0 ? (
              <ul className="space-y-2">
                {relevantPractices.map((practice, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      {practice.title}
                    </span>
                  </li>
                ))}
              </ul>
            ) : tradeType ? (
              <p className="text-xs text-muted-foreground italic">
                View knowledge base for detailed practices
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Standard information available
              </p>
            )}
          </div>

          {/* Action */}
          {tradeType && (
            <Link href={`/knowledge-base?trade=${tradeType}`}>
              <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                <ExternalLink className="h-3 w-3" />
                View in Knowledge Base
              </Button>
            </Link>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Utility function to parse text and wrap standard references with tooltips
 */
export function parseStandardsInText(text: string): React.ReactNode[] {
  // Regex to match Australian Standards patterns
  const standardPattern = /(SA\s+HB\s*\d+|AS\/NZS\s*\d+(?:\.\d+)?(?::\d{4})?|AS\s*\d+(?:\.\d+)?(?::\d{4})?|NCC[-\s]?\d{4}|NCC|HB\s*\d+)/gi;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = standardPattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    // Add the tooltip-wrapped standard
    parts.push(
      <StandardsTooltip key={match.index} standard={match[0]} variant="inline">
        {match[0]}
      </StandardsTooltip>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : [text];
}

/**
 * Component to render text with auto-detected standard tooltips
 */
interface StandardsTextProps {
  text: string;
  className?: string;
}

export function StandardsText({ text, className }: StandardsTextProps) {
  const parsedContent = useMemo(() => parseStandardsInText(text), [text]);
  
  return <span className={className}>{parsedContent}</span>;
}

export default StandardsTooltip;
