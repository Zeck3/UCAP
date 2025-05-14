import { useLocation, Link, useNavigate } from "react-router-dom";

type HeaderProps = {
  pageTitle: string;
};

export default function HeaderComponent({ pageTitle }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const crumbs = getBreadcrumbs(location.pathname);

  const previousPath = crumbs.length > 1 ? crumbs[crumbs.length - 2].path : "/";

  function goBack() {
    navigate(previousPath);
  }

  return (
    <header className="flex px-12 py-6.5 border-b border-[#E9E6E6]">
      <div className="flex w-[250px]">
        <Link to="/course_dashboard">
          <img
            src="/ucap-logo.svg"
            alt="uCAP Logo"
            className="h-22.5 cursor-pointer"
          />
        </Link>
      </div>

      <div className="flex flex-1">
        <div className="flex flex-col justify-center">
          <nav className="text-sm flex items-center space-x-2">
            <img
              src="/dashboard-breadcrumb.svg"
              alt="Dashboard Icon"
              className="h-4 w-4 inline-block"
            />

            {crumbs.map((crumb, index) => (
              <span key={crumb.path} className="flex items-center">
                <Link
                  to={crumb.path}
                  className="hover:underline text-lg capitalize"
                >
                  {crumb.label}
                </Link>
                {index < crumbs.length - 1 && <span className="ml-2">/</span>}
              </span>
            ))}
          </nav>

          <div className="flex items-center space-x-2 mt-2">
            {crumbs.length > 1 && (
              <button
                onClick={goBack}
                className=" mr-8"
              >
                <img
                  src="/back-arrow.svg"
                  alt="Back Icon"
                  className="h-8 inline-block mr-2 cursor-pointer"
                />
              </button>
            )}
            <h1 className="text-3xl">{pageTitle}</h1>
          </div>
        </div>
      </div>

      <div className="flex w-[250px] justify-end items-center">
        <img
          src="/user.png"
          alt="User"
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="text-xl font-medium ml-4 mr-2 truncate">
          LeBron James
        </span>
        <img src="/down.svg" alt="Dropdown Arrow" className="w-4 h-4" />
      </div>
    </header>
  );
}

function getBreadcrumbs(pathname: string): { label: string; path: string }[] {
  const parts = pathname.split("/").filter(Boolean);

  return parts.map(function (segment, index) {
    const path = "/" + parts.slice(0, index + 1).join("/");

    const label = segment.replace(/_/g, " ").replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });

    return { label, path };
  });
}
