import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { geocodeAddress, type GeocodingResult } from "@/lib/mapbox-geocoding";
import { toast as toastFn } from "sonner";
import { trpc } from "@/lib/trpc";
import L from "leaflet";
import 'leaflet-geometryutil';
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, MapPin, Plus, Save, Search, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { MAPBOX_ACCESS_TOKEN } from "@/lib/mapbox-config";

// Fix Leaflet default icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MeasurementData {
  id: string;
  type: 'polygon' | 'rectangle' | 'polyline';
  area?: number;
  perimeter?: number;
  length?: number;
  label: string;
  notes: string;
}

export default function LeafletSiteMeasurement() {
  const { id: projectId } = useParams();
  const [, setLocation] = useLocation();
  const toast = (props: { title?: string; description?: string; variant?: string }) => {
    if (props.variant === 'destructive') {
      toastFn.error(props.description || props.title || 'Error');
    } else {
      toastFn.success(props.description || props.title || 'Success');
    }
  };
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Fetch project data
  const { data: project } = trpc.projects.get.useQuery(
    { id: projectId! },
    { enabled: !!projectId && isAuthenticated }
  );

  // Fetch existing measurements
  const { data: existingMeasurement } = trpc.measurements.get.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId && isAuthenticated }
  );

  const saveMeasurementMutation = trpc.measurements.save.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Measurements saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save measurements", variant: "destructive" });
    },
  });

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);

  // State
  const [mapLoaded, setMapLoaded] = useState(false);
  const [addressSearch, setAddressSearch] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Load existing measurements
  useEffect(() => {
    if (existingMeasurement && existingMeasurement.measurementData) {
      try {
        const data = JSON.parse(existingMeasurement.measurementData);
        if (data.measurements) {
          setMeasurements(data.measurements);
        }
        if (data.address) {
          setCurrentAddress(data.address);
        }
      } catch (error) {
        console.error("Failed to parse existing measurements:", error);
      }
    }
    if (existingMeasurement && existingMeasurement.notes) {
      setGeneralNotes(existingMeasurement.notes);
    }
  }, [existingMeasurement]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center (Sydney)
    const DEFAULT_CENTER: [number, number] = [-33.8688, 151.2093];
    const DEFAULT_ZOOM = 18;

    // Create map
    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    // Add Mapbox satellite tile layer
    L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`,
      {
        attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 22,
      }
    ).addTo(map);

    // Initialize feature group for drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    // Initialize draw control
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          metric: true,
        },
        rectangle: {
          showArea: true,
          metric: true,
        },
        polyline: {
          metric: true,
        },
        circle: false,
        circlemarker: false,
        marker: false,
      },
    });
    map.addControl(drawControl);

    // Handle draw events
    map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      const type = event.layerType;
      
      drawnItems.addLayer(layer);

      // Calculate measurements
      let area, perimeter, length;
      if (type === 'polygon' || type === 'rectangle') {
        const latlngs = layer.getLatLngs()[0];
        area = L.GeometryUtil.geodesicArea(latlngs);
        perimeter = 0;
        for (let i = 0; i < latlngs.length; i++) {
          const next = (i + 1) % latlngs.length;
          perimeter += latlngs[i].distanceTo(latlngs[next]);
        }
      } else if (type === 'polyline') {
        const latlngs = layer.getLatLngs();
        length = 0;
        for (let i = 0; i < latlngs.length - 1; i++) {
          length += latlngs[i].distanceTo(latlngs[i + 1]);
        }
      }

      const measurement: MeasurementData = {
        id: Date.now().toString(),
        type: type as 'polygon' | 'rectangle' | 'polyline',
        area: area ? Math.round(area * 100) / 100 : undefined,
        perimeter: perimeter ? Math.round(perimeter * 100) / 100 : undefined,
        length: length ? Math.round(length * 100) / 100 : undefined,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${measurements.length + 1}`,
        notes: "",
      };

      setMeasurements(prev => {
        const updated = [...prev, measurement];
        // Auto-save after drawing (debounced)
        setTimeout(() => {
          if (projectId && drawnItemsRef.current) {
            const totalArea = updated
              .filter(m => m.area)
              .reduce((sum, m) => sum + (m.area || 0), 0);
            
            saveMeasurementMutation.mutate({
              projectId,
              measurementData: JSON.stringify({
                measurements: updated,
                address: currentAddress,
                totalArea,
              }),
              drawingData: JSON.stringify(drawnItemsRef.current.toGeoJSON()),
              notes: generalNotes,
            });
          }
        }, 1000);
        return updated;
      });
    });

    mapRef.current = map;
    setMapLoaded(true);

    // Try to geocode project address if available
    if (project?.propertyAddress) {
      setCurrentAddress(project.propertyAddress);
      geocodeAddress(project.propertyAddress).then(results => {
        if (results.length > 0) {
          const { center } = results[0];
          map.setView([center[1], center[0]], 19);
        }
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [project]);

  // Search address
  const handleSearch = async () => {
    if (!addressSearch.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await geocodeAddress(addressSearch);
      setSearchResults(results);
    } catch (error) {
      toast({ title: "Error", description: "Failed to search address", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  // Select search result
  const handleSelectResult = (result: GeocodingResult) => {
    if (mapRef.current) {
      const { center } = result;
      mapRef.current.setView([center[1], center[0]], 19);
      setCurrentAddress(result.place_name);
      setSearchResults([]);
      setAddressSearch("");
    }
  };

  // Save measurement
  const handleSave = async () => {
    if (!projectId || !drawnItemsRef.current) return;

    const totalArea = measurements
      .filter(m => m.area)
      .reduce((sum, m) => sum + (m.area || 0), 0);

    try {
      await saveMeasurementMutation.mutateAsync({
        projectId,
        measurementData: JSON.stringify({
          measurements,
          address: currentAddress,
          totalArea,
        }),
        drawingData: JSON.stringify(drawnItemsRef.current.toGeoJSON()),
        notes: generalNotes,
      });
      toast({ title: "Success", description: "Measurements saved successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save measurements", variant: "destructive" });
      console.error(error);
    }
  };

  // Update measurement
  const updateMeasurement = (id: string, field: 'label' | 'notes', value: string) => {
    setMeasurements(prev =>
      prev.map(m => m.id === id ? { ...m, [field]: value } : m)
    );
  };

  // Delete measurement
  const deleteMeasurement = (id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  const totalArea = measurements
    .filter(m => m.area)
    .reduce((sum, m) => sum + (m.area || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation(`/projects/${projectId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Site Measurement</h1>
                <p className="text-sm text-slate-600">{project?.title || "Loading..."}</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={measurements.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              Save Measurement
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Satellite Map</CardTitle>
                <CardDescription>
                  Use the drawing tools to measure areas and distances
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Address Search */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Search address..."
                        value={addressSearch}
                        onChange={(e) => setAddressSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto z-20">
                          {searchResults.map((result, idx) => (
                            <button
                              key={idx}
                              className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-start gap-2"
                              onClick={() => handleSelectResult(result)}
                            >
                              <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-slate-400" />
                              <div>
                                <div className="font-medium text-sm">{result.place_name.split(',')[0]}</div>
                                <div className="text-xs text-slate-600">{result.place_name}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button onClick={handleSearch} disabled={isSearching}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  {currentAddress && (
                    <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {currentAddress}
                    </div>
                  )}
                </div>

                {/* Map Container */}
                <div
                  ref={mapContainerRef}
                  className="w-full h-[600px] rounded-lg border"
                />
              </CardContent>
            </Card>
          </div>

          {/* Measurements Panel */}
          <div className="space-y-4">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Total Shapes:</span>
                    <span className="font-medium">{measurements.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Total Area:</span>
                    <span className="font-medium">{totalArea.toFixed(2)} m²</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Measurements List */}
            <Card>
              <CardHeader>
                <CardTitle>Measurements</CardTitle>
                <CardDescription>
                  {measurements.length === 0 ? "No measurements yet" : `${measurements.length} measurement(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {measurements.map((measurement) => (
                  <div key={measurement.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Input
                        value={measurement.label}
                        onChange={(e) => updateMeasurement(measurement.id, 'label', e.target.value)}
                        className="font-medium"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMeasurement(measurement.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    
                    {measurement.area && (
                      <div className="text-sm">
                        <span className="text-slate-600">Area:</span>{" "}
                        <span className="font-medium">{measurement.area.toFixed(2)} m²</span>
                      </div>
                    )}
                    
                    {measurement.perimeter && (
                      <div className="text-sm">
                        <span className="text-slate-600">Perimeter:</span>{" "}
                        <span className="font-medium">{measurement.perimeter.toFixed(2)} m</span>
                      </div>
                    )}
                    
                    {measurement.length && (
                      <div className="text-sm">
                        <span className="text-slate-600">Length:</span>{" "}
                        <span className="font-medium">{measurement.length.toFixed(2)} m</span>
                      </div>
                    )}
                    
                    <Textarea
                      placeholder="Add notes..."
                      value={measurement.notes}
                      onChange={(e) => updateMeasurement(measurement.id, 'notes', e.target.value)}
                      className="text-sm"
                      rows={2}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* General Notes */}
            <Card>
              <CardHeader>
                <CardTitle>General Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add general notes about this measurement..."
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

