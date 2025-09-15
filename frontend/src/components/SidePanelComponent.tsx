import React, { useState } from "react";
import BackIcon from "../assets/back-arrow.svg?react";

interface SidePanelComponentProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  panelFunction: string;
  submit: (formData: Record<string, string>) => void;
  fullWidthRow?: boolean;
  buttonFunction: string;
  disableInputs?: boolean;
  disableActions?: boolean;
}

interface FormFieldProps {
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  disabled?: boolean;
}

export default function SidePanelComponent({
  isOpen,
  onClose,
  children,
  panelFunction,
  submit,
  fullWidthRow = false,
  buttonFunction,
  disableInputs = false,
  disableActions = false,
}: SidePanelComponentProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement<FormFieldProps>(child)) {
      return React.cloneElement(child, {
        onChange: handleChange,
        value: formData[child.props.name] ?? "",
        disabled: disableInputs,
      });
    }
    return child;
  });

  const childrenArray = React.Children.toArray(childrenWithProps);
  const lastChild = fullWidthRow ? childrenArray.pop() : null;

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
        <div className="mx-12 pt-8">
          <div className="flex flex-row items-center h-16 gap-8 border-b border-[#E9E6E6]">
            <button
              onClick={onClose}
              className="h-12 w-12 flex justify-center items-center cursor-pointer hover:bg-gray-100 rounded-full"
            >
              <BackIcon className="h-4 w-4" />
            </button>
            <h1 className="text-2xl">{panelFunction}</h1>
          </div>

          {!disableInputs && (
            <div className="grid grid-cols-2 gap-y-6 gap-x-8 mt-6">
              {childrenArray}
            </div>
          )}

          {fullWidthRow && lastChild && (
            <div className="mt-6 col-span-2">{lastChild}</div>
          )}

          {!disableActions && (
            <div className="flex justify-center gap-4 mt-16">
              <button
                onClick={onClose}
                className="bg-white w-40 py-2 rounded-lg border border-[#FCB315] cursor-pointer transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => submit(formData)}
                className="bg-ucap-yellow bg-ucap-yellow-hover text-white w-40 py-2 rounded-lg cursor-pointer transition text-sm"
              >
                {buttonFunction}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
