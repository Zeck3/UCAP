// ClassRecordGrid.tsx
import React, {
  useMemo,
  useCallback,
  useRef,
  useState,
  useLayoutEffect,
  memo,
} from "react";

/** =========================
 * Types
 * ========================= */
type Term = "Midterm" | "Final";


type LeafKind =
  | "assessment"     // editable per-assessment raw score
  | "max"            // displays max score for that assessment
  | "total"          // total of assessments in a group
  | "aggregate"      // e.g., CPA, QA, PIT %, MGA, Grade Points
  | "computed"       // e.g., Midterm Grade, Final Period Grade, MTG/FTG combos
  | "static"         // blank/labels
  | "separator"      // vertical separator
  | "space";         // blank spacer column

type HeaderCell = {
  key: string;
  text: string;
  row: number;      // 1-based
  col: number;      // 1-based
  rowSpan: number;
  colSpan: number;
  kind: "static" | "data";
};

type Student = {
  student_id: number;
  student_no: string;
  name: string; // combine LN, FN as needed
};

type ScoreKey = string; // `${student_id}::${leafKey}`

type LeafColumn = {
  key: string;          // unique
  headerText: string;   // leaf label
  termBand?: string;    // "Midterm" | "Final" | "—"
  unitBand?: string;    // "Lecture(70%)" etc
  compBand?: string;    // "SRC (20%)" etc
  kind: LeafKind;
  readOnly?: boolean;
  width?: number;       // px
};

type GridSpec = {
  headerCells: HeaderCell[];
  leafColumns: LeafColumn[]; // ordered left→right
  headerRows: number;
  frozenCols: { key: string; label: string; width: number }[];
  gridWidths: number[];      // full list: frozen + dynamic
};

type Scores = Record<ScoreKey, number>;

/** =========================
 * Immutable score set
 * ========================= */
const setScore = (
  scores: Scores,
  student_id: number,
  leafKey: string,
  v: number
): Scores => {
  const k = `${student_id}::${leafKey}`;
  if (scores[k] === v) return scores;
  return { ...scores, [k]: v };
};

/** =========================
 * Virtual rows
 * ========================= */
const useVirtualRows = (rowCount: number, rowHeight = 40, overscan = 8) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportH, setViewportH] = useState(600);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    const ro = new ResizeObserver(() => setViewportH(el.clientHeight));
    el.addEventListener("scroll", onScroll, { passive: true });
    ro.observe(el);
    setViewportH(el.clientHeight);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visible = Math.ceil(viewportH / rowHeight) + overscan * 2;
  const end = Math.min(rowCount, start + visible);
  const offsetY = start * rowHeight;
  const totalH = rowCount * rowHeight;

  return { scrollRef, start, end, offsetY, totalH, rowHeight };
};

/** =========================
 * CONFIG → GRID SPEC
 * Matches your format exactly.
 * ========================= */
type BandPercent = { label: string; percent: number }; // e.g., {label: "Lecture", percent: 70}
type ComponentDef = {
  id: string;                    // "SRC","SRQ","M","PIT","MGA","Mid Lec Grade Point", ...
  label: string;                 // display
  percent?: number;              // shown in header "({}%)" when present
  assessments: number;           // x number of assessments (use 1 for single)
  groupTotals?: { label: string }[]; // e.g., [{label:"Total Scores (SRC)"}]
  aggregates?: { label: string }[];  // e.g., [{label:"CPA"}]
  kindOverride?: LeafKind;       // for single columns like M, MGA, Grade Points
};

type TermUnitBlock = {
  unit: BandPercent;             // Lecture or Laboratory with percent
  components: ComponentDef[];
};

type TermBlockInput = {
  term: Term;                    // Midterm | Final
  units: TermUnitBlock[];
};

