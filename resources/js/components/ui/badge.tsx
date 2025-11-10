import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-red-200 bg-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-200 [a&]:hover:bg-red-200 dark:[a&]:hover:bg-red-900/30 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-400/40",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success:
          "border-green-200 bg-green-100 text-green-800 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-200 [a&]:hover:bg-green-200 dark:[a&]:hover:bg-green-900/30 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-400/40",
        warning:
          "border-yellow-200 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800/50 dark:text-yellow-200 [a&]:hover:bg-yellow-200 dark:[a&]:hover:bg-yellow-900/30 focus-visible:ring-yellow-500/20 dark:focus-visible:ring-yellow-400/40",
        info:
          "border-blue-200 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-200 [a&]:hover:bg-blue-200 dark:[a&]:hover:bg-blue-900/30 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-400/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }