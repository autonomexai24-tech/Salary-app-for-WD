"use client";

import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";

interface SalaryForm {
  employees: string;
  month: string;
  year: string;
  workingDays: string;
  workingHours: string;
  basicSalary: string;
  incentive: string;
  arrears: string;
  tada: string;
  bonus: string;
  paidLeaves: string;
  leavesTaken: string;
  otHours: string;
  fullMonthMinusMinutes: string;
  minusMinutesRupees: string;
  professionalTax: string;
  advanceTaken: string;
  additionalAdvance: string;
  advanceDeducted: string;
  advanceRemaining: string;
  extraFine: string;
  emi: string;
  netSalary: string;
}

interface FormErrors {
  employees?: string;
  month?: string;
  year?: string;
}

const EMPLOYEES = [
  "Rajesh Sharma",
  "Priya Mehta",
  "Amit Verma",
  "Sunita Patel",
  "Vikram Singh",
];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const YEARS = ["2022","2023","2024","2025","2026"];

const empty: SalaryForm = {
  employees:"",month:"",year:"",workingDays:"",workingHours:"",
  basicSalary:"",incentive:"",arrears:"",tada:"",bonus:"",
  paidLeaves:"",leavesTaken:"",otHours:"",fullMonthMinusMinutes:"",
  minusMinutesRupees:"",professionalTax:"",advanceTaken:"",
  additionalAdvance:"",advanceDeducted:"",advanceRemaining:"",
  extraFine:"",emi:"",netSalary:"",
};

const base = "w-full h-11 rounded-lg border px-3 text-sm text-neutral-800 focus:outline-none focus:ring-2 transition-all";
const inputCls = `${base} border-neutral-200 bg-neutral-50 placeholder:text-neutral-400 focus:border-blue-500 focus:bg-white focus:ring-blue-100`;
const selectCls = `${base} border-neutral-200 bg-neutral-50 focus:border-blue-500 focus:bg-white focus:ring-blue-100 appearance-none cursor-pointer`;
const selectErrCls = `${base} border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100 appearance-none cursor-pointer`;

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
      {text}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-neutral-100 last:border-0">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-sm font-semibold text-neutral-800">{value}</span>
    </div>
  );
}

/* ── Payslip columns ── */
const PAYSLIP_COLS = [
  "Basic","Incentives","Bonus","TA/DA","Arrears",
  "Prof.tax","Adv.pay","Addition adv","Adv deducted",
  "Adv remaining","Extra fine","Leave penalty","Time penalty",
];
const PAYSLIP_VALS = [
  "19000","0","0","0","0",
  "200","0","0","0",
  "0","210","3167","5526",
];

