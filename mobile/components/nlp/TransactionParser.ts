import type {ParsedTransaction} from './NaturalLanguageInput';

export class TransactionParser {
  // Keywords cho các danh mục
  private static readonly CATEGORY_KEYWORDS = {
    food: ['ăn', 'com', 'cơm', 'trưa', 'sáng', 'tối', 'bữa', 'nhậu', 'bia', 'nước', 'cafe', 'cà phê', 'sữa', 'trái cây', 'hoa quả'],
    transport: ['taxi', 'grab', 'xe', 'bus', 'ô tô', 'moto', 'xăng', 'đổ xăng', 'vé', 'phà', 'tàu', 'máy bay'],
    shopping: ['mua', 'shopping', 'quần áo', 'giày', 'áo', 'váy', 'son', 'phấn', 'mỹ phẩm', 'sách', 'vật dụng'],
    entertainment: ['phim', 'cinema', 'game', 'chơi', 'karaoke', 'bar', 'club', 'du lịch', 'phượt', 'đi chơi'],
    bills: ['tiền điện', 'tiền nước', 'tiền nhà', 'internet', 'điện thoại', 'hóa đơn', 'thuê nhà', 'gas'],
    salary: ['lương', 'thưởng', 'bonus', 'tiền công', 'thu nhập', 'nhận tiền'],
    other: ['khác', 'misc']
  };

  // Keywords cho thời gian
  private static readonly TIME_KEYWORDS = {
    today: ['hôm nay', 'hôm nay', 'ngày hôm nay'],
    yesterday: ['hôm qua', 'ngày hôm qua', 'hôm qua'],
    tomorrow: ['ngày mai', 'mai', 'ngày mai'],
    this_month: ['tháng này', 'tháng này'],
    last_month: ['tháng trước', 'tháng trước']
  };

  // Patterns để parse số tiền
  private static readonly AMOUNT_PATTERNS = [
    /(\d+(?:\.\d+)?)\s*(k|nghìn|ngàn|tr|triệu|trieu|tỷ|ty)/gi,
    /(\d+(?:\.\d+)?)\s*(vnd|đ|d)/gi,
    /(\d+(?:,\d+)*(?:\.\d+)?)/g
  ];

  static parse(text: string): ParsedTransaction {
    const lowerText = text.toLowerCase().trim();

    // Parse số tiền
    const amount = this.parseAmount(lowerText);

    // Xác định loại giao dịch (income/expense)
    const type = this.determineTransactionType(lowerText);

    // Parse danh mục
    const category = this.parseCategory(lowerText);

    // Parse thời gian
    const date = this.parseDate(lowerText);

    // Tạo mô tả
    const description = this.generateDescription(text, amount, category);

    // Tính độ tin cậy
    const confidence = this.calculateConfidence(amount, category, type);

    return {
      amount,
      category,
      description,
      date,
      type,
      confidence
    };
  }

  private static parseAmount(text: string): number {
    for (const pattern of this.AMOUNT_PATTERNS) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          const numMatch = match.match(/(\d+(?:[,.]\d+)*)/);
          if (numMatch) {
            let amount = parseFloat(numMatch[1].replace(',', ''));

            // Xử lý đơn vị
            if (match.includes('k') || match.includes('nghìn') || match.includes('ngàn')) {
              amount *= 1000;
            } else if (match.includes('tr') || match.includes('triệu') || match.includes('trieu')) {
              amount *= 1000000;
            } else if (match.includes('tỷ') || match.includes('ty')) {
              amount *= 1000000000;
            }

            return Math.round(amount);
          }
        }
      }
    }

    // Default amount nếu không parse được
    return 0;
  }

  private static determineTransactionType(text: string): 'income' | 'expense' {
    const incomeKeywords = ['lương', 'thưởng', 'nhận', 'thu nhập', 'bonus', 'tiền công', 'bán'];
    const expenseKeywords = ['mua', 'ăn', 'đi', 'chi', 'trả', 'thanh toán'];

    const hasIncomeKeyword = incomeKeywords.some(keyword => text.includes(keyword));
    const hasExpenseKeyword = expenseKeywords.some(keyword => text.includes(keyword));

    if (hasIncomeKeyword && !hasExpenseKeyword) {
      return 'income';
    }

    return 'expense'; // Default là expense
  }

  private static parseCategory(text: string): string {
    for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }

    return 'other'; // Default category
  }

  private static parseDate(text: string): string {
    const now = new Date();

    for (const [timeKey, keywords] of Object.entries(this.TIME_KEYWORDS)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        switch (timeKey) {
          case 'today':
            return now.toISOString().split('T')[0];
          case 'yesterday':
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            return yesterday.toISOString().split('T')[0];
          case 'tomorrow':
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
          case 'this_month':
            return now.toISOString().substring(0, 7) + '-01';
          case 'last_month':
            const lastMonth = new Date(now);
            lastMonth.setMonth(now.getMonth() - 1);
            return lastMonth.toISOString().substring(0, 7) + '-01';
        }
      }
    }

    return now.toISOString().split('T')[0]; // Default là hôm nay
  }

  private static generateDescription(originalText: string, amount: number, category: string): string {
    // Nếu text quá ngắn, tạo description từ category và amount
    if (originalText.length < 10) {
      const categoryNames: { [key: string]: string } = {
        food: 'Ăn uống',
        transport: 'Di chuyển',
        shopping: 'Mua sắm',
        entertainment: 'Giải trí',
        bills: 'Hóa đơn',
        salary: 'Lương',
        other: 'Khác'
      };

      return `${categoryNames[category] || 'Giao dịch'} ${this.formatAmount(amount)}`;
    }

    return originalText;
  }

  private static calculateConfidence(amount: number, category: string, type: string): number {
    let confidence = 0.5; // Base confidence

    if (amount > 0) confidence += 0.2;
    if (category !== 'other') confidence += 0.2;
    if (type === 'income' || type === 'expense') confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private static formatAmount(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}tr`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k`;
    }
    return amount.toString();
  }

  // Helper method để lấy tên danh mục tiếng Việt
  static getCategoryName(category: string): string {
    const names: { [key: string]: string } = {
      food: 'Ăn uống',
      transport: 'Di chuyển',
      shopping: 'Mua sắm',
      entertainment: 'Giải trí',
      bills: 'Hóa đơn',
      salary: 'Lương',
      other: 'Khác'
    };
    return names[category] || 'Khác';
  }

  // Helper method để format date thành tiếng Việt
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}