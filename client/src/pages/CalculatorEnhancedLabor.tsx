import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calculator as CalcIcon, Loader2, Save, Users, DollarSign, Clock, Info } from "lucide-react";
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
  const [recommendedCrew, setRecommendedCrew] = useState<CrewComposition | null>(null);

  const roofingMaterials = getMaterialsByCategory("roofing");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  // Auto-recommend crew when roof area changes
  useEffect(() => {
    const length = parseFloat(formData.roofLength) || 0;
    const width = parseFloat(formData.roofWidth) || 0;
    if (length > 0 && width > 0) {
      const area = length * width;
      const crew = recommendCrew(area, formData.roofComplexity);
      setRecommendedCrew(crew);
    }
  }, [formData.roofLength, formData.roofWidth, formData.roofComplexity]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTakeoff = () => {
    const length = parseFloat(formData.roofLength) || 0;
    const width = parseFloat(formData.roofWidth) || 0;
    const pitch = parseFloat(formData.roofPitch) || 0;
    const waste = parseFloat(formData.wastePercentage) || 0;
    const profitMargin = parseFloat(formData.profitMargin) || 0;
    const valleyCount = parseInt(formData.valleyCount) || 0;

    if (length === 0 || width === 0) {
      toast.error("Please enter roof dimensions");
      return;
    }

    // Calculate roof area with pitch adjustment
    const pitchFactor = 1 / Math.cos((pitch * Math.PI) / 180);
    const roofArea = length * width;
    const adjustedArea = roofArea * pitchFactor;
    const totalArea = adjustedArea * (1 + waste / 100);

    // Get selected material
    const material = MOCK_MATERIALS.find(m => m.id === formData.selectedMaterial);
    if (!material) {
      toast.error("Please select a material");
      return;
    }

    // Calculate sheets (assuming 2.4m average sheet length)
    const sheetsRequired = Math.ceil(totalArea / 1.8); // 0.762m cover width * 2.4m length

    // Calculate fasteners (8 per m²)
    const fasteners = Math.ceil(totalArea * 8);

    // Calculate ridge and gutter (perimeter approximation)
    const ridgeLength = length;
    const gutterLength = (length + width) * 2;

    // Calculate material costs
    const materialCost = totalArea * material.pricePerUnit;
    
    // Ridge flashing
    const ridgeFlashing = MOCK_MATERIALS.find(m => m.id === "flash-ridge-zam");
    const ridgeCost = ridgeFlashing ? ridgeLength * ridgeFlashing.pricePerUnit : 0;

    // Gutter
    const gutter = MOCK_MATERIALS.find(m => m.id === "gutter-quad-zam");
    const gutterCost = gutter ? gutterLength * gutter.pricePerUnit : 0;

    // Fasteners
    const fastener = MOCK_MATERIALS.find(m => m.id === "fast-screw-class3");
    const fastenerCost = fastener ? fasteners * fastener.pricePerUnit : 0;

    const totalMaterialCost = materialCost + ridgeCost + gutterCost + fastenerCost;

    // Enhanced labor calculation using new system with advanced factors
    const laborCalc = calculateTotalLaborCost(
      totalArea,
      formData.roofComplexity,
      formData.pitchCategory,
      valleyCount,
      formData.selectedCrew,
      formData.selectedRegion,
      formData.includeOptionalOnCosts === "true",
      formData.materialType,
      formData.removalType,
      formData.season
    );

    if (!laborCalc) {
      toast.error("Error calculating labor costs");
      return;
    }

    const laborCost = laborCalc.totalLaborCost;

    // Total with profit
    const subtotal = totalMaterialCost + laborCost;
    const totalCost = subtotal * (1 + profitMargin / 100);

    // GST
    const gst = formData.includeGst === "true" ? totalCost * 0.1 : 0;
    const grandTotal = totalCost + gst;

    setResult({
      roofArea,
      totalArea,
      sheetsRequired,
      fasteners,
      ridgeLength,
      gutterLength,
      materialCost: totalMaterialCost,
      laborCost,
      laborDetails: {
        crew: laborCalc.crew,
        region: laborCalc.region.region,
        totalHours: laborCalc.laborHours.adjustedHours,
        daysRequired: laborCalc.laborHours.daysRequired,
        hourlyRate: laborCalc.crewCost.totalWithOnCosts,
        costPerSqm: laborCalc.costPerSqm,
        breakdown: laborCalc.crewCost,
        installationHours: laborCalc.installationHours,
        removalHours: laborCalc.removalHours,
        weatherDelayDays: laborCalc.weatherDelayDays,
        totalDaysWithWeather: laborCalc.totalDaysWithWeather
      },
      totalCost,
      gst,
      grandTotal,
    });
  };

  const handleSave = async () => {
    if (!result || !projectId) return;

    const materials = [
      {
        type: "roofing",
        material: formData.selectedMaterial,
        quantity: result.totalArea,
        cost: result.materialCost,
      },
    ];

    await createTakeoffMutation.mutateAsync({
      projectId,
      roofLength: formData.roofLength,
      roofWidth: formData.roofWidth,
      roofArea: result.roofArea.toFixed(2),
      roofType: formData.roofType,
      roofPitch: formData.roofPitch,
      wastePercentage: formData.wastePercentage,
      labourRate: result.laborDetails.hourlyRate.toFixed(2),
      profitMargin: formData.profitMargin,
      includeGst: formData.includeGst,
      materials: JSON.stringify(materials),
      calculations: JSON.stringify(result),
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation(projectId ? `/projects/${projectId}` : "/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {projectId ? "Back to Project" : "Back to Dashboard"}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Enhanced Labor Calculator</h1>
                <p className="text-sm text-slate-600">Accurate Australian roofing labor costing</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {project && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">{project.title}</h2>
            <p className="text-slate-600">{project.address}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-6">
            <Tabs defaultValue="dimensions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
                <TabsTrigger value="labor">Labor</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
              </TabsList>

              <TabsContent value="dimensions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Roof Dimensions</CardTitle>
                    <CardDescription>Enter the roof measurements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="roofLength">Length (m)</Label>
                        <Input
                          id="roofLength"
                          type="number"
                          step="0.1"
                          placeholder="10.0"
                          value={formData.roofLength}
                          onChange={(e) => handleChange("roofLength", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roofWidth">Width (m)</Label>
                        <Input
                          id="roofWidth"
                          type="number"
                          step="0.1"
                          placeholder="8.0"
                          value={formData.roofWidth}
                          onChange={(e) => handleChange("roofWidth", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="roofType">Roof Type</Label>
                        <Select value={formData.roofType} onValueChange={(v) => handleChange("roofType", v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gable">Gable</SelectItem>
                            <SelectItem value="hip">Hip</SelectItem>
                            <SelectItem value="skillion">Skillion</SelectItem>
                            <SelectItem value="flat">Flat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roofPitch">Roof Pitch (degrees)</Label>
                        <Input
                          id="roofPitch"
                          type="number"
                          step="0.5"
                          placeholder="22.5"
                          value={formData.roofPitch}
                          onChange={(e) => handleChange("roofPitch", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selectedMaterial">Roofing Material</Label>
                      <Select value={formData.selectedMaterial} onValueChange={(v) => handleChange("selectedMaterial", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roofingMaterials.map((mat) => (
                            <SelectItem key={mat.id} value={mat.id}>
                              {mat.name} - ${mat.pricePerUnit.toFixed(2)}/m²
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wastePercentage">Waste Percentage (%)</Label>
                      <Input
                        id="wastePercentage"
                        type="number"
                        step="1"
                        placeholder="10"
                        value={formData.wastePercentage}
                        onChange={(e) => handleChange("wastePercentage", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="labor" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Labor Configuration
                    </CardTitle>
                    <CardDescription>Configure crew and complexity factors</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="roofComplexity">Roof Complexity</Label>
                      <Select value={formData.roofComplexity} onValueChange={(v) => handleChange("roofComplexity", v as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">Simple (rectangular, low pitch)</SelectItem>
                          <SelectItem value="standard">Standard (moderate complexity)</SelectItem>
                          <SelectItem value="complex">Complex (multi-level, steep)</SelectItem>
                          <SelectItem value="very-complex">Very Complex (custom, difficult)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pitchCategory">Pitch Category</Label>
                      <Select value={formData.pitchCategory} onValueChange={(v) => handleChange("pitchCategory", v as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (0-15°)</SelectItem>
                          <SelectItem value="moderate">Moderate (15-30°)</SelectItem>
                          <SelectItem value="steep">Steep (30-45°)</SelectItem>
                          <SelectItem value="verySteep">Very Steep (45°+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valleyCount">Number of Valleys/Hips</Label>
                      <Input
                        id="valleyCount"
                        type="number"
                        step="1"
                        placeholder="0"
                        value={formData.valleyCount}
                        onChange={(e) => handleChange("valleyCount", e.target.value)}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="selectedCrew">Crew Composition</Label>
                      <Select value={formData.selectedCrew} onValueChange={(v) => handleChange("selectedCrew", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CREW_COMPOSITIONS.map((crew) => (
                            <SelectItem key={crew.id} value={crew.id}>
                              {crew.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {recommendedCrew && recommendedCrew.id !== formData.selectedCrew && (
                        <p className="text-sm text-amber-600 flex items-center gap-1">
                          <Info className="w-4 h-4" />
                          Recommended: {recommendedCrew.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selectedRegion">Region</Label>
                      <Select value={formData.selectedRegion} onValueChange={(v) => handleChange("selectedRegion", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REGIONAL_ADJUSTMENTS.map((region) => (
                            <SelectItem key={region.region} value={region.region}>
                              {region.region}, {region.state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeOptionalOnCosts"
                        checked={formData.includeOptionalOnCosts === "true"}
                        onChange={(e) => handleChange("includeOptionalOnCosts", e.target.checked ? "true" : "false")}
                        className="rounded border-slate-300"
                      />
                      <Label htmlFor="includeOptionalOnCosts" className="text-sm font-normal">
                        Include optional on-costs (tools, vehicles, admin)
                      </Label>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="materialType">Material Type (Labor Impact)</Label>
                      <Select value={formData.materialType} onValueChange={(v) => handleChange("materialType", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="colorbond-metal">Colorbond/Metal (Fastest - 1.0x)</SelectItem>
                          <SelectItem value="concrete-tile">Concrete Tile (2.5x labor)</SelectItem>
                          <SelectItem value="terracotta-tile">Terracotta Tile (2.8x labor)</SelectItem>
                          <SelectItem value="slate">Slate (3.0x labor)</SelectItem>
                          <SelectItem value="custom-specialty">Custom/Specialty (2.5x labor)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500">
                        Different materials require different installation times
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="removalType">Existing Roof Removal</Label>
                      <Select value={formData.removalType} onValueChange={(v) => handleChange("removalType", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (New construction)</SelectItem>
                          <SelectItem value="metal-simple">Metal Roof - Simple (+0.15 hrs/m²)</SelectItem>
                          <SelectItem value="metal-complex">Metal Roof - Complex (+0.25 hrs/m²)</SelectItem>
                          <SelectItem value="metal-with-battens">Metal + Battens (+0.35 hrs/m²)</SelectItem>
                          <SelectItem value="concrete-tile">Concrete Tile (+0.30 hrs/m²)</SelectItem>
                          <SelectItem value="terracotta-tile">Terracotta Tile (+0.35 hrs/m²)</SelectItem>
                          <SelectItem value="tile-with-battens">Tile + Battens (+0.45 hrs/m²)</SelectItem>
                          <SelectItem value="asbestos">Asbestos - Licensed (+0.65 hrs/m²)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500">
                        Removal adds significant time and cost to the project
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="season">Project Season (Weather Delays)</Label>
                      <Select value={formData.season} onValueChange={(v) => handleChange("season", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="summer">Summer (Dec-Feb) - Best (+7.5% buffer)</SelectItem>
                          <SelectItem value="autumn">Autumn (Mar-May) - Good (+12.5% buffer)</SelectItem>
                          <SelectItem value="winter">Winter (Jun-Aug) - High risk (+25% buffer)</SelectItem>
                          <SelectItem value="spring">Spring (Sep-Nov) - Variable (+17.5% buffer)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500">
                        Weather delays vary significantly by season
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Pricing Configuration
                    </CardTitle>
                    <CardDescription>Set profit margin and tax options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profitMargin">Profit Margin (%)</Label>
                      <Input
                        id="profitMargin"
                        type="number"
                        step="1"
                        placeholder="25"
                        value={formData.profitMargin}
                        onChange={(e) => handleChange("profitMargin", e.target.value)}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeGst"
                        checked={formData.includeGst === "true"}
                        onChange={(e) => handleChange("includeGst", e.target.checked ? "true" : "false")}
                        className="rounded border-slate-300"
                      />
                      <Label htmlFor="includeGst" className="text-sm font-normal">
                        Include GST (10%)
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Button onClick={calculateTakeoff} className="w-full" size="lg">
              <CalcIcon className="w-5 h-5 mr-2" />
              Calculate Takeoff
            </Button>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Calculation Results</CardTitle>
                    <CardDescription>Detailed breakdown of costs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Roof Area:</span>
                        <span className="font-semibold">{result.roofArea.toFixed(2)} m²</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Total Area (with waste):</span>
                        <span className="font-semibold">{result.totalArea.toFixed(2)} m²</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Sheets Required:</span>
                        <span className="font-semibold">{result.sheetsRequired}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Fasteners:</span>
                        <span className="font-semibold">{result.fasteners}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Labor Details
                      </h4>
                      <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Crew:</span>
                          <span className="font-medium">{result.laborDetails.crew.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Region:</span>
                          <span className="font-medium">{result.laborDetails.region}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Installation Hours:</span>
                          <span className="font-medium">{(result.laborDetails as any).installationHours?.toFixed(1) || 'N/A'} hrs</span>
                        </div>
                        {(result.laborDetails as any).removalHours > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Removal Hours:</span>
                            <span className="font-medium text-amber-600">{(result.laborDetails as any).removalHours.toFixed(1)} hrs</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Total Hours:</span>
                          <span className="font-medium">{result.laborDetails.totalHours.toFixed(1)} hrs</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Base Days Required:</span>
                          <span className="font-medium">{Math.ceil(result.laborDetails.totalHours / 8)} days</span>
                        </div>
                        {(result.laborDetails as any).weatherDelayDays > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Weather Delay Buffer:</span>
                            <span className="font-medium text-amber-600">+{(result.laborDetails as any).weatherDelayDays} days</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-slate-600">Total Days (with weather):</span>
                          <span className="font-semibold">{result.laborDetails.daysRequired} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Crew Rate (inc. on-costs):</span>
                          <span className="font-medium">${result.laborDetails.hourlyRate.toFixed(2)}/hr</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Labor Cost per m²:</span>
                          <span className="font-medium">${result.laborDetails.costPerSqm.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Cost Breakdown</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Materials:</span>
                        <span className="font-semibold">${result.materialCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Labor:</span>
                        <span className="font-semibold">${result.laborCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Total (with profit):</span>
                        <span className="font-semibold">${result.totalCost.toFixed(2)}</span>
                      </div>
                      {result.gst > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">GST (10%):</span>
                          <span className="font-semibold">${result.gst.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-bold">Grand Total:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${result.grandTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Per m²:</span>
                      <span>${(result.grandTotal / result.totalArea).toFixed(2)}/m²</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Crew Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.laborDetails.breakdown.breakdown.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-slate-600">
                            {item.quantity}x {item.skillLevel}
                          </span>
                          <span className="font-medium">
                            ${item.adjustedRate.toFixed(2)}/hr = ${item.subtotal.toFixed(2)}/hr
                          </span>
                        </div>
                      ))}
                      <Separator className="my-2" />
                      <div className="text-xs text-slate-500 space-y-1">
                        <p className="font-semibold">On-costs included:</p>
                        {result.laborDetails.breakdown.onCosts.breakdown.map((cost: any, idx: number) => (
                          <div key={idx} className="flex justify-between">
                            <span>{cost.name}</span>
                            <span>${cost.amount.toFixed(2)}/hr</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {projectId && (
                  <Button
                    onClick={handleSave}
                    disabled={createTakeoffMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {createTakeoffMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Calculation
                      </>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalcIcon className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="text-slate-500 text-center">
                    Enter roof dimensions and click Calculate to see results
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

