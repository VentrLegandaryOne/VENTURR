import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface QuickProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectId: string) => void;
  defaultTitle?: string;
  action?: "measure" | "calculate" | "quote";
}

export function QuickProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
  defaultTitle,
  action = "calculate",
}: QuickProjectModalProps) {
  const [title, setTitle] = useState(defaultTitle || "");
  const [propertyType, setPropertyType] = useState<"residential" | "commercial" | "industrial">("residential");
  const [isCreating, setIsCreating] = useState(false);

  const createProject = trpc.projects.create.useMutation({
    onSuccess: (data) => {
      toast.success("Project created successfully!");
      onProjectCreated(data.id);
      onClose();
      // Reset form
      setTitle("");
      setPropertyType("residential");
      setIsCreating(false);
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
      setIsCreating(false);
    },
  });

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    setIsCreating(true);
    createProject.mutate({
      organizationId: "default-org", // TODO: Get from user context
      title: title.trim(),
      propertyType,
      address: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
    });
  };

  const getActionText = () => {
    switch (action) {
      case "measure":
        return "site measurement";
      case "calculate":
        return "roofing calculation";
      case "quote":
        return "quote generation";
      default:
        return "project work";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Project Setup</DialogTitle>
          <DialogDescription>
            Create a project to start {getActionText()}. You can add more details later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Residential Roof - 123 Main St"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim()) {
                  handleCreate();
                }
              }}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="propertyType">Property Type *</Label>
            <Select
              value={propertyType}
              onValueChange={(value: "residential" | "commercial" | "industrial") =>
                setPropertyType(value)
              }
            >
              <SelectTrigger id="propertyType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Client details and property address can be added from the project page.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !title.trim()}>
            {isCreating ? "Creating..." : "Create & Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

