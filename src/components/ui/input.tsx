import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
