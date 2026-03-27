"use client";

import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";

interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dob: string;
  gender: string;
  qualification: string;
  profileType: string;
  email: string;
  previousCompany: string;
  previousSalary: string;
  department: string;
  designation: string;
  joiningDate: string;
  salary: string;
  permittedLeaves: string;
  idProof: string;
  panCard: string;
  professionalTaxId: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

const initialState: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  dob: "",
  gender: "",
  qualification: "",
  profileType: "",
  email: "",
  previousCompany: "",
  previousSalary: "",
  department: "",
  designation: "",
  joiningDate: "",
  salary: "",
  permittedLeaves: "",
  idProof: "",
  panCard: "",
  professionalTaxId: "",
};

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full h-11 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all";

const selectClass =
  "w-full h-11 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer";

export default function EmployeePage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "This field is required";
    if (!form.lastName.trim()) newErrors.lastName = "This field is required";
    if (!form.phone.trim()) newErrors.phone = "This field is required";
    if (!form.email.trim()) newErrors.email = "This field is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-neutral-800">Employee Registered</p>
          <p className="text-sm text-neutral-500">
            {form.firstName} {form.lastName} has been successfully registered.
          </p>
          <button
            onClick={() => { setForm(initialState); setSubmitted(false); }}
            className="mt-2 h-11 px-6 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            Register Another
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-800">Registration Form</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Add a new employee to the system</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

          {/* ── LEFT COLUMN ── */}

          {/* First Name */}
          <Field label="First Name" required error={errors.firstName}>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Rajesh"
              className={[inputClass, errors.firstName ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100" : ""].join(" ")}
            />
          </Field>

          {/* Previous Salary (right col row 1) */}
          <Field label="Previous Salary">
            <input
              name="previousSalary"
              value={form.previousSalary}
              onChange={handleChange}
              placeholder="₹ 28,000"
              className={inputClass}
            />
          </Field>

          {/* Last Name */}
          <Field label="Last Name" required error={errors.lastName}>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Sharma"
              className={[inputClass, errors.lastName ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100" : ""].join(" ")}
            />
          </Field>

          {/* Department */}
          <Field label="Department">
            <select name="department" value={form.department} onChange={handleChange} className={selectClass}>
              <option value="">Select department</option>
              <option>Production</option>
              <option>Accounts</option>
              <option>Logistics</option>
              <option>HR</option>
              <option>Quality Control</option>
            </select>
          </Field>

          {/* Phone */}
          <Field label="Phone" required error={errors.phone}>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className={[inputClass, errors.phone ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100" : ""].join(" ")}
            />
          </Field>

          {/* Designation */}
          <Field label="Designation">
            <input
              name="designation"
              value={form.designation}
              onChange={handleChange}
              placeholder="Senior Technician"
              className={inputClass}
            />
          </Field>

          {/* Address */}
          <Field label="Address">
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="42, Gandhi Nagar, Surat — 395001"
              className={inputClass}
            />
          </Field>

          {/* Joining Date */}
          <Field label="Joining Date">
            <input
              type="date"
              name="joiningDate"
              value={form.joiningDate}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          {/* DOB */}
          <Field label="Date of Birth">
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          {/* Salary */}
          <Field label="Salary">
            <input
              name="salary"
              value={form.salary}
              onChange={handleChange}
              placeholder="₹ 35,000"
              className={inputClass}
            />
          </Field>

          {/* Gender */}
          <Field label="Gender">
            <select name="gender" value={form.gender} onChange={handleChange} className={selectClass}>
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </Field>

          {/* Permitted Leaves */}
          <Field label="Permitted Leaves">
            <input
              name="permittedLeaves"
              value={form.permittedLeaves}
              onChange={handleChange}
              placeholder="12 days / year"
              className={inputClass}
            />
          </Field>

          {/* Qualification */}
          <Field label="Qualification">
            <select name="qualification" value={form.qualification} onChange={handleChange} className={selectClass}>
              <option value="">Select qualification</option>
              <option>10th Pass</option>
              <option>12th Pass</option>
              <option>ITI / Diploma</option>
              <option>Graduate</option>
              <option>Post Graduate</option>
            </select>
          </Field>

          {/* ID Proof */}
          <Field label="ID Proof">
            <select name="idProof" value={form.idProof} onChange={handleChange} className={selectClass}>
              <option value="">Select ID type</option>
              <option>Aadhaar Card</option>
              <option>Voter ID</option>
              <option>Passport</option>
              <option>Driving Licence</option>
            </select>
          </Field>

          {/* Profile Type */}
          <Field label="Profile Type">
            <select name="profileType" value={form.profileType} onChange={handleChange} className={selectClass}>
              <option value="">Select profile type</option>
              <option>Full-Time</option>
              <option>Part-Time</option>
              <option>Contract</option>
              <option>Apprentice</option>
            </select>
          </Field>

          {/* PAN Card No */}
          <Field label="PAN Card No">
            <input
              name="panCard"
              value={form.panCard}
              onChange={handleChange}
              placeholder="ABCDE1234F"
              className={inputClass}
            />
          </Field>

          {/* Email Address */}
          <Field label="Email Address" required error={errors.email}>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="rajesh.sharma@example.com"
              className={[inputClass, errors.email ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100" : ""].join(" ")}
            />
          </Field>

          {/* Professional Tax ID */}
          <Field label="Professional Tax ID">
            <input
              name="professionalTaxId"
              value={form.professionalTaxId}
              onChange={handleChange}
              placeholder="PT-GJ-2024-00821"
              className={inputClass}
            />
          </Field>

          {/* Previous Company */}
          <Field label="Previous Company">
            <input
              name="previousCompany"
              value={form.previousCompany}
              onChange={handleChange}
              placeholder="Tata Textiles Pvt. Ltd."
              className={inputClass}
            />
          </Field>

          {/* empty right-col spacer to keep grid balanced */}
          <div className="hidden md:block" />

        </div>

        {/* Submit */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="h-11 px-10 rounded-lg bg-blue-600 text-white text-sm font-semibold tracking-wide uppercase hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm"
          >
            Register
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
