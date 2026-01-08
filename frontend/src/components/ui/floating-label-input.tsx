import * as React from "react";
import { cn } from "../../lib/utils";

export interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
}

export const FloatingLabelInput = React.forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(({ className, label, error, success, type = "text", ...props }, ref) => {
  const [focused, setFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const isActive = focused || hasValue;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  React.useEffect(() => {
    if (inputRef.current) {
      setHasValue(inputRef.current.value.length > 0);
    }
  }, [props.value]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type={type}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        className={cn(
          "peer w-full h-14 px-4 pt-5 pb-2 text-sm border rounded-md bg-background text-foreground",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          error
            ? "border-destructive focus:ring-destructive focus:border-destructive"
            : success
            ? "border-success focus:ring-success focus:border-success"
            : "border-input",
          props.disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      />
      <label
        className={cn(
          "absolute left-4 transition-all duration-200 pointer-events-none",
          isActive
            ? "top-2 text-xs"
            : "top-1/2 -translate-y-1/2 text-sm",
          isActive
            ? error
              ? "text-destructive"
              : success
              ? "text-success"
              : "text-primary"
            : "text-muted-foreground"
        )}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
});
FloatingLabelInput.displayName = "FloatingLabelInput";

export interface FloatingLabelTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  success?: boolean;
}

export const FloatingLabelTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FloatingLabelTextareaProps
>(({ className, label, error, success, ...props }, ref) => {
  const [focused, setFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const isActive = focused || hasValue;

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocused(false);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

  React.useEffect(() => {
    if (textareaRef.current) {
      setHasValue(textareaRef.current.value.length > 0);
    }
  }, [props.value]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        rows={4}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        className={cn(
          "peer w-full px-4 pt-6 pb-2 text-sm border rounded-md bg-background text-foreground resize-none",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          error
            ? "border-destructive focus:ring-destructive focus:border-destructive"
            : success
            ? "border-success focus:ring-success focus:border-success"
            : "border-input",
          props.disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      />
      <label
        className={cn(
          "absolute left-4 transition-all duration-200 pointer-events-none",
          isActive ? "top-2 text-xs" : "top-4 text-sm",
          isActive
            ? error
              ? "text-destructive"
              : success
              ? "text-success"
              : "text-primary"
            : "text-muted-foreground"
        )}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
});
FloatingLabelTextarea.displayName = "FloatingLabelTextarea";
