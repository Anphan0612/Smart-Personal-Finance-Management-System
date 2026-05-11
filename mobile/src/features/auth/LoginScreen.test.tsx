import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor, screen } from '@testing-library/react-native';
import LoginScreen from './LoginScreen';

jest.mock('../../../assets/images/icon.png', () => 'icon-mock');

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockSetTokens = jest.fn();
const mockPoster = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    replace: (...args: any[]) => mockReplace(...args),
    push: (...args: any[]) => mockPush(...args),
  },
}));

jest.mock('../../store/useAppStore', () => ({
  useAppStore: (selector: any) =>
    selector({
      setTokens: mockSetTokens,
    }),
}));

jest.mock('../../services/api', () => ({
  poster: (...args: any[]) => mockPoster(...args),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  it('shows validation error messages when email/password are empty', async () => {
    render(<LoginScreen />);

    fireEvent.press(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Vui lòng nhập email')).toBeTruthy();
      expect(screen.getByText('Vui lòng nhập mật khẩu')).toBeTruthy();
    });
    expect(mockPoster).not.toHaveBeenCalled();
  });

  it('logs in successfully and navigates to tabs', async () => {
    mockPoster.mockResolvedValueOnce({
      accessToken: 'token-123',
      refreshToken: 'refresh-123',
      name: 'Test User',
      email: 'test@example.com',
    });

    render(<LoginScreen />);

    fireEvent.changeText(screen.getByTestId('login-email-input'), 'test@example.com');
    fireEvent.changeText(screen.getByTestId('login-password-input'), 'test123456');
    fireEvent.press(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      expect(mockPoster).toHaveBeenCalledWith('/auth/login', {
        username: 'test@example.com',
        password: 'test123456',
      });
      expect(mockSetTokens).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('shows error alert on failed login', async () => {
    mockPoster.mockRejectedValueOnce({
      response: {
        status: 401,
        data: {
          message: 'Thông tin đăng nhập không hợp lệ',
        },
      },
    });

    render(<LoginScreen />);

    fireEvent.changeText(screen.getByTestId('login-email-input'), 'bad@example.com');
    fireEvent.changeText(screen.getByTestId('login-password-input'), 'wrong');
    fireEvent.press(screen.getByTestId('login-submit-button'));

    await waitFor(() => {
      // Use regex to be more flexible with potential whitespace/newline issues
      expect(screen.getByText(/Thông tin đăng nhập không hợp lệ/)).toBeTruthy();
    }, { timeout: 2000 });
  });
});
