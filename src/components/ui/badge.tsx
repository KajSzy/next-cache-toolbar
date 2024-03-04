import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/utils/cn";

const badgeVariants = cva(
	"nct-inline-flex nct-items-center nct-rounded-full nct-border nct-px-2.5 nct-py-0.5 nct-text-xs nct-font-semibold nct-transition-colors focus:nct-outline-none focus:nct-ring-2 focus:nct-ring-ring focus:nct-ring-offset-2",
	{
		variants: {
			variant: {
				default:
					"nct-border-transparent nct-bg-primary nct-text-primary-foreground hover:nct-bg-primary/80",
				secondary:
					"nct-border-transparent nct-bg-secondary nct-text-secondary-foreground hover:nct-bg-secondary/80",
				destructive:
					"nct-border-transparent nct-bg-destructive nct-text-destructive-foreground hover:nct-bg-destructive/80",
				outline: "nct-text-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