function PayslipModal({ onClose }: { onClose: () => void }) {
  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden">

        {/* modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-bold text-neutral-800">Payslip</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-neutral-500 text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">

          {/* ── TOP SECTION ── */}
          <div className="flex items-start justify-between gap-4 mb-6">

            {/* left — employee info */}
            <div className="space-y-1">
              <p className="text-xs text-neutral-400 uppercase tracking-wide font-semibold">Employee Name</p>
              <p className="text-sm font-bold text-neutral-800">mohammed tanveer rashiwale</p>
              <p className="text-xs text-neutral-500 mt-2">mohammedtanveerrashiwale3@gmail.com</p>
            </div>

            {/* center — position & period */}
            <div className="space-y-1 text-right flex-1">
              <p className="text-xs text-neutral-400 uppercase tracking-wide font-semibold">Position</p>
              <p className="text-sm font-bold text-neutral-800">Digital Marketing Specialist</p>
              <p className="text-xs text-neutral-500 mt-2">Payslip For: <span className="font-semibold text-neutral-700">Feb / 2026</span></p>
            </div>

            {/* right — logo box */}
            <div className="shrink-0 w-20 h-16 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center">
              <span className="text-[10px] text-neutral-400 text-center leading-tight">Logo</span>
            </div>
          </div>

          {/* ── TABLE SECTION ── */}
          <div className="overflow-x-auto rounded-lg border border-neutral-200 mb-6">
            <table className="w-full text-xs min-w-max">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  {PAYSLIP_COLS.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2.5 text-left font-semibold text-neutral-500 uppercase tracking-wide border-r border-neutral-200 last:border-r-0 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {PAYSLIP_VALS.map((val, i) => (
                    <td
                      key={i}
                      className="px-3 py-3 text-neutral-800 font-medium border-r border-neutral-200 last:border-r-0 whitespace-nowrap"
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── BOTTOM SECTION ── */}
          <div className="flex items-start justify-between gap-6">

            {/* left — totals */}
            <div className="space-y-2 min-w-[160px]">
              <div className="flex justify-between gap-8">
                <span className="text-xs text-neutral-500">Gross</span>
                <span className="text-sm font-semibold text-neutral-800">19000</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-xs text-neutral-500">Deduction</span>
                <span className="text-sm font-semibold text-neutral-800">5909</span>
              </div>
              <div className="flex justify-between gap-8 border-t border-neutral-200 pt-2 mt-1">
                <span className="text-xs font-bold text-neutral-700">Net Salary</span>
                <span className="text-sm font-bold text-blue-600">13091/-</span>
              </div>
            </div>

            {/* right — signature & address */}
            <div className="text-right">
              <p className="text-xs text-neutral-500 italic mb-6">signature of proprietor</p>
              <p className="text-[11px] text-neutral-400 leading-relaxed max-w-xs">
                #51-B, Behind Mahaveer school,<br />
                Bailappanavar nagar, Hubli-29
              </p>
            </div>
          </div>

          {/* ── DOWNLOAD BUTTON ── */}
          <div className="flex justify-end mt-6 pt-4 border-t border-neutral-100">
            <button
              type="button"
              className="h-11 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-sm"
            >
              Download PDF
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SalaryPage() {
  const [form, setForm] = useState<SalaryForm>(empty);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPayslip, setShowPayslip] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((p) => ({ ...p, [name]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FormErrors = {};
    if (!form.employees) errs.employees = "This field is required";
    if (!form.month)     errs.month     = "This field is required";
    if (!form.year)      errs.year      = "This field is required";
    setErrors(errs);
  }

  return (
    <PageContainer>
      {showPayslip && <PayslipModal onClose={() => setShowPayslip(false)} />}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-800">Salary Details</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Enter monthly salary breakdown for an employee</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPayslip(true)}
          className="h-11 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-sm whitespace-nowrap"
        >
          View Payslip
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT PANEL: Summary ── */}
        <aside className="w-full lg:w-60 shrink-0 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Summary</p>
          <SummaryRow label="Salary per Day"  value="1200" />
          <SummaryRow label="Salary per Hour" value="150" />
          <SummaryRow label="OT pay"          value="0" />
          <SummaryRow label="Gross salary"    value="30000" />
          <SummaryRow label="Time penalty"    value="0" />
          <SummaryRow label="Leave penalty"   value="0" />
          <div className="mt-3 rounded-lg bg-blue-600 px-3 py-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-100">Total deduction</span>
            <span className="text-sm font-bold text-white">200000001200</span>
          </div>
        </aside>

        {/* ── RIGHT PANEL: Form ── */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

            {/* ROW 1 */}
            <div>
              <Label text="Employees" required />
              <select name="employees" value={form.employees} onChange={handleChange}
                className={errors.employees ? selectErrCls : selectCls}>
                <option value="">Select employee</option>
                {EMPLOYEES.map((e) => <option key={e}>{e}</option>)}
              </select>
              <ErrorMsg msg={errors.employees} />
            </div>
            <div>
              <Label text="Leaves Taken" />
              <input name="leavesTaken" value={form.leavesTaken} onChange={handleChange}
                placeholder="1" className={inputCls} />
            </div>

            {/* ROW 2 */}
            <div>
              <Label text="Month" required />
              <select name="month" value={form.month} onChange={handleChange}
                className={errors.month ? selectErrCls : selectCls}>
                <option value="">Select month</option>
                {MONTHS.map((m) => <option key={m}>{m}</option>)}
              </select>
              <ErrorMsg msg={errors.month} />
            </div>
            <div>
              <Label text="OT Hours" />
              <input name="otHours" value={form.otHours} onChange={handleChange}
                placeholder="0" className={inputCls} />
            </div>

            {/* ROW 3 */}
            <div>
              <Label text="Year" required />
              <select name="year" value={form.year} onChange={handleChange}
                className={errors.year ? selectErrCls : selectCls}>
                <option value="">Select year</option>
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
              <ErrorMsg msg={errors.year} />
            </div>
            <div>
              <Label text="Full Month Only Minus Minutes" />
              <input name="fullMonthMinusMinutes" value={form.fullMonthMinusMinutes} onChange={handleChange}
                placeholder="0" className={inputCls} />
            </div>

            {/* ROW 4 */}
            <div>
              <Label text="Working Days" />
              <input name="workingDays" value={form.workingDays} onChange={handleChange}
                placeholder="26" className={inputCls} />
            </div>
            <div>
              <Label text="Minus Minutes Converted into Rupees" />
              <input name="minusMinutesRupees" value={form.minusMinutesRupees} onChange={handleChange}
                placeholder="0" className={inputCls} />
            </div>

            {/* ROW 5 */}
            <div>
              <Label text="Working Hours" />
              <input name="workingHours" value={form.workingHours} onChange={handleChange}
                placeholder="208" className={inputCls} />
            </div>
            <div>
              <Label text="Professional Tax" />
              <input name="professionalTax" value={form.professionalTax} onChange={handleChange}
                placeholder="200" className={inputCls} />
            </div>

            {/* ROW 6 */}
            <div>
              <Label text="Basic Salary" />
              <input name="basicSalary" value={form.basicSalary} onChange={handleChange}
                placeholder="25000" className={inputCls} />
            </div>
            <div>
              <Label text="Advance Taken" />
              <input name="advanceTaken" value={form.advanceTaken} onChange={handleChange}
                placeholder="5000" className={inputCls} />
            </div>

            {/* ROW 7 */}
            <div>
              <Label text="Incentive" />
              <input name="incentive" value={form.incentive} onChange={handleChange}
                placeholder="2000" className={inputCls} />
            </div>
            <div>
              <Label text="Additional Advance" />
              <input name="additionalAdvance" value={form.additionalAdvance} onChange={handleChange}
                placeholder="0" className={inputCls} />
            </div>

            {/* ROW 8 */}
            <div>
              <Label text="Arrears" />
              <input name="arrears" value={form.arrears} onChange={handleChange}
                placeholder="0" className={inputCls} />
            </div>
            <div>
              <Label text="Advance Deducted" />
              <input name="advanceDeducted" value={form.advanceDeducted} onChange={handleChange}
                placeholder="2000" className={inputCls} />
            </div>

            {/* ROW 9 */}
            <div>
              <Label text="TA / DA" />
              <input name="tada" value={form.tada} onChange={handleChange}
                placeholder="1500" className={inputCls} />
            </div>
            <div>
              <Label text="Advance Remaining" />
              <input name="advanceRemaining" value={form.advanceRemaining} onChange={handleChange}
                placeholder="3000" className={inputCls} />
            </div>

            {/* ROW 10 */}
            <div>
              <Label text="Bonus" />
              <input name="bonus" value={form.bonus} onChange={handleChange}
                placeholder="1500" className={inputCls} />
            </div>
            <div>
              <Label text="Extra Fine + Task & Report + Late Fees (after 10 am)" />
              <input name="extraFine" value={form.extraFine} onChange={handleChange}
                placeholder="0" className={inputCls} />
            </div>

            {/* ROW 11 */}
            <div>
              <Label text="Paid Leaves" />
              <input name="paidLeaves" value={form.paidLeaves} onChange={handleChange}
                placeholder="2" className={inputCls} />
            </div>
            <div>
              <Label text="EMI" />
              <input name="emi" value={form.emi} onChange={handleChange}
                placeholder="0" className={inputCls} />
            </div>

            {/* ROW 12 — Net Salary right-column */}
            <div className="hidden md:block" />
            <div>
              <Label text="Net Salary" />
              <input name="netSalary" value={form.netSalary} onChange={handleChange}
                placeholder="28500" className={inputCls} />
            </div>

          </div>

          {/* Submit */}
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              className="h-11 px-10 rounded-lg bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white text-sm font-semibold uppercase tracking-wide transition-all shadow-sm"
            >
              Submit
            </button>
          </div>
        </form>

      </div>
    </PageContainer>
  );
}
