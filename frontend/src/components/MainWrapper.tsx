import type { ReactNode } from "react";

type MainWrapperProps = {
  children: ReactNode;
};

export default function MainWrapper({ children }: MainWrapperProps) {
  return (
    <main className="px-12 py-6.5 flex-1">
      <div className="mx-[250px]">{children}</div>
    </main>
  );
}
