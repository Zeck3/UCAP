import { useNavigate } from "react-router-dom";

export default function UnknownPage() {
  const navigate = useNavigate();
  const goToClassRecordPage = () => {
    navigate("/");
  };
  return (
    <div className="text-[#3E3E3E] min-h-screen flex flex-col">
      <header className="flex px-12 py-6.5">
        <div className="flex flex-start w-screen">
          <img src="/ucap-logo.svg" alt="uCAP Logo" className="h-22.5" />
        </div>
      </header>
      <main className="w-screen flex flex-1">
        <div className="flex w-full justify-center items-center flex-col gap-4">
          <img
            src="/not-found.svg"
            alt="Page Not Found"
            className="h-50 w-50"
          />
          <button
            onClick={goToClassRecordPage}
            className="bg-ucap-yellow bg-ucap-yellow-hover text-white px-4 py-2 rounded-full cursor-pointer transition text-lg"
          >
            Go to Login
          </button>
        </div>
      </main>
    </div>
  );
}
