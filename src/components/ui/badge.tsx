import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning:
          "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        // LMS-style pill badges
        published:
          "border-transparent bg-badge-published text-white hover:bg-badge-published/80",
        draft:
          "border-transparent bg-badge-draft text-white hover:bg-badge-draft/80",
        paid:
          "border-transparent bg-badge-paid text-white hover:bg-badge-paid/80",
        free:
          "border-transparent bg-badge-free text-white hover:bg-badge-free/80",
        // Revision status badges
        due:
          "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        overdue:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        snoozed:
          "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
        completed:
          "border-transparent bg-success text-success-foreground hover:bg-success/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
