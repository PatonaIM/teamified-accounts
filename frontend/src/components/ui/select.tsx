import * as React from "react";
import { cn } from "../../lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, children, ...props }, ref) => {
    const selectId = props.id || React.useId();

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
              "appearance-none cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-destructive" : "border-input",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

export interface SelectOptionProps
  extends React.OptionHTMLAttributes<HTMLOptionElement> {}

export const SelectOption = React.forwardRef<HTMLOptionElement, SelectOptionProps>(
  ({ className, ...props }, ref) => (
    <option ref={ref} className={cn("", className)} {...props} />
  )
);
SelectOption.displayName = "SelectOption";

export interface SelectGroupProps
  extends React.OptgroupHTMLAttributes<HTMLOptGroupElement> {}

export const SelectGroup = React.forwardRef<HTMLOptGroupElement, SelectGroupProps>(
  (props, ref) => (
    <optgroup ref={ref} {...props} />
  )
);
SelectGroup.displayName = "SelectGroup";
