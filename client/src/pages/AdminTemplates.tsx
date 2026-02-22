import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, DollarSign, FileText, Shield } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useLocation } from "wouter";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

export default function AdminTemplates() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Redirect if not admin
  if (user && user.role !== "admin") {
    setLocation("/");
    return null;
  }

  const { data: templates = [], isLoading, error: errorTemplates } = trpc.templates.list.useQuery({
    category: selectedCategory === "all" ? undefined : selectedCategory,
  }, { retry: 2 });

  const { data: categories = [], error: errorCategories } = trpc.templates.getCategories.useQuery(undefined, { retry: 2 });

  const utils = trpc.useUtils();
  const deleteMutation = trpc.templates.delete.useMutation({
    onSuccess: () => {
      utils.templates.list.invalidate();
      alert("Template deleted successfully");
    },
    onError: (error) => {
      alert(`Error deleting template: ${error.message}`);
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-sky-600 bg-clip-text text-transparent">
              Template Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage quote templates for common construction projects
            </p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
              </DialogHeader>
              <CreateTemplateForm onSuccess={() => setIsCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <Badge variant="secondary">{template.category}</Badge>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(template.id, template.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {template.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="font-semibold">
                    {(template.estimatedCost / 100).toLocaleString("en-AU", {
                      style: "currency",
                      currency: "AUD",
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    Used {template.usageCount} times
                  </span>
                </div>
                {template.specifications && (
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-primary mt-0.5" />
                    <span className="text-muted-foreground text-xs">
                      {typeof template.specifications === "object" && "standards" in template.specifications
                        ? (template.specifications as any).standards?.length || 0
                        : 0}{" "}
                      standards
                    </span>
                  </div>
                )}
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4">
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{template.name}</DialogTitle>
                  </DialogHeader>
                  <TemplateDetails template={template} />
                </DialogContent>
              </Dialog>
            </Card>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No templates found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateTemplateForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [complianceRequirements, setComplianceRequirements] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  const utils = trpc.useUtils();
  const createMutation = trpc.templates.create.useMutation({
    onSuccess: () => {
      utils.templates.list.invalidate();
      utils.templates.getCategories.invalidate();
      alert("Template created successfully");
      onSuccess();
    },
    onError: (error) => {
      alert(`Error creating template: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const specsObj = JSON.parse(specifications);
      const complianceObj = JSON.parse(complianceRequirements);
      const costInCents = Math.round(parseFloat(estimatedCost) * 100);

      createMutation.mutate({
        name,
        category,
        description,
        specifications: specsObj,
        complianceRequirements: complianceObj,
        estimatedCost: costInCents,
      });
    } catch (error) {
      alert("Invalid JSON in specifications or compliance requirements");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Template Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Colorbond Roof Replacement"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., Roofing, Kitchen, Bathroom"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description of the project..."
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="estimatedCost">Estimated Cost (AUD) *</Label>
        <Input
          id="estimatedCost"
          type="number"
          step="0.01"
          value={estimatedCost}
          onChange={(e) => setEstimatedCost(e.target.value)}
          placeholder="e.g., 45000"
          required
        />
      </div>

      <div>
        <Label htmlFor="specifications">Specifications (JSON) *</Label>
        <Textarea
          id="specifications"
          value={specifications}
          onChange={(e) => setSpecifications(e.target.value)}
          placeholder='{"materials": ["..."], "dimensions": "...", "workmanship": "...", "duration": "...", "standards": ["..."]}'
          rows={6}
          className="font-mono text-sm"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Must include: materials, dimensions, workmanship, duration, standards
        </p>
      </div>

      <div>
        <Label htmlFor="complianceRequirements">Compliance Requirements (JSON) *</Label>
        <Textarea
          id="complianceRequirements"
          value={complianceRequirements}
          onChange={(e) => setComplianceRequirements(e.target.value)}
          placeholder='{"buildingCode": "...", "standards": ["..."], "permits": "...", "insurance": "...", "licensing": "..."}'
          rows={6}
          className="font-mono text-sm"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Must include: buildingCode, standards, permits, insurance, licensing
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating..." : "Create Template"}
        </Button>
      </div>
    </form>
  );
}

function TemplateDetails({ template }: { template: any }) {
  const specs = template.specifications as any;
  const compliance = template.complianceRequirements as any;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Description</h3>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Estimated Cost</h3>
        <p className="text-2xl font-bold text-primary">
          {(template.estimatedCost / 100).toLocaleString("en-AU", {
            style: "currency",
            currency: "AUD",
            minimumFractionDigits: 0,
          })}
        </p>
      </div>

      {specs && (
        <div>
          <h3 className="font-semibold mb-2">Specifications</h3>
          <div className="space-y-3 text-sm">
            {specs.materials && (
              <div>
                <p className="font-medium">Materials:</p>
                <ul className="list-disc list-inside text-muted-foreground ml-2">
                  {specs.materials.map((material: string, i: number) => (
                    <li key={i}>{material}</li>
                  ))}
                </ul>
              </div>
            )}
            {specs.dimensions && (
              <div>
                <p className="font-medium">Dimensions:</p>
                <p className="text-muted-foreground">{specs.dimensions}</p>
              </div>
            )}
            {specs.workmanship && (
              <div>
                <p className="font-medium">Workmanship:</p>
                <p className="text-muted-foreground">{specs.workmanship}</p>
              </div>
            )}
            {specs.duration && (
              <div>
                <p className="font-medium">Duration:</p>
                <p className="text-muted-foreground">{specs.duration}</p>
              </div>
            )}
            {specs.standards && (
              <div>
                <p className="font-medium">Standards:</p>
                <ul className="list-disc list-inside text-muted-foreground ml-2">
                  {specs.standards.map((standard: string, i: number) => (
                    <li key={i}>{standard}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {compliance && (
        <div>
          <h3 className="font-semibold mb-2">Compliance Requirements</h3>
          <div className="space-y-3 text-sm">
            {compliance.buildingCode && (
              <div>
                <p className="font-medium">Building Code:</p>
                <p className="text-muted-foreground">{compliance.buildingCode}</p>
              </div>
            )}
            {compliance.standards && (
              <div>
                <p className="font-medium">Standards:</p>
                <ul className="list-disc list-inside text-muted-foreground ml-2">
                  {compliance.standards.map((standard: string, i: number) => (
                    <li key={i}>{standard}</li>
                  ))}
                </ul>
              </div>
            )}
            {compliance.permits && (
              <div>
                <p className="font-medium">Permits:</p>
                <p className="text-muted-foreground">{compliance.permits}</p>
              </div>
            )}
            {compliance.insurance && (
              <div>
                <p className="font-medium">Insurance:</p>
                <p className="text-muted-foreground">{compliance.insurance}</p>
              </div>
            )}
            {compliance.licensing && (
              <div>
                <p className="font-medium">Licensing:</p>
                <p className="text-muted-foreground">{compliance.licensing}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
