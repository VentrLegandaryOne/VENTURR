import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Award,
  FileCheck,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Building2,
  RefreshCw,
  Loader2,
  Eye,
  Download,
  Trash2,
  Plus,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Sample credential data
const sampleCredentials = {
  abn: {
    number: "12 345 678 901",
    businessName: "Smith Electrical Services Pty Ltd",
    status: "active",
    gstRegistered: true,
    verifiedAt: "2024-12-01T10:00:00Z",
  },
  license: {
    number: "EC12345",
    state: "NSW",
    type: "Electrical Contractor",
    expiryDate: "2025-06-30",
    status: "active",
    verifiedAt: "2024-12-01T10:00:00Z",
  },
  insurance: {
    publicLiability: {
      provider: "QBE Insurance",
      policyNumber: "PL-2024-12345",
      coverage: 20000000,
      expiryDate: "2025-03-15",
      status: "active",
      documentUrl: "#",
    },
    workersComp: {
      provider: "icare NSW",
      policyNumber: "WC-2024-67890",
      expiryDate: "2025-01-31",
      status: "expiring_soon",
      documentUrl: "#",
    },
  },
  certifications: [
    {
      id: 1,
      name: "Certificate III in Electrotechnology Electrician",
      issuer: "TAFE NSW",
      issueDate: "2015-06-15",
      expiryDate: null,
      status: "active",
      documentUrl: "#",
    },
    {
      id: 2,
      name: "Working at Heights",
      issuer: "SafeWork NSW",
      issueDate: "2023-08-20",
      expiryDate: "2025-08-20",
      status: "active",
      documentUrl: "#",
    },
    {
      id: 3,
      name: "Asbestos Awareness",
      issuer: "SafeWork NSW",
      issueDate: "2022-03-10",
      expiryDate: "2024-03-10",
      status: "expired",
      documentUrl: "#",
    },
  ],
};

// Australian states
const australianStates = [
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "SA", label: "South Australia" },
  { value: "WA", label: "Western Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "NT", label: "Northern Territory" },
  { value: "ACT", label: "Australian Capital Territory" },
];

