// app/(app)/dashboard.tsx
import api from '@/api/axios';
import { useAuth } from '@/components/context/auth';
import { LevelProps } from '@/components/types';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
//import { useAuth } from '../../context/auth';

export default function Dashboard() {
    const auth = useAuth();
    const signOut = auth?.signOut;
    const insets = useSafeAreaInsets();

    const [levels, setLevels] = React.useState<LevelProps[]>([]);

    useEffect(() => {
        console.log(' Dashboard insets top : ', insets.top)
        console.log(' Dashboard insets bottom : ', insets.bottom)
      }, [insets]);
       
    const getLevels = () => {
        //console.log("Fetching categories...");
        api
            .get("/api/levels/")
            .then((res) => res.data)
            .then((data) => {
                //setLevels(data as LevelProps[]);
               console.log("***** levels: ", data as LevelProps[]);
               // go through the levels and log their names
                setLevels(data as LevelProps[]);
                (data as LevelProps[]).forEach(level => {
                 console.log(`Level: ${level.name}, ID: ${level.id}`);
                 // log all the categories for this level
                    level.categories.forEach(category => {
                        console.log(` Category: ${category.name}, ID: ${category.id}`);
                    });
                });
            })
            .catch((err) => alert(err));
    };

    useEffect(() => {
        getLevels();
     }, []);
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

  const handleClick = (id: string) => {
    console.log("Level clicked! id =", id);

    router.replace(`/levels/${id}`);
  };

useEffect(() => {
    console.log(' insets top in Dashboard: ', insets.top)
    console.log(' insets bottom in Dashboard: ', insets.bottom)
  }, [insets]);

  return (
  <>
   
    <View style={[
      styles.container,
      { 
        // Manually apply insets to avoid the notch and home indicator
        paddingTop: insets.top, 
        paddingBottom: insets.bottom ,
      
      }
    ]}>
     <View style={styles.header}>
        <View>
       
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle ={{padding: 0,}}
            style={{ width: '100%' }}
        >
      <View style={{ flex: 1, gap: 0, marginHorizontal: 0,  padding:5, justifyContent: 'center', backgroundColor: 'lightgreen', marginTop: 0}}>
        { levels && levels.length > 0 ? (
            levels.map((level: LevelProps, index: number) => (
                <View key={index} style={[styles.button, ]}>
                <Button
                    key={index}
                    title={level.name}
                    color="white"
                    onPress ={() => handleClick(level.id.toString())}
          />
                </View>

              
            ))
            ) : (
            <Text style={styles.empty}>No levels available.</Text>
             )

        }
         </View>
    </ScrollView>
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'red' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  text: { fontSize: 18, color: '#333' },
  logoutText: { color: '#ff3b30', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#666' },
  button: { backgroundColor: 'green', color: "white", padding: 5, borderRadius: 8, alignItems: 'center', marginBottom: 5 },
  quizCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 12, elevation: 2 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});