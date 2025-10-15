import type {
  ClassRecord,
  CourseTerm,
  CourseUnit,
  CourseComponent,
} from "../../../types/classRecordTypes";
import type { HeaderNode } from "../types/headerConfigTypes";

export default function collectMaxScores(
  nodes: HeaderNode[]
): Record<string, number> {
  const scores: Record<string, number> = {};
  function collect(node: HeaderNode) {
    if (
      node.key &&
      node.maxScore !== undefined &&
      node.calculationType === "assignment"
    ) {
      scores[node.key] = node.maxScore ?? 0;
    }
    node.children.forEach(collect);
  }
  nodes.forEach(collect);
  return scores;
}

export function createSpanningCell(crp: ClassRecord): HeaderNode {
  const lines = [
    `Department: ${crp.info.department}`,
    `Subject: ${crp.info.subject}`,
    `Year and Section: ${crp.info.yearSection}`,
  ];

  return {
    title: lines.join("\n"),
    children: [],
    isRowSpan: true,
    type: "normal",
    colSpan: 3,
    studentInfo: true,
  };
}

function createTermSection(term: CourseTerm): HeaderNode {
  const children = term.course_units.map((unit) =>
    createUnitSection(term.course_term_type, unit)
  );

  const gpKeys = term.course_units.map(
    (unit) => `${term.course_term_type}-${unit.course_unit_type}-gradepoint`
  );
  const totalGpKey = `${term.course_term_type}-total-gradepoint`;
  const totalGradeKey = `${term.course_term_type.toLowerCase()}-total-grade`;

  children.push({
    title: term.course_term_type,
    children: [
      {
        title: "",
        children: [
          {
            title: "Total Grade Point",
            key: totalGpKey,
            children: [],
            calculationType: "totalGradePoint",
            dependsOn: gpKeys,
            weights: term.course_units.map(
              (u) => u.course_unit_percentage / 100
            ),
          },
          {
            title: "Period Grade",
            key: totalGradeKey,
            children: [],
            calculationType: "roundedGrade",
            dependsOn: [totalGpKey],
          },
        ],
      },
    ],
  });

  return {
    title: `${term.course_term_type} Grade`,
    children,
    nodeType: "term",
  };
}

function createUnitSection(termType: string, unit: CourseUnit): HeaderNode {
  const children: HeaderNode[] = [];

  unit.course_components.forEach((comp) => {
    const { nodes: assignmentNodes, groupKeys } = createAssessmentNodes(
      termType,
      comp
    );

    children.push({
      title: `${comp.course_component_type} (${comp.course_component_percentage}%)`,
      children: [
        ...assignmentNodes,
        {
          title: "Total Score",
          key: `${termType}-${unit.course_unit_type}-${comp.course_component_type}-total`,
          children: [],
          calculationType: "sum",
          groupKeys,
        },
        {
          title: "% Percentage",
          key: `${termType}-${unit.course_unit_type}-${comp.course_component_type}-perc`,
          children: [],
          calculationType: "percentage",
          groupKeys,
        },
      ],
      nodeType: "component",
      componentId: comp.course_component_id,
    });
  });

  const percKeys = unit.course_components.map(
    (comp) =>
      `${termType}-${unit.course_unit_type}-${comp.course_component_type}-perc`
  );
  const unitMgaKey = `${termType}-${unit.course_unit_type}-mga`;
  const unitGpKey = `${termType}-${unit.course_unit_type}-gradepoint`;

  children.push({
    title: unit.course_unit_type,
    children: [
      {
        title: "MGA",
        key: unitMgaKey,
        children: [],
        calculationType: "weightedAverage",
        dependsOn: percKeys,
        weights: unit.course_components.map(
          (c) => c.course_component_percentage / 100
        ),
      },
      {
        title: `${unit.course_unit_type} Grade Point`,
        key: unitGpKey,
        children: [],
        calculationType: "gradePoint",
        dependsOn: [unitMgaKey],
      },
    ],
  });

  return {
    title: `${unit.course_unit_type} (${unit.course_unit_percentage}%)`,
    children,
    nodeType: "unit",
  };
}

function createAssessmentNodes(
  termType: string,
  component: CourseComponent
): { nodes: HeaderNode[]; groupKeys: string[] } {
  const sortedAssessments = [...component.assessments].sort(
    (a, b) => (a.assessment_id ?? 0) - (b.assessment_id ?? 0)
  );

  const nodes: HeaderNode[] = sortedAssessments.map((assess) => ({
    title: assess.assessment_title || "",
    key: `${assess.assessment_id}`,
    children: [],
    needsButton: true,
    calculationType: "assignment",
    nodeType: "assessment",
    maxScore: assess.assessment_highest_score ?? 0,
    termType: termType as "midterm" | "final",
  }));

  const groupKeys = nodes.map((n) => n.key!);
  return { nodes, groupKeys };
}

export function createComputedSection(): HeaderNode {
  const titles = [
    "1/2 MTG + 1/2 FTG",
    "1/2 MTG + 1/2 FTG (For Removal)",
    "1/2 MTG + 1/2 FTG (After Removal)",
    "Description",
    "1/3 MTG + 2/3 FTG",
    "1/3 MTG + 2/3 FTG (For Removal)",
    "1/3 MTG + 2/3 FTG (After Removal)",
    "Description",
    "Remarks (INC, Withdrawn, DF, OD)",
  ];
  const keys = [
    "computed-half-weighted",
    "computed-half-for-removal",
    "computed-half-after-removal",
    "computed-half-desc",
    "computed-third-weighted",
    "computed-third-for-removal",
    "computed-third-after-removal",
    "computed-third-desc",
    "computed-remarks",
  ];
  const children: HeaderNode[] = titles.map((title, index) => ({
    title,
    children: [],
    key: keys[index],
    calculationType: "computed",
    customRowSpan: 2,
    computedGrades: true,
  }));
  return {
    title: "Computed Final Grade",
    children,
    customRowSpan: 3,
    computedGrades: true,
    nodeType: "computed",
  };
}

export function generateHeaderConfig(crp: ClassRecord): HeaderNode[] {
  const header: HeaderNode[] = [
    createSpanningCell(crp),
    { title: "", children: [], type: "v-separator", key: "vsep-0" },
  ];

  crp.course_terms.forEach((term, i) => {
    if (i > 0) {
      header.push({
        title: "",
        children: [],
        type: "v-separator",
        key: `vsep-${i}`,
      });
    }
    header.push(createTermSection(term));
    header.push({
      title: "",
      children: [],
      type: "spacer",
      key: `spacer-${i}`,
    });
  });

  header.push({
    title: "",
    children: [],
    type: "v-separator",
    key: `vsep-end`,
  });
  header.push(createComputedSection());
  header.push({ title: "", children: [], type: "h-separator", key: "hsep-1" });

  return header;
}
