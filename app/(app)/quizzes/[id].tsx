

//import { useNavigationContext } from '@/components/context/NavigationContext';
import api from '@/api/axios';
import MultipleInputs from '@/components/MultipleInputs';
import ClozeExplanation from '@/components/question_attempt_results/ClozeExplanation';
import ClickAndCloze from '@/components/reanimated/clickandcloze/ClickAndCloze';
import DuoDragDrop from '@/components/reanimated/duolingo/DuoDragDrop';
import { ChildQuestionRef, ProcessQuestionAttemptResultsProps, QuestionAttemptAssesmentResultsProps, QuestionProps, QuizAttemptProps } from '@/components/types';
import VoiceRecorder from '@/components/VoiceRecorder';
import { HeaderBackButton } from '@react-navigation/elements';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Button, Keyboard, KeyboardEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';



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

  //const nextQuestionId = useRef<number | null>(null);
  const [nextQuestionId, setNextQuestionId] = useState<number | null>(null); // State to store the next question id returned from the server

  const [quizAttempt, setQuizAttempt] = useState<QuizAttemptProps>(null as any);

  const [endOfQuiz, setEndOfQuiz] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
     api.post(`/api/quiz_attempts/get_or_create/${id}/`, { user_name: "test_user" })  // use a fixed user id for now
      .then((response) => {
         // console.log("Fetched quiz attempt data:", response.data);
         setQuestion(response.data.question);
         //setAttemptKey(k => k + 1);
         setQuestionAttemptId(response.data.question_attempt_id);
         setQuizAttempt(response.data.quiz_attempt);
         setLoading(false);
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
        setLoading(false);
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
        console.error("Error fetching quiz attempt data - inner:", error);
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
// return <ClickAndCloze ref={childQuestionRef} content={content} choices={button_cloze_options || ''} enableCheckButton={setCheckButton} />;
  const displayQuestion = (format: string, content: string, button_cloze_options: string | undefined) => {
      console.log("displayQuestion called with format: ", format, " content: ", content, " button_cloze_options: ", button_cloze_options);
       switch (format) {
        case '1':
          return <MultipleInputs ref={childQuestionRef} content={content} enableCheckButton={setCheckButton} />;
        case '2':
          return questionAttemptId !== null ? (
             <ClickAndCloze ref={childQuestionRef} content={question?.content || ''} distractors={question?.button_cloze_options?.split('/')} extraData={questionAttemptId} enableCheckButton={setCheckButton} />
          ) : null;
        case '6':
          return (
            <DuoDragDrop ref={childQuestionRef} words={content.split('/')} extraData={questionAttemptId} enableCheckButton={setCheckButton} />
           )
        default:
          //console.warn("Unknown question format:", format);
          return null;
     }
   };
 
   /*
  Important Note: Apr 6, 2026. (kpham) questionAttemptId is passed in DuoDragDrop as extraData so that 
  the useEffect in DuoDragDrop that listens for changes in extraData can trigger a re-render when user 
  immediately repeats a question. Without this extraData (questionAttemptId), the component doesn't get rerendered
  because the words content doesn't change. 
   */

  /*
        case '2':
          return questionAttemptId !== null ? (
            <ClickAndClozeNew ref={childQuestionRef} words={["one","two", ]} extraData={questionAttemptId} enableCheckButton={setCheckButton} />
          ) : null;
  */

  /*
 case '2':
          return questionAttemptId !== null ? (
            <ClickAndCloze ref={childQuestionRef} content={content} choices={button_cloze_options || ''} questionAttemptId={questionAttemptId} enableCheckButton={setCheckButton} />
          ) : null;

              return questionAttemptId !== null ? (
            <ClickAndClozeNew ref={childQuestionRef} words={["one", "two", "three", "four"]} extraData={questionAttemptId} enableCheckButton={setCheckButton} />
          ) : null;
  */


   useEffect(() => {
    // Listen for keyboard events
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event: KeyboardEvent) => {
        //console.log("Keyboard shown with height: ", event.endCoordinates.height);
        setKeyboardHeight(event.endCoordinates.height); // Get the keyboard height
      }
    );
    // Cleanup listeners on unmount
    return () => {
      keyboardDidShowListener.remove();
      //keyboardDidHideListener.remove();
    };
  }, []);

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
    console.log("handleCheck called.");

    Keyboard.dismiss();
    setKeyboardHeight(0); // Reset keyboard height
   
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
        opacityResults.value = withTiming(1, { duration: 800 });
        if (next_question_id === undefined) {
          console.log("No next question id returned from server. This was the last question in the quiz.");
          setShowContinueButton(false);
          setEndOfQuiz(true);
        }
        else {
        //nextQuestionId.current = next_question_id ?? null; // server also returns next question id if there is a next question, otherwise returns null. We store this in a ref since it doesn't need to trigger a re-render
        setNextQuestionId(next_question_id || null); // server also returns next question id if there is a next question, otherwise returns null. We store this in state so that when the user clicks "Continue", we have the next question id available to send to the server when we call createNextQuestionAttempt
        setShowContinueButton(true);
        }

        // update quizAttemptData.quiz_attempt
      }
      )
      .catch((err) => {
        console.error("Error processing question attempt:", err);
      });
   
    
}

