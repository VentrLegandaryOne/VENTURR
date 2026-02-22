import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Share2, Copy, Check, Link2, Loader2 } from "lucide-react";

interface ShareComparisonDialogProps {
  contractorIds: number[];
  contractorNames?: string[];
  trigger?: React.ReactNode;
}

export default function ShareComparisonDialog({
  contractorIds,
  contractorNames = [],
  trigger,
}: ShareComparisonDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [expiresIn, setExpiresIn] = useState<string>("7");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createShare = trpc.contractors.createComparisonShare.useMutation({
    onSuccess: (data) => {
      const url = `${window.location.origin}/shared-comparison/${data.shareToken}`;
      setShareUrl(url);
      toast.success("Share link created!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create share link");
    },
  });

  const handleCreate = () => {
    createShare.mutate({
      contractorIds,
      title: title || `Contractor Comparison - ${new Date().toLocaleDateString()}`,
      notes: notes || undefined,
      expiresInDays: expiresIn === "never" ? undefined : parseInt(expiresIn),
    });
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setShareUrl(null);
      setTitle("");
      setNotes("");
      setExpiresIn("7");
      setCopied(false);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Comparison
          </DialogTitle>
          <DialogDescription>
            Create a shareable link for this contractor comparison
          </DialogDescription>
        </DialogHeader>

        {!shareUrl ? (
          <div className="space-y-4 py-4">
            {/* Contractors being shared */}
            <div className="p-3 rounded-lg bg-muted/50 border">
              <Label className="text-xs text-muted-foreground">Sharing comparison of:</Label>
              <p className="text-sm font-medium mt-1">
                {contractorNames.length > 0
                  ? contractorNames.join(", ")
                  : `${contractorIds.length} contractors`}
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                placeholder="e.g., Kitchen Renovation Contractors"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes for the recipient..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Expiry */}
            <div className="space-y-2">
              <Label>Link expires in</Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCreate}
              disabled={createShare.isPending || contractorIds.length < 2}
              className="w-full"
            >
              {createShare.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Create Share Link
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Success state */}
            <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center">
              <Check className="h-8 w-8 mx-auto mb-2 text-success" />
              <p className="font-medium text-success-foreground">
                Share link created!
              </p>
            </div>

            {/* Share URL */}
            <div className="space-y-2">
              <Label>Share URL</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view the comparison
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Done
              </Button>
              <Button onClick={handleCopy} className="flex-1">
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
