import { Link, useLocation } from "react-router-dom";

export default function SideBarComponent() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);
  return (
    <div className="w-[250px] border-r border-[#E9E6E6] flex flex-col">
      <div className="pl-12 py-6.5 h-35.5">
        <div className="flex">
          <Link to="/course_dashboard">
            <img
              src="/ucap-logo.svg"
              alt="uCAP Logo"
              className="h-22.5 cursor-pointer"
            />
          </Link>
        </div>
      </div>
      <div className="flex flex-col flex-1 pt-6.5 gap-4">
        <Link to="/admin/user_dashboard" className="flex gap-5 items-center">
          <div
            className={`w-4 mr-2 h-full rounded-r ${
              isActive("/admin/user_dashboard") ? "bg-[#FCB315]" : "bg-transparent"
            }`}
          />
          <img src="/users.svg" alt="Generate" className="w-8 h-8" />
          <span className="text-lg hover:underline">User Management</span>
        </Link>

        <Link to="/admin/course_dashboard" className="flex gap-5 items-center">
          <div
            className={`w-4 mr-2 h-full rounded-r ${
              isActive("/admin/course_dashboard") ? "bg-[#FCB315]" : "bg-transparent"
            }`}
          />
          <img src="/courses.svg" alt="Generate" className="w-8 h-8" />
          <span className="text-lg hover:underline">Course Management</span>
        </Link>
      </div>
    </div>
  );
}
