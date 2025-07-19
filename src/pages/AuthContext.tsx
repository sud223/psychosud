import React, { createContext, useState, useContext, ReactNode } from 'react';

// 1. Define the shape of the context value
interface User {
  id: string;
  email: string;
  username: string;
  profilePicture?: string;
  bio?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  showAuthModal: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  setUser: (user: User) => void;
}

// 2. Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUserState] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      // TODO: Implement actual Firebase authentication
      // For now, simulate login
      const userData: User = {
        id: '1',
        email,
        username: email.split('@')[0],
      };
      
      setUserState(userData);
      setIsAuthenticated(true);
      setShowAuthModal(false);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: any): Promise<void> => {
    try {
      // TODO: Implement actual Firebase authentication
      // For now, simulate registration
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        username: userData.username,
      };

      setUserState(newUser);
      setIsAuthenticated(true);
      setShowAuthModal(false);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = (): void => {
    setUserState(null);
    setIsAuthenticated(false);
    setShowAuthModal(false);
  };

  const openAuthModal = (): void => {
    setShowAuthModal(true);
  };

  const closeAuthModal = (): void => {
    setShowAuthModal(false);
  };

  const setUser = (userData: User): void => {
    setUserState(userData);
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  // Provide the context value
  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    showAuthModal,
    login,
    register,
    logout,
    openAuthModal,
    closeAuthModal,
    setUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Create a custom hook to consume the context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
