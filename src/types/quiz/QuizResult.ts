export interface StartedQuizView {
  id: number;
  title: string;
  course_title: string | null;
  submitted_count: number; 
  program:string
}

export interface StartedQuizRaw {
  id: number;
  title: string;
  course_title: string | null;
  submited_count: number; 
  program:string
}

export interface StartedQuizEnvelope {
  quiz: StartedQuizRaw;
}


// results 
export interface QuizResultsQuiz {
  id: number
  title: string
  total_marks: string 
}
export interface LeaderboardRow {
  rank: number
  student_id: number
  student_name: string
  student_image: string | null
  score: number | null
  total_marks: string       
  percentage: number        
  completed_at: string      
  time_spent_minute: string 
}
export interface QuizResultsData {
  quiz: QuizResultsQuiz
  leaderboard: LeaderboardRow[]
}
export interface QuizResultsResponse {
  status: string
  data: QuizResultsData
}

// student-attempt
export interface QuestionAnswer {
  answer_id: number
  question: string
  answer: string | null
  is_correct: boolean
  marks_obtained: string 
  time_spent: string     
}
export interface StudentAttemptItem {
  attempt_id: number
  quiz_id: number
  student_name: string
  attempt_number: number
  status: string
  started_at: string           
  submitted_at: string        
  time_spent_seconds: number | null
  raw_score: number | null
  final_score: number | null
  percentage: string           
  is_passed: boolean
  question_answers: QuestionAnswer[]
}
export interface StudentAttemptResponse {
  data: StudentAttemptItem[]
  message: string
}