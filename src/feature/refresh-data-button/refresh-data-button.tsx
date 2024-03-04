"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RefreshDataButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const refresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Button variant="outline" size="icon" onClick={refresh}>
      <Loader2
        className={cn("nct-h-4 nct-w-4", {
          "nct-animate-spin": isPending,
        })}
      />
    </Button>
  );
}
