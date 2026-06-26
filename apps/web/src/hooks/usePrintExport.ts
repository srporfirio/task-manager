import { useCallback } from "react";

export function usePrintExport(bodyClass: string) {
  return useCallback(() => {
    document.body.classList.add(bodyClass);
    window.setTimeout(() => {
      window.print();
      document.body.classList.remove(bodyClass);
    }, 120);
  }, [bodyClass]);
}
