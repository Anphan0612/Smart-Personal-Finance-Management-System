export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface TransactionProps {
  id: string;
  walletId: string;
  categoryId: string;
  categoryName: string;
  iconName?: string;
  isAiSuggested?: boolean;
  amount: number;
  description: string;
  type: TransactionType;
  transactionDate: string;
  createdAt: string;
  receiptImageUrl?: string;
}

export class Transaction {
  readonly id: string;
  readonly walletId: string;
  readonly categoryId: string;
  readonly categoryName: string;
  readonly iconName?: string;
  readonly isAiSuggested: boolean;
  readonly amount: number;
  readonly description: string;
  readonly type: TransactionType;
  readonly transactionDate: Date;
  readonly createdAt: Date;
  readonly receiptImageUrl?: string;

  private constructor(props: TransactionProps) {
    this.id = props.id;
    this.walletId = props.walletId;
    this.categoryId = props.categoryId;
    this.categoryName = props.categoryName;
    this.iconName = props.iconName;
    this.isAiSuggested = props.isAiSuggested ?? false;
    this.amount = props.amount;
    this.description = props.description;
    this.type = props.type;
    this.transactionDate = new Date(props.transactionDate);
    this.createdAt = new Date(props.createdAt);
    this.receiptImageUrl = props.receiptImageUrl;
  }

  static create(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  isIncome(): boolean {
    return this.type === 'INCOME';
  }

  isExpense(): boolean {
    return this.type === 'EXPENSE';
  }

  isTransfer(): boolean {
    return this.type === 'TRANSFER';
  }

  getSignedAmount(): number {
    return this.isExpense() ? -this.amount : this.amount;
  }

  isSameDay(other: Transaction): boolean {
    return (
      this.transactionDate.getFullYear() === other.transactionDate.getFullYear() &&
      this.transactionDate.getMonth() === other.transactionDate.getMonth() &&
      this.transactionDate.getDate() === other.transactionDate.getDate()
    );
  }

  isSameMonth(other: Transaction): boolean {
    return (
      this.transactionDate.getFullYear() === other.transactionDate.getFullYear() &&
      this.transactionDate.getMonth() === other.transactionDate.getMonth()
    );
  }

  getDateKey(): string {
    return this.transactionDate.toISOString().split('T')[0];
  }

  getMonthKey(): string {
    const year = this.transactionDate.getFullYear();
    const month = String(this.transactionDate.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  hasReceipt(): boolean {
    return !!this.receiptImageUrl;
  }

  isAiGenerated(): boolean {
    return this.isAiSuggested;
  }

  toJSON(): TransactionProps {
    return {
      id: this.id,
      walletId: this.walletId,
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      iconName: this.iconName,
      isAiSuggested: this.isAiSuggested,
      amount: this.amount,
      description: this.description,
      type: this.type,
      transactionDate: this.transactionDate.toISOString(),
      createdAt: this.createdAt.toISOString(),
      receiptImageUrl: this.receiptImageUrl,
    };
  }
}
