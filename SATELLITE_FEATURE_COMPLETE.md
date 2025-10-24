# Venturr Satellite Drawing Feature
## Inspired by Google Earth & NSW Spatial Services Explorer

**Status:** Ready to implement  
**Estimated Development Time:** 3-4 days  
**Impact:** Game-changing competitive advantage

---

## Executive Summary

This document outlines the implementation of a professional satellite drawing and measurement system for Venturr, combining the best features from Google Earth and NSW Spatial Services Explorer. This feature will enable contractors to measure roofs remotely with professional accuracy, eliminating the need for dangerous roof climbs for initial estimates.

---

## Key Features Adopted from Industry Leaders

### From Google Earth
1. **High-Quality Satellite Imagery** - Crystal clear aerial views
2. **3D Terrain Visualization** - Understand roof pitch and elevation
3. **Smooth Navigation** - Intuitive zoom, pan, tilt controls
4. **Measurement Tools** - Accurate distance and area calculations
5. **Historical Imagery** - View property changes over time
6. **Street View Integration** - Ground-level roof inspection

### From NSW Explorer
1. **Cadastral Data Overlay** - Property boundaries and lot numbers
2. **Address Search** - Instant location finding
3. **Layer Controls** - Toggle between satellite, topographic, cadastral
4. **Measurement Precision** - Metric units with high accuracy
5. **Print/Export** - Save measurements and imagery
6. **Professional UI** - Clean, government-grade interface

---

## Implementation Plan

### Phase 1: Core Satellite Drawing (Week 1)

#### Step 1: Set Up Mapbox Account
```bash
# Sign up at https://www.mapbox.com/
# Create API token with these scopes:
# - Maps:Read
# - Geocoding:Read
# - Styles:Read
```

#### Step 2: Install Dependencies
```bash
cd /home/ubuntu/venturr-production/client
pnpm add mapbox-gl @mapbox/mapbox-gl-draw @mapbox/mapbox-gl-geocoder @turf/turf
pnpm add -D @types/mapbox-gl @types/mapbox__mapbox-gl-draw
```

#### Step 3: Environment Configuration
**File:** `/home/ubuntu/venturr-production/client/.env`
```env
VITE_MAPBOX_ACCESS_TOKEN=pk.your_token_here
```

#### Step 4: Create Satellite Drawing Component

**New File:** `/home/ubuntu/venturr-production/client/src/components/SatelliteDrawing.tsx`

