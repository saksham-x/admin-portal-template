import type { QuestionDifficulty } from "@/types/question/Question"

export type QuizQuestionSelection = "fixed" | "random" | "difficulty" | "hybrid";
export type QuizPassingCriteriaType = "percentage" | "marks";

export type DifficultyDistribution = Partial<
  Record<QuestionDifficulty, number>
>;

export interface Quiz {
  course_id: number;
  classroom_id?: number | null;
  title: string;
  total_marks: number;
  start_date: string; // ISO datetime
  end_date: string; // ISO datetime
  description?: string | null;
  instructions?: string | null;
  question_selection?: QuizQuestionSelection | null;
  random_question_count?: number | null;
  difficulty_distribution?: DifficultyDistribution | null;
  time_limit_minutes?: number | null;
  max_attempts?: number | null;
  allow_resume?: boolean;
  shuffle_questions?: boolean;
  shuffle_options?: boolean;
  result_release_date?: string | null;
  show_score_immediately?: boolean;
  show_correct_answers?: boolean;
  show_explanation?: boolean;
  passing_criteria_type?: QuizPassingCriteriaType | null;
  passing_criteria_value?: number | null;
  restrict_ip?: boolean;
  allowed_ips?: string[] | null;
  restrict_device?: boolean;
  prevent_multiple_login?: boolean;
  is_published?: boolean;
  is_template?: boolean;
}

export interface QuizView extends Quiz {
  id: number;

  question_count?: number;
  pass_percentage?: number;
  time_limit?: number;
  is_random?: boolean;
  show_explanations?: boolean;
  created_by?: number;

  // course?: { id: number; title: string } | null;
  // academic_year?: { id: number; title: string } | null;
}
