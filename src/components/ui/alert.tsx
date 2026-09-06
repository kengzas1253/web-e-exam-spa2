import { type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-md border bg-card p-4 text-sm", className)} {...props} />;
}
