"use client";

import { forwardRef, useState, InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, id, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasValue = Boolean(props.value || props.defaultValue);
    const floated = focused || hasValue;

    return (
      <div className="relative flex flex-col gap-1">
        {/* Floating label */}
        <label
          htmlFor={id}
          className={[
            "absolute left-4 pointer-events-none transition-all duration-200 origin-left",
            floated
              ? "-top-2.5 text-[10px] font-semibold bg-white px-1 left-3 text-indigo-600 uppercase tracking-wide"
              : "top-2.5 text-sm text-slate-400",
          ].join(" ")}
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={[
            "w-full px-4 py-2.5 rounded-lg border bg-white text-[#0f172a] text-sm",
            "shadow-sm transition-all duration-200 outline-none min-h-[44px]",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-[#e2e8f0] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100",
          ].join(" ")}
          {...props}
        />
        {error && (
          <p
            className="text-xs text-red-500 mt-0.5"
            style={{ animation: "shake 0.3s ease" }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormInput.displayName = "FormInput";
export default FormInput;
