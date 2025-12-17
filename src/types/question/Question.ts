export type QuestionType =
  | "mcq"
  | "true_false"
  | "image"
  | "short_answer"
  | "essay"
  | "fill_blank";

export type QuestionDifficulty = "easy" | "medium" | "hard";

type CommonFields = {
  question_bank_id: number;              // required for submit
  type: QuestionType;
  question_text: string;                 // required
  explanation?: string | null;
  difficulty: QuestionDifficulty;        // required
  default_marks?: number | null;         // >= 0
  negative_marks?: number | null;        // >= 0
  tags?: string[] | null;
  version?: number | null;
  is_active?: boolean | number;          // allow boolean in UI, convert to 1/0 when sending
  // UI-only fields (NOT validated by backend):
  parent_question_id?: number | null;
};

// IMAGE question: file arrays
export type ImageQuestion = CommonFields & {
  type: "image";
  question_media: File;                  // required on create
  options: File[];                       // required array
  correct_answer: File[];                // required array (one or more)
};

// Non-image questions: string arrays
export type TextualQuestion =
  | (CommonFields & {
      type: "mcq" | "true_false" | "short_answer" | "essay" | "fill_blank";
      question_media?: File | string | null;  // optional
      options: string[];                      // required array (for essay you can pass [] if your BE accepts it)
      correct_answer: string[];               // required array
    });

export type Question = ImageQuestion | TextualQuestion;

export interface QuestionView extends Omit<Question, "question_media" | "options" | "correct_answer"> {
  id: number;
  question_bank?: { id: number; title: string } | null;

  // Server may return paths/URLs instead of File objects:
  question_media?: string | null;
  options?: (string)[];             // stored URLs/strings for image/text
  correct_answer?: string[];        // stored URLs/strings
}
