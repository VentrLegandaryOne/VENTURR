# Satellite Drawing Feature - Implementation Plan

**Purpose:** Enable users to draw roof outlines directly on satellite imagery for accurate measurements

**Inspired by:** Google Maps drawing tools, RoofSnap, GAF QuickMeasure

---

## Overview

This feature will transform Venturr into a complete roof measurement solution by allowing contractors to:

1. Enter a property address
2. Load high-resolution satellite imagery
3. Draw roof outlines using polygon tools
4. Automatically calculate roof dimensions
5. Export measurements to the calculator
6. Save drawings for future reference

---

## Technology Stack

### Map Provider Options

**Option 1: Google Maps JavaScript API** (Recommended)
- **Pros:** Best satellite imagery quality, familiar interface, comprehensive documentation
- **Cons:** Requires API key, costs $7 per 1000 map loads after free tier
- **Free Tier:** $200/month credit (≈28,500 map loads)

**Option 2: Mapbox GL JS**
- **Pros:** Beautiful maps, good drawing tools, generous free tier
- **Cons:** Satellite imagery not as detailed as Google
- **Free Tier:** 50,000 map loads/month

**Option 3: Leaflet + OpenStreetMap**
- **Pros:** Completely free, open source
- **Cons:** Limited satellite imagery, requires multiple tile providers

**Recommendation:** Start with Mapbox (free tier), add Google Maps as premium feature later

---

## Implementation Steps

### Phase 1: Basic Map Integration

#### Step 1: Install Dependencies

```bash
cd /home/ubuntu/venturr-production/client
pnpm add mapbox-gl @mapbox/mapbox-gl-draw @turf/turf
pnpm add -D @types/mapbox-gl @types/mapbox__mapbox-gl-draw
```

#### Step 2: Get Mapbox API Key

1. Sign up at https://www.mapbox.com/
2. Create access token
3. Add to environment variables

**File:** `/home/ubuntu/venturr-production/client/.env`

```env
VITE_MAPBOX_ACCESS_TOKEN=your_token_here
```

#### Step 3: Create Satellite Drawing Component

**New File:** `/home/ubuntu/venturr-production/client/src/components/SatelliteDrawing.tsx`

```typescript
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Trash2, Download, Save } from "lucide-react";
import { toast } from "sonner";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

interface RoofMeasurement {
  area: number; // m²
  perimeter: number; // m
  length: number; // m (longest side)
  width: number; // m (shortest side)
  coordinates: number[][][];
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

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [151.2093, -33.8688], // Sydney default
      zoom: 18,
      pitch: 0,
      bearing: 0,
    });

    // Initialize drawing tools
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: "draw_polygon",
      styles: [
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
      ],
    });

    map.current.addControl(draw.current);

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add scale
    map.current.addControl(
      new mapboxgl.ScaleControl({ unit: "metric" }),
      "bottom-left"
    );

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

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      toast.error("Please enter an address");
      return;
    }

    setIsLoading(true);

    try {
      // Geocode address using Mapbox Geocoding API
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
          pitch: 0,
          bearing: 0,
          duration: 2000,
        });

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

    const roofMeasurement: RoofMeasurement = {
      area,
      perimeter,
      length: Math.max(length, width),
      width: Math.min(length, width),
      coordinates: polygon.geometry.coordinates,
    };

    setMeasurement(roofMeasurement);
    
    if (onMeasurementComplete) {
      onMeasurementComplete(roofMeasurement);
    }
  };

  const clearDrawing = () => {
    if (draw.current) {
      draw.current.deleteAll();
      setMeasurement(null);
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

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Find Property</CardTitle>
          <CardDescription>
            Enter the property address to load satellite imagery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter address (e.g., 45 Ocean View Dr, Bondi Beach NSW)"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    searchLocation(searchAddress);
                  }
                }}
              />
            </div>
            <Button
              onClick={() => searchLocation(searchAddress)}
              disabled={isLoading}
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle>Draw Roof Outline</CardTitle>
          <CardDescription>
            Click on the map to draw the roof outline. Double-click to finish.
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
        <Card>
          <CardHeader>
            <CardTitle>Roof Measurements</CardTitle>
            <CardDescription>
              Calculated from your drawing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Roof Area</Label>
                <p className="text-2xl font-bold text-blue-600">
                  {measurement.area.toFixed(2)} m²
                </p>
              </div>
              <div>
                <Label>Perimeter</Label>
                <p className="text-2xl font-bold text-slate-900">
                  {measurement.perimeter.toFixed(2)} m
                </p>
              </div>
              <div>
                <Label>Length (approx)</Label>
                <p className="text-xl font-semibold text-slate-700">
                  {measurement.length.toFixed(2)} m
                </p>
              </div>
              <div>
                <Label>Width (approx)</Label>
                <p className="text-xl font-semibold text-slate-700">
                  {measurement.width.toFixed(2)} m
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={exportToCalculator} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Export to Calculator
              </Button>
              <Button variant="outline" onClick={clearDrawing}>
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
        <CardContent className="space-y-2 text-sm text-slate-600">
          <ol className="list-decimal list-inside space-y-2">
            <li>Enter the property address and click Search</li>
            <li>Wait for the satellite image to load</li>
            <li>Click on the map to start drawing the roof outline</li>
            <li>Click each corner of the roof to create the shape</li>
            <li>Double-click to finish the drawing</li>
            <li>Review the calculated measurements</li>
            <li>Click "Export to Calculator" to use these measurements</li>
          </ol>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-semibold text-blue-900">Pro Tip:</p>
            <p className="text-blue-800">
              Zoom in as close as possible for the most accurate measurements.
              Use the satellite view to identify roof edges clearly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Step 4: Create Satellite Drawing Page

**New File:** `/home/ubuntu/venturr-production/client/src/pages/SiteMeasure.tsx`

```typescript
import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SatelliteDrawing } from "@/components/SatelliteDrawing";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

