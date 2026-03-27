"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { CalendarDays } from "lucide-react";

interface FormDateProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormDate = forwardRef<HTMLInputElement, FormDateProps>(
  ({ label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className="text-xs font-medium text-slate-500 uppercase tracking-wide"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type="date"
            className={[
              "w-full px-4 py-2.5 pr-10 rounded-lg border bg-white text-[#0f172a] text-sm",
              "shadow-sm transition-all duration-200 outline-none min-h-[44px]",
              error
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-[#e2e8f0] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100",
            ].join(" ")}
            {...props}
          />
          <CalendarDays
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-0.5" style={{ animation: "shake 0.3s ease" }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormDate.displayName = "FormDate";
export default FormDate;
