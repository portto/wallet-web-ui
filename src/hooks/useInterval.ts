import { useCallback, useEffect, useRef } from "react";

function useInterval(callback: () => void, delay: number | undefined) {
  const tick = useCallback(() => callback && callback(), [callback]);
  const timer = useRef<number | undefined>();
  useEffect(() => {
    // delay must be a number
    if (!delay && delay !== 0 && !callback) {
      return;
    }

    if (callback !== tick) {
      clearInterval(timer.current);
      timer.current = undefined;
    }

    const id = window.setInterval(tick, delay);
    timer.current = id;

    return () => clearInterval(timer.current);
  }, [delay, callback, tick]);
}

export default useInterval;
