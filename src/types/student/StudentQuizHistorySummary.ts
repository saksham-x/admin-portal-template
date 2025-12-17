
export type ApiStatus = string; 

export type ApiEnvelope<T> = {
  status: ApiStatus;
} & T;

export interface StudentQuizAnswer {
  answer_id: number;
  question: string;
  answer: string;
  is_correct: boolean;
  marks_obtained: number | string;
  time_spent: string;
}

export interface StudentQuizHistoryItem {
  id: number;
  quiz_title: string;
  course_title: string;
  total_marks: number | string;
  start_date: string | null;
  end_date: string | null;
  question_answers: StudentQuizAnswer[];
}

export interface ClassroomQuiz {
  id: number;
  course_title: string;
  quiz_title: string;
  total_marks: number | string;
  start_date: string; 
  end_date: string;
}

export interface StudentQuizHistoryPayload {
  data: StudentQuizHistoryItem[];
  total_quizzes?: number;
  ongoing_quizzes?: number;
  completed_quizzes?: number;
  classroom_quizzes?: ClassroomQuiz[];
}

export type StudentQuizHistoryResponse = ApiEnvelope<StudentQuizHistoryPayload>;