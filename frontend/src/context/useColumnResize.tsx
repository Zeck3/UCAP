import { useCallback } from "react";

export function useColumnResize(onResize: (key: string, newWidth: number) => void) {
  return useCallback(
    (key: string, startWidth: number) => (e: React.MouseEvent) => {
      const startX = e.clientX;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const diff = moveEvent.clientX - startX;
        const newWidth = startWidth + diff;
        onResize(key, newWidth);
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [onResize]
  );
}