const createNextQuestionAttempt = async (quizAttemptId: number, questionId: number | null) => {
  console.log("createNextQuestionAttempt called with quizAttemptId:", quizAttemptId, " questionId:", questionId);
  const url = `/api/quiz_attempts/${quizAttemptId}/create_next_question_attempt/`;
   console.log("createNextQuestionAttempt POSTing to url =", url);

  try {
    const response = await api.post<{ question_attempt_id: number; question: QuestionProps }>(url, {
      question_id: questionId,
    });
    //console.log("createNextQuestionAttempt , Received response from create_next_question_attempt:", response.data);

    const { question_attempt_id, question } = response.data;
    console.log("createNextQuestionAttempt, question_attempt_id from server:", question_attempt_id);
    console.log("createNextQuestionAttempt, question data from server:", question);

    setQuestion(question);
    //setAttemptKey(k => k + 1);
    setQuestionAttemptId(question_attempt_id);
    // change opacity of question to original value (in case it was faded out when user clicked "Continue")
    opacityImage.value = withTiming(1, { duration: 400 });
     opacityResults.value = withTiming(0, { duration: 400 });
     setShowContinueButton(false);
    //setTimerDuration(question.timeout);
    //counterRef.current?.start(); // Start the countdown timer for the next question
    //nextQuestionId.current = null; // Reset nextQuestionId
    setNextQuestionId(null); // Reset nextQuestionId in state to trigger a re-render and hide the "Continue" button until the user answers the next question and we get a new nextQuestionId from the server
    
  } catch (error) {
    console.error("Error creating next question attempt:", error);
  }
};

  const renderButtonRow = (format: string) => {
    return (
      <>
        {showContinueButton ? (
          <View style={{ backgroundColor: 'lightgreen', }}>
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
    //Continue button pressed. Starting opacity animation to fade out results and question...");
    opacityResults.value = withTiming(0, { duration: 400 });
    //opacityImage.value = withTiming(0, { duration: 100 });
    opacityImage.value = withTiming(0, { duration: 400 }, async (finished) => {
      if (finished) {
        console.log("XXXXXX Opacity animation to 0 has finished.");
        console.log("XXXXXX Now setting questionFinished to true.");
        // load the next 
        // log quizAttemp and nextQuestionId 
        console.log("Current quizAttempt data in state:", quizAttempt);
        //console.log("Current nextQuestionId in ref:", nextQuestionId.current);
        
        
    // We are on the UI Thread here.
        // We MUST use scheduleOnRN to "call back" to the JS thread.
        scheduleOnRN(createNextQuestionAttempt, quizAttempt.id, nextQuestionId) // we pass the quiz attempt id and the next question id to createNextQuestionAttempt, which will make the API call to create the next question attempt and update state with the new question data when it receives the response from the server. We have to use scheduleOnRN to call this function from the UI thread since we are currently in a worklet (the withTiming callback), and we need to call back to the JS thread to update state and trigger a re-render with the new question data.;
        //runOnJS(createNextQuestionAttempt(quizAttempt.id, nextQuestionId.current) )
        //runOnJS(proceedToNextQuestion)(true);
      }
    });
    
  };

  const animatedStylesResults = useAnimatedStyle(() => ({
    //transform: [{ translateX: withSpring(translateX.value * 2) }],
    opacity: opacityResults.value,
  }));

  const animatedStylesImage = useAnimatedStyle(() => ({
    opacity: opacityImage.value,
  }));

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (endOfQuiz) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', padding: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 }}>Quiz Complete</Text>
        <Text style={{ fontSize: 16, color: '#6C6C70', marginBottom: 32 }}>
          Score: {quizAttempt?.score ?? 0}
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: '#4A90E2', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 }}
          onPress={() => router.replace(`/units/${unitId}`)}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Back to Unit</Text>
        </TouchableOpacity>
      </View>
    );
  }
