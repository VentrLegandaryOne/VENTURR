import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Copy, Check, Mail, Clock, Eye, MessageSquare, DollarSign, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";

interface ShareReportDialogProps {
  quoteId: number;
}

export default function ShareReportDialog({ quoteId }: ShareReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState<"view" | "comment" | "negotiate">("view");
  const [expiresInDays, setExpiresInDays] = useState<number>(7);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  const utils = trpc.useUtils();
  const { data: shares, isLoading } = trpc.sharing.listShares.useQuery({ quoteId }, { enabled: open });
  
  const createShareMutation = trpc.sharing.createLink.useMutation({
    onSuccess: (data) => {
      toast.success("Share link created!");
      utils.sharing.listShares.invalidate({ quoteId });
      setEmail("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create share link");
    },
  });

  const revokeShareMutation = trpc.sharing.revokeLink.useMutation({
    onSuccess: () => {
      toast.success("Share link revoked");
      utils.sharing.listShares.invalidate({ quoteId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to revoke share link");
    },
  });

  const handleCreateShare = () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (!hasAcknowledged) {
      toast.error("Please acknowledge the disclaimer before sharing");
      return;
    }

    createShareMutation.mutate({
      quoteId,
      sharedWith: email,
      accessLevel,
      expiresInDays,
    });
  };

  const handleCopyLink = (shareUrl: string, token: string) => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedToken(token);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case "view":
        return <Eye className="w-4 h-4" />;
      case "comment":
        return <MessageSquare className="w-4 h-4" />;
      case "negotiate":
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "view":
        return "text-blue-500";
      case "comment":
        return "text-amber-500";
      case "negotiate":
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Verification Report</DialogTitle>
          <DialogDescription>
            Invite contractors or team members to view, comment, or negotiate on this quote verification.
          </DialogDescription>
        </DialogHeader>

        {/* Create New Share */}
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="contractor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="access">Access Level</Label>
              <Select value={accessLevel} onValueChange={(value: any) => setAccessLevel(value)}>
                <SelectTrigger id="access">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      View Only
                    </div>
                  </SelectItem>
                  <SelectItem value="comment">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Can Comment
                    </div>
                  </SelectItem>
                  <SelectItem value="negotiate">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Can Negotiate
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires">Expires In</Label>
              <Select value={expiresInDays.toString()} onValueChange={(value) => setExpiresInDays(Number(value))}>
                <SelectTrigger id="expires">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Disclaimer Acknowledgment */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                This report is AI-generated for informational purposes only. Recipients should consult qualified professionals before making decisions.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="share-acknowledge"
                checked={hasAcknowledged}
                onCheckedChange={(checked) => setHasAcknowledged(checked === true)}
                className="mt-0.5"
              />
              <Label
                htmlFor="share-acknowledge"
                className="text-xs leading-relaxed cursor-pointer text-amber-800"
              >
                I understand this report is AI-generated and not professional advice. I confirm the recipient should seek qualified professional guidance.
              </Label>
            </div>
          </div>

          <Button
            onClick={handleCreateShare}
            disabled={createShareMutation.isPending || !hasAcknowledged}
            className="w-full"
          >
            {hasAcknowledged ? (
              <><CheckCircle2 className="w-4 h-4 mr-2" />{createShareMutation.isPending ? "Creating..." : "Create Share Link"}</>
            ) : (
              <>{createShareMutation.isPending ? "Creating..." : "Acknowledge to Share"}</>
            )}
          </Button>
        </div>

        {/* Existing Shares */}
        {shares && shares.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium text-sm text-muted-foreground">Active Share Links</h4>
            <AnimatePresence>
              {shares.map((share) => (
                <motion.div
                  key={share.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${getAccessLevelColor(share.accessLevel)} bg-current/10`}>
                    {getAccessLevelIcon(share.accessLevel)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{share.sharedWith || "Anyone with link"}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {share.viewCount} views
                      </span>
                      {share.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires {new Date(share.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyLink(`${window.location.origin}/shared/${share.shareToken}`, share.shareToken)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedToken === share.shareToken ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeShareMutation.mutate({ shareId: share.id })}
                      disabled={revokeShareMutation.isPending}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
