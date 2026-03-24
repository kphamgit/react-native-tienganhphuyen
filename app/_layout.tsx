import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// app/_layout.tsx
import { NavigationContextProvider } from "@/components/context/NavigationContext";
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
  return <Stack screenOptions={{ headerShown: true }} >
      <Stack.Screen name="dashboard" options={{ headerTitle: "DDDD" }} />
    </Stack>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
       <NavigationContextProvider>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
      </NavigationContextProvider>
    </AuthProvider>
  );
}

/*
 return <Stack screenOptions={{ headerShown: false }} >
      <Stack.Screen name="dashboard" options={{ headerTitle: "DDDD" }} />
    </Stack>;
*/

/*
import { Stack } from 'expo-router';
import { Animated, Text, StyleSheet } from 'react-native';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: ({ children }) => (
          <Animated.Text style={styles.headerTitle}>{children}</Animated.Text>
        ),
        headerStyle: {
          backgroundColor: 'orange',
        },
        headerTitleStyle: {
          color: 'white',
          fontWeight: 'bold',
        },
      }}
    />
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    opacity: 1, // You can animate this for smooth transitions
  },
});
*/
