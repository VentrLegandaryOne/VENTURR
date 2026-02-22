import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Scale, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface AddToCompareButtonProps {
  contractorId: number;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AddToCompareButton({ 
  contractorId, 
  variant = "outline",
  size = "sm",
  className = ""
}: AddToCompareButtonProps) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  
  const { data: isInComparison, isLoading: checkLoading } = trpc.contractors.isInComparison.useQuery(
    { contractorId },
    { enabled: !!user }
  );

  const addToComparison = trpc.contractors.addToComparison.useMutation({
    onSuccess: () => {
      utils.contractors.isInComparison.invalidate({ contractorId });
      utils.contractors.getComparisonList.invalidate();
      toast.success("Added to comparison");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to comparison");
    },
  });

  const removeFromComparison = trpc.contractors.removeFromComparison.useMutation({
    onSuccess: () => {
      utils.contractors.isInComparison.invalidate({ contractorId });
      utils.contractors.getComparisonList.invalidate();
      toast.success("Removed from comparison");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove from comparison");
    },
  });

  if (!user) {
    return null;
  }

  const isLoading = checkLoading || addToComparison.isPending || removeFromComparison.isPending;

  const handleClick = () => {
    if (isInComparison) {
      removeFromComparison.mutate({ contractorId });
    } else {
      addToComparison.mutate({ contractorId });
    }
  };

  return (
    <Button
      variant={isInComparison ? "secondary" : variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isInComparison ? (
        <>
          <Check className="w-4 h-4 mr-1" />
          In Compare
        </>
      ) : (
        <>
          <Scale className="w-4 h-4 mr-1" />
          Compare
        </>
      )}
    </Button>
  );
}
