type UserInputComponentProps = {
  label: string;
  name: string;
  onChange?: (name: string, value: string) => void;
};

export default function UserInputComponent({
  label,
  name,
  onChange,
}: UserInputComponentProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="block text-sm" htmlFor={name}>
        {label}
      </label>

      <input
        id={name}
        name={name}
        type="text"
        onChange={(e) => onChange?.(name, e.target.value)}
        className="w-full text-base h-10 px-3 py-2 border border-[#E9E6E6] rounded-md"
      />
    </div>
  );
}
