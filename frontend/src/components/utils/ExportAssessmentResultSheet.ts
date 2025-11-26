import ExcelJS from "exceljs";
import type { AssessmentPageData } from "../../types/assessmentPageTypes";

const COLORS = { BLACK: "FF000000", COA_BLUE: "FF1F3864", COA_RED: "FF9C0006", COA_YELLOW: "FFFCF305", BORDER_GRAY: "FF808080" } as const;
const BLOOM_ORDER = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
const WIDTHS = { NO: 5, STUDENT_ID: 12, NAME: 25, EMPTY: 2, ASSESSMENT: 11 } as const;
const HEIGHTS = { CLASS_INFO: 20, PO: 20, REMARKS: 20, BLOOMS: 30, CLASSWORK_NAMES: 80 } as const;

interface ExpandedCW { name: string; blooms: string; coIndex: number; }
interface FilteredCO { name: string; classwork: any[]; clustered: ExpandedCW[]; }
interface FilteredPO { name: string; cos: FilteredCO[]; }

const bloomRank = (bloom: string) => BLOOM_ORDER.indexOf(bloom) ?? BLOOM_ORDER.length;
const normalizeBlooms = (blooms: string[]) => [...blooms].sort((a, b) => bloomRank(a) - bloomRank(b)).join("/");

const clusterBlooms = (items: ExpandedCW[]) => items.length ? [...items].sort((a, b) => {
  const getRanks = (blooms: string) => blooms.split("/").map(bloomRank);
  const [aRanks, bRanks] = [getRanks(a.blooms), getRanks(b.blooms)];
  for (let i = 0; i < Math.min(aRanks.length, bRanks.length); i++) {
    if (aRanks[i] !== bRanks[i]) return aRanks[i] - bRanks[i];
  }
  return aRanks.length - bRanks.length;
}) : [];

const groupBloomsBySequence = (clustered: ExpandedCW[]) => {
  const items = clustered.length ? clustered : [{ name: "", blooms: "", coIndex: -1 }];
  return items.reduce((acc, item) => {
    acc.length && acc[acc.length - 1].bloom === item.blooms ? acc[acc.length - 1].count++ : acc.push({ bloom: item.blooms, count: 1 });
    return acc;
  }, [] as { bloom: string; count: number }[]);
};

const extractPOShortName = (poName: string) => poName.match(/^([a-zA-Z])\s*-\s*/) ? `PO-${poName.match(/^([a-zA-Z])\s*-\s*/)![1]}` : poName;

const formatCOLabel = (coName: string, counter: number) => {
  const coNumbers = coName.match(/CO\d+/gi)?.map(m => m.toUpperCase()).join(" & ") ?? `CO${counter}`;
  const typeMatch = coName.match(/\((Lecture|Laboratory)\)/i);
  return typeMatch ? `${coNumbers} (${typeMatch[1]})` : coNumbers;
};

const countClasswork = (co: FilteredCO) => co.classwork.length + 3;

const generateFilename = (classInfo: AssessmentPageData["classInfo"]) => {
  const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, "");
  const parts = [sanitize(classInfo.department), sanitize(classInfo.subject), sanitize(classInfo.yearSection), "COA"].filter(Boolean);
  return parts.length > 1 ? `${parts.join("_")}.xlsx` : `Assessment_Result_Sheet_${new Date().toISOString().split("T")[0]}.xlsx`;
};

const setCellValue = (ws: ExcelJS.Worksheet, row: number, col: number, value: any, opts: { alignment?: Partial<ExcelJS.Alignment>; font?: Partial<ExcelJS.Font>; fill?: ExcelJS.Fill } = {}) => {
  const cell = ws.getCell(row, col);
  cell.value = value;
  if (opts.alignment) cell.alignment = { vertical: "middle", horizontal: "center", ...opts.alignment };
  if (opts.font) cell.font = opts.font;
  if (opts.fill) cell.fill = opts.fill;
  const borderStyle = { style: "thin" as const, color: { argb: COLORS.BORDER_GRAY } };
  cell.border = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };
  return cell;
};

const filterPOs = (pos: AssessmentPageData["pos"]): FilteredPO[] => pos.map(po => {
  const filteredCOs = po.cos.map(co => {
    const validClasswork = co.classwork?.filter(cw => cw?.maxScore != null) ?? [];
    if (!validClasswork.length) return null;
    const expanded = validClasswork.map((cw, idx) => ({ name: cw.name, blooms: normalizeBlooms(cw.blooms), coIndex: idx }));
    return { ...co, classwork: validClasswork, clustered: clusterBlooms(expanded) };
  }).filter((co): co is FilteredCO => co != null);
  return filteredCOs.length ? { ...po, cos: filteredCOs } : null;
}).filter((po): po is FilteredPO => po != null);