export default function SiteMeasure() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/projects/:id/site-measure");
  const projectId = params?.id;

  const { data: project } = trpc.projects.get.useQuery(
    { id: projectId! },
    { enabled: !!projectId }
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [authLoading, isAuthenticated]);

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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setLocation(projectId ? `/projects/${projectId}` : "/dashboard")
                }
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {projectId ? "Back to Project" : "Back to Dashboard"}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Satellite Site Measure
                </h1>
                <p className="text-sm text-slate-600">
                  Draw roof outlines on satellite imagery for accurate measurements
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {project && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {project.title}
            </h2>
            <p className="text-slate-600">{project.address}</p>
          </div>
        )}

        <SatelliteDrawing
          address={project?.address}
          projectId={projectId}
          onMeasurementComplete={(measurement) => {
            console.log("Measurement complete:", measurement);
          }}
        />
      </main>
    </div>
  );
}
```

#### Step 5: Update Router

**File:** `/home/ubuntu/venturr-production/client/src/App.tsx`

Add the route:

```typescript
import SiteMeasure from "./pages/SiteMeasure";

// In the routes section:
<Route path="/projects/:id/site-measure" component={SiteMeasure} />
<Route path="/site-measure" component={SiteMeasure} />
```

#### Step 6: Update ProjectDetail to Link to Site Measure

**File:** `/home/ubuntu/venturr-production/client/src/pages/ProjectDetail.tsx`

Update the Site Measure button:

```typescript
<Button
  variant="outline"
  className="flex-1"
  onClick={() => setLocation(`/projects/${id}/site-measure`)}
>
  <MapPin className="w-4 h-4 mr-2" />
  Site Measure
