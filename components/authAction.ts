import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    console.log("API URL in loginAction: ", API_URL);
    const response = await fetch(`${API_URL}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.detail || 'Login failed' };
    }

    // Save tokens securely in iOS Keychain
    await SecureStore.setItemAsync('access_token', data.access);
    await SecureStore.setItemAsync('refresh_token', data.refresh);

    return { success: true };
  } catch (err) {
    return { error: 'Network error. Is your Django server running?' };
  }
}