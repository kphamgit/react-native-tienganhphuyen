import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  // 2. Initialize the mutation
  const { mutate, isPending, error } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Handle success: Save token, navigate to Dashboard, etc.
      console.log('Logged in!', data);
      /*
data: {"access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXB.., refresh....}
      */
     // logged in successfully, save the access token securely to secure storage
      SecureStore.setItemAsync('access_token', data.access);
      SecureStore.setItemAsync('refresh_token', data.refresh);
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
    <View style={{ flex: 1, paddingTop: insets.top, paddingHorizontal: 20 }}>
      <TextInput 
        placeholder="Username" 
        value={userName} 
        onChangeText={setUserName} 
        style={styles.input} 
      />
      <TextInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
        style={styles.input} 
      />

      {error && <Text style={{ color: 'red' }}>{error.message}</Text>}

      <TouchableOpacity onPress={handlePress} disabled={isPending} style={styles.button}>
        {isPending ? <ActivityIndicator color="#fff" /> : <Text>LLLogin</Text>}
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 8, marginBottom: 15 },
  errorText: { color: 'red', marginBottom: 10, textAlign: 'center' },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center' }
});