import { Transaction } from '../entities/Transaction';
import {
  TransactionRepository,
  CreateTransactionDTO,
} from '../repositories/TransactionRepository';
import {
  TransactionValidator,
  ValidationResult,
  TransactionInput,
} from '../specifications/TransactionValidator';

export class AddTransactionUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(input: TransactionInput): Promise<Transaction> {
    const validationResult = this.validate(input);

    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.errors);
    }

    const dto: CreateTransactionDTO = {
      walletId: input.walletId!,
      categoryId: input.categoryId!,
      amount: input.amount!,
      description: input.description!,
      type: input.type!,
      transactionDate: input.transactionDate!,
    };

    return this.repository.createTransaction(dto);
  }

  private validate(input: TransactionInput): ValidationResult {
    return TransactionValidator.validate(input);
  }

  validateOnly(input: TransactionInput): ValidationResult {
    return TransactionValidator.validate(input);
  }
}

export class ValidationError extends Error {
  constructor(public readonly errors: Array<{ field: string; message: string }>) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}
