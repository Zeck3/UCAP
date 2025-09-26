import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "./useAuth";
import axiosClient from "../api/axiosClient";

const IDLE_TIMEOUT = 15 * 60 * 1000;
const HEARTBEAT_MIN_INTERVAL = 5 * 1000;

export function useIdleHeartbeat() {
  const { user, logout } = useAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHeartbeatRef = useRef<number>(0);

  const sendHeartbeat = useCallback(() => {
    const now = Date.now();
    if (now - lastHeartbeatRef.current > HEARTBEAT_MIN_INTERVAL) {
      axiosClient.get("/heartbeat/").catch(() => {});
      lastHeartbeatRef.current = now;
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (!user) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    sendHeartbeat();

    timeoutRef.current = setTimeout(() => {
      logout();
      alert("Logged out due to inactivity.");
    }, IDLE_TIMEOUT);
  }, [user, logout, sendHeartbeat]);

  useEffect(() => {
    if (!user) return;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, resetTimer]);
}
