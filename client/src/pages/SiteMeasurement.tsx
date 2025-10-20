import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Camera, Loader2, Pencil, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { nanoid } from "nanoid";

interface MeasurementPoint {
  id: string;
  label: string;
  length: string;
  width: string;
  height: string;
  area: string;
  notes: string;
}

interface DrawingElement {
  type: 'line' | 'rect' | 'circle' | 'text';
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  color: string;
}

export default function SiteMeasurement() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/projects/:id/measure");
  const projectId = params?.id;

  const { data: project } = trpc.projects.get.useQuery(
    { id: projectId! },
    { enabled: !!projectId }
  );

  const createMeasurementMutation = trpc.measurements.create.useMutation({
    onSuccess: () => {
      toast.success("Measurement saved successfully");
      if (projectId) {
        setLocation(`/projects/${projectId}`);
      }
    },
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingTool, setDrawingTool] = useState<'line' | 'rect' | 'circle' | 'text'>('line');
  const [drawingElements, setDrawingElements] = useState<DrawingElement[]>([]);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
  const [scale, setScale] = useState("1:100");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);

  const [measurements, setMeasurements] = useState<MeasurementPoint[]>([
    {
      id: nanoid(),
      label: "Main Roof Area",
      length: "",
      width: "",
      height: "",
      area: "0",
      notes: "",
    },
  ]);

  const [generalNotes, setGeneralNotes] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 400;

    // Clear and draw grid
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Redraw all elements
    drawingElements.forEach(element => {
      drawElement(ctx, element);
    });
  }, [drawingElements]);

  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.strokeStyle = element.color;
    ctx.fillStyle = element.color;
    ctx.lineWidth = 2;

    switch (element.type) {
      case 'line':
        if (element.x2 !== undefined && element.y2 !== undefined) {
          ctx.beginPath();
          ctx.moveTo(element.x, element.y);
          ctx.lineTo(element.x2, element.y2);
          ctx.stroke();
        }
        break;
      case 'rect':
        if (element.width !== undefined && element.height !== undefined) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
        }
        break;
      case 'circle':
        if (element.radius !== undefined) {
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;
      case 'text':
        if (element.text) {
          ctx.font = '14px sans-serif';
          ctx.fillText(element.text, element.x, element.y);
        }
        break;
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentElement({
      type: drawingTool,
      x,
      y,
      color: '#2563eb',
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x2 = e.clientX - rect.left;
    const y2 = e.clientY - rect.top;

    const updated = { ...currentElement };

    switch (drawingTool) {
      case 'line':
        updated.x2 = x2;
        updated.y2 = y2;
        break;
      case 'rect':
        updated.width = x2 - currentElement.x;
        updated.height = y2 - currentElement.y;
        break;
      case 'circle':
        const dx = x2 - currentElement.x;
        const dy = y2 - currentElement.y;
        updated.radius = Math.sqrt(dx * dx + dy * dy);
        break;
    }

    setCurrentElement(updated);
    setDrawingElements([...drawingElements, updated]);
  };

  const handleCanvasMouseUp = () => {
    if (currentElement) {
      setDrawingElements([...drawingElements.slice(0, -1), currentElement]);
    }
    setIsDrawing(false);
    setCurrentElement(null);
  };

  const clearCanvas = () => {
    setDrawingElements([]);
  };

  const addMeasurement = () => {
    setMeasurements([
      ...measurements,
      {
        id: nanoid(),
        label: `Area ${measurements.length + 1}`,
        length: "",
        width: "",
        height: "",
        area: "0",
        notes: "",
      },
    ]);
  };

  const removeMeasurement = (id: string) => {
    setMeasurements(measurements.filter(m => m.id !== id));
  };

  const updateMeasurement = (id: string, field: keyof MeasurementPoint, value: string) => {
    setMeasurements(
      measurements.map(m => {
        if (m.id === id) {
          const updated = { ...m, [field]: value };
          // Auto-calculate area
          if (field === 'length' || field === 'width') {
            const length = parseFloat(field === 'length' ? value : updated.length) || 0;
            const width = parseFloat(field === 'width' ? value : updated.width) || 0;
            updated.area = (length * width).toFixed(2);
          }
          return updated;
        }
        return m;
      })
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos([...photos, ...files]);

    // Generate previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreview(photoPreview.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!projectId) return;

    // TODO: Upload photos to S3 and get URLs
    // For now, we'll save the measurement data without photos

    const measurementData = {
      measurements,
      totalArea: measurements.reduce((sum, m) => sum + parseFloat(m.area || "0"), 0).toFixed(2),
      scale,
    };

    const drawingData = {
      elements: drawingElements,
      canvasWidth: canvasRef.current?.width || 0,
      canvasHeight: canvasRef.current?.height || 0,
    };

    await createMeasurementMutation.mutateAsync({
      projectId,
      measurementData: JSON.stringify(measurementData),
      drawingData: JSON.stringify(drawingData),
      scale,
      notes: generalNotes,
    });
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
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation(projectId ? `/projects/${projectId}` : "/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Project
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Site Measurement</h1>
                {project && <p className="text-sm text-slate-600">{project.title}</p>}
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={createMeasurementMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createMeasurementMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Measurement
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Drawing Canvas */}
          <Card>
            <CardHeader>
              <CardTitle>Site Drawing</CardTitle>
              <CardDescription>Draw measurements and annotations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drawing Tools */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={drawingTool === 'line' ? 'default' : 'outline'}
                  onClick={() => setDrawingTool('line')}
                >
                  Line
                </Button>
                <Button
                  size="sm"
                  variant={drawingTool === 'rect' ? 'default' : 'outline'}
                  onClick={() => setDrawingTool('rect')}
                >
                  Rectangle
                </Button>
                <Button
                  size="sm"
                  variant={drawingTool === 'circle' ? 'default' : 'outline'}
                  onClick={() => setDrawingTool('circle')}
                >
                  Circle
                </Button>
                <Button size="sm" variant="outline" onClick={clearCanvas}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <div className="ml-auto">
                  <Label htmlFor="scale" className="mr-2">Scale:</Label>
                  <Input
                    id="scale"
                    value={scale}
                    onChange={(e) => setScale(e.target.value)}
                    className="w-24 inline-block"
                    placeholder="1:100"
                  />
                </div>
              </div>

              {/* Canvas */}
              <canvas
                ref={canvasRef}
                className="w-full border border-slate-300 rounded-lg cursor-crosshair bg-white"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Site Photos</CardTitle>
              <CardDescription>Upload photos of the site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Camera className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 mb-1">Click to upload photos</p>
                  <p className="text-xs text-slate-500">or drag and drop</p>
                </label>
              </div>

              {/* Photo Previews */}
              {photoPreview.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {photoPreview.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Site photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Measurements */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Measurements</CardTitle>
                <CardDescription>Record detailed measurements</CardDescription>
              </div>
              <Button onClick={addMeasurement} size="sm" variant="outline">
                Add Measurement
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {measurements.map((measurement, index) => (
                <div key={measurement.id} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <Label htmlFor={`label-${measurement.id}`}>Label</Label>
                      <Input
                        id={`label-${measurement.id}`}
                        value={measurement.label}
                        onChange={(e) => updateMeasurement(measurement.id, 'label', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`length-${measurement.id}`}>Length (m)</Label>
                      <Input
                        id={`length-${measurement.id}`}
                        type="number"
                        step="0.01"
                        value={measurement.length}
                        onChange={(e) => updateMeasurement(measurement.id, 'length', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`width-${measurement.id}`}>Width (m)</Label>
                      <Input
                        id={`width-${measurement.id}`}
                        type="number"
                        step="0.01"
                        value={measurement.width}
                        onChange={(e) => updateMeasurement(measurement.id, 'width', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`height-${measurement.id}`}>Height (m)</Label>
                      <Input
                        id={`height-${measurement.id}`}
                        type="number"
                        step="0.01"
                        value={measurement.height}
                        onChange={(e) => updateMeasurement(measurement.id, 'height', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Area (m²)</Label>
                      <div className="h-10 flex items-center font-semibold">
                        {measurement.area}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`notes-${measurement.id}`}>Notes</Label>
                      <Input
                        id={`notes-${measurement.id}`}
                        value={measurement.notes}
                        onChange={(e) => updateMeasurement(measurement.id, 'notes', e.target.value)}
                        placeholder="Additional notes..."
                      />
                    </div>
                    {measurements.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMeasurement(measurement.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-6"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Total Area */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Area:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {measurements.reduce((sum, m) => sum + parseFloat(m.area || "0"), 0).toFixed(2)} m²
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Notes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>General Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={4}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Add any additional notes about the site, access, special conditions, etc..."
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