//Array.isArray(categoryName) ? categoryName[0] : categoryName,

  const onVoiceRecordingResults = (transcript: string) => {
    console.log("Received voice recording results in parent component (QuizScreen): ", transcript);
    // Here you can decide what to do with the transcript. For example, you might want to set it as the user's answer and enable the Check button:
    //childQuestionRef.current?.setAnswer(transcript); // Assuming your child component has a method to set the answer programmatically
    //setCheckButton(true); // Enable the Check button since we now have an answer from the voice recording
  }

  return (
    <>
     <Stack.Screen 
        options={{
          headerTitle: quizName ?? "Quiz",
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#1C1C1E',
          headerTitleStyle: {
            color: '#1C1C1E',
            fontWeight: 'bold',
            fontSize: 16,
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
        styles.container,
        {
          // Manually apply insets to avoid the notch and home indicator
          paddingTop: insets.top,
          paddingBottom: insets.bottom
        }
      ]}>
        <Animated.View style={[{ justifyContent: 'space-around', height: '75%', backgroundColor: 'blue' }, animatedStylesImage]}>
         
           <View style={{ padding: 10 , marginBottom: 0, backgroundColor: 'lightblue', borderRadius: 10}}>
            <VoiceRecorder onResult={onVoiceRecordingResults} />
          <Text>{ question?.prompt}</Text>
          <Text>{ question?.explanation}</Text>
          </View>
           <View style={styles.questionContainer}>
                      {memoizedDisplayQuestion}
          </View>
        </Animated.View>
    
        <Animated.View style={[styles.resultsContainer, animatedStylesResults]}>
          <View style={{ flex: 1, flexDirection: "row", padding: 10, marginBottom: 0, backgroundColor: 'lightblue', borderRadius: 10 }}>
            {questionAttemptAssessmentResults?.error_flag
              &&
              <ClozeExplanation content={question?.content || ''} processQuestionResults={questionAttemptAssessmentResults} />
              
        }
          </View>
        
     
        
        </Animated.View>

        <View style= {[styles.buttonContainer, { marginBottom: keyboardHeight > 0 ? keyboardHeight : 25 }]}>
         {renderButtonRow(question?.format.toString() || '')} 
        </View>
      </View>
        
    </>
  );
}

const styles = StyleSheet.create({
 
  container: {
    flex: 1,
    backgroundColor: 'green',
  },
  questionContainer: {
    flex: 1,
    width: '100%',
 },
  resultsContainer: { 
    position: 'absolute',  // meaning it is positioned relative to the viewport (screen)
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'green', 
    height: '30%' ,
    zIndex: 5,
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
    zIndex: 7,  // Ensure the button container is above the results container
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



