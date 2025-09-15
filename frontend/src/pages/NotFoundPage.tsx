import { useNavigate } from "react-router-dom";
import emptyImage from "../assets/not-found.svg";
import UcapLogo from "../assets/ucap-logo.svg?react";

export default function UnknownPage() {
  const navigate = useNavigate();
const goBack = () => {
  navigate(-1);
};

  return (
    <div className="text-[#3E3E3E] min-h-screen flex flex-col">
      <header className="flex px-12 py-6.5">
        <div className="flex items-center w-44">
          <button onClick={goBack} className="cursor-pointer">
            <UcapLogo className="h-16 w-32" />
          </button>
        </div>
      </header>
      <main className="w-screen flex flex-1">
        <div className="flex w-full justify-center items-center flex-col gap-8">
          <img src={emptyImage} alt="Page Not Found" className="h-50 w-50" />
          <button
            onClick={goBack}
            className="bg-ucap-yellow bg-ucap-yellow-hover text-white px-4 py-2 rounded-full cursor-pointer transition text-base flex items-center gap-2"
          >
            Go Back
          </button>
        </div>
      </main>
    </div>
  );
}
