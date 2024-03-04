"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/utils/cn"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "nct-z-50 nct-overflow-hidden nct-rounded-md nct-border nct-bg-popover nct-px-3 nct-py-1.5 nct-text-sm nct-text-popover-foreground nct-shadow-md nct-animate-in nct-fade-in-0 nct-zoom-in-95 data-[state=closed]:nct-animate-out data-[state=closed]:nct-fade-out-0 data-[state=closed]:nct-zoom-out-95 data-[side=bottom]:nct-slide-in-from-top-2 data-[side=left]:nct-slide-in-from-right-2 data-[side=right]:nct-slide-in-from-left-2 data-[side=top]:nct-slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
