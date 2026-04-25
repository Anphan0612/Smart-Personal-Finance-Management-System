import { TransactionType } from '../entities/Transaction';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface TransactionInput {
  amount?: number;
  type?: TransactionType;
  categoryId?: string;
  description?: string;
  transactionDate?: string;
  walletId?: string;
}

export class TransactionValidator {
  static validate(input: TransactionInput): ValidationResult {
    const errors: ValidationError[] = [];

    if (!input.amount) {
      errors.push({ field: 'amount', message: 'Amount is required' });
    } else if (input.amount <= 0) {
      errors.push({ field: 'amount', message: 'Amount must be positive' });
    } else if (!Number.isFinite(input.amount)) {
      errors.push({ field: 'amount', message: 'Amount must be a valid number' });
    }

    if (!input.type) {
      errors.push({ field: 'type', message: 'Transaction type is required' });
    } else if (!['INCOME', 'EXPENSE', 'TRANSFER'].includes(input.type)) {
      errors.push({ field: 'type', message: 'Invalid transaction type' });
    }

    if (!input.categoryId || input.categoryId.trim() === '') {
      errors.push({ field: 'categoryId', message: 'Category is required' });
    }

    if (!input.description || input.description.trim() === '') {
      errors.push({ field: 'description', message: 'Description is required' });
    } else if (input.description.length > 500) {
      errors.push({ field: 'description', message: 'Description must not exceed 500 characters' });
    }

    if (!input.transactionDate) {
      errors.push({ field: 'transactionDate', message: 'Transaction date is required' });
    } else {
      const date = new Date(input.transactionDate);
      if (isNaN(date.getTime())) {
        errors.push({ field: 'transactionDate', message: 'Invalid transaction date' });
      } else if (date > new Date()) {
        errors.push({ field: 'transactionDate', message: 'Transaction date cannot be in the future' });
      }
    }

    if (!input.walletId || input.walletId.trim() === '') {
      errors.push({ field: 'walletId', message: 'Wallet is required' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateAmount(amount: number): boolean {
    return amount > 0 && Number.isFinite(amount);
  }

  static validateType(type: string): type is TransactionType {
    return ['INCOME', 'EXPENSE', 'TRANSFER'].includes(type);
  }

  static validateDate(date: string): boolean {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
  }

  static validateDescription(description: string): boolean {
    return description.trim().length > 0 && description.length <= 500;
  }
}
