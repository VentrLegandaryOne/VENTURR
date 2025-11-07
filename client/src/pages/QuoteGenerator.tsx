import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, FileText, Loader2, Plus, Save, Trash2, Eye, Sparkles, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { downloadQuotePDF } from "@/lib/pdfGenerator";

interface LineItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: number;
}

export default function QuoteGenerator() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/projects/:id/quote");
  const projectId = params?.id;

  const { data: project } = trpc.projects.get.useQuery(
    { id: projectId! },
    { enabled: !!projectId }
  );

  const { data: organizations } = trpc.organizations.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const selectedOrg = organizations?.[0];
  const businessSettings = selectedOrg?.metadata ? JSON.parse(selectedOrg.metadata) : {};

  const { data: takeoffs } = trpc.takeoffs.list.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  // Query labor calculations for this project
  const { data: laborCalculations } = trpc.takeoffs.list.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  const createQuoteMutation = trpc.quotes.create.useMutation({
    onSuccess: () => {
      toast.success("Quote created successfully");
      if (projectId) {
        setLocation(`/projects/${projectId}`);
      }
    },
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: nanoid(),
      description: "Roof Replacement - Complete Installation",
      quantity: "1",
      unitPrice: "0",
      total: 0,
    },
  ]);

  const [formData, setFormData] = useState({
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] as string,
    terms: `Payment Terms:
- 30% deposit upon acceptance
- 40% upon material delivery
- 30% upon completion

Warranty:
- 10 years workmanship warranty
- Manufacturer's warranty on materials

Exclusions:
- Structural repairs
- Electrical work
- Asbestos removal (if required)

Validity: 30 days from quote date`,
    notes: "",
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  // Load data from latest takeoff if available
  useEffect(() => {
    if (takeoffs && takeoffs.length > 0) {
      const latestTakeoff = takeoffs[0];
      if (latestTakeoff.calculationData) {
        try {
          const data = JSON.parse(latestTakeoff.calculationData);
          setLineItems([
            {
              id: nanoid(),
              description: "Roof Replacement - Materials & Labor",
              quantity: "1",
              unitPrice: data.grandTotal?.toString() || "0",
              total: data.grandTotal || 0,
            },
          ]);
        } catch (error) {
          console.error("Failed to parse takeoff data:", error);
        }
      }
    }
  }, [takeoffs]);

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: nanoid(),
        description: "",
        quantity: "1",
        unitPrice: "0",
        total: 0,
      },
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const handleUpdateLineItem = (id: string, field: keyof LineItem, value: string) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          const qty = parseFloat(updated.quantity) || 0;
          const price = parseFloat(updated.unitPrice) || 0;
          updated.total = qty * price;
        }
        return updated;
      })
    );
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const gst = subtotal * 0.1;
  const total = subtotal + gst;

  const handleSave = async () => {
    if (!projectId || lineItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    setIsSaving(true);
    try {
      await createQuoteMutation.mutateAsync({
        projectId,
        quoteData: JSON.stringify({
          lineItems,
          subtotal,
          gst,
          total,
          validUntil: formData.validUntil,
          terms: formData.terms,
          notes: formData.notes,
        }),
        totalAmount: total,
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
          <p className="text-slate-700">Loading quote generator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50 relative">
      {/* Futuristic Chequered Background */}
      <div className="background-glow fixed inset-0 z-0" />
      
      {/* Header */}
      <header className="relative z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-lg shadow-purple-500/10 sticky top-0">
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  Quote Generator
                </h1>
                <p className="text-sm text-slate-500">Create professional quotes for your clients</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
                className="hover:border-purple-300 hover:bg-purple-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
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
                    Save Quote
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeInUp">
          {/* Editor Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quote Header */}
            <Card className="shadow-lg border-purple-200/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Quote Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Quote Number</Label>
                    <Input
                      disabled
                      value={`QT-${Date.now().toString().slice(-6)}`}
                      className="mt-2 bg-slate-50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Valid Until</Label>
                    <Input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>

                {project && (
                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium mb-2">Project</p>
                    <p className="font-semibold text-slate-900">{project.title}</p>
                    {project.address && (
                      <p className="text-sm text-slate-600 mt-1">{project.address}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card className="shadow-lg border-blue-200/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Line Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                        <div className="md:col-span-2">
                          <Label className="text-xs font-medium text-slate-500">Description</Label>
                          <Input
                            placeholder="e.g., Roof replacement materials"
                            value={item.description}
                            onChange={(e) => handleUpdateLineItem(item.id, "description", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-slate-500">Qty</Label>
                          <Input
                            type="number"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateLineItem(item.id, "quantity", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-slate-500">Unit Price</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateLineItem(item.id, "unitPrice", e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex flex-col">
                          <Label className="text-xs font-medium text-slate-500">Total</Label>
                          <div className="mt-1 p-2 rounded bg-slate-50 text-sm font-semibold text-slate-900">
                            ${item.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleRemoveLineItem(item.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleAddLineItem}
                  variant="outline"
                  className="w-full border-blue-300 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line Item
                </Button>
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card className="shadow-lg border-green-200/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter terms and conditions..."
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="min-h-32"
                />
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card className="shadow-lg border-orange-200/50 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add any additional notes for the client..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="min-h-24"
                />
              </CardContent>
            </Card>
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="space-y-4 sticky top-24">
              {/* Total Summary */}
              <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-purple-600 to-purple-700 text-white">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-purple-100 text-sm">Quote Total</p>
                      <p className="text-4xl font-bold">${total.toLocaleString('en-AU', { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="space-y-2 text-sm border-t border-purple-400/30 pt-4">
                      <div className="flex justify-between">
                        <span className="text-purple-100">Subtotal:</span>
                        <span className="font-semibold">${subtotal.toLocaleString('en-AU', { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-100">GST (10%):</span>
                        <span className="font-semibold">${gst.toLocaleString('en-AU', { maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="shadow-lg border-slate-200">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium">Line Items</p>
                      <p className="text-2xl font-bold text-blue-900">{lineItems.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                      <p className="text-xs text-purple-600 font-medium">Valid Until</p>
                      <p className="text-sm font-semibold text-purple-900">{formData.validUntil}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-xs text-green-600 font-medium">Status</p>
                      <p className="text-sm font-semibold text-green-900 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Ready to Save
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => downloadQuotePDF(lineItems, subtotal, gst, total, project?.title || "Quote")}
                  variant="outline"
                  className="w-full border-blue-300 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={() => setLocation(`/projects/${projectId}`)}
                  variant="outline"
                  className="w-full"
                >
                  Back to Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

