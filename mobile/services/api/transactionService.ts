import { ParsedTransaction } from '../../components/nlp/NaturalLanguageInput';

export interface TransactionRequest {
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  walletId: string; // Assuming default wallet for now
}

export interface TransactionResponse {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  walletId: string;
  createdAt: string;
  updatedAt: string;
}

class TransactionService {
  private baseUrl = 'http://localhost:8080/api/v1'; // Adjust based on your backend URL

  async saveTransaction(transaction: ParsedTransaction): Promise<TransactionResponse> {
    // For now, use a default wallet ID - in real app, get from user context
    const request: TransactionRequest = {
      ...transaction,
      walletId: 'default-wallet-id' // TODO: Get from user context
    };

    const response = await fetch(`${this.baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authorization header
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to save transaction: ${response.statusText}`);
    }

    return response.json();
  }

  async parseNLP(text: string): Promise<ParsedTransaction> {
    // TODO: Implement when backend API is ready
    // For now, return mock data
    const response = await fetch(`${this.baseUrl}/nlp/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`Failed to parse NLP: ${response.statusText}`);
    }

    return response.json();
  }
}

export const transactionService = new TransactionService();