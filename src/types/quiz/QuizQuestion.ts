import type { QuestionDifficulty } from "@/types/question/Question"


export interface QuizQuestionCreatePayload {
  question_id: number[]
}


export interface QuizQuestionView {
  question_id: number
  question_text: string
  checked: boolean
  type: "mcq" | "true_false" | "short_answer" | "essay"
  difficulty: QuestionDifficulty
}
