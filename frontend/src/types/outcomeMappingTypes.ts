export interface ProgramOutcome {
  program_outcome_id: number;
  program_outcome_code: string;
  program_outcome_description: string;
}

export interface CourseOutcome {
  course_outcome_id: number;
  course_outcome_code: string;
  course_outcome_description: string;
}

export interface MappingCell {
  id: number;
  program_outcome: ProgramOutcome;
  course_outcome: CourseOutcome;
  outcome_mapping: string | null;
}

export interface OutcomeMappingResponse {
  program_outcomes: ProgramOutcome[];
  course_outcomes: CourseOutcome[];
  mapping: MappingCell[];
}
