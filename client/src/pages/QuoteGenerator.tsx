import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, FileText, Loader2, Plus, Save, Trash2, Eye } from "lucide-react";
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  // Load data from latest takeoff if available
  useEffect(() => {
    if (takeoffs && takeoffs.length > 0) {
      const latestTakeoff = takeoffs[0];
      try {
        const calculations = JSON.parse(latestTakeoff.calculations || "{}");
        
        // Check if this is a labor calculator result (has laborDetails)
        if (calculations.laborDetails) {
          // Create detailed line items from labor calculator
          const items: LineItem[] = [];
          
          // Materials line item
          if (calculations.materialCost) {
            items.push({
              id: nanoid(),
              description: `Materials - ${latestTakeoff.roofType} (${latestTakeoff.roofArea}m²)`,
              quantity: "1",
              unitPrice: calculations.materialCost.toFixed(2),
              total: calculations.materialCost,
            });
          }
          
          // Labor installation line item
          if (calculations.laborDetails.installationHours) {
            const installCost = (calculations.laborDetails.installationHours || 0) * calculations.laborDetails.hourlyRate;
            items.push({
              id: nanoid(),
              description: `Labor - Installation (${calculations.laborDetails.installationHours.toFixed(1)} hrs @ $${calculations.laborDetails.hourlyRate.toFixed(2)}/hr)`,
              quantity: "1",
              unitPrice: installCost.toFixed(2),
              total: installCost,
            });
          }
          
          // Labor removal line item (if applicable)
          if (calculations.laborDetails.removalHours && calculations.laborDetails.removalHours > 0) {
            const removalCost = calculations.laborDetails.removalHours * calculations.laborDetails.hourlyRate;
            items.push({
              id: nanoid(),
              description: `Labor - Existing Roof Removal (${calculations.laborDetails.removalHours.toFixed(1)} hrs @ $${calculations.laborDetails.hourlyRate.toFixed(2)}/hr)`,
              quantity: "1",
              unitPrice: removalCost.toFixed(2),
              total: removalCost,
            });
          }
          
          setLineItems(items);
          
          // Add project details to notes
          const projectNotes = `Project Details:
- Roof Area: ${latestTakeoff.roofArea}m²
- Crew: ${calculations.laborDetails.crew}
- Region: ${calculations.laborDetails.region}
- Estimated Duration: ${calculations.laborDetails.daysRequired} days${calculations.laborDetails.weatherDelayDays ? ` (includes ${calculations.laborDetails.weatherDelayDays} day weather buffer)` : ''}
- Labor Rate: $${calculations.laborDetails.hourlyRate.toFixed(2)}/hr (includes all on-costs)`;
          
          setFormData(prev => ({ ...prev, notes: projectNotes }));
        } else if (calculations.grandTotal) {
          // Fallback to simple single line item for basic takeoffs
          setLineItems([
            {
              id: nanoid(),
              description: `Roof Replacement - ${latestTakeoff.roofType} (${latestTakeoff.roofArea}m²)`,
              quantity: "1",
              unitPrice: calculations.grandTotal.toFixed(2),
              total: calculations.grandTotal,
            },
          ]);
        }
      } catch (e) {
        console.error("Failed to parse takeoff calculations", e);
      }
    }
  }, [takeoffs]);

  const addLineItem = () => {
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

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string) => {
    setLineItems(
      lineItems.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            const qty = parseFloat(updated.quantity) || 0;
            const price = parseFloat(updated.unitPrice) || 0;
            updated.total = qty * price;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const gst = subtotal * 0.1;
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const { subtotal, gst, total } = calculateTotals();

  const handleDownloadPDF = async () => {
    if (!project) return;
    
    const quoteNumber = `VEN-${Date.now()}`;
    const { subtotal, gst, total } = calculateTotals();
    const filename = `Quote-${quoteNumber}-${project.title.replace(/\s+/g, '-')}.pdf`;
    
    await downloadQuotePDF(
      {
        quoteNumber,
        validUntil: formData.validUntil,
        subtotal: subtotal.toFixed(2),
        gst: gst.toFixed(2),
        total: total.toFixed(2),
        terms: formData.terms,
        notes: formData.notes,
        items: JSON.stringify(lineItems),
      },
      {
        title: project.title,
        address: project.address || undefined,
        clientName: project.clientName || undefined,
        clientEmail: project.clientEmail || undefined,
        clientPhone: project.clientPhone || undefined,
      },
      {
        name: businessSettings.businessName || selectedOrg?.name || 'Venturr',
        abn: businessSettings.abn,
        address: businessSettings.address,
        phone: businessSettings.phone,
        email: businessSettings.email,
        tagline: businessSettings.tagline || 'Professional Trade Solutions',
        logoUrl: businessSettings.logoUrl,
      },
      filename
    );
    toast.success("PDF downloaded successfully");
  };

  const handleSave = async () => {
    if (!projectId) return;

    if (lineItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    const quoteNumber = `Q-${Date.now().toString().slice(-8)}`;

    await createQuoteMutation.mutateAsync({
      projectId,
      quoteNumber,
      subtotal: subtotal.toFixed(2),
      gst: gst.toFixed(2),
      total: total.toFixed(2),
      validUntil: formData.validUntil,
      terms: formData.terms,
      notes: formData.notes,
      items: JSON.stringify(lineItems),
    });
  };

  const handlePreview = () => {
    // Open print dialog for browser-based PDF
    window.print();
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
      <header className="bg-white border-b border-slate-200 print:hidden">
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
              <h1 className="text-2xl font-bold text-slate-900">Quote Generator</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button
                onClick={handleSave}
                disabled={createQuoteMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createQuoteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Quote
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Quote Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Quotation</CardTitle>
                {project && (
                  <div className="space-y-1 text-sm text-slate-600">
                    <div className="font-semibold">{project.title}</div>
                    <div>{project.address}</div>
                    {project.clientName && <div>Attention: {project.clientName}</div>}
                  </div>
                )}
              </div>
              <div className="text-right text-sm">
                <div className="font-semibold">ThomCo Roofing</div>
                <div className="text-slate-600">Professional Roofing Solutions</div>
                <div className="text-slate-600 mt-2">Date: {new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Line Items */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>Add items to the quote</CardDescription>
              </div>
              <Button onClick={addLineItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-start p-4 border rounded-lg">
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor={`desc-${item.id}`}>Description</Label>
                      <Input
                        id={`desc-${item.id}`}
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`qty-${item.id}`}>Quantity</Label>
                        <Input
                          id={`qty-${item.id}`}
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, "quantity", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`price-${item.id}`}>Unit Price ($)</Label>
                        <Input
                          id={`price-${item.id}`}
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, "unitPrice", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Total</Label>
                        <div className="h-10 flex items-center font-semibold">
                          ${item.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {lineItems.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t">
              <div className="max-w-sm ml-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">GST (10%):</span>
                  <span className="font-semibold">${gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                rows={10}
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Any additional notes or special conditions..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Print-Only Version */}
      <div className="hidden print:block quote-print-container">
        {/* Header */}
        <div className="quote-header">
          <div className="quote-logo">{businessSettings.businessName || selectedOrg?.name || 'Venturr'}</div>
          <div className="quote-company-info">{businessSettings.tagline || 'Professional Trade Solutions'}</div>
          {businessSettings.abn && <div className="quote-company-info">ABN: {businessSettings.abn}</div>}
          {businessSettings.phone && <div className="quote-company-info">Phone: {businessSettings.phone}</div>}
          {businessSettings.email && <div className="quote-company-info">Email: {businessSettings.email}</div>}
        </div>

        {/* Title */}
        <div className="quote-title">QUOTATION</div>

        {/* Quote Details */}
        <div className="quote-section">
          <div className="quote-row">
            <div className="quote-label">Quote Number:</div>
            <div className="quote-value">VEN-{Date.now()}</div>
          </div>
          <div className="quote-row">
            <div className="quote-label">Date:</div>
            <div className="quote-value">{new Date().toLocaleDateString('en-AU')}</div>
          </div>
          <div className="quote-row">
            <div className="quote-label">Valid Until:</div>
            <div className="quote-value">{new Date(formData.validUntil).toLocaleDateString('en-AU')}</div>
          </div>
        </div>

        {/* Project Details */}
        {project && (
          <div className="quote-section">
            <div className="quote-section-title">Project Details</div>
            <div className="quote-row">
              <div className="quote-label">Project:</div>
              <div className="quote-value">{project.title}</div>
            </div>
            {project.address && (
              <div className="quote-row">
                <div className="quote-label">Address:</div>
                <div className="quote-value">{project.address}</div>
              </div>
            )}
          </div>
        )}

        {/* Client Details */}
        {project?.clientName && (
          <div className="quote-section">
            <div className="quote-section-title">Client Details</div>
            <div className="quote-row">
              <div className="quote-label">Name:</div>
              <div className="quote-value">{project.clientName}</div>
            </div>
            {project.clientEmail && (
              <div className="quote-row">
                <div className="quote-label">Email:</div>
                <div className="quote-value">{project.clientEmail}</div>
              </div>
            )}
            {project.clientPhone && (
              <div className="quote-row">
                <div className="quote-label">Phone:</div>
                <div className="quote-value">{project.clientPhone}</div>
              </div>
            )}
          </div>
        )}

        {/* Line Items Table */}
        <table className="quote-table">
          <thead>
            <tr>
              <th style={{width: '50%'}}>Description</th>
              <th style={{width: '15%'}} className="text-right">Qty</th>
              <th style={{width: '15%'}} className="text-right">Unit Price</th>
              <th style={{width: '20%'}} className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">${parseFloat(item.unitPrice).toFixed(2)}</td>
                <td className="text-right">${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="quote-totals">
          <div className="quote-total-row">
            <div>Subtotal:</div>
            <div>${subtotal.toFixed(2)}</div>
          </div>
          <div className="quote-total-row">
            <div>GST (10%):</div>
            <div>${gst.toFixed(2)}</div>
          </div>
          <div className="quote-grand-total">
            <div>TOTAL:</div>
            <div>${total.toFixed(2)}</div>
          </div>
        </div>

        {/* Terms & Conditions */}
        {formData.terms && (
          <div className="quote-terms">
            <div className="quote-terms-title">Terms & Conditions</div>
            <div className="quote-terms-text">{formData.terms}</div>
          </div>
        )}

        {/* Notes */}
        {formData.notes && (
          <div className="quote-section">
            <div className="quote-section-title">Additional Notes</div>
            <div className="quote-terms-text">{formData.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div className="quote-footer">
          <div>{businessSettings.businessName || selectedOrg?.name || 'Venturr'} | {businessSettings.tagline || 'Professional Trade Solutions'}</div>
          <div>This quotation is valid for 30 days from the date of issue</div>
        </div>
      </div>
    </div>
  );
}

