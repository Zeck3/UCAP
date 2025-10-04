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
  if (loading) {
    return (
      <div className="flex flex-col gap-2 mt-6 mb-12 w-full animate-pulse">
        <div className="h-8 w-2/3 bg-gray-200 rounded-md" />
        <div className="h-6 w-1/2 bg-gray-200 rounded-md mt-4" />
        <div className="h-4 w-3/4 bg-gray-200 rounded-md mt-3" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 mt-6 mb-12 w-full">
      <h2 className="text-3xl font-base text-gray-800">{title}</h2>
      {subtitle && <p className="mt-2 text-xl text-gray-600">{subtitle}</p>}
      {details && <p className="mt-2 text-sm text-gray-500">{details}</p>}
    </div>
  );
}
