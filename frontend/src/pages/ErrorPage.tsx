import { useNavigate } from "react-router-dom";
import undrawPageBiten from "../assets/undraw_page-eaten.svg";

interface ErrorPageProps {
  title?: string;
  description?: string;
  buttonText?: string;
}

export default function ErrorPage({
  title = "Page Not Found",
  description = "Sorry, the page you're looking for doesn't exist or an error occurred.",
  buttonText = "Go Back",
}: ErrorPageProps) {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col pt-16">
      <div className="w-full flex flex-1">
        <div className="flex w-full justify-center items-center flex-col gap-8 text-center px-4">
          <img
            src={undrawPageBiten}
            alt="Error"
            className="h-50 w-50 max-w-xs"
          />
          <div className="flex flex-col gap-2">
            <h1 className="text-xl max-w-md font-semibold">{title}</h1>
            <p className="max-w-md">{description}</p>
          </div>
          <button
            onClick={goBack}
            className="bg-ucap-yellow bg-ucap-yellow-hover text-white px-6 py-2.5 rounded-full cursor-pointer transition text-base flex items-center gap-2"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
