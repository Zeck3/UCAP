import React from "react";
import type { HeaderNode } from "../types/headerConfigTypes";
import {
  countLeaves,
  getTotalLeafCount,
  getHeaderClass,
  getHeaderWidth,
  computeComputedContent,
  formatValue,
  getCalculatedBg,
} from "../utils/ClassRecordFunctions";
import type { JSX } from "react";
import type { Assessment } from "../../../types/classRecordTypes";
import { renderTitleLines } from "../utils/ClassRecordRenderers";
import MaxScoreInput from "../utils/MaxScoreInput";

interface BuildHeaderRowProps {
  nodes: HeaderNode[];
  originalMaxDepth: number;
  openAssessmentInfoContextMenu: (
    e: React.MouseEvent,
    assessmentId: number
  ) => void;
  maxScores: Record<string, number>;
  setMaxScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  computedMaxValues: Record<string, number>;
  handleEditStart: (
    node: HeaderNode,
    event: React.MouseEvent<HTMLDivElement>
  ) => void;
  onRightClickNode?: (e: React.MouseEvent, node: HeaderNode) => void;
  handleUpdateAssessment: (
    assessmentId: number,
    updates: Partial<Assessment>
  ) => Promise<void>;
}

function BuildHeaderRow({
  nodes,
  originalMaxDepth,
  openAssessmentInfoContextMenu,
  maxScores,
  setMaxScores,
  computedMaxValues,
  handleEditStart,
  onRightClickNode,
  handleUpdateAssessment,
}: BuildHeaderRowProps) {
  const [leafRowHeight, setLeafRowHeight] = React.useState(() => {
    const saved = localStorage.getItem("leafRowHeight");
    return saved ? Number(saved) : 40;
  });

  const handleNodeClick = React.useCallback(
    (node: HeaderNode) => (e: React.MouseEvent<HTMLDivElement>) => {
      handleEditStart(node, e);
    },
    [handleEditStart]
  );

  const handleNodeContextMenu = React.useCallback(
    (node: HeaderNode) => (e: React.MouseEvent) => {
      e.preventDefault();
      onRightClickNode?.(e, node);
    },
    [onRightClickNode]
  );

  const handleHResizeStart = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startY = e.clientY;
      const startHeight = leafRowHeight;
      function onMouseMove(ev: MouseEvent) {
        const delta = ev.clientY - startY;
        const nextHeight = startHeight + delta;
        setLeafRowHeight(nextHeight <= 40 ? 40 : nextHeight);
      }
      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [leafRowHeight, setLeafRowHeight]
  );

  const rowsToRender = React.useMemo(() => {
    const newMaxDepth = originalMaxDepth + 1;
    const rows: JSX.Element[][] = Array.from({ length: newMaxDepth }, () => []);
    const hSeparators: JSX.Element[] = [];
    const buttonRow: JSX.Element[] = [];

    function build(node: HeaderNode, level: number) {
      if (node.type === "v-separator") {
        rows[level].push(
          <th
            key={node.key || `vsep-${level}-${node.title}-${node.type}`}
            rowSpan={newMaxDepth - level}
            className="bg-ucap-blue w-1 border border-ucap-blue relative cursor-col-resize"
          >
            <div className="absolute top-0 right-0 h-full w-1 cursor-col-resize" />
          </th>
        );
        return;
      }

      if (node.type === "spacer") {
        rows[level].push(
          <th
            key={node.key || `spacer-${level}-${node.title}`}
            rowSpan={newMaxDepth - level}
            className="bg-white border border-[#E9E6E6]"
          />
        );
        return;
      }

      if (node.type === "h-separator") {
        hSeparators.push(
          <th
            key={node.key || `hsep-rsize`}
            colSpan={getTotalLeafCount(nodes)}
            className="bg-ucap-blue h-4 border border-ucap-blue p-0 cursor-row-resize"
            onMouseDown={(e) => handleHResizeStart(e)}
          />
        );
        return;
      }

      const hasChildren = node.children.length > 0;
      const colSpan =
        node.colSpan ||
        (hasChildren
          ? node.children.reduce((sum, child) => sum + countLeaves(child), 0)
          : 1);

      let rowSpan: number;
      if (node.customRowSpan) rowSpan = node.customRowSpan;
      else if (node.isRowSpan) rowSpan = newMaxDepth - level;
      else rowSpan = 1;

      const headerClass = getHeaderClass(node);
      const headerWidth = getHeaderWidth(node);
      const isLeafDeep =
        !hasChildren && level === originalMaxDepth - 1 && !node.computedGrades;

      rows[level].push(
        <th
          key={
            node.key ||
            `${level}-${node.nodeType || node.type}-${node.title}-${
              rows[level].length
            }`
          }
          colSpan={colSpan}
          rowSpan={rowSpan}
          onClick={
            node.nodeType === "assessment" ? handleNodeClick(node) : undefined
          }
          style={{
            height: level === 3 ? leafRowHeight : "auto",
            maxHeight: level === 3 ? leafRowHeight : "none",
            minHeight: 112,
          }}
          className={`border border-[#E9E6E6] p-2 text-center ${headerClass} ${
            isLeafDeep
              ? `[writing-mode:vertical-rl] rotate-180 text-left truncate overflow-hidden text-ellipsis w-15 max-w-15`
              : `whitespace-normal ${headerWidth} w-15`
          }`}
          onContextMenu={
            node.nodeType === "assessment" || node.nodeType === "component"
              ? handleNodeContextMenu(node)
              : undefined
          }
        >
          {node.title?.trim() ? renderTitleLines(node.title) : ""}
        </th>
      );

      if (hasChildren)
        node.children.forEach((child) => build(child, level + rowSpan));
    }

    function addButtons(node: HeaderNode) {
      if (["v-separator", "spacer", "h-separator"].includes(node.type || ""))
        return;
      if (
        node.isRowSpan ||
        node.customRowSpan ||
        node.calculationType === "computed"
      ) {
        if (node.children.length > 0) node.children.forEach(addButtons);
        return;
      }
      if (node.children.length > 0) node.children.forEach(addButtons);
      else {
        if (node.needsButton) {
          buttonRow.push(
            <th
              key={`button-${node.key || node.title}`}
              className={`border border-gray-200 p-0 text-center ${
                node.calculationType ? "w-15" : ""
              }`}
            >
              <button
                onClick={(e) =>
                  openAssessmentInfoContextMenu(e, Number(node.key))
                }
                className="w-full h-full bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs py-1.5 px-2"
              >
                Info...
              </button>
            </th>
          );
        } else {
          const bgClass =
            node.calculationType === "roundedGrade" ? "bg-ucap-yellow" : "";
          buttonRow.push(
            <th
              key={`empty-${node.key || node.title}`}
              className={`border border-[#E9E6E6] p-2 text-center ${bgClass} ${
                node.calculationType ? "w-15" : ""
              }`}
            />
          );
        }
      }
    }

    nodes.forEach((node) => build(node, 0));
    nodes.forEach((node) => addButtons(node));

    if (buttonRow.length > 0) rows[originalMaxDepth] = buttonRow;

    const allRows = [...rows];
    if (hSeparators.length > 0) allRows.push(hSeparators);

    const subRow: JSX.Element[] = [];

    function buildSubRow(node: HeaderNode) {
      if (node.type === "v-separator") {
        subRow.push(
          <th
            key={`vsep-${node.key || node.title}`}
            className="bg-ucap-blue w-1 border border-ucap-blue relative cursor-col-resize"
          >
            <div className="absolute top-0 right-0 h-full w-1 cursor-col-resize" />
          </th>
        );
        return;
      }

      if (node.type === "spacer") {
        subRow.push(
          <th
            key={`spacer-${node.key || node.title}`}
            className="bg-white w-20 border border-[#E9E6E6]"
          />
        );
        return;
      }

      if (node.type === "h-separator") return;

      if (node.isRowSpan) {
        subRow.push(
          <th
            key="sub-no-col"
            className="border border-[#E9E6E6] p-2 w-12 text-left font-bold"
          >
            No.
          </th>
        );
        subRow.push(
          <th
            key="sub-id-col"
            className="border border-[#E9E6E6] p-2 w-24 text-left font-bold"
          >
            Student ID
          </th>
        );
        subRow.push(
          <th
            key="sub-name-col"
            className="border border-[#E9E6E6] p-2 text-left font-bold"
          >
            Name
          </th>
        );
        return;
      }

      if (node.children.length > 0) {
        node.children.forEach(buildSubRow);
        return;
      }

      let content: JSX.Element | string = "";
      let bgClass = getCalculatedBg(node.calculationType);
      let textClass = "";

      if (node.calculationType === "assignment" && node.key) {
        const key = node.key as string;
        const val = maxScores[key] ?? 0;

        content = (
          <MaxScoreInput
            node={node}
            value={val}
            onChange={(num) =>
              setMaxScores((prev) => ({ ...prev, [key]: num }))
            }
            onBlur={(num) =>
              handleUpdateAssessment(Number(key), {
                assessment_highest_score: Math.min(num, 999),
              })
            }
          />
        );
      } else if (node.key && computedMaxValues[node.key] !== undefined) {
        content = formatValue(
          computedMaxValues?.[node.key],
          node.calculationType
        );
        textClass = "text-coa-blue";
      } else if (node.calculationType === "computed" && node.key) {
        const mid = computedMaxValues["midterm-total-grade"] || 0;
        const fin = computedMaxValues["final-total-grade"] || 0;

        if (mid === 0 && fin === 0) {
          content = "";
          bgClass = "";
          textClass = "";
        } else {
          const { content: compContent, type } = computeComputedContent(
            mid,
            fin,
            node.key
          );
          content = compContent;
          bgClass = getCalculatedBg(type);
          textClass = "text-coa-blue";
        }
      }

      subRow.push(
        <th
          key={`sub-${node.key}`}
          className={`border border-[#E9E6E6] text-center ${bgClass} ${textClass} ${
            node.calculationType ? "w-15" : ""
          }`}
        >
          {content}
        </th>
      );
    }

    nodes.forEach(buildSubRow);
    allRows.push(subRow);

    return allRows;
  }, [
    nodes,
    originalMaxDepth,
    leafRowHeight,
    handleHResizeStart,
    openAssessmentInfoContextMenu,
    maxScores,
    setMaxScores,
    computedMaxValues,
    handleUpdateAssessment,
    handleNodeClick,
    handleNodeContextMenu,
  ]);

  return (
    <>
      {rowsToRender
        .filter((row) => row.length > 0)
        .map((row, i) => (
          <tr key={`header-row-${i}`}>{row}</tr>
        ))}
    </>
  );
}

export default React.memo(BuildHeaderRow);
