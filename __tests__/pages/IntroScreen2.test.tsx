import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import IntroScreen2 from '../../src/pages/IntroScreen2';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Mock Auth Store (not strictly needed for IntroScreen2)
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

describe('IntroScreen2', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
  });

  it('renders correctly', () => {
    const { getByText } = render(<IntroScreen2 />);
    expect(getByText('Discover & Share')).toBeTruthy();
    expect(getByText('Explore a vast library of psychological terms and share insights with the community.')).toBeTruthy();
    expect(getByText('Get Started')).toBeTruthy();
    expect(getByText('Skip')).toBeTruthy();
  });

  it('sets AsyncStorage flag and navigates to login when "Get Started" is pressed', async () => {
    const { getByText } = render(<IntroScreen2 />);
    fireEvent.press(getByText('Get Started'));

    // Wait for promises in completeIntro to resolve
    await AsyncStorage.setItem;

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('hasLaunched', 'true');
    expect(mockNavigate).toHaveBeenCalledWith('login');
  });

  it('sets AsyncStorage flag and navigates to login when "Skip" is pressed', async () => {
    const { getByText } = render(<IntroScreen2 />);
    fireEvent.press(getByText('Skip'));

    // Wait for promises in completeIntro to resolve
    await AsyncStorage.setItem;

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('hasLaunched', 'true');
    expect(mockNavigate).toHaveBeenCalledWith('login');
  });
});
