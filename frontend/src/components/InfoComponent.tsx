type InfoComponentProps = {
  title: string;
  subtitle?: string;
  details?: string;
};

export default function InfoComponent({
  title,
  subtitle,
  details,
}: InfoComponentProps) {
  return (
    <div className="flex flex-col gap-2 mt-6 mb-12 w-full">
      <h2 className="text-3xl font-base text-gray-800">{title}</h2>
      {subtitle && <p className="mt-2 text-xl text-gray-600">{subtitle}</p>}
      {details && <p className="mt-2 text-sm text-gray-500">{details}</p>}
    </div>
  );
}
