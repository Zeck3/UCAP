import type { HeaderNode } from "../../data/TableHeaderConfig";
import type { JSX } from "react";
import { computeComputedContent, createResizeHandler, formatValue, getCalculatedBg } from "./ClassRecordFunctions";

export default function BuildSubRow(
  nodes: HeaderNode[],
  maxScores: Record<string, number>,
  setMaxScores: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  computedMaxValues: Record<string, number>,
  columnWidths: Record<string, number>,
  setColumnWidths: React.Dispatch<React.SetStateAction<Record<string, number>>>
): JSX.Element[] {
  const subRow: JSX.Element[] = [];

  function build(node: HeaderNode) {
    if (node.type === "v-separator") {
      const handleMouseDown = createResizeHandler(
        setColumnWidths,
        `sub-col-${node.title}`
      );

      subRow.push(
        <th
          key={`sub-vsep-${
            node.key || node.title || Math.random().toString(36).slice(2, 9)
          }`}
          className="bg-ucap-blue w-1 border border-ucap-blue relative cursor-col-resize"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-0 right-0 h-full w-1 cursor-col-resize" />
        </th>
      );
      return;
    }

    if (node.type === "spacer") {
      subRow.push(
        <th
          key={`sub-spacer-${
            node.key || node.title || Math.random().toString(36).slice(2, 9)
          }`}
          className="bg-white w-20 border border-[#E9E6E6]"
        />
      );
      return;
    }

    if (node.type === "h-separator") {
      return;
    }

    if (node.isRowSpan) {
      subRow.push(
        <th
          key="sub-no-col"
          className="border border-[#E9E6E6] p-2 text-left font-bold"
        >
          No.
        </th>
      );
      subRow.push(
        <th
          key="sub-id-col"
          className="border border-[#E9E6E6] p-2 text-left font-bold"
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
      node.children.forEach(build);
    } else {
      let content: JSX.Element | string | number = "";
      let bgClass = getCalculatedBg(node.calculationType);
      let textClass = "";
      if (node.calculationType === "assignment" && node.key) {
        content = (
          <input
            type="number"
            value={node.key ? maxScores[node.key] : ""}
            onChange={(e) => {
              if (node.key) {
                if (typeof node.key === "string") {
                  setMaxScores((prev) => ({
                    ...prev,
                    [node.key as string]: Number(e.target.value),
                  }));
                }
              }
            }}
            className="w-full text-center bg-transparent border-none focus:outline-none text-coa-blue"
          />
        );
      } else if (node.key && computedMaxValues[node.key] !== undefined) {
        content = formatValue(
          computedMaxValues[node.key],
          node.calculationType
        );
        textClass = "text-coa-blue";
      } else if (node.calculationType === "computed" && node.key) {
        const mid = computedMaxValues["midterm-total-grade"] || 0;
        const fin = computedMaxValues["final-total-grade"] || 0;
        const { content: compContent, type } = computeComputedContent(
          mid,
          fin,
          node.key
        );
        content = compContent;
        bgClass = getCalculatedBg(type);
        textClass = "text-coa-blue";
      }
      subRow.push(
        <th
          key={`sub-${
            node.key ||
            node.title ||
            node.type ||
            Math.random().toString(36).slice(2, 9)
          }`}
          className={`border border-[#E9E6E6] p-2 text-center ${bgClass} ${textClass} ${
            node.calculationType ? "w-[3.75rem]" : ""
          }`}
        >
          {content}
        </th>
      );
    }
  }

  nodes.forEach(build);
  return subRow;
}