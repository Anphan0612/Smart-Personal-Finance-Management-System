import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { ManualTransactionModal } from './ManualTransactionModal';

const mockMutateAsync = jest.fn();

jest.mock('@/hooks/useWallets', () => ({
  useWallets: () => ({
    data: [{ id: 'wallet-1', name: 'Main Wallet', balance: 1000000, type: 'CASH' }],
  }),
}));

jest.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    data: [{ id: 'cat-1', name: 'Food', type: 'EXPENSE', iconName: 'restaurant' }],
    isLoading: false,
  }),
  useCreateCategory: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock('@/hooks/useTransactions', () => ({
  useAddTransaction: () => ({
    mutateAsync: (...args: any[]) => mockMutateAsync(...args),
    isPending: false,
  }),
}));

jest.mock('./components/QuickCategorySelect', () => ({
  QuickCategorySelect: ({ onSelect, categories, selectedId }: any) => {
    const React = require('react');
    React.useEffect(() => {
      if (!selectedId && categories?.length) {
        onSelect(categories[0]);
      }
    }, []);
    return null;
  },
}));

jest.mock('./components/WalletPicker', () => ({
  WalletPicker: ({ onSelect, wallets, selectedId }: any) => {
    const React = require('react');
    React.useEffect(() => {
      if (!selectedId && wallets?.length) {
        onSelect(wallets[0]);
      }
    }, []);
    return null;
  },
}));

jest.mock('./components/CategoryCreationModal', () => ({
  CategoryCreationModal: () => <></>,
}));

describe('ManualTransactionModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  it('shows validation alert when amount is missing', async () => {
    const { getByTestId } = render(
      <ManualTransactionModal isVisible onClose={jest.fn()} />,
    );

    fireEvent.press(getByTestId('transaction-save-button'));

    expect(Alert.alert).toHaveBeenCalledWith('Thiếu thông tin', 'Vui lòng nhập số tiền và chọn ví');
  });

  it('shows validation alert when amount is zero', async () => {
    const { getByTestId } = render(
      <ManualTransactionModal isVisible onClose={jest.fn()} />,
    );

    fireEvent.changeText(getByTestId('transaction-amount-input'), '0');
    fireEvent.press(getByTestId('transaction-save-button'));

    expect(Alert.alert).toHaveBeenCalledWith('Số tiền không hợp lệ', 'Số tiền phải lớn hơn 0');
  });

  it('shows error alert when save request fails', async () => {
    mockMutateAsync.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Backend unavailable',
        },
      },
    });

    const { getByTestId } = render(
      <ManualTransactionModal isVisible onClose={jest.fn()} />,
    );

    fireEvent.changeText(getByTestId('transaction-amount-input'), '120000');
    fireEvent.press(getByTestId('transaction-save-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Backend unavailable');
    });
  });
});
