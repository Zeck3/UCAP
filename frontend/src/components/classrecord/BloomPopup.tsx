import { createPortal } from "react-dom";

const bloomLevels = [
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
];

interface BloomPopupProps {
  title: string;
  selections: Record<string, string[]>;
  onClose: () => void;
  onChange: (level: string) => void;
  currentItem: string;
}

export default function BloomPopup({
  title,
  selections,
  onClose,
  onChange,
  currentItem,
}: BloomPopupProps) {
  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center mb-4">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="ml-2 text-lg font-semibold">{title}</h2>
        </div>
        <hr className="border-t border-[#E9E6E6] mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {bloomLevels.map((level) => (
            <label key={level} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={(selections[currentItem] || []).includes(level)}
                onChange={() => onChange(level)}
                className="form-checkbox"
              />
              <span>{level}</span>
            </label>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