</Button>
```

#### Step 7: Update Enhanced Calculator to Import Measurements

**File:** `/home/ubuntu/venturr-production/client/src/pages/CalculatorEnhancedLabor.tsx`

Add this useEffect at the top of the component:

```typescript
useEffect(() => {
  // Check if there's a measurement from satellite drawing
  const savedMeasurement = localStorage.getItem("roofMeasurement");
  
  if (savedMeasurement) {
    try {
      const measurement = JSON.parse(savedMeasurement);
      
      // Auto-fill dimensions
      setFormData(prev => ({
        ...prev,
        roofLength: measurement.length.toFixed(1),
        roofWidth: measurement.width.toFixed(1),
      }));
      
      toast.success("Satellite measurements imported!");
      
      // Clear the stored measurement
      localStorage.removeItem("roofMeasurement");
    } catch (error) {
      console.error("Failed to import measurement:", error);
    }
  }
}, []);
```

---

### Phase 2: Advanced Features

#### Feature 1: Save Drawings to Database

**Database Schema:**

```sql
CREATE TABLE roof_drawings (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  address TEXT,
  coordinates JSONB NOT NULL,
  area DECIMAL(10, 2) NOT NULL,
  perimeter DECIMAL(10, 2) NOT NULL,
  length DECIMAL(10, 2) NOT NULL,
  width DECIMAL(10, 2) NOT NULL,
  center_lat DECIMAL(10, 7),
  center_lng DECIMAL(10, 7),
  zoom_level INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roof_drawings_project ON roof_drawings(project_id);
CREATE INDEX idx_roof_drawings_user ON roof_drawings(user_id);
```

#### Feature 2: Multiple Roof Sections

Allow drawing multiple polygons for complex roofs with multiple sections.

#### Feature 3: Pitch Estimation

Use 3D building data or Street View to estimate roof pitch.

#### Feature 4: Automatic Roof Detection

Use AI/ML to automatically detect and outline roofs (future enhancement).

---

## Testing Procedures

### Manual Testing

1. **Address Search:**
   - [ ] Search for Sydney address
   - [ ] Search for Brisbane address
   - [ ] Search for Melbourne address
   - [ ] Handle invalid address gracefully

2. **Drawing:**
   - [ ] Draw simple rectangle roof
   - [ ] Draw complex multi-sided roof
   - [ ] Edit existing drawing
   - [ ] Delete drawing
   - [ ] Measurements update in real-time

3. **Accuracy:**
   - [ ] Compare measurements with known dimensions
   - [ ] Test on various roof sizes (50m² to 500m²)
   - [ ] Verify calculations match manual measurements

4. **Export:**
   - [ ] Export to calculator
   - [ ] Dimensions auto-fill correctly
   - [ ] Can calculate immediately after export

5. **Mobile:**
   - [ ] Works on mobile devices
   - [ ] Touch drawing is smooth
   - [ ] Map controls are accessible

---

## Cost Analysis

### Mapbox Pricing

**Free Tier:**
- 50,000 map loads/month
- Unlimited geocoding requests
- Unlimited drawing operations

**Paid Tier (if needed):**
- $5 per 1,000 map loads above free tier
- For 100 users doing 10 measurements/day:
  - 100 × 10 × 30 = 30,000 loads/month
  - Well within free tier

### Google Maps Alternative

**Free Tier:**
- $200/month credit
- $7 per 1,000 map loads
- ≈28,500 free map loads/month

**Recommendation:** Start with Mapbox, switch to Google Maps if better imagery needed.

---

## Benefits

### For Contractors

1. **Accuracy:** Satellite measurements more accurate than on-ground estimates
2. **Safety:** No need to climb roofs for initial measurements
3. **Speed:** Measure roofs in minutes, not hours
4. **Professional:** Impress clients with technology
5. **Remote:** Quote jobs without site visits

### For Venturr

1. **Competitive Advantage:** Feature competitors don't have
2. **User Engagement:** Increases time spent in platform
3. **Data Collection:** Build database of roof measurements
4. **Upsell Opportunity:** Premium feature for advanced users
5. **Market Position:** Positions Venturr as innovation leader

---

## Implementation Timeline

**Week 1:**
- Set up Mapbox account and API keys
- Install dependencies
- Create basic SatelliteDrawing component
- Implement address search and geocoding

**Week 2:**
- Add drawing tools and measurement calculations
- Create SiteMeasure page
- Integrate with router
- Connect to calculator

**Week 3:**
- Add save/load functionality
- Implement database storage
- Create API endpoints
- Test thoroughly

**Week 4:**
- Polish UI/UX
- Add instructions and help
- Mobile optimization
- User testing and feedback

---

## Next Steps

1. **Get Mapbox API Key** - Sign up and create token
2. **Install Dependencies** - Add required packages
3. **Implement Basic Feature** - Start with address search and drawing
4. **Test and Iterate** - Gather feedback and improve
5. **Launch** - Roll out to users with training materials

---

**This feature will transform Venturr from a calculator into a complete roof measurement and estimation platform.**

