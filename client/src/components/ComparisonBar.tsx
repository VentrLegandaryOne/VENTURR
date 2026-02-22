import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export function ComparisonBar() {
  const [, setLocation] = useLocation();
  const { data: contractors, refetch } = trpc.contractors.getComparisonList.useQuery();
  const removeFromComparison = trpc.contractors.removeFromComparison.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Removed from comparison");
    },
  });

  if (!contractors || contractors.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 animate-in slide-in-from-bottom">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            <span className="text-sm font-medium whitespace-nowrap">
              Compare ({contractors.length}/4):
            </span>
            <div className="flex gap-2">
              {contractors.map((contractor) => (
                <div
                  key={contractor.id}
                  className="flex items-center gap-2 bg-accent px-3 py-1.5 rounded-md text-sm"
                >
                  <span className="font-medium">{contractor.name}</span>
                  <button
                    onClick={() => removeFromComparison.mutate({ contractorId: contractor.id })}
                    className="hover:bg-accent-foreground/10 rounded-full p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                trpc.contractors.clearComparison.useMutation({
                  onSuccess: () => {
                    refetch();
                    toast.success("Comparison cleared");
                  },
                }).mutate();
              }}
            >
              Clear All
            </Button>
            <Button
              size="sm"
              onClick={() => setLocation("/compare-contractors")}
              disabled={contractors.length < 2}
            >
              Compare Now
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
