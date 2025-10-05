import type { HeaderNode } from "../../data/TableHeaderConfig";
import type { JSX } from "react";
import { countLeaves, createResizeHandler, getHeaderClass, getTotalLeafCount, renderTitleLines } from "./ClassRecordFunctions";
import BuildSubRow from "./BuildSubRow";

export default function BuildHeaderRow(
  nodes: HeaderNode[],
  originalMaxDepth: number,
  openPopup: (title: string) => void,
  maxScores: Record<string, number>,
  setMaxScores: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  computedMaxValues: Record<string, number>,
  columnWidths: Record<string, number>,
  setColumnWidths: React.Dispatch<React.SetStateAction<Record<string, number>>>
): JSX.Element[][] {
  const newMaxDepth = originalMaxDepth + 1;
  const rows: JSX.Element[][] = Array.from({ length: newMaxDepth }, () => []);
  const hSeparators: JSX.Element[] = [];
  const buttonRow: JSX.Element[] = [];

  function build(node: HeaderNode, level: number) {
    if (node.type === "v-separator") {
      const handleMouseDown = createResizeHandler(
        setColumnWidths,
        `col-${level}-${node.title}`
      );

      rows[level].push(
        <th
          key={node.key || `vsep-${level}-${node.title}-${Math.random()}`}
          rowSpan={newMaxDepth - level}
          className="bg-ucap-blue w-1 border border-ucap-blue relative cursor-col-resize"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-0 right-0 h-full w-1 cursor-col-resize" />
        </th>
      );
      return;
    }

    if (node.type === "spacer") {
      rows[level].push(
        <th
          key={node.key || `spacer-${level}-${node.title}-${Math.random()}`}
          rowSpan={newMaxDepth - level}
          className="bg-white border border-[#E9E6E6]"
        />
      );
      return;
    }

    if (node.type === "h-separator") {
      hSeparators.push(
        <th
          key={node.key || `hsep-${level}-${Math.random()}`}
          colSpan={getTotalLeafCount(nodes)}
          className="bg-ucap-blue h-4 border border-ucap-blue p-0"
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
    if (node.customRowSpan) {
      rowSpan = node.customRowSpan;
    } else if (node.isRowSpan) {
      rowSpan = newMaxDepth - level;
    } else if (hasChildren) {
      rowSpan = 1;
    } else {
      rowSpan = 1;
    }

    const isLeafDeep =
      !hasChildren && level === originalMaxDepth - 1 && !node.computedGrades;

    const headerClass = getHeaderClass(node);

    rows[level].push(
      <th
        key={
          node.key ||
          `${level}-${node.type || node.title}-${Math.random()
            .toString(36)
            .slice(2, 9)}`
        }
        colSpan={colSpan}
        rowSpan={rowSpan}
        className={`border border-[#E9E6E6] p-2 text-center ${headerClass} ${
          isLeafDeep
            ? "[writing-mode:vertical-rl] text-left rotate-180 text-xs"
            : "whitespace-normal"
        } ${node.calculationType ? "w-[3.75rem]" : ""}`}
      >
        {renderTitleLines(node.title)}
      </th>
    );

    if (hasChildren) {
      node.children.forEach((child) => build(child, level + rowSpan));
    }
  }

  function addButtons(node: HeaderNode) {
    if (["v-separator", "spacer", "h-separator"].includes(node.type || "")) {
      return;
    }
    if (node.isRowSpan) {
      return;
    }
    if (node.customRowSpan) {
      return;
    }
    if (node.calculationType === "computed") {
      return;
    }
    if (node.children.length > 0) {
      node.children.forEach(addButtons);
    } else {
      if (node.needsButton) {
        buttonRow.push(
          <th
            key={`button-${node.key || node.title}-${Math.random()
              .toString(36)
              .slice(2, 9)}`}
            className={`border border-gray-200 p-0 text-center ${
              node.calculationType ? "w-[3.75rem]" : ""
            }`}
          >
            <button
              onClick={() => openPopup(node.title)}
              className="w-full h-full bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs py-1.5 px-2"
            >
              Info...
            </button>
          </th>
        );
      } else {
        let bgClass = "";
        if (node.calculationType === "roundedGrade") {
          bgClass = "bg-ucap-yellow";
        }
        buttonRow.push(
          <th
            key={`empty-${node.key || node.title}-${Math.random()
              .toString(36)
              .slice(2, 9)}`}
            className={`border border-[#E9E6E6] p-2 text-center ${bgClass} ${
              node.calculationType ? "w-[3.75rem]" : ""
            }`}
          />
        );
      }
    }
  }

  nodes.forEach((node) => build(node, 0));
  nodes.forEach((node) => addButtons(node));

  if (buttonRow.length > 0) {
    rows[originalMaxDepth] = buttonRow;
  }

  if (hSeparators.length > 0) {
    rows.push(hSeparators);
  }

  const subRow = BuildSubRow(
    nodes,
    maxScores,
    setMaxScores,
    computedMaxValues,
    columnWidths,
    setColumnWidths
  );
  if (subRow.length > 0) {
    rows.push(subRow);
  }

  return rows.filter((row) => row.length > 0);
}