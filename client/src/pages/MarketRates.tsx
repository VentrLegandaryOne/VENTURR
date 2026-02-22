import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Building2,
  Zap,
  Droplets,
  Home,
  Hammer,
  Trees,
  Search,
  Info
} from "lucide-react";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

type City = 'sydney' | 'melbourne' | 'brisbane' | 'adelaide' | 'perth';
type Trade = 'electrician' | 'plumber' | 'roofer' | 'builder' | 'landscaper';

const cityLabels: Record<City, string> = {
  sydney: 'Sydney',
  melbourne: 'Melbourne',
  brisbane: 'Brisbane',
  adelaide: 'Adelaide',
  perth: 'Perth',
};

const tradeLabels: Record<Trade, string> = {
  electrician: 'Electrician',
  plumber: 'Plumber',
  roofer: 'Roofer',
  builder: 'Builder',
  landscaper: 'Landscaper',
};

const tradeIcons: Record<Trade, React.ComponentType<{ className?: string }>> = {
  electrician: Zap,
  plumber: Droplets,
  roofer: Home,
  builder: Hammer,
  landscaper: Trees,
};

export default function MarketRates() {
  const [selectedCity, setSelectedCity] = useState<City>('sydney');
  const [selectedTrade, setSelectedTrade] = useState<Trade>('electrician');
  const [postcode, setPostcode] = useState('');
  const [compareItemCode, setCompareItemCode] = useState('');
  const [comparePrice, setComparePrice] = useState('');

  const { data: rates, isLoading: ratesLoading, error: errorRates } = trpc.marketRates.getRates.useQuery({
    city: selectedCity,
    trade: selectedTrade,
  });

  const { data: summary, error: errorSummary } = trpc.marketRates.getSummary.useQuery();

  const { data: regionalAdjustment, error: errorRegionalAdjustment } = trpc.marketRates.getRegionalAdjustment.useQuery(
    { postcode },
    { enabled: postcode.length === 4, retry: 2 }
  );

  const { data: priceComparison, refetch: comparePriceRefetch, error: errorPriceComparison } = trpc.marketRates.comparePrice.useQuery(
    {
      itemCode: compareItemCode,
      quotedPrice: parseFloat(comparePrice) || 0,
      city: selectedCity,
      trade: selectedTrade,
      postcode: postcode || undefined,
    },
    { enabled: false, retry: 2 }
  );

  const handleCompare = () => {
    if (compareItemCode && comparePrice) {
      comparePriceRefetch();
    }
  };

  const TradeIcon = tradeIcons[selectedTrade];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Market Rates</h1>
            <p className="text-muted-foreground mt-1">
              Compare quotes against current Australian market rates
            </p>
          </div>
          
          {summary && (
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{summary.totalRates} rates</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{summary.citiesCovered} cities</span>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">City</label>
                <Select value={selectedCity} onValueChange={(v) => setSelectedCity(v as City)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(cityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Trade</label>
                <Select value={selectedTrade} onValueChange={(v) => setSelectedTrade(v as Trade)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tradeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Postcode (for regional adjustment)</label>
                <Input 
                  placeholder="e.g., 2000" 
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>

            {regionalAdjustment && (
              <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">{regionalAdjustment.region_name}</span>
                  <Badge variant="outline" className="ml-2">{regionalAdjustment.region_type}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Labour adjustment:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {regionalAdjustment.labour_multiplier > 1 ? '+' : ''}
                      {((regionalAdjustment.labour_multiplier - 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Material adjustment:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {regionalAdjustment.material_multiplier > 1 ? '+' : ''}
                      {((regionalAdjustment.material_multiplier - 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="rates" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rates">Market Rates</TabsTrigger>
            <TabsTrigger value="compare">Price Comparison</TabsTrigger>
          </TabsList>

          {/* Market Rates Tab */}
          <TabsContent value="rates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TradeIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{tradeLabels[selectedTrade]} Rates - {cityLabels[selectedCity]}</CardTitle>
                    <CardDescription>Current market rates for common services</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {ratesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : rates && rates.length > 0 ? (
                  <div className="space-y-4">
                    {rates.map((rate: any) => (
                      <div 
                        key={rate.id} 
                        className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="font-mono text-xs">
                                {rate.item_code}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-foreground">{rate.item_description}</h4>
                            <p className="text-sm text-muted-foreground">per {rate.unit}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Min</p>
                              <p className="font-semibold text-foreground">\${rate.min_rate.toLocaleString()}</p>
                            </div>
                            <div className="bg-primary/10 rounded-lg p-2">
                              <p className="text-xs text-primary mb-1">Average</p>
                              <p className="font-bold text-primary">\${rate.avg_rate.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Max</p>
                              <p className="font-semibold text-foreground">\${rate.max_rate.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No rates available for this selection</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Price Comparison Tab */}
          <TabsContent value="compare" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compare Your Quote</CardTitle>
                <CardDescription>
                  Enter an item code and quoted price to compare against market rates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Item Code</label>
                    <Select value={compareItemCode} onValueChange={setCompareItemCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {rates?.map((rate: any) => (
                          <SelectItem key={rate.item_code} value={rate.item_code}>
                            {rate.item_code} - {rate.item_description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Quoted Price (\$)</label>
                    <Input 
                      type="number"
                      placeholder="e.g., 3500" 
                      value={comparePrice}
                      onChange={(e) => setComparePrice(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleCompare} className="w-full" disabled={!compareItemCode || !comparePrice}>
                      <Search className="w-4 h-4 mr-2" />
                      Compare
                    </Button>
                  </div>
                </div>

                {priceComparison && (
                  <div className="mt-6 p-6 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-foreground">{priceComparison.itemDescription}</h4>
                      <Badge 
                        variant={
                          priceComparison.status === 'within_market' ? 'default' :
                          priceComparison.status === 'below_market' ? 'secondary' :
                          'destructive'
                        }
                      >
                        {priceComparison.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Your Quote</p>
                        <p className="text-xl font-bold text-foreground">\${priceComparison.quotedPrice.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-primary/10">
                        <p className="text-xs text-primary mb-1">Market Avg</p>
                        <p className="text-xl font-bold text-primary">\${priceComparison.adjustedAvg.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Market Range</p>
                        <p className="text-sm font-medium text-foreground">
                          \${priceComparison.marketMin.toLocaleString()} - \${priceComparison.marketMax.toLocaleString()}
                        </p>
                      </div>
                      <div className={`text-center p-3 rounded-lg ${
                        priceComparison.variancePercent > 0 ? 'bg-destructive/10' : 'bg-success/10'
                      }`}>
                        <p className="text-xs text-muted-foreground mb-1">Variance</p>
                        <div className="flex items-center justify-center gap-1">
                          {priceComparison.variancePercent > 0 ? (
                            <TrendingUp className="w-4 h-4 text-destructive" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-success" />
                          )}
                          <p className={`text-xl font-bold ${
                            priceComparison.variancePercent > 0 ? 'text-destructive' : 'text-success'
                          }`}>
                            {priceComparison.variancePercent > 0 ? '+' : ''}{priceComparison.variancePercent}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg ${
                      priceComparison.status === 'within_market' ? 'bg-success/10 border border-success/20' :
                      priceComparison.status === 'below_market' ? 'bg-warning/10 border border-warning/20' :
                      'bg-destructive/10 border border-destructive/20'
                    }`}>
                      <p className="text-sm text-foreground">{priceComparison.recommendation}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
