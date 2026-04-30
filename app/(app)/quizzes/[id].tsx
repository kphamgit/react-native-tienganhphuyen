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
import { ChildQuestionRef, ProcessQuestionAttemptResultsProps, QuestionAttemptAssesmentResultsProps, QuestionProps, QuizAttemptProps } from '@/components/types';
import WordsSelect from '@/components/WordsSelect';
import { HeaderBackButton } from '@react-navigation/elements';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Button, Keyboard, KeyboardEvent, Modal, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/context/auth';

 
interface IncorrectQuestionsResponse {
  incorrect_questions: IncorrectQuestionProps[];
  quiz_attempt_id: number;
}

interface IncorrectQuestionProps {
  question: QuestionProps;
  question_attempt_id: number;
  question_attempt_number: number;
}

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

  const [remainingQuestions, setRemainingQuestions] = useState<{question: QuestionProps, question_attempt_number?: number}[]>([]); // State to hold the remaining questions in the quiz attempt that have not been attempted yet. We initialize this as an empty array and populate it with the questions from the server response when we fetch or create the quiz attempt in the useEffect on component mount. When the user answers a question and clicks "Continue", we remove the next question to display from this remainingQuestions array and set it as the current question, so that we can have a smooth transition to the next question while waiting for the server response to create the next question attempt. We also use the length of this remainingQuestions array in another useEffect to determine when we are at the end of the currently loaded questions and need to fetch more questions from the server if there are more questions in the quiz (hasMoreQuestions is true).
 
  const isFetching = useRef(false);

  const [reviewState, setReviewState] = useState<boolean>(false); // State to manage the flow of reviewing incorrectly answered questions after finishing the quiz. We start in the "initial" state where we show the end of quiz screen with the final score and a button to review incorrectly answered questions. When the user clicks the button to review incorrectly answered questions, we transition to the "reviewing_incorrect" state where we load and show incorrectly answered questions one by one with a button to go to the next question until there are no more incorrectly answered questions to review, at which point we transition to the "completed" state where we show a message that the review is complete and a button to navigate back to the unit screen.
  
  const user_name = useAuth()?.userName || 'default_user';
  console.log("QuizScreen rendered with user_name:", user_name);
  
  useEffect(() => {
     api.post(`/api/quiz_attempts/get_or_create_react_native/${id}/`, { user_name: user_name, number_of_questions_to_preload: 3 })  // use a fixed user id for now
      .then((response) => {
         //console.log("Fetched quiz attempt data:", response.data);
         const all_questions_loaded = response.data.questions;
         //console.log(" All questions loaded from server for this quiz attempt:");
         //all_questions_loaded.forEach((q: QuestionProps) => console.log("Question id:", q.id, " question number:", q.question_number, " content:", q.content));
         const first_question = all_questions_loaded.length > 0 ? all_questions_loaded[0] : null;
         setRemainingQuestions(all_questions_loaded.slice(1).map((q: QuestionProps) => ({ question: q }))); // we set the remaining questions as all the questions except the first question, which is set as the current question to display. We also map the questions into an object with a "question" key so that we can easily add the question_attempt_id to each question object when we create the next question attempt and get the next question from the remainingQuestions array in state to display immediately for a smooth user experience while waiting for the server response.
         setQuestion(first_question);
         setQuestionAttemptId(response.data.question_attempt_id);
         setQuizAttempt(response.data.quiz_attempt);
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
            if (reviewState) {
              return
            }
            if (remainingQuestions.length === 1 && !isFetching.current) {
              isFetching.current = true;
                console.log("\nNorma state. Remaining questions size is 1, fetching more questions from server. Remaining questions length:", remainingQuestions.length);
                const last_question_remaining = remainingQuestions[remainingQuestions.length - 1];
                api.post(`/english/quizzes/${id}/questions/${last_question_remaining?.question.question_number + 1}`,
                  { quiz_attempt_id: quizAttempt?.id },
                )  // send the current question number
                  .then((response) => {
                    //console.log("More fetched questions from server:");
                    //response.data.questions.forEach((q: QuestionProps) => console.log("Question id:", q.id, " question number:", q.question_number, " content:", q.content));
                    //console.log("---- has_more flag from server:", response.data.has_more);
                    setRemainingQuestions(prev => [...prev, ...response.data.questions.map((q: QuestionProps) => ({ question: q }))]);
                    //setHasMoreNormalQuestions(response.data.has_more);
                    isFetching.current = false;
                  })
                  .catch(() => { isFetching.current = false; });
            }
          }, [remainingQuestions.length, reviewState]);
  
          
          useEffect(() => {   // for review state
            if (!reviewState) {
              return
            }
            console.log("In review state, checking remaining questions. Remaining questions length:", remainingQuestions.length, " isFetching:", isFetching.current);
            if (remainingQuestions.length === 1 && !isFetching.current) {
              console.log("\nIn review state. Remaining questions size is 1, need to replenish more incorrectly answered questions from server if there are more to review. Remaining questions length:", remainingQuestions.length);
              isFetching.current = true;
              // get the question attempt number of the last question in remainingQuestions 
              console.log(" Remaining question in review state:");
              remainingQuestions.forEach(q => console.log("Question id:", q.question.id, " question number:", q.question.question_number, " content:", q.question.content, " question_attempt_number:", q.question_attempt_number));
              const questionAttemptNumber = remainingQuestions[remainingQuestions.length - 1].question_attempt_number;
              console.log("\nIn review state. Remaining questions size is 1, replenish more incorrectly answered questions from server. Current question attempt number of last question in remainingQuestions:", questionAttemptNumber);
              if (questionAttemptNumber !== undefined) {
                 replenishIncorrectQuestions(questionAttemptNumber);
              } else {
                console.error("Question attempt number is undefined.");
              }
            }
          }, [remainingQuestions, reviewState]);
          

          /*
   useEffect(() => {
      console.log("useEffect ******* to check remaining questions. Remaining questions length:", remainingQuestions.length, " isFetching:", isFetching.current);
      if (remainingQuestions.length === 0 && loading === false && quizAttempt !== null && !isFetching.current) {
          isFetching.current = true;
          console.log("\nNo more remaining questions in state. Fetch more questions,  currentQuestionNumberRef:", currentQuestionNumberRef.current);
          
          if (reviewState) {
            console.log("----<<<<<<<<<>>>>>>> In review state, fetching incorrectly answered questions from server for quiz attempt id:", quizAttempt?.id);
          }
          else {
            api.post(`/english/quizzes/${id}/questions/${currentQuestionNumberRef.current + 1}`,
              { quiz_attempt_id: quizAttempt?.id },
            )  // send the current question number
              .then((response) => {
                console.log("Questions fetched from server:");
                //response.data.questions.forEach((q: QuestionProps) => console.log("Question id:", q.id, " question number:", q.question_number, " content:", q.content));
                console.log("---- data ------ from server:", response.data);
                if (response.data.questions.length === 0) {
                  console.log("No more questions returned from server.");
                }
                else {
                  console.log("More questions returned from server, adding to remainingQuestions in state. Questions returned:", response.data.questions.length);
                  setRemainingQuestions(prev => [...prev, ...response.data.questions.map((q: QuestionProps) => ({ question: q }))]);
                }
                isFetching.current = false;
              })
              .catch(() => { isFetching.current = false; });
          }

      }
    }, [remainingQuestions.length]);
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
   
    const uanswer = childQuestionRef.current?.getAnswer();  
    const aKey = question?.answer_key;
   
    const url = `/api/question_attempts/${questionAttemptId}/process/`;

    api.post<ProcessQuestionAttemptResultsProps>(url, { format: question?.format, user_answer: uanswer, answer_key: aKey })
      .then((res) => {
        // server returns the next question id (if any), together with assessment results 
        console.log("---->>>> Received response from server after processing question attempt:", res.data);
    
        const { assessment_results, quiz_attempt_has_errors } = res.data;
        //console.log("Assessment results from server:", assessment_results);
        setQuestionAttemptAssessmentResults(assessment_results);
        opacityResults.value = withTiming(1, { duration: 100 });
        if (remainingQuestions.length === 0 && quiz_attempt_has_errors === false) {
           setEndOfQuiz(true)
           //quiz_attempts/<int:pk>/mark_completed/", 
           console.log("&&&& No more remaining questions and no errors in quiz attempt, marking quiz attempt as completed in server. Quiz attempt id:", quizAttempt.id);
           // call api to mark quiz attempt as completed. There are no more questions to attempt and there are no errors in the quiz attempt, 
            api.post(`/api/quiz_attempts/${quizAttempt.id}/mark_completed/`)
              .then((response) => {
                console.log("Quiz attempt marked as completed in server. Server response:", response.data);
              })
              .catch((err) => {
                console.error("Error marking quiz attempt as completed in server:", err);
              });

        } else if (remainingQuestions.length === 0) { // no more questions but there are errors
           setShowEndOfQuizModal(true);
        }
        else {  // there are more questions to show, 
          setShowContinueButton(true);
        }
      })
      .catch((err) => {
        console.error("Error processing question attempt:", err);
      });
}

const createNextQuestionAttempt = async (quizAttemptId: number) => {
  const url = `/api/quiz_attempts/${quizAttemptId}/create_question_attempt/`;
  const next_question = remainingQuestions[0]; // first question in the 
  //currentQuestionNumberRef.current = next_question.question.question_number; // we use a ref to hold the current question number so that we can access it in the useEffect that listens for changes in remainingQuestions to determine when we are at the end of the currently loaded questions and need to fetch more questions from the server. We set this ref to the question number of the next question to display before we even make the API call to create the next question attempt, so that we can have the correct current question number available in that useEffect for the API call to fetch more questions when we are at the end of the currently loaded questions.
  console.log("***** createNextQuestionAttempt Next question:", next_question.question.id);
   // remove the next question from remainingQuestions  
  
   setQuestion(next_question.question || undefined);

   //instantly moves the new question off-screen to the right (e.g., 390px right). No animation, just a snap.
   translateX.value = screenWidth;
   //immediately overrides that with an animation that slides it back to 0 (its normal position) over 300ms.
   //  Together, lines 283+286 create the "slide in from the right" effect for the new question.
   translateX.value = withTiming(0, { duration: 300 });
   //  fades the results panel (the explanation/correct-incorrect feedback) out over 400ms, 
   // so it disappears as the new question slides in.
    opacityResults.value = withTiming(0, { duration: 400 });
    setShowContinueButton(false);
  try {
    const response = await api.post<{ question_attempt_id: number, question_attempt_number: number }>(url, {
      question_id: next_question.question.id, // we send the question id of the next question to createNextQuestionAttempt, which uses this to tell the server which question attempt to create next. We also use this question id to find the next question in the remainingQuestions array and set it as the current question immediately for a smooth user experience, while waiting for the server response. If test_next_question is undefined (which shouldn't happen because we should have already checked that there is a next question before showing the Continue button), we pass null to createNextQuestionAttempt, which should trigger an error response from the server that we can catch and log.
      review_state: quizAttempt.review_state
    });
    //console.log("createNextQuestionAttempt , Received response from create_next_question_attempt:", response.data);

    const { question_attempt_id, question_attempt_number } = response.data;
    //console.log("createNextQuestionAttempt, ******************************** question_attempt_id from server:", question_attempt_id);
    //console.log("createNextQuestionAttempt, ******************************** question_attempt_number from server:", question_attempt_number);
    setQuestionAttemptId(question_attempt_id);

    console.log("**** REMOVE*********** the next question from remainingQuestions in state. Question id removed:", next_question.question.id);
    setRemainingQuestions(prev => prev.filter(q => q.question.id !== next_question.question.id));


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
    //remainingQuestions.forEach(q => console.log("Question id:", q.id, "question number:", question?.question_number, " content:", q.content));
    setQuestionAttemptAssessmentResults(null);
    opacityResults.value = withTiming(0, { duration: 200 });
    translateX.value = withTiming(-screenWidth, { duration: 300 });
    // Start API call immediately in parallel with the slide-out animation
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

  
const createFirstReviewQuestionAttempt = async (question_id: number) => {
    console.log("((((((((((((((((((((((( createFirstReviewQuestionAttempt called with question_id:", question_id);
    try {
      const response = await api.post<{ question_attempt_id: number, question_attempt_number: number }>(
        `/api/quiz_attempts/${quizAttempt?.id}/create_question_attempt/`,
        { question_id, review_state: "review" }
      );
      setQuestionAttemptId(response.data.question_attempt_id);
    
    } catch (error) {
      console.error("Error creating first question attempt:", error);
    }
  };

  const loadIncorrectQuestions = async (starting_question_attempt_number: number): Promise<QuestionProps | null> => {
    console.log("------>>>>><<<<<<<<<< loadIncorrectQuestions <<<<called for starting question att number", starting_question_attempt_number);
    isFetching.current = true;
    try {
      const response = await api.post<IncorrectQuestionsResponse>(`/api/quiz_attempts/${quizAttempt?.id}/incorrect_questions/`, {
        starting_question_attempt_number,
        number_of_questions_to_load: 2,
      });
      console.log("Incorrect questions LOADED: response data:");
      response.data.incorrect_questions.forEach((item: IncorrectQuestionProps) => {
        console.log("Question attempt number:", item.question_attempt_number, " question id:", item.question.id, " content:", item.question.content);
      });
      console.log(" curren remaining questions in state before adding incorrectly answered questions from server:")
      remainingQuestions.forEach(q => console.log("Question id:", q.question.id, " question number:", q.question.question_number, " content:", q.question.content));

      setRemainingQuestions(prev => [
        ...prev,
        ...response.data.incorrect_questions.map((item: IncorrectQuestionProps) => ({
          question: item.question,
          question_attempt_number: item.question_attempt_number,
        }))
      ]);

      return response.data.incorrect_questions.length > 0 ? response.data.incorrect_questions[0].question : null; // Return the first incorrectly answered question to review, or null if there are no incorrectly answered questions
      
    } catch (error) {
      console.error("Error fetching incorrectly answered questions:", error);
      return null;
    } finally {
      isFetching.current = false;
    }
  }


  const replenishIncorrectQuestions =  (starting_question_attempt_number: number) => {
    console.log("------>>>>><<<<<<<<<< replenishIncorrectQuestions <<<<called for starting question att number", starting_question_attempt_number);
    isFetching.current = true;
    api.post<IncorrectQuestionsResponse>(`/api/quiz_attempts/${quizAttempt?.id}/replenish_incorrect_questions/`, {
      starting_question_attempt_number: starting_question_attempt_number + 1,
      number_of_questions_to_load: 2, // we can adjust this number to control how many incorrectly answered questions we want to add back into the remainingQuestions in state for the user to review again. This is useful in case the user has a long list of incorrectly answered questions and we don't want to overwhelm them by adding all of them back into the review flow at once, but rather add them back in smaller batches as they go through the review flow.
    })
      .then((response) => {
        console.log("Incorrect questions replenished: response data:");
        response.data.incorrect_questions.forEach((item: IncorrectQuestionProps) => {
          console.log("Question attempt number:", item.question_attempt_number, " question id:", item.question.id, " content:", item.question.content);
        });
        console.log(" curren remaining questions in state before adding replenished incorrectly answered questions from server:")
        
        remainingQuestions.forEach(q => console.log("Question id:", q.question.id, " question number:", q.question.question_number, " content:", q.question.content));
        setRemainingQuestions(prev => [
          ...prev,
          ...response.data.incorrect_questions.map((item: IncorrectQuestionProps) => ({
            question: item.question,
            question_attempt_number: item.question_attempt_number,
          }))
        ]);
      })
      .catch((error) => {
        console.error("Error fetching incorrectly answered questions:", error);
      })
      .finally(() => {
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
          <View>
           
                
                  <Text>Question id: {question?.id} Review state: {reviewState.toString()},  Remaining questions:</Text>
                    { remainingQuestions.map((q, index) => (
                      <Text key={index}>- Question id: {q.question.id}, qa number: {q.question_attempt_number} </Text>
                    ))  
                    }
                  </View>
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
                onPress={async () => {
                  setShowEndOfQuizModal(false);
                  const first_question = await loadIncorrectQuestions(1);
                  if (first_question) {
                    setQuestion(first_question);
                    translateX.value = screenWidth;
                    translateX.value = withTiming(0, { duration: 300 });
                    setReviewState(true);
                    createFirstReviewQuestionAttempt(first_question.id);
                    // remove this question from remainingQuestions so that it doesn't show up again in the quiz flow since we are now in the review flow for incorrectly answered questions
                    setRemainingQuestions(prev => prev.filter(q => q.question.id !== first_question.id));
                  }
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


