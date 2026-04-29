import { Transaction } from '../entities/Transaction';

export interface CreateTransactionDTO {
  walletId: string;
  categoryId: string;
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  transactionDate: string;
  receiptImageUrl?: string;
}

export interface TransactionFilters {
  walletId?: string;
  categoryId?: string;
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  page: number;
  size: number;
}

export interface PaginatedResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface TransactionRepository {
  getTransactions(
    filters?: TransactionFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Transaction>>;

  getTransactionById(id: string): Promise<Transaction>;

  createTransaction(dto: CreateTransactionDTO): Promise<Transaction>;

  updateTransaction(id: string, dto: Partial<CreateTransactionDTO>): Promise<Transaction>;

  deleteTransaction(id: string): Promise<void>;
}
