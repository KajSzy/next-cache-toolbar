"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/utils/cn";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "nct-fixed nct-inset-0 nct-z-50 nct-bg-black/80 data-[state=open]:nct-animate-in data-[state=closed]:nct-animate-out data-[state=closed]:nct-fade-out-0 data-[state=open]:nct-fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal
    container={window.document.getElementById("next-cache-toolbar")}
  >
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "nct-fixed nct-left-[50%] nct-top-[50%] nct-z-50 nct-grid nct-w-full nct-max-w-lg nct-translate-x-[-50%] nct-translate-y-[-50%] nct-gap-4 nct-border nct-bg-background nct-p-6 nct-shadow-lg nct-duration-200 data-[state=open]:nct-animate-in data-[state=closed]:nct-animate-out data-[state=closed]:nct-fade-out-0 data-[state=open]:nct-fade-in-0 data-[state=closed]:nct-zoom-out-95 data-[state=open]:nct-zoom-in-95 data-[state=closed]:nct-slide-out-to-left-1/2 data-[state=closed]:nct-slide-out-to-top-[48%] data-[state=open]:nct-slide-in-from-left-1/2 data-[state=open]:nct-slide-in-from-top-[48%] sm:nct-rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="nct-absolute nct-right-4 nct-top-4 nct-rounded-sm nct-opacity-70 nct-ring-offset-background nct-transition-opacity hover:nct-opacity-100 focus:nct-outline-none focus:nct-ring-2 focus:nct-ring-ring focus:nct-ring-offset-2 disabled:nct-pointer-events-none data-[state=open]:nct-bg-accent data-[state=open]:nct-text-muted-foreground">
        <X className="nct-h-4 nct-w-4" />
        <span className="nct-sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "nct-flex nct-flex-col nct-space-y-1.5 nct-text-center sm:nct-text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "nct-flex nct-flex-col-reverse sm:nct-flex-row sm:nct-justify-end sm:nct-space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "nct-text-lg nct-font-semibold nct-leading-none nct-tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("nct-text-sm nct-text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
