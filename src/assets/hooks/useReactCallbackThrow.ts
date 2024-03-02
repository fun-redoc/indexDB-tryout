import { useState } from "react";

// eslint-disable-next-line @typescript-eslint/ban-types
export default function useReactCallbackThrow(callback:Function) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setThrow] = useState();
  return (...args:unknown[]) => {
    try {
      callback(...args);
    } catch(e) {
      setThrow(() => {throw e});
    }
  }
}