type BuildInput = {
  departmentName: string;
  courseTitle: string;
  yearAndSection: string;
  // Midterm then Final sections
  termBlocks: TermBlockInput[];
  // “space dedicated to final term” and separators
  includeFinalSpacer: boolean;
  // Rightmost computed grades section
  rightGradeColumns: {
    // MTG/FTG combined
    halfHalf: { main: string; forRemoval: string; afterRemoval: string; desc: string };
    oneThirdTwoThirds: { main: string; forRemoval: string; afterRemoval: string; desc: string };
  };
};

function buildGridSpec(input: BuildInput): GridSpec {
  // Frozen columns: No., Student ID, Name, plus a narrow one-cell column as in your header row after “Year and Section”
  const frozenCols = [
    { key: "no", label: "No.", width: 60 },
    { key: "student_id", label: "Student ID", width: 140 },
    { key: "name", label: "Name", width: 220 },
  ];

  // Header rows:
  // 1: |[//one cell]|[//one cell]|{course_term_type}|[//one cell]|[//space dedicated to final term]|[//one cell]|[//one cell]
  // 2: Department… | … | {course_unit_type(%) } | … | Midterm | … | Computed Final Grade
  // 3: Subject…    | … | {course_component_type(%) } repeated…
  // 4: Year & Section … + many leaf labels row for “assessment title”, totals, aggregates, etc.
  // 5: Button row aligned to assessments (“[//assessment info button…]”)
  const headerRows = 5;

  const headerCells: HeaderCell[] = [];
  let col = 1;

  // Frozen span across all header rows
  frozenCols.forEach((fc) => {
    headerCells.push({
      key: `frozen-${fc.key}`,
      text: fc.label,
      row: 1,
      col,
      rowSpan: headerRows,
      colSpan: 1,
      kind: "static",
    });
    col += 1;
  });

  // Helper to append a leaf column
  const leafColumns: LeafColumn[] = [];
  const pushLeaf = (leaf: LeafColumn) => {
    leafColumns.push(leaf);
    const w = leaf.width ?? defaultWidth(leaf);
    gridWidths.push(w);
    return w;
  };

  // Keep width array. Start with frozen widths
  const gridWidths: number[] = [...frozenCols.map((f) => f.width)];

  const baseCol = col;

  // Row 1 “course_term_type” band across all academic columns
  // We will compute spans after building leaves. For now, track term band ranges.
  type BandRange = { startCol: number; endCol: number };
  const r1TermBand: BandRange = { startCol: baseCol, endCol: baseCol }; // fill later

  // Row 2: Department, Midterm label, Computed Final Grade label columns will be placed with proper spans later.

  // Build dynamic structure for both terms
  // Also insert your "[//separator]" and "[//space dedicated to final term]" columns.
  // Define special helpers:
  const addSeparator = (labelKey: string) => {
    headerCells.push({
      key: `sep-${labelKey}`,
      text: "",
      row: 1,
      col,
      rowSpan: headerRows,
      colSpan: 1,
      kind: "static",
    });
    pushLeaf({ key: `sep-${labelKey}`, headerText: "", kind: "separator", readOnly: true, width: 8 });
    col += 1;
  };

  const addSpace = (labelKey: string) => {
    headerCells.push({
      key: `space-${labelKey}`,
      text: "",
      row: 1,
      col,
      rowSpan: headerRows,
      colSpan: 1,
      kind: "static",
    });
    pushLeaf({ key: `space-${labelKey}`, headerText: "", kind: "space", readOnly: true, width: 16 });
    col += 1;
  };

  // Row 2 group trackers
  const r2UnitBands: { key: string; start: number; end: number; text: string }[] = [];
  // Row 3 component bands
  const r3CompBands: { key: string; start: number; end: number; text: string }[] = [];

  // Utility to add a component block:
  const addComponentBlock = (
    term: Term,
    unit: BandPercent,
    comp: ComponentDef
  ) => {
    const compStart = col;

    // Assessments
    for (let i = 1; i <= comp.assessments; i++) {
      pushLeaf({
        key: `${term}-${unit.label}-${comp.id}-A${i}`,
        headerText: `${comp.label} ${i}`,
        termBand: term,
        unitBand: `${unit.label} (${unit.percent}%)`,
        compBand: comp.percent != null ? `${comp.label} (${comp.percent}%)` : comp.label,
        kind: "assessment",
      });
      col += 1;
    }

    // Totals
    (comp.groupTotals ?? []).forEach((t) => {
      pushLeaf({
        key: `${term}-${unit.label}-${comp.id}-TOTAL-${t.label}`,
        headerText: t.label,
        termBand: term,
        unitBand: `${unit.label} (${unit.percent}%)`,
        compBand: comp.percent != null ? `${comp.label} (${comp.percent}%)` : comp.label,
        kind: "total",
        readOnly: true,
      });
      col += 1;
    });

    // Aggregates
    (comp.aggregates ?? []).forEach((a) => {
      pushLeaf({
        key: `${term}-${unit.label}-${comp.id}-AGG-${a.label}`,
        headerText: a.label,
        termBand: term,
        unitBand: `${unit.label} (${unit.percent}%)`,
        compBand: comp.percent != null ? `${comp.label} (${comp.percent}%)` : comp.label,
        kind: "aggregate",
        readOnly: true,
      });
      col += 1;
    });

    // For single-column metrics like M, MGA, Grade Points
    if (comp.assessments === 0 && !comp.groupTotals?.length && !comp.aggregates?.length) {
      pushLeaf({
        key: `${term}-${unit.label}-${comp.id}`,
        headerText: comp.percent != null ? `${comp.label} (${comp.percent}%)` : comp.label,
        termBand: term,
        unitBand: `${unit.label} (${unit.percent}%)`,
        compBand: comp.percent != null ? `${comp.label} (${comp.percent}%)` : comp.label,
        kind: comp.kindOverride ?? "aggregate",
        readOnly: comp.kindOverride !== "assessment",
      });
      col += 1;
    }

    const compEnd = col - 1;
    r3CompBands.push({
      key: `${term}-${unit.label}-${comp.id}-BAND`,
      start: compStart,
      end: compEnd,
      text: comp.percent != null ? `${comp.label} (${comp.percent}%)` : comp.label,
    });
  };

  // Row 4 “Year and Section” cell spanning one column before a small separator column
  // Place now at baseCol
  headerCells.push({
    key: "yas",
    text: `Year and Section: `,
    row: 4,
    col: baseCol,
    rowSpan: 1,
    colSpan: 1,
    kind: "static",
  });
  pushLeaf({ key: "yas", headerText: "", kind: "static", readOnly: true, width: 220 });
  col += 1;

  // Row 1/2 top-left filler “[//one cell]” then separator after Y&S
  // Interpret your “[//one cell]” before and after as narrow blanks
  // Add the “[//separator]” after Y&S
  addSeparator("after-yas");

  // ---- MIDTERM BLOCK ----
  // Row 2: Midterm label centered across its span (fill after we know the end)
  const midStart = col;

  // Build Midterm units and components according to your rough spec
  const mid = input.termBlocks.find((t) => t.term === "Midterm");
  if (mid) {
    mid.units.forEach((u) => {
      const unitStart = col;

      // Components in your Midterm Lecture group:
      // 1) SRC [x], Total Scores (SRC), CPA
      // 2) SRQ [x], Total Scores (SRQ), QA
      // 3) M [single]
      // 4) PIT [x], Total Scores (PIT), PIT %
      // 5) MGA [single], Mid Lec Grade Point
      u.components.forEach((comp) => addComponentBlock("Midterm", u.unit, comp));

      const unitEnd = col - 1;
      r2UnitBands.push({
        key: `unit-Midterm-${u.unit.label}`,
        start: unitStart,
        end: Math.max(unitStart, unitEnd),
        text: `${u.unit.label} (${u.unit.percent}%)`,
      });
    });
  }

  // Mid-grade points and grades across midterm block tail
  const midTail = [
    { id: "Mid Grade Point", kind: "aggregate" as LeafKind },
    { id: "Midterm Grade", kind: "computed" as LeafKind },
  ];
  midTail.forEach((t) => {
    pushLeaf({
      key: `Midterm-TAIL-${t.id}`,
      headerText: t.id,
      termBand: "Midterm",
      kind: t.kind,
      readOnly: true,
    });
    col += 1;
  });

  const midEnd = col - 1;

  // Optional “[//space dedicated to final term]”
  if (input.includeFinalSpacer) addSpace("to-final");

  // ---- FINAL BLOCK ----
  // As per your note: “M to F, MGA to FGA, Mid to Fin”


  const fin = input.termBlocks.find((t) => t.term === "Final");
  if (fin) {
    fin.units.forEach((u) => {
      const unitStart = col;
      u.components.forEach((comp) => addComponentBlock("Final", u.unit, comp));
      const unitEnd = col - 1;
      r2UnitBands.push({
        key: `unit-Final-${u.unit.label}`,
        start: unitStart,
        end: Math.max(unitStart, unitEnd),
        text: `${u.unit.label} (${u.unit.percent}%)`,
      });
    });
  }

  const finTail = [
    { id: "Final Grade Point", kind: "aggregate" as LeafKind },
    { id: "Final Period Grade", kind: "computed" as LeafKind },
  ];
  finTail.forEach((t) => {
    pushLeaf({
      key: `Final-TAIL-${t.id}`,
      headerText: t.id,
      termBand: "Final",
      kind: t.kind,
      readOnly: true,
    });
    col += 1;
  });

  // Right side grade-calculation columns and descriptions
  addSeparator("right-grades");
  const addRightCalc = (prefix: string, labels: { main: string; forRemoval: string; afterRemoval: string; desc: string }) => {
    [labels.main, labels.forRemoval, labels.afterRemoval, labels.desc].forEach((lab, ix) => {
      pushLeaf({
        key: `RIGHT-${prefix}-${ix}`,
        headerText: lab,
        kind: ix === 3 ? "static" : "computed",
        readOnly: true,
      });
      col += 1;
    });
  };
  addRightCalc("HALF", input.rightGradeColumns.halfHalf);
  addRightCalc("ONE_THIRD", input.rightGradeColumns.oneThirdTwoThirds);

  const finEnd = col - 1;

  // Row 1 big band across everything except frozen cols
  r1TermBand.endCol = finEnd;

  // Row 1
  headerCells.push({
    key: "course-term-type",
    text: "{course_term_type}",
    row: 1,
    col: r1TermBand.startCol,
    rowSpan: 1,
    colSpan: r1TermBand.endCol - r1TermBand.startCol + 1,
    kind: "static",
  });

  // Row 2: Department, Midterm label, Computed Final Grade label
  headerCells.push({
    key: "dept",
    text: `Department: ${input.departmentName}`,
    row: 2,
    col: baseCol,
    rowSpan: 1,
    colSpan: 1,
    kind: "static",
  });

  headerCells.push({
    key: "subject",
    text: `Subject: ${input.courseTitle}`,
    row: 3,
    col: baseCol,
    rowSpan: 1,
    colSpan: 1,
    kind: "static",
  });

  headerCells.push({
    key: "midterm-label",
    text: "Midterm",
    row: 2,
    col: midStart,
    rowSpan: 1,
    colSpan: Math.max(1, midEnd - midStart + 1),
    kind: "static",
  });

  headerCells.push({
    key: "computed-final-grade-label",
    text: "Computed Final Grade",
    row: 2,
    col: finEnd, // anchor near the right; your format shows it on row 2 right side
    rowSpan: 1,
    colSpan: 1,
    kind: "static",
  });

  // Row 2 Unit bands
  r2UnitBands.forEach((u) => {
    headerCells.push({
      key: `unit-${u.key}`,
      text: u.text,
      row: 2,
      col: u.start,
      rowSpan: 1,
      colSpan: Math.max(1, u.end - u.start + 1),
      kind: "static",
    });
  });

  // Row 3 Component bands
  r3CompBands.forEach((cband) => {
    headerCells.push({
      key: `comp-${cband.key}`,
      text: cband.text,
      row: 3,
      col: cband.start,
      rowSpan: 1,
      colSpan: Math.max(1, cband.end - cband.start + 1),
      kind: "static",
    });
  });

  // Row 4 leaf labels
  leafColumns.forEach((leaf, idx) => {
    const c = baseCol + idx;
    headerCells.push({
      key: `leaf-${leaf.key}`,
      text: leaf.headerText,
      row: 4,
      col: c,
      rowSpan: 1,
      colSpan: 1,
      kind: "data",
    });
  });

  // Row 5 assessment info-buttons row (only under kind=assessment or single-assessment “M”)
  leafColumns.forEach((leaf, idx) => {
    const showBtn = leaf.kind === "assessment";
    const c = baseCol + idx;
    headerCells.push({
      key: `btn-${leaf.key}`,
      text: showBtn ? "[ i ]" : "",
      row: 5,
      col: c,
      rowSpan: 1,
      colSpan: 1,
      kind: "static",
    });
  });

  return {
    headerCells,
    leafColumns,
    headerRows,
    frozenCols,
    gridWidths,
  };
}

