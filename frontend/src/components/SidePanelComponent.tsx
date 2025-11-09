import React from "react";
import BackIcon from "../assets/back-arrow.svg?react";
import LoadingIcon from "../assets/circle-regular.svg?react";

interface DisabledProp {
  disabled?: boolean;
}

interface SidePanelComponentProps {
  isOpen: boolean;
  onClose: () => void;
  children:
    | React.ReactElement<DisabledProp>
    | React.ReactElement<DisabledProp>[];
  panelFunction: string;
  onSubmit: (e: React.FormEvent) => void;
  buttonFunction: string;
  disableInputs?: boolean;
  disableActions?: boolean;
  loading?: boolean;
  singleColumn?: boolean;
}

export default function SidePanelComponent({
  isOpen,
  onClose,
  children,
  panelFunction,
  onSubmit,
  buttonFunction,
  disableInputs = false,
  disableActions = false,
  loading = false,
  singleColumn = false,
}: SidePanelComponentProps) {
  const wrappedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement<DisabledProp>(child)) {
      return React.cloneElement(child, { disabled: loading || disableInputs });
    }
    return child;
  });

  return (
    <div>
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#3E3E3E] opacity-30 z-40"
          onClick={onClose}
        />
      )}
      <div
        style={{ width: `${window.screen.width / 2}px` }}
        className={`fixed top-0 right-0 h-full bg-white z-50 shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="fixed px-12 z-100 w-full flex flex-row items-center h-16 gap-8 border-b border-[#E9E6E6]">
          <button
            onClick={onClose}
            className="h-12 w-12 flex justify-center items-center cursor-pointer hover:bg-gray-100 rounded-full"
          >
            <BackIcon className="h-4 w-4" />
          </button>
          <h1 className="text-2xl">{panelFunction}</h1>
        </div>
        <div className="h-screen flex pt-16 flex-col">
          <div className="overflow-y-auto h-screen">
            {!disableInputs && (
              <div
                className={`grid ${
                  singleColumn ? "grid-cols-1" : "grid-cols-2"
                } gap-x-8 px-12 pt-8`}
              >
                {wrappedChildren}
              </div>
            )}

            {!disableActions && (
              <div className="flex justify-center gap-4 mt-8 mb-8">
                <button
                  onClick={onClose}
                  className="bg-white w-40 py-2 rounded-lg border border-[#FCB315] cursor-pointer transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onSubmit(e);
                  }}
                  disabled={loading}
                  className={`text-white w-40 py-2 rounded-lg cursor-pointer transition text-sm flex justify-center items-center
                  ${
                    loading
                      ? "bg-[#E9D4A6] cursor-not-allowed"
                      : "bg-ucap-yellow bg-ucap-yellow-hover"
                  }`}
                >
                  {loading ? (
                    <LoadingIcon className="animate-spin h-4 w-4" />
                  ) : (
                    buttonFunction
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
