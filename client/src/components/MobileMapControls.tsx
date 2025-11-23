import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, MapPin, Ruler, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileMapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitBounds?: () => void;
  onStartDrawing?: () => void;
  onClearDrawing?: () => void;
  isDrawing?: boolean;
  className?: string;
}

/**
 * MobileMapControls
 * 
 * Touch-friendly map controls optimized for mobile:
 * - Large touch targets (min 48x48px)
 * - Clear icons
 * - Positioned for thumb reach
 * - Works with Leaflet maps
 */
export function MobileMapControls({
  onZoomIn,
  onZoomOut,
  onFitBounds,
  onStartDrawing,
  onClearDrawing,
  isDrawing = false,
  className,
}: MobileMapControlsProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Zoom Controls */}
      <div className="flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2">
        <Button
          onClick={onZoomIn}
          variant="outline"
          size="icon"
          className="h-12 w-12 md:h-10 md:w-10"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          onClick={onZoomOut}
          variant="outline"
          size="icon"
          className="h-12 w-12 md:h-10 md:w-10"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        {onFitBounds && (
          <Button
            onClick={onFitBounds}
            variant="outline"
            size="icon"
            className="h-12 w-12 md:h-10 md:w-10"
            aria-label="Fit to bounds"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Drawing Controls */}
      {(onStartDrawing || onClearDrawing) && (
        <div className="flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2">
          {onStartDrawing && (
            <Button
              onClick={onStartDrawing}
              variant={isDrawing ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-12 w-12 md:h-10 md:w-10",
                isDrawing && "bg-blue-600 hover:bg-blue-700 text-white"
              )}
              aria-label="Start drawing"
            >
              <Ruler className="h-5 w-5" />
            </Button>
          )}
          {onClearDrawing && (
            <Button
              onClick={onClearDrawing}
              variant="outline"
              size="icon"
              className="h-12 w-12 md:h-10 md:w-10 text-red-600 hover:text-red-700 hover:bg-red-50"
              aria-label="Clear drawing"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * MobileMapToolbar
 * 
 * Bottom toolbar for map actions on mobile
 */
interface MobileMapToolbarProps {
  onSave?: () => void;
  onCancel?: () => void;
  measurements?: {
    area?: string;
    perimeter?: string;
  };
  isSaving?: boolean;
}

export function MobileMapToolbar({
  onSave,
  onCancel,
  measurements,
  isSaving = false,
}: MobileMapToolbarProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 safe-area-bottom">
      {/* Measurements Display */}
      {measurements && (
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
          <div className="flex justify-around text-sm">
            {measurements.area && (
              <div className="text-center">
                <div className="text-slate-500">Area</div>
                <div className="font-semibold text-slate-900">{measurements.area}</div>
              </div>
            )}
            {measurements.perimeter && (
              <div className="text-center">
                <div className="text-slate-500">Perimeter</div>
                <div className="font-semibold text-slate-900">{measurements.perimeter}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 p-4">
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 min-h-[48px]"
            disabled={isSaving}
          >
            Cancel
          </Button>
        )}
        {onSave && (
          <Button
            onClick={onSave}
            className="flex-1 min-h-[48px] bg-blue-600 hover:bg-blue-700"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Measurement"}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Example usage in LeafletSiteMeasurement:
 * 
 * <div className="relative h-screen">
 *   <MapContainer>
 *     {/* Map layers *\/}
 *   </MapContainer>
 *   
 *   {/* Mobile Controls - positioned in bottom-right *\/}
 *   <div className="absolute bottom-24 md:bottom-4 right-4 z-[1000]">
 *     <MobileMapControls
 *       onZoomIn={() => map.zoomIn()}
 *       onZoomOut={() => map.zoomOut()}
 *       onFitBounds={() => map.fitBounds(bounds)}
 *       onStartDrawing={() => setDrawingMode(true)}
 *       onClearDrawing={() => clearLayers()}
 *       isDrawing={drawingMode}
 *     />
 *   </div>
 *   
 *   {/* Mobile Toolbar - fixed at bottom *\/}
 *   <MobileMapToolbar
 *     measurements={{
 *       area: "245.5 m²",
 *       perimeter: "62.3 m"
 *     }}
 *     onSave={handleSave}
 *     onCancel={handleCancel}
 *     isSaving={isLoading}
 *   />
 * </div>
 */

