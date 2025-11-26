import { useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import type { UserInitialInfo } from "../types/userTypes";
import { fetchUserInitialInfo } from "../api/userInitialInfoApi";
import { InitialInfoContext } from "./InitialInfoContext";

export function InitialInfoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, initialized } = useAuth();
  const [initialInfo, setInitialInfo] = useState<UserInitialInfo | null>(null);
  const [initialInfoLoading, setInitialInfoLoading] = useState(true);
  const lastUserIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!initialized || !user) {
      setInitialInfo(null);
      setInitialInfoLoading(false);
      lastUserIdRef.current = null;
      return;
    }
    if (lastUserIdRef.current === user.user_id) return;
    lastUserIdRef.current = user.user_id;

    setInitialInfoLoading(true);
    fetchUserInitialInfo()
      .then(setInitialInfo)
      .finally(() => setInitialInfoLoading(false));
  }, [initialized, user]);

  const primaryDepartment =
    initialInfo?.primary_department ?? initialInfo?.departments?.[0] ?? null;

  const primaryCollege = initialInfo?.primary_college ?? null;
  const primaryCampus = initialInfo?.primary_campus ?? null;

  return (
    <InitialInfoContext.Provider
      value={{
        initialInfo,
        initialInfoLoading,
        primaryDepartment,
        primaryCollege,
        primaryCampus,
      }}
    >
      {children}
    </InitialInfoContext.Provider>
  );
}
