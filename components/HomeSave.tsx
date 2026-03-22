

import React from "react";
import { StyleSheet, Text, View } from "react-native";
//import fetchCategories from "../api/fetchCategories";

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoginScreen from "./LoginScreen";

 function HomeSave() {
    //const theme = useTheme();
  const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
  console.log("API URL:", BASE_URL);
   
  const insets = useSafeAreaInsets();

  /*
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!BASE_URL) {
        throw new Error("BASE_URL is not defined");
      }
      const data = fetchLevels(BASE_URL);
      console.log("Levels Data: ", data);
      return data;
    },
  });

*/

  const handleClick = (categoryId: string, categoryName: string) => {
    //console.log(`Category clicked: ${categoryId}, Name: ${categoryName}`);
    console.log(`Category clicked: ${categoryId}, Name: ${categoryName}`);
    
  };

/*
   headerStyle: {
            backgroundColor: 'orange', // Set the background color of the title area
          },
          headerTitleStyle: {
            color: 'white', // Optional: Set the text color of the title
          },
*/

/*
  return (
    <>
       <Stack.Screen
        
        options={{
          title: 'Tieng Anh Phu Yen', // Set a static title for the home screen
          //headerTitle: 'Tieng Anh Phu Yen', // Dynamically set the title
          //headerShown: false,
          headerLeft: undefined, // Hide the back button
   
        }}
      />
  
    <ScrollView contentContainerStyle ={{padding: 0,}}>
      <View style={sharedStyles.buttonWraper}>
         <Text>Select a category</Text>
         </View>
    </ScrollView>
  
    </>
  )
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
     <LoginScreen />
    <View style={styles.content}>
      <Text style={styles.text}>Content is perfectly positioned.</Text>
    
    </View>
  </View>
  </>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    //backgroundColor: "green",
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});

/*
  <SafeAreaView style={sharedStyles.safe_area_container}>
    <ScrollView contentContainerStyle ={{padding: 0,}}>
      <View style={{ flex: 1, gap: 10, justifyContent: 'center', marginHorizontal: 25, backgroundColor: 'red', marginTop: 10}}>
         {data && 
          data.map((category: CategoryProps, index: number) => (
          <View key={index} style={[sharedStyles.button, ]}>
          <Button
            key={index}
              title={category.name}
              onPress={() => handleClick(category.id.toString(), category.name)}
          />
          </View>
       
         ))}
         </View>
    </ScrollView>
    </SafeAreaView>
*/


//   <DroppedItemsMapExample  onBack={() => console.log("HERE")} />
/*
export const styles =  StyleSheet.create({
  safe_area_container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'lightgray',
},
    container: {
      //marginHorizontal: 70,
        flex: 1,
        
        width: '90%',
        justifyContent: 'center',
        alignSelf: 'center', // Center the container horizontally
        backgroundColor: 'lightgray',
    },
    button: {
      backgroundColor: 'lightgreen',
      padding: 10,
      borderRadius: 25,
      marginVertical: 5,
      //width: '100%', // Make the button full width
      alignItems: 'center', // Center the text inside the button
      borderWidth: 1,
      borderColor: 'gray', // Add a border to the button
      
    },

});
*/

export default HomeSave;

