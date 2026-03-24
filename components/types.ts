export interface CategoryProps {
    id: number,
    name: string
    category_number: number
}

export interface LevelProps {
        id: number;
        level_number: number;
        name: string;
        categories: CategoryProps[];
}

export interface QuizProps {
    id: number,
    name: string,
    quiz_number: number,
    video_url?: string,
    video_segments? : any[]
}

export interface QuestionProps {
    id: number,
    quiz_id: number,
    question_number: number,
    content: string,
    format: number,
    answer_key: string,
    instructions?: string,
    prompt?: string,
    audio_str?: string,
    score: number,
    button_cloze_options?: string,
    hint?: string,
    explanation?: string,
    timeout: number,
}
 

    export interface TakeQuestionProps  {
    ref?: React.Ref<ChildQuestionRef>;
    content: string | undefined; // Content of the question, if needed
    enableCheckButton: (value: boolean) => void; // Function to enable the Check button
  };
  
  
  export type QuestionAttemptResults = {
    error_flag: boolean,
    score: number, 
    user_answer: string
    }; 
  
  export interface ChildQuestionRef {
      // answer can be a string (ButtonSelect)
      // or an array of strings (WordScramble, WordsSelect, ClickAndCloze)
      getAnswer: () => string | undefined;
    }

    export interface ProcessQuestionAttemptResultsProps {
        assessment_results: QuestionAttemptAssesmentResultsProps,
        quiz_attempt: {
            completed: boolean,
            score: number,
        }
        next_question_id? : number,
      }
      
      export interface QuestionAttemptAssesmentResultsProps {
        answer?: string 
        score: number,
        error_flag: boolean,
        cloze_question_results?: ClozeAnswerResultsProps[] | undefined,
      }
      
      type ClozeAnswerResultsProps = {
        user_answer: string,   
        answer_key: string,
        score: number,
        error_flag: boolean,
      }
  
