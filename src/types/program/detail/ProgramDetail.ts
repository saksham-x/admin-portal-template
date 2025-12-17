export interface ProgramDetail {
  program_id: number;
  title: string;
  type: string | null;
  is_admission_process_info: boolean | null;
  description: string | null;
  position: number | null;
  is_active: boolean;
}

export interface ProgramDetailView extends ProgramDetail {
  id: number;
  program_title?: string;
}