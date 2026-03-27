"use client";

import { forwardRef, SelectHTMLAttributes } from "react";

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  error?: string;
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, options, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className="text-xs font-medium text-slate-500 uppercase tracking-wide"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={id}
          className={[
            "w-full px-4 py-2.5 rounded-lg border bg-white text-[#0f172a] text-sm",
            "shadow-sm transition-all duration-200 outline-none min-h-[44px] appearance-none cursor-pointer",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-[#e2e8f0] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100",
          ].join(" ")}
          {...props}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-red-500 mt-0.5" style={{ animation: "shake 0.3s ease" }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormSelect.displayName = "FormSelect";
export default FormSelect;
