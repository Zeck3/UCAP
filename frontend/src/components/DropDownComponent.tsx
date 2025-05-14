type DropdownProps = {
  label: string;
  name: string;
  options: string[];
};

export default function DropdownComponent({
  label,
  name,
  options,
}: DropdownProps) {
  return (
    <div>
      <label className="block text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        className="w-full px-4 py-2.5 border border-[#E9E6E6] rounded-md focus-ring-ucap-blue"
      >
        <option value="">Select {label}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
