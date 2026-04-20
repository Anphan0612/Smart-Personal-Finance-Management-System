import pytest
from services.ocr_service import OCRService

def test_selective_correction_logic():
    service = OCRService()
    # Mocking self.corrector to avoid loading actual model for this unit test
    class MockCorrector:
        def __call__(self, text, **kwargs):
            return [{'generated_text': text.replace("sửa lỗi: ", "").upper()}]
            
    service.corrector = MockCorrector()
    service.ai_correction_active = True
    
    # Test 1: Purely numeric line (should NOT be corrected)
    lines = ["1.000.000", "  250,50  "]
    corrected, flag = service._selective_correction(lines)
    assert corrected[0] == "1.000.000"
    assert corrected[1] == "250,50"
    assert flag == "AI_CORRECTION_OK"
    
    # Test 2: Text line (should be corrected/uppercase in our mock)
    lines = ["bach hoa xanh"]
    corrected, flag = service._selective_correction(lines)
    assert corrected[0] == "BACH HOA XANH"
    
    # Test 3: Mixed line (should be corrected because it contains alpha)
    lines = ["total 500k"]
    corrected, flag = service._selective_correction(lines)
    assert corrected[0] == "TOTAL 500K"

def test_graceful_degradation_oom():
    service = OCRService()
    
    class OOMCorrector:
        def __call__(self, text, **kwargs):
            raise RuntimeError("CUDA out of memory. Tried to allocate...")
            
    service.corrector = OOMCorrector()
    service.ai_correction_active = True
    
    lines = ["test line"]
    corrected, flag = service._selective_correction(lines)
    
    assert flag == "AI_CORRECTION_DISABLED"
    assert corrected == lines
    assert service.ai_correction_active is False
