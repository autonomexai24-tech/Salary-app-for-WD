"use client";

import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { Trash2, Pencil } from "lucide-react";

const INITIAL_DEPARTMENTS = [
  "Accounts",
  "Marketing Executive",
  "ClickHub",
  "WebDreams",
  "art",
  "Digital Marketing Executive",
  "Business Analyst",
  "Web Developer",
  "Web Designer",
];

const inputClass =
  "w-full h-11 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all";

export default function DepartmentPage() {
  const [name, setName] = useState("");
  const [departments] = useState<string[]>(INITIAL_DEPARTMENTS);

  return (
    <PageContainer>
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-800">Department Form</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Manage your organisation&apos;s departments
        </p>
      </div>

      {/* Add form */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Operations"
            className={inputClass}
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            className="h-11 px-6 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all whitespace-nowrap"
          >
            Add
          </button>
        </div>
      </div>

      {/* Table section */}
      <div>
        <h2 className="text-base font-semibold text-neutral-700 mb-3">
          Existing departments
        </h2>

        <div className="rounded-lg border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide w-full">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap">
                  Options
                </th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, index) => (
                <tr
                  key={dept}
                  className={[
                    "border-b border-neutral-100 last:border-0",
                    index % 2 === 0 ? "bg-white" : "bg-neutral-50/50",
                  ].join(" ")}
                >
                  <td className="px-4 py-3 text-neutral-800 font-medium">
                    {dept}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 active:scale-[0.98] transition-all"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-blue-200 bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 active:scale-[0.98] transition-all"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
