export interface CategoryProps {
    id: number,
    name: string
    category_number: number
}

export interface UnitProps {
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
    content_language: string,
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
        quiz_attempt_has_errors: boolean,
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

      /*
 quiz_attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name="question_attempts")
    #question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="question_attempts")
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="question_attempts", default=1)
    question_attempt_number = models.IntegerField(default=0)
    error_flag = models.BooleanField(default=None, null=True)
    completed = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    answer = models.CharField(max_length=1000, blank=True, null=True, default="")
      */

      export interface QuestionAttemptProps {
        id: number,
        question_attempt_number: number,
        question_id: number,
        quiz_attempt_id: number,
        error_flag: boolean,
        score: number,
        completed: boolean,
      }

      export interface QuizAttemptProps {
        id: number,
        quiz_id: number,
        user_name: string,
        score: number,
        created_at: string,
        updated_at: string,
        completion_status: string,
        review_state: string,
      }
    
      export interface QuizAttemptCreatedProps {
        question: QuestionProps,
        question_attempt_id: number,
        created: boolean
        quiz_attempt: QuizAttemptProps,
      }
  

      export interface QuestionAttemptAssesmentResultsProps {
        answer?: string 
        score: number,
        error_flag: boolean,
        cloze_question_results?: ClozeAnswerResultsProps[] | undefined,
      }
      
  