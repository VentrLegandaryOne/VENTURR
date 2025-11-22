import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  BookOpen,
  Shield,
  Hammer,
  Wind,
  Flame
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Compliance() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/projects/:id/compliance");
  const projectId = params?.id;

  const { data: project } = trpc.projects.get.useQuery(
    { id: projectId! },
    { enabled: !!projectId }
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/";
    }
  }, [authLoading, isAuthenticated]);

  const australianStandards = [
    {
      code: "AS 1562.1:2018",
      title: "Design and installation of sheet roof and wall cladding - Metal",
      icon: Hammer,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Covers the design and installation requirements for metal sheet roof and wall cladding systems.",
      keyRequirements: [
        "Minimum roof pitch requirements (typically 5° for standard profiles)",
        "Fastener spacing and type specifications",
        "Overlap and side lap requirements",
        "Penetration and flashing details",
        "Expansion and contraction allowances",
        "Load capacity calculations",
      ],
      applicableWhen: [
        "Installing Colorbond or Zincalume roofing",
        "Metal wall cladding installation",
        "Re-roofing with metal sheets",
        "Commercial and residential metal roofing",
      ],
    },
    {
      code: "AS/NZS 1170.2:2021",
      title: "Structural design actions - Wind actions",
      icon: Wind,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      description: "Specifies wind loads for structural design, critical for roof and cladding systems.",
      keyRequirements: [
        "Wind classification zones (N1-N6, C1-C4)",
        "Wind pressure calculations for roof surfaces",
        "Cyclone-rated fastening requirements",
        "Edge and corner zone load factors",
        "Terrain category classifications",
        "Building height and shielding factors",
      ],
      applicableWhen: [
        "Designing roof structures in high-wind areas",
        "Cyclone-prone regions (Queensland, NT, WA coast)",
        "Coastal installations within 1km of ocean",
        "Buildings over 8.5m height",
      ],
    },
    {
      code: "AS 3959:2018",
      title: "Construction of buildings in bushfire-prone areas",
      icon: Flame,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Requirements for construction in bushfire-prone areas to reduce fire risk.",
      keyRequirements: [
        "Bushfire Attack Level (BAL) ratings (BAL-LOW to BAL-FZ)",
        "Non-combustible roofing material requirements",
        "Ember guard specifications for roof penetrations",
        "Gutter and downpipe specifications",
        "Roof-to-wall junction sealing",
        "Minimum metal thickness requirements",
      ],
      applicableWhen: [
        "Properties in designated bushfire-prone areas",
        "Rural and semi-rural developments",
        "Areas within 100m of bushland",
        "Council-designated BAL zones",
      ],
    },
    {
      code: "NCC 2022",
      title: "National Construction Code - Volume One & Two",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "National building requirements including weatherproofing, structural, and safety standards.",
      keyRequirements: [
        "Weatherproofing and water ingress prevention (Section 3.5)",
        "Structural performance requirements (Part 3.3)",
        "Fire resistance levels for roof assemblies",
        "Condensation management requirements",
        "Roof space ventilation standards",
        "Safe working load requirements for roof access",
      ],
      applicableWhen: [
        "All new construction and renovations",
        "Building permit applications",
        "Council compliance submissions",
        "Insurance and warranty documentation",
      ],
    },
  ];

  const installationNotes = {
    metalRoofing: [
      {
        category: "Pre-Installation",
        items: [
          "Verify roof pitch meets minimum requirements (typically 5° for standard profiles)",
          "Check substrate condition and load-bearing capacity",
          "Ensure adequate fall for water drainage (minimum 1:40)",
          "Confirm all penetrations and services are marked",
          "Verify sarking/underlay installation if required",
        ],
      },
      {
        category: "Fastening Requirements",
        items: [
          "Use Class 3 or Class 4 screws with bonded washers",
          "Fastener spacing: 750mm for purlins, 1200mm for sheeting",
          "Drive fasteners perpendicular to roof surface",
          "Ensure washers compress but don't over-tighten",
          "Minimum 15mm edge distance from sheet edges",
          "Use stitch screws at 500mm centers for side laps",
        ],
      },
      {
        category: "Overlaps and Joints",
        items: [
          "End laps: minimum 150mm (200mm for pitches under 10°)",
          "Side laps: minimum one full corrugation",
          "Apply sealant to all end laps in exposed conditions",
          "Stagger end laps across roof width",
          "Ensure water flow direction over laps",
        ],
      },
      {
        category: "Flashings and Penetrations",
        items: [
          "Install valley flashings before roof sheets",
          "Ridge capping: minimum 100mm coverage each side",
          "Penetration flashings: use proprietary systems or custom-made",
          "Maintain minimum 50mm clearance to combustible materials",
          "Install bird-proof mesh at all open edges",
          "Seal all penetrations with compatible sealant",
        ],
      },
      {
        category: "Safety and Quality",
        items: [
          "Install roof safety mesh or edge protection",
          "Remove all metal swarf immediately (prevents rust staining)",
          "Touch up any scratches or cut edges with paint",
          "Install temporary fall protection during installation",
          "Clean gutters and downpipes before handover",
          "Provide maintenance guide to client",
        ],
      },
    ],
  };

  const complianceChecklist = [
    { item: "Building permit obtained", category: "Legal" },
    { item: "Wind classification verified for location", category: "Structural" },
    { item: "Bushfire Attack Level (BAL) rating confirmed if applicable", category: "Fire Safety" },
    { item: "Roof pitch meets AS 1562.1 minimum requirements", category: "Design" },
    { item: "Substrate load capacity verified", category: "Structural" },
    { item: "Sarking/underlay installed per NCC requirements", category: "Weatherproofing" },
    { item: "Correct fastener type and spacing per AS 1562.1", category: "Installation" },
    { item: "All flashings installed per manufacturer specifications", category: "Weatherproofing" },
    { item: "Penetrations sealed and compliant", category: "Weatherproofing" },
    { item: "Roof safety systems installed (if required)", category: "Safety" },
    { item: "Warranty documentation provided", category: "Legal" },
    { item: "Maintenance guide provided to client", category: "Documentation" },
  ];

  const handleGenerateComplianceReport = () => {
    toast.success("Compliance report generation coming soon!");
    // TODO: Implement PDF generation with all compliance documentation
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 relative">
      {/* Futuristic Chequered Background */}
      <div className="background-glow fixed inset-0 z-0" />
      
      {/* Header */}
      <header className="relative z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-lg shadow-purple-500/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation(projectId ? `/projects/${projectId}` : "/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Compliance Documentation</h1>
                {project && (
                  <p className="text-sm text-slate-600">{project.title}</p>
                )}
              </div>
            </div>
            <Button onClick={handleGenerateComplianceReport}>
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-2">
        <Tabs defaultValue="standards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="standards">Australian Standards</TabsTrigger>
            <TabsTrigger value="installation">Installation Notes</TabsTrigger>
            <TabsTrigger value="checklist">Compliance Checklist</TabsTrigger>
          </TabsList>

          {/* Australian Standards Tab */}
          <TabsContent value="standards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Applicable Australian Standards
                </CardTitle>
                <CardDescription>
                  Key building codes and standards for metal roofing installation in Australia
                </CardDescription>
              </CardHeader>
            </Card>

            {australianStandards.map((standard, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${standard.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <standard.icon className={`w-6 h-6 ${standard.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{standard.code}</CardTitle>
                        <CardDescription className="text-base font-medium text-slate-700 mt-1">
                          {standard.title}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600">{standard.description}</p>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Key Requirements:</h4>
                    <ul className="space-y-1">
                      {standard.keyRequirements.map((req, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-600">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Applicable When:</h4>
                    <ul className="space-y-1">
                      {standard.applicableWhen.map((when, idx) => (
                        <li key={idx} className="flex items-start">
                          <AlertTriangle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-600">{when}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Installation Notes Tab */}
          <TabsContent value="installation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hammer className="w-5 h-5 mr-2 text-blue-600" />
                  Metal Roofing Installation Guidelines
                </CardTitle>
                <CardDescription>
                  Comprehensive installation notes for metal roofing systems
                </CardDescription>
              </CardHeader>
            </Card>

            {installationNotes.metalRoofing.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Compliance Checklist Tab */}
          <TabsContent value="checklist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Pre-Installation & Completion Checklist
                </CardTitle>
                <CardDescription>
                  Ensure all compliance requirements are met before and after installation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceChecklist.map((check, index) => (
                    <label
                      key={index}
                      className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <span className="text-sm font-medium text-slate-900">{check.item}</span>
                        <span className="ml-2 text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                          {check.category}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Important Note</h4>
                    <p className="text-sm text-blue-800">
                      This checklist is a guide only. Always refer to the specific Australian Standards,
                      local council requirements, and manufacturer specifications for your project.
                      Consult with a licensed building surveyor if unsure about compliance requirements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

