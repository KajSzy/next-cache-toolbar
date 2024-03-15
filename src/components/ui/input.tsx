import * as React from "react";
import { cn } from "@/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "nct-flex nct-h-10 nct-w-full nct-rounded-md nct-border nct-border-input nct-bg-background nct-px-3 nct-py-2 nct-text-sm nct-ring-offset-background file:nct-border-0 file:nct-bg-transparent file:nct-text-sm file:nct-font-medium placeholder:nct-text-muted-foreground focus-visible:nct-outline-none focus-visible:nct-ring-2 focus-visible:nct-ring-ring focus-visible:nct-ring-offset-2 disabled:nct-cursor-not-allowed disabled:nct-opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
