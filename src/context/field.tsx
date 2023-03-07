import { createContext, useContext } from "react";

export const FieldContext = createContext<{
  openHidableInfo: () => void;
  closeHidableInfo: () => void;
}>({
  openHidableInfo: () => undefined,
  closeHidableInfo: () => undefined,
});
export const useFieldContext = () => useContext(FieldContext);
