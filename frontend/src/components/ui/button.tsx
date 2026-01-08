import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-[#9333EA] text-white hover:bg-[#A855F7] active:bg-[#7C3AED]",
        secondary: "border border-[#9333EA] text-[#9333EA] bg-transparent hover:bg-[#9333EA]/10 active:bg-[#9333EA]/20",
        outline: "border border-border hover:bg-muted",
        ghost: "hover:bg-muted",
        destructive: "bg-destructive text-white hover:opacity-90",
        premium: "bg-[#F59E0B] text-white hover:bg-[#F59E0B]/90",
        danger: "bg-[#EF4444] text-white hover:bg-[#EF4444]/90",
      },
      size: { default: "h-10 px-4", sm: "h-9 px-3", lg: "h-11 px-6", icon: "h-10 w-10 p-0" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
);
Button.displayName = "Button";

