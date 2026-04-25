import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAtelierChat } from '../hooks/useAtelierChat';
import { useAppStore } from '../../../store/useAppStore';
import { poster } from '../../../services/api';
import * as Haptics from 'expo-haptics';

// Mock dependencies
jest.mock('../../../services/api');
jest.mock('expo-haptics');
jest.mock('../../../store/useAppStore');
jest.mock('../../../utils/id', () => ({
  generateId: jest.fn(() => 'mock-id-123'),
  ID_PREFIX: { MESSAGE: 'msg' },
}));

describe('useAtelierChat', () => {
  const mockAddMessage = jest.fn();
  const mockMessages = [];
  const mockActiveWalletId = 'wallet-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      messages: mockMessages,
      addMessage: mockAddMessage,
      activeWalletId: mockActiveWalletId,
    });
  });

  it('should send a message successfully', async () => {
    const mockResponse = {
      message: 'AI response',
      data: null,
      type: 'text',
    };
    (poster as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAtelierChat());

    expect(result.current.isProcessing).toBe(false);

    await act(async () => {
      await result.current.sendMessage('Hello AI');
    });

    // Should add user message
    expect(mockAddMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'user',
        content: 'Hello AI',
      })
    );

    // Should add assistant response
    expect(mockAddMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'assistant',
        content: 'AI response',
      })
    );

    // Should trigger haptic feedback
    expect(Haptics.impactAsync).toHaveBeenCalled();

    // Should reset processing state
    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false);
    });
  });

  it('should handle API errors gracefully', async () => {
    (poster as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAtelierChat());

    await act(async () => {
      await result.current.sendMessage('Hello AI');
    });

    // Should add error message
    expect(mockAddMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      })
    );

    // Should reset processing state
    expect(result.current.isProcessing).toBe(false);
  });

  it('should not send empty messages', async () => {
    const { result } = renderHook(() => useAtelierChat());

    await act(async () => {
      await result.current.sendMessage('   ');
    });

    expect(mockAddMessage).not.toHaveBeenCalled();
    expect(poster).not.toHaveBeenCalled();
  });

  it('should not send messages while processing', async () => {
    (poster as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    const { result } = renderHook(() => useAtelierChat());

    act(() => {
      result.current.sendMessage('First message');
    });

    // Try to send another message while processing
    await act(async () => {
      await result.current.sendMessage('Second message');
    });

    // Should only call poster once
    expect(poster).toHaveBeenCalledTimes(1);
  });

  it('should include walletId in API request', async () => {
    (poster as jest.Mock).mockResolvedValue({ message: 'Response' });

    const { result } = renderHook(() => useAtelierChat());

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    expect(poster).toHaveBeenCalledWith('/ai/chat', {
      message: 'Test message',
      walletId: mockActiveWalletId,
    });
  });
});
