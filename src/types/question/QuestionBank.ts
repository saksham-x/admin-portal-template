export interface QuestionBank {
  course_id: number;
  title: string;
  description?: string;
  is_active: boolean;
  classroom_id?: number;
}

export interface QuestionBankView extends QuestionBank {
  id: number;
  course?: { id: number; title: string } | null;
   classroom?: { id: number; title: string } | null
}
