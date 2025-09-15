import { useContext } from "react";
import { LayoutContext } from "./LayoutContext";

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) throw new Error("useLayout must be used inside LayoutProvider");
  return context;
};
