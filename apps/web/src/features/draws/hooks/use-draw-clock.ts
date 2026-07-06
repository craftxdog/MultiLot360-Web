"use client";

import { useEffect, useState } from "react";

export function useDrawClock(interval = 1_000) {
  const [now, setNow] = useState<number>();

  useEffect(() => {
    let timer: number | undefined;

    function updateClock() {
      setNow(Date.now());
    }

    function stopClock() {
      if (timer !== undefined) window.clearInterval(timer);
      timer = undefined;
    }

    function startClock() {
      stopClock();
      updateClock();
      timer = window.setInterval(updateClock, interval);
    }

    function updateWhenVisible() {
      if (document.visibilityState === "visible") startClock();
      else stopClock();
    }

    updateWhenVisible();
    document.addEventListener("visibilitychange", updateWhenVisible);
    return () => {
      stopClock();
      document.removeEventListener("visibilitychange", updateWhenVisible);
    };
  }, [interval]);

  return now;
}
