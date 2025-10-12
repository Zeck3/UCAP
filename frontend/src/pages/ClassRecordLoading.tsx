import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import LoadingIcon from "../assets/circle-regular.svg?react";

export default function ClassRecordLoading() {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    return () => {
      setFadeOut(true);
    };
  }, []);

  const content = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <LoadingIcon className="animate-spin h-16 w-16 text-ucap-yellow" />
    </div>
  );

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) return content;
  return createPortal(content, portalRoot);
}
