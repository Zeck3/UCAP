import ExcelJS from "exceljs";
import {
  getHeaderClass,
  getCalculatedBg,
  getMaxDepth,
  countLeaves,
  getDesc,
} from "./ClassRecordFunctions";
import type { HeaderNode } from "../types/headerConfigTypes";
import type { Student } from "../../../types/classRecordTypes";

interface ExportData {
  headerNodes: HeaderNode[];
  students: Student[];
  studentScores: Record<number, Record<string, number>>;
  maxScores: Record<string, number>;
  computedValues: Record<number, Record<string, number>>;
}

type NodeMatrix = (HeaderNode | null)[][];

const GRADE_SCALE = [
  1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0, 4.25, 4.5,
  4.75, 5.0,
];

const COLORS = {
  WHITE: "FFFFFFFF",
  BLACK: "FF000000",
  BLUE: "FF1F3864",
  RED: "FF9C0006",
  YELLOW: "FFFFC000",
  COA_YELLOW: "FFFCF305",
  LIGHT_BLUE: "FF99CCFF",
  GREEN: "FF70AD47",
  PALE_GREEN: "FFC5E0B3",
} as const;

const COLOR_MAP: Record<string, string> = {
  "bg-ucap-yellow": COLORS.YELLOW,
  "bg-coa-yellow": COLORS.COA_YELLOW,
  "bg-light-blue": COLORS.LIGHT_BLUE,
  "bg-ucap-green": COLORS.GREEN,
  "bg-pale-green": COLORS.PALE_GREEN,
  "bg-transparent": COLORS.WHITE,
};

function sanitizeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, "");
}

function generateFilename(classInfoNode: HeaderNode | undefined): string {
  if (!classInfoNode?.title) {
    return `class_record_${new Date().toISOString().split("T")[0]}.xlsx`;
  }

  const lines = classInfoNode.title.split("\n").filter((line) => line.trim());
  let department = "";
  let subject = "";
  let yearSection = "";

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("Department:")) {
      department = trimmed.replace("Department:", "").trim();
    } else if (trimmed.startsWith("Subject:")) {
      subject = trimmed.replace("Subject:", "").trim();
    } else if (trimmed.startsWith("Year and Section:")) {
      yearSection = trimmed.replace("Year and Section:", "").trim();
    }
  });

  if (!department && !subject && !yearSection) {
    return `class_record_${new Date().toISOString().split("T")[0]}.xlsx`;
  }

  const parts = [
    sanitizeFilename(department),
    sanitizeFilename(subject),
    sanitizeFilename(yearSection),
  ].filter(Boolean);

  return `${parts.join("_")}.xlsx`;
}

