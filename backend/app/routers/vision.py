from fastapi import APIRouter
from ..schemas.schemas import VisionAnalyzeRequest, VisionAnalyzeResponse
from ..services.vision_service import VisionService

router = APIRouter(prefix="/api/vision", tags=["Vision AI"])

@router.post("/analyze", response_model=VisionAnalyzeResponse)
def analyze_field_image(req: VisionAnalyzeRequest):
    """
    Simulates / runs computer vision feature detection on geotechnical field imagery.
    Detects tension cracks, colluvial scree, and lane blockages with confidence scores.
    """
    return VisionService.analyze_evidence_image(req)
