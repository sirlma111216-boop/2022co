import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border border-hairline bg-canvas px-4 py-3 text-body text-ink",
        "placeholder:text-ink-48 focus:border-action focus:outline-none focus:ring-2 focus:ring-action/25",
        "disabled:bg-canvas-parchment disabled:text-ink-48",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full resize-y rounded-md border border-hairline bg-canvas px-4 py-3 text-body leading-[1.6] text-ink",
      "placeholder:text-ink-48 focus:border-action focus:outline-none focus:ring-2 focus:ring-action/25",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "w-full appearance-none rounded-md border border-hairline bg-canvas px-4 py-3 text-body text-ink",
      "focus:border-action focus:outline-none focus:ring-2 focus:ring-action/25",
      className,
    )}
    {...props}
  />
));
Select.displayName = "Select";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-caption font-semibold text-ink-80", className)} {...props} />;
}
