type InfoComponentProps = {
  title?: string;
  subtitle?: string;
  details?: string;
  loading?: boolean;
};

export default function InfoComponent({
  title,
  subtitle,
  details,
  loading = false,
}: InfoComponentProps) {
  const showTitle = title !== undefined;
  const showSubtitle = subtitle !== undefined;
  const showDetails = details !== undefined;

  if (loading) {
    return (
      <div className="flex flex-col gap-2 mt-6 mb-12 w-full animate-pulse">
        {showTitle && (
          <div className="h-8 w-2/3 bg-gray-200 rounded-md" />
        )}
        {showSubtitle && (
          <div className="h-6 w-1/2 bg-gray-200 rounded-md mt-4" />
        )}
        {showDetails && (
          <div className="h-4 w-3/4 bg-gray-200 rounded-md mt-3" />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-6 mb-12 w-full">
      {showTitle && (
        <h2 className="text-3xl font-base text-[#3E3E3E]">{title}</h2>
      )}

      {showSubtitle && subtitle && (
        <p className="mt-2 text-xl text-[#767676]">{subtitle}</p>
      )}

      {showDetails && details && (
        <p className="mt-2 text-sm text-[#767676]">{details}</p>
      )}
    </div>
  );
}
