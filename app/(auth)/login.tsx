import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../components/context/auth';

import { Button, Input, Text, YStack } from 'tamagui';

import { useTheme } from 'tamagui';

// 1. Define the standalone login function
const loginUser = async ({ username, password }: { username: string; password: string }) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const response = await fetch(`${API_URL}/api/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Login failed');
  }
  return response.json();
};

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const authContext = useAuth();

  if (!authContext) {
    throw new Error('Auth context is not available');
  }
  const { signIn } = authContext;

  const theme = useTheme()
  //console.log('background:', theme.background.val)

  // 2. Initialize the mutation
  const { mutate, isPending, error } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Handle success: Save token, navigate to Dashboard, etc.
      //console.log('Logged in!', data);
      /*
data: {"access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXB.., refresh....}
      */
     // logged in successfully, save the access token securely to secure storage
      //SecureStore.setItemAsync('access_token', data.access);
      //SecureStore.setItemAsync('refresh_token', data.refresh);//
      //const signIn = async (tokens: { access: string; refresh: string }) => {
      signIn({ access: data.access, refresh: data.refresh }, userName);
      console.log("login successful, navigating to dashboard...");
    },
    onError: (err) => {
      // Handle error: Show a toast or log it
      console.error(err.message);
    }
  });

  const handlePress = () => {
    // 3. Trigger the mutation with your local state
    console.log("in handlePress, attempting login with: ", { username: userName, password });
    mutate({ username: userName, password });
  };

  return (
    // YStack is a View with flex-direction: column
     // 'p="$5"' uses your theme padding
     <YStack flex={1} justify="center" p="$5" bg="$background" gap="$4">
       
       <Text fontSize="$9" fontWeight="800">Welcome Back</Text>
       
       <YStack gap="$3">
         <Input size="$5" placeholder="Username" value={userName} onChangeText={setUserName} autoCapitalize="none" />
         <Input size="$5" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
       </YStack>
 
       <Button size="$5" theme="blue" bg="$color5" onPress={handlePress}>
         Sign In
       </Button>
 
     </YStack>
     
   );
}

//<ThemeBuilderDemoSimple />

/*
 return (
   // YStack is a View with flex-direction: column
    // 'p="$5"' uses your theme padding
    <YStack flex={1} justify="center" p="$5" bg="$background" gap="$4">
      
      <Text fontSize="$9" fontWeight="800">Welcome Back</Text>
      
      <YStack gap="$3">
        <Input size="$5" placeholder="Username" value={userName} onChangeText={setUserName} autoCapitalize="none" />
        <Input size="$5" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      </YStack>

      <Button size="$5" theme="blue" onPress={handlePress}>
        Sign In
      </Button>

    </YStack>
    
  );
*/

/*
 return (
   // YStack is a View with flex-direction: column
    // 'p="$5"' uses your theme padding
    <>
    <ButtonDemo />
    <Card p="$3" theme="blue" bg="$color8" rounded="$6">
      <Text>Hello Text</Text>
      </Card>
    </>
  );
*/
