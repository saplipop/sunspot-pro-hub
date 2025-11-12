import React, { useEffect, useState } from "react";
import loadingService from "@/services/loadingService";

const LoadingSpinner: React.FC = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = loadingService.onChange(setLoading);
    return () => unsub();
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full border-4 border-t-primary border-r-transparent animate-spin" />
        <span className="text-black text-sm">Please wait...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
