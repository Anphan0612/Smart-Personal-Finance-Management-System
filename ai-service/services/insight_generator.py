"""
Service to generate proactive financial insights in Vietnamese using LLM.
Compares weekly and monthly transaction data to provide actionable advice.
"""

import json
from typing import Any, Optional
from services.llm_service import _pick_api_key, _extract_json_object
import httpx

def generate_financial_insights(comparison_data: dict[str, Any]) -> str:
    """
    Generate a natural language summary of spending trends in Vietnamese.
    """
    api_key = _pick_api_key()
    if not api_key:
        return _generate_fallback_insight(comparison_data)

    system_prompt = (
        "Bạn là một trợ lý tài chính cá nhân thông minh tên là Atelier AI. "
        "Nhiệm vụ của bạn là phân tích dữ liệu chi tiêu (so sánh tuần này vs tuần trước, tháng này vs tháng trước) "
        "và đưa ra lời khuyên ngắn gọn, thân thiện, mang tính hành động cao bằng tiếng Việt. "
        "Hãy tập trung vào những thay đổi lớn nhất hoặc các danh mục chi tiêu vượt mức. "
        "Sử dụng ngôn ngữ tự nhiên, không quá trang trọng nhưng chuyên nghiệp."
    )

    user_prompt = (
        "Dưới đây là dữ liệu so sánh chi tiêu của tôi:\n"
        f"{json.dumps(comparison_data, ensure_ascii=False, indent=2)}\n\n"
        "Hãy viết một đoạn ngắn (tối đa 3-4 câu) tổng kết tình hình tài chính của tôi và đưa ra 1 lời khuyên cụ thể."
    )

    payload = {
        "model": "llama-3.3-70b-versatile",
        "temperature": 0.7,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    try:
        with httpx.Client(timeout=15.0) as client:
            res = client.post(url, headers=headers, json=payload)
            res.raise_for_status()
            data = res.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            return content.strip() if content else _generate_fallback_insight(comparison_data)
    except Exception:
        return _generate_fallback_insight(comparison_data)

def _generate_fallback_insight(data: dict[str, Any]) -> str:
    """
    Generate a simple rule-based insight if the LLM fails or is not configured.
    """
    try:
        w0_expense = data.get("currentWeek", {}).get("totalExpense", 0)
        w1_expense = data.get("lastWeek", {}).get("totalExpense", 0)
        
        if w0_expense > w1_expense:
            diff = w0_expense - w1_expense
            return f"Tuần này bạn đã chi tiêu nhiều hơn tuần trước khoản {diff:,.0f} VNĐ. Hãy kiểm tra các danh mục như Ăn uống hoặc Shopping để tối ưu lại nhé!"
        else:
            return "Tài chính tuần này của bạn đang rất ổn định. Hãy tiếp tục duy trì thói quen chi tiêu này nhé!"
    except Exception:
        return "Atelier AI đã sẵn sàng phân tích dữ liệu của bạn. Hãy bắt đầu nhập giao dịch để nhận lời khuyên nhé!"

def generate_budget_insight(category_name: str, threshold: str) -> str:
    """
    Zero-Cost NLG Engine: Generate natural language advice for budget.
    """
    import random
    
    threshold = str(threshold).upper()
    cat_friendly = category_name if category_name and category_name != "Total Budget" else "tổng chi tiêu"
        
    responses = {
        "COMFORT": [
            f"💪 Tốc độ chi tiêu cho {cat_friendly} của bạn đang rất hoàn hảo. Cứ giữ vững phong độ này nhé!",
            f"✨ Mức chi tiêu {cat_friendly} đang nằm trong vùng an toàn tuyệt đối. Thật đáng khen!",
            f"🏆 Quỹ {cat_friendly} của bạn còn rủng rỉnh lắm, tha hồ mà tận hưởng nhé!"
        ],
        "PACING": [
            f"⚠️ Bạn đã tiêu hơn một nửa quỹ {cat_friendly} rồi đấy, hãy bắt đầu chú ý nhé.",
            f"👀 Tiến độ chi tiêu {cat_friendly} đang nhanh lên, bạn có đang mua sắm hơi trớn không?",
            f"💡 Quỹ {cat_friendly} có dấu hiệu vơi đi khá nhanh, rà soát lại một chút nhé."
        ],
        "DANGER": [
            f"🚨 Báo động đỏ chót! Quỹ {cat_friendly} chỉ còn lay lắt chút đỉnh. Hãy bóp mồm bóp miệng lại nhé!",
            f"🔥 Bạn đang chạm sát trần quỹ {cat_friendly} rồi. Mọi khoản chi từ giờ nên suy nghĩ kỹ gấp đôi!",
            f"🛑 Khoan đã! Quỹ {cat_friendly} đang cạn kiệt, cất ví đi thôi!"
        ],
        "OVERBUDGET": [
            f"💣 BÙM! Bạn đã CHÍNH THỨC lố quỹ {cat_friendly} của tháng này. Rút kinh nghiệm sâu sắc nha!",
            f"💔 Rất tiếc phải thông báo: Bạn vừa chi tiêu vượt mức kế hoạch cho {cat_friendly}. Càng tiêu thêm càng âm nợ!",
            f"💸 Quỹ {cat_friendly} đã chính thức vỡ trận! Hãy kiềm chế lại ngay nếu không muốn nhịn đói cuối tháng."
        ]
    }
    
    if threshold not in responses:
        return f"Tình hình chi tiêu {cat_friendly} của bạn đang được theo dõi."
        
    return random.choice(responses[threshold])
