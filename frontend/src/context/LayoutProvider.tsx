import React, { useState, useEffect } from "react";
import { LayoutContext } from "./LayoutContext";
import type { LayoutType } from "./LayoutContext";

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layout, setLayoutState] = useState<LayoutType>("cards");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  useEffect(() => {
    const savedLayout = localStorage.getItem("layoutPref") as LayoutType;
    if (savedLayout) setLayoutState(savedLayout);

    const savedSidebar = localStorage.getItem("sidebarOpen");
    if (savedSidebar !== null) setIsSidebarOpen(savedSidebar === "true");
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebarOpen", newState.toString());
      return newState;
    });
  };

  const setLayout = (newLayout: LayoutType) => {
    setLayoutState(newLayout);
    localStorage.setItem("layoutPref", newLayout);
  };

  return (
    <LayoutContext.Provider value={{ layout, setLayout, isSidebarOpen, toggleSidebar }}>
      {children}
    </LayoutContext.Provider>
  );
};
