"""
Spike7B Microservice - Fast Local Operations
Handles scoring, extraction, and classification with sub-100ms latency
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import time
import re
from datetime import datetime

app = FastAPI(
    title="Spike7B Microservice",
    description="Fast local operations for Venturr Dual-Intelligence system",
    version="1.0.0"
)

# ============================================================================
# Request/Response Models
# ============================================================================

class SpikeRequest(BaseModel):
    mode: str = Field(..., description="Operation mode: score, extract, classify")
    text: Optional[str] = Field(None, description="Text to process")
    plan: Optional[Dict[str, Any]] = Field(None, description="Plan to score")
    fields: Optional[List[str]] = Field(None, description="Fields to extract")
    labels: Optional[List[str]] = Field(None, description="Classification labels")

class SpikeResponse(BaseModel):
    ok: Optional[bool] = Field(None, description="Score result (for mode=score)")
    score: Optional[float] = Field(None, description="Numeric score 0-1")
    fields: Optional[Dict[str, Any]] = Field(None, description="Extracted fields")
    label: Optional[str] = Field(None, description="Classification label")
    confidence: Optional[float] = Field(None, description="Confidence 0-1")
    duration: Optional[float] = Field(None, description="Processing time in ms")

# ============================================================================
# Scoring Functions
# ============================================================================

def heuristic_score(plan: Dict[str, Any]) -> float:
    """
    Fast heuristic scoring of execution plans
    Returns score 0-1 indicating plan quality
    """
    score = 0.8  # Base score
    
    steps = plan.get("steps", [])
    
    # Penalize overly complex plans
    if len(steps) > 10:
        score -= 0.2
    elif len(steps) > 5:
        score -= 0.1
    
    # Reward plans with clear tool usage
    tool_steps = [s for s in steps if s.get("kind") == "tool"]
    if len(tool_steps) > 0:
        score += 0.1
    
    # Penalize plans with too many LLM calls
    llm_steps = [s for s in steps if s.get("kind") == "generate"]
    if len(llm_steps) > 3:
        score -= 0.15
    
    # Check for estimated duration
    if plan.get("estimatedDuration"):
        duration = plan["estimatedDuration"]
        if duration > 10000:  # > 10 seconds
            score -= 0.2
        elif duration > 5000:  # > 5 seconds
            score -= 0.1
    
    # Ensure score is in valid range
    return max(0.0, min(1.0, score))

def score_text_quality(text: str) -> float:
    """
    Score text quality based on heuristics
    """
    if not text:
        return 0.0
    
    score = 0.5  # Base score
    
    # Length check
    if len(text) > 50:
        score += 0.1
    if len(text) > 200:
        score += 0.1
    
    # Sentence structure
    sentences = text.split('.')
    if len(sentences) > 1:
        score += 0.1
    
    # Professional language indicators
    professional_words = ['ensure', 'verify', 'comply', 'standard', 'specification']
    if any(word in text.lower() for word in professional_words):
        score += 0.1
    
    # Technical terms (roofing specific)
    technical_terms = ['fastener', 'pitch', 'valley', 'hip', 'gable', 'colorbond']
    if any(term in text.lower() for term in technical_terms):
        score += 0.1
    
    return min(1.0, score)

# ============================================================================
# Extraction Functions
# ============================================================================

def fast_extract(text: str, fields: List[str]) -> Dict[str, Any]:
    """
    Fast field extraction using regex patterns
    Optimized for roofing industry documents
    """
    extracted = {}
    
    for field in fields:
        extracted[field] = extract_field(text, field)
    
    return extracted

def extract_field(text: str, field: str) -> Any:
    """
    Extract specific field using pattern matching
    """
    field_lower = field.lower()
    
    # Price extraction
    if 'price' in field_lower or 'cost' in field_lower:
        match = re.search(r'\$?\s*(\d+(?:\.\d{2})?)\s*(?:/\s*m²|per\s*m²)?', text)
        if match:
            return float(match.group(1))
    
    # Product name extraction
    if 'product' in field_lower or 'name' in field_lower:
        # Look for common roofing product patterns
        patterns = [
            r'(Lysaght\s+[\w\s-]+(?:\d+\.?\d*)?(?:mm)?(?:\s+\w+)?)',
            r'(Stramit\s+[\w\s-]+)',
            r'(Metroll\s+[\w\s-]+)',
            r'(Klip-?Lok\s+\d+)',
            r'(Trimdek)',
            r'(Custom\s+Orb)',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
    
    # Profile extraction
    if 'profile' in field_lower:
        profiles = ['Klip-Lok', 'Trimdek', 'Custom Orb', 'Spandek', 'Monoclad', 'Speed Deck']
        for profile in profiles:
            if profile.lower() in text.lower():
                return profile
    
    # Thickness extraction
    if 'thickness' in field_lower or 'bmt' in field_lower:
        match = re.search(r'(\d+\.?\d*)\s*mm', text)
        if match:
            return float(match.group(1))
        match = re.search(r'0\.(\d+)', text)
        if match:
            return float(f"0.{match.group(1)}")
    
    # Coating extraction
    if 'coating' in field_lower:
        coatings = ['COLORBOND', 'ZINCALUME', 'Galvanized', 'Zinc']
        for coating in coatings:
            if coating.lower() in text.lower():
                return coating
    
    # Unit extraction
    if 'unit' in field_lower:
        if 'm²' in text or 'sqm' in text.lower():
            return 'm²'
        if 'lm' in text.lower() or 'linear' in text.lower():
            return 'lm'
        if 'each' in text.lower():
            return 'each'
    
    # Cover width extraction
    if 'cover' in field_lower and 'width' in field_lower:
        match = re.search(r'(\d+)\s*mm', text)
        if match:
            return f"{match.group(1)}mm"
    
    # Pitch extraction
    if 'pitch' in field_lower:
        match = re.search(r'(\d+)°', text)
        if match:
            return f"{match.group(1)}°"
        match = re.search(r'minimum\s+pitch[:\s]+(\d+)', text, re.IGNORECASE)
        if match:
            return f"{match.group(1)}°"
    
    # Manufacturer extraction
    if 'manufacturer' in field_lower:
        manufacturers = ['Lysaght', 'Stramit', 'Metroll', 'BlueScope', 'Matrix']
        for mfr in manufacturers:
            if mfr.lower() in text.lower():
                return mfr
    
    # Description extraction (last resort - take first sentence)
    if 'description' in field_lower:
        sentences = text.split('.')
        if sentences:
            return sentences[0].strip()
    
    return None

# ============================================================================
# Classification Functions
# ============================================================================

def classify_document(text: str, labels: List[str]) -> tuple[str, float]:
    """
    Fast document classification using keyword matching
    Returns (label, confidence)
    """
    text_lower = text.lower()
    scores = {}
    
    # Define keyword patterns for each document type
    patterns = {
        'invoice': ['invoice', 'tax invoice', 'amount due', 'payment terms', 'abn'],
        'quote': ['quote', 'quotation', 'estimate', 'valid until', 'acceptance'],
        'contract': ['contract', 'agreement', 'terms and conditions', 'parties', 'whereas'],
        'compliance_certificate': ['certificate', 'compliance', 'certified', 'standards', 'approved'],
        'installation_manual': ['installation', 'manual', 'instructions', 'step', 'procedure'],
        'safety_document': ['safety', 'hazard', 'ppe', 'risk assessment', 'swms'],
        'work_order': ['work order', 'job', 'task', 'assigned', 'schedule'],
        'material_specification': ['specification', 'datasheet', 'properties', 'dimensions'],
    }
    
    # Score each label
    for label in labels:
        label_lower = label.lower().replace('-', '_')
        keywords = patterns.get(label_lower, [label_lower])
        
        score = 0.0
        for keyword in keywords:
            if keyword in text_lower:
                score += 1.0 / len(keywords)
        
        scores[label] = score
    
    # Find best match
    if not scores:
        return 'other', 0.3
    
    best_label = max(scores, key=scores.get)
    confidence = min(0.95, scores[best_label] * 0.8 + 0.2)  # Scale to 0.2-0.95
    
    return best_label, confidence

def classify_project_complexity(data: Dict[str, Any]) -> tuple[str, float]:
    """
    Classify project complexity: simple, moderate, complex, very_complex
    """
    score = 0
    
    # Roof area factor
    area = data.get('roofArea', 0)
    if area > 200:
        score += 3
    elif area > 100:
        score += 2
    elif area > 50:
        score += 1
    
    # Roof type factor
    roof_type = data.get('roofType', '').lower()
    if roof_type in ['complex', 'multi-level']:
        score += 3
    elif roof_type in ['hip', 'valley']:
        score += 2
    elif roof_type == 'gable':
        score += 1
    
    # Pitch factor
    pitch = data.get('pitch', 0)
    if pitch > 35:
        score += 2
    elif pitch > 25:
        score += 1
    
    # Complexity features
    if data.get('valleys', 0) > 2:
        score += 2
    if data.get('hips', 0) > 2:
        score += 2
    if data.get('penetrations', 0) > 5:
        score += 1
    if data.get('customFabrication'):
        score += 2
    if data.get('removalRequired'):
        score += 1
    
    # Access difficulty
    access = data.get('accessDifficulty', '').lower()
    if access == 'difficult':
        score += 2
    elif access == 'moderate':
        score += 1
    
    # Environmental factors
    if data.get('coastalLocation'):
        score += 1
    bal = data.get('balRating', '').upper()
    if 'BAL-40' in bal or 'BAL-FZ' in bal:
        score += 2
    elif 'BAL-29' in bal:
        score += 1
    
    # Classify based on total score
    if score >= 12:
        return 'very_complex', 0.9
    elif score >= 8:
        return 'complex', 0.85
    elif score >= 4:
        return 'moderate', 0.8
    else:
        return 'simple', 0.75

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Spike7B Microservice",
        "status": "operational",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "uptime": time.time(),
        "capabilities": ["score", "extract", "classify"]
    }

@app.post("/spike", response_model=SpikeResponse)
async def spike(req: SpikeRequest):
    """
    Main Spike7B endpoint
    Handles scoring, extraction, and classification
    """
    start_time = time.time()
    
    try:
        # SCORE mode
        if req.mode == "score":
            if req.plan:
                score = heuristic_score(req.plan)
            elif req.text:
                score = score_text_quality(req.text)
            else:
                raise HTTPException(status_code=400, detail="Missing plan or text for scoring")
            
            duration = (time.time() - start_time) * 1000
            return SpikeResponse(
                ok=score > 0.6,
                score=score,
                confidence=0.8,
                duration=duration
            )
        
        # EXTRACT mode
        elif req.mode == "extract":
            if not req.text:
                raise HTTPException(status_code=400, detail="Missing text for extraction")
            
            fields = req.fields or [
                "productName", "price", "unit", "manufacturer",
                "profile", "thickness", "coating"
            ]
            
            extracted = fast_extract(req.text, fields)
            duration = (time.time() - start_time) * 1000
            
            return SpikeResponse(
                fields=extracted,
                confidence=0.85,
                duration=duration
            )
        
        # CLASSIFY mode
        elif req.mode == "classify":
            if not req.text:
                raise HTTPException(status_code=400, detail="Missing text for classification")
            
            labels = req.labels or [
                "invoice", "quote", "contract", "compliance_certificate",
                "installation_manual", "safety_document", "work_order", "other"
            ]
            
            label, confidence = classify_document(req.text, labels)
            duration = (time.time() - start_time) * 1000
            
            return SpikeResponse(
                label=label,
                confidence=confidence,
                duration=duration
            )
        
        else:
            raise HTTPException(status_code=400, detail=f"Unknown mode: {req.mode}")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.post("/classify-complexity")
async def classify_complexity(data: Dict[str, Any]):
    """
    Specialized endpoint for project complexity classification
    """
    start_time = time.time()
    
    try:
        complexity, confidence = classify_project_complexity(data)
        duration = (time.time() - start_time) * 1000
        
        return {
            "complexity": complexity,
            "confidence": confidence,
            "duration": duration,
            "factors": {
                "roofArea": data.get('roofArea'),
                "roofType": data.get('roofType'),
                "pitch": data.get('pitch'),
                "features": {
                    "valleys": data.get('valleys', 0),
                    "hips": data.get('hips', 0),
                    "penetrations": data.get('penetrations', 0),
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification error: {str(e)}")

@app.get("/metrics")
async def metrics():
    """
    Prometheus-compatible metrics endpoint
    """
    return {
        "spike7b_requests_total": 0,  # Would track in production
        "spike7b_duration_seconds": 0.05,
        "spike7b_errors_total": 0,
    }

# ============================================================================
# Startup
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )

