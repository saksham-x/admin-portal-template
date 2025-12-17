export type ClassroomShift = 'morning' | 'day' | 'evening';
export type ClassroomRunningMode = 'online' | 'offline' | 'hybrid';

export interface Classroom {
  academic_year_id: number | null;
  program_id: number | null;
  grade_id: number | null;
  level_id: number | null;

  title: string;
  shift: ClassroomShift | string;
  online_class_url?: string | null;
  room_no?: string | null;
  running_mode: ClassroomRunningMode | string;
  online_class_type?: string | null;
  start_date: string;
  end_date: string;   

  is_confirmed?: boolean;
  is_welcome_email_notified?: boolean;
  is_completed?: boolean;
  is_active?: boolean;
}

export interface ClassroomView extends Classroom {
  id: number;

  academic_year?: string;
  program?: string;
  grade?: string;
  level?: string;

  user_count?: number;
  student_count?: number;
  courses_count?: number;

  users?: any[];
  students?: any[];
  courses?: any[];
}
export interface ClassroomSummary {
  id: number
  title: string
  academic_year_id: number
  program_id: number
  grade_id: number
  level_id: number

  // labels (optional)
  academic_year?: string
  program?: string
  grade?: string
  level?: string
}