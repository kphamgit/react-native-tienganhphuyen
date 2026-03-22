 
 
 const fetchQuestionAttempt = async (domain: string | undefined, quiz_attempt_id: string | undefined): Promise<any> => {
    //fetch a question as well as corresponding question attempt. Server will decide which question to fetch
      //const rootpath = store.getState().rootpath.value
      //console.log("fetchQuestionAttempt quiz_attempt_id=", quiz_attempt_id)
      // const domain1 = 'https://kphamenglish-f26e8b4d6e4b.herokuapp.com'
      const url = `${domain}/api/quiz_attempts/${quiz_attempt_id}/create_next_question_attempt_native`;
      //  const url = `${domain}/api/quiz_attempts/${quizAttemptId}/create_next_question_attempt_native`;
      console.log("in fetchQuestionAttempt url", url)
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch  question attempt");
      //console.log("fetchLiveQuestion response json", response.json())
      return response.json();
    };
    
    export default fetchQuestionAttempt;
