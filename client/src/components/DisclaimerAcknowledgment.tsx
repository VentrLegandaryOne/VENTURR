import { useState, useEffect } from "react";
import { AlertTriangle, Download, Share2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DisclaimerAcknowledgmentProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionType: "download" | "share";
  reportType?: "analysis" | "validt";
}

export function DisclaimerAcknowledgment({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  reportType = "analysis",
}: DisclaimerAcknowledgmentProps) {
  const [hasReadDisclaimer, setHasReadDisclaimer] = useState(false);
  const [hasUnderstoodLimitations, setHasUnderstoodLimitations] = useState(false);

  // Reset checkboxes when dialog opens
  useEffect(() => {
    if (isOpen) {
      setHasReadDisclaimer(false);
      setHasUnderstoodLimitations(false);
    }
  }, [isOpen]);

  const canProceed = hasReadDisclaimer && hasUnderstoodLimitations;

  const handleConfirm = () => {
    if (canProceed) {
      onConfirm();
      onClose();
    }
  };

  const actionLabel = actionType === "download" ? "Download" : "Share";
  const actionIcon = actionType === "download" ? Download : Share2;
  const ActionIcon = actionIcon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle>Acknowledgment Required</DialogTitle>
              <DialogDescription>
                Please confirm you understand the following before {actionType === "download" ? "downloading" : "sharing"} this report.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Disclaimer Summary */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
            <p className="font-medium text-foreground">Important Information:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold mt-0.5">•</span>
                This report is AI-generated and for <strong className="text-foreground">informational purposes only</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold mt-0.5">•</span>
                It does not constitute legal, financial, engineering, or professional advice
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold mt-0.5">•</span>
                Scores and assessments are estimates and may not reflect actual conditions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold mt-0.5">•</span>
                Consult qualified professionals before making decisions
              </li>
            </ul>
          </div>

          {/* Acknowledgment Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="read-disclaimer"
                checked={hasReadDisclaimer}
                onCheckedChange={(checked) => setHasReadDisclaimer(checked === true)}
                className="mt-1"
              />
              <Label
                htmlFor="read-disclaimer"
                className="text-sm leading-relaxed cursor-pointer"
              >
                I have read and understand that this report is AI-generated and provided for informational purposes only, not as professional advice.
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="understand-limitations"
                checked={hasUnderstoodLimitations}
                onCheckedChange={(checked) => setHasUnderstoodLimitations(checked === true)}
                className="mt-1"
              />
              <Label
                htmlFor="understand-limitations"
                className="text-sm leading-relaxed cursor-pointer"
              >
                I understand that VENTURR VALIDT provides analysis only, not compliance verification, and I should consult qualified professionals.
              </Label>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 text-sm">
            {canProceed ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-green-600">Ready to proceed</span>
              </>
            ) : (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                <span className="text-muted-foreground">Please check both boxes to continue</span>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canProceed}
            className={canProceed ? "" : "opacity-50 cursor-not-allowed"}
          >
            <ActionIcon className="w-4 h-4 mr-2" />
            {actionLabel} Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage acknowledgment state
export function useDisclaimerAcknowledgment() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [actionType, setActionType] = useState<"download" | "share">("download");

  const requestAcknowledgment = (type: "download" | "share", action: () => void) => {
    setActionType(type);
    setPendingAction(() => action);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPendingAction(null);
  };

  return {
    isOpen,
    actionType,
    requestAcknowledgment,
    handleConfirm,
    handleClose,
  };
}
