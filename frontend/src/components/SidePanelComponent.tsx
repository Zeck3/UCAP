import React from "react";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  panelFunction: string;
  submit: () => void;
  fullWidthRow?: boolean;
  buttonFunction: string;
}

export default function SidePanel({
  isOpen,
  onClose,
  children,
  panelFunction,
  submit,
  fullWidthRow = false, // default to false
  buttonFunction,
}: SidePanelProps) {
  const childrenArray = React.Children.toArray(children);
  const lastChild = fullWidthRow ? childrenArray.pop() : null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#3E3E3E] opacity-30 z-40"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-1/2 bg-white z-50 shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mx-16">
          {/* Header */}
          <div className="flex flex-row mt-18 mb-8.5">
            <button onClick={onClose} className="mr-8">
              <img
                src="/back-arrow.svg"
                alt="Back Icon"
                className="h-8 inline-block mr-2 cursor-pointer"
              />
            </button>
            <h1 className="text-3xl">{panelFunction}</h1>
          </div>

          <div className="border-t border-[#E9E6E6] w-full"></div>

          {/* Form body */}
          <div className="mt-12.5 grid grid-cols-2 gap-y-6 gap-x-4">
            {childrenArray}
          </div>

          {fullWidthRow && lastChild && (
            <div className="mt-6 col-span-2">{lastChild}</div>
          )}

          {/* Footer */}
          <div className="flex justify-center gap-4 mt-20">
            <button
              onClick={onClose}
              className="bg-white px-4 py-2 rounded-md border border-[#FCB315] cursor-pointer transition text-lg"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="bg-ucap-yellow bg-ucap-yellow-hover text-white px-4 py-2 rounded-md cursor-pointer transition text-lg"
            >
              {buttonFunction}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
