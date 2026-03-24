

//import { useNavigationContext } from '@/components/context/NavigationContext';
import api from '@/api/axios';
import { CategoryProps } from '@/components/types';
import { HeaderBackButton } from '@react-navigation/elements';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function LevelScreen() {
  const { id} = useLocalSearchParams(); // Extract the dynamic route parameter 'id'
  const [levelName, setLevelName] = React.useState<string | undefined>(undefined);
  const [categories, setCategories] = React.useState<any[]>([]); // State to hold categories data
  const insets = useSafeAreaInsets();
 
  useEffect(() => {
    console.log(' insets top in LevelScreen: ', insets.top)
    console.log(' insets bottom in LevelScreen: ', insets.bottom)
  }, [insets]);
   
  useEffect(() => {
    api.get(`/english/levels/${id}/`) // Fetch the specific level using the dynamic id
      .then((res) => res.data)
      .then((data) => {
        setLevelName(data.name); // Set the level name in state
        setCategories(data.categories); // Set the categories in state
        // Log the categories to verify they are being set correctly
        data.categories.map((category: CategoryProps) => {
          console.log(`Category: ${category.name}, ID: ${category.id}`);
        });
      })
      .catch((err) => alert(err));
  }, [id]);
     
    
  const handleClick = (categoryId: string) => {
    router.replace(`/categories/${categoryId}`);
  };

  return (
    <>
     <Stack.Screen 
        options={{
          headerTitle: levelName || '', // use an empty string as fallback to avoid "flickering" when levelName is initially undefined
          headerStyle: {
            backgroundColor: 'orange', // Set the background color of the header
          },
          headerTitleStyle: {
            color: 'white', // Set the color of the title text
            fontWeight: 'bold', // Make the title text bold
            fontSize: 16, // Set the font size of the title text
          },
          headerLeft: () => (
            <HeaderBackButton onPress={() => {
              //console.log('Navigating back to categories screen');
              router.replace('/(app)/dashboard');
 
            }} />
          ),
          headerShown: true, // Ensure the header is shown for this screen
        }}
      />
      <View style={[
          styles.container,
        {
          // Manually apply insets to avoid the notch and home indicator
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
         
        }
      ]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 , margin: 0, padding: 0}}
             >
           <View style={{ flex: 1, backgroundColor: 'blue',  padding: 10 }}>
             { categories && categories.length > 0 ? (
                 categories.map((category: CategoryProps, index: number) => (
                     <View key={index} style={[styles.button, ]}>
                     <Button
                         key={index}
                         title={category.name}
                         color="white"
                         onPress ={() => handleClick(category.id.toString())}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'red' },
  header: { flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  text: { fontSize: 18, color: '#333' },
  logoutText: { color: '#ff3b30', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#666' },
  button: { backgroundColor: 'green', color: "white", padding: 5, borderRadius: 8, alignItems: 'center', marginBottom: 5 },
  quizCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 12, elevation: 2 },
  quizTitle: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  quizMeta: { color: '#888', marginTop: 5 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});


