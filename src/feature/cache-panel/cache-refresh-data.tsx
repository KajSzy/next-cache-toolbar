"use client";

import * as serverActions from "@/actions/getCacheEntries";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useCachePanelContext } from "./cache-panel-context";

type Props = {
  interval: number;
  enabled: boolean;
};

export function RefreshDataButton({ enabled, interval }: Props) {
  const { setEntries } = useCachePanelContext();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const refreshData = () => {
    startTransition(async () => {
      const files = await serverActions.getCacheFiles();
      setEntries(files ?? []);
    });
  };

  useEffect(() => {
    console.log("pathname changed", pathname);
    refreshData();
  }, [pathname]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const intervalId = setInterval(refreshData, interval);
    return () => clearInterval(intervalId);
  }, [enabled, interval]);

  return (
    <Button variant="outline" size="icon" onClick={refreshData}>
      <Loader2
        className={cn("nct-h-4 nct-w-4", {
          "nct-animate-spin": isPending,
        })}
      />
    </Button>
  );
}