function getExcelColumnLetter(col: number): string {
  let letter = "";
  let remaining = col;
  while (remaining > 0) {
    const remainder = (remaining - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    remaining = Math.floor((remaining - 1) / 26);
  }
  return letter;
}

function generateSumFormula(row: number, groupKeys: string[], leafMap: Map<string, number>): string {
  const refs = groupKeys.map((k) => {
    const col = leafMap.get(k);
    return col !== undefined ? `${getExcelColumnLetter(col)}${row}` : "0";
  });
  return refs.length > 0 ? refs.join("+") : "0";
}

function generatePercentageFormula(row: number, groupKeys: string[], leafMap: Map<string, number>, maxScoreRow: number): string {
  const buildRefs = (r: number) => groupKeys.map((k) => {
    const col = leafMap.get(k);
    return col !== undefined ? `${getExcelColumnLetter(col)}${r}` : "0";
  });
  return `(${buildRefs(row).join("+")})/(${buildRefs(maxScoreRow).join("+")})`;
}

function generateWeightedAverageFormula(row: number, dependsOn: string[], weights: number[], leafMap: Map<string, number>): string {
  const terms = dependsOn.map((k, i) => {
    const col = leafMap.get(k);
    if (col === undefined) return null;
    return `${getExcelColumnLetter(col)}${row}*${weights[i] || 0}`;
  }).filter(Boolean);
  return terms.length > 0 ? terms.join("+") : "0";
}

function generateGradePointFormula(row: number, dependsOn: string[], leafMap: Map<string, number>): string {
  const col = leafMap.get(dependsOn[0]);
  if (col === undefined) return "5";
  const ref = `${getExcelColumnLetter(col)}${row}`;
  return `IF(${ref}>=0.7,23/3-(20/3)*(${ref}),5-(20/7)*(${ref}))`;
}

function generateRoundedGradeFormula(row: number, dependsOn: string[], leafMap: Map<string, number>): string {
  const col = leafMap.get(dependsOn[0]);
  if (col === undefined) return GRADE_SCALE[0].toString();
  return buildRoundingFormula(`${getExcelColumnLetter(col)}${row}`);
}

function buildRoundingFormula(valueRef: string): string {
  let formula = GRADE_SCALE[GRADE_SCALE.length - 1].toString();
  for (let i = GRADE_SCALE.length - 1; i > 0; i--) {
    formula = `IF(${valueRef}<${(GRADE_SCALE[i] + GRADE_SCALE[i - 1]) / 2},${GRADE_SCALE[i - 1]},${formula})`;
  }
  return formula;
}

function generateDescriptionFormula(gradeRef: string): string {
  const conditions = [[`(${gradeRef})>3`, "Failed"], [`(${gradeRef})<=1.25`, "Excellent"], [`(${gradeRef})<=1.75`, "Very Good"], [`(${gradeRef})<=2.25`, "Good"], [`(${gradeRef})<=2.75`, "Average"], [`(${gradeRef})=3`, "Passing"]];
  let formula = '"Failed"';
  for (let i = conditions.length - 1; i >= 0; i--) formula = `IF(${conditions[i][0]},"${conditions[i][1]}",${formula})`;
  return formula;
}

function generateComputedFormula(row: number, key: string, leafMap: Map<string, number>): string {
  const midCol = leafMap.get("midterm-total-grade");
  const finCol = leafMap.get("final-total-grade");
  if (midCol === undefined || finCol === undefined) return "0";
  const midRef = `${getExcelColumnLetter(midCol)}${row}`;
  const finRef = `${getExcelColumnLetter(finCol)}${row}`;
  const half = `(${midRef}*0.5+${finRef}*0.5)`;
  const third = `(${midRef}*(1/3)+${finRef}*(2/3))`;
  const computedMap: Record<string, string> = {
    "computed-half-weighted": `${midRef}*0.5+${finRef}*0.5`,
    "computed-third-weighted": `${midRef}*(1/3)+${finRef}*(2/3)`,
    "computed-half-for-removal": buildRoundingFormula(half),
    "computed-half-after-removal": buildRoundingFormula(half),
    "computed-third-for-removal": buildRoundingFormula(third),
    "computed-third-after-removal": buildRoundingFormula(third),
    "computed-half-desc": generateDescriptionFormula(buildRoundingFormula(half)),
    "computed-third-desc": generateDescriptionFormula(buildRoundingFormula(third)),
  };
  return computedMap[key] || "0";
}

function applyConditionalFormatting(worksheet: ExcelJS.Worksheet, leaves: HeaderNode[], headerRowCount: number, studentCount: number): void {
  const dataStartRow = headerRowCount + 3;
  leaves.forEach((leaf, i) => {
    const col = i + 4;
    const colLetter = getExcelColumnLetter(col);
    const key = leaf.key || "";
    const range = `${colLetter}${dataStartRow}:${colLetter}${dataStartRow + studentCount - 1}`;
    const isFailingGrade = leaf.calculationType === "gradePoint" || leaf.calculationType === "totalGradePoint" || leaf.calculationType === "roundedGrade" || (leaf.calculationType === "computed" && (key.includes("weighted") || key.includes("for-removal") || key.includes("after-removal")));
    if (isFailingGrade) {
      worksheet.addConditionalFormatting({ ref: range, rules: [{ type: "expression", priority: 1, formulae: [`${colLetter}${dataStartRow}>3`], style: { font: { color: { argb: COLORS.RED } } } }] });
    }
    if (leaf.calculationType === "computed" && key.includes("desc")) {
      worksheet.addConditionalFormatting({ ref: range, rules: [{ type: "expression", priority: 1, formulae: [`${colLetter}${dataStartRow}="Failed"`], style: { font: { color: { argb: COLORS.RED } } } }] });
    }
  });
}

export async function exportClassRecordToExcel(
  data: ExportData,
  filename?: string
): Promise<void> {
  const { headerNodes, students, studentScores, maxScores, computedValues } = data;
  const classInfoNode = headerNodes[0];
  const renderNodes = headerNodes.slice(1);
  const maxDepth = Math.max(...headerNodes.map(getMaxDepth));
  const headerRowCount = maxDepth + 1;

  const generatedFilename = filename || generateFilename(classInfoNode);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Class Record");

  const nodeMatrix: NodeMatrix = Array.from({ length: headerRowCount }, () => []);
  for (let r = 0; r < headerRowCount; r++) {
    nodeMatrix[r][0] = classInfoNode;
    nodeMatrix[r][1] = classInfoNode;
    nodeMatrix[r][2] = classInfoNode;
  }

  const leafNodes = collectLeafNodes(renderNodes);
  const parentMap = buildParentMap(renderNodes);
  const leafMap = buildLeafMap(leafNodes);

  createHeaderRows(worksheet, headerRowCount);
  mergeClassInfoCell(worksheet, classInfoNode, headerRowCount);
  buildHeaders(renderNodes, worksheet, nodeMatrix, maxDepth, 0, 4, headerRowCount);

  addSeparatorRow(worksheet);

  const maxScoreRowIndex = headerRowCount + 2;
  addMaxScoreRow(worksheet, leafNodes, maxScores, leafMap, maxScoreRowIndex);

  const sortedStudents = sortStudents(students);
  const dataStartRow = headerRowCount + 2;
  addStudentRows(
    worksheet,
    sortedStudents,
    leafNodes,
    studentScores,
    computedValues,
    leafMap,
    dataStartRow,
    maxScoreRowIndex
  );

  setColumnWidths(worksheet, leafNodes, parentMap);
  styleSheet(
    worksheet,
    worksheet.rowCount,
    leafNodes,
    nodeMatrix,
    parentMap,
    classInfoNode,
    headerRowCount
  );
  applyConditionalFormatting(
    worksheet,
    leafNodes,
    headerRowCount,
    sortedStudents.length
  );

  await downloadWorkbook(workbook, generatedFilename);
}

function createHeaderRows(worksheet: ExcelJS.Worksheet, count: number): void {
  for (let r = 0; r < count; r++) worksheet.addRow([]).height = r === 3 ? 90 : 25;
}

function mergeClassInfoCell(worksheet: ExcelJS.Worksheet, classInfoNode: HeaderNode | undefined, headerRowCount: number): void {
  worksheet.mergeCells(1, 1, headerRowCount, 3);
  worksheet.getCell(1, 1).value = classInfoNode?.title || "";
}

function addSeparatorRow(worksheet: ExcelJS.Worksheet): void {
  worksheet.addRow([]).height = 12;
}

function addMaxScoreRow(worksheet: ExcelJS.Worksheet, leaves: HeaderNode[], maxScores: Record<string, number>, leafMap: Map<string, number>, rowIndex: number): void {
  worksheet.addRow(buildMaxScoreRow(leaves, maxScores, leafMap, rowIndex)).height = 25;
}

function addStudentRows(worksheet: ExcelJS.Worksheet, students: Student[], leaves: HeaderNode[], scoresMap: Record<number, Record<string, number>>, computedMap: Record<number, Record<string, number>>, leafMap: Map<string, number>, dataStartRow: number, maxScoreRow: number): void {
  students.forEach((student, i) => worksheet.addRow(buildStudentRow(student, leaves, scoresMap, computedMap, dataStartRow + i + 1, leafMap, maxScoreRow)));
}

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function buildHeaders(
  nodes: HeaderNode[],
  worksheet: ExcelJS.Worksheet,
  matrix: NodeMatrix,
  maxDepth: number,
  depth: number,
  startCol: number,
  headerRowCount: number
): number {
  let col = startCol;

  nodes.forEach((node) => {
    if (node.type === "h-separator") return;

    const leaves = countLeaves(node);
    const isLeaf = node.children.length === 0;
    const isComputedRoot = node.title === "Computed Final Grade" && depth === 0;

    const cell = worksheet.getCell(depth + 1, col);
    cell.value = node.title || "";
    matrix[depth][col - 1] = node;

    if (isLeaf) {
      for (let r = depth + 1; r < headerRowCount; r++) {
        matrix[r][col - 1] = node;
      }
      worksheet.mergeCells(depth + 1, col, headerRowCount, col);
      col++;
      return;
    }

    if (isComputedRoot) {
      if (leaves > 1) {
        worksheet.mergeCells(depth + 1, col, 3, col + leaves - 1);
      }
      for (let i = 1; i < leaves; i++) {
        matrix[depth][col - 1 + i] = node;
      }
      for (let r = 1; r <= 2; r++) {
        for (let i = 0; i < leaves; i++) {
          matrix[r][col - 1 + i] = node;
        }
      }
      col = buildHeaders(
        node.children,
        worksheet,
        matrix,
        maxDepth,
        3,
        col,
        headerRowCount
      );
      return;
    }

    if (leaves > 1) {
      worksheet.mergeCells(depth + 1, col, depth + 1, col + leaves - 1);
    }
    for (let i = 1; i < leaves; i++) {
      matrix[depth][col - 1 + i] = node;
    }
    col = buildHeaders(
      node.children,
      worksheet,
      matrix,
      maxDepth,
      depth + 1,
      col,
      headerRowCount
    );
  });

  return col;
}

function collectLeafNodes(nodes: HeaderNode[]): HeaderNode[] {
  return nodes.reduce((result: HeaderNode[], n) => {
    if (n.type === "h-separator") return result;
    return n.children.length === 0 ? [...result, n] : [...result, ...collectLeafNodes(n.children)];
  }, []);
}

function buildParentMap(nodes: HeaderNode[], parent: HeaderNode | null = null, map: Map<HeaderNode, HeaderNode | null> = new Map()): Map<HeaderNode, HeaderNode | null> {
  nodes.forEach((n) => {
    if (n.type === "h-separator") return;
    n.children.length === 0 ? map.set(n, parent) : buildParentMap(n.children, n, map);
  });
  return map;
}

function buildLeafMap(leaves: HeaderNode[]): Map<string, number> {
  const map = new Map<string, number>();
  leaves.forEach((leaf, index) => { if (leaf.key) map.set(leaf.key, index + 4); });
  return map;
}

function buildMaxScoreRow(leaves: HeaderNode[], maxScores: Record<string, number>, leafMap: Map<string, number>, maxScoreRow: number): unknown[] {
  return ["No.", "Student ID", "Student Name", ...leaves.map((leaf) => getMaxDisplayValue(leaf, maxScores, leafMap, maxScoreRow))];
}

function getMaxDisplayValue(leaf: HeaderNode, maxScores: Record<string, number>, leafMap: Map<string, number>, maxScoreRow: number): unknown {
  const key = leaf.key || "";
  const displayMap: Record<string, unknown> = { assignment: key ? maxScores[key] ?? 0 : "", percentage: 1, weightedAverage: 1, gradePoint: GRADE_SCALE[0], totalGradePoint: GRADE_SCALE[0], roundedGrade: GRADE_SCALE[0] };
  if (leaf.calculationType && leaf.calculationType in displayMap) return displayMap[leaf.calculationType];
  if (leaf.calculationType === "sum" && leaf.groupKeys?.length) return { formula: generateSumFormula(maxScoreRow, leaf.groupKeys, leafMap) };
  if (leaf.calculationType === "computed") {
    if (key.includes("desc")) return getDesc(GRADE_SCALE[0]);
    if (key.includes("remarks")) return "";
    return GRADE_SCALE[0];
  }
  return "";
}

function sortStudents(students: Student[]): Student[] {
  return [...students].sort((a, b) => {
    const nameA = a.student_name?.toLowerCase() || "";
    const nameB = b.student_name?.toLowerCase() || "";
    return !nameA && nameB ? 1 : nameA && !nameB ? -1 : nameA.localeCompare(nameB);
  });
}

function buildStudentRow(
  student: Student,
  leaves: HeaderNode[],
  scoresMap: Record<number, Record<string, number>>,
  computedMap: Record<number, Record<string, number>>,
  rowIndex: number,
  leafMap: Map<string, number>,
  maxScoreRow: number
): unknown[] {
  const scores = scoresMap[student.student_id] || {};
  const computed = computedMap[student.student_id] || {};
  const studentNumber = rowIndex - maxScoreRow;
  const row: unknown[] = [studentNumber, student.id_number || "", student.student_name || ""];
  const isEmptyStudent = !student.id_number && !student.student_name;

  if (isEmptyStudent) {
    return [...row, ...Array(leaves.length).fill("")];
  }

  leaves.forEach((leaf) => {
    const key = leaf.key || "";

    if (!key || leaf.type === "v-separator" || leaf.type === "spacer") {
      row.push("");
      return;
    }

    if (leaf.calculationType === "assignment") {
      row.push(scores[key] !== undefined ? scores[key] : 0);
      return;
    }

    if (leaf.calculationType === "computed" && key.includes("remarks")) {
      row.push(student.remarks || "");
      return;
    }

    if (leaf.calculationType === "sum" && leaf.groupKeys) {
      row.push({ formula: generateSumFormula(rowIndex, leaf.groupKeys, leafMap) });
      return;
    }

    if (leaf.calculationType === "percentage" && leaf.groupKeys) {
      row.push({
        formula: generatePercentageFormula(rowIndex, leaf.groupKeys, leafMap, maxScoreRow),
      });
      return;
    }

    if (
      (leaf.calculationType === "weightedAverage" ||
        leaf.calculationType === "totalGradePoint") &&
      leaf.dependsOn &&
      leaf.weights
    ) {
      row.push({
        formula: generateWeightedAverageFormula(
          rowIndex,
          leaf.dependsOn,
          leaf.weights,
          leafMap
        ),
      });
      return;
    }

    if (leaf.calculationType === "gradePoint" && leaf.dependsOn?.length) {
      row.push({ formula: generateGradePointFormula(rowIndex, leaf.dependsOn, leafMap) });
      return;
    }

    if (leaf.calculationType === "roundedGrade" && leaf.dependsOn?.length) {
      row.push({
        formula: generateRoundedGradeFormula(rowIndex, leaf.dependsOn, leafMap),
      });
      return;
    }

    if (leaf.calculationType === "computed" && key) {
      row.push({ formula: generateComputedFormula(rowIndex, key, leafMap) });
      return;
    }

    const value = computed[key] ?? scores[key];
    if (value === undefined) {
      row.push(0);
    } else if (
      leaf.calculationType === "percentage" ||
      leaf.calculationType === "weightedAverage"
    ) {
      row.push(value / 100);
    } else {
      row.push(value);
    }
  });

  return row;
}

function setColumnWidths(worksheet: ExcelJS.Worksheet, leaves: HeaderNode[], parentMap: Map<HeaderNode, HeaderNode | null>): void {
  worksheet.getColumn(1).width = 6;
  worksheet.getColumn(2).width = 12;
  worksheet.getColumn(3).width = 25;
  leaves.forEach((leaf, i) => {
    const parent = parentMap.get(leaf);
    worksheet.getColumn(i + 4).width = parent?.title === "Computed Final Grade" ? 12 : parent && parent.children.length > 0 ? 8 : 12;
  });
}

function styleSheet(
  worksheet: ExcelJS.Worksheet,
  totalRows: number,
  leaves: HeaderNode[],
  matrix: NodeMatrix,
  parentMap: Map<HeaderNode, HeaderNode | null>,
  classInfoNode: HeaderNode | undefined,
  headerRowCount: number
): void {
  const totalCols = leaves.length + 3;
  const separatorRowIndex = headerRowCount + 1;
  const maxScoreRowIndex = headerRowCount + 2;

  const { darkCols, whiteCols } = extractSeparatorColumns(matrix, headerRowCount, totalCols);

  darkCols.forEach((c) => {
    worksheet.getColumn(c).width = 2;
  });

  for (let r = 1; r <= totalRows; r++) {
    for (let c = 1; c <= totalCols; c++) {
      const cell = worksheet.getCell(r, c);

      if (r <= headerRowCount) {
        applyHeaderStyle(
          cell,
          r,
          c,
          matrix,
          parentMap,
          classInfoNode,
          darkCols,
          whiteCols,
          headerRowCount
        );
      } else if (r === separatorRowIndex) {
        applySeparatorStyle(cell);
      } else if (r === maxScoreRowIndex) {
        applyMaxScoreStyle(cell, c, leaves, darkCols, whiteCols);
      } else {
        applyDataRowStyle(cell, c, leaves, darkCols, whiteCols);
      }

      applyCommonCellStyle(cell);
    }
  }
}

function extractSeparatorColumns(matrix: NodeMatrix, headerRowCount: number, totalCols: number): { darkCols: Set<number>; whiteCols: Set<number> } {
  const darkCols = new Set<number>();
  const whiteCols = new Set<number>();
  for (let r = 0; r < headerRowCount; r++) {
    for (let c = 0; c < totalCols; c++) {
      const node = matrix[r][c];
      if (node?.type === "v-separator") darkCols.add(c + 1);
      if (node?.type === "spacer") whiteCols.add(c + 1);
    }
  }
  return { darkCols, whiteCols };
}

function applyHeaderStyle(
  cell: ExcelJS.Cell,
  r: number,
  c: number,
  matrix: NodeMatrix,
  parentMap: Map<HeaderNode, HeaderNode | null>,
  classInfoNode: HeaderNode | undefined,
  darkCols: Set<number>,
  whiteCols: Set<number>,
  headerRowCount: number
): void {
  let fill = createFill(COLORS.WHITE);
  let fontColor: string | undefined;
  let textRotation: number | undefined;
  let horizontal: "left" | "center" = "center";
  let vAlign: "top" | "middle" | "bottom" = "middle";

  if (c <= 3) {
    fill = mapHeaderClassToColor(getHeaderClass(classInfoNode!));
    horizontal = "left";
    if (classInfoNode?.nodeType === "computed") {
      fontColor = COLORS.WHITE;
    }
  } else if (darkCols.has(c)) {
    fill = createFill(COLORS.BLUE);
    fontColor = COLORS.WHITE;
  } else if (whiteCols.has(c)) {
    fill = createFill(COLORS.WHITE);
  } else {
    const node = matrix[r - 1][c - 1];
    if (node) {
      fill = mapHeaderClassToColor(getHeaderClass(node));
      if (node.nodeType === "computed") fontColor = COLORS.WHITE;
      if (r === headerRowCount) {
        const parent = parentMap.get(node);
        if (!(parent && parent.title === "Computed Final Grade")) {
          textRotation = 90;
          vAlign = "bottom";
        }
      }
    }
  }

  cell.fill = fill;
  cell.font = { bold: true, size: 10, color: fontColor ? { argb: fontColor } : undefined };
  cell.alignment = { horizontal, vertical: vAlign, wrapText: true, textRotation };
}

function applySeparatorStyle(cell: ExcelJS.Cell): void {
  cell.fill = createFill(COLORS.BLUE);
  cell.font = { bold: false, size: 10, color: { argb: COLORS.WHITE } };
  cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
}

function applyMaxScoreStyle(
  cell: ExcelJS.Cell,
  c: number,
  leaves: HeaderNode[],
  darkCols: Set<number>,
  whiteCols: Set<number>
): void {
  let fill = createFill(COLORS.WHITE);
  let fontColor: string = COLORS.BLUE;

  if (darkCols.has(c)) {
    fill = createFill(COLORS.BLUE);
    fontColor = COLORS.WHITE;
  } else if (whiteCols.has(c)) {
    fill = createFill(COLORS.WHITE);
  } else if (c >= 4) {
    const leaf = leaves[c - 4];
    if (
      leaf &&
      (leaf.calculationType === "roundedGrade" || leaf.calculationType === "gradePoint")
    ) {
      const bgClass = getCalculatedBg(leaf.calculationType);
      fill = bgClass ? mapBgClassToColor(bgClass) : createFill(COLORS.WHITE);
    }

    if (leaf) {
      const numFmt = getNumberFormat(leaf);
      if (numFmt) cell.numFmt = numFmt;
      const cellValue = cell.value;
      const numValue = typeof cellValue === "number" ? cellValue : undefined;
      const color = getCellFontColor(numValue, leaf, true);
      if (color) fontColor = color;
    }
  }

  cell.fill = fill;
  cell.font = { bold: true, size: 10, color: { argb: fontColor } };
  cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
}

function applyDataRowStyle(
  cell: ExcelJS.Cell,
  c: number,
  leaves: HeaderNode[],
  darkCols: Set<number>,
  whiteCols: Set<number>
): void {
  let fill = createFill(COLORS.WHITE);
  let fontColor: string | undefined;
  let horizontal: "left" | "center" = "center";
  let bold = false;

  if (c < 4) {
    horizontal = c === 1 || c === 2 ? "center" : "left";
  } else if (darkCols.has(c)) {
    fill = createFill(COLORS.BLUE);
    fontColor = COLORS.WHITE;
  } else if (whiteCols.has(c)) {
    fill = createFill(COLORS.WHITE);
  } else {
    const leaf = leaves[c - 4];
    if (leaf) {
      const bg = getCalculatedBg(leaf.calculationType);
      fill = bg ? mapBgClassToColor(bg) : createFill(COLORS.WHITE);

      const numFmt = getNumberFormat(leaf);
      if (numFmt) cell.numFmt = numFmt;

      const cellValue = cell.value;
      const numValue =
        typeof cellValue === "number"
          ? cellValue
          : typeof cellValue === "object" && cellValue && "result" in cellValue
          ? (cellValue as any).result
          : undefined;
      fontColor = getCellFontColor(numValue, leaf, false);

      const isCalculationColumn =
        leaf.calculationType === "sum" ||
        leaf.calculationType === "percentage" ||
        leaf.calculationType === "weightedAverage" ||
        leaf.calculationType === "gradePoint" ||
        leaf.calculationType === "totalGradePoint" ||
        leaf.calculationType === "roundedGrade" ||
        leaf.calculationType === "computed";

      if (isCalculationColumn) {
        bold = true;
      }
    }
  }

  cell.fill = fill;
  cell.font = { bold, size: 10, color: fontColor ? { argb: fontColor } : undefined };
  cell.alignment = { horizontal, vertical: "middle", wrapText: true };
}

function applyCommonCellStyle(cell: ExcelJS.Cell): void {
  const border = { style: "thin" as const, color: { argb: COLORS.BLACK } };
  cell.border = { top: border, left: border, bottom: border, right: border };
}

function createFill(color: string): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb: color } };
}

