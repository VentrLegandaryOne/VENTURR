import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calculator as CalcIcon, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { MOCK_MATERIALS, getMaterialsByCategory, type Material } from "../../../shared/mockMaterials";

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
}

export default function Calculator() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/projects/:id/calculator");
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
    roofLength: "",
    roofWidth: "",
    roofType: "gable",
    roofPitch: "22.5",
    wastePercentage: "10",
    labourRate: "75",
    profitMargin: "25",
    includeGst: "true",
    selectedMaterial: "lys-trimdek-zam",
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  const roofingMaterials = getMaterialsByCategory("roofing");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  const handleChange = (field: string, value: string) => {
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
    const material = MOCK_MATERIALS.find(m => m.id === formData.selectedMaterial);
    if (!material) return;

    // Calculate sheets (assuming 2.4m average sheet length)
    const sheetsRequired = Math.ceil(totalArea / 1.8); // 0.762m cover width * 2.4m length

    // Calculate fasteners (8 per m²)
    const fasteners = Math.ceil(totalArea * 8);

    // Calculate ridge and gutter (perimeter approximation)
    const ridgeLength = length;
    const gutterLength = (length + width) * 2;

    // Calculate costs
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

    // Labor calculation (hours based on area)
    const laborHours = totalArea * 0.5; // 0.5 hours per m²
    const laborCost = laborHours * labourRate;

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
              <h1 className="text-2xl font-bold text-slate-900">Roofing Takeoff Calculator</h1>
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

                <div className="space-y-2">
                  <Label htmlFor="roofType">Roof Type</Label>
                  <Select value={formData.roofType} onValueChange={(value) => handleChange("roofType", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gable">Gable</SelectItem>
                      <SelectItem value="hip">Hip</SelectItem>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="skillion">Skillion</SelectItem>
                      <SelectItem value="dutch_gable">Dutch Gable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roofPitch">Roof Pitch (degrees)</Label>
                  <Select value={formData.roofPitch} onValueChange={(value) => handleChange("roofPitch", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5° (Flat)</SelectItem>
                      <SelectItem value="10">10° (Low)</SelectItem>
                      <SelectItem value="15">15°</SelectItem>
                      <SelectItem value="22.5">22.5° (Standard)</SelectItem>
                      <SelectItem value="30">30°</SelectItem>
                      <SelectItem value="35">35° (Steep)</SelectItem>
                      <SelectItem value="45">45° (Very Steep)</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="selectedMaterial">Roofing Profile</Label>
                  <Select
                    value={formData.selectedMaterial}
                    onValueChange={(value) => handleChange("selectedMaterial", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roofingMaterials.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.name} - ${material.pricePerUnit}/m²
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.selectedMaterial && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-sm">
                      {MOCK_MATERIALS.find(m => m.id === formData.selectedMaterial)?.description}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calculation Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <Label htmlFor="labourRate">Labour Rate ($/hour)</Label>
                  <Input
                    id="labourRate"
                    type="number"
                    step="5"
                    value={formData.labourRate}
                    onChange={(e) => handleChange("labourRate", e.target.value)}
                  />
                </div>

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
                  <Select value={formData.includeGst} onValueChange={(value) => handleChange("includeGst", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={calculateTakeoff} className="w-full bg-green-600 hover:bg-green-700">
                  <CalcIcon className="w-4 h-4 mr-2" />
                  Calculate
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Material Quantities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-600">Roof Area (flat)</span>
                      <span className="font-semibold">{result.roofArea.toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-600">Total Area (with pitch & waste)</span>
                      <span className="font-semibold">{result.totalArea.toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-600">Sheets Required</span>
                      <span className="font-semibold">{result.sheetsRequired}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-600">Fasteners</span>
                      <span className="font-semibold">{result.fasteners}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-600">Ridge Length</span>
                      <span className="font-semibold">{result.ridgeLength.toFixed(2)} m</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-600">Gutter Length</span>
                      <span className="font-semibold">{result.gutterLength.toFixed(2)} m</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-600">Materials</span>
                      <span className="font-semibold">${result.materialCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-600">Labour</span>
                      <span className="font-semibold">${result.laborCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-slate-600">Subtotal (with profit)</span>
                      <span className="font-semibold">${result.totalCost.toFixed(2)}</span>
                    </div>
                    {result.gst > 0 && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-slate-600">GST (10%)</span>
                        <span className="font-semibold">${result.gst.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 bg-green-50 px-4 rounded-lg">
                      <span className="text-lg font-bold text-green-900">Total</span>
                      <span className="text-lg font-bold text-green-900">${result.grandTotal.toFixed(2)}</span>
                    </div>
                    <div className="text-center text-sm text-slate-600 mt-2">
                      ${(result.grandTotal / result.roofArea).toFixed(2)} per m² (flat area)
                    </div>
                  </CardContent>
                </Card>

                {projectId && (
                  <Button
                    onClick={handleSave}
                    disabled={createTakeoffMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {createTakeoffMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Calculation
                  </Button>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CalcIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Calculation Yet</h3>
                  <p className="text-slate-600">Enter roof dimensions and click Calculate</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

