type DropdownProps = {
  label: string;
  name: string;
  options: string[];
  onChange?: (name: string, value: string) => void;
};

export default function DropdownComponent({
  label,
  name,
  options,
  onChange,
}: DropdownProps) {
  return (
    <div className="flex flex-col gap-1">
      {" "}
      <label className="block text-sm" htmlFor={name}>
        {" "}
        {label}{" "}
      </label>{" "}
      <select
        id={name}
        name={name}
        onChange={(e) => onChange?.(name, e.target.value)}
        className="w-full text-base h-10 px-2 border border-[#E9E6E6] rounded-md "
      >
        {" "}
        <option value=""></option>{" "}
        {options.map((option, index) => (
          <option key={index} value={option}>
            {" "}
            {option}{" "}
          </option>
        ))}{" "}
      </select>{" "}
    </div>
  );
}
