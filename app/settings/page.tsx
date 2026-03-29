"use client";

import { useState, useEffect, useCallback } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { Trash2, Pencil, X, Check, Upload, Loader2 } from "lucide-react";
import {
  getCompany,
  upsertCompany,
  getEmployers,
  createEmployer,
  deleteEmployer,
} from "@/lib/api";

/* ── Design tokens (exact match with department + employee pages) ── */

const inputClass =
  "w-full h-11 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all";

const textareaClass =
  "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all resize-none";

/* ── Reusable Field wrapper (same as employee page) ── */

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ── Types ── */

interface CompanyForm {
  companyName: string;
  address: string;
  email: string;
  phone: string;
}

interface Employer {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  _count?: { employees: number };
}

export default function SettingsPage() {
  /* ── Company state ── */
  const [company, setCompany] = useState<CompanyForm>({
    companyName: "",
    address: "",
    email: "",
    phone: "",
  });
  const [logoName, setLogoName] = useState<string>("");
  const [companySaving, setCompanySaving] = useState(false);
  const [companySaved, setCompanySaved] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

  /* ── Employer state ── */
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [employersLoading, setEmployersLoading] = useState(true);
  const [newEmployer, setNewEmployer] = useState({ name: "", address: "", phone: "" });
  const [employerSubmitting, setEmployerSubmitting] = useState(false);
  const [employerError, setEmployerError] = useState<string | null>(null);

  /* ── Inline edit state ── */
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", address: "", phone: "" });

  /* ══════ LOAD DATA ON MOUNT ══════ */

  const loadCompany = useCallback(async () => {
    try {
      const res = await getCompany();
      if (res.success && res.data) {
        setCompany({
          companyName: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
        });
      }
    } catch (err) {
      console.error("Failed to load company", err);
    }
  }, []);

  const loadEmployers = useCallback(async () => {
    try {
      setEmployersLoading(true);
      const res = await getEmployers();
      if (res.success) {
        setEmployers(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load employers", err);
    } finally {
      setEmployersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompany();
    loadEmployers();
  }, [loadCompany, loadEmployers]);

  /* ══════ COMPANY HANDLERS ══════ */

  function handleCompanyChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setCompany((prev) => ({ ...prev, [name]: value }));
    if (companySaved) setCompanySaved(false);
    if (companyError) setCompanyError(null);
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setLogoName(file.name);
  }

  async function handleCompanySave(e: React.FormEvent) {
    e.preventDefault();
    if (!company.companyName.trim()) {
      setCompanyError("Company name is required");
      return;
    }

    setCompanySaving(true);
    setCompanyError(null);
    try {
      await upsertCompany({
        name: company.companyName.trim(),
        email: company.email.trim() || undefined,
        phone: company.phone.trim() || undefined,
        address: company.address.trim() || undefined,
      });
      setCompanySaved(true);
      setTimeout(() => setCompanySaved(false), 3000);
    } catch (err: any) {
      setCompanyError(err.message || "Failed to save company settings");
    } finally {
      setCompanySaving(false);
    }
  }

  /* ══════ EMPLOYER HANDLERS ══════ */

  async function handleAddEmployer() {
    const trimmedName = newEmployer.name.trim();
    if (!trimmedName) return;

    setEmployerSubmitting(true);
    setEmployerError(null);
    try {
      await createEmployer({
        name: trimmedName,
        address: newEmployer.address.trim() || undefined,
        phone: newEmployer.phone.trim() || undefined,
      });
      setNewEmployer({ name: "", address: "", phone: "" });
      await loadEmployers();
    } catch (err: any) {
      setEmployerError(err.message || "Failed to add employer");
    } finally {
      setEmployerSubmitting(false);
    }
  }

  async function handleDeleteEmployer(id: string) {
    setEmployerError(null);
    try {
      await deleteEmployer(id);
      await loadEmployers();
    } catch (err: any) {
      setEmployerError(err.message || "Failed to delete employer");
    }
  }

  function handleStartEdit(emp: Employer) {
    setEditId(emp.id);
    setEditForm({ name: emp.name, address: emp.address || "", phone: emp.phone || "" });
  }

  function handleCancelEdit() {
    setEditId(null);
    setEditForm({ name: "", address: "", phone: "" });
  }

  /* ══════ RENDER ══════ */
  return (
    <PageContainer>

      {/* ══════════════════ PAGE HEADING ══════════════════ */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-800">Settings</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Manage company and employer information</p>
      </div>

      {/* ══════════════════ SECTION 1 — COMPANY SETTINGS ══════════════════ */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-neutral-700 mb-4">Company Settings</h2>

        {companyError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="flex-1">{companyError}</span>
            <button onClick={() => setCompanyError(null)} className="text-red-400 hover:text-red-600">
              <X size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleCompanySave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

            <Field label="Company Name" required>
              <input
                name="companyName"
                value={company.companyName}
                onChange={handleCompanyChange}
                placeholder="AutonomexAI Technologies"
                className={inputClass}
              />
            </Field>

            <Field label="Email">
              <input
                name="email"
                type="email"
                value={company.email}
                onChange={handleCompanyChange}
                placeholder="info@company.com"
                className={inputClass}
              />
            </Field>

            <Field label="Logo Upload">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 h-11 px-4 rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-600 cursor-pointer hover:bg-neutral-100 transition-all">
                  <Upload size={14} />
                  <span>{logoName || "Choose file"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </Field>

            <Field label="Phone">
              <input
                name="phone"
                value={company.phone}
                onChange={handleCompanyChange}
                placeholder="+91 98765 43210"
                className={inputClass}
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Address">
                <textarea
                  name="address"
                  value={company.address}
                  onChange={handleCompanyChange}
                  placeholder="#51-B, Behind Mahaveer school, Bailappanavar nagar, Hubli-29"
                  rows={3}
                  className={textareaClass}
                />
              </Field>
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3 mt-6">
            <button
              type="submit"
              disabled={companySaving}
              className="h-11 px-6 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {companySaving && <Loader2 size={14} className="animate-spin" />}
              Save Company Settings
            </button>
            {companySaved && (
              <span className="text-sm text-green-600 font-medium">✓ Saved successfully</span>
            )}
          </div>
        </form>
      </section>

      {/* ══════════════════ SECTION 2 — EMPLOYER MANAGEMENT ══════════════════ */}
      <section>
        <h2 className="text-base font-semibold text-neutral-700 mb-4">Employer Management</h2>

        {employerError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="flex-1">{employerError}</span>
            <button onClick={() => setEmployerError(null)} className="text-red-400 hover:text-red-600">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Add Employer Form ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Employer Name
            </label>
            <input
              value={newEmployer.name}
              onChange={(e) => setNewEmployer((p) => ({ ...p, name: e.target.value }))}
              placeholder="Full name"
              className={inputClass}
              disabled={employerSubmitting}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Address
            </label>
            <input
              value={newEmployer.address}
              onChange={(e) => setNewEmployer((p) => ({ ...p, address: e.target.value }))}
              placeholder="City, State"
              className={inputClass}
              disabled={employerSubmitting}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Phone
            </label>
            <input
              value={newEmployer.phone}
              onChange={(e) => setNewEmployer((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+91 ..."
              className={inputClass}
              disabled={employerSubmitting}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAddEmployer}
              disabled={!newEmployer.name.trim() || employerSubmitting}
              className="h-11 px-6 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {employerSubmitting && <Loader2 size={14} className="animate-spin" />}
              Add Employer
            </button>
          </div>
        </div>

        {/* ── Employer Table ── */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-neutral-700">
            Existing Employers
            <span className="text-xs font-normal text-neutral-400 ml-2">
              ({employers.length} total)
            </span>
          </h3>
        </div>

        {employersLoading ? (
          <div className="flex items-center justify-center py-16 text-neutral-400">
            <Loader2 size={24} className="animate-spin" />
            <span className="ml-2 text-sm">Loading…</span>
          </div>
        ) : employers.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 text-sm">
            No employers found. Add one above.
          </div>
        ) : (
          <div className="rounded-lg border border-neutral-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Address
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Phone
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap">
                    Employees
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {employers.map((emp, index) => (
                  <tr
                    key={emp.id}
                    className={[
                      "border-b border-neutral-100 last:border-0",
                      index % 2 === 0 ? "bg-white" : "bg-neutral-50/50",
                    ].join(" ")}
                  >
                    <td className="px-4 py-3 text-neutral-800 font-medium">
                      {editId === emp.id ? (
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                          className={inputClass}
                          autoFocus
                        />
                      ) : (
                        emp.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {editId === emp.id ? (
                        <input
                          value={editForm.address}
                          onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
                          className={inputClass}
                        />
                      ) : (
                        emp.address || "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                      {editId === emp.id ? (
                        <input
                          value={editForm.phone}
                          onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                          className={inputClass}
                        />
                      ) : (
                        emp.phone || "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-700 font-medium whitespace-nowrap">
                      {emp._count?.employees ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {editId === emp.id ? (
                          <>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
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
                              onClick={() => handleDeleteEmployer(emp.id)}
                              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 active:scale-[0.98] transition-all"
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(emp)}
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
        )}
      </section>

    </PageContainer>
  );
}
