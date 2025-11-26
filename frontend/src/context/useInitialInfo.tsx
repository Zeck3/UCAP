import { useContext } from "react";
import { InitialInfoContext } from "../context/InitialInfoContext";

export function useInitialInfo() {
  return useContext(InitialInfoContext);
}