const createClassInfoRows = (ws: ExcelJS.Worksheet, ci: AssessmentPageData["classInfo"], totalCols: number, startRow: number) => {
  [["Campus/College/Department:", ci.cacode], ["Program:", ci.program], ["Course:", ci.course], ["AY/Semester:", ci.aySemester], ["Faculty:", ci.faculty]].forEach(([label, value], i) => {
    const row = startRow + i;
    ws.mergeCells(row, 1, row, 3);
    setCellValue(ws, row, 1, label, { alignment: { horizontal: "left" }, font: { bold: true } });
    ws.mergeCells(row, 4, row, totalCols);
    setCellValue(ws, row, 4, value, { alignment: { horizontal: "left", wrapText: true } });
    ws.getRow(row).height = HEIGHTS.CLASS_INFO;
  });
  return startRow + 5;
};

const createTitleRow = (ws: ExcelJS.Worksheet, totalCols: number, row: number) => {
  ws.mergeCells(row, 1, row, totalCols);
  setCellValue(ws, row, 1, "Assessment Result Sheet", { font: { bold: true } });
  return row + 1;
};

const createPOHeaderRow = (ws: ExcelJS.Worksheet, filteredPOs: FilteredPO[], studentCount: number, row: number) => {
  ws.mergeCells(row, 1, row, 3);
  setCellValue(ws, row, 1, "Result Status: (Completed or Not)", { alignment: { horizontal: "left" }, font: { bold: true } });
  ws.mergeCells(row, 4, row + 4 + studentCount, 4);
  setCellValue(ws, row, 4, "", {});
  let col = 5;
  filteredPOs.forEach(po => {
    const span = po.cos.reduce((s, co) => s + countClasswork(co), 0);
    ws.mergeCells(row, col, row, col + span - 1);
    setCellValue(ws, row, col, extractPOShortName(po.name), { alignment: { wrapText: true } });
    col += span;
  });
  ws.getRow(row).height = HEIGHTS.PO;
  return row + 1;
};

const createCOHeaderRow = (ws: ExcelJS.Worksheet, filteredPOs: FilteredPO[], row: number) => {
  ws.mergeCells(row, 1, row + 2, 3);
  setCellValue(ws, row, 1, "Remarks:", { alignment: { vertical: "top", horizontal: "left" }, font: { bold: true } });
  let col = 5, coCounter = 1;
  filteredPOs.forEach(po => po.cos.forEach(co => {
    const span = countClasswork(co);
    ws.mergeCells(row, col, row, col + span - 1);
    setCellValue(ws, row, col, formatCOLabel(co.name, coCounter++), { alignment: { wrapText: true }, font: { bold: true, color: { argb: COLORS.COA_RED } }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.COA_YELLOW } } });
    col += span;
  }));
  ws.getRow(row).height = HEIGHTS.REMARKS;
  return row + 1;
};

