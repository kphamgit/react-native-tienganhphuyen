

//import { useNavigationContext } from '@/components/context/NavigationContext';
import api from '@/api/axios';
import { CategoryProps } from '@/components/types';
import { HeaderBackButton } from '@react-navigation/elements';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function CategoryScreen() {
  const { id} = useLocalSearchParams(); // Extract the dynamic route parameter 'id'
  const [levelId, setLevelId] = React.useState<string | undefined>(undefined); // used to nagivate back to the level screen
  const [categoryName, setCategoryName] = React.useState<string | undefined>(undefined);
  const [units, setUnits] = React.useState<any[]>([]); // State to hold categories data

 const insets = useSafeAreaInsets();
 
   
  useEffect(() => {
    //console.log('CategoryScreen useEffect triggered. Dynamic route id (Level):', id);
    api.get(`/english/categories/${id}/`) // Fetch the specific category using the dynamic id, which should include units as part of the response
      .then((res) => res.data)
      .then((data) => {
        //setSubCategories(data.sub_categories as SubCategoryProps[]);
        console.log("Category data retrieved: ", data);
        setCategoryName(data.name); // Set the level name in state
        setLevelId(data.level_id); // Set the level id in state for navigating back to the level screen
        setUnits(data.units); // Set the categories in state
        // Log the categories to verify they are being set correctly
        data.units.map((unit: CategoryProps) => {
          console.log(`Unit: ${unit.name}, ID: ${unit.id}`);
        });
      })
      .catch((err) => alert(err));
  }, [id]);
     
    
  const handleClick = (unitId: string) => {
    console.log(`Unitttt clicked: ${unitId}`);
    router.replace(`/units/${unitId}`);
    //console.log(`Unit clicked: ${unitId}, Name: ${unitName}`);
    //const queryParams = new URLSearchParams({
      //unitName: unitName, // Ensure unitName is a string
    //});
    //router.replace(`/units/${unitId}?${queryParams.toString()}`);
  };
//Array.isArray(categoryName) ? categoryName[0] : categoryName,
  return (
    <>
     <Stack.Screen 
        options={{
          headerTitle: categoryName || '', // use an empty string as fallback to avoid "flickering" when categoryName is initially undefined
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
              //router.replace('/(app)/dashboard');
              router.replace(`/levels/${levelId}`);
 
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
          paddingBottom: insets.bottom
        }
      ]}>
      <ScrollView contentContainerStyle ={{padding: 10,}}
                 style={{ width: '100%' }}
             >
           <View style={{ flex: 1, gap: 0, marginHorizontal: 0,  padding:5, justifyContent: 'center', backgroundColor: 'lightblue', marginTop: 10}}>
             { units && units.length > 0 ? (
                 units.map((category: CategoryProps, index: number) => (
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
  container: { flex: 1, backgroundColor: 'blue', padding: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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


