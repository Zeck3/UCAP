import type { ReactNode } from "react";

type MainWrapperProps = {
  children: ReactNode;
  isAdmin?: boolean; // optional prop
};

export default function MainWrapper({ children, isAdmin = false }: MainWrapperProps) {
  return (
    <main className="px-12 py-6.5 flex-1">
      <div className={isAdmin ? "mr-[250px]" : "mx-[250px]"}>{children}</div>
    </main>
  );
}
