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
  disableSubmit?: boolean;
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
  disableSubmit = false,
}: SidePanelComponentProps) {
  const wrappedChildren = React.useMemo(() => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement<DisabledProp>(child)) {
        return React.cloneElement(child, {
          disabled: loading || disableInputs,
        });
      }
      return child;
    });
  }, [children, loading, disableInputs]);

  const panelWidth = React.useMemo(() => window.screen.width / 2, []);

  return (
    <div>
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#3E3E3E] opacity-30 z-4000"
          onClick={onClose}
        />
      )}
      <div
        style={{ width: `${panelWidth}px` }}
        className={`fixed top-0 right-0 h-full bg-white z-5000 shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="fixed px-12 z-1000 w-full flex flex-row items-center h-16 gap-8 border-b border-[#E9E6E6]">
          <button
            onClick={onClose}
            className="h-12 w-12 flex justify-center items-center cursor-pointer hover:bg-gray-100 rounded-full"
          >
            <BackIcon className="h-4 w-4" />
          </button>
          <h1 className="text-2xl">{panelFunction}</h1>
        </div>
        <div className="h-screen flex pt-16 flex-col">
          <div className="overflow-y-auto h-screen pb-20">
            {!disableInputs && (
              <div
                className={`grid ${
                  singleColumn ? "grid-cols-1" : "grid-cols-2"
                } gap-x-8 px-12 pt-8`}
              >
                {wrappedChildren}
              </div>
            )}
          </div>
          {!disableActions && (
            <div className="flex justify-center gap-4 pt-8 mb-8 border-t border-[#E9E6E6]">
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
                  if (!loading && !disableSubmit) onSubmit(e);
                }}
                disabled={loading || disableSubmit}
                className={`
                  text-white w-40 py-2 rounded-lg transition text-sm flex justify-center items-center
                  ${
                    loading || disableSubmit
                      ? "bg-[#E9D4A6] cursor-not-allowed opacity-50"
                      : "bg-ucap-yellow bg-ucap-yellow-hover cursor-pointer"
                  }
                `}
              >
                {loading ? (
                  <LoadingIcon className="h-4 w-4 animate-spin text-white" />
                ) : (
                  buttonFunction
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
