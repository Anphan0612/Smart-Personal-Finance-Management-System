import {
  TransactionRepository,
  CreateTransactionDTO,
  TransactionFilters,
  PaginationParams,
  PaginatedResult,
} from '../../domain/repositories/TransactionRepository';
import { Transaction } from '../../domain/entities/Transaction';
import { PagedResponse, TransactionResponse, ApiResponse } from '../../types/api';
import { apiClient } from '../../services/api';
import { TransactionMapper } from '../mappers/TransactionMapper';

export class ApiTransactionRepository implements TransactionRepository {
  private readonly baseUrl = '/transactions';

  async getTransactions(
    filters?: TransactionFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Transaction>> {
    const params: any = {
      page: pagination?.page ?? 0,
      size: pagination?.size ?? 20,
    };

    if (filters?.walletId) params.walletId = filters.walletId;
    if (filters?.categoryId) params.categoryId = filters.categoryId;
    if (filters?.type) params.type = filters.type;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;

    const response = await apiClient.get<ApiResponse<PagedResponse<TransactionResponse>>>(
      this.baseUrl,
      { params }
    );

    const pagedData = response.data.data;

    return {
      content: TransactionMapper.toDomainList(pagedData.content),
      page: pagedData.page,
      size: pagedData.size,
      totalElements: pagedData.totalElements,
      totalPages: pagedData.totalPages,
      last: pagedData.last,
      first: pagedData.first,
    };
  }

  async getTransactionById(id: string): Promise<Transaction> {
    const response = await apiClient.get<ApiResponse<TransactionResponse>>(
      `${this.baseUrl}/${id}`
    );
    return TransactionMapper.toDomain(response.data.data);
  }

  async createTransaction(dto: CreateTransactionDTO): Promise<Transaction> {
    const response = await apiClient.post<ApiResponse<TransactionResponse>>(this.baseUrl, dto);
    return TransactionMapper.toDomain(response.data.data);
  }

  async updateTransaction(
    id: string,
    dto: Partial<CreateTransactionDTO>
  ): Promise<Transaction> {
    const response = await apiClient.put<ApiResponse<TransactionResponse>>(
      `${this.baseUrl}/${id}`,
      dto
    );
    return TransactionMapper.toDomain(response.data.data);
  }

  async deleteTransaction(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
