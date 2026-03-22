//import { QuestionAttemptAttributes } from "../types/QuestionAttemptAttributes";

interface QuestionAttemptAttributes {
  user_answer: string;
  score: number;
  error_flag: boolean;
  
}

//updateQuestionAttempt(domain, question_attempt_id ? String(question_attempt_id) : "", user_answer, score, is_errorneous),
export const updateQuestionAttempt = async (
    domain: string,
    id: string,   //question attempt id
    user_answer: string,
    score: string | undefined,
    error_flag: boolean | undefined
): Promise<QuestionAttemptAttributes> => {
    // server will decide the next question to fetch

    console.log("updateQuestionAttempt xxxx id=", id, "user_answer=", user_answer, "score=", score, "error_flag=", error_flag)    
    
    //const domain = useSelector((state: RootState) => state.domain.value);
    //const domain = useSelector((state: RootState) => state.domain.value);

    //console.log("domain: ", domain)

    const url = `${domain}/api/question_attempts/${id}/update`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ score, error_flag, user_answer }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    //const data = await response.json();
    //console.log("data", data)
    //return data;
    return {user_answer, score: Number(score), error_flag: error_flag} as QuestionAttemptAttributes
  }