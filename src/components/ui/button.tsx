import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
