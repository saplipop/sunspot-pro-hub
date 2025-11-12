import { useEffect } from "react";
import { STORAGE_CHANGE_EVENT } from "@/lib/storage";

/**
 * Hook to automatically sync component state with storage changes
 * @param callback Function to call when storage changes
 */
export function useRealTimeSync(callback: () => void) {
  useEffect(() => {
    // Initial load
    callback();

    // Listen for storage changes
    const handleChange = () => {
      callback();
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleChange);

    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleChange);
    };
  }, [callback]);
}
