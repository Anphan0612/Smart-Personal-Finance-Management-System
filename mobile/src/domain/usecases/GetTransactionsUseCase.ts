import { Transaction } from '../entities/Transaction';
import {
  TransactionRepository,
  TransactionFilters,
  PaginationParams,
  PaginatedResult,
} from '../repositories/TransactionRepository';

export class GetTransactionsUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(
    filters?: TransactionFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Transaction>> {
    const result = await this.repository.getTransactions(filters, pagination);

    const deduplicated = this.deduplicateTransactions(result.content);

    return {
      ...result,
      content: deduplicated,
    };
  }

  private deduplicateTransactions(transactions: Transaction[]): Transaction[] {
    const seen = new Map<string, Transaction>();

    for (const transaction of transactions) {
      if (!seen.has(transaction.id)) {
        seen.set(transaction.id, transaction);
      }
    }

    return Array.from(seen.values());
  }

  async getById(id: string): Promise<Transaction> {
    return this.repository.getTransactionById(id);
  }
}
