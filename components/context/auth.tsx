// context/auth.tsx
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<{
  user: any;
  userName: string | null;
  signIn: (tokens: { access: string; refresh: string }, userName: string) => void;
  signOut: () => void;
  isLoading: boolean;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app startup
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        // Optionally: Verify token with Django here
        setUser({ token }); 
      }
      setIsLoading(false);
    };
    loadToken();
  }, []);

  const signIn = async (tokens: { access: string; refresh: string }, userName: string) => {
    await SecureStore.setItemAsync('access_token', tokens.access);
    await SecureStore.setItemAsync('refresh_token', tokens.refresh);
    setUser({ token: tokens.access });
    setUserName(userName);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, userName, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);