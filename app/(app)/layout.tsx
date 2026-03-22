// app/(app)/_layout.tsx
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ title: 'My Learning' }} />
    </Stack>
  );
}