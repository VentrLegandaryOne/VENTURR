/**
 * Enhanced Drawing Utilities for Roofing Site Measurement
 * Supports complex roof structures including hips, valleys, and custom polygons
 */

export type DrawingToolType = 
  | 'line' 
  | 'rect' 
  | 'circle' 
  | 'polygon'
  | 'hip-roof'
  | 'valley-roof'
  | 'gable-roof'
  | 'skillion-roof'
  | 'measurement'
  | 'text';

export interface Point {
  x: number;
  y: number;
}

export interface DrawingElement {
  id: string;
  type: DrawingToolType;
  points: Point[];
  color: string;
  strokeWidth: number;
  label?: string;
  measurement?: {
    value: number;
    unit: string;
  };
  layer: number;
  locked: boolean;
}

export interface DrawingState {
  elements: DrawingElement[];
  currentElement: DrawingElement | null;
  selectedElement: string | null;
  history: DrawingElement[][];
  historyIndex: number;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  scale: string;
  layers: DrawingLayer[];
}

export interface DrawingLayer {
  id: number;
  name: string;
  visible: boolean;
  locked: boolean;
}

/**
 * Snap a point to the nearest grid intersection
 */
export function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between two points in degrees
 */
export function angle(p1: Point, p2: Point): number {
  const rad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  return (rad * 180) / Math.PI;
}

/**
 * Generate points for a hip roof structure
 */
export function generateHipRoof(center: Point, width: number, height: number): Point[] {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  
  return [
    { x: center.x - halfWidth, y: center.y + halfHeight }, // Bottom left
    { x: center.x + halfWidth, y: center.y + halfHeight }, // Bottom right
    { x: center.x + halfWidth, y: center.y - halfHeight }, // Top right
    { x: center.x - halfWidth, y: center.y - halfHeight }, // Top left
    { x: center.x, y: center.y }, // Center peak
  ];
}

/**
 * Generate points for a valley roof structure
 */
export function generateValleyRoof(center: Point, width: number, height: number): Point[] {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const valleyDepth = height * 0.3;
  
  return [
    { x: center.x - halfWidth, y: center.y + halfHeight }, // Bottom left
    { x: center.x, y: center.y + halfHeight - valleyDepth }, // Valley bottom
    { x: center.x + halfWidth, y: center.y + halfHeight }, // Bottom right
    { x: center.x + halfWidth, y: center.y - halfHeight }, // Top right
    { x: center.x, y: center.y - halfHeight + valleyDepth }, // Valley top
    { x: center.x - halfWidth, y: center.y - halfHeight }, // Top left
  ];
}

/**
 * Generate points for a gable roof structure
 */
export function generateGableRoof(center: Point, width: number, height: number): Point[] {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const ridgeHeight = height * 0.3;
  
  return [
    { x: center.x - halfWidth, y: center.y + halfHeight }, // Bottom left
    { x: center.x + halfWidth, y: center.y + halfHeight }, // Bottom right
    { x: center.x + halfWidth, y: center.y - halfHeight }, // Top right
    { x: center.x, y: center.y - halfHeight - ridgeHeight }, // Ridge peak
    { x: center.x - halfWidth, y: center.y - halfHeight }, // Top left
  ];
}

/**
 * Generate points for a skillion roof structure
 */
export function generateSkillionRoof(center: Point, width: number, height: number): Point[] {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const slopeOffset = width * 0.2;
  
  return [
    { x: center.x - halfWidth, y: center.y + halfHeight }, // Bottom left
    { x: center.x + halfWidth, y: center.y + halfHeight }, // Bottom right
    { x: center.x + halfWidth - slopeOffset, y: center.y - halfHeight }, // Top right
    { x: center.x - halfWidth - slopeOffset, y: center.y - halfHeight }, // Top left
  ];
}

/**
 * Draw a grid on the canvas
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  color: string = '#e5e7eb'
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  
  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * Draw a single element on the canvas
 */
export function drawElement(ctx: CanvasRenderingContext2D, element: DrawingElement) {
  ctx.strokeStyle = element.color;
  ctx.fillStyle = element.color;
  ctx.lineWidth = element.strokeWidth;
  
  const points = element.points;
  if (points.length === 0) return;
  
  switch (element.type) {
    case 'line':
      if (points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.stroke();
      }
      break;
      
    case 'rect':
      if (points.length >= 2) {
        const width = points[1].x - points[0].x;
        const height = points[1].y - points[0].y;
        ctx.strokeRect(points[0].x, points[0].y, width, height);
      }
      break;
      
    case 'circle':
      if (points.length >= 2) {
        const radius = distance(points[0], points[1]);
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      break;
      
    case 'polygon':
    case 'hip-roof':
    case 'valley-roof':
    case 'gable-roof':
    case 'skillion-roof':
      if (points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        
        // Fill with semi-transparent color for roof shapes
        if (element.type !== 'polygon') {
          ctx.globalAlpha = 0.1;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }
      break;
      
    case 'measurement':
      if (points.length >= 2) {
        // Draw line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.stroke();
        
        // Draw measurement text
        if (element.measurement) {
          const midX = (points[0].x + points[1].x) / 2;
          const midY = (points[0].y + points[1].y) / 2;
          const text = `${element.measurement.value.toFixed(2)}${element.measurement.unit}`;
          
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#ffffff';
          const textWidth = ctx.measureText(text).width;
          ctx.fillRect(midX - textWidth / 2 - 4, midY - 10, textWidth + 8, 20);
          
          ctx.fillStyle = element.color;
          ctx.fillText(text, midX - textWidth / 2, midY + 4);
        }
      }
      break;
      
    case 'text':
      if (points.length >= 1 && element.label) {
        ctx.font = '14px sans-serif';
        ctx.fillText(element.label, points[0].x, points[0].y);
      }
      break;
  }
  
  // Draw label if present
  if (element.label && element.type !== 'text' && element.type !== 'measurement') {
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText(element.label, centerX, centerY);
  }
}

/**
 * Check if a point is near a line segment
 */
export function isPointNearLine(point: Point, lineStart: Point, lineEnd: Point, threshold: number = 5): boolean {
  const dist = distanceToLineSegment(point, lineStart, lineEnd);
  return dist <= threshold;
}

/**
 * Calculate distance from a point to a line segment
 */
function distanceToLineSegment(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lengthSquared = dx * dx + dy * dy;
  
  if (lengthSquared === 0) {
    return distance(point, lineStart);
  }
  
  let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));
  
  const projection = {
    x: lineStart.x + t * dx,
    y: lineStart.y + t * dy,
  };
  
  return distance(point, projection);
}

/**
 * Export drawing to JSON
 */
export function exportDrawing(state: DrawingState): string {
  return JSON.stringify({
    elements: state.elements,
    scale: state.scale,
    gridSize: state.gridSize,
    layers: state.layers,
  }, null, 2);
}

/**
 * Import drawing from JSON
 */
export function importDrawing(json: string): Partial<DrawingState> {
  try {
    const data = JSON.parse(json);
    return {
      elements: data.elements || [],
      scale: data.scale || '1:100',
      gridSize: data.gridSize || 20,
      layers: data.layers || [{ id: 0, name: 'Main', visible: true, locked: false }],
    };
  } catch (error) {
    console.error('Failed to import drawing:', error);
    return {};
  }
}

