

//import { useNavigationContext } from '@/components/context/NavigationContext';
import api from '@/api/axios';
import { CategoryProps, QuizProps } from '@/components/types';
import { HeaderBackButton } from '@react-navigation/elements';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, YStack } from 'tamagui';


export default function UnitScreen() {
  const { id} = useLocalSearchParams(); // Extract the dynamic route parameter 'id'
  const [categoryId, setCategoryId] = React.useState<string | undefined>(undefined); // used to nagivate back to the level screen
  const [unitName, setUnitName] = React.useState<string | undefined>(undefined);
  const [quizzes, setQuizzes] = React.useState<any[]>([]); // State to hold categories data
 
  const insets = useSafeAreaInsets();
 
   
  useEffect(() => {
    //console.log('UnitScreen useEffect triggered. Dynamic route id (Level):', id);
    api.get(`/english/units/${id}/`) // Fetch the specific category using the dynamic id, which should include units as part of the response
      .then((res) => res.data)
      .then((data) => {
        //setSubCategories(data.sub_categories as SubCategoryProps[]);
        console.log("Unit data retrieved: ", data);
        setUnitName(data.name); // Set the level name in state
        setCategoryId(data.category_id); // Set the level id in state for navigating back to the level screen
        setQuizzes(data.quizzes); // Set the categories in state
        // Log the categories to verify they are being set correctly
        data.quizzes.map((quiz: CategoryProps) => {
          console.log(`Quiz: ${quiz.name}, ID: ${quiz.id}`);
        });
      })
      .catch((err) => alert(err));
  }, [id]);
     
    
  const handleClick = (quizId: string) => {
    console.log(`Quiz clicked: ${quizId}`);
    //router.replace(`/quizzes/${quizId}`);
    router.replace({
      pathname: `/quizzes/[id]`,
      params: { id: quizId, unitId: id }
    })

    /*
router.push({
          pathname: '/quiz',
          params: { quizName: 'Math Challenge', questions: 10 }
        });
    */

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
          headerTitle: unitName || '', // use an empty string as fallback to avoid "flickering" when categoryName is initially undefined
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
              router.replace(`/categories/${categoryId}`);
 
            }} />
          ),
          headerShown: true, // Ensure the header is shown for this screen
        }}
      />
        <YStack flex={1} pb={insets.bottom}>
           <ScrollView>
             <YStack flex={1} p="$3" gap="$2">
               {quizzes && quizzes.length > 0 ? (
                 quizzes.map((quiz: QuizProps, index: number) => (
                   <Button
                     key={index}
                     onPress={() => handleClick(quiz.id.toString())}
                   >
                     {quiz.name}
                   </Button>
                 ))
               ) : (
                 <Text text="center" mt="$10" color="$gray9">
                   No levels available.
                 </Text>
               )}
             </YStack>
           </ScrollView>
         </YStack>
    </>
  );
}