function defaultWidth(leaf: LeafColumn): number {
  switch (leaf.kind) {
    case "assessment":
      return 90;
    case "total":
    case "aggregate":
    case "computed":
      return 120;
    case "separator":
      return 8;
    case "space":
      return 16;
    default:
      return 110;
  }
}

/** =========================
 * Cells
 * ========================= */
const HeaderCellView = memo(function HeaderCellView({ cell }: { cell: HeaderCell }) {
  const style: React.CSSProperties = {
    gridRow: `${cell.row} / span ${cell.rowSpan}`,
    gridColumn: `${cell.col} / span ${cell.colSpan}`,
  };
  return (
    <div className="cr-header-cell" style={style} title={cell.text}>
      {cell.text}
    </div>
  );
});

const DataCell = memo(function DataCell({
  value,
  onChange,
  readOnly,
  kind,
}: {
  value: number | string;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  kind: LeafKind;
}) {
  if (readOnly || kind !== "assessment") {
    return <div className={`cr-cell ${kindClass(kind)}`}>{String(value ?? "")}</div>;
  }
  return (
    <div className="cr-cell">
      <input
        className="cr-input"
        type="number"
        value={Number.isFinite(value) ? String(value) : ""}
        onChange={(e) => {
          const v = e.target.value.trim() === "" ? NaN : Number(e.target.value);
          if (Number.isFinite(v) && onChange) onChange(v);
        }}
      />
    </div>
  );
});

