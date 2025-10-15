type CalculationType =
  | "assignment"
  | "sum"
  | "percentage"
  | "weightedAverage"
  | "gradePoint"
  | "totalGradePoint"
  | "roundedGrade"
  | "computed";

export type HeaderNodeType =
  | "term"
  | "unit"
  | "component"
  | "assessment"
  | "computed";

export interface HeaderNode {
  title: string;
  key?: string;
  type?: "normal" | "v-separator" | "spacer" | "h-separator";
  children: HeaderNode[];
  nodeType?: HeaderNodeType;
  isRowSpan?: boolean;
  needsButton?: boolean;
  maxScore?: number;
  colSpan?: number;
  calculationType?: CalculationType;
  groupKeys?: string[];
  dependsOn?: string[];
  weights?: number[];
  customRowSpan?: number;
  studentInfo?: boolean;
  computedGrades?: boolean;
  termType?: "midterm" | "final";
  componentId?: number;
}