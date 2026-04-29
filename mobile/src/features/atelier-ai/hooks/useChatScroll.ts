import { useRef, useCallback, useEffect, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface UseChatScrollOptions {
  isOpen: boolean;
  messagesLength: number;
}

export const useChatScroll = ({ isOpen, messagesLength }: UseChatScrollOptions) => {
  const scrollViewRef = useRef<any>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    const nearBottom = distanceFromBottom < 150;
    setIsNearBottom(nearBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Auto-scroll when messages change and user is near bottom
  useEffect(() => {
    if (messagesLength > 0 && isNearBottom && isOpen) {
      scrollToBottom();
    }
  }, [messagesLength, scrollToBottom, isOpen, isNearBottom]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  return {
    scrollViewRef,
    handleScroll,
    scrollToBottom,
    isNearBottom,
  };
};
