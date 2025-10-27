import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  Loader2, 
  Save, 
  Search,
  MapPin,
  Ruler,
  Trash2,
  Undo2,
  Redo2,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/mapbox-config';
import { geocodeAddress, GeocodingResult } from '@/lib/mapbox-geocoding';

// Set Mapbox access token
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

interface MeasurementData {
  id: string;
  type: string;
  area?: number;
  perimeter?: number;
  length?: number;
  coordinates: any;
  notes: string;
}

export default function MapboxSiteMeasurement() {
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

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  // State
  const [mapLoaded, setMapLoaded] = useState(false);
  const [addressSearch, setAddressSearch] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Disable workers to avoid CSP issues
    (mapboxgl as any).workerCount = 0;

    // Create map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAPBOX_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: 0, // Top-down view for measurements
      bearing: 0,
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add scale control
    map.addControl(new mapboxgl.ScaleControl({
      maxWidth: 200,
      unit: 'metric'
    }), 'bottom-right');

    // Initialize drawing tools
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        line_string: true,
        point: true,
        trash: true
      },
      defaultMode: 'simple_select'
    });

    map.addControl(draw, 'top-left');

    // Handle map load
    map.on('load', () => {
      setMapLoaded(true);
      toast.success("Map loaded successfully");
    });

    // Handle drawing events
    map.on('draw.create', updateMeasurements);
    map.on('draw.update', updateMeasurements);
    map.on('draw.delete', updateMeasurements);

    mapRef.current = map;
    drawRef.current = draw;

    // If project has an address, geocode and fly to it
    if (project?.address) {
      geocodeAndFlyTo(project.address);
    }

    // Cleanup
    return () => {
      map.remove();
    };
  }, [project]);

  // Update measurements from drawn features
  const updateMeasurements = () => {
    if (!drawRef.current) return;

    const data = drawRef.current.getAll();
    const newMeasurements: MeasurementData[] = data.features.map((feature: any) => {
      const measurement: MeasurementData = {
        id: feature.id,
        type: feature.geometry.type,
        coordinates: feature.geometry.coordinates,
        notes: ""
      };

      // Calculate area for polygons
      if (feature.geometry.type === 'Polygon') {
        const area = calculatePolygonArea(feature.geometry.coordinates[0]);
        measurement.area = area;
        measurement.perimeter = calculatePolygonPerimeter(feature.geometry.coordinates[0]);
      }

      // Calculate length for lines
      if (feature.geometry.type === 'LineString') {
        measurement.length = calculateLineLength(feature.geometry.coordinates);
      }

      return measurement;
    });

    setMeasurements(newMeasurements);
  };

  // Calculate polygon area using Turf.js formula
  const calculatePolygonArea = (coordinates: number[][]): number => {
    let area = 0;
    const numPoints = coordinates.length;

    for (let i = 0; i < numPoints - 1; i++) {
      const [x1, y1] = coordinates[i];
      const [x2, y2] = coordinates[i + 1];
      area += (x1 * y2) - (x2 * y1);
    }

    area = Math.abs(area / 2);

    // Convert to square meters (approximate)
    const metersPerDegree = 111320; // at equator
    area = area * Math.pow(metersPerDegree, 2);

    return Math.round(area * 100) / 100;
  };

  // Calculate polygon perimeter
  const calculatePolygonPerimeter = (coordinates: number[][]): number => {
    let perimeter = 0;

    for (let i = 0; i < coordinates.length - 1; i++) {
      perimeter += calculateDistance(coordinates[i], coordinates[i + 1]);
    }

    return Math.round(perimeter * 100) / 100;
  };

  // Calculate line length
  const calculateLineLength = (coordinates: number[][]): number => {
    let length = 0;

    for (let i = 0; i < coordinates.length - 1; i++) {
      length += calculateDistance(coordinates[i], coordinates[i + 1]);
    }

    return Math.round(length * 100) / 100;
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (coord1: number[], coord2: number[]): number => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Search for address
  const handleAddressSearch = async () => {
    if (!addressSearch.trim()) {
      toast.error("Please enter an address");
      return;
    }

    setIsSearching(true);
    try {
      const results = await geocodeAddress(addressSearch, 'au');
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.error("No results found");
      } else {
        toast.success(`Found ${results.length} result(s)`);
      }
    } catch (error) {
      toast.error("Failed to search address");
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  // Geocode and fly to address
  const geocodeAndFlyTo = async (address: string) => {
    try {
      const results = await geocodeAddress(address, 'au');
      if (results.length > 0) {
        flyToLocation(results[0]);
      }
    } catch (error) {
      console.error("Failed to geocode address:", error);
    }
  };

  // Fly to selected location
  const flyToLocation = (result: GeocodingResult) => {
    if (!mapRef.current) return;

    mapRef.current.flyTo({
      center: result.center,
      zoom: DEFAULT_ZOOM,
      duration: 2000
    });

    // Add marker
    new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat(result.center)
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${result.place_name}</strong>`))
      .addTo(mapRef.current);

    setCurrentAddress(result.place_name);
    setSearchResults([]);
    toast.success("Location found!");
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  // Clear all drawings
  const handleClearAll = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
      setMeasurements([]);
      toast.success("All measurements cleared");
    }
  };

  // Export measurements
  const handleExport = () => {
    if (!drawRef.current) return;

    const data = {
      type: 'FeatureCollection',
      features: drawRef.current.getAll().features,
      measurements,
      address: currentAddress,
      notes: generalNotes,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `measurement-${projectId || 'export'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Measurements exported");
  };

  // Save measurement
  const handleSave = async () => {
    if (!projectId) {
      toast.error("No project selected");
      return;
    }

    if (measurements.length === 0) {
      toast.error("Please add at least one measurement");
      return;
    }

    const totalArea = measurements
      .filter(m => m.area)
      .reduce((sum, m) => sum + (m.area || 0), 0);

    try {
      await createMeasurementMutation.mutateAsync({
        projectId,
        measurementData: JSON.stringify({
          features: drawRef.current?.getAll().features || [],
          measurements,
          address: currentAddress,
          totalArea,
        }),
        drawingData: JSON.stringify(drawRef.current?.getAll() || {}),
        notes: generalNotes,
      });
    } catch (error) {
      toast.error("Failed to save measurement");
      console.error(error);
    }
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
                <h1 className="text-2xl font-bold text-slate-900">Satellite Site Measurement</h1>
                {project && <p className="text-sm text-slate-600">{project.title}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
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
          {/* Map Container - Takes 3 columns */}
          <div className="xl:col-span-3 space-y-4">
            {/* Address Search */}
            <Card>
              <CardHeader>
                <CardTitle>Find Location</CardTitle>
                <CardDescription>Search for the property address to begin measuring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter property address (e.g., 123 Main St, Sydney NSW)"
                        value={addressSearch}
                        onChange={(e) => setAddressSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                      />
                    </div>
                    <Button onClick={handleAddressSearch} disabled={isSearching}>
                      {isSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Search Results:</Label>
                      {searchResults.map((result, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => flyToLocation(result)}
                        >
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">{result.place_name}</span>
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Current Address */}
                  {currentAddress && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">{currentAddress}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Satellite View</CardTitle>
                    <CardDescription>Draw polygons and lines to measure roof areas</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={mapLoaded ? "default" : "outline"}>
                      {mapLoaded ? "Map Ready" : "Loading..."}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Map Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={handleZoomIn}>
                      <ZoomIn className="w-4 h-4 mr-1" />
                      Zoom In
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleZoomOut}>
                      <ZoomOut className="w-4 h-4 mr-1" />
                      Zoom Out
                    </Button>
                    <Button size="sm" variant="destructive" onClick={handleClearAll}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear All
                    </Button>
                  </div>

                  {/* Map Container */}
                  <div 
                    ref={mapContainerRef} 
                    className="w-full h-[600px] rounded-lg border-2 border-slate-300 shadow-lg"
                  />

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">How to Measure:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Use the polygon tool (left panel) to draw roof areas</li>
                      <li>• Use the line tool to measure individual edges</li>
                      <li>• Click points to create shapes, double-click to finish</li>
                      <li>• Measurements are calculated automatically in square meters</li>
                      <li>• Use the trash icon to delete selected features</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Measurements Summary */}
          <div className="xl:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Measurements</CardTitle>
                <CardDescription>
                  {measurements.length} measurement{measurements.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {measurements.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No measurements yet. Start drawing on the map.
                    </p>
                  ) : (
                    measurements.map((measurement, index) => (
                      <div key={measurement.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{measurement.type}</Badge>
                          <span className="text-xs text-slate-500">#{index + 1}</span>
                        </div>
                        {measurement.area && (
                          <div className="text-sm">
                            <strong>Area:</strong> {measurement.area.toFixed(2)} m²
                          </div>
                        )}
                        {measurement.perimeter && (
                          <div className="text-sm">
                            <strong>Perimeter:</strong> {measurement.perimeter.toFixed(2)} m
                          </div>
                        )}
                        {measurement.length && (
                          <div className="text-sm">
                            <strong>Length:</strong> {measurement.length.toFixed(2)} m
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {/* Total Area */}
                  {measurements.some(m => m.area) && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm font-semibold text-blue-900 mb-1">Total Roof Area</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {measurements
                          .filter(m => m.area)
                          .reduce((sum, m) => sum + (m.area || 0), 0)
                          .toFixed(2)} m²
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add notes about the site, roof condition, access, etc."
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
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

