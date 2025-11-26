import { useEffect } from "react";

type UserInputComponentProps = {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  showAsterisk?: boolean;
  error?: string;
  onChange: (name: string, value: string) => void;
  onClearError?: (name: string) => void;
  loading?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  numericOnly?: boolean;
  type?: React.HTMLInputTypeAttribute;
};

export default function UserInputComponent({
  label,
  name,
  value = "",
  required = false,
  showAsterisk = true,
  error,
  onChange,
  onClearError,
  loading = false,
  readOnly = false,
  maxLength,
  numericOnly = false,
  type = "text",
}: UserInputComponentProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const nextValue = numericOnly ? value.replace(/\D/g, "") : value;

    onChange(name, nextValue);

    if (onClearError) {
      onClearError(name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!numericOnly) return;

    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
    ];

    if (allowedKeys.includes(e.key)) return;

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (error && onClearError) {
      const timer = setTimeout(() => {
        onClearError(name);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, name, onClearError]);

  return (
    <div className="flex flex-col gap-1">
      <label className="flex text-sm text-[#767676]" htmlFor={name}>
        {label}
        {required && showAsterisk && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <input
        id={name}
        name={name}
        value={value}
        required={required}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={loading}
        readOnly={readOnly}
        inputMode={numericOnly ? "numeric" : undefined}
        maxLength={maxLength}
        type={type}
        autoComplete={name === "email" ? "email" : "off"}
        className={`w-full text-base h-10 px-3 py-2 border rounded-md ${
          error ? "border-red-500" : "border-[#E9E6E6]"
        } ${readOnly || loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />
      <div className="h-5">
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
