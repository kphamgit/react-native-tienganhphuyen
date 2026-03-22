// app/(app)/dashboard.tsx
import { useAuth } from '@/components/context/auth';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
//import api from '../../api/axios'; // Our Axios instance with JWT logic
//import { useAuth } from '../../context/auth';

export default function Dashboard() {
    const auth = useAuth();
    const signOut = auth?.signOut;
    const insets = useSafeAreaInsets();

  // 1. Fetch data using TanStack Query
  /*
  const { data: quizzes, isLoading, error, refetch } = useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      // Axios handles the Bearer token and Refresh logic automatically!
      const response = await api.get('/quizzes/active/');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
    */

  return (
  <>
   
    <View style={[
      styles.container, 
      { 
        // Manually apply insets to avoid the notch and home indicator
        paddingTop: insets.top, 
        paddingBottom: insets.bottom 
      }
    ]}>
     <View style={styles.header}>
        <Text style={styles.greeting}>Hello, Student! 👋</Text>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  text: { fontSize: 18, color: '#333' },
  logoutText: { color: '#ff3b30', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#666' },
  quizCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 12, elevation: 2 },
  quizTitle: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  quizMeta: { color: '#888', marginTop: 5 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});