const kindClass = (k: LeafKind) => {
  switch (k) {
    case "separator":
      return "cr-sep";
    case "space":
      return "cr-space";
    case "total":
      return "cr-total";
    case "aggregate":
      return "cr-agg";
    case "computed":
      return "cr-comp";
    default:
      return "";
  }
};

/** =========================
 * Main component
 * ========================= */
export default function ClassRecordGrid({
  config,
  students,
  initialScores,
  computeDerived, // user-supplied aggregations and totals

}: {
  config: BuildInput;
  students: Student[];
  initialScores: Scores;
  computeDerived: (student: Student, leaf: LeafColumn, get: (leafKey: string) => number) => number | string;
  onAssessInfoClick?: (leaf: LeafColumn) => void;
}) {
  const grid = useMemo(() => buildGridSpec(config), [config]);
  const [scores, setScores] = useState<Scores>(initialScores);
  const { scrollRef, start, end, offsetY, totalH, rowHeight } = useVirtualRows(students.length);

  const templateCols = useMemo(() => {
    return [...grid.gridWidths].map((w) => `${w}px`).join(" ");
  }, [grid.gridWidths]);



  const getScore = useCallback(
    (student_id: number, leafKey: string): number => {
      const k = `${student_id}::${leafKey}`;
      return (scores[k] ?? NaN) as number;
    },
    [scores]
  );

  const Row = memo(function Row({ s, idx }: { s: Student; idx: number }) {
    return (
      <div className="cr-row" style={{ height: rowHeight }}>
        {/* Frozen */}
        <div className="cr-cell cr-frozen">{idx + 1}</div>
        <div className="cr-cell cr-frozen">{s.student_no}</div>
        <div className="cr-cell cr-frozen">{s.name}</div>

        {/* Dynamic */}
        {grid.leafColumns.map((leaf) => {
          // computed/aggregate/total use computeDerived
          if (leaf.kind !== "assessment") {
            const v = computeDerived(s, leaf, (lk) => getScore(s.student_id, lk));
            return (
              <DataCell key={`${s.student_id}-${leaf.key}`} value={v} readOnly kind={leaf.kind} />
            );
          }
          const k = `${s.student_id}::${leaf.key}`;
          const v = scores[k] ?? NaN;
          return (
            <DataCell
              key={k}
              value={Number.isFinite(v) ? v : ""}
              onChange={(nv) => setScores((prev) => setScore(prev, s.student_id, leaf.key, nv))}
              kind={leaf.kind}
            />
          );
        })}
      </div>
    );
  });

  return (
    <div className="cr-root">
      {/* Header */}
      <div
        className="cr-header"
        style={{
          gridTemplateColumns: templateCols,
          gridTemplateRows: `repeat(${grid.headerRows}, 42px)`,
        }}
      >
        {/* Render frozen header cells already added in build */}
        {grid.headerCells.map((c) => (
          <HeaderCellView key={c.key} cell={c} />
        ))}
      </div>

      {/* Body */}
      <div className="cr-body" ref={scrollRef}>
        <div style={{ height: totalH, position: "relative" }}>
          <div style={{ position: "absolute", top: offsetY, left: 0, right: 0 }}>
            {students.slice(start, end).map((s, i) => (
              <Row key={s.student_id} s={s} idx={start + i} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
.cr-root { display:grid; grid-template-rows:auto 1fr; gap:8px; height:100%; font-family:system-ui,sans-serif; }
.cr-header { display:grid; position:sticky; top:0; z-index:2; background:#0b0b0b; border:1px solid #333; }
.cr-header-cell { border:1px solid #333; padding:6px 8px; font-size:12px; display:flex; align-items:center; justify-content:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; background:#111; }
.cr-body { overflow:auto; border:1px solid #333; }
.cr-row { display:grid; grid-template-columns:${templateCols}; border-bottom:1px solid #222; }
.cr-cell { border-right:1px solid #222; display:flex; align-items:center; padding:0 6px; font-size:13px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.cr-frozen { position:sticky; left:0; background:#0c0c0c; z-index:1; }
.cr-row > .cr-frozen:nth-child(1) { left: 0px;  width: ${grid.gridWidths[0]}px; }
.cr-row > .cr-frozen:nth-child(2) { left: ${grid.gridWidths[0]}px; width: ${grid.gridWidths[1]}px; }
.cr-row > .cr-frozen:nth-child(3) { left: ${grid.gridWidths[0] + grid.gridWidths[1]}px; width: ${grid.gridWidths[2]}px; }
.cr-input { width:100%; height:28px; background:transparent; border:1px solid #333; border-radius:4px; padding:0 6px; color:inherit; }

.cr-sep { background:#0a0a0a; border-right-color:#111; }
.cr-space { background:#0a0a0a; }
.cr-total { color:#d0e; }
.cr-agg { color:#0bd; }
.cr-comp { color:#0f0; }
      `}</style>
    </div>
  );
}