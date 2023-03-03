import { useCallback, useEffect, useRef } from "react";

function useInterval(callback: () => void, delay: number | undefined) {
  const tick = useCallback(() => callback && callback(), [callback]);
  const timer = useRef<number | undefined>();

  useEffect(() => {
    // delay must be a number
    if (!delay && delay !== 0) {
      return;
    }

    // clear the last timer when tick function change or delay change
    if (timer.current) {
      clearInterval(timer.current);
    }

    tick();
    timer.current = window.setInterval(() => tick(), delay);

    return () => clearInterval(timer.current);
  }, [delay, tick]);
}

export default useInterval;
