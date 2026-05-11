import requests
import json
import time
import sys
import codecs

# Override stdout encoding for Windows
sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

URL = "http://localhost:8000/api/ai/extract-transaction"

TEST_CASES = [
    {"text": "Hôm nay ăn phở hết 50k", "expected_amount": 50000.0, "expected_category": "FOOD"},
    {"text": "Hôm qua đóng tiền điện 1 triệu rưỡi", "expected_amount": 1500000.0, "expected_category": "UTILITIES"},
    {"text": "Lĩnh lương tháng 5 được 15 triệu", "expected_amount": 15000000.0, "expected_category": "SALARY"},
    {"text": "Đổ xăng xe máy hết 80 ngàn", "expected_amount": 80000.0, "expected_category": "TRANSPORT"},
    {"text": "Mua áo thun trên Shopee hết 250k", "expected_amount": 250000.0, "expected_category": "SHOPPING"},
    {"text": "Đi xem phim rạp 150 ngàn", "expected_amount": 150000.0, "expected_category": "ENTERTAINMENT"},
    {"text": "Đóng tiền nhà trọ 3tr5", "expected_amount": 3500000.0, "expected_category": "HOUSING"},
    {"text": "Mua thuốc đau đầu 30 nghìn", "expected_amount": 30000.0, "expected_category": "HEALTH"},
    {"text": "Bán đồ cũ được 500k", "expected_amount": 500000.0, "expected_category": "OTHER_INCOME"},
    {"text": "Đi nhậu với bạn 500k", "expected_amount": 500000.0, "expected_category": "FOOD"},
    {"text": "Tiền wifi tháng này 250k", "expected_amount": 250000.0, "expected_category": "UTILITIES"},
    {"text": "Trà sữa 45k", "expected_amount": 45000.0, "expected_category": "FOOD"},
    {"text": "Nhận tiền project ngoài 2 triệu", "expected_amount": 2000000.0, "expected_category": "OTHER_INCOME"},
    {"text": "Mua giày thể thao 1tr2", "expected_amount": 1200000.0, "expected_category": "SHOPPING"},
    {"text": "Đăng ký Netflix 79k", "expected_amount": 79000.0, "expected_category": "ENTERTAINMENT"}
]

print("="*60)
print("🚀 BẮT ĐẦU TEST ĐỘ CHÍNH XÁC CỦA AI/NLP")
print("="*60)

passed = 0
failed = 0

for i, test in enumerate(TEST_CASES):
    text = test["text"]
    try:
        response = requests.post(URL, json={"text": text}, timeout=10)
        data = response.json()
        # print("DEBUG:", data)
        actual_amount = data.get("amount")
        actual_category = data.get("category")
        
        is_pass = (actual_amount == test["expected_amount"] and actual_category == test["expected_category"])
        
        status = "✅ PASS" if is_pass else "❌ FAIL"
        if is_pass:
            passed += 1
        else:
            failed += 1
            
        print(f"[{i+1:02d}] {status} | Text: '{text}'")
        if not is_pass:
            print(f"    Expected: {test['expected_amount']} - {test['expected_category']}")
            print(f"    Actual  : {actual_amount} - {actual_category}")
    except Exception as e:
        failed += 1
        print(f"[{i+1:02d}] ❌ ERROR | Text: '{text}' | Error: {str(e)}")

print("="*60)
print(f"🎯 KẾT QUẢ: {passed}/{len(TEST_CASES)} PASS ({(passed/len(TEST_CASES))*100:.1f}%)")
print("="*60)