const createBloomsRow = (ws: ExcelJS.Worksheet, filteredPOs: FilteredPO[], row: number) => {
  let col = 5;
  filteredPOs.forEach(po => po.cos.forEach(co => {
    groupBloomsBySequence(co.clustered).forEach(g => {
      ws.mergeCells(row, col, row, col + g.count - 1);
      setCellValue(ws, row, col, g.bloom.replace(/\//g, "/\n"), { alignment: { wrapText: true }, font: { size: 10 } });
      col += g.count;
    });
    ws.mergeCells(row, col, row, col + 2);
    setCellValue(ws, row, col, "KPI\n(passed the assessment)", { alignment: { wrapText: true }, font: { size: 10, bold: true } });
    col += 3;
  }));
  ws.getRow(row).height = HEIGHTS.BLOOMS;
  return row + 1;
};

const createClassworkNamesRow = (ws: ExcelJS.Worksheet, filteredPOs: FilteredPO[], row: number) => {
  let col = 5;
  filteredPOs.forEach(po => po.cos.forEach(co => {
    co.clustered.forEach(cw => setCellValue(ws, row, col++, cw.name, { alignment: { vertical: "bottom", wrapText: true, textRotation: 90 }, font: { size: 9, bold: true } }));
    ["Total", "Passing (70%)", "Passing (80%)"].forEach(label => setCellValue(ws, row, col++, label, { alignment: { vertical: "bottom", wrapText: true }, font: { size: 10, bold: true } }));
  }));
  ws.getRow(row).height = HEIGHTS.CLASSWORK_NAMES;
  return row + 1;
};

const createHeaderAndMaxScoresRow = (ws: ExcelJS.Worksheet, filteredPOs: FilteredPO[], coTotals: { totalMax: number; pass70: number; pass80Count: number }[], row: number) => {
  [{ label: "No.", alignment: "left" as const }, { label: "Student ID", alignment: "left" as const }, { label: "Name", alignment: "left" as const }].forEach(({ label, alignment }, i) => 
    setCellValue(ws, row, i + 1, label, { alignment: { horizontal: alignment }, font: { bold: true } })
  );
  let col = 5, coIndex = 0;
  filteredPOs.forEach(po => po.cos.forEach(co => {
    const { totalMax, pass70, pass80Count } = coTotals[coIndex++];
    co.clustered.forEach(cw => setCellValue(ws, row, col++, co.classwork[cw.coIndex]?.maxScore ?? "", { alignment: { horizontal: "center" }, font: { bold: true, color: { argb: COLORS.COA_BLUE } } }));
    [totalMax, pass70, pass80Count].forEach(value => setCellValue(ws, row, col++, value, { alignment: { horizontal: "center" }, font: { bold: true, color: { argb: COLORS.COA_BLUE } } }));
  }));
  return row + 1;
};

const createStudentRows = (ws: ExcelJS.Worksheet, students: AssessmentPageData["students"], filteredPOs: FilteredPO[], coTotals: { totalMax: number; pass70: number; pass80Count: number }[], startRow: number) => {
  students.forEach((student, sIdx) => {
    const currentRow = startRow + sIdx;
    setCellValue(ws, currentRow, 1, sIdx + 1, { alignment: { horizontal: "left" } });
    setCellValue(ws, currentRow, 2, student.id, { alignment: { horizontal: "left" } });
    setCellValue(ws, currentRow, 3, student.name, { alignment: { horizontal: "left" } });
    let col = 5, coIndex = 0;
    filteredPOs.forEach(po => po.cos.forEach(co => {
      const studentScores = student.scores[co.name] ?? [];
      const { pass70: pass70Threshold, pass80Count } = coTotals[coIndex++];
      co.clustered.forEach(cw => setCellValue(ws, currentRow, col++, studentScores[cw.coIndex]?.raw ?? 0, { alignment: { horizontal: "center" } }));
      if (studentScores.length) {
        const studentTotal = studentScores.reduce((sum, sc) => sum + (sc?.raw ?? 0), 0);
        const pass70 = studentTotal >= pass70Threshold;
        setCellValue(ws, currentRow, col++, studentTotal, { alignment: { horizontal: "center" }, font: { bold: true, color: { argb: COLORS.COA_BLUE } } });
        setCellValue(ws, currentRow, col++, pass70 ? "YES" : "NO", { alignment: { horizontal: "center" }, font: { bold: true, color: { argb: pass70 ? COLORS.BLACK : COLORS.COA_RED } } });
        if (sIdx === 0) {
          const pass70Count = students.filter(s => (s.scores[co.name] ?? []).reduce((sum, sc) => sum + (sc?.raw ?? 0), 0) >= pass70Threshold).length;
          ws.mergeCells(currentRow, col, currentRow + students.length - 1, col);
          setCellValue(ws, currentRow, col, pass70Count >= pass80Count ? "YES" : "NO", { alignment: { horizontal: "center" }, font: { bold: true, color: { argb: pass70Count >= pass80Count ? COLORS.BLACK : COLORS.COA_RED } } });
        }
        col++;
      } else {
        [0, 1].forEach(() => setCellValue(ws, currentRow, col++, "", {}));
        if (sIdx === 0) {
          ws.mergeCells(currentRow, col, currentRow + students.length - 1, col);
          setCellValue(ws, currentRow, col, "", {});
        }
        col++;
      }
    }));
  });
  return startRow + students.length;
};

const setColumnWidths = (ws: ExcelJS.Worksheet, totalCols: number) => {
  [WIDTHS.NO, WIDTHS.STUDENT_ID, WIDTHS.NAME, WIDTHS.EMPTY].forEach((width, i) => ws.getColumn(i + 1).width = width);
  for (let c = 5; c <= totalCols; c++) ws.getColumn(c).width = WIDTHS.ASSESSMENT;
};

const downloadWorkbook = async (workbook: ExcelJS.Workbook, filename: string) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export async function exportAssessmentResultSheet({ data }: { data: AssessmentPageData }) {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Assessment Result Sheet");
  const filteredPOs = filterPOs(data.pos || []);
  if (!filteredPOs.length) return await downloadWorkbook(workbook, generateFilename(data.classInfo));
  const students = data.students || [];
  const coTotals = filteredPOs.flatMap(po => po.cos.map(co => ({
    totalMax: co.classwork.reduce((s, cw) => s + (cw.maxScore ?? 0), 0),
    pass70: Math.round(co.classwork.reduce((s, cw) => s + (cw.maxScore ?? 0), 0) * 0.7),
    pass80Count: Math.ceil(students.length * 0.8),
  })));
  const totalColumns = 4 + filteredPOs.reduce((sum, po) => sum + po.cos.reduce((s, co) => s + countClasswork(co), 0), 0);
  let row = 1;
  row = createClassInfoRows(ws, data.classInfo, totalColumns, row);
  row = createTitleRow(ws, totalColumns, row);
  row = createPOHeaderRow(ws, filteredPOs, students.length, row);
  row = createCOHeaderRow(ws, filteredPOs, row);
  row = createBloomsRow(ws, filteredPOs, row);
  row = createClassworkNamesRow(ws, filteredPOs, row);
  row = createHeaderAndMaxScoresRow(ws, filteredPOs, coTotals, row);
  createStudentRows(ws, students, filteredPOs, coTotals, row);
  setColumnWidths(ws, totalColumns);
  await downloadWorkbook(workbook, generateFilename(data.classInfo));
}