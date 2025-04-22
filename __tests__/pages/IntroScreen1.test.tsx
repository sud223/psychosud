import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import IntroScreen1 from '../../src/pages/IntroScreen1';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---- Mocks ----
// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve(null)),
  getItem: jest.fn(() => Promise.resolve(null)), // Default mock, can be overridden per test
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
      goBack: jest.fn(), // Add other methods if needed
    }),
  };
});

// Mock Auth Store (not strictly needed for IntroScreen1, but good practice)
jest.mock('../../src/store/authStore', () => {
  return jest.fn(() => ({
    login: jest.fn(),
    logout: jest.fn(),
    checkAuthState: jest.fn(),
    isLoggedIn: false,
    isLoading: false,
    userToken: null,
  }));
});
// ---- End Mocks ----


describe('IntroScreen1', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    mockNavigate.mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
  });

  it('renders correctly', () => {
    const { getByText } = render(<IntroScreen1 />);
    expect(getByText('Welcome to Psychosud')).toBeTruthy();
    expect(getByText('Your pocket companion for exploring and understanding psychological concepts.')).toBeTruthy();
    expect(getByText('Next')).toBeTruthy();
    expect(getByText('Skip')).toBeTruthy();
  });

  it('navigates to intro2 when "Next" is pressed', () => {
    const { getByText } = render(<IntroScreen1 />);
    fireEvent.press(getByText('Next'));
    expect(mockNavigate).toHaveBeenCalledWith('intro2');
  });

  it('sets AsyncStorage flag and navigates to login when "Skip" is pressed', async () => {
    const { getByText } = render(<IntroScreen1 />);
    fireEvent.press(getByText('Skip'));

    // Wait for promises in handleSkip to resolve
    await AsyncStorage.setItem; // Ensure the async call is awaited

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('hasLaunched', 'true');
    expect(mockNavigate).toHaveBeenCalledWith('login');
  });
});
