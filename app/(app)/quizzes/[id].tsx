

//import { useNavigationContext } from '@/components/context/NavigationContext';
import api from '@/api/axios';
import MultipleInputs from '@/components/MultipleInputs';
import { ChildQuestionRef, ProcessQuestionAttemptResultsProps, QuestionAttemptAssesmentResultsProps, QuestionProps } from '@/components/types';
import { HeaderBackButton } from '@react-navigation/elements';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function QuizScreen() {
  //const { quizName, questions } = useLocalSearchParams();
  const { id, unitId } = useLocalSearchParams(); // Extract the dynamic route parameter 'id'
  //const [unitId, setUnitId] = React.useState<string | undefined>(undefined); // used to nagivate back to the unit screen
  const [quizName, setQuizName] = React.useState<string | undefined>(undefined); // for heading display

  const insets = useSafeAreaInsets();

  const childQuestionRef = useRef<ChildQuestionRef>(null);

  const [question, setQuestion] = useState<QuestionProps | undefined>(undefined) // State to hold the current question data
 

  const [showContinueButton, setShowContinueButton] = useState<boolean>(false);

  const [checkButtonDisabled, setCheckButtonDisabled] = useState<boolean>(true); // State to track if the button is disabled

  const [questionAttemptId, setQuestionAttemptId] = useState<number | null>(null);

  const [questionAttemptAssessmentResults, setQuestionAttemptAssessmentResults] = 
  useState<QuestionAttemptAssesmentResultsProps | null>(null);

  const opacityImage = useSharedValue<number>(1);
  const opacityResults = useSharedValue<number>(0);

  const [keyboardHeight, setKeyboardHeight] = useState(0); // State to store keyboard height

  useEffect(() => {
     api.post(`/api/quiz_attempts/get_or_create/${id}/`, { user_name: "test_user" })  // use a fixed user id for now
      .then((response) => {
         console.log("Fetched quiz attempt data:", response.data);
         setQuestion(response.data.question);
        setQuestionAttemptId(response.data.question_attempt_id);
         /*
etched quiz attempt data: {"created": false, 
"question": {"answer_key": "choice1/choice2", "audio_str": "", "button_cloze_options": null, "content": "choice 1 text/choice 2 text/choice 3 text/choice 4 text", "explanation": "", "format": 5, "hint": "", "id": 6, "instructions": null, "prompt": "", "question_number": 1, 
"quiz_id": 1, "score": 0, "timeout": 30000, "video_segment_id": null},
"question_attempt_id": 114, 
"quiz_attempt": {"completion_status": "uncompleted", "created_at": "2026-03-23T15:49:49.941287Z", "errorneous_questions": "", "id": 48, "quiz_id": 1, "review_state": false, "score": 0, "updated_at": "2026-03-23T15:49:49.941664Z", "user_name": "test_user"}}
         */

        //setQuizAttemptData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching quiz attempt data:", error);
      });
   // const url = `${baseURL}/api/quiz_attempts/get_or_create/${quiz_id}/`;
    //console.log("Fetching quiz attempt data from url =", url);
    /*
    api.post(url, { user_name: name })  // use a fixed user id for now
      .then((response) => {
        //console.log("Fetched quiz attempt data:", response.data);
        setQuizAttemptData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching quiz attempt data:", error);
      });
    */
  },[id])


  /*
  useEffect(() => {
    //console.log('QuizScreen useEffect triggered. Dynamic route id (Level):', id);
    api.get(`/english/quizzes/${id}/`) // Fetch the specific category using the dynamic id, which should include units as part of the response
      .then((res) => res.data)
      .then((data) => {
        //setSubCategories(data.sub_categories as SubCategoryProps[]);
        console.log("Quiz data retrieved: ", data);
        setQuizName(data.name); // Set the quiz name for display in the header
        setUnitId(data.unit_id); // Set the unit id in state for navigating back to the unit screen
        setQuestions(data.questions); // Set the questions in state
       
        data.questions.map((question: CategoryProps) => {
          console.log(`Question ID: ${question.id}`);
        });
      })
      .catch((err) => alert(err));
  }, [id]);
    */

  const setCheckButton = (value: boolean) => {
    console.log("setCheckButton called with enabled:", value);
    setCheckButtonDisabled(!value); // Enable the Check button
  };

  const displayQuestion = (format: string, content: string, button_cloze_options: string | undefined) => {
    // console.log("displayQuestion called with format: ", format, " content: ", content, " button_cloze_options: ", button_cloze_options);
       switch (format) {
        case '1':
          return <MultipleInputs ref={childQuestionRef} content={content} enableCheckButton={setCheckButton} />;
       
        default:
          //console.warn("Unknown question format:", format);
          return null;
     }
   };
 
   const memoizedDisplayQuestion = useMemo(() => {
    if (!question) return null; // Return null if theQuestion is not available
    return displayQuestion(
      question.format.toString(),
      question.content,
      question.button_cloze_options
    );
  }, [question]); // Recompute only when theQuestion changes
    
  const handleCheck = () => {
    //setShowQuestion(false); //
    opacityResults.value = withTiming(1, { duration: 800 });
    console.log("Check button pressed. User answer from child component:", childQuestionRef.current?.getAnswer());
    //console.log("handleSubmit called for user ansswer=", childRef.current?.getAnswer());
    const url = `/api/question_attempts/${questionAttemptId}/process/`;
    const uanswer = childQuestionRef.current?.getAnswer();  
    const aKey = question?.answer_key;
    
    api.post<ProcessQuestionAttemptResultsProps>(url, { format: question?.format , user_answer: uanswer, answer_key: aKey})
      .then((res) => {     
        // server returns the next question id (if any), together with assessment results 
        const { assessment_results, next_question_id } = res.data;
        console.log("Assessment results from server:", assessment_results);
        console.log("Next question id from server:", next_question_id);
        setQuestionAttemptAssessmentResults(assessment_results);
        // update quizAttemptData.quiz_attempt
      }
      )
      .catch((err) => {
        console.error("Error processing question attempt:", err);
      });
   
    
}

  const handleCheckOld = async () => {
    console.log("Check button pressed");
    /*
    Keyboard.dismiss();
    setKeyboardHeight(0); // Reset keyboard height
     opacityResults.value = withTiming(1, { duration: 800 });
     setShowContinueButton(true);

     //const user_answer = childQuestionRef.current?.getAnswer(); // Get the answer from the child component
     //const results = processQuestion(theQuestion?.format.toString(), theQuestion?.answer_key, user_answer );
     const results  = childQuestionRef.current?.checkAnswer(theQuestion?.answer_key || '');
     const url = `${domain}/api/question_attempts/${id}/update`;
     const response = await fetch(url, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify(results),
     });
 
     if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
     }
     else {
      //console.log("EEEEE results=", results);
      if (results?.error_flag) {
        error_player.play(); // Play the error sound
      }
      else {
        success_player.play(); // Play the success sound
      }
       setQuestionAttemptResults(results); // Store results in state
     }
      if (theQuestion?.format === 4) {
        console.log("RadioGroup format 4 checkAnswer called");
        if (childQuestionRef.current) {
          if (childQuestionRef.current?.checkAnswer) {
            childQuestionRef.current.checkAnswer(theQuestion.answer_key || '');
          }
        }
      }
      else if (theQuestion?.format === 5) {
      
        if (childQuestionRef.current) {
          if (childQuestionRef.current?.checkAnswer) {
            childQuestionRef.current.checkAnswer(theQuestion.answer_key || '');
          }
        }
      }
      */
  }

  const renderButtonRow = (format: string) => {
    return (
      <>
        {showContinueButton ? (
          <View style={{ backgroundColor: 'blue', }}>
          <Button title="Continue" color='white'  onPress={handleContinue} />
          </View>
        ) : (
          <View style={{ opacity: checkButtonDisabled ? 0.5 : 1 , backgroundColor: checkButtonDisabled ? 'gray' : 'brown', }}>
          <Button disabled={checkButtonDisabled} title="Check" color='black' onPress={handleCheck} />
          </View>
        )}
      </>
    );
};


  const handleContinue = async () => {
    //translateX.value += 50;
    /*
    opacityResults.value = withTiming(0, { duration: 400 });
    //opacityImage.value = withTiming(0, { duration: 100 });
    opacityImage.value = withTiming(0, { duration: 400 }, async (finished) => {
      if (finished) {
        console.log("XXXXXX Opacity animation to 0 has finished.");
        console.log("XXXXXX Now setting questionFinished to true.");
        runOnJS(proceedToNextQuestion)(true);
      }
    });
    */
  };

  const animatedStylesResults = useAnimatedStyle(() => ({
    //transform: [{ translateX: withSpring(translateX.value * 2) }],
    opacity: opacityResults.value,
  }));

  const animatedStylesImage = useAnimatedStyle(() => ({
    opacity: opacityImage.value,
  }));


//Array.isArray(categoryName) ? categoryName[0] : categoryName,
  return (
    <>
     <Stack.Screen 
        options={{
          headerTitle: "Take Quiz" , // use an empty string as fallback to avoid "flickering" when categoryName is initially undefined
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
              console.log('Navigating back to Unit screen with unit id', unitId);
              //router.replace('/(app)/dashboard');
              router.replace(`/units/${unitId}`);
 
            }} />
          ),
          headerShown: true, // Ensure the header is shown for this screen
        }}
      />
      <View style={[
        {
          // Manually apply insets to avoid the notch and home indicator
          paddingTop: insets.top,
          paddingBottom: insets.bottom
        }
      ]}>
         <View style={[
              {
                // Manually apply insets to avoid the notch and home indicator
                paddingTop: insets.top,
                paddingBottom: insets.bottom
              }
            ]}>
        <Animated.View style={[{ justifyContent: 'space-around', alignItems: 'center', height: '75%', backgroundColor: 'orange' }, animatedStylesImage]}>
         
           <View style={{ padding: 10 , marginBottom: 0, backgroundColor: 'lightblue', borderRadius: 10}}>
          <Text>{ question?.prompt}</Text>
          </View>
           <View style={styles.questionContainer}>
                      {memoizedDisplayQuestion}
          </View>
        </Animated.View>
        <Animated.View style={[styles.resultsContainer, animatedStylesResults]}>
          <Text>
            QUESTION RESULTS
            </Text>
        </Animated.View>
        <View style= {[styles.buttonContainer, { marginBottom: keyboardHeight > 0 ? keyboardHeight : 25 }]}>
         {renderButtonRow(question?.format.toString() || '')} 
        </View>
      </View>
        

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safe_area_container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'blue',
},
  container: {
    //flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionContainer: {  
    flex: 1, // the parent allows the children to expand fully.
    width: '90%', // allows children take up full screen width
    
    //position: 'relative',
    //top: 0,
    //left: 0,
  
 },
  resultsContainer: { 
    position: 'absolute',  // meaning it is positioned relative to the viewport (screen)
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'gray', 
    height: '30%' ,
    zIndex: -1,
    //opacity: 0,
  },
  buttonContainer: {
    position: 'absolute',  // meaning it is positioned relative to the viewport (screen)
    left: 0,
    right: 0,
    bottom: 20,
    marginHorizontal: 20,
    borderRadius: 15,
    //justifyContent: 'center', 
    //alignItems: 'center', 
    //backgroundColor: 'green', 
    //height: '10%' ,
    //opacity: 1,
    zIndex: 0,  // Ensure the button container is above the results container
  },
});



