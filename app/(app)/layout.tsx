// app/(app)/_layout.tsx
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
   
      <Stack.Screen name="dashboard" 
        options={{ headerTitle: "Dashboard" }} />
    
  );
}
