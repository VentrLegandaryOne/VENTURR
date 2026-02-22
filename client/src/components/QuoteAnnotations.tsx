import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  StickyNote,
  Plus,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  MessageSquare,
} from "lucide-react";

const COLOR_OPTIONS = [
  { value: "yellow", label: "Yellow", bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-800" },
  { value: "blue", label: "Blue", bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800" },
  { value: "green", label: "Green", bg: "bg-green-100", border: "border-green-300", text: "text-green-800" },
  { value: "red", label: "Red", bg: "bg-red-100", border: "border-red-300", text: "text-red-800" },
  { value: "purple", label: "Purple", bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-800" },
] as const;

const SECTION_OPTIONS = [
  { value: "pricing", label: "Pricing" },
  { value: "materials", label: "Materials" },
  { value: "compliance", label: "Compliance" },
  { value: "warranty", label: "Warranty" },
  { value: "general", label: "General" },
];

type ColorValue = (typeof COLOR_OPTIONS)[number]["value"];

function getColorClasses(color: string) {
  return COLOR_OPTIONS.find((c) => c.value === color) || COLOR_OPTIONS[0];
}

export function QuoteAnnotations({ quoteId }: { quoteId: number }) {

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newContent, setNewContent] = useState("");
  const [newColor, setNewColor] = useState<ColorValue>("yellow");
  const [newSection, setNewSection] = useState("general");
  const [editContent, setEditContent] = useState("");

  const utils = trpc.useUtils();

  const { data: annotations = [], isLoading } = trpc.annotations.list.useQuery(
    { quoteId },
    { enabled: !!quoteId }
  );

  const createMutation = trpc.annotations.create.useMutation({
    onSuccess: () => {
      utils.annotations.list.invalidate({ quoteId });
      setNewContent("");
      setNewColor("yellow");
      setNewSection("general");
      setIsAdding(false);
      toast.success("Note added");
    },
    onError: () => {
      toast.error("Failed to save annotation");
    },
  });

  const updateMutation = trpc.annotations.update.useMutation({
    onSuccess: () => {
      utils.annotations.list.invalidate({ quoteId });
      setEditingId(null);
      toast.success("Note updated");
    },
    onError: () => {
      toast.error("Failed to update annotation");
    },
  });

  const deleteMutation = trpc.annotations.delete.useMutation({
    onSuccess: () => {
      utils.annotations.list.invalidate({ quoteId });
      toast.success("Note deleted");
    },
    onError: () => {
      toast.error("Failed to delete annotation");
    },
  });

  const handleCreate = () => {
    if (!newContent.trim()) return;
    createMutation.mutate({
      quoteId,
      content: newContent.trim(),
      color: newColor,
      section: newSection,
    });
  };

  const handleUpdate = (id: number) => {
    if (!editContent.trim()) return;
    updateMutation.mutate({ id, content: editContent.trim() });
  };

  const handleTogglePin = (id: number, currentPinned: boolean) => {
    updateMutation.mutate({ id, isPinned: !currentPinned });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const startEdit = (id: number, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <StickyNote className="h-4 w-4" />
            Notes & Annotations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <StickyNote className="h-4 w-4" />
            Notes & Annotations
            {annotations.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {annotations.length}
              </Badge>
            )}
          </CardTitle>
          {!isAdding && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add new annotation form */}
        {isAdding && (
          <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
            <Textarea
              placeholder="Write your note here... (e.g., 'Check if this price includes GST', 'Ask about warranty extension')"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={2000}
            />
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground mr-1">Color:</span>
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewColor(color.value)}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${color.bg} ${
                      newColor === color.value
                        ? "border-foreground scale-110"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground mr-1">Section:</span>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  className="text-xs border rounded px-2 py-1 bg-background"
                >
                  {SECTION_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {newContent.length}/2000
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNewContent("");
                  }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={!newContent.trim() || createMutation.isPending}
                >
                  <Check className="h-3 w-3 mr-1" />
                  {createMutation.isPending ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Annotations list */}
        {annotations.length === 0 && !isAdding ? (
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No notes yet</p>
            <p className="text-xs mt-1">
              Add personal notes to track observations before comparing quotes
            </p>
          </div>
        ) : (
          annotations.map((annotation: any) => {
            const colorClasses = getColorClasses(annotation.color || "yellow");
            const isEditing = editingId === annotation.id;

            return (
              <div
                key={annotation.id}
                className={`rounded-lg border p-3 ${colorClasses.bg} ${colorClasses.border} relative group`}
              >
                {annotation.isPinned && (
                  <Pin className="h-3 w-3 absolute top-2 right-2 text-muted-foreground fill-current" />
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {annotation.section && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] mb-1 ${colorClasses.text} border-current/20`}
                      >
                        {annotation.section}
                      </Badge>
                    )}

                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[60px] resize-none bg-background/80"
                          maxLength={2000}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(annotation.id)}
                            disabled={updateMutation.isPending}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className={`text-sm whitespace-pre-wrap ${colorClasses.text}`}>
                        {annotation.content}
                      </p>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleTogglePin(annotation.id, annotation.isPinned)}
                        className="p-1 rounded hover:bg-black/10"
                        title={annotation.isPinned ? "Unpin" : "Pin"}
                      >
                        <Pin className={`h-3 w-3 ${annotation.isPinned ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={() => startEdit(annotation.id, annotation.content)}
                        className="p-1 rounded hover:bg-black/10"
                        title="Edit"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(annotation.id)}
                        className="p-1 rounded hover:bg-red-200"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(annotation.createdAt).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {annotation.updatedAt !== annotation.createdAt && (
                    <span className="text-[10px] text-muted-foreground italic">
                      (edited)
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
