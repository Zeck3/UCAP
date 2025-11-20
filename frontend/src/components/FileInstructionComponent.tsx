import { useRef } from "react";

type FileInstructionModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  instructions?: string[];
  accept?: string;
  primaryLabel?: string;
  cancelLabel?: string;
  isProcessing?: boolean;
  onClose: () => void;
  onFileSelected: (file: File) => Promise<void> | void;
};

export default function FileInstructionComponent({
  isOpen,
  title,
  description,
  instructions = [],
  accept = "*/*",
  primaryLabel = "Choose file",
  cancelLabel = "Cancel",
  isProcessing = false,
  onClose,
  onFileSelected,
}: FileInstructionModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (isProcessing) return;
    onClose();
  };

  const handleInnerClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    try {
      await onFileSelected(file);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#3e3e3e30] flex items-center justify-center z-5000"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white p-6 rounded-xl space-y-4 mx-8 w-150 max-w-full border border-[#E9E6E6] shadow-sm"
        onClick={handleInnerClick}
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-[#767676]">{description}</p>
        </div>

        {instructions.length > 0 && (
          <ul className="text-xs list-disc pl-5 space-y-1 text-[#767676]">
            {instructions.map((text, idx) => (
              <li key={idx}>{text}</li>
            ))}
          </ul>
        )}

        <div className="space-y-2 pt-2">
          <button
            type="button"
            className="w-full bg-ucap-yellow bg-ucap-yellow-hover border border-[#ffc000] text-white py-2 rounded-md cursor-pointer disabled:opacity-60"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            {primaryLabel}
          </button>

          <button
            type="button"
            className="w-full py-2 border border-[#ffc000] rounded-md cursor-pointer disabled:opacity-60"
            onClick={onClose}
            disabled={isProcessing}
          >
            {cancelLabel}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}
