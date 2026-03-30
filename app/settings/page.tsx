"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { Trash2, Pencil, X, Check, Upload, Loader2, Eye, KeyRound, EyeOff } from "lucide-react";
import {
  getCompany,
  upsertCompany,
  uploadLogo,
  getEmployers,
  updateEmployer,
  deleteEmployer,
  getAuthUsers,
  changePassword,
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
  employees?: any[];
}

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <SettingsPageContent />
    </ProtectedRoute>
  );
}

function SettingsPageContent() {
  const router = useRouter();

  /* ── Company state ── */
  const [company, setCompany] = useState<CompanyForm>({
    companyName: "",
    address: "",
    email: "",
    phone: "",
  });
  const [logoName, setLogoName] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [companySaving, setCompanySaving] = useState(false);
  const [companySaved, setCompanySaved] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

  /* ── Employer state ── */
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [employersLoading, setEmployersLoading] = useState(true);
  const [employerError, setEmployerError] = useState<string | null>(null);

  /* ── View Modal state ── */
  const [viewEmployer, setViewEmployer] = useState<Employer | null>(null);

  /* ── Password Change Modal state ── */
  const [showPwModal, setShowPwModal] = useState(false);

  /* ── Delete employer loading state ── */
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        if (res.data.logoUrl) {
          setLogoUrl(res.data.logoUrl);
          setLogoName("Current logo");
        }
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

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoName(file.name);
    setLogoUploading(true);
    try {
      const res = await uploadLogo(file);
      if (res.success && res.data?.logoUrl) {
        setLogoUrl(res.data.logoUrl);
      }
    } catch (err: any) {
      setCompanyError(err.message || "Logo upload failed");
    } finally {
      setLogoUploading(false);
    }
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



  async function handleDeleteEmployer(id: string) {
    setEmployerError(null);
    setDeletingId(id);
    try {
      await deleteEmployer(id);
      await loadEmployers();
    } catch (err: any) {
      setEmployerError(err.message || "Failed to delete employer");
    } finally {
      setDeletingId(null);
    }
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
                {logoUrl && (
                  <img
                    src={(() => {
                      if (logoUrl.startsWith('http')) return logoUrl;
                      let base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
                      if (base.endsWith('/api')) base = base.slice(0, -4);
                      return `${base}${logoUrl}`;
                    })()}
                    alt="Company Logo"
                    className="h-11 w-11 rounded-lg border border-neutral-200 object-contain bg-white"
                  />
                )}
                <label className="inline-flex items-center gap-2 h-11 px-4 rounded-lg border border-neutral-200 bg-neutral-50 text-sm text-neutral-600 cursor-pointer hover:bg-neutral-100 transition-all">
                  <Upload size={14} />
                  <span>{logoUploading ? "Uploading..." : (logoName || "Choose file")}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    disabled={logoUploading}
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

      {/* ══════════════════ SECTION 1.5 — PASSWORD MANAGEMENT ══════════════════ */}
      <section className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-700">Password Management</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Change login passwords for Employer or Admin accounts</p>
          </div>
          <button
            type="button"
            onClick={() => setShowPwModal(true)}
            className="h-9 px-4 rounded-lg bg-neutral-800 text-white text-xs font-semibold hover:bg-neutral-700 active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <KeyRound size={14} />
            Change Password
          </button>
        </div>
      </section>

      {/* ── Password Change Modal ── */}
      {showPwModal && <PasswordModal onClose={() => setShowPwModal(false)} />}

      {/* ══════════════════ SECTION 2 — EMPLOYER MANAGEMENT ══════════════════ */}
      <section>


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
                      {emp.name}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {emp.address || "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                      {emp.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-700 font-medium whitespace-nowrap">
                      {emp._count?.employees ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewEmployer(emp)}
                          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-neutral-200 bg-white text-neutral-600 text-xs font-semibold hover:bg-neutral-50 active:scale-[0.98] transition-all"
                        >
                          <Eye size={13} className="text-neutral-500" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const employeeId = emp.employees?.[0]?.id;
                            if (employeeId) {
                              router.push(`/employee?edit=${employeeId}`);
                            } else {
                              alert("No linked employee found to edit.");
                            }
                          }}
                          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-blue-200 bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 active:scale-[0.98] transition-all"
                        >
                          <Pencil size={13} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEmployer(emp.id)}
                          disabled={deletingId === emp.id}
                          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === emp.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          {deletingId === emp.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ══════════════════ MODAL — VIEW EMPLOYEE ══════════════════ */}
      {viewEmployer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="text-lg font-bold text-neutral-800">
                Employee Details
              </h3>
              <button
                onClick={() => setViewEmployer(null)}
                className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {viewEmployer.employees?.[0] ? (
                (() => {
                  const empData = viewEmployer.employees[0];
                  return (
                    <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                      <div>
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                          Full Name
                        </p>
                        <p className="text-sm font-medium text-neutral-900">
                          {empData.firstName} {empData.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                          Department
                        </p>
                        <p className="text-sm font-medium text-neutral-900">
                          {empData.department?.name || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                          Salary
                        </p>
                        <p className="text-sm font-medium text-neutral-900">
                          ₹{empData.salary.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                          Previous Salary
                        </p>
                        <p className="text-sm font-medium text-neutral-900">
                          {empData.previousSalary
                            ? `₹${empData.previousSalary.toLocaleString()}`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                          Phone
                        </p>
                        <p className="text-sm font-medium text-neutral-900">
                          {empData.phone || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                          Date of Birth
                        </p>
                        <p className="text-sm font-medium text-neutral-900">
                          {empData.dateOfBirth
                            ? new Date(empData.dateOfBirth).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                          Gender & Qualification
                        </p>
                        <p className="text-sm font-medium text-neutral-900">
                          {empData.gender || "—"} • {empData.qualification || "—"}
                        </p>
                      </div>
                      <div className="col-span-2 mt-2">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                          Address
                        </p>
                        <p className="text-sm font-medium text-neutral-900 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                          {empData.address || "No address provided."}
                        </p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="py-8 text-center text-neutral-500 text-sm">
                  No comprehensive employee record available for this entry.
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
              <button
                onClick={() => setViewEmployer(null)}
                className="h-10 px-5 rounded-lg bg-white border border-neutral-200 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 active:scale-[0.98] transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </PageContainer>
  );
}

/* ══════════════════ PASSWORD CHANGE MODAL ══════════════════ */

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    getAuthUsers()
      .then((res) => {
        if (res.success && res.data) {
          setUsers(res.data);
          if (res.data.length > 0) setSelectedUserId(res.data[0].userId);
        }
      })
      .catch((err) => setError(err.message || "Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!selectedUserId) {
      setError("Please select a user");
      return;
    }
    if (!newPassword.trim()) {
      setError("Please enter a new password");
      return;
    }
    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const res = await changePassword(selectedUserId, newPassword);
      setSuccess(`Password changed for ${res.data?.userId || selectedUserId}`);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const selectedUser = users.find((u) => u.userId === selectedUserId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
              <KeyRound size={14} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-800">Change Password</h3>
              <p className="text-[11px] text-neutral-400">Admin access only · No OTP required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-neutral-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {loading ? (
            <div className="flex items-center justify-center py-8 text-neutral-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="ml-2 text-sm">Loading users…</span>
            </div>
          ) : (
            <>
              {/* User selector */}
              <Field label="Select User">
                <select
                  value={selectedUserId}
                  onChange={(e) => { setSelectedUserId(e.target.value); setError(null); setSuccess(null); }}
                  className={inputClass}
                >
                  {users.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {u.userId} — {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </Field>

              {/* Selected user badge */}
              {selectedUser && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    selectedUser.role === "ADMIN"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {selectedUser.role}
                  </span>
                  <span className="text-xs text-neutral-600 font-medium">{selectedUser.name}</span>
                  <span className="text-xs text-neutral-400 ml-auto font-mono">{selectedUser.userId}</span>
                </div>
              )}

              {/* New password */}
              <Field label="New Password">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                    placeholder="Enter new password"
                    className={inputClass}
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>

              {/* Confirm password */}
              <Field label="Confirm Password">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                  placeholder="Re-enter new password"
                  className={inputClass}
                />
              </Field>
            </>
          )}

          {/* Error / Success messages */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700 font-medium">
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                <X size={12} />
              </button>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-xs text-green-700 font-medium">
              <Check size={14} />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="h-10 px-5 rounded-lg bg-white border border-neutral-200 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || loading}
            className="h-10 px-5 rounded-lg bg-neutral-800 text-white text-sm font-semibold hover:bg-neutral-700 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Saving…" : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
