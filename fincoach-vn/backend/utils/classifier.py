"""
Transaction classification utilities
"""
import re
from typing import Dict, Optional, List, Tuple


class TransactionClassifier:
    """
    Rule-based transaction classifier for Vietnamese transactions
    """
    
    def __init__(self):
        # Define patterns for each jar type
        self.patterns = {
            "necessity": [
                # Utilities
                (r"(?i)(điện|dien|electric|evn)", "electricity"),
                (r"(?i)(nước|nuoc|water)", "water"),
                (r"(?i)(gas|petrol|xăng|xang)", "fuel"),
                (r"(?i)(internet|wifi|viettel|vnpt|fpt|mobifone|vinaphone)", "internet_phone"),
                
                # Groceries and food
                (r"(?i)(siêu thị|sieu thi|supermarket|coopmart|vinmart|bach hoa xanh)", "groceries"),
                (r"(?i)(chợ|cho|market)", "market"),
                (r"(?i)(thực phẩm|thuc pham|food)", "food"),
                
                # Rent and housing
                (r"(?i)(tiền nhà|tien nha|rent|thuê nhà|thue nha)", "rent"),
                (r"(?i)(phí quản lý|phi quan ly|management fee)", "management_fee"),
                
                # Transportation
                (r"(?i)(grab|be|gojek|taxi|uber)", "transport"),
                (r"(?i)(vé xe|ve xe|bus|metro)", "public_transport"),
                
                # Healthcare
                (r"(?i)(bệnh viện|benh vien|hospital|phòng khám|phong kham|clinic)", "healthcare"),
                (r"(?i)(thuốc|thuoc|pharmacy|nhà thuốc|nha thuoc)", "medicine"),
            ],
            
            "education": [
                (r"(?i)(sách|sach|book|fahasa|vinabook)", "books"),
                (r"(?i)(học phí|hoc phi|tuition|school fee)", "tuition"),
                (r"(?i)(khóa học|khoa hoc|course|udemy|coursera)", "online_course"),
                (r"(?i)(tiếng anh|tieng anh|english|ielts|toeic)", "language_learning"),
            ],
            
            "play": [
                (r"(?i)(phim|cinema|cgv|galaxy|lotte cinema|bhd)", "entertainment"),
                (r"(?i)(cafe|coffee|starbucks|highlands|phuc long|cong ca phe)", "cafe"),
                (r"(?i)(nhà hàng|nha hang|restaurant)", "dining_out"),
                (r"(?i)(bar|pub|beer|bia)", "nightlife"),
                (r"(?i)(du lịch|du lich|travel|vé máy bay|ve may bay)", "travel"),
                (r"(?i)(shopee|lazada|tiki).*(?!sách|sach|book)", "online_shopping"),
            ],
            
            "longTermSavings": [
                (r"(?i)(tiết kiệm|tiet kiem|savings|gửi tiền|gui tien)", "savings"),
                (r"(?i)(emergency fund|dự phòng|du phong)", "emergency"),
            ],
            
            "financialFreedom": [
                (r"(?i)(chứng khoán|chung khoan|stock|cổ phiếu|co phieu)", "stocks"),
                (r"(?i)(crypto|bitcoin|ethereum|binance)", "crypto"),
                (r"(?i)(đầu tư|dau tu|investment)", "investment"),
                (r"(?i)(bất động sản|bat dong san|real estate)", "real_estate"),
            ],
            
            "give": [
                (r"(?i)(từ thiện|tu thien|charity|donation)", "charity"),
                (r"(?i)(quà|qua|gift)", "gifts"),
                (r"(?i)(hội chữ thập đỏ|hoi chu thap do|red cross)", "donation"),
            ]
        }
        
        # Amount-based rules
        self.amount_rules = {
            "play": (0, 5000000),  # Entertainment typically under 5M VND
            "necessity": (100000, float('inf')),  # Necessities typically above 100K VND
        }
    
    def classify(self, description: str, amount: float, vendor: Optional[str] = None) -> Tuple[str, float]:
        """
        Classify a transaction based on description, amount, and vendor
        Returns (jar_type, confidence_score)
        """
        description = description.lower()
        if vendor:
            description = f"{description} {vendor.lower()}"
        
        matches = []
        
        # Check patterns for each jar
        for jar_type, patterns in self.patterns.items():
            for pattern, category in patterns:
                if re.search(pattern, description):
                    # Higher confidence for more specific patterns
                    confidence = 0.9 if len(pattern) > 20 else 0.8
                    matches.append((jar_type, confidence, category))
        
        if not matches:
            # Fallback to amount-based classification
            return self._classify_by_amount(amount)
        
        # Return the match with highest confidence
        matches.sort(key=lambda x: x[1], reverse=True)
        return matches[0][0], matches[0][1]
    
    def _classify_by_amount(self, amount: float) -> Tuple[str, float]:
        """
        Classify based on amount as a fallback
        """
        # Default to necessity for most transactions
        if amount < 100000:
            return "play", 0.5
        elif amount < 1000000:
            return "necessity", 0.6
        else:
            return "longTermSavings", 0.5
    
    def suggest_category(self, description: str) -> List[Tuple[str, str, float]]:
        """
        Suggest possible categories for a transaction
        Returns list of (jar_type, category, confidence)
        """
        description = description.lower()
        suggestions = []
        
        for jar_type, patterns in self.patterns.items():
            for pattern, category in patterns:
                if re.search(pattern, description):
                    confidence = 0.9 if len(pattern) > 20 else 0.8
                    suggestions.append((jar_type, category, confidence))
        
        # Sort by confidence
        suggestions.sort(key=lambda x: x[2], reverse=True)
        return suggestions[:3]  # Return top 3 suggestions