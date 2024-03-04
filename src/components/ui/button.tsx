import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils/cn"

const buttonVariants = cva(
  "nct-inline-flex nct-items-center nct-justify-center nct-whitespace-nowrap nct-rounded-md nct-text-sm nct-font-medium nct-ring-offset-background nct-transition-colors focus-visible:nct-outline-none focus-visible:nct-ring-2 focus-visible:nct-ring-ring focus-visible:nct-ring-offset-2 disabled:nct-pointer-events-none disabled:nct-opacity-50",
  {
    variants: {
      variant: {
        default: "nct-bg-primary nct-text-primary-foreground hover:nct-bg-primary/90",
        destructive:
          "nct-bg-destructive nct-text-destructive-foreground hover:nct-bg-destructive/90",
        outline:
          "nct-border nct-border-input nct-bg-background hover:nct-bg-accent hover:nct-text-accent-foreground",
        secondary:
          "nct-bg-secondary nct-text-secondary-foreground hover:nct-bg-secondary/80",
        ghost: "hover:nct-bg-accent hover:nct-text-accent-foreground",
        link: "nct-text-primary nct-underline-offset-4 hover:nct-underline",
      },
      size: {
        default: "nct-h-10 nct-px-4 nct-py-2",
        sm: "nct-h-9 nct-rounded-md nct-px-3",
        lg: "nct-h-11 nct-rounded-md nct-px-8",
        icon: "nct-h-10 nct-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
