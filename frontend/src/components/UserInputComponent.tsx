type UserInputComponentProps = {
  label: string;
  name?: string;
};

export default function UserInputComponent({
  label,
  name,
}: UserInputComponentProps) {
  return (
    <div>
      <label className="block text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        className="w-full px-4 py-2 border border-[#E9E6E6] rounded-md focus-ring-ucap-blue"
      />
    </div>
  );
}
