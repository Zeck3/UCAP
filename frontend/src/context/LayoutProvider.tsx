import React, { useState } from "react";
import { LayoutContext } from "./LayoutContext";
import type { LayoutType } from "./LayoutContext";

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [layout, setLayoutState] = useState<LayoutType>(
    () => (localStorage.getItem("adminLayoutPref") as LayoutType) || "cards"
  );

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const setLayout = (newLayout: LayoutType) => {
    setLayoutState(newLayout);
    localStorage.setItem("adminLayoutPref", newLayout);
  };

  return (
    <LayoutContext.Provider
      value={{ isSidebarOpen, toggleSidebar, layout, setLayout }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