/*
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6', padding: 20 },
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
  empty: { textAlign: 'center', marginTop: 50, color: '#999' },
  questionContainer: {  
    flex: 1, // the parent allows the children to expand fully.
    width: '90%', // allows children take up full screen width
 },
 buttonContainer: {
  position: 'absolute',  // meaning it is positioned relative to the viewport (screen)
  left: 0,
  right: 0,
  bottom: 20,
  marginHorizontal: 20,
  borderRadius: 15,
  //justifyContent: 'center', 
  //alignItems: 'center', 
  //backgroundColor: 'green', 
  //height: '10%' ,
  //opacity: 1,
  zIndex: 0,  // Ensure the button container is above the results container
},
});
*/
/*
   <View style={[
        {
          // Manually apply insets to avoid the notch and home indicator
          paddingTop: insets.top,
          paddingBottom: insets.bottom
        }
      ]}>
        <ScrollView contentContainerStyle={{ padding: 0, }}
          style={{ width: '100%' }}
        >
          <View style={{ flex: 1, gap: 0, marginHorizontal: 0, padding: 5, justifyContent: 'center', backgroundColor: 'lightgreen', marginTop: 30 }}>
            {question && (
              <View style={{ backgroundColor: 'white', padding: 10, borderRadius: 8, marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>{`Question ${question.question_number}`}</Text>
                {memoizedDisplayQuestion}
              </View>
            )
            }



          </View>
    
        </ScrollView>
        
            {renderButtonRow(question?.format.toString() || '')}
        

      </View>
*/



