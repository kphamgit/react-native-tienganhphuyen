import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../components/context/auth';

function RootLayoutNav() {
  const auth = useAuth();
  const user = auth?.user;
  const isLoading = auth?.isLoading ?? true;
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // 1. If not logged in and trying to access app -> Redirect to Login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // 2. If logged in and trying to access auth -> Redirect to App
      router.replace('/(app)/dashboard');
    }
  }, [user, isLoading, segments]);

  // for development: clear tokens on app start to force login flow
  /*
  useEffect(() => {
    const clearForDev = async () => {
      // ONLY use this during active debugging of the login flow
     
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        console.log("Tokens cleared for development");
    
    };

    clearForDev();
  }, []);
*/
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </AuthProvider>
  );
}

/*
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
    <Stack />
    </QueryClientProvider>
  )
}
*/
