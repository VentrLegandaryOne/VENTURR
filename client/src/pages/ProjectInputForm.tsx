import { useState } from "react";
import { useNavigate } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, FileText, Loader2 } from "lucide-react";

/**
 * Project Input Form for Intelligent Material Take-Off System
 * 
 * Collects project data and feeds it to the intelligence analysis engine
 */
export default function ProjectInputForm() {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form state
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [jobType, setJobType] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState<"easy" | "medium" | "hard" | "extreme">("medium");
  const [coastalExposure, setCoastalExposure] = useState<boolean>(false);
  const [urgency, setUrgency] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [customNotes, setCustomNotes] = useState("");
  const [mudMapFile, setMudMapFile] = useState<File | null>(null);
  const [constructionPlansFile, setConstructionPlansFile] = useState<File | null>(null);

  // tRPC mutations
  const analyzeProjectMutation = trpc.intelligence.analyzeProject.useMutation({
    onSuccess: (data) => {
      toast.success("Project analysis complete!");
      // Navigate to deliverables dashboard with analysis data
      navigate(`/deliverables/${data.projectId}`);
    },
    onError: (error) => {
      toast.error(`Analysis failed: ${error.message}`);
      setIsAnalyzing(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!clientName.trim()) {
      toast.error("Please enter client name");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter property address");
      return;
    }
    if (!jobType) {
      toast.error("Please select job type");
      return;
    }

    setIsAnalyzing(true);

    // Convert files to base64 if provided
    let mudMapData: string | undefined;
    let constructionPlansData: string | undefined;

    if (mudMapFile) {
      mudMapData = await fileToBase64(mudMapFile);
    }
    if (constructionPlansFile) {
      constructionPlansData = await fileToBase64(constructionPlansFile);
    }

    // Submit to intelligence analysis engine
    analyzeProjectMutation.mutate({
      clientName,
      address,
      jobType,
      difficultyLevel,
      coastalExposure,
      urgency,
      customNotes,
      mudMapData,
      constructionPlans: constructionPlansData,
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">New Project Analysis</h1>
          <p className="text-muted-foreground">
            Enter project details to generate 100% accurate material take-offs, crew requirements, and compliance documentation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Basic project and client details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="John Smith"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Property Address *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street, Sydney NSW 2000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="jobType">Job Type *</Label>
                <Select value={jobType} onValueChange={setJobType} required>
                  <SelectTrigger id="jobType">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential-reroof">Residential Re-Roof</SelectItem>
                    <SelectItem value="residential-new">Residential New Construction</SelectItem>
                    <SelectItem value="commercial-reroof">Commercial Re-Roof</SelectItem>
                    <SelectItem value="commercial-new">Commercial New Construction</SelectItem>
                    <SelectItem value="industrial-reroof">Industrial Re-Roof</SelectItem>
                    <SelectItem value="industrial-new">Industrial New Construction</SelectItem>
                    <SelectItem value="repair-maintenance">Repair & Maintenance</SelectItem>
                    <SelectItem value="emergency-repair">Emergency Repair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Project Characteristics */}
          <Card>
            <CardHeader>
              <CardTitle>Project Characteristics</CardTitle>
              <CardDescription>Help us understand the project complexity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                <Select value={difficultyLevel} onValueChange={(value: any) => setDifficultyLevel(value)}>
                  <SelectTrigger id="difficultyLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy - Simple gable roof, low pitch, good access</SelectItem>
                    <SelectItem value="medium">Medium - Hip roof, moderate pitch, some complexity</SelectItem>
                    <SelectItem value="hard">Hard - Complex roof shape, steep pitch, difficult access</SelectItem>
                    <SelectItem value="extreme">Extreme - Very complex, heritage, extreme conditions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="coastalExposure">Coastal Exposure</Label>
                <Select value={coastalExposure ? "yes" : "no"} onValueChange={(value) => setCoastalExposure(value === "yes")}>
                  <SelectTrigger id="coastalExposure">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No - Standard environment</SelectItem>
                    <SelectItem value="yes">Yes - Within 1km of coastline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="urgency">Urgency</Label>
                <Select value={urgency} onValueChange={(value: any) => setUrgency(value)}>
                  <SelectTrigger id="urgency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Standard timeline</SelectItem>
                    <SelectItem value="medium">Medium - Preferred completion date</SelectItem>
                    <SelectItem value="high">High - Time-sensitive</SelectItem>
                    <SelectItem value="critical">Critical - Emergency/urgent repair</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customNotes">Custom Notes & Requirements</Label>
                <Textarea
                  id="customNotes"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Enter any specific requirements, client requests, or special considerations..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Measurements & Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>Measurements & Documentation</CardTitle>
              <CardDescription>Upload construction plans, mud maps, or drawings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mudMap">Mud Map / Site Drawing</Label>
                <div className="mt-2 flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("mudMapInput")?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {mudMapFile ? "Change File" : "Upload File"}
                  </Button>
                  {mudMapFile && (
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {mudMapFile.name}
                    </span>
                  )}
                  <input
                    id="mudMapInput"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => setMudMapFile(e.target.files?.[0] || null)}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload a photo of hand-drawn measurements or site sketch
                </p>
              </div>

              <div>
                <Label htmlFor="constructionPlans">Construction Plans</Label>
                <div className="mt-2 flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("plansInput")?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {constructionPlansFile ? "Change File" : "Upload File"}
                  </Button>
                  {constructionPlansFile && (
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {constructionPlansFile.name}
                    </span>
                  )}
                  <input
                    id="plansInput"
                    type="file"
                    accept=".pdf,.dwg,.dxf"
                    className="hidden"
                    onChange={(e) => setConstructionPlansFile(e.target.files?.[0] || null)}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload architectural plans or CAD drawings (PDF, DWG, DXF)
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> You can also use the{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => navigate("/site-measurement")}
                  >
                    Venturr Measurement Tool
                  </button>
                  {" "}to draw measurements directly on satellite imagery
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              disabled={isAnalyzing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Project...
                </>
              ) : (
                "Analyze Project"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