export default function ContractorCredentials() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddCertDialog, setShowAddCertDialog] = useState(false);
  const [newCertification, setNewCertification] = useState({
    name: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
  });

  const getStatusBadge = (status: string, expiryDate?: string) => {
    // Check if expiring soon (within 30 days)
    if (expiryDate) {
      const daysUntilExpiry = Math.ceil(
        (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry <= 0) {
        return <Badge variant="destructive">Expired</Badge>;
      }
      if (daysUntilExpiry <= 30) {
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Expiring Soon</Badge>;
      }
    }

    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Pending Verification</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "expiring_soon":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Expiring Soon</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleRefreshVerification = async (type: string) => {
    setIsUpdating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success(`${type} verification refreshed successfully`);
    setIsUpdating(false);
  };

  const handleAddCertification = async () => {
    if (!newCertification.name || !newCertification.issuer || !newCertification.issueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Certification added successfully. Pending verification.");
    setShowAddCertDialog(false);
    setNewCertification({ name: "", issuer: "", issueDate: "", expiryDate: "" });
    setIsUpdating(false);
  };

  const calculateProfileCompleteness = () => {
    let score = 0;
    if (sampleCredentials.abn.status === "active") score += 25;
    if (sampleCredentials.license.status === "active") score += 25;
    if (sampleCredentials.insurance.publicLiability.status === "active") score += 25;
    if (sampleCredentials.certifications.some((c) => c.status === "active")) score += 25;
    return score;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 triangle-pattern opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              <Shield className="w-3 h-3 mr-1" />
              Credential Management
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Manage Your Credentials
            </h1>
            <p className="text-muted-foreground">
              Keep your ABN, license, insurance, and certifications up to date to maintain your verified status.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Profile Completeness */}
      <section className="py-4">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Profile Completeness</span>
                <span className="text-2xl font-bold text-primary">{calculateProfileCompleteness()}%</span>
              </div>
              <Progress value={calculateProfileCompleteness()} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {calculateProfileCompleteness() === 100
                  ? "Your profile is complete and fully verified!"
                  : "Complete all sections to achieve 100% profile completeness."}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="license">License</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ABN Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        ABN Details
                      </CardTitle>
                      {getStatusBadge(sampleCredentials.abn.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">ABN</Label>
                      <p className="font-mono font-medium">{sampleCredentials.abn.number}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Business Name</Label>
                      <p className="font-medium">{sampleCredentials.abn.businessName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">GST Registered</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last verified: {new Date(sampleCredentials.abn.verifiedAt).toLocaleDateString("en-AU")}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleRefreshVerification("ABN")}
                      disabled={isUpdating}
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                      Refresh Verification
                    </Button>
                  </CardFooter>
                </Card>

                {/* License Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Trade License
                      </CardTitle>
                      {getStatusBadge(sampleCredentials.license.status, sampleCredentials.license.expiryDate)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">License Number</Label>
                      <p className="font-mono font-medium">{sampleCredentials.license.number}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Type</Label>
                      <p className="font-medium">{sampleCredentials.license.type}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <Label className="text-muted-foreground text-xs">State</Label>
                        <p className="font-medium">{sampleCredentials.license.state}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Expires</Label>
                        <p className="font-medium">{new Date(sampleCredentials.license.expiryDate).toLocaleDateString("en-AU")}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("license")}>
                      <Edit className="w-4 h-4 mr-2" />
                      Update License
                    </Button>
                  </CardFooter>
                </Card>

                {/* Public Liability Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Public Liability
                      </CardTitle>
                      {getStatusBadge(sampleCredentials.insurance.publicLiability.status, sampleCredentials.insurance.publicLiability.expiryDate)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">Provider</Label>
                      <p className="font-medium">{sampleCredentials.insurance.publicLiability.provider}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Coverage</Label>
                      <p className="font-medium">${(sampleCredentials.insurance.publicLiability.coverage / 1000000).toFixed(0)} Million</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Expires</Label>
                      <p className="font-medium">{new Date(sampleCredentials.insurance.publicLiability.expiryDate).toLocaleDateString("en-AU")}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("insurance")}>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Insurance
                    </Button>
                  </CardFooter>
                </Card>

                {/* Workers Comp Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileCheck className="w-5 h-5" />
                        Workers Compensation
                      </CardTitle>
                      {getStatusBadge(sampleCredentials.insurance.workersComp.status, sampleCredentials.insurance.workersComp.expiryDate)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">Provider</Label>
                      <p className="font-medium">{sampleCredentials.insurance.workersComp.provider}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Policy Number</Label>
                      <p className="font-mono font-medium">{sampleCredentials.insurance.workersComp.policyNumber}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Expires</Label>
                      <p className="font-medium text-amber-600">{new Date(sampleCredentials.insurance.workersComp.expiryDate).toLocaleDateString("en-AU")}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Alert className="bg-amber-500/10 border-amber-500/20">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <AlertDescription className="text-amber-600 text-xs">
                        Expires in {Math.ceil((new Date(sampleCredentials.insurance.workersComp.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days. Please renew soon.
                      </AlertDescription>
                    </Alert>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            {/* License Tab */}
            <TabsContent value="license">
              <Card>
                <CardHeader>
                  <CardTitle>Update Trade License</CardTitle>
                  <CardDescription>
                    Update your license details when you renew or if any information changes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        defaultValue={sampleCredentials.license.number}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseState">State</Label>
                      <Select defaultValue={sampleCredentials.license.state}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {australianStates.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseExpiry">Expiry Date</Label>
                    <Input
                      id="licenseExpiry"
                      type="date"
                      defaultValue={sampleCredentials.license.expiryDate}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Upload License Document</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your license document, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, JPG, or PNG up to 10MB
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" className="flex-1">Cancel</Button>
                  <Button className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Insurance Tab */}
            <TabsContent value="insurance">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Public Liability Insurance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Insurance Provider</Label>
                        <Input defaultValue={sampleCredentials.insurance.publicLiability.provider} />
                      </div>
                      <div className="space-y-2">
                        <Label>Policy Number</Label>
                        <Input defaultValue={sampleCredentials.insurance.publicLiability.policyNumber} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Coverage Amount</Label>
                        <Select defaultValue="20000000">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5000000">$5 Million</SelectItem>
                            <SelectItem value="10000000">$10 Million</SelectItem>
                            <SelectItem value="20000000">$20 Million</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input type="date" defaultValue={sampleCredentials.insurance.publicLiability.expiryDate} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Upload Certificate of Currency</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Upload your Certificate of Currency</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Update Public Liability
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Workers Compensation Insurance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Insurance Provider</Label>
                        <Input defaultValue={sampleCredentials.insurance.workersComp.provider} />
                      </div>
                      <div className="space-y-2">
                        <Label>Policy Number</Label>
                        <Input defaultValue={sampleCredentials.insurance.workersComp.policyNumber} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry Date</Label>
                      <Input type="date" defaultValue={sampleCredentials.insurance.workersComp.expiryDate} />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Update Workers Compensation
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            {/* Certifications Tab */}
            <TabsContent value="certifications">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Certifications & Qualifications</CardTitle>
                      <CardDescription>
                        Manage your trade certifications and professional qualifications.
                      </CardDescription>
                    </div>
                    <Dialog open={showAddCertDialog} onOpenChange={setShowAddCertDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Certification
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Certification</DialogTitle>
                          <DialogDescription>
                            Enter the details of your certification. You'll need to upload supporting documentation.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="certName">Certification Name</Label>
                            <Input
                              id="certName"
                              placeholder="e.g., Certificate III in Electrotechnology"
                              value={newCertification.name}
                              onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="certIssuer">Issuing Organization</Label>
                            <Input
                              id="certIssuer"
                              placeholder="e.g., TAFE NSW"
                              value={newCertification.issuer}
                              onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="certIssueDate">Issue Date</Label>
                              <Input
                                id="certIssueDate"
                                type="date"
                                value={newCertification.issueDate}
                                onChange={(e) => setNewCertification({ ...newCertification, issueDate: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="certExpiryDate">Expiry Date (if applicable)</Label>
                              <Input
                                id="certExpiryDate"
                                type="date"
                                value={newCertification.expiryDate}
                                onChange={(e) => setNewCertification({ ...newCertification, expiryDate: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowAddCertDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddCertification} disabled={isUpdating}>
                            {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                            Add Certification
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sampleCredentials.certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Award className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{cert.name}</h4>
                              {getStatusBadge(cert.status, cert.expiryDate || undefined)}
                            </div>
                            <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>Issued: {new Date(cert.issueDate).toLocaleDateString("en-AU")}</span>
                              {cert.expiryDate && (
                                <span>Expires: {new Date(cert.expiryDate).toLocaleDateString("en-AU")}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Reminder Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Upcoming Renewals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="font-medium">Workers Compensation Insurance</p>
                      <p className="text-sm text-muted-foreground">Expires January 31, 2025</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Renew Now
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium">Asbestos Awareness Certification</p>
                      <p className="text-sm text-muted-foreground">Expired March 10, 2024</p>
                    </div>
                  </div>
                  <Button size="sm" variant="destructive">
                    Update Required
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
