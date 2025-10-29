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
import { ArrowLeft, MapPin, Plus, Save, Search, Trash2, Maximize2, ZoomIn, ZoomOut, Navigation, BarChart3, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { MAPBOX_ACCESS_TOKEN } from "@/lib/mapbox-config";
import { Button } from "@/components/ui/button";

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
  const [totalArea, setTotalArea] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);

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
        if (data.totalArea) {
          setTotalArea(data.totalArea);
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
      zoomControl: false,
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
            const newTotalArea = updated
              .filter(m => m.area)
              .reduce((sum, m) => sum + (m.area || 0), 0);
            setTotalArea(newTotalArea);
            
            saveMeasurementMutation.mutate({
              projectId,
              measurementData: JSON.stringify({
                measurements: updated,
                address: currentAddress,
                totalArea: newTotalArea,
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
    if (project?.address) {
      setCurrentAddress(project.address);
      geocodeAddress(project.address).then(results => {
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
      console.error("Geocoding error:", error);
      toast({ title: "Error", description: "Failed to search address", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: GeocodingResult) => {
    const { place_name, center } = result;
    setCurrentAddress(place_name);
    setAddressSearch("");
    setSearchResults([]);
    
    if (mapRef.current) {
      mapRef.current.setView([center[1], center[0]], 19);
    }
  };

  const handleDeleteMeasurement = (id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  const handleSave = () => {
    if (!projectId || !drawnItemsRef.current) return;
    
    const newTotalArea = measurements
      .filter(m => m.area)
      .reduce((sum, m) => sum + (m.area || 0), 0);
    setTotalArea(newTotalArea);

    saveMeasurementMutation.mutate({
      projectId,
      measurementData: JSON.stringify({
        measurements,
        address: currentAddress,
        totalArea: newTotalArea,
      }),
      drawingData: JSON.stringify(drawnItemsRef.current.toGeoJSON()),
      notes: generalNotes,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading measurement tool...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLocation(`/projects/${projectId}`)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Site Measurement
                </h1>
                <p className="text-sm text-slate-500">Draw on satellite imagery to measure your roof</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/30"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Measurements
              </Button>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Maximize2 className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Map Container */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Map */}
          <div
            ref={mapContainerRef}
            className="flex-1 rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
            style={{ minHeight: "400px" }}
          />

          {/* Map Controls */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => mapRef.current?.zoomIn()}
              className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-blue-50 transition-all"
            >
              <ZoomIn className="w-5 h-5 text-blue-600" />
            </button>
            <button
              onClick={() => mapRef.current?.zoomOut()}
              className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-blue-50 transition-all"
            >
              <ZoomOut className="w-5 h-5 text-blue-600" />
            </button>
            <button
              onClick={() => mapRef.current?.locate()}
              className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-orange-50 transition-all"
            >
              <Navigation className="w-5 h-5 text-orange-600" />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="w-96 flex flex-col gap-4 overflow-y-auto">
            {/* Address Search */}
            <Card className="shadow-lg border-blue-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Search Address</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Enter address..."
                      value={addressSearch}
                      onChange={(e) => setAddressSearch(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSearch}
                      disabled={isSearching}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.slice(0, 5).map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectResult(result)}
                        className="w-full text-left p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-sm"
                      >
                        <p className="font-medium text-slate-900">{result.place_name}</p>
                      </button>
                    ))}
                  </div>
                )}

                {currentAddress && (
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-xs text-slate-500 mb-1">Current Location</p>
                    <p className="text-sm font-medium text-slate-900">{currentAddress}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Measurements Summary */}
            <Card className="shadow-lg border-orange-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  Measurements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {totalArea > 0 && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                    <p className="text-xs text-orange-600 font-medium mb-1">Total Area</p>
                    <p className="text-3xl font-bold text-orange-700">
                      {(totalArea / 1000000).toFixed(2)}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">m²</p>
                  </div>
                )}

                {measurements.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Draw shapes on the map to create measurements</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {measurements.map((measurement) => (
                      <div
                        key={measurement.id}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-slate-900">{measurement.label}</p>
                            <p className="text-xs text-slate-500 capitalize">{measurement.type}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteMeasurement(measurement.id)}
                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {measurement.area && (
                            <div className="bg-white rounded p-2">
                              <p className="text-slate-500">Area</p>
                              <p className="font-semibold text-slate-900">
                                {(measurement.area / 1000000).toFixed(2)} m²
                              </p>
                            </div>
                          )}
                          {measurement.perimeter && (
                            <div className="bg-white rounded p-2">
                              <p className="text-slate-500">Perimeter</p>
                              <p className="font-semibold text-slate-900">
                                {(measurement.perimeter / 1000).toFixed(2)} km
                              </p>
                            </div>
                          )}
                          {measurement.length && (
                            <div className="bg-white rounded p-2 col-span-2">
                              <p className="text-slate-500">Length</p>
                              <p className="font-semibold text-slate-900">
                                {(measurement.length / 1000).toFixed(2)} km
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="shadow-lg border-green-200/50 flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <Textarea
                  placeholder="Add any notes about this measurement..."
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  className="flex-1 resize-none"
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => setLocation(`/projects/${projectId}/calculator`)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                Next: Takeoff Calculator
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

