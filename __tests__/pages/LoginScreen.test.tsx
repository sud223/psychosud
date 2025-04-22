import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../src/pages/LoginScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../../src/store/authStore';
import { Alert } from 'react-native';

// ---- Mocks ----
// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve(null)),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
}));

// Mock Navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: jest.fn(),
    }),
  };
});

// Mock Auth Store
const mockLogin = jest.fn();
jest.mock('../../src/store/authStore'); // Mock the module

// Mock Alert
jest.spyOn(Alert, 'alert');
// ---- End Mocks ----


describe('LoginScreen', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockNavigate.mockClear();
    mockLogin.mockClear();
    (Alert.alert as jest.Mock).mockClear();
    // Configure the mock implementation for useAuthStore before each test
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
        login: mockLogin,
        logout: jest.fn(),
        checkAuthState: jest.fn(),
        isLoggedIn: false,
        isLoading: false,
        userToken: null,
    });
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Log in')).toBeTruthy();
    expect(getByText("Don't have an account?")).toBeTruthy();
    expect(getByText('Sign up.')).toBeTruthy();
  });

  it('updates email and password state on input change', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('shows alert if email or password is empty on login attempt', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Log in'));
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter both email and password.');
  });

   it('shows alert if email format is invalid', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(getByText('Log in'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email address.');
  });


  it('calls auth store login action on valid input', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(getByText('Log in'));

    // Use waitFor to handle potential async operations in handleLogin if any
     await waitFor(() => {
       expect(mockLogin).toHaveBeenCalledTimes(1);
       // Check if it's called with a string (dummy token)
       expect(mockLogin).toHaveBeenCalledWith(expect.any(String));
       expect(Alert.alert).not.toHaveBeenCalled(); // No error alerts
     });
  });

  it('navigates to signup screen when "Sign up." link is pressed', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Sign up.'));
    expect(mockNavigate).toHaveBeenCalledWith('signup');
  });
});
