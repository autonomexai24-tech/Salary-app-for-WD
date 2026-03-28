"use client";

import { useEffect, useState, useCallback } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { Trash2, Pencil, Loader2, X, Check } from "lucide-react";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  type Department,
  type PaginationMeta,
} from "@/lib/api";

const inputClass =
  "w-full h-11 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all";

export default function DepartmentPage() {
  /* ───────── state ───────── */
  const [name, setName] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // inline edit
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  /* ───────── fetch ───────── */
  const fetchDepartments = useCallback(async (p: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDepartments(p, 10);
      setDepartments(res.data);
      setMeta(res.meta);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load departments";
      setError(message);
      console.error("Fetch departments error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments(page);
  }, [page, fetchDepartments]);

  /* ───────── create ───────── */
  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      setSubmitting(true);
      setError(null);
      await createDepartment(trimmed);
      setName("");
      setPage(1);
      await fetchDepartments(1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create department";
      setError(message);
      console.error("Create department error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  /* ───────── update ───────── */
  const handleUpdate = async (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;

    try {
      setSubmitting(true);
      setError(null);
      await updateDepartment(id, trimmed);
      setEditId(null);
      setEditName("");
      await fetchDepartments(page);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update department";
      setError(message);
      console.error("Update department error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  /* ───────── delete ───────── */
  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await deleteDepartment(id);
      await fetchDepartments(page);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete department";
      setError(message);
      console.error("Delete department error:", err);
    }
  };

  /* ───────── render ───────── */
  return (
    <PageContainer>
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-800">Department Form</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Manage your organisation&apos;s departments
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Add form */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="e.g. Operations"
            className={inputClass}
            disabled={submitting}
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleCreate}
            disabled={submitting || !name.trim()}
            className="h-11 px-6 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Add
          </button>
        </div>
      </div>

      {/* Table section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-neutral-700">
            Existing departments
            {meta && (
              <span className="text-xs font-normal text-neutral-400 ml-2">
                ({meta.total} total)
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-neutral-400">
            <Loader2 size={24} className="animate-spin" />
            <span className="ml-2 text-sm">Loading…</span>
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 text-sm">
            No departments found. Add one above.
          </div>
        ) : (
          <>
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
                      key={dept.id}
                      className={[
                        "border-b border-neutral-100 last:border-0",
                        index % 2 === 0 ? "bg-white" : "bg-neutral-50/50",
                      ].join(" ")}
                    >
                      <td className="px-4 py-3 text-neutral-800 font-medium">
                        {editId === dept.id ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleUpdate(dept.id)}
                            className={inputClass}
                            autoFocus
                          />
                        ) : (
                          dept.name
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {editId === dept.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdate(dept.id)}
                                disabled={submitting}
                                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-green-200 bg-green-50 text-green-600 text-xs font-semibold hover:bg-green-100 active:scale-[0.98] transition-all"
                              >
                                <Check size={13} />
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => { setEditId(null); setEditName(""); }}
                                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-neutral-200 bg-neutral-50 text-neutral-600 text-xs font-semibold hover:bg-neutral-100 active:scale-[0.98] transition-all"
                              >
                                <X size={13} />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDelete(dept.id)}
                                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 active:scale-[0.98] transition-all"
                              >
                                <Trash2 size={13} />
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => { setEditId(dept.id); setEditName(dept.name); }}
                                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-blue-200 bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 active:scale-[0.98] transition-all"
                              >
                                <Pencil size={13} />
                                Edit
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-neutral-500">
                  Page {meta.page} of {meta.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="h-9 px-4 rounded-md border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-9 px-4 rounded-md border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
