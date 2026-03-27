"use client";

import { useState, useId } from "react";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import FormDate from "./FormDate";
import FormFile from "./FormFile";

interface FormFields {
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
  panCardNo: string;
  professionalTaxId: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

const INITIAL: FormFields = {
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
  panCardNo: "",
  professionalTaxId: "",
};

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!fields.firstName.trim()) errors.firstName = "This field is required";
  if (!fields.lastName.trim()) errors.lastName = "This field is required";
  if (!fields.phone.trim()) errors.phone = "This field is required";
  if (!fields.email.trim()) errors.email = "This field is required";
  return errors;
}

export default function EmployeeRegistrationForm() {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const [fields, setFields] = useState<FormFields>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(name: keyof FormFields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFields((prev) => ({ ...prev, [name]: e.target.value }));
      if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFields(INITIAL);
    setErrors({});
  }

  return (
    <div
      className="w-full rounded-2xl border border-[#e2e8f0] p-6 md:p-8"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        animation: "fadeSlideUp 0.4s ease both",
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#0f172a] text-balance">
          Registration form
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Fill in the employee details below. Fields marked with * are required.
        </p>
      </div>

      {submitted && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
          Employee registered successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* LEFT COLUMN */}
          <FormInput
            id={id("firstName")}
            label="First Name *"
            placeholder=" "
            value={fields.firstName}
            onChange={handleChange("firstName")}
            error={errors.firstName}
          />
          <FormInput
            id={id("lastName")}
            label="Last Name *"
            placeholder=" "
            value={fields.lastName}
            onChange={handleChange("lastName")}
            error={errors.lastName}
          />
          <FormInput
            id={id("phone")}
            label="Phone *"
            type="tel"
            placeholder=" "
            value={fields.phone}
            onChange={handleChange("phone")}
            error={errors.phone}
          />
          <FormInput
            id={id("address")}
            label="Address"
            placeholder=" "
            value={fields.address}
            onChange={handleChange("address")}
          />
          <FormDate
            id={id("dob")}
            label="DOB"
            value={fields.dob}
            onChange={handleChange("dob")}
          />
          <FormSelect
            id={id("gender")}
            label="Gender"
            options={["Male", "Female", "Other", "Prefer not to say"]}
            value={fields.gender}
            onChange={handleChange("gender")}
          />
          <FormSelect
            id={id("qualification")}
            label="Qualification"
            options={["10th", "12th", "Diploma", "B.Tech / B.E.", "B.Com", "MBA", "Other"]}
            value={fields.qualification}
            onChange={handleChange("qualification")}
          />
          <FormSelect
            id={id("profileType")}
            label="Profile type"
            options={["Full-time", "Part-time", "Contract", "Intern", "Consultant"]}
            value={fields.profileType}
            onChange={handleChange("profileType")}
          />
          <FormInput
            id={id("email")}
            label="Email address *"
            type="email"
            placeholder=" "
            value={fields.email}
            onChange={handleChange("email")}
            error={errors.email}
          />
          <FormInput
            id={id("previousCompany")}
            label="Previous company"
            placeholder=" "
            value={fields.previousCompany}
            onChange={handleChange("previousCompany")}
          />

          {/* RIGHT COLUMN — continues on md */}
          <FormInput
            id={id("previousSalary")}
            label="Previous salary (₹)"
            type="number"
            placeholder=" "
            value={fields.previousSalary}
            onChange={handleChange("previousSalary")}
          />
          <FormSelect
            id={id("department")}
            label="Department"
            options={["Accounts", "Production", "Sales", "HR", "Logistics", "Warehouse", "IT"]}
            value={fields.department}
            onChange={handleChange("department")}
          />
          <FormInput
            id={id("designation")}
            label="Designation"
            placeholder=" "
            value={fields.designation}
            onChange={handleChange("designation")}
          />
          <FormDate
            id={id("joiningDate")}
            label="Joining date"
            value={fields.joiningDate}
            onChange={handleChange("joiningDate")}
          />
          <FormInput
            id={id("salary")}
            label="Salary (₹)"
            type="number"
            placeholder=" "
            value={fields.salary}
            onChange={handleChange("salary")}
          />
          <FormInput
            id={id("permittedLeaves")}
            label="Permitted Leaves"
            type="number"
            placeholder=" "
            value={fields.permittedLeaves}
            onChange={handleChange("permittedLeaves")}
          />
          <FormFile
            id={id("idProof")}
            label="ID proof"
            accept=".jpg,.jpeg,.png,.pdf"
          />
          <FormInput
            id={id("panCardNo")}
            label="Pan card No"
            placeholder=" "
            value={fields.panCardNo}
            onChange={handleChange("panCardNo")}
          />
          <FormInput
            id={id("professionalTaxId")}
            label="Professional tax id"
            placeholder=" "
            value={fields.professionalTaxId}
            onChange={handleChange("professionalTaxId")}
          />
        </div>

        {/* Submit */}
        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            className="px-10 py-3 rounded-lg text-white font-semibold text-sm tracking-wide shadow-md
              transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-[0.97]
              min-h-[44px]"
            style={{
              background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
            }}
          >
            register
          </button>
        </div>
      </form>
    </div>
  );
}
