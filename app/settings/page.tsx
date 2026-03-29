"use client";

import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { Trash2, Pencil, X, Check, Upload } from "lucide-react";

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

interface CompanySettings {
  companyName: string;
  address: string;
  email: string;
  phone: string;
}

interface Employer {
  id: string;
  name: string;
  address: string;
  phone: string;
  lastMonthSalary: string;
}

/* ── Mock data ── */

const MOCK_EMPLOYERS: Employer[] = [
  { id: "1", name: "Tanveer Rashiwale", address: "Hubli, Karnataka", phone: "+91 98765 43210", lastMonthSalary: "₹ 45,000" },
  { id: "2", name: "Rajesh Sharma", address: "Surat, Gujarat", phone: "+91 87654 32100", lastMonthSalary: "₹ 38,000" },
  { id: "3", name: "Priya Mehta", address: "Mumbai, Maharashtra", phone: "+91 76543 21000", lastMonthSalary: "₹ 52,000" },
];

export default function SettingsPage() {
  /* ── Company state ── */
  const [company, setCompany] = useState<CompanySettings>({
    companyName: "",
    address: "",
    email: "",
    phone: "",
  });
  const [logoName, setLogoName] = useState<string>("");
  const [companySaved, setCompanySaved] = useState(false);

  /* ── Employer state ── */
  const [employers, setEmployers] = useState<Employer[]>(MOCK_EMPLOYERS);
  const [newEmployer, setNewEmployer] = useState({ name: "", address: "", phone: "" });

  /* ── Inline edit state ── */
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", address: "", phone: "" });

  /* ── Company handlers ── */
  function handleCompanyChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setCompany((prev) => ({ ...prev, [name]: value }));
    if (companySaved) setCompanySaved(false);
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setLogoName(file.name);
  }

  function handleCompanySave(e: React.FormEvent) {
    e.preventDefault();
    // UI-only: just flash success
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 3000);
  }

  /* ── Employer handlers ── */
  function handleAddEmployer() {
    const trimmedName = newEmployer.name.trim();
    if (!trimmedName) return;

    const employer: Employer = {
      id: Date.now().toString(),
      name: trimmedName,
      address: newEmployer.address.trim(),
      phone: newEmployer.phone.trim(),
      lastMonthSalary: "—",
    };
    setEmployers((prev) => [employer, ...prev]);
    setNewEmployer({ name: "", address: "", phone: "" });
  }

  function handleDeleteEmployer(id: string) {
    setEmployers((prev) => prev.filter((e) => e.id !== id));
  }

  function handleStartEdit(emp: Employer) {
    setEditId(emp.id);
    setEditForm({ name: emp.name, address: emp.address, phone: emp.phone });
  }

  function handleSaveEdit(id: string) {
    setEmployers((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, name: editForm.name.trim(), address: editForm.address.trim(), phone: editForm.phone.trim() }
          : e
      )
    );
    setEditId(null);
    setEditForm({ name: "", address: "", phone: "" });
  }

  function handleCancelEdit() {
    setEditId(null);
    setEditForm({ name: "", address: "", phone: "" });
  }

  /* ── Render ── */
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
              className="h-11 px-6 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all whitespace-nowrap"
            >
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
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAddEmployer}
              disabled={!newEmployer.name.trim()}
              className="h-11 px-6 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
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

        {employers.length === 0 ? (
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
                    Last Month Salary
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
                        emp.address
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
                        emp.phone
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-700 font-medium whitespace-nowrap">
                      {emp.lastMonthSalary}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {editId === emp.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(emp.id)}
                              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-green-200 bg-green-50 text-green-600 text-xs font-semibold hover:bg-green-100 active:scale-[0.98] transition-all"
                            >
                              <Check size={13} />
                              Save
                            </button>
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
