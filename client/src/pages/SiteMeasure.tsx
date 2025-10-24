import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  Camera, 
  Loader2, 
  Save, 
  Trash2, 
  Undo2, 
  Redo2,
  Grid3x3,
  Ruler,
  Triangle,
  Home,
  Mountain,
  Box,
  Type,
  Move,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Download,
  Upload as UploadIcon
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import {
  DrawingElement,
  DrawingToolType,
  DrawingState,
  Point,
  snapToGrid,
  distance,
  angle,
  generateHipRoof,
  generateValleyRoof,
  generateGableRoof,
  generateSkillionRoof,
  drawGrid,
  drawElement,
  exportDrawing,
  importDrawing,
} from "@/lib/drawingUtils";

interface MeasurementPoint {
  id: string;
  label: string;
  length: string;
  width: string;
  height: string;
  area: string;
  notes: string;
}

export default function SiteMeasure() {
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
  const [drawingTool, setDrawingTool] = useState<DrawingToolType>('line');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);

  const [drawingState, setDrawingState] = useState<DrawingState>({
    elements: [],
    currentElement: null,
    selectedElement: null,
    history: [[]],
    historyIndex: 0,
    gridSize: 20,
    snapToGrid: true,
    showGrid: true,
    scale: '1:100',
    layers: [
      { id: 0, name: 'Main', visible: true, locked: false },
    ],
  });

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
  const [currentLayer, setCurrentLayer] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  // Initialize and redraw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 500;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (drawingState.showGrid) {
      drawGrid(ctx, canvas.width, canvas.height, drawingState.gridSize);
    }

    // Draw all elements
    drawingState.elements.forEach(element => {
      const layer = drawingState.layers.find(l => l.id === element.layer);
      if (layer && layer.visible) {
        drawElement(ctx, element);
      }
    });

    // Draw current element being drawn
    if (drawingState.currentElement) {
      drawElement(ctx, drawingState.currentElement);
    }
  }, [drawingState]);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    if (drawingState.snapToGrid) {
      point = snapToGrid(point, drawingState.gridSize);
    }

    return point;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    
    // Check if current layer is locked
    const layer = drawingState.layers.find(l => l.id === currentLayer);
    if (layer && layer.locked) {
      toast.error("Current layer is locked");
      return;
    }

    setIsDrawing(true);

    const newElement: DrawingElement = {
      id: nanoid(),
      type: drawingTool,
      points: [point],
      color: '#2563eb',
      strokeWidth: 2,
      layer: currentLayer,
      locked: false,
    };

    setDrawingState(prev => ({
      ...prev,
      currentElement: newElement,
    }));
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingState.currentElement) return;

    const point = getCanvasPoint(e);
    const current = drawingState.currentElement;

    let updatedElement = { ...current };

    switch (drawingTool) {
      case 'line':
      case 'measurement':
        updatedElement.points = [current.points[0], point];
        if (drawingTool === 'measurement') {
          const dist = distance(current.points[0], point);
          updatedElement.measurement = {
            value: dist / (drawingState.gridSize * 5), // Assuming 1 grid = 0.2m
            unit: 'm',
          };
        }
        break;

      case 'rect':
        updatedElement.points = [current.points[0], point];
        break;

      case 'circle':
        updatedElement.points = [current.points[0], point];
        break;

      case 'polygon':
        // For polygon, add points on click
        break;

      case 'hip-roof':
        const hipWidth = Math.abs(point.x - current.points[0].x);
        const hipHeight = Math.abs(point.y - current.points[0].y);
        const hipCenter = {
          x: (current.points[0].x + point.x) / 2,
          y: (current.points[0].y + point.y) / 2,
        };
        updatedElement.points = generateHipRoof(hipCenter, hipWidth, hipHeight);
        break;

      case 'valley-roof':
        const valleyWidth = Math.abs(point.x - current.points[0].x);
        const valleyHeight = Math.abs(point.y - current.points[0].y);
        const valleyCenter = {
          x: (current.points[0].x + point.x) / 2,
          y: (current.points[0].y + point.y) / 2,
        };
        updatedElement.points = generateValleyRoof(valleyCenter, valleyWidth, valleyHeight);
        break;

      case 'gable-roof':
        const gableWidth = Math.abs(point.x - current.points[0].x);
        const gableHeight = Math.abs(point.y - current.points[0].y);
        const gableCenter = {
          x: (current.points[0].x + point.x) / 2,
          y: (current.points[0].y + point.y) / 2,
        };
        updatedElement.points = generateGableRoof(gableCenter, gableWidth, gableHeight);
        break;

      case 'skillion-roof':
        const skillionWidth = Math.abs(point.x - current.points[0].x);
        const skillionHeight = Math.abs(point.y - current.points[0].y);
        const skillionCenter = {
          x: (current.points[0].x + point.x) / 2,
          y: (current.points[0].y + point.y) / 2,
        };
        updatedElement.points = generateSkillionRoof(skillionCenter, skillionWidth, skillionHeight);
        break;
    }

    setDrawingState(prev => ({
      ...prev,
      currentElement: updatedElement,
    }));
  };

  const handleCanvasMouseUp = () => {
    if (drawingState.currentElement && drawingState.currentElement.points.length > 0) {
      const newElements = [...drawingState.elements, drawingState.currentElement];
      const newHistory = drawingState.history.slice(0, drawingState.historyIndex + 1);
      newHistory.push(newElements);

      setDrawingState(prev => ({
        ...prev,
        elements: newElements,
        currentElement: null,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      }));
    }
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (drawingState.historyIndex > 0) {
      const newIndex = drawingState.historyIndex - 1;
      setDrawingState(prev => ({
        ...prev,
        elements: prev.history[newIndex],
        historyIndex: newIndex,
      }));
    }
  };

  const handleRedo = () => {
    if (drawingState.historyIndex < drawingState.history.length - 1) {
      const newIndex = drawingState.historyIndex + 1;
      setDrawingState(prev => ({
        ...prev,
        elements: prev.history[newIndex],
        historyIndex: newIndex,
      }));
    }
  };

  const clearCanvas = () => {
    const newHistory = [...drawingState.history, []];
    setDrawingState(prev => ({
      ...prev,
      elements: [],
      history: newHistory,
      historyIndex: newHistory.length - 1,
    }));
  };

  const toggleGrid = () => {
    setDrawingState(prev => ({
      ...prev,
      showGrid: !prev.showGrid,
    }));
  };

  const toggleSnapToGrid = () => {
    setDrawingState(prev => ({
      ...prev,
      snapToGrid: !prev.snapToGrid,
    }));
  };

  const addLayer = () => {
    const newLayer = {
      id: drawingState.layers.length,
      name: `Layer ${drawingState.layers.length + 1}`,
      visible: true,
      locked: false,
    };
    setDrawingState(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer],
    }));
    setCurrentLayer(newLayer.id);
  };

  const toggleLayerVisibility = (layerId: number) => {
    setDrawingState(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      ),
    }));
  };

  const toggleLayerLock = (layerId: number) => {
    setDrawingState(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      ),
    }));
  };

  const exportDrawingData = () => {
    const json = exportDrawing(drawingState);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.title || 'drawing'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Drawing exported successfully");
  };

  const importDrawingData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const imported = importDrawing(json);
        setDrawingState(prev => ({
          ...prev,
          ...imported,
          history: [imported.elements || []],
          historyIndex: 0,
        }));
        toast.success("Drawing imported successfully");
      } catch (error) {
        toast.error("Failed to import drawing");
      }
    };
    reader.readAsText(file);
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

    const measurementData = {
      measurements,
      totalArea: measurements.reduce((sum, m) => sum + parseFloat(m.area || "0"), 0).toFixed(2),
      scale: drawingState.scale,
    };

    const drawingData = exportDrawing(drawingState);

    await createMeasurementMutation.mutateAsync({
      projectId,
      measurementData: JSON.stringify(measurementData),
      drawingData,
      scale: drawingState.scale,
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
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportDrawingData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <label htmlFor="import-drawing">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <UploadIcon className="w-4 h-4 mr-2" />
                    Import
                  </span>
                </Button>
              </label>
              <input
                id="import-drawing"
                type="file"
                accept=".json"
                onChange={importDrawingData}
                className="hidden"
              />
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Drawing Canvas - Takes 3 columns */}
          <div className="xl:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Site Drawing</CardTitle>
                    <CardDescription>Draw roof structures and measurements</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{drawingState.scale}</Badge>
                    <Badge variant={drawingState.snapToGrid ? "default" : "outline"}>
                      Snap: {drawingState.snapToGrid ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drawing Tools */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Label className="text-sm font-semibold">Basic Tools:</Label>
                    <Button
                      size="sm"
                      variant={drawingTool === 'line' ? 'default' : 'outline'}
                      onClick={() => setDrawingTool('line')}
                    >
                      <Ruler className="w-4 h-4 mr-1" />
                      Line
                    </Button>
                    <Button
                      size="sm"
                      variant={drawingTool === 'rect' ? 'default' : 'outline'}
                      onClick={() => setDrawingTool('rect')}
                    >
                      <Box className="w-4 h-4 mr-1" />
                      Rectangle
                    </Button>
                    <Button
                      size="sm"
                      variant={drawingTool === 'circle' ? 'default' : 'outline'}
                      onClick={() => setDrawingTool('circle')}
                    >
                      Circle
                    </Button>
                    <Button
                      size="sm"
                      variant={drawingTool === 'polygon' ? 'default' : 'outline'}
                      onClick={() => setDrawingTool('polygon')}
                    >
                      Polygon
                    </Button>
                    <Button
                      size="sm"
                      variant={drawingTool === 'measurement' ? 'default' : 'outline'}
                      onClick={() => setDrawingTool('measurement')}
                    >
                      <Ruler className="w-4 h-4 mr-1" />
                      Measure
                    </Button>
                    <Button
                      size="sm"
                      variant={drawingTool === 'text' ? 'default' : 'outline'}
                      onClick={() => setDrawingTool('text')}
                    >
                      <Type className="w-4 h-4 mr-1" />
                      Text
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-2 flex-wrap">
                    <Label className="text-sm font-semibold">Roof Structures:</Label>
                    <Button
                      size="sm"
                      variant={drawingTool === 'hip-roof' ? 'default' : 'outline'}
                      onClick={() => setDrawingTool('hip-roof')}
                    >
                      <Triangle className="w-4 h-4 mr-1" />
                      Hip Roof
                    </Button>
                    <Button
                      size="sm"
                      variant={drawingTool === 'valley-roof' ? 'default' : 'outline'}
                      onClick={() => setDrawingTool('valley-roof')}
                    >
                      <Mountain className="w-4 h-4 mr-1" />
                      Valley Roof
                    </Button>
                    <Button
                      size="sm"
                      variant={drawingTool === 'gable-roof' ? 'default' : 'outline'}
                      onClick={() => setDrawingTool('gable-roof')}
                    >
                      <Home className="w-4 h-4 mr-1" />
                      Gable Roof
                    </Button>
                    <Button
                      size="sm"
                      variant={drawingTool === 'skillion-roof' ? 'default' : 'outline'}
                      onClick={() => setDrawingTool('skillion-roof')}
                    >
                      Skillion Roof
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={handleUndo} disabled={drawingState.historyIndex === 0}>
                      <Undo2 className="w-4 h-4 mr-1" />
                      Undo
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleRedo} disabled={drawingState.historyIndex >= drawingState.history.length - 1}>
                      <Redo2 className="w-4 h-4 mr-1" />
                      Redo
                    </Button>
                    <Button size="sm" variant="outline" onClick={toggleGrid}>
                      <Grid3x3 className="w-4 h-4 mr-1" />
                      {drawingState.showGrid ? 'Hide' : 'Show'} Grid
                    </Button>
                    <Button size="sm" variant="outline" onClick={toggleSnapToGrid}>
                      <Move className="w-4 h-4 mr-1" />
                      Snap: {drawingState.snapToGrid ? 'ON' : 'OFF'}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={clearCanvas}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                </div>

                {/* Canvas */}
                <canvas
                  ref={canvasRef}
                  className="w-full border-2 border-slate-300 rounded-lg cursor-crosshair bg-white shadow-sm"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />

                {/* Scale and Grid Settings */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="scale">Scale:</Label>
                    <Select value={drawingState.scale} onValueChange={(value) => setDrawingState(prev => ({ ...prev, scale: value }))}>
                      <SelectTrigger id="scale" className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:50">1:50</SelectItem>
                        <SelectItem value="1:100">1:100</SelectItem>
                        <SelectItem value="1:200">1:200</SelectItem>
                        <SelectItem value="1:500">1:500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="gridSize">Grid Size:</Label>
                    <Input
                      id="gridSize"
                      type="number"
                      value={drawingState.gridSize}
                      onChange={(e) => setDrawingState(prev => ({ ...prev, gridSize: parseInt(e.target.value) || 20 }))}
                      className="w-20"
                      min="10"
                      max="50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Measurements Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Measurements</CardTitle>
                    <CardDescription>Record roof section dimensions</CardDescription>
                  </div>
                  <Button size="sm" onClick={addMeasurement}>
                    Add Section
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {measurements.map((measurement) => (
                    <div key={measurement.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Input
                          value={measurement.label}
                          onChange={(e) => updateMeasurement(measurement.id, 'label', e.target.value)}
                          className="font-semibold"
                          placeholder="Section name"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeMeasurement(measurement.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs">Length (m)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={measurement.length}
                            onChange={(e) => updateMeasurement(measurement.id, 'length', e.target.value)}
                            placeholder="0.0"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Width (m)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={measurement.width}
                            onChange={(e) => updateMeasurement(measurement.id, 'width', e.target.value)}
                            placeholder="0.0"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Height (m)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={measurement.height}
                            onChange={(e) => updateMeasurement(measurement.id, 'height', e.target.value)}
                            placeholder="0.0"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Area (m²)</Label>
                          <Input
                            type="text"
                            value={measurement.area}
                            disabled
                            className="bg-slate-50 font-semibold"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Notes</Label>
                        <Input
                          value={measurement.notes}
                          onChange={(e) => updateMeasurement(measurement.id, 'notes', e.target.value)}
                          placeholder="Additional notes..."
                        />
                      </div>
                    </div>
                  ))}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-900">Total Area:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {measurements.reduce((sum, m) => sum + parseFloat(m.area || "0"), 0).toFixed(2)} m²
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="space-y-4">
            {/* Layers */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Layers</CardTitle>
                  <Button size="sm" variant="outline" onClick={addLayer}>
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {drawingState.layers.map((layer) => (
                    <div
                      key={layer.id}
                      className={`flex items-center justify-between p-2 rounded border ${
                        currentLayer === layer.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                      }`}
                      onClick={() => setCurrentLayer(layer.id)}
                    >
                      <span className="text-sm font-medium">{layer.name}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerVisibility(layer.id);
                          }}
                        >
                          {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerLock(layer.id);
                          }}
                        >
                          {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Site Photos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="photo-upload"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Camera className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-xs text-slate-600">Upload photos</p>
                  </label>
                </div>

                {photoPreview.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {photoPreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Site photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePhoto(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* General Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">General Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Add notes about the site, access, conditions, etc."
                  rows={6}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

