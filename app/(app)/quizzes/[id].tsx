//import { useNavigationContext } from '@/components/context/NavigationContext';
import api from '@/api/axios';
import CheckboxGroup from '@/components/CheckBoxGroup';
import ButtonSelectExplanation from '@/components/explanations/ButtonSelect';
import CheckboxExplanation from '@/components/explanations/Checkbox';
import ClozeExplanation from '@/components/explanations/Cloze';
import RadioExplanation from '@/components/explanations/RadioExplanation';
import SentenceScrambleExplanation from '@/components/explanations/SentenceScramble';
import WordScrambleExplanation from '@/components/explanations/WordScramble';
import WordsSelectExplanation from '@/components/explanations/WordsSelect';
import MultipleInputs from '@/components/MultipleInputs';
import MyRadioGroup from '@/components/MyRadioGroup';
import ClickAndCloze from '@/components/reanimated/clickandcloze/ClickAndCloze';
import DuoDragDrop from '@/components/reanimated/duolingo/DuoDragDrop';
import { ChildQuestionRef, ProcessQuestionAttemptResultsProps, QuestionAttemptAssesmentResultsProps, QuestionAttemptProps, QuestionProps, QuizAttemptProps } from '@/components/types';
import WordsSelect from '@/components/WordsSelect';
import { HeaderBackButton } from '@react-navigation/elements';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Button, Keyboard, KeyboardEvent, Modal, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/context/auth';


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

  const { width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue<number>(0);
  const opacityResults = useSharedValue<number>(0);

  const [keyboardHeight, setKeyboardHeight] = useState(0); // State to store keyboard height

  const [quizAttempt, setQuizAttempt] = useState<QuizAttemptProps>(null as any);

  const [endOfQuiz, setEndOfQuiz] = useState<boolean>(false);
  const [showEndOfQuizModal, setShowEndOfQuizModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [remainingQuestions, setRemainingQuestions] = useState<QuestionProps[]>([]); // State to hold all questions in the quiz attempt, which is used to determine when we are at the last question in the quiz
  const [hasMoreQuestions, setHasMoreQuestions] = useState<boolean>(true); // State to track if there are more questions to fetch from the server. This is used in conjunction with the isFetching ref to prevent duplicate fetches when we are at the end of the currently loaded questions and waiting for the next batch of questions to load from the server
  const isFetching = useRef(false);

  const [wrongQuestionAttempts, setWrongQuestionAttempts] = useState<number[]>([]); // State to hold incorrectly answered question attempts for review after finishing the quiz
  const [reviewState, setReviewState] = useState<boolean>(false); // State to manage the flow of reviewing incorrectly answered questions after finishing the quiz. We start in the "initial" state where we show the end of quiz screen with the final score and a button to review incorrectly answered questions. When the user clicks the button to review incorrectly answered questions, we transition to the "reviewing_incorrect" state where we load and show incorrectly answered questions one by one with a button to go to the next question until there are no more incorrectly answered questions to review, at which point we transition to the "completed" state where we show a message that the review is complete and a button to navigate back to the unit screen.
  
    

  //use AuthContext to get user info
  const user_name = useAuth()?.userName || 'default_user';
  console.log("QuizScreen rendered with user_name:", user_name);


  useEffect(() => {
     api.post(`/api/quiz_attempts/get_or_create_react_native/${id}/`, { user_name: user_name })  // use a fixed user id for now
      .then((response) => {
         //console.log("Fetched quiz attempt data:", response.data);
         const all_questions_loaded = response.data.questions;
         console.log(" All questions loaded from server for this quiz attempt:");
         all_questions_loaded.forEach((q: QuestionProps) => console.log("Question id:", q.id, " question number:", q.question_number, " content:", q.content));
         const first_question = all_questions_loaded.length > 0 ? all_questions_loaded[0] : null;
         setRemainingQuestions(all_questions_loaded.slice(1));
         setQuestion(first_question);
         setQuestionAttemptId(response.data.question_attempt_id);
         setQuizAttempt(response.data.quiz_attempt);
         setHasMoreQuestions(response.data.has_more ?? false);
         setLoading(false);
         
      })
      .catch((error) => {
        console.error("Error fetching quiz attempt data:", error);
        setLoading(false);
      });
  },[id])

  const setCheckButton = (value: boolean) => {
    //console.log("setCheckButton called with enabled:", value);
    setCheckButtonDisabled(!value); // Enable the Check button
  };
// return <ClickAndCloze ref={childQuestionRef} content={content} choices={button_cloze_options || ''} enableCheckButton={setCheckButton} />;
  const displayQuestion = (format: string, content: string, button_cloze_options: string | undefined) => {
      //console.log("displayQuestion called with format: ", format, " content: ", content, " button_cloze_options: ", button_cloze_options);
       switch (format) {
        case '1':
          return <MultipleInputs key={questionAttemptId} ref={childQuestionRef} content={content} enableCheckButton={setCheckButton} />;
        case '2':
          return questionAttemptId !== null ? (
             <ClickAndCloze  ref={childQuestionRef} content={question?.content || ''} distractors={question?.button_cloze_options?.split('/')} extraData={questionAttemptId} enableCheckButton={setCheckButton} />
          ) : null;
        case '4':
            return (
              <MyRadioGroup  key={questionAttemptId} ref={childQuestionRef} content={question?.content || ''} enableCheckButton={setCheckButton} />
             )
        case '5':
            return (
              <CheckboxGroup key={questionAttemptId} ref={childQuestionRef} content={question?.content || ''} enableCheckButton={setCheckButton} />
             )
        case '6':
          return (
            <DuoDragDrop ref={childQuestionRef} words={content.split('/')} extraData={questionAttemptId} enableCheckButton={setCheckButton} />
           )
         case '8':
            return (
          <WordsSelect key={questionAttemptId} ref={childQuestionRef} content={question?.content || ''} enableCheckButton={setCheckButton} />
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

          useEffect(() => {
            console.log("useEffect ******* to check remaining questions. Remaining questions length:", remainingQuestions.length, " isFetching:", isFetching.current);
            if (remainingQuestions.length === 1 && !isFetching.current) {
              isFetching.current = true;
              /*
The isFetching ref prevents duplicate fetches if the component re-renders while the request is in flight.
// path("quizzes/<int:pk>/questions/<int:starting_question_number>"
              */
              console.log("\nRemaining questions size is 1, fetching more questions from server. Remaining questions length:", remainingQuestions.length);
              const last_question_remaining = remainingQuestions[remainingQuestions.length - 1];
              console.log("Last question remaining:", last_question_remaining);
            
              api.post(`/english/quizzes/${id}/questions/${last_question_remaining?.question_number+1}`,
                { quiz_attempt_id: quizAttempt?.id },
              )  // send the current question number
                .then((response) => {
                  console.log("More fetched questions from server:");
                  response.data.questions.forEach((q: QuestionProps) => console.log("Question id:", q.id, " question number:", q.question_number, " content:", q.content));
                  console.log("---- has_more flag from server:", response.data.has_more);
                  // add fetched questions to remainingQuestions
                  setRemainingQuestions(prev => [...prev, ...response.data.questions]);
                  setHasMoreQuestions(response.data.has_more);
                  isFetching.current = false;
                })
                .catch(() => { isFetching.current = false; });
                

            }
          }, [remainingQuestions.length]);
          

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
   
    api.post<ProcessQuestionAttemptResultsProps>(url, { format: question?.format, user_answer: uanswer, answer_key: aKey })
      .then((res) => {
        // server returns the next question id (if any), together with assessment results 
        const { assessment_results } = res.data;
        //console.log("Assessment results from server:", assessment_results);
        //console.log("Next question id from server:", next_question_id);
        setQuestionAttemptAssessmentResults(assessment_results);
        opacityResults.value = withTiming(1, { duration: 100 });
        // check if there are questions in remainingQuestions. 
        const next_question_available = remainingQuestions.length > 0;
        if (next_question_available) {
          setShowContinueButton(true);
        }
        else {
          console.log("No more questions available in remainingQuestions. This was the last question in the quiz.");
          setShowEndOfQuizModal(true);
          /*
          setShowContinueButton(false);
          // call api to set quiz attempt as completed since there are no more questions in the quiz, which will update the quiz attempt score and trigger any necessary post-quiz completion processes on the server such as awarding badges or updating user progress. We also set endOfQuiz to true to show the end of quiz screen with the final score and a button to navigate back to the unit screen.
          api.post(`/api/quiz_attempts/${quizAttempt.id}/mark_completed/`)
            .then((response) => {
              console.log("Quiz attempt marked as completed. Server response:", response.data);
              setQuizAttempt(prev => prev ? { ...prev, score: response.data.score } : prev);
            })
            .catch((err) => {
              console.error("Error marking quiz attempt as completed:", err);
            });

              // update quiz attempt score in state to show on end of quiz screen
            
          setEndOfQuiz(true);
          */

        }
        // If not, we are at the end of the quiz and there is no next question to load, so we should hide the Continue button and show some kind of end of quiz message instead
        /*
        if (next_question_id === undefined) {
          console.log("No next question id returned from server. This was the last question in the quiz.");
          setShowContinueButton(false);
          setEndOfQuiz(true);
        }
        else {
          setNextQuestionId(next_question_id || null); // server also returns next question id if there is a next question, otherwise returns null. We store this in state so that when the user clicks "Continue", we have the next question id available to send to the server when we call createNextQuestionAttempt
          setShowContinueButton(true);
        }
        */

        // update quizAttemptData.quiz_attempt
      }
      )
      .catch((err) => {
        console.error("Error processing question attempt:", err);
      });
}

const createNextQuestionAttempt = async (quizAttemptId: number) => {
  //console.log("createNextQuestionAttempt called with quizAttemptId:", quizAttemptId, " questionId:", questionId);
  const url = `/api/quiz_attempts/${quizAttemptId}/create_next_question_attempt_react_native/`;
   console.log("createNextQuestionAttempt POSTing to url =", url);

   //const next_question = remainingQuestions.find(q => q.id === questionId) || null;
   //if (!next_question) {
   // console.warn("Next question with id", questionId, " not found in remainingQuestions. Remaining questions:", remainingQuestions);
   // return;
  //}

  const next_question = remainingQuestions[0]; // first question in the 
  console.log("***** Next question to display (first question in remainingQuestions):", next_question.id);


   // remove the next question from remainingQuestions  
   console.log("^^^^^^^^^^^^^^ Removing question with id", next_question.id, " from remainingQuestions");
   setRemainingQuestions(prev => prev.filter(q => q.id !== next_question.id));

   setQuestion(next_question || undefined);

   //instantly moves the new question off-screen to the right (e.g., 390px right). No animation, just a snap.
   translateX.value = screenWidth;
   //immediately overrides that with an animation that slides it back to 0 (its normal position) over 300ms.
   //  Together, lines 283+286 create the "slide in from the right" effect for the new question.
   translateX.value = withTiming(0, { duration: 300 });
   //  fades the results panel (the explanation/correct-incorrect feedback) out over 400ms, 
   // so it disappears as the new question slides in.
    opacityResults.value = withTiming(0, { duration: 400 });
    setShowContinueButton(false);
//const url = `/api/quiz_attempts/${quizAttemptId}/create_next_question_attempt_react_native/`;
  try {
    const response = await api.post<{ question_attempt_id: number }>(url, {
      question_id: next_question.id, // we send the question id of the next question to createNextQuestionAttempt, which uses this to tell the server which question attempt to create next. We also use this question id to find the next question in the remainingQuestions array and set it as the current question immediately for a smooth user experience, while waiting for the server response. If test_next_question is undefined (which shouldn't happen because we should have already checked that there is a next question before showing the Continue button), we pass null to createNextQuestionAttempt, which should trigger an error response from the server that we can catch and log.
    });
    //console.log("createNextQuestionAttempt , Received response from create_next_question_attempt:", response.data);

    const { question_attempt_id } = response.data;
    console.log("createNextQuestionAttempt, question_attempt_id from server:", question_attempt_id);
    setQuestionAttemptId(question_attempt_id);
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
    // print out all questions in remainingQuestions for debugging
    console.log("handleContinue called. Remaining questions in state:") ;
    remainingQuestions.forEach(q => console.log("Question id:", q.id, "question number:", question?.question_number, " content:", q.content));
    setQuestionAttemptAssessmentResults(null);
    opacityResults.value = withTiming(0, { duration: 200 });
    translateX.value = withTiming(-screenWidth, { duration: 300 });
    // Start API call immediately in parallel with the slide-out animation
    // retrieve next question from remainingQuestions 
    // remainingQuestions array is the next question to display,
    // createNextQuestionAttempt(quizAttempt.id, nextQuestionId);
    createNextQuestionAttempt(quizAttempt.id); // we pass the question id of the next question to createNextQuestionAttempt, which uses this to tell the server which question attempt to create next. We also use this question id to find the next question in the remainingQuestions array and set it as the current question immediately for a smooth user experience, while waiting for the server response. If test_next_question is undefined (which shouldn't happen because we should have already checked that there is a next question before showing the Continue button), we pass null to createNextQuestionAttempt, which should trigger an error response from the server that we can catch and log.
    
  };

  const animatedStylesResults = useAnimatedStyle(() => ({
    //transform: [{ translateX: withSpring(translateX.value * 2) }],
    opacity: opacityResults.value,
  }));

  const animatedStylesSlide = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
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

  //  <ClozeExplanation content={question?.content || ''} processQuestionResults={questionAttemptAssessmentResults} />
  const displayFeedback = (question_format: string, assessment_results: QuestionAttemptAssesmentResultsProps | null) => {
    //console.log("displayErrorFeedback called with question_format:", question_format, " assessment_results:", assessment_results);  
    if ( !assessment_results ) {
      console.warn("displayErrorFeedback called but assessment_results is null");
      return null;
    }
    if (assessment_results.error_flag === false) {
      return (
        <Text style={{ fontSize: 18, color: 'green' }}>
          Correct!
        </Text>
      );
    }
    switch (question_format) {
      case '1':
      case '2':
          //console.log("Rendering ClozeExplanation for question format 1 or 2 with content:", question?.content, " and assessment_results:", assessment_results);
          return <ClozeExplanation content={question?.content || ''} processQuestionResults={assessment_results || undefined} />;
      case '3':
          return <ButtonSelectExplanation content={question?.content || ''} answer_key={question?.answer_key || ''} processQuestionResults={assessment_results || undefined} />;
      case '4':
          return <RadioExplanation content={question?.content || ''} answer_key={question?.answer_key || ''} processQuestionResults={assessment_results || undefined} />;
      case '5':
          return <CheckboxExplanation content={question?.content || ''} answer_key={question?.answer_key || ''} processQuestionResults={assessment_results || undefined} />;
      case '6':
          return <WordScrambleExplanation content={question?.content || ''}  processQuestionResults={assessment_results || undefined} />;
      case '8':
          return <WordsSelectExplanation content={question?.content || ''} answer_key={question?.answer_key || ''} processQuestionResults={assessment_results || undefined} />;
      case '12':
          return <SentenceScrambleExplanation content={question?.content || ''}  processQuestionResults={assessment_results || undefined} />;
      default:
        return null;
      }
    };

    /*
  const loadIncorrectQuestions = () => {
    api.get(`/api/quiz_attempts/${quizAttempt?.id}/incorrect_questions/`)
      .then((response) => {
        console.log("Incorrect questions for this quiz attempt:", response.data);
        // Here you can navigate to a new screen to display the incorrectly answered questions, or display them in a modal, etc.
      })
      .catch((error) => {
        console.error("Error fetching incorrectly answered questions:", error);
      });
  }
*/

  
const loadIncorrectQuestions = (starting_question_attempt_number: number) => {
    console.log("------>>>>><<<<<<<<<< loadIncorrectQuestions <<<<called for starting question att number", starting_question_attempt_number);
    isFetching.current = true;
    
    api.post(`/api/quiz_attempts/${quizAttempt?.id}/incorrect_questions/`, 
      {   
        starting_question_attempt_number: starting_question_attempt_number,
      })
      .then(async (response) => {
        console.log("Incorrect questions for this quiz attempt: response data:", response.data);
        const first_error_question = response.data.questions.length > 0 ? response.data.questions[0] : null;
        setQuestion(response.data.questions.length > 0 ? response.data.questions[0] : undefined);
        translateX.value = screenWidth;
        translateX.value = withTiming(0, { duration: 300 });
        // exclude the this first question from the list of remaining questions since we have already set it as the current question, and we want to avoid showing it again as we review through incorrectly answered questions
        setRemainingQuestions(response.data.questions.slice(1));
        //setWrongQuestionAttempts(response.data.incorrect_question_attempts);
        const wrong_question_attempt_numbers = response.data.incorrect_question_attempts.map(
          (attempt: QuestionAttemptProps) => attempt.question_attempt_number
        );
        setWrongQuestionAttempts(wrong_question_attempt_numbers);
        setReviewState(true); // transition to "reviewing_incorrect" 
        // has_more_incorrect flag indicates whether there are more incorrectly answered questions to load from the server for review.
        //  We use this flag in conjunction with the isFetching ref to prevent duplicate fetches when we are at the end of the currently loaded incorrectly answered questions and waiting for the next batch of incorrectly answered questions to load from the server as the user reviews through them one by one.
        setHasMoreQuestions(response.data.has_more_incorrect);
        // setQuestionAttemptId(response.data.question_attempt_id); // server creates the question_attempt for the first errorneous question.
        const url = `/api/quiz_attempts/${quizAttempt?.id}/create_next_question_attempt_react_native/`;
  try {
    const response = await api.post<{ question_attempt_id: number }>(url, {
      question_id: first_error_question.id, // we send the question id of the next question to createNextQuestionAttempt, which uses this to tell the server which question attempt to create next. We also use this question id to find the next question in the remainingQuestions array and set it as the current question immediately for a smooth user experience, while waiting for the server response. If test_next_question is undefined (which shouldn't happen because we should have already checked that there is a next question before showing the Continue button), we pass null to createNextQuestionAttempt, which should trigger an error response from the server that we can catch and log.
    });
    //console.log("createNextQuestionAttempt , Received response from create_next_question_attempt:", response.data);

    const { question_attempt_id } = response.data;
    console.log("createNextQuestionAttempt, question_attempt_id from server:", question_attempt_id);
    setQuestionAttemptId(question_attempt_id);
  } catch (error) {
    console.error("Error creating next question attempt:", error);
  }
    
        //setHasMoreQuestions(false); // we assume the number of incorrectly answered questions is small enough that we can load them all at once without needing to paginate. If this becomes an issue, we can implement pagination for incorrectly answered questions as well.
        isFetching.current = false;
      })
      .catch((error) => {
        console.error("Error fetching incorrectly answered questions:", error);
        isFetching.current = false;
      });
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
        <Animated.View style={[{ justifyContent: 'space-around', height: '75%', backgroundColor: 'white' }, animatedStylesSlide]}>

            <View style={{ padding: 10 , marginBottom: 0, backgroundColor: 'lightblue', borderRadius: 10}}>

           </View>
            <View style={styles.questionContainer}>
                       {memoizedDisplayQuestion}
           </View>
         </Animated.View>

        <Animated.View style={[styles.resultsContainer, animatedStylesResults]}>
          <View style={{ flex: 1,flexDirection: "row", padding: 10, marginBottom: 0, backgroundColor: 'orange', borderRadius: 10, width: '100%' }}>
           
              { displayFeedback(question?.format.toString() || '', questionAttemptAssessmentResults) }
  
          </View>
        </Animated.View>

        <Modal visible={showEndOfQuizModal} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: '80%', gap: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Quiz Complete!</Text>
              <Text style={{ fontSize: 16, textAlign: 'center', color: '#555' }}>
                Would you like to revisit the questions you got wrong?
              </Text>
              <Pressable
                onPress={() => {
                  setShowEndOfQuizModal(false);
                  // TODO: load incorrect questions into remainingQuestions
                  loadIncorrectQuestions(1);
                }}
                style={{ backgroundColor: '#007AFF', borderRadius: 10, padding: 14, alignItems: 'center' }}
              >
                <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 16 }}>Revisit Incorrect</Text>
               
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowEndOfQuizModal(false);
                  setEndOfQuiz(true);
                }}
                style={{ backgroundColor: '#E5E5EA', borderRadius: 10, padding: 14, alignItems: 'center' }}
              >
                <Text style={{ fontWeight: '600', fontSize: 16 }}>Finish Quiz</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <View style= {[styles.buttonContainer, { marginBottom: keyboardHeight > 0 ? keyboardHeight : 25 }]}>
         {renderButtonRow(question?.format.toString() || '')}
        </View>
      </View>

    </>
  );
}

/*
   <Animated.View style={[styles.resultsContainer, animatedStylesResults]}>
          <View style={{ flex: 1,flexDirection: "row", padding: 10, marginBottom: 0, backgroundColor: 'lightblue', borderRadius: 10 }}>
            {questionAttemptAssessmentResults?.error_flag
              ?
              <ClozeExplanation content={question?.content || ''} processQuestionResults={questionAttemptAssessmentResults} />
              :
              <Text style={{ fontSize: 18, color: 'black' }}>
                "Correct!" 
                </Text>
            }
          </View>
        </Animated.View>
*/

/*
       <Animated.View style={[styles.resultsContainer, animatedStylesResults]}>
          <View style={{ flex: 1,flexDirection: "row", padding: 10, marginBottom: 0, backgroundColor: 'red', borderRadius: 10 }}>
            {questionAttemptAssessmentResults?.error_flag
              ?
               displayErrorFeedback(question?.format.toString() || '', questionAttemptAssessmentResults)
              :
              <Text style={{ fontSize: 18, color: 'black' }}>
                "Correct!" 
                </Text>
            }
          </View>
        </Animated.View>
*/


const styles = StyleSheet.create({
 
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
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
    backgroundColor: 'white', 
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


