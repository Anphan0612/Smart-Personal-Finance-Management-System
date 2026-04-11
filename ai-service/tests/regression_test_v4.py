import sys
import os
sys.path.append(os.getcwd())

from services.ocr_service import OCRService

def run_regression():
    service = OCRService()
    
    # Mock Corrector to behave like ProtonX T5
    class MockProtonX:
        def __call__(self, text, **kwargs):
            # Simulate real corrections
            rules = {
                "sửa lỗi: tổng tiễn": "tổng tiền",
                "sửa lỗi: bach hoa xanh": "bách hóa xanh",
                "sửa lỗi: thanh toan": "thanh toán"
            }
            res = rules.get(text, text.replace("sửa lỗi: ", ""))
            return [{"generated_text": res}]
            
    service.corrector = MockProtonX()
    service.ai_correction_active = True
    
    test_cases = [
        {
            "name": "Typo Correction",
            "lines": ["TỔNG TIỄN", "250.000"],
            "expected_amount": 250000.0,
            "expected_text_search": "tổng tiền"
        },
        {
            "name": "Store Mapping with Correction",
            "lines": ["BACH HOA XANH", "Số 10", "150.000"],
            "expected_store": "bách hóa xanh", # Should match after correction
            "expected_amount": 150000.0
        },
        {
            "name": "Amount Trap Protection (regression check)",
            "lines": ["TỔNG CỘNG: 100.000", "TIỀN KHÁCH ĐƯA: 200.000", "TIỀN THỐI: 100.000"],
            "expected_amount": 100000.0
        }
    ]
    
    passed = 0
    for case in test_cases:
        print(f"Running: {case['name']}...")
        ocr_results = []
        for line in case['lines']:
            # box, text, confidence
            ocr_results.append(([[0,0],[1,0],[1,1],[0,1]], line, 0.95))
        
        # We need to simulate the raw text lines for _selective_correction
        raw_lines = [r[1] for r in ocr_results]
        corrected_lines, flag = service._selective_correction(raw_lines)
        
        data = service._parse_receipt(ocr_results, corrected_lines)
        
        # Assertions
        success = True
        if "expected_amount" in case and data['amount'] != case['expected_amount']:
            print(f"  FAILED: Amount mismatch. Got {data['amount']}, expected {case['expected_amount']}")
            success = False
        if "expected_store" in case and case['expected_store'] not in data['store_name'].lower():
             print(f"  FAILED: Store mismatch. Got {data['store_name']}")
             success = False
             
        if success:
            print("  PASSED ✅")
            passed += 1
            
    print(f"\nRegression Summary: {passed}/{len(test_cases)} cases passed.")
    if passed == len(test_cases):
        print("V4 logic is stable and maintains V3 capabilities.")
    else:
        sys.exit(1)

if __name__ == "__main__":
    run_regression()
