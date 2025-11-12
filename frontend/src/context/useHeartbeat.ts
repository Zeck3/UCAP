import { useEffect, useRef, useCallback } from "react";
import axiosClient from "../api/axiosClient";
import type { CurrentUser } from "../types/userManagementTypes";

export const useHeartbeat = (
  user: CurrentUser | null,
  idleTime = 2 * 60 * 1000
) => {
  const timeoutRef = useRef<number | null>(null);

  const sendHeartbeat = useCallback(async () => {
    try {
      await axiosClient.get("/heartbeat/");
    } catch {
      // Handle error silently
    }
  }, []);

  const resetHeartbeatTimer = useCallback(() => {
    if (!user) return;
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      sendHeartbeat();
    }, idleTime);
  }, [sendHeartbeat, idleTime, user]);

  useEffect(() => {
    if (!user) return;

    const events = ["mousemove", "keydown", "scroll", "click"];
    events.forEach((event) =>
      window.addEventListener(event, resetHeartbeatTimer)
    );

    resetHeartbeatTimer();

    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      events.forEach((event) =>
        window.removeEventListener(event, resetHeartbeatTimer)
      );
    };
  }, [resetHeartbeatTimer, user]);
};
