import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import undrawPageBiten from "../assets/undraw_page-eaten.svg";
import UcapLogo from "../assets/ucap-logo.svg?react";

interface ClassRecordErrorProps {
  title?: string;
  description?: string;
  buttonText?: string;
}

export default function ClassRecordError({
  title = "Class Record Error",
  description = "Sorry, the page you're looking for doesn't exist or an error occurred.",
  buttonText = "Go Back",
}: ClassRecordErrorProps) {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const content = (
    <div className="fixed inset-0 z-50 bg-white text-[#3E3E3E] flex flex-col">
      <div className="flex px-12 py-6.5">
        <div className="flex items-center w-44">
          <button onClick={goBack} className="cursor-pointer">
            <UcapLogo className="h-16 w-32" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 justify-center items-center flex-col gap-8 text-center px-4">
        <img
          src={undrawPageBiten}
          alt="Error"
          className="h-50 w-50 max-w-xs"
        />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-[#767676] max-w-sm">{description}</p>
        </div>
        <button
          onClick={goBack}
          className="bg-ucap-yellow hover:bg-ucap-yellow-hover text-white px-6 py-2.5 rounded-full cursor-pointer transition text-base flex items-center gap-2"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );

  const portalRoot = document.getElementById("portal-root");
  return portalRoot ? createPortal(content, portalRoot) : content;
}
