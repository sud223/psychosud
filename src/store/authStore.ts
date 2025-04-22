import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isLoggedIn: boolean;
  userToken: string | null;
  isLoading: boolean; // To track loading auth state from storage
  checkAuthState: () => Promise<void>;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  userToken: null,
  isLoading: true, // Start loading initially

  // Action to check auth state from AsyncStorage
  checkAuthState: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        set({ isLoggedIn: true, userToken: token, isLoading: false });
      } else {
        set({ isLoggedIn: false, userToken: null, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
      set({ isLoggedIn: false, userToken: null, isLoading: false });
    }
  },

  // Action to handle login
  login: async (token: string) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      set({ isLoggedIn: true, userToken: token });
    } catch (error) {
      console.error('Failed to save auth token:', error);
    }
  },

  // Action to handle logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      set({ isLoggedIn: false, userToken: null });
    } catch (error) {
      console.error('Failed to remove auth token:', error);
    }
  },
}));

export default useAuthStore;
