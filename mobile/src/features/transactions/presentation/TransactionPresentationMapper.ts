import { Transaction } from '../../../domain/entities/Transaction';
import { isToday, isYesterday, parseISO } from 'date-fns';
import { formatDate } from '../../../utils/format';

export interface GroupedTransactions {
  date: string;
  dateLabel: string;
  items: Transaction[];
}

export class TransactionPresentationMapper {
  static groupByDate(transactions: Transaction[]): GroupedTransactions[] {
    const groups: { [key: string]: Transaction[] } = {};

    transactions.forEach((transaction) => {
      const dateKey = transaction.getDateKey();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        dateLabel: this.formatDateLabel(date),
        items: groups[date],
      }));
  }

  static filterBySearchQuery(
    transactions: Transaction[],
    searchQuery: string
  ): Transaction[] {
    if (!searchQuery.trim()) {
      return transactions;
    }

    const query = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(query) ||
        t.categoryName.toLowerCase().includes(query)
    );
  }

  static groupAndFilter(
    transactions: Transaction[],
    searchQuery: string
  ): GroupedTransactions[] {
    const filtered = this.filterBySearchQuery(transactions, searchQuery);
    return this.groupByDate(filtered);
  }

  private static formatDateLabel(dateStr: string): string {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Hôm nay';
    if (isYesterday(date)) return 'Hôm qua';
    return formatDate(date);
  }

  static flattenPages(pages: Array<{ content: Transaction[] }>): Transaction[] {
    if (!pages || pages.length === 0) return [];
    return pages.flatMap((page) => page.content || []);
  }
}
