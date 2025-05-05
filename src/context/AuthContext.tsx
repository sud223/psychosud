import React, { createContext, useState, useContext, ReactNode } from 'react';

// 1. Define the shape of the context value
interface AuthContextType {
  userId: string | null;
}

// 2. Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Manage state for the user ID, initialized to 'currentUserHardcodedId'
  const [userId, setUserId] = useState<string | null>('currentUserHardcodedId');

  // Provide the userId through the AuthContext.Provider
  return (
    <AuthContext.Provider value={{ userId }}>
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
