"use client";

import { forwardRef, InputHTMLAttributes, useRef, useState } from "react";
import { Paperclip } from "lucide-react";

interface FormFileProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

const FormFile = forwardRef<HTMLInputElement, FormFileProps>(
  ({ label, error, id, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>("");

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className="text-xs font-medium text-slate-500 uppercase tracking-wide"
        >
          {label}
        </label>
        <div
          onClick={() => internalRef.current?.click()}
          className={[
            "flex items-center gap-3 px-4 py-2.5 rounded-lg border bg-white cursor-pointer",
            "shadow-sm transition-all duration-200 min-h-[44px]",
            error
              ? "border-red-400"
              : "border-[#e2e8f0] hover:border-indigo-400 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100",
          ].join(" ")}
        >
          <Paperclip size={15} className="text-indigo-400 shrink-0" />
          <span className="text-sm text-slate-400 truncate">
            {fileName || "Choose file…"}
          </span>
        </div>
        <input
          ref={(node) => {
            (internalRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
          }}
          id={id}
          type="file"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setFileName(file ? file.name : "");
            props.onChange?.(e);
          }}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 mt-0.5" style={{ animation: "shake 0.3s ease" }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormFile.displayName = "FormFile";
export default FormFile;
