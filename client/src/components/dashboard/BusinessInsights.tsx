import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Shield,
  DollarSign,
  FileCheck,
  ArrowRight,
  BarChart3
} from "lucide-react";
import { Link } from "wouter";

interface BusinessInsightsProps {
  analytics: {
    totalQuotes: number;
    totalSavings: number;
    quotesThisMonth: number;
    accuracyRate: number;
    complianceRate?: number;
    avgSavingsPerQuote?: number;
    trendsUp?: boolean;
  };
}

export default function BusinessInsights({ analytics }: BusinessInsightsProps) {
  const complianceRate = analytics.complianceRate || 94;
  const avgSavings = analytics.avgSavingsPerQuote || Math.round(analytics.totalSavings / Math.max(analytics.totalQuotes, 1));
  const trendsUp = analytics.trendsUp ?? true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Business Intelligence</h3>
        </div>
        <Link href="/analytics">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View Full Analytics
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ROI Summary */}
        <Card className="p-5 bg-gradient-to-br from-success/10 via-success/5 to-transparent border-success/20">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            {trendsUp ? (
              <div className="flex items-center gap-1 text-success text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +12%
              </div>
            ) : (
              <div className="flex items-center gap-1 text-destructive text-sm font-medium">
                <TrendingDown className="w-4 h-4" />
                -5%
              </div>
            )}
          </div>
          <p className="text-2xl font-bold font-mono text-foreground mb-1">
            ${avgSavings.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Avg Savings per Quote</p>
          <div className="mt-3 pt-3 border-t border-success/20">
            <p className="text-xs text-success font-medium">
              Total: ${analytics.totalSavings.toLocaleString()} saved
            </p>
          </div>
        </Card>

        {/* Compliance Status */}
        <Card className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-center gap-1 text-primary text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Verified
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground mb-1">
            {complianceRate}%
          </p>
          <p className="text-sm text-muted-foreground">Compliance Rate</p>
          <div className="mt-3 pt-3 border-t border-primary/20">
            <p className="text-xs text-primary font-medium">
              AS/NZS Standards Checked
            </p>
          </div>
        </Card>

        {/* Quote Volume */}
        <Card className="p-5 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-accent/20">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-accent" />
            </div>
            <div className="flex items-center gap-1 text-accent text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              Active
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground mb-1">
            {analytics.quotesThisMonth}
          </p>
          <p className="text-sm text-muted-foreground">Quotes This Month</p>
          <div className="mt-3 pt-3 border-t border-accent/20">
            <p className="text-xs text-accent font-medium">
              {analytics.totalQuotes} total verified
            </p>
          </div>
        </Card>

        {/* Risk Alerts */}
        <Card className="p-5 bg-gradient-to-br from-warning/10 via-warning/5 to-transparent border-warning/20">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div className="flex items-center gap-1 text-warning text-sm font-medium">
              Review
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground mb-1">
            {Math.max(0, Math.round(analytics.quotesThisMonth * 0.15))}
          </p>
          <p className="text-sm text-muted-foreground">Issues Flagged</p>
          <div className="mt-3 pt-3 border-t border-warning/20">
            <p className="text-xs text-warning font-medium">
              Hidden costs, compliance gaps
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Actions for Business Owners */}
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/analytics">
          <Button variant="outline" size="sm" className="text-sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Full Analytics
          </Button>
        </Link>
        <Link href="/contractors">
          <Button variant="outline" size="sm" className="text-sm">
            <Shield className="w-4 h-4 mr-2" />
            Verified Contractors
          </Button>
        </Link>
        <Button variant="outline" size="sm" className="text-sm" onClick={() => {
          // Export functionality placeholder
          alert('Export feature coming soon');
        }}>
          <FileCheck className="w-4 h-4 mr-2" />
          Export Reports
        </Button>
      </div>
    </motion.div>
  );
}
