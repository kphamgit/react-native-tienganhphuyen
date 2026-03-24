import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

//const API_URL = 'https://tienganhphuyen.com/api'; // Your Django API
const API_URL = process.env.EXPO_PUBLIC_API_URL;
  console.log("API URL:", API_URL);
   

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor: Attach Access Token ---
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor: Handle 401 (Expired Token) ---
api.interceptors.response.use(
  (response) => response, // If request is successful, just return it
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't retried this request yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        
        // 1. Ask Django for a new access token
        const res = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        if (res.status === 200) {
          const newAccessToken = res.data.access;

          // 2. Save the new token
          await SecureStore.setItemAsync('access_token', newAccessToken);

          // 3. Update the original request header and retry it
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 4. Refresh token is also expired or invalid -> Log user out
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        
        // Use an event or a global state refresh to trigger the UI logout
        // (Optional: Redirect to login)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;