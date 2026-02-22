import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  FileText, 
  CheckCircle2, 
  BookOpen, 
  ClipboardCheck,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Shield,
  Info
} from "lucide-react";
import { useLocation } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QueryWrapper } from "@/components/ui/QueryWrapper";

export default function Templates() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { data: templates, isLoading, error: errorTemplates } = trpc.templates.list.useQuery({
    category: selectedCategory === "all" ? undefined : selectedCategory,
  }, { retry: 2 });

  const { data: categories, error: errorCategories } = trpc.templates.getCategories.useQuery();

  const filteredTemplates = templates?.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 text-white py-16">
        <div className="container">
          <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
            <BookOpen className="w-3 h-3 mr-1" />
            Reference Guides
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Quote Reference Library</h1>
          <p className="text-xl text-slate-300 max-w-2xl">
            Learn what a professional construction quote should include. Use these guides to verify your contractor's quote covers all essential items.
          </p>
        </div>
      </div>

      {/* Purpose Explanation */}
      <div className="container py-8">
        <Alert className="mb-8 bg-cyan-50 border-cyan-200">
          <Lightbulb className="h-4 w-4 text-cyan-600" />
          <AlertTitle className="text-cyan-800">How to Use These Guides</AlertTitle>
          <AlertDescription className="text-cyan-700">
            These reference templates help you understand what a complete, professional quote should contain for different project types. 
            When reviewing a quote from your contractor, compare it against these guides to ensure nothing important is missing—like 
            required permits, material specifications, or compliance items.
          </AlertDescription>
        </Alert>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search project types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        {filteredTemplates && (
          <p className="text-sm text-slate-600 mb-6">
            Showing {filteredTemplates.length} reference guides
          </p>
        )}

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded mb-4" />
                <div className="h-4 bg-slate-200 rounded mb-2" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : filteredTemplates && filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => {
                  setSelectedTemplate(template);
                  setDetailModalOpen(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-3 bg-cyan-50 text-cyan-700 border-cyan-200">
                      {template.category}
                    </Badge>
                    <h3 className="text-xl font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors">
                      {template.name}
                    </h3>
                  </div>
                  <BookOpen className="h-6 w-6 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                </div>

                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                  {template.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-cyan-600 text-sm font-medium">
                    <ClipboardCheck className="h-4 w-4" />
                    <span>View Checklist</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No guides found
            </h3>
            <p className="text-slate-500">
              Try adjusting your search or filter criteria
            </p>
          </Card>
        )}
      </div>

      {/* Template Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                {selectedTemplate?.category}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <BookOpen className="w-3 h-3 mr-1" />
                Reference Guide
              </Badge>
            </div>
            <DialogTitle className="text-2xl">{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6 mt-4">
              {/* How to Use This Guide */}
              <Alert className="bg-amber-50 border-amber-200">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">How to Use This Guide</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Compare your contractor's quote against this checklist. A professional quote should include 
                  all the specifications and compliance items listed below. If items are missing, ask your 
                  contractor to clarify or add them before signing.
                </AlertDescription>
              </Alert>

              {/* What to Look For */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                  What Your Quote Should Include
                </h4>
                <div className="bg-slate-50 rounded-lg p-4">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                    {JSON.stringify(selectedTemplate.specifications, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Compliance Requirements */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-cyan-600" />
                  Required Compliance Items
                </h4>
                <p className="text-sm text-slate-600 mb-3">
                  These are regulatory and safety requirements that should be addressed in the quote:
                </p>
                <div className="bg-slate-50 rounded-lg p-4">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                    {JSON.stringify(selectedTemplate.complianceRequirements, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Red Flags */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Red Flags to Watch For
                </h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    Missing material specifications or "TBD" items
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    No mention of permits or council approvals
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    Vague scope of work without clear deliverables
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    No warranty or guarantee information
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    Missing insurance or license details
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    setDetailModalOpen(false);
                    setLocation("/quote/upload");
                  }}
                  className="flex-1"
                >
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  Verify My Quote Against This Guide
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDetailModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