function getNumberFormat(leaf: HeaderNode): string | undefined {
  const key = leaf.key || "";
  const formatMap: Record<string, string> = { assignment: "0", sum: "0", roundedGrade: "0.00", percentage: "0%", weightedAverage: "0%", gradePoint: "0.000", totalGradePoint: "0.000" };
  if (leaf.calculationType && leaf.calculationType in formatMap) return formatMap[leaf.calculationType];
  if (leaf.calculationType === "computed" && (key.includes("weighted") || key.includes("for-removal") || key.includes("after-removal"))) return "0.00";
  return undefined;
}

function getCellFontColor(value: number | undefined, leaf: HeaderNode, isMaxScoreRow: boolean = false): string | undefined {
  if (leaf.calculationType === "assignment" && !isMaxScoreRow) return COLORS.BLACK;
  const key = leaf.key || "";
  const isFailingGrade = leaf.calculationType === "gradePoint" || leaf.calculationType === "totalGradePoint" || leaf.calculationType === "roundedGrade" || (leaf.calculationType === "computed" && (key.includes("weighted") || key.includes("for-removal") || key.includes("after-removal")));
  if (isFailingGrade && typeof value === "number" && !isNaN(value) && value > 3.0) return COLORS.RED;
  return COLORS.BLUE;
}

function mapHeaderClassToColor(classString: string | undefined): ExcelJS.Fill {
  if (!classString) return createFill(COLORS.WHITE);
  return mapBgClassToColor(classString.split(/\s+/).find((c) => c.startsWith("bg-")) || "bg-transparent");
}

function mapBgClassToColor(bgClass: string): ExcelJS.Fill {
  return createFill(COLOR_MAP[bgClass] || COLORS.WHITE);
}