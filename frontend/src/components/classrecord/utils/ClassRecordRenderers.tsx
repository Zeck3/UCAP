import type { JSX } from "react";

export function renderTitleLines(title: string): JSX.Element | string {
  if (title.includes("\n")) {
    return (
      <div className="text-left">
        {title.split("\n").map((line, i) => (
          <div key={i} className="leading-tight whitespace-normal">
            {line}
          </div>
        ))}
      </div>
    );
  }
  return title;
}