```typescript
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import * as turf from "@turf/turf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Trash2, Download, Save, Layers, Ruler, 
  Home, ZoomIn, ZoomOut, RotateCcw, Map as MapIcon 
} from "lucide-react";
import { toast } from "sonner";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

interface RoofMeasurement {
  area: number; // m²
  perimeter: number; // m
  length: number; // m (longest side)
  width: number; // m (shortest side)
  coordinates: number[][][];
  center: [number, number];
  pitch?: number; // degrees (if available)
}

interface SatelliteDrawingProps {
  address?: string;
  onMeasurementComplete?: (measurement: RoofMeasurement) => void;
  projectId?: string;
}

export function SatelliteDrawing({ 
  address, 
  onMeasurementComplete,
  projectId 
}: SatelliteDrawingProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  
  const [searchAddress, setSearchAddress] = useState(address || "");
  const [measurement, setMeasurement] = useState<RoofMeasurement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapStyle, setMapStyle] = useState<"satellite" | "hybrid" | "streets">("satellite");
  const [showLayers, setShowLayers] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map with satellite imagery
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: getMapStyle(mapStyle),
      center: [151.2093, -33.8688], // Sydney default
      zoom: 18,
      pitch: 45, // 3D tilt like Google Earth
      bearing: 0,
      antialias: true,
    });

    // Add 3D terrain
    map.current.on("load", () => {
      if (!map.current) return;
      
      // Add terrain source
      map.current.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
      
      // Add terrain layer for 3D effect
      map.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
      
      // Add sky layer for realism
      map.current.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 0.0],
          "sky-atmosphere-sun-intensity": 15,
        },
      });
    });

    // Initialize drawing tools
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        line_string: true,
        point: true,
        trash: true,
      },
      defaultMode: "draw_polygon",
      styles: getDrawStyles(),
    });

    map.current.addControl(draw.current);

    // Add geocoder (address search)
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      countries: "au",
      placeholder: "Search address in Australia...",
      marker: false,
    });

    map.current.addControl(geocoder, "top-left");

    // Add navigation controls (zoom, rotate, pitch)
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add scale control
    map.current.addControl(
      new mapboxgl.ScaleControl({ unit: "metric" }),
      "bottom-left"
    );

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

    // Listen for drawing events
    map.current.on("draw.create", updateMeasurement);
    map.current.on("draw.update", updateMeasurement);
    map.current.on("draw.delete", () => setMeasurement(null));

    // Search for address if provided
    if (address) {
      searchLocation(address);
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update map style when changed
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(getMapStyle(mapStyle));
    }
  }, [mapStyle]);

  const getMapStyle = (style: "satellite" | "hybrid" | "streets") => {
    switch (style) {
      case "satellite":
        return "mapbox://styles/mapbox/satellite-v9";
      case "hybrid":
        return "mapbox://styles/mapbox/satellite-streets-v12";
      case "streets":
        return "mapbox://styles/mapbox/streets-v12";
      default:
        return "mapbox://styles/mapbox/satellite-v9";
    }
  };

  const getDrawStyles = () => [
    // Polygon fill
    {
      id: "gl-draw-polygon-fill",
      type: "fill",
      filter: ["all", ["==", "$type", "Polygon"]],
      paint: {
        "fill-color": "#3b82f6",
        "fill-opacity": 0.3,
      },
    },
    // Polygon outline
    {
      id: "gl-draw-polygon-stroke-active",
      type: "line",
      filter: ["all", ["==", "$type", "Polygon"]],
      paint: {
        "line-color": "#3b82f6",
        "line-width": 3,
      },
    },
    // Vertices
    {
      id: "gl-draw-polygon-and-line-vertex-active",
      type: "circle",
      filter: ["all", ["==", "meta", "vertex"]],
      paint: {
        "circle-radius": 6,
        "circle-color": "#ffffff",
        "circle-stroke-color": "#3b82f6",
        "circle-stroke-width": 2,
      },
    },
    // Midpoints
    {
      id: "gl-draw-polygon-midpoint",
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
      paint: {
        "circle-radius": 4,
        "circle-color": "#fbbf24",
      },
    },
  ];

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      toast.error("Please enter an address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxgl.accessToken}&country=AU&limit=1`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        map.current?.flyTo({
          center: [lng, lat],
          zoom: 19,
          pitch: 45,
          bearing: 0,
          duration: 2000,
          essential: true,
        });

        // Add marker
        new mapboxgl.Marker({ color: "#3b82f6" })
          .setLngLat([lng, lat])
          .addTo(map.current!);

        toast.success("Location found! Draw the roof outline.");
      } else {
        toast.error("Address not found. Try a different search.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to search address");
    } finally {
      setIsLoading(false);
    }
  };

  const updateMeasurement = () => {
    if (!draw.current) return;

    const data = draw.current.getAll();
    
    if (data.features.length === 0) {
      setMeasurement(null);
      return;
    }

    const polygon = data.features[0];
    
    if (polygon.geometry.type !== "Polygon") return;

    // Calculate area in m²
    const area = turf.area(polygon);

    // Calculate perimeter in m
    const perimeter = turf.length(polygon, { units: "meters" });

    // Get bounding box to estimate length and width
    const bbox = turf.bbox(polygon);
    const [minLng, minLat, maxLng, maxLat] = bbox;

    // Calculate approximate length and width
    const lengthLine = turf.lineString([
      [minLng, minLat],
      [maxLng, minLat],
    ]);
    const widthLine = turf.lineString([
      [minLng, minLat],
      [minLng, maxLat],
    ]);

    const length = turf.length(lengthLine, { units: "meters" });
    const width = turf.length(widthLine, { units: "meters" });

    // Calculate center point
    const center = turf.center(polygon);
    const centerCoords = center.geometry.coordinates as [number, number];

    const roofMeasurement: RoofMeasurement = {
      area,
      perimeter,
      length: Math.max(length, width),
      width: Math.min(length, width),
      coordinates: polygon.geometry.coordinates,
      center: centerCoords,
    };

    setMeasurement(roofMeasurement);
    
    if (onMeasurementComplete) {
      onMeasurementComplete(roofMeasurement);
    }

    // Show measurement popup
    if (map.current) {
      new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(centerCoords)
        .setHTML(`
          <div style="padding: 8px;">
            <strong>Roof Area:</strong> ${area.toFixed(2)} m²<br/>
            <strong>Perimeter:</strong> ${perimeter.toFixed(2)} m
          </div>
        `)
        .addTo(map.current);
    }
  };

  const clearDrawing = () => {
    if (draw.current) {
      draw.current.deleteAll();
      setMeasurement(null);
      toast.info("Drawing cleared");
    }
  };

  const exportToCalculator = () => {
    if (!measurement) {
      toast.error("Please draw a roof outline first");
      return;
    }

    // Store measurement in localStorage for calculator to pick up
    localStorage.setItem("roofMeasurement", JSON.stringify(measurement));
    
    toast.success("Measurement exported! Opening calculator...");
    
    // Navigate to calculator
    if (projectId) {
      window.location.href = `/projects/${projectId}/calculator-enhanced`;
    } else {
      window.location.href = `/calculator-enhanced`;
    }
  };

  const resetView = () => {
    map.current?.flyTo({
      center: [151.2093, -33.8688],
      zoom: 18,
      pitch: 45,
      bearing: 0,
      duration: 1500,
    });
  };

  const togglePitch = () => {
    const currentPitch = map.current?.getPitch() || 0;
    map.current?.easeTo({
      pitch: currentPitch > 0 ? 0 : 45,
      duration: 500,
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={mapStyle === "satellite" ? "default" : "outline"}
              size="sm"
              onClick={() => setMapStyle("satellite")}
            >
              Satellite
            </Button>
            <Button
              variant={mapStyle === "hybrid" ? "default" : "outline"}
              size="sm"
              onClick={() => setMapStyle("hybrid")}
            >
              Hybrid
            </Button>
            <Button
              variant={mapStyle === "streets" ? "default" : "outline"}
              size="sm"
              onClick={() => setMapStyle("streets")}
            >
              Streets
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={togglePitch}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Toggle 3D
            </Button>
            <Button variant="outline" size="sm" onClick={resetView}>
              <Home className="w-4 h-4 mr-2" />
              Reset View
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle>Draw Roof Outline</CardTitle>
          <CardDescription>
            Click on the map to draw the roof outline. Double-click to finish. Use the search bar to find your property.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            ref={mapContainer}
            className="w-full h-[600px] rounded-lg overflow-hidden border border-slate-200"
          />
        </CardContent>
      </Card>

      {/* Measurement Results */}
      {measurement && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Roof Measurements</CardTitle>
            <CardDescription className="text-blue-700">
              Calculated from your drawing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <Label className="text-sm text-slate-600">Roof Area</Label>
                <p className="text-3xl font-bold text-blue-600">
                  {measurement.area.toFixed(2)}
                </p>
                <p className="text-sm text-slate-500">m²</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <Label className="text-sm text-slate-600">Perimeter</Label>
                <p className="text-3xl font-bold text-slate-900">
                  {measurement.perimeter.toFixed(2)}
                </p>
                <p className="text-sm text-slate-500">m</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <Label className="text-sm text-slate-600">Length</Label>
                <p className="text-2xl font-semibold text-slate-700">
                  {measurement.length.toFixed(2)}
                </p>
                <p className="text-sm text-slate-500">m</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <Label className="text-sm text-slate-600">Width</Label>
                <p className="text-2xl font-semibold text-slate-700">
                  {measurement.width.toFixed(2)}
                </p>
                <p className="text-sm text-slate-500">m</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={exportToCalculator} className="flex-1" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Export to Calculator
              </Button>
              <Button variant="outline" onClick={clearDrawing} size="lg">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="tips">Pro Tips</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-3 text-sm">
              <ol className="list-decimal list-inside space-y-2">
                <li>Use the search bar to find your property address</li>
                <li>Wait for the satellite image to load</li>
                <li>Click on the map to start drawing the roof outline</li>
                <li>Click each corner of the roof to create the shape</li>
                <li>Double-click to finish the drawing</li>
                <li>Review the calculated measurements</li>
                <li>Click "Export to Calculator" to use these measurements</li>
              </ol>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-3 text-sm">
              <ul className="space-y-2">
                <li><strong>3D View:</strong> Click "Toggle 3D" to tilt the map and see roof pitch</li>
                <li><strong>Rotate:</strong> Hold Ctrl (Cmd on Mac) and drag to rotate the view</li>
                <li><strong>Zoom:</strong> Scroll wheel or pinch to zoom in/out</li>
                <li><strong>Pan:</strong> Click and drag to move around</li>
                <li><strong>Layers:</strong> Switch between Satellite, Hybrid, and Streets views</li>
                <li><strong>Edit:</strong> Click on a drawn shape to edit vertices</li>
              </ul>
            </TabsContent>
            
            <TabsContent value="tips" className="space-y-3 text-sm">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-semibold text-blue-900">Accuracy Tips:</p>
                  <ul className="mt-2 space-y-1 text-blue-800">
                    <li>• Zoom in as close as possible (zoom level 19-20)</li>
                    <li>• Use 3D view to identify roof edges clearly</li>
                    <li>• Draw from corner to corner, not along edges</li>
                    <li>• For complex roofs, draw each section separately</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-semibold text-green-900">Best Practices:</p>
                  <ul className="mt-2 space-y-1 text-green-800">
                    <li>• Measure on a clear, sunny day image</li>
                    <li>• Avoid shadows when possible</li>
                    <li>• Check measurements against known dimensions</li>
                    <li>• Add 10-15% waste factor in calculator</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="font-semibold text-amber-900">Limitations:</p>
                  <ul className="mt-2 space-y-1 text-amber-800">
                    <li>• Satellite measurements are estimates (±5-10%)</li>
                    <li>• Always verify critical dimensions on-site</li>
                    <li>• Pitch estimation requires 3D view or site visit</li>
                    <li>• Complex roofs may need multiple drawings</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Next Steps

1. **Get Mapbox API Key** - Sign up at mapbox.com
2. **Install Dependencies** - Run pnpm install commands
3. **Create Component** - Add SatelliteDrawing.tsx
4. **Create Page** - Add SiteMeasure.tsx
5. **Update Router** - Add routes
6. **Test** - Verify all features work
7. **Deploy** - Push to production

This feature will transform Venturr into the most advanced roofing platform in Australia!

