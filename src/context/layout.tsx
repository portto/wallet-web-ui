import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import Layout, { LayoutSizeType } from "src/components/Layout";

const LayoutContext = createContext<{
  setLayoutSize?: Dispatch<SetStateAction<LayoutSizeType>>;
}>({});

export const LayoutProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [layoutSize, setLayoutSize] = useState<LayoutSizeType>("sm");
  return (
    <LayoutContext.Provider value={{ setLayoutSize }}>
      <Layout size={layoutSize}>{children}</Layout>
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => useContext(LayoutContext);
