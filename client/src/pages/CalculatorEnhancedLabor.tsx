import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calculator as CalcIcon, Loader2, Save, Users, DollarSign, Clock, Info, Zap, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { MOCK_MATERIALS, getMaterialsByCategory, type Material } from "../../../shared/mockMaterials";
import {
  SKILL_LEVELS,
  REGIONAL_ADJUSTMENTS,
  CREW_COMPOSITIONS,
  calculateTotalLaborCost,
  recommendCrew,
  type CrewComposition
} from "../../../shared/laborPricing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CalculationResult {
  roofArea: number;
  totalArea: number;
  sheetsRequired: number;
  fasteners: number;
  ridgeLength: number;
  gutterLength: number;
  materialCost: number;
  laborCost: number;
  laborDetails: {
    crew: CrewComposition;
    region: string;
    totalHours: number;
    daysRequired: number;
    hourlyRate: number;
    costPerSqm: number;
    breakdown: any;
    installationHours?: number;
    removalHours?: number;
    weatherDelayDays?: number;
    totalDaysWithWeather?: number;
  };
  totalCost: number;
  gst: number;
  grandTotal: number;
}

export default function CalculatorEnhancedLabor() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/projects/:id/calculator-enhanced");
  const projectId = params?.id;

  const { data: project } = trpc.projects.get.useQuery(
    { id: projectId! },
    { enabled: !!projectId }
  );

  const createTakeoffMutation = trpc.takeoffs.create.useMutation({
    onSuccess: () => {
      toast.success("Calculation saved successfully");
      if (projectId) {
        setLocation(`/projects/${projectId}`);
      }
    },
  });

  const [formData, setFormData] = useState({
    // Roof dimensions
    roofLength: "",
    roofWidth: "",
    roofType: "gable",
    roofPitch: "22.5",
    wastePercentage: "10",
    
    // Material selection
    selectedMaterial: "lys-trimdek-zam",
    materialType: "colorbond-metal",
    
    // Labor configuration
    roofComplexity: "standard" as "simple" | "standard" | "complex" | "very-complex",
    pitchCategory: "moderate" as "low" | "moderate" | "steep" | "verySteep",
    valleyCount: "0",
    selectedCrew: "standard-crew",
    selectedRegion: "Sydney Metro",
    includeOptionalOnCosts: "true",
    
    // Advanced factors
    removalType: "none",
    season: "summer",
    
    // Pricing
    profitMargin: "25",
    includeGst: "true",
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  const calculateTakeoff = () => {
    const roofLength = parseFloat(formData.roofLength) || 0;
    const roofWidth = parseFloat(formData.roofWidth) || 0;
    const wastePercentage = parseFloat(formData.wastePercentage) || 10;
    const profitMargin = parseFloat(formData.profitMargin) || 25;

    if (roofLength <= 0 || roofWidth <= 0) {
      toast.error("Please enter valid roof dimensions");
      return;
    }

    const roofArea = roofLength * roofWidth;
    const totalArea = roofArea * (1 + wastePercentage / 100);
    const sheetsRequired = Math.ceil(totalArea / 10);
    const fasteners = sheetsRequired * 20;
    const ridgeLength = roofLength;
    const gutterLength = roofLength * 2;

    const selectedMaterialObj = MOCK_MATERIALS.find(m => m.id === formData.selectedMaterial);
    const materialCost = selectedMaterialObj ? (selectedMaterialObj.pricePerUnit * sheetsRequired) : 0;

    const crew = CREW_COMPOSITIONS[formData.selectedCrew as keyof typeof CREW_COMPOSITIONS] || CREW_COMPOSITIONS["standard-crew"];
    const region = formData.selectedRegion;
    const laborCost = calculateTotalLaborCost(
      roofArea,
      crew,
      region,
      formData.roofComplexity as any,
      formData.pitchCategory as any,
      parseInt(formData.valleyCount) || 0,
      formData.removalType as any,
      formData.season as any,
      formData.includeOptionalOnCosts === "true"
    );

    const totalCost = materialCost + laborCost;
    const profitAmount = totalCost * (profitMargin / 100);
    const subtotal = totalCost + profitAmount;
    const gst = formData.includeGst === "true" ? subtotal * 0.1 : 0;
    const grandTotal = subtotal + gst;

    setResult({
      roofArea,
      totalArea,
      sheetsRequired,
      fasteners,
      ridgeLength,
      gutterLength,
      materialCost,
      laborCost,
      laborDetails: {
        crew,
        region,
        totalHours: 40,
        daysRequired: 5,
        hourlyRate: 65,
        costPerSqm: laborCost / roofArea,
        breakdown: {},
      },
      totalCost,
      gst,
      grandTotal,
    });
  };

  const handleSave = async () => {
    if (!result || !projectId) return;
    
    setIsSaving(true);
    try {
      await createTakeoffMutation.mutateAsync({
        projectId,
        materialCost: result.materialCost,
        laborCost: result.laborCost,
        totalCost: result.grandTotal,
        calculationData: JSON.stringify(result),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading calculator...</p>
        </div>
      </div>
    );
  }

  const materials = getMaterialsByCategory(formData.materialType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLocation(`/projects/${projectId}`)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                  Roofing Takeoff Calculator
                </h1>
                <p className="text-sm text-slate-500">Calculate materials and labor costs</p>
              </div>
            </div>
            {result && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/30"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Calculation
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Roof Dimensions */}
            <Card className="shadow-lg border-blue-200/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalcIcon className="w-5 h-5 text-blue-600" />
                  Roof Dimensions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Roof Length (m)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={formData.roofLength}
                      onChange={(e) => setFormData({ ...formData, roofLength: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Roof Width (m)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 8"
                      value={formData.roofWidth}
                      onChange={(e) => setFormData({ ...formData, roofWidth: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Roof Type</Label>
                    <Select value={formData.roofType} onValueChange={(value) => setFormData({ ...formData, roofType: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gable">Gable</SelectItem>
                        <SelectItem value="hip">Hip</SelectItem>
                        <SelectItem value="flat">Flat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Roof Pitch (°)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 22.5"
                      value={formData.roofPitch}
                      onChange={(e) => setFormData({ ...formData, roofPitch: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Waste Percentage (%)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    value={formData.wastePercentage}
                    onChange={(e) => setFormData({ ...formData, wastePercentage: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Material Selection */}
            <Card className="shadow-lg border-orange-200/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  Material Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Material Type</Label>
                  <Select value={formData.materialType} onValueChange={(value) => setFormData({ ...formData, materialType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="colorbond-metal">Colorbond Metal</SelectItem>
                      <SelectItem value="terracotta">Terracotta Tiles</SelectItem>
                      <SelectItem value="concrete">Concrete Tiles</SelectItem>
                      <SelectItem value="slate">Slate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Select Material</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {materials.slice(0, 6).map((material) => (
                      <button
                        key={material.id}
                        onClick={() => setFormData({ ...formData, selectedMaterial: material.id })}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          formData.selectedMaterial === material.id
                            ? "border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/30"
                            : "border-slate-200 hover:border-orange-300 hover:bg-orange-50/50"
                        }`}
                      >
                        <p className="font-semibold text-slate-900 text-sm">{material.name}</p>
                        <p className="text-xs text-slate-500 mt-1">${material.pricePerUnit}/unit</p>
                        {formData.selectedMaterial === material.id && (
                          <CheckCircle className="w-4 h-4 text-orange-600 mt-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Labor Configuration */}
            <Card className="shadow-lg border-green-200/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Labor Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Roof Complexity</Label>
                    <Select value={formData.roofComplexity} onValueChange={(value) => setFormData({ ...formData, roofComplexity: value as any })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="complex">Complex</SelectItem>
                        <SelectItem value="very-complex">Very Complex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Crew Type</Label>
                    <Select value={formData.selectedCrew} onValueChange={(value) => setFormData({ ...formData, selectedCrew: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard-crew">Standard Crew</SelectItem>
                        <SelectItem value="small-crew">Small Crew</SelectItem>
                        <SelectItem value="large-crew">Large Crew</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Region</Label>
                  <Select value={formData.selectedRegion} onValueChange={(value) => setFormData({ ...formData, selectedRegion: value })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sydney Metro">Sydney Metro</SelectItem>
                      <SelectItem value="Regional NSW">Regional NSW</SelectItem>
                      <SelectItem value="Melbourne Metro">Melbourne Metro</SelectItem>
                      <SelectItem value="Brisbane Metro">Brisbane Metro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="shadow-lg border-purple-200/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Pricing & Margins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Profit Margin (%)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 25"
                      value={formData.profitMargin}
                      onChange={(e) => setFormData({ ...formData, profitMargin: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Include GST</Label>
                    <Select value={formData.includeGst} onValueChange={(value) => setFormData({ ...formData, includeGst: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes (10%)</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calculate Button */}
            <Button
              onClick={calculateTakeoff}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 text-lg py-6 rounded-xl"
            >
              <CalcIcon className="w-5 h-5 mr-2" />
              Calculate Takeoff
            </Button>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            {result ? (
              <div className="space-y-4 sticky top-24">
                {/* Total Cost Summary */}
                <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-blue-100 text-sm">Grand Total</p>
                        <p className="text-4xl font-bold">${result.grandTotal.toLocaleString('en-AU', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <Separator className="bg-blue-400/30" />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-100">Material Cost:</span>
                          <span className="font-semibold">${result.materialCost.toLocaleString('en-AU', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-100">Labor Cost:</span>
                          <span className="font-semibold">${result.laborCost.toLocaleString('en-AU', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-100">GST (10%):</span>
                          <span className="font-semibold">${result.gst.toLocaleString('en-AU', { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Details */}
                <Card className="shadow-lg border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Calculation Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-xs text-blue-600 font-medium">Roof Area</p>
                        <p className="text-xl font-bold text-blue-900">{result.roofArea.toFixed(2)} m²</p>
                      </div>
                      <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                        <p className="text-xs text-orange-600 font-medium">Sheets Required</p>
                        <p className="text-xl font-bold text-orange-900">{result.sheetsRequired}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-xs text-green-600 font-medium">Cost per m²</p>
                        <p className="text-xl font-bold text-green-900">${(result.grandTotal / result.roofArea).toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Steps */}
                <Button
                  onClick={() => setLocation(`/projects/${projectId}/quote`)}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Generate Quote
                </Button>
              </div>
            ) : (
              <Card className="shadow-lg border-slate-200 h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Enter roof dimensions and click "Calculate Takeoff" to see results</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

