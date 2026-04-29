import { Transaction, TransactionProps } from '../../domain/entities/Transaction';
import { TransactionResponse } from '../../types/api';

export class TransactionMapper {
  static toDomain(dto: TransactionResponse): Transaction {
    const props: TransactionProps = {
      id: dto.id,
      walletId: dto.walletId,
      categoryId: dto.categoryId,
      categoryName: dto.categoryName,
      iconName: dto.iconName,
      isAiSuggested: dto.isAiSuggested,
      amount: dto.amount,
      description: dto.description,
      type: dto.type,
      transactionDate: dto.transactionDate,
      createdAt: dto.createdAt,
      receiptImageUrl: dto.receiptImageUrl,
    };

    return Transaction.create(props);
  }

  static toDomainList(dtos: TransactionResponse[]): Transaction[] {
    return dtos.map((dto) => this.toDomain(dto));
  }

  static toDTO(transaction: Transaction): TransactionResponse {
    return {
      id: transaction.id,
      walletId: transaction.walletId,
      categoryId: transaction.categoryId,
      categoryName: transaction.categoryName,
      iconName: transaction.iconName,
      isAiSuggested: transaction.isAiSuggested,
      amount: transaction.amount,
      description: transaction.description,
      type: transaction.type,
      transactionDate: transaction.transactionDate.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
      receiptImageUrl: transaction.receiptImageUrl,
    };
  }
}
