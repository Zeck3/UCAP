import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AssessmentPageData } from "../types/assessmentPageTypes";
import { getAssessmentPageData } from "../api/assessmentPageApi";
import { exportAssessmentResultSheet } from "./utils/ExportAssessmentResultSheet";
import ActionBarComponent from "./ActionBarComponent";
import SidePanelComponent from "./SidePanelComponent";
import ErrorPage from "../pages/ErrorPage";
import PageLoading from "../pages/PageLoading";

const CHART_CONFIG = {
  margin: { top: 10, right: 0, left: 10, bottom: 0 },
  xTickProps: { fontSize: 12 },
  tooltipStyle: { color: "#505050" },
} as const;

const BLOOM_ORDER = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

type OverviewChartDatum = { outcome: string; achievedCount: number; notAchievedCount: number };
type ExpandedCW = { name: string; blooms: string; coIndex: number };

const bloomRank = (b: string) => BLOOM_ORDER.indexOf(b) ?? BLOOM_ORDER.length;
const normalizeBlooms = (blooms: string[]) => [...blooms].sort((a, b) => bloomRank(a) - bloomRank(b)).join("/");

const clusterBlooms = (items: ExpandedCW[]) =>
  items.length ? [...items].sort((a, b) => {
    const [aSplit, bSplit] = [a.blooms.split("/"), b.blooms.split("/")];
    const [aRanks, bRanks] = [aSplit.map(bloomRank), bSplit.map(bloomRank)];
    for (let i = 0; i < Math.min(aRanks.length, bRanks.length); i++) {
      if (aRanks[i] !== bRanks[i]) return aRanks[i] - bRanks[i];
    }
    return aRanks.length - bRanks.length;
  }) : [];

const extractCoNumbers = (name: string) => {
  const matches = name.match(/CO(\d+)/gi);
  return matches ? matches.map(m => parseInt(m.replace(/CO/i, ""))) : [9999];
};

const sortCourseOutcomes = (a: { name: string }, b: { name: string }) => {
  const [aNums, bNums] = [extractCoNumbers(a.name), extractCoNumbers(b.name)];
  const [aType, bType] = [a.name, b.name].map(n =>
    n.includes("(Lecture)") ? "Lecture" : n.includes("(Laboratory)") ? "Laboratory" : "Unknown"
  );

  if (aNums.length !== bNums.length) return aNums.length - bNums.length;
  for (let i = 0; i < aNums.length; i++) {
    if (aNums[i] !== bNums[i]) return aNums[i] - bNums[i];
  }
  return aType !== bType ? (aType === "Lecture" ? -1 : 1) : 0;
};

const extractPOShortName = (poName: string) => {
  const match = poName.match(/^([a-zA-Z])\s*-\s*/);
  return match ? `PO-${match[1]}` : poName;
};

const formatCOLabel = (coName: string, counter: number) => {
  const coMatches = coName.match(/CO\d+/gi);
  const coNumbers = coMatches?.length ? coMatches.map(m => m.toUpperCase()).join(" & ") : `CO${counter}`;
  const typeMatch = coName.match(/\((Lecture|Laboratory)\)/i);
  return typeMatch ? `${coNumbers} (${typeMatch[1]})` : coNumbers;
};

const groupBloomsBySequence = (clustered: ExpandedCW[]) => {
  const grouped: { bloom: string; count: number }[] = [];
  let prev: string | null = null;

  for (const item of clustered.length ? clustered : [{ name: "", blooms: "", coIndex: -1 }]) {
    if (item.blooms === prev) {
      grouped[grouped.length - 1].count++;
    } else {
      grouped.push({ bloom: item.blooms, count: 1 });
      prev = item.blooms;
    }
  }
  return grouped;
};

const countClasswork = (co: AssessmentPageData["pos"][0]["cos"][0]) => Math.max(1, co.classwork.length) + 3;
const totalClassworkColumns = (pos: AssessmentPageData["pos"]) =>
  pos.reduce((sum, po) => sum + po.cos.reduce((s, co) => s + countClasswork(co), 0), 0);

