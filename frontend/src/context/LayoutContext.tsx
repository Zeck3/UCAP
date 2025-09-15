import { createContext } from "react";

export type LayoutType = "cards" | "list";

export type LayoutContextType = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  layout: LayoutType;
  setLayout: (layout: LayoutType) => void;
};

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);
