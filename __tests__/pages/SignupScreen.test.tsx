import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignupScreen from '../../src/pages/SignupScreen';
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
    useFocusEffect: jest.fn((callback) => { // Mock useFocusEffect
      React.useEffect(callback); // Simulate effect running
      return jest.fn(); // Return cleanup function
    }),
  };
});

// Mock Auth Store
const mockLogin = jest.fn();
jest.mock('../../src/store/authStore'); // Mock the module

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock BackHandler (needed due to useFocusEffect)
jest.mock('react-native/Libraries/Utilities/BackHandler', () => {
    const BackHandler = jest.requireActual('react-native/Libraries/Utilities/BackHandler');
    return {
      ...BackHandler,
      addEventListener: jest.fn(() => ({remove: jest.fn()})), // Return mock remove fn
      removeEventListener: jest.fn(),
    };
});
// ---- End Mocks ----

describe('SignupScreen', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockNavigate.mockClear();
    mockLogin.mockClear();
    (Alert.alert as jest.Mock).mockClear();
    // Configure the mock implementation for useAuthStore
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
    const { getByPlaceholderText, getByText } = render(<SignupScreen />);
    expect(getByPlaceholderText('Enter your name')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm your password')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
    expect(getByText('Already have an account?')).toBeTruthy();
    expect(getByText('Login.')).toBeTruthy();
  });

  it('updates state on input change', () => {
    const { getByPlaceholderText } = render(<SignupScreen />);
    const nameInput = getByPlaceholderText('Enter your name');
    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const confirmInput = getByPlaceholderText('Confirm your password');

    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmInput, 'password123');

    expect(nameInput.props.value).toBe('Test User');
    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
    expect(confirmInput.props.value).toBe('password123');
  });

  it('shows alert for empty fields', () => {
    const { getByText } = render(<SignupScreen />);
    fireEvent.press(getByText('Sign Up'));
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields.');
  });

  it('shows alert for invalid email format', () => {
    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    fireEvent.changeText(getByPlaceholderText('Enter your name'), 'Test');
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'invalid-email');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'password123');
    fireEvent.press(getByText('Sign Up'));
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email address.');
  });

  it('shows alert for password mismatch', () => {
    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    fireEvent.changeText(getByPlaceholderText('Enter your name'), 'Test');
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'password456');
    fireEvent.press(getByText('Sign Up'));
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Passwords do not match.');
  });

    it('shows alert for short password', () => {
    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    fireEvent.changeText(getByPlaceholderText('Enter your name'), 'Test');
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'pass');
    fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'pass');
    fireEvent.press(getByText('Sign Up'));
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Password must be at least 6 characters long.');
  });

  it('calls auth store login action on valid signup', async () => {
    const { getByText, getByPlaceholderText } = render(<SignupScreen />);
    fireEvent.changeText(getByPlaceholderText('Enter your name'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'password123');
    fireEvent.press(getByText('Sign Up'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(mockLogin).toHaveBeenCalledWith(expect.stringContaining('dummy-token-Test User-'));
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Signup successful!');
    });
  });

  it('navigates to login screen when "Login." link is pressed', () => {
    const { getByText } = render(<SignupScreen />);
    fireEvent.press(getByText('Login.'));
    expect(mockNavigate).toHaveBeenCalledWith('login');
  });
});
