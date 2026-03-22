//import { VideoSegmentProps } from "../quiz_attempts/types";
//import { store } from "../../redux/store";

export type VideoSegmentProps = {
  id: number,
  segment_number: number,
  question_numbers: string,
  duration: number,
  start_time: string,
  end_time: string,
  quizId: number
  questions: any[]
}

type QuizProps = {
  id: number,
  name: string,
  quiz_number: number,
  unitId: number,
  disabled: boolean,
  video_url: string,
  video_segments?: VideoSegmentProps[],
}

/*
name        | varchar(255) | YES  |     | NULL    |                |
| quiz_number | int          | YES  |     | NULL    |                |
| unitId      | int          | YES  |     | NULL    |                |
| disabled    | tinyint(1)   | YES  |     | NULL    |                |
| video_url   | varchar(255) | YES  |     | NULL    |                |
+-------------+--------------+------+-----+---------+----------------+
*/

  export const fetchQuiz = async (domain: string, quiz_id: string): Promise<QuizProps> => {
   //console.log("fetchQuiz ENTRY quiz_id=", quiz_id);
      //const rootpath = store.getState().rootpath.value
      console.log("fetchQuiz domain=", domain, " quiz_id=", quiz_id);
      const url = `${domain}/api/quizzes/${quiz_id}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch  question attempt");
      //console.log("fetchLiveQuestion response json", response.json())
      return response.json();
    };
  

  
  