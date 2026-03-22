// app/index.tsx (Your Home Screen)
import { Link } from 'expo-router'; // 1. Import the Link component
import { StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome to Tiếng Anh Phú Yên</Text>
      
      {/* 2. Use the address, not the component name */}
      <Link href="/login" style={styles.button}>
        <Text style={styles.buttonText}>Go to Login</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 22, marginBottom: 20 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});