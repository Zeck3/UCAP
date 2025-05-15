type CourseInfoProps = {
  name: string;
  academicYear: string;
  semester: string;
  department: string;
  college: string;
  campus: string;
};

export default function CourseInfoComponent({
  name,
  academicYear,
  semester,
  department,
  college,
  campus,
}: CourseInfoProps) {
  return (
    <div className="flex flex-col gap-2 mt-6 mb-20">
      <h2 className="text-3xl font-base text-gray-800">{name}</h2>
      <p className="mt-2 text-xl text-gray-600">{academicYear} | {semester}</p>
      <p className="mt-2 text-sm text-gray-500">
        {department} | {college} | {campus}
      </p>
    </div>
  );
}
