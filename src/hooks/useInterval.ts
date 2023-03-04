import { useCallback, useEffect, useRef } from "react";

function useInterval(callback: () => void, delay: number | undefined) {
  const tick = useCallback(() => callback && callback(), [callback]);

  useEffect(() => {
    // delay must be a number
    if (!delay && delay !== 0) {
      return;
    }

    tick();
    const id = window.setInterval(() => tick(), delay);

    return () => clearInterval(id);
  }, [delay, tick]);
}

export default useInterval;
