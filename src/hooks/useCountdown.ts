import { useEffect, useState } from "react";

export function useCountdown(endTimestamp: number, serverOffset: number) {
  const [remaining, setRemaining] = useState(() => Math.max(0, endTimestamp - (Date.now() + serverOffset)));
  useEffect(() => {
    let frame = 0;
    const tick = () => { setRemaining(Math.max(0, endTimestamp - (Date.now() + serverOffset))); frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [endTimestamp, serverOffset]);
  return Math.ceil(remaining / 1000);
}