import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  Calculator as CalcIcon, 
  Loader2, 
  Save, 
  AlertTriangle,
  CheckCircle2,
  Info,
  ExternalLink,
  Wrench,
  CloudRain,
  FileText
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { EXPANDED_MATERIALS, getMaterialsByCategory, type RoofingMaterial } from "@shared/expandedMaterials";
import { 
  assessEnvironmentalFactors, 
  getWeatherRecommendations, 
  calculateFastenerDensity, 
  getToolRecommendations,
  type EnvironmentalFactors,
  type EnvironmentalRecommendations 
} from "@shared/environmentalIntelligence";
import { 
  verifyManufacturerCompliance, 
  generateInstallationChecklist,
  getManufacturerDocs
} from "@shared/manufacturerSpecs";

interface CalculationResult {
  roofArea: number;
  totalArea: number;
  sheetsRequired: number;
  fasteners: number;
  ridgeLength: number;
  gutterLength: number;
  materialCost: number;
  laborCost: number;
  totalCost: number;
  gst: number;
  grandTotal: number;
  perM2Cost: number;
}

export default function CalculatorEnhanced() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/projects/:id/calculator");
  const projectId = params?.id;

  const { data: project } = trpc.projects.get.useQuery(
    { id: projectId! },
    { enabled: !!projectId }
  );

  // Fetch saved measurements
  const { data: savedMeasurement } = trpc.measurements.get.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const [measurementLoaded, setMeasurementLoaded] = useState(false);

  const createTakeoffMutation = trpc.takeoffs.create.useMutation({
    onSuccess: () => {
      toast.success("Calculation saved successfully");
      if (projectId) {
        setLocation(`/projects/${projectId}`);
      }
    },
  });

  const updateProjectMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      // Silent update - no toast notification
    },
    onError: (error) => {
      console.error("Failed to update project:", error);
    },
  });

  const [formData, setFormData] = useState({
    roofLength: "",
    roofWidth: "",
    roofType: "gable",
    roofPitch: "22.5",
    wastePercentage: "10",
    labourRate: "75",
    profitMargin: "25",
    includeGst: "true",
    selectedMaterial: "lysaght-kliplok-700-bmt-0.42",
    // Environmental factors
    location: "",
    coastalDistance: "" as string,
    windRegion: "B" as "A" | "B" | "C" | "D",
    balRating: "BAL-LOW" as "BAL-LOW" | "BAL-12.5" | "BAL-19" | "BAL-29" | "BAL-40" | "BAL-FZ",
    saltExposure: false,
    cycloneRisk: false,
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [envAssessment, setEnvAssessment] = useState<EnvironmentalRecommendations | null>(null);
  const [activeTab, setActiveTab] = useState("calculator");

  const roofingMaterials = getMaterialsByCategory("roofing_sheet");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  // Initialize form data from project when loaded
  useEffect(() => {
    if (project) {
      setFormData(prev => ({
        ...prev,
        location: project.location || "",
        coastalDistance: project.coastalDistance || "",
        windRegion: (project.windRegion as "A" | "B" | "C" | "D") || "B",
        balRating: (project.balRating as "BAL-LOW" | "BAL-12.5" | "BAL-19" | "BAL-29" | "BAL-40" | "BAL-FZ") || "BAL-LOW",
        saltExposure: project.saltExposure === "true",
        cycloneRisk: project.cycloneRisk === "true",
      }));
    }
  }, [project]);

  // Auto-load measurements from Site Measurement tool
  useEffect(() => {
    if (savedMeasurement && savedMeasurement.measurementData && !measurementLoaded) {
      try {
        const data = JSON.parse(savedMeasurement.measurementData);
        if (data.totalArea) {
          // Calculate approximate dimensions from total area
          // Assuming roughly square roof for initial estimate
          const side = Math.sqrt(data.totalArea);
          setFormData(prev => ({
            ...prev,
            roofLength: side.toFixed(2),
            roofWidth: side.toFixed(2),
          }));
          setMeasurementLoaded(true);
          toast.success("Measurements loaded from Site Measurement tool", {
            description: `Total area: ${data.totalArea.toFixed(2)} m²`,
          });
        }
      } catch (error) {
        console.error("Failed to parse measurement data:", error);
      }
    }
  }, [savedMeasurement, measurementLoaded]);

  // Run environmental assessment when factors change
  useEffect(() => {
    if (formData.location) {
      const factors: EnvironmentalFactors = {
        location: formData.location,
        coastalDistance: formData.coastalDistance ? parseFloat(formData.coastalDistance) : undefined,
        windRegion: formData.windRegion,
        balRating: formData.balRating,
        saltExposure: formData.saltExposure,
        cycloneRisk: formData.cycloneRisk,
      };
      const assessment = assessEnvironmentalFactors(factors);
      setEnvAssessment(assessment);
    }
  }, [formData.location, formData.coastalDistance, formData.windRegion, formData.balRating, formData.saltExposure, formData.cycloneRisk]);

  // Auto-save environmental factors to project
  useEffect(() => {
    if (projectId && project) {
      // Debounce the update to avoid too many API calls
      const timeoutId = setTimeout(() => {
        updateProjectMutation.mutate({
          id: projectId,
          location: formData.location || undefined,
          coastalDistance: formData.coastalDistance || undefined,
          windRegion: formData.windRegion,
          balRating: formData.balRating,
          saltExposure: formData.saltExposure.toString(),
          cycloneRisk: formData.cycloneRisk.toString(),
        });
      }, 1000); // Wait 1 second after last change

      return () => clearTimeout(timeoutId);
    }
  }, [projectId, formData.location, formData.coastalDistance, formData.windRegion, formData.balRating, formData.saltExposure, formData.cycloneRisk, project]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTakeoff = () => {
    const length = parseFloat(formData.roofLength) || 0;
    const width = parseFloat(formData.roofWidth) || 0;
    const pitch = parseFloat(formData.roofPitch) || 0;
    const waste = parseFloat(formData.wastePercentage) || 0;
    const labourRate = parseFloat(formData.labourRate) || 0;
    const profitMargin = parseFloat(formData.profitMargin) || 0;

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
    const material = EXPANDED_MATERIALS.find(m => m.id === formData.selectedMaterial);
    if (!material) return;

    // Calculate sheets (using cover width)
    const coverWidthM = material.cover_width_mm ? material.cover_width_mm / 1000 : 0.7; // Convert mm to m
    const sheetsRequired = Math.ceil(totalArea / (coverWidthM * 2.4)); // Assuming 2.4m sheet length

    // Calculate fasteners based on environmental factors
    const fastenerCalc = calculateFastenerDensity(
      formData.windRegion,
      pitch,
      formData.coastalDistance ? parseFloat(formData.coastalDistance) : undefined
    );
    const fasteners = Math.ceil(totalArea * fastenerCalc.fastenersPerM2);

    // Calculate ridge and gutter (perimeter approximation)
    const ridgeLength = length;
    const gutterLength = (length + width) * 2;

    // Calculate costs
    const materialCost = totalArea * material.price_per_unit;
    
    // Ridge flashing
    const ridgeFlashing = EXPANDED_MATERIALS.find(m => m.category === "flashing" && m.name.includes("Ridge"));
    const ridgeCost = ridgeFlashing ? ridgeLength * ridgeFlashing.price_per_unit : 0;

    // Gutter (estimate)
    const gutterCost = gutterLength * 45; // $45/m average

    // Fasteners - select appropriate grade based on environment
    let fastenerGrade = "class-3-galv";
    if (envAssessment) {
      if (envAssessment.fastenerGrade.includes("Stainless")) {
        fastenerGrade = "ss-316";
      } else if (envAssessment.fastenerGrade.includes("Class 4")) {
        fastenerGrade = "class-4-galv";
      }
    }
    const fastener = EXPANDED_MATERIALS.find(m => m.id === fastenerGrade);
    const fastenerCost = fastener ? fasteners * fastener.price_per_unit : fasteners * 0.35;

    const totalMaterialCost = materialCost + ridgeCost + gutterCost + fastenerCost;

    // Labor calculation (hours based on area and complexity)
    let laborHours = totalArea * 0.5; // Base: 0.5 hours per m²
    
    // Adjust for pitch
    if (pitch > 30) laborHours *= 1.3; // Steep roof
    if (pitch < 5) laborHours *= 1.2; // Low pitch complexity
    
    // Adjust for environmental factors
    if (formData.coastalDistance && parseFloat(formData.coastalDistance) < 1) {
      laborHours *= 1.15; // Extra care for coastal
    }
    
    const laborCost = laborHours * labourRate;

    // Total with profit
    const subtotal = totalMaterialCost + laborCost;
    const totalCost = subtotal * (1 + profitMargin / 100);

    // GST
    const gst = formData.includeGst === "true" ? totalCost * 0.1 : 0;
    const grandTotal = totalCost + gst;
    const perM2Cost = grandTotal / roofArea;

    setResult({
      roofArea,
      totalArea,
      sheetsRequired,
      fasteners,
      ridgeLength,
      gutterLength,
      materialCost: totalMaterialCost,
      laborCost,
      totalCost,
      gst,
      grandTotal,
      perM2Cost,
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
      labourRate: formData.labourRate,
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

  const selectedMaterial = EXPANDED_MATERIALS.find(m => m.id === formData.selectedMaterial);
  const manufacturerDocs = selectedMaterial ? getManufacturerDocs(selectedMaterial.id) : null;
  
  const complianceCheck = selectedMaterial && formData.roofPitch && formData.roofLength
    ? verifyManufacturerCompliance(
        selectedMaterial.id,
        parseFloat(formData.roofPitch),
        parseFloat(formData.roofLength) * 1000, // Convert to mm
        envAssessment?.fastenerGrade || "Class 3 Galvanized",
        {
          coastal: formData.coastalDistance ? parseFloat(formData.coastalDistance) < 5 : false,
          windRegion: formData.windRegion,
        }
      )
    : null;

  const weatherRecs = selectedMaterial && formData.roofLength
    ? getWeatherRecommendations(
        manufacturerDocs?.fixingRequirements.type === "concealed" ? "concealed-fix" : "pierce-fix",
        parseFloat(formData.roofLength) || 6
      )
    : null;

  const toolRecs = result
    ? getToolRecommendations(
        result.roofArea,
        formData.coastalDistance ? parseFloat(formData.coastalDistance) < 5 : false
      )
    : null;

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
              <h1 className="text-2xl font-bold text-slate-900">Advanced Roofing Calculator</h1>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="environmental">Environmental</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="installation">Installation Guide</TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Roof Dimensions</span>
                      {measurementLoaded && (
                        <Badge variant="secondary" className="ml-2">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Auto-loaded
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {measurementLoaded 
                        ? "Measurements loaded from Site Measurement tool" 
                        : "Enter the roof measurements"}
                    </CardDescription>
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
                          <SelectTrigger id="roofType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gable">Gable</SelectItem>
                            <SelectItem value="hip">Hip</SelectItem>
                            <SelectItem value="flat">Flat</SelectItem>
                            <SelectItem value="skillion">Skillion</SelectItem>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Material Selection</CardTitle>
                    <CardDescription>Choose roofing material</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="material">Roofing Material</Label>
                      <Select value={formData.selectedMaterial} onValueChange={(v) => handleChange("selectedMaterial", v)}>
                        <SelectTrigger id="material">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roofingMaterials.map((mat) => (
                            <SelectItem key={mat.id} value={mat.id}>
                              {mat.manufacturer} {mat.name} - ${mat.price_per_unit}/{mat.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedMaterial && (
                      <div className="p-3 bg-slate-50 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Profile:</span>
                          <span className="font-medium">{selectedMaterial.profile}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">BMT:</span>
                          <span className="font-medium">{selectedMaterial.bmt}</span>
                        </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Cover Width:</span>
                            <span className="font-medium">{selectedMaterial.cover_width_mm ? (selectedMaterial.cover_width_mm / 1000).toFixed(2) : 'N/A'}m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Min Pitch:</span>
                            <span className="font-medium">{selectedMaterial.min_pitch_degrees || 'N/A'}°</span>
                          </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="wastePercentage">Waste Allowance (%)</Label>
                        <Input
                          id="wastePercentage"
                          type="number"
                          step="1"
                          value={formData.wastePercentage}
                          onChange={(e) => handleChange("wastePercentage", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="labourRate">Labour Rate ($/hr)</Label>
                        <Input
                          id="labourRate"
                          type="number"
                          step="5"
                          value={formData.labourRate}
                          onChange={(e) => handleChange("labourRate", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="profitMargin">Profit Margin (%)</Label>
                        <Input
                          id="profitMargin"
                          type="number"
                          step="5"
                          value={formData.profitMargin}
                          onChange={(e) => handleChange("profitMargin", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="includeGst">Include GST</Label>
                        <Select value={formData.includeGst} onValueChange={(v) => handleChange("includeGst", v)}>
                          <SelectTrigger id="includeGst">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={calculateTakeoff} className="w-full" size="lg">
                  <CalcIcon className="w-4 h-4 mr-2" />
                  Calculate Takeoff
                </Button>
              </div>

              {/* Results */}
              <div className="space-y-6">
                {result && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Calculation Results</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-slate-600">Roof Area:</span>
                            <span className="font-semibold">{result.roofArea.toFixed(2)} m²</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-slate-600">Total Area (with waste):</span>
                            <span className="font-semibold">{result.totalArea.toFixed(2)} m²</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-slate-600">Sheets Required:</span>
                            <span className="font-semibold">{result.sheetsRequired}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-slate-600">Fasteners:</span>
                            <span className="font-semibold">{result.fasteners}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-slate-600">Ridge Length:</span>
                            <span className="font-semibold">{result.ridgeLength.toFixed(2)} m</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-slate-600">Gutter Length:</span>
                            <span className="font-semibold">{result.gutterLength.toFixed(2)} m</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Cost Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between py-2">
                            <span className="text-slate-600">Materials:</span>
                            <span className="font-semibold">${result.materialCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-slate-600">Labour:</span>
                            <span className="font-semibold">${result.laborCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-t">
                            <span className="text-slate-600">Subtotal (with profit):</span>
                            <span className="font-semibold">${result.totalCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-slate-600">GST (10%):</span>
                            <span className="font-semibold">${result.gst.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-3 border-t-2 border-slate-300">
                            <span className="text-lg font-bold">Grand Total:</span>
                            <span className="text-lg font-bold text-blue-600">${result.grandTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-2 bg-blue-50 px-3 rounded">
                            <span className="text-slate-700 font-medium">Per m² Cost:</span>
                            <span className="font-bold text-blue-700">${result.perM2Cost.toFixed(2)}/m²</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {projectId && (
                      <Button onClick={handleSave} className="w-full" size="lg" disabled={createTakeoffMutation.isPending}>
                        {createTakeoffMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save to Project
                      </Button>
                    )}
                  </>
                )}

                {!result && (
                  <Card>
                    <CardContent className="py-12 text-center text-slate-500">
                      <CalcIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Enter roof dimensions and click Calculate to see results</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Environmental Tab */}
          <TabsContent value="environmental" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Environmental Factors</CardTitle>
                    <CardDescription>Enter site environmental conditions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Sydney, NSW"
                        value={formData.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coastalDistance">Distance from Coast (km)</Label>
                      <Input
                        id="coastalDistance"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 2.5"
                        value={formData.coastalDistance}
                        onChange={(e) => handleChange("coastalDistance", e.target.value)}
                      />
                      <p className="text-xs text-slate-500">
                        &lt;0.2km = Severe Marine, 0.2-1km = Moderate Marine, 1-5km = Mild Marine
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="windRegion">Wind Region</Label>
                        <Select value={formData.windRegion} onValueChange={(v: any) => handleChange("windRegion", v)}>
                          <SelectTrigger id="windRegion">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">Region A (Low)</SelectItem>
                            <SelectItem value="B">Region B (Medium)</SelectItem>
                            <SelectItem value="C">Region C (High)</SelectItem>
                            <SelectItem value="D">Region D (Cyclonic)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="balRating">BAL Rating</Label>
                        <Select value={formData.balRating} onValueChange={(v: any) => handleChange("balRating", v)}>
                          <SelectTrigger id="balRating">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BAL-LOW">BAL-LOW</SelectItem>
                            <SelectItem value="BAL-12.5">BAL-12.5</SelectItem>
                            <SelectItem value="BAL-19">BAL-19</SelectItem>
                            <SelectItem value="BAL-29">BAL-29</SelectItem>
                            <SelectItem value="BAL-40">BAL-40</SelectItem>
                            <SelectItem value="BAL-FZ">BAL-FZ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="saltExposure"
                          checked={formData.saltExposure}
                          onChange={(e) => handleChange("saltExposure", e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <Label htmlFor="saltExposure" className="font-normal">High salt exposure</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="cycloneRisk"
                          checked={formData.cycloneRisk}
                          onChange={(e) => handleChange("cycloneRisk", e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <Label htmlFor="cycloneRisk" className="font-normal">Cyclone-prone zone</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {envAssessment && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Environmental Assessment
                          <Badge variant={
                            envAssessment.riskLevel === "Extreme" ? "destructive" :
                            envAssessment.riskLevel === "High" ? "destructive" :
                            envAssessment.riskLevel === "Medium" ? "default" :
                            "secondary"
                          }>
                            {envAssessment.riskLevel} Risk
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-sm text-slate-700 mb-2">Material Recommendation</h4>
                            <p className="text-sm">{envAssessment.materialGrade}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-sm text-slate-700 mb-2">Fastener Specification</h4>
                            <p className="text-sm">{envAssessment.fastenerGrade}</p>
                          </div>

                          {envAssessment.extraRequirements.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm text-slate-700 mb-2">Additional Requirements</h4>
                              <ul className="space-y-1">
                                {envAssessment.extraRequirements.map((req, idx) => (
                                  <li key={idx} className="text-sm flex items-start">
                                    <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {envAssessment.warnings.length > 0 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Environmental Warnings</AlertTitle>
                        <AlertDescription>
                          <ul className="mt-2 space-y-1">
                            {envAssessment.warnings.map((warning, idx) => (
                              <li key={idx} className="text-sm">{warning}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {envAssessment.installationNotes.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Installation Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {envAssessment.installationNotes.map((note, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <Info className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                                {note}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Compliance Standards</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {envAssessment.complianceStandards.map((standard, idx) => (
                            <Badge key={idx} variant="outline">{standard}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {!envAssessment && (
                  <Card>
                    <CardContent className="py-12 text-center text-slate-500">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Enter location to see environmental assessment</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                {manufacturerDocs && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Manufacturer Documentation</CardTitle>
                      <CardDescription>{manufacturerDocs.manufacturer} - {manufacturerDocs.productName}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm text-slate-700 mb-2">Specifications</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Minimum Pitch:</span>
                              <span>{manufacturerDocs.minimumPitch}°</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Maximum Span:</span>
                              <span>{manufacturerDocs.maximumSpan}mm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Fixing Type:</span>
                              <span className="capitalize">{manufacturerDocs.fixingRequirements.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Fasteners/m²:</span>
                              <span>{manufacturerDocs.fixingRequirements.fastenersPerM2}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm text-slate-700 mb-2">Compliance Standards</h4>
                          <div className="flex flex-wrap gap-2">
                            {manufacturerDocs.complianceStandards.map((std, idx) => (
                              <Badge key={idx} variant="secondary">{std}</Badge>
                            ))}
                          </div>
                        </div>

                        {manufacturerDocs.installationManualUrl && (
                          <div>
                            <Button variant="outline" size="sm" className="w-full" asChild>
                              <a href={manufacturerDocs.installationManualUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Installation Manual
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {complianceCheck && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Compliance Verification
                        <Badge variant={complianceCheck.compliant ? "default" : "destructive"}>
                          {complianceCheck.compliant ? "Compliant" : "Issues Found"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {complianceCheck.issues.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-red-700 mb-2">Issues</h4>
                          <ul className="space-y-2">
                            {complianceCheck.issues.map((issue, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 text-red-600 flex-shrink-0" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {complianceCheck.warnings.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-amber-700 mb-2">Warnings</h4>
                          <ul className="space-y-2">
                            {complianceCheck.warnings.map((warning, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <Info className="w-4 h-4 mr-2 mt-0.5 text-amber-600 flex-shrink-0" />
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {complianceCheck.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-blue-700 mb-2">Recommendations</h4>
                          <ul className="space-y-2">
                            {complianceCheck.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                {selectedMaterial && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Installation Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm font-mono">
                        {generateInstallationChecklist(selectedMaterial.id).map((item, idx) => (
                          <div key={idx} className={item.startsWith("===") ? "font-bold mt-4 mb-2 text-slate-900" : "text-slate-700"}>
                            {item}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Installation Guide Tab */}
          <TabsContent value="installation" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                {weatherRecs && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CloudRain className="w-5 h-5 mr-2" />
                        Weather Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm text-slate-700 mb-2">Safe Conditions</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Max Wind Speed:</span>
                              <span className="font-medium">{weatherRecs.safeWindSpeed} km/h</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Temperature Range:</span>
                              <span className="font-medium">{weatherRecs.temperatureRange.min}°C - {weatherRecs.temperatureRange.max}°C</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm text-slate-700 mb-2">Warnings</h4>
                          <ul className="space-y-2">
                            {weatherRecs.warnings.map((warning, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 text-amber-600 flex-shrink-0" />
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm text-slate-700 mb-2">Best Conditions</h4>
                          <ul className="space-y-2">
                            {weatherRecs.bestConditions.map((condition, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                                {condition}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {toolRecs && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Wrench className="w-5 h-5 mr-2" />
                        Tool Recommendations
                      </CardTitle>
                      <CardDescription>{toolRecs.timeSavings}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-700 mb-3">Essential Tools</h4>
                        <div className="space-y-3">
                          {toolRecs.essential.map((tool, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm">{tool.name}</span>
                                {tool.estimatedCost && (
                                  <span className="text-xs text-slate-600">{tool.estimatedCost}</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600">{tool.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {toolRecs.recommended.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-slate-700 mb-3">Recommended Tools</h4>
                          <div className="space-y-3">
                            {toolRecs.recommended.map((tool, idx) => (
                              <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-medium text-sm">{tool.name}</span>
                                  {tool.estimatedCost && (
                                    <span className="text-xs text-slate-600">{tool.estimatedCost}</span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600">{tool.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                {formData.roofPitch && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Fastener Density</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const fastenerCalc = calculateFastenerDensity(
                          formData.windRegion,
                          parseFloat(formData.roofPitch),
                          formData.coastalDistance ? parseFloat(formData.coastalDistance) : undefined
                        );
                        return (
                          <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg text-center">
                              <div className="text-3xl font-bold text-blue-700">{fastenerCalc.fastenersPerM2}</div>
                              <div className="text-sm text-slate-600 mt-1">fasteners per m&sup2;</div>
                            </div>
                            {fastenerCalc.notes.length > 0 && (
                              <ul className="space-y-2">
                                {fastenerCalc.notes.map((note, idx) => (
                                  <li key={idx} className="text-sm flex items-start">
                                    <Info className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                                    {note}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Installation Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="https://www.lysaght.com/content/dam/lysaght/australia/documents/installation-manuals/LYT0026-Installation-Manual-Roofing-and-Walling.pdf" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Lysaght Installation Manual
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="https://www.stramit.com.au/wp-content/uploads/2021/03/Stramit-Installation-Guide.pdf" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Stramit Installation Guide
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="https://www.metroll.com.au/wp-content/uploads/Installation-Manual.pdf" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Metroll Installation Manual
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

