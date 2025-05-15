type ToolBarComponentProps = {
  title: string;
  isAdmin?: boolean;
  onCreateClick?: () => void;
  buttonText?: string;
};

export default function ToolBarComponent({
  title,
  isAdmin = false,
  onCreateClick,
  buttonText,
}: ToolBarComponentProps) {
  return (
    <div className="flex flex-row mb-9 items-center mt-6">
      <h2 className="text-3xl font-base flex-1">{title}</h2>
      <div className="flex flex-row gap-5 items-center">
        <div className="relative flex-1">
          <img
            src="/search.svg"
            alt="Search Icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-auto"
          />
          <input
            type="text"
            placeholder="Search"
            className="pl-12 pr-4 py-2 text-lg border border-[#E9E6E6] rounded-full w-full"
          />
        </div>

        {isAdmin && (
          <button
            onClick={onCreateClick}
            className="bg-ucap-yellow bg-ucap-yellow-hover text-white px-4 py-2 rounded-full cursor-pointer transition text-lg"
          >
            <img
              src="/plus-solid.svg"
              alt="Plus Icon"
              className="inline-block mr-2"
            />

            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}
