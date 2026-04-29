import { renderHook, act } from '@testing-library/react-native';
import { useChatScroll } from '../hooks/useChatScroll';

describe('useChatScroll', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() =>
      useChatScroll({ isOpen: true, messagesLength: 0 })
    );

    expect(result.current.scrollViewRef.current).toBeNull();
    expect(result.current.isNearBottom).toBe(true);
  });

  it('should update isNearBottom based on scroll position', () => {
    const { result } = renderHook(() =>
      useChatScroll({ isOpen: true, messagesLength: 5 })
    );

    const mockScrollEvent = {
      nativeEvent: {
        contentOffset: { y: 100 },
        layoutMeasurement: { height: 500 },
        contentSize: { height: 1000 },
      },
    };

    act(() => {
      result.current.handleScroll(mockScrollEvent as any);
    });

    // Distance from bottom = 1000 - 100 - 500 = 400 (> 150, so not near bottom)
    expect(result.current.isNearBottom).toBe(false);
  });

  it('should detect when user is near bottom', () => {
    const { result } = renderHook(() =>
      useChatScroll({ isOpen: true, messagesLength: 5 })
    );

    const mockScrollEvent = {
      nativeEvent: {
        contentOffset: { y: 900 },
        layoutMeasurement: { height: 500 },
        contentSize: { height: 1500 },
      },
    };

    act(() => {
      result.current.handleScroll(mockScrollEvent as any);
    });

    // Distance from bottom = 1500 - 900 - 500 = 100 (< 150, so near bottom)
    expect(result.current.isNearBottom).toBe(true);
  });

  it('should scroll to bottom with delay', () => {
    const mockScrollToEnd = jest.fn();
    const { result } = renderHook(() =>
      useChatScroll({ isOpen: true, messagesLength: 5 })
    );

    result.current.scrollViewRef.current = {
      scrollToEnd: mockScrollToEnd,
    };

    act(() => {
      result.current.scrollToBottom();
    });

    expect(mockScrollToEnd).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockScrollToEnd).toHaveBeenCalledWith({ animated: true });
  });

  it('should clear previous scroll timer when scrollToBottom is called again', () => {
    const mockScrollToEnd = jest.fn();
    const { result } = renderHook(() =>
      useChatScroll({ isOpen: true, messagesLength: 5 })
    );

    result.current.scrollViewRef.current = {
      scrollToEnd: mockScrollToEnd,
    };

    act(() => {
      result.current.scrollToBottom();
      result.current.scrollToBottom();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should only call once (second call cancels first timer)
    expect(mockScrollToEnd).toHaveBeenCalledTimes(1);
  });

  it('should cleanup timer on unmount', () => {
    const { result, unmount } = renderHook(() =>
      useChatScroll({ isOpen: true, messagesLength: 5 })
    );

    const mockScrollToEnd = jest.fn();
    result.current.scrollViewRef.current = {
      scrollToEnd: mockScrollToEnd,
    };

    act(() => {
      result.current.scrollToBottom();
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Should not call after unmount
    expect(mockScrollToEnd).not.toHaveBeenCalled();
  });
});