const OverviewChart = memo(({ data, studentCount }: { data: OverviewChartDatum[]; studentCount: number }) => {
  if (!studentCount || !data.length) return null;
  
  const chartWidth = Math.max(data.length * 25, 100);
  const widthStyle = chartWidth > 100 ? `${chartWidth}%` : '100%';

  return (
    <div className="mt-8">
      <h4 className="text-md mb-3">Overview</h4>
      <div className="**:outline-none overflow-x-auto overflow-y-hidden">
        <div style={{ width: widthStyle, height: '425px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={CHART_CONFIG.margin} barCategoryGap={0}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="outcome"
                height={60}
                interval={0}
                tick={CHART_CONFIG.xTickProps}
                tickFormatter={(value: string) => value.length > 20 ? value.substring(0, 20) + "..." : value}
              />
              <YAxis
                label={{ value: "Number of Students", angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }}
                allowDecimals={false}
                domain={[0, studentCount]}
              />
              <Tooltip contentStyle={CHART_CONFIG.tooltipStyle} itemStyle={CHART_CONFIG.tooltipStyle} />
              <Bar dataKey="achievedCount" fill="#B6E2A1" name="Achieved" barSize={50} />
              <Bar dataKey="notAchievedCount" fill="#F7A4A4" name="Not Achieved" barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});

const ClassworkNameCell = memo(({ cw, pIdx, cIdx, cwIdx }: { cw: ExpandedCW; pIdx: number; cIdx: number; cwIdx: number }) => (
  <td key={`cw-${pIdx}-${cIdx}-${cwIdx}`} className="border border-[#E9E6E6] align-middle min-w-14 h-40">
    <div className="h-full flex items-end justify-center py-2">
      <span className="leading-tight wrap-break-word whitespace-normal [writing-mode:vertical-rl] [text-orientation:mixed] rotate-180">
        {cw.name}
      </span>
    </div>
  </td>
));

const StudentScoreCell = memo(({ val, studentId, pIdx, cIdx, cwIdx }: { val: number | string; studentId: string; pIdx: number; cIdx: number; cwIdx: number }) => (
  <td key={`score-${studentId}-${pIdx}-${cIdx}-${cwIdx}`} className="border border-[#E9E6E6] px-2 py-2 text-center min-w-14">
    {val}
  </td>
));

export default function AssessmentPageComponent({ sectionId }: { sectionId: number }) {
  const section_id = String(sectionId);
  const location = useLocation();
  const isReadOnly = !(location.pathname.includes('/instructor/') && location.pathname.endsWith('/assessment'));

  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<AssessmentPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsComment, setAnalyticsComment] = useState("");
  const [showNoteTooltip, setShowNoteTooltip] = useState(false);
  const [kpiValues, setKpiValues] = useState<Record<string, number>>({});
  const [editingKpiCo, setEditingKpiCo] = useState<string | null>(null);
  const [tempKpi70, setTempKpi70] = useState("");
  const [tempKpi80, setTempKpi80] = useState("");
  const [editingRemarks, setEditingRemarks] = useState(false);
  const [tempRemarks, setTempRemarks] = useState("");
  const [viewingRemarks, setViewingRemarks] = useState(false);
  const [resultStatus, setResultStatus] = useState<"Complete" | "Incomplete">("Incomplete");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [statusDropdownCoords, setStatusDropdownCoords] = useState({ x: 0, y: 0 });
  const statusBtnRef = useRef<HTMLButtonElement | null>(null);
  const statusMenuRef = useRef<HTMLDivElement | null>(null);

  const getKpiKey = useCallback(
    (coName: string, kpiType: "pass70" | "pass80") =>
      `${section_id}-${coName}-${kpiType}`,
    [section_id]
  );

  const getKpiValue = useCallback(
    (coName: string, kpiType: "pass70" | "pass80") => {
      return (
        kpiValues[getKpiKey(coName, kpiType)] ??
        (kpiType === "pass70" ? 70 : 80)
      );
    },
    [kpiValues, getKpiKey]
  );

  const saveKpiValues = (newValues: Record<string, number>) =>
    localStorage.setItem(`kpi-values-${section_id}`, JSON.stringify(newValues));

  const openKpiEditor = (coName: string) => {
    setTempKpi70(String(getKpiValue(coName, "pass70")));
    setTempKpi80(String(getKpiValue(coName, "pass80")));
    setEditingKpiCo(coName);
  };

  const saveKpiFromPopup = () => {
    if (!editingKpiCo) return;
    const [kpi70, kpi80] = [parseInt(tempKpi70, 10), parseInt(tempKpi80, 10)];

    if (isNaN(kpi70) || kpi70 < 1 || kpi70 > 100 || isNaN(kpi80) || kpi80 < 1 || kpi80 > 100) {
      toast.error("Please enter valid values between 1 and 100");
      return;
    }

    const newValues = { ...kpiValues };
    const allCos = layout.flatMap(po => po.cos.map(co => co.name));
    
    for (const coName of allCos) {
      newValues[getKpiKey(coName, "pass70")] = kpi70;
      newValues[getKpiKey(coName, "pass80")] = kpi80;
    }
    
    setKpiValues(newValues);
    saveKpiValues(newValues);
    setEditingKpiCo(null);
    toast.success("KPI values updated successfully");
  };

  const openRemarksEditor = () => {
    setTempRemarks((data as any)?.generalRemarks || "");
    setEditingRemarks(true);
  };

  const saveRemarksFromPopup = () => {
    const limitedRemarks = tempRemarks.slice(0, 1000);
    localStorage.setItem(`remarks-${section_id}`, limitedRemarks);
    setData(prevData => prevData ? { ...prevData, generalRemarks: limitedRemarks } as any : prevData);
    setEditingRemarks(false);
    toast.success("Remarks saved successfully");
  };

  const handleExportResultSheet = async () => {
    if (!data) {
      toast.error("No data available to export");
      return;
    }
    try {
      await exportAssessmentResultSheet({ data });
      toast.success("Result sheet exported successfully");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export result sheet");
    }
  };

  useEffect(() => {
    const savedKpis = localStorage.getItem(`kpi-values-${section_id}`);
    if (savedKpis) {
      try {
        setKpiValues(JSON.parse(savedKpis));
      } catch (e) {
        console.error("Failed to parse saved KPI values", e);
      }
    }

    const savedComment = localStorage.getItem(`analytics-comment-${section_id}`);
    if (savedComment) setAnalyticsComment(savedComment);

    const savedStatus = localStorage.getItem(`result-status-${section_id}`);
    if (savedStatus === "Complete" || savedStatus === "Incomplete") {
      setResultStatus(savedStatus);
    }
  }, [section_id]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditingKpiCo(null);
        setEditingRemarks(false);
        setStatusDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (!statusDropdownOpen) return;

    const close = (e: MouseEvent) => {
      if (
        !statusMenuRef.current?.contains(e.target as Node) &&
        !statusBtnRef.current?.contains(e.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [statusDropdownOpen]);

  useEffect(() => {
    if (analyticsComment !== undefined) {
      localStorage.setItem(`analytics-comment-${section_id}`, analyticsComment);
    }
  }, [analyticsComment, section_id]);

  useEffect(() => {
    const fetchAssessmentPage = async () => {
      try {
        setLoading(true);
        if (!section_id) return;
        const response = await getAssessmentPageData(Number(section_id));

        const filteredStudents = response.students.filter(student => {
          const hasValidId = student.id && /^\d{10}$/.test(student.id);
          const hasValidName = student.name?.trim().length > 0;
          const hasNoRemarks = !student.remarks || student.remarks.trim() === "";
          return hasValidId && hasValidName && hasNoRemarks;
        });

        const savedRemarks = localStorage.getItem(`remarks-${section_id}`);
        const dataWithRemarks = savedRemarks
          ? { ...response, students: filteredStudents, generalRemarks: savedRemarks }
          : { ...response, students: filteredStudents };

        setData(dataWithRemarks as any);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load assessment page";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentPage();
  }, [section_id]);

  const studentCount = data?.students.length ?? 0;
  const totalColumns = 4 + totalClassworkColumns(data?.pos ?? []);

  const layout = useMemo(() => {
    const pos = data?.pos ?? [];

    const filteredPOs = pos
      .map(po => {
        const filteredCOs = po.cos
          .map(co => {
            const validClasswork = co.classwork?.filter(cw => cw && cw.maxScore != null) ?? [];
            if (validClasswork.length === 0) return null;

            const expanded: ExpandedCW[] = validClasswork.map((cw, idx) => ({
              name: cw.name,
              blooms: normalizeBlooms(cw.blooms),
              coIndex: idx,
            }));

            return { ...co, classwork: validClasswork, clustered: clusterBlooms(expanded) };
          })
          .filter((co): co is NonNullable<typeof co> => co != null);

        if (filteredCOs.length === 0) return null;
        return { ...po, cos: filteredCOs };
      })
      .filter((po): po is NonNullable<typeof po> => po != null);

    const numPOs = filteredPOs.length;
    const parent = Array.from({ length: numPOs }, (_, i) => i);

    const find = (x: number): number => {
      if (parent[x] !== x) parent[x] = find(parent[x]);
      return parent[x];
    };

    const union = (x: number, y: number) => {
      const [px, py] = [find(x), find(y)];
      if (px !== py) parent[px] = py;
    };

    const coToPOs: Map<string, number[]> = new Map();
    for (let i = 0; i < numPOs; i++) {
      for (const co of filteredPOs[i].cos) {
        if (!coToPOs.has(co.name)) coToPOs.set(co.name, []);
        coToPOs.get(co.name)!.push(i);
      }
    }

    for (const poList of coToPOs.values()) {
      for (let j = 1; j < poList.length; j++) union(poList[0], poList[j]);
    }

    const components: Map<number, number[]> = new Map();
    for (let i = 0; i < numPOs; i++) {
      const root = find(i);
      if (!components.has(root)) components.set(root, []);
      components.get(root)!.push(i);
    }

    const mergedLayout: typeof filteredPOs = [];
    for (const poIndices of components.values()) {
      const posInComp = poIndices.map(idx => filteredPOs[idx]);
      const shortNames = posInComp.map(po => extractPOShortName(po.name)).sort();
      const mergedName = shortNames.join(", ");

      const coMap: Map<string, (typeof filteredPOs)[0]["cos"][0]> = new Map();
      for (const po of posInComp) {
        for (const co of po.cos) {
          if (!coMap.has(co.name)) coMap.set(co.name, co);
        }
      }

      const uniqueCos = Array.from(coMap.values()).sort(sortCourseOutcomes);
      mergedLayout.push({ name: mergedName, cos: uniqueCos });
    }

    mergedLayout.sort((a, b) => a.name.split(", ")[0].localeCompare(b.name.split(", ")[0]));
    return mergedLayout;
  }, [data]);

  const coTotalsMemo = useMemo(
    () =>
      layout.flatMap(po =>
        po.cos.map(co => {
          const totalMax = co.classwork.reduce((s, cw) => s + (cw.maxScore ?? 0), 0);
          const kpi70 = getKpiValue(co.name, "pass70");
          const kpi80 = getKpiValue(co.name, "pass80");
          const pass70 = Math.round(totalMax * (kpi70 / 100));
          const pass80Count = Math.ceil(studentCount * (kpi80 / 100));
          return { totalMax, pass70, pass80Count, kpi70, kpi80 };
        })
      ),
    [layout, studentCount, getKpiValue]
  );

  const coAnalytics = useMemo(() => {
    const allCos = layout.flatMap(po => po.cos);
    return allCos.map((co, idx) => {
      const pass70Threshold = coTotalsMemo[idx].pass70;
      const achieved = (data?.students ?? []).filter(s => {
        const scores = s.scores[co.name] ?? [];
        const total = scores.reduce((sum, sc) => sum + (sc?.raw ?? 0), 0);
        return total >= pass70Threshold;
      }).length;
      const notAchieved = studentCount - achieved;
      const [pctAch, pctNot] = [((achieved / studentCount) * 100).toFixed(2), ((notAchieved / studentCount) * 100).toFixed(2)];
      return {
        outcome: co.name,
        achieved: `${achieved} (${pctAch}%)`,
        notAchieved: `${notAchieved} (${pctNot}%)`,
        achievedCount: achieved,
        notAchievedCount: notAchieved,
      };
    });
  }, [layout, coTotalsMemo, studentCount, data]);

  if (loading) return <PageLoading />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const hasPos = Array.isArray(data?.pos) && data!.pos.length > 0;
  const hasStudents = Array.isArray(data?.students) && data!.students.length > 0;
  if (!data || !hasPos || !hasStudents) {
    return (
      <ErrorPage
        title="No data available to display."
        description="Check back later for course outcome assessments!"
      />
    );
  }

  const poCells = layout.map((po, pIdx) => (
    <td
      key={`po-${pIdx}`}
      colSpan={po.cos.reduce((s, co) => s + countClasswork(co), 0)}
      className="border border-[#E9E6E6] px-2 py-2 text-center whitespace-normal wrap-break-word"
    >
      {extractPOShortName(po.name)}
    </td>
  ));

  let coCounter = 1;
  const coCells = layout.flatMap((po, pIdx) =>
    po.cos.map((co, cIdx) => (
      <td
        key={`co-${pIdx}-${cIdx}`}
        colSpan={countClasswork(co)}
        className="border border-[#E9E6E6] px-2 py-2 text-center text-coa-red bg-coa-yellow whitespace-nowrap"
        title={co.name}
      >
        {formatCOLabel(co.name, coCounter++)}
      </td>
    ))
  );

  return (
    <>
      <table className="table-auto border-collapse w-full -ml-px -mt-px">
        <tbody>
          {[
            ["Campus/College/Department:", data.classInfo.cacode],
            ["Program:", data.classInfo.program],
            ["Course:", data.classInfo.course],
            ["AY/Semester:", data.classInfo.aySemester],
            ["Faculty:", data.classInfo.faculty],
          ].map(([label, value], idx) => (
            <tr key={idx}>
              <td className="border border-[#E9E6E6] px-2 py-2 font-medium min-w-[220px]" colSpan={3}>{label}</td>
              <td className="border border-[#E9E6E6] px-2 py-2" colSpan={totalColumns - 3}>{value}</td>
            </tr>
          ))}

          <tr>
            <td colSpan={totalColumns} className="border border-[#E9E6E6] px-2 py-2 text-center font-medium">
              Assessment Result Sheet
            </td>
          </tr>

          <tr>
            <td className="border border-[#E9E6E6] px-2 py-2 font-medium min-w-[220px]" colSpan={3}>
              <div className="flex items-center gap-2">
                <span>Result Status:</span>
                {!isReadOnly ? (
                  <button
                    ref={statusBtnRef}
                    onClick={(e) => {
                      e.stopPropagation();
                      const r = e.currentTarget.getBoundingClientRect();
                      setStatusDropdownCoords({ x: r.left, y: r.bottom + 2 });
                      setStatusDropdownOpen((p) => !p);
                    }}
                    className="px-2 py-0.5 font-medium hover:bg-gray-100 rounded transition-colors"
                  >
                    {resultStatus}
                  </button>
                ) : (
                  <span className="font-medium">{resultStatus}</span>
                )}
              </div>
            </td>
            <td className="border border-[#E9E6E6] px-2 py-2 text-center font-medium align-top min-w-[35px]" rowSpan={5 + studentCount}></td>
            {poCells}
          </tr>

          <tr>
            <td
              className={`border border-[#E9E6E6] px-2 py-2 align-top min-w-[220px] max-w-[220px] ${!isReadOnly ? 'cursor-pointer hover:bg-gray-50 transition-colors' : (data as any)?.generalRemarks ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
              rowSpan={3}
              colSpan={3}
              onClick={!isReadOnly ? openRemarksEditor : (data as any)?.generalRemarks ? () => setViewingRemarks(true) : undefined}
            >
              <div className="flex gap-2">
                <span className="font-medium whitespace-nowrap">Remarks:</span>
                <div className="font-medium text-gray-600 overflow-hidden wrap-break-word flex-1" style={{ display: '-webkit-box', WebkitLineClamp: 10, WebkitBoxOrient: 'vertical' }}>
                  {(data as any)?.generalRemarks || (!isReadOnly && <span className="text-gray-400">Click to add remarks...</span>)}
                </div>
              </div>
            </td>
            {coCells}
          </tr>

          <tr>
            {layout.flatMap((po, pIdx) =>
              po.cos.flatMap((co, cIdx) => [
                ...groupBloomsBySequence(co.clustered).map((g, gIdx) => (
                  <td
                    key={`blooms-${pIdx}-${cIdx}-${gIdx}`}
                    className="border border-[#E9E6E6] px-2 py-2 text-center text-sm whitespace-normal break-slash"
                    colSpan={g.count}
                  >
                    {g.bloom.replaceAll("/", "/\u200B")}
                  </td>
                )),
                <td key={`blooms-kpi-${pIdx}-${cIdx}`} className="border border-[#E9E6E6] px-2 py-2 text-center text-sm" colSpan={3}>
                  KPI <br /> (passed the assessment)
                </td>,
              ])
            )}
          </tr>

          <tr>
            {layout.flatMap((po, pIdx) =>
              po.cos.flatMap((co, cIdx) => {
                const cwCells = co.clustered.map((cw, cwIdx) => (
                  <ClassworkNameCell key={`cw-${pIdx}-${cIdx}-${cwIdx}`} cw={cw} pIdx={pIdx} cIdx={cIdx} cwIdx={cwIdx} />
                ));

                return [
                  ...cwCells,
                  <td key={`cw-total-${pIdx}-${cIdx}`} className="border border-[#E9E6E6] px-2 py-2 text-center text-sm align-bottom min-w-[50px]">Total</td>,
                  <td
                    key={`cw-pass70-${pIdx}-${cIdx}`}
                    className={`border border-[#E9E6E6] px-2 py-2 text-center text-sm align-bottom min-w-14 ${!isReadOnly ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    onClick={!isReadOnly ? () => openKpiEditor(co.name) : undefined}
                  >
                    {`Passing (${getKpiValue(co.name, "pass70")}%)`}
                  </td>,
                  <td
                    key={`cw-pass80-${pIdx}-${cIdx}`}
                    className={`border border-[#E9E6E6] px-2 py-2 text-center text-sm align-bottom min-w-14 ${!isReadOnly ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    onClick={!isReadOnly ? () => openKpiEditor(co.name) : undefined}
                  >
                    {`Passing (${getKpiValue(co.name, "pass80")}%)`}
                  </td>,
                ];
              })
            )}
          </tr>

          <tr>
            <td className="border border-[#E9E6E6] px-2 py-2 text-left font-medium">No.</td>
            <td className="border border-[#E9E6E6] px-2 py-2 text-left font-medium">Student ID</td>
            <td className="border border-[#E9E6E6] px-2 py-2 text-left font-medium">Name</td>
            {(() => {
              let index = 0;
              return layout.flatMap((po, pIdx) =>
                po.cos.flatMap((co, cIdx) => {
                  const { totalMax, pass70, pass80Count } = coTotalsMemo[index++];
                  const maxCells = co.clustered.map((cw, cwIdx) => (
                    <td key={`max-${pIdx}-${cIdx}-${cwIdx}`} className="border border-[#E9E6E6] px-2 py-2 text-center text-coa-blue min-w-14">
                      {co.classwork[cw.coIndex]?.maxScore ?? ""}
                    </td>
                  ));

                  return [
                    ...maxCells,
                    <td key={`max-total-${pIdx}-${cIdx}`} className="border border-[#E9E6E6] px-2 py-2 text-center text-coa-blue">{totalMax}</td>,
                    <td key={`max-pass70-${pIdx}-${cIdx}`} className="border border-[#E9E6E6] px-2 py-2 text-center font-semibold text-coa-blue">{pass70}</td>,
                    <td key={`max-pass80-${pIdx}-${cIdx}`} className="border border-[#E9E6E6] px-2 py-2 text-center font-semibold text-coa-blue">{pass80Count}</td>,
                  ];
                })
              );
            })()}
          </tr>

          {data.students.map((student, sIdx) => (
            <tr key={`${student.id}-${sIdx}`}>
              <td className="border border-[#E9E6E6] px-2 py-2 text-left">{sIdx + 1}</td>
              <td className="border border-[#E9E6E6] px-2 py-2 text-left">{student.id}</td>
              <td className="border border-[#E9E6E6] px-2 py-2 whitespace-nowrap text-left">{student.name}</td>
              {(() => {
                let index = 0;
                return layout.flatMap((po, pIdx) =>
                  po.cos.flatMap((co, cIdx) => {
                    const studentScores = student.scores[co.name] ?? [];
                    const { pass70: pass70Threshold, pass80Count } = coTotalsMemo[index++];

                    const scoreCells = co.clustered.map((cw, cwIdx) => (
                      <StudentScoreCell
                        key={`score-${student.id}-${pIdx}-${cIdx}-${cwIdx}`}
                        val={studentScores[cw.coIndex]?.raw ?? ""}
                        studentId={student.id}
                        pIdx={pIdx}
                        cIdx={cIdx}
                        cwIdx={cwIdx}
                      />
                    ));

                    if (studentScores.length > 0) {
                      const studentTotal = studentScores.reduce((sum, sc) => sum + (sc?.raw ?? 0), 0);
                      const pass70 = studentTotal >= pass70Threshold;
                      const pass70Count = data.students.filter(s => {
                        const total = (s.scores[co.name] ?? []).reduce((sum, sc) => sum + (sc?.raw ?? 0), 0);
                        return total >= pass70Threshold;
                      }).length;
                      const pass80 = pass70Count >= pass80Count;

                      scoreCells.push(
                        <td key={`student-total-${student.id}-${pIdx}-${cIdx}`} className="border border-[#E9E6E6] px-2 py-2 text-center font-semibold text-coa-blue">
                          {studentTotal}
                        </td>,
                        <td key={`student-pass70-${student.id}-${pIdx}-${cIdx}`} className="border border-[#E9E6E6] px-2 py-2 text-center font-semibold">
                          {pass70 ? <span>YES</span> : <span className="text-coa-red">NO</span>}
                        </td>
                      );

                      if (sIdx === 0) {
                        scoreCells.push(
                          <td key={`student-pass80-${pIdx}-${cIdx}`} className="border border-[#E9E6E6] px-2 py-2 align-text-top text-center font-semibold" rowSpan={studentCount}>
                            {pass80 ? <span>YES</span> : <span className="text-coa-red">NO</span>}
                          </td>
                        );
                      }
                    } else {
                      scoreCells.push(
                        <td key={`student-total-${student.id}-${pIdx}-${cIdx}`} className="border border-[#E9E6E6] px-2 py-2 text-center" />,
                        <td key={`student-pass70-${student.id}-${pIdx}-${cIdx}`} className="border border-[#E9E6E6] px-2 py-2 text-center" />,
                        ...(sIdx === 0 ? [<td key={`student-pass80-${pIdx}-${cIdx}`} className="border border-[#E9E6E6] px-2 py-2 text-center" rowSpan={studentCount} />] : [])
                      );
                    }

                    return scoreCells;
                  })
                );
              })()}
            </tr>
          ))}
        </tbody>
      </table>

      <ActionBarComponent
        goToAssessmentPage={() => setIsOpen(true)}
        onExportResultSheet={handleExportResultSheet}
      />

      <SidePanelComponent
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        panelFunction="Analytics"
        onSubmit={() => { }}
        buttonFunction=""
        disableInputs={false}
        disableActions={true}
        singleColumn={true}
      >
        <div className="w-full h-full flex flex-col">
          <div className="grow">
            <h3 className="text-md mb-3">Course Outcome Attainment</h3>
            <div className="overflow-x-auto border border-[#E9E6E6] rounded-lg">
              <table className="table-auto w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 py-2 text-left font-medium border-b border-[#E9E6E6]">Outcome</th>
                    <th className="px-2 py-2 text-left font-medium border-b border-[#E9E6E6]">No. of Students Achieved</th>
                    <th className="px-2 py-2 text-left font-medium border-b border-[#E9E6E6]">No. of Students Not Achieved</th>
                  </tr>
                </thead>
                <tbody>
                  {coAnalytics.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-2 py-2">{row.outcome}</td>
                      <td className="px-2 py-2">{row.achieved}</td>
                      <td className="px-2 py-2">{row.notAchieved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isOpen && coAnalytics.length > 0 && studentCount > 0 && (
              <OverviewChart data={coAnalytics} studentCount={studentCount} />
            )}
          </div>

          <div className="mt-8">
            <label className="text-md block mb-2">Comment</label>
            <div className="relative">
              <textarea
                value={analyticsComment}
                onChange={(e) => setAnalyticsComment(e.target.value)}
                placeholder={!isReadOnly ? "Add a comment..." : ""}
                maxLength={1000}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none mt-1"
                rows={4}
                readOnly={isReadOnly}
                disabled={isReadOnly}
              />
              <button
                type="button"
                className="absolute top-2 right-2 w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setShowNoteTooltip(!showNoteTooltip)}
                onBlur={() => setTimeout(() => setShowNoteTooltip(false), 200)}
              >
                <span className="text-xs font-bold">?</span>
              </button>
              {showNoteTooltip && (
                <div className="absolute right-0 top-10 w-96 p-3 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg z-10">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <strong>Note:</strong> If a significant number of students fail to achieve the course outcomes (COs), interventions may be required, such as revisions to the course syllabus content, enhancements to assessment methods, or other appropriate measures.
                  </p>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400 mt-1">{analyticsComment.length}/1000</span>
          </div>
        </div>
      </SidePanelComponent>

      {/* KPI Editor Popup */}
      {editingKpiCo && (
        <div
          className="fixed inset-0 flex items-center justify-center z-5000"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={() => setEditingKpiCo(null)}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Edit KPI Values:</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium w-48">Individual Passing ({getKpiValue(editingKpiCo, "pass70")}%):</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={tempKpi70}
                  onChange={(e) => setTempKpi70(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), saveKpiFromPopup())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                  placeholder="Enter value"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm font-medium w-48">Class Passing ({getKpiValue(editingKpiCo, "pass80")}%):</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={tempKpi80}
                  onChange={(e) => setTempKpi80(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), saveKpiFromPopup())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                  placeholder="Enter value"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingKpiCo(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveKpiFromPopup}
                className="px-4 py-2 text-sm font-medium text-white bg-ucap-yellow hover:bg-ucap-yellow-hover rounded-md transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remarks Editor Popup */}
      {editingRemarks && (
        <div
          className="fixed inset-0 flex items-center justify-center z-6000"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={() => setEditingRemarks(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Edit Remarks:</h3>

            <div>
              <textarea
                value={tempRemarks}
                onChange={(e) => setTempRemarks(e.target.value)}
                placeholder="Enter remarks..."
                maxLength={1000}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none"
                rows={4}
                autoFocus
              />
              <span className="text-xs text-gray-400 mt-1 block">{tempRemarks.length}/1000</span>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingRemarks(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveRemarksFromPopup}
                className="px-4 py-2 text-sm font-medium text-white bg-ucap-yellow hover:bg-ucap-yellow-hover rounded-md transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remarks Viewing Popup (Read-Only) */}
      {viewingRemarks && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={() => setViewingRemarks(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Remarks:</h3>

            <div className="p-3 border border-gray-300 rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap wrap-break-word">{(data as any)?.generalRemarks || "No remarks available."}</p>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setViewingRemarks(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Status Dropdown Menu */}
      {statusDropdownOpen && createPortal(
        <div
          ref={statusMenuRef}
          style={{
            position: "fixed",
            top: statusDropdownCoords.y,
            left: statusDropdownCoords.x - 1,
            zIndex: 9999,
          }}
          className="w-32 bg-white border border-[#E9E6E6] rounded shadow-lg"
        >
          {["Incomplete", "Complete"].map((opt) => (
            <button
              key={opt}
              className={`w-full px-3 py-1.5 text-left font-medium hover:bg-gray-50 ${opt === resultStatus ? "bg-gray-100" : ""
                }`}
              onClick={() => {
                const newStatus = opt as "Complete" | "Incomplete";
                setResultStatus(newStatus);
                localStorage.setItem(`result-status-${section_id}`, newStatus);
                setStatusDropdownOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}