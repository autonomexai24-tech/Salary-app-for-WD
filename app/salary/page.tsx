"use client";

import { useState, useEffect } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { getEmployees, createSalary } from "@/lib/api";

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
  api?: string;
}

const MONTHS = [
  "1","2","3","4","5","6",
  "7","8","9","10","11","12",
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
  "Extra fine","Leave penalty","Time penalty",
];

function PayslipModal({ payslip, onClose }: { payslip: any; onClose: () => void }) {
  if (!payslip) return null;

  const d = payslip.data;
  const s = d.salary;
  const t = d.totals;

  const PAYSLIP_VALS = [
    String(s.basicSalary), String(s.incentive), String(s.bonus), String(s.taDa), String(s.arrears),
    String(s.professionalTax), String(s.advanceTaken), "0", String(s.advanceDeducted),
    "0", "0", "0",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden">
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
            <div className="space-y-1">
              <p className="text-xs text-neutral-400 uppercase tracking-wide font-semibold">Employee Name</p>
              <p className="text-sm font-bold text-neutral-800">{d.employeeName}</p>
              <p className="text-xs text-neutral-500 mt-2">{d.email}</p>
            </div>

            <div className="space-y-1 text-right flex-1">
              <p className="text-xs text-neutral-400 uppercase tracking-wide font-semibold">Position</p>
              <p className="text-sm font-bold text-neutral-800">{d.position}</p>
              <p className="text-xs text-neutral-500 mt-2">Payslip For: <span className="font-semibold text-neutral-700">{d.month} / {d.year}</span></p>
            </div>

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
            <div className="space-y-2 min-w-[160px]">
              <div className="flex justify-between gap-8">
                <span className="text-xs text-neutral-500">Gross</span>
                <span className="text-sm font-semibold text-neutral-800">{t.gross}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-xs text-neutral-500">Deduction</span>
                <span className="text-sm font-semibold text-neutral-800">{t.deduction}</span>
              </div>
              <div className="flex justify-between gap-8 border-t border-neutral-200 pt-2 mt-1">
                <span className="text-xs font-bold text-neutral-700">Net Salary</span>
                <span className="text-sm font-bold text-blue-600">{t.net}/-</span>
              </div>
            </div>

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
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/payslip/${payslip.id}/download`}
              target="_blank"
              download
              className="h-11 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white flex items-center justify-center text-sm font-semibold transition-all shadow-sm"
            >
              Download PDF
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SalaryPage() {
  const [form, setForm] = useState<SalaryForm>(empty);
  const [errors, setErrors] = useState<FormErrors>({});
  const [activePayslip, setActivePayslip] = useState<any>(null);
  const [employeesData, setEmployeesData] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await getEmployees();
        setEmployeesData(res.data || []);
      } catch (err) {
        console.error("Failed loading employees", err);
      }
    }
    load();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((p) => ({ ...p, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FormErrors = {};
    if (!form.employees) errs.employees = "This field is required";
    if (!form.month)     errs.month     = "This field is required";
    if (!form.year)      errs.year      = "This field is required";
    
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await createSalary(form);
      if (res.success) {
        // Backend now returns { success: true, data: salary_with_payslip } natively
        const salaryObj = res.data;
        // Fetch payslip automatically using the logic linked if needed, or if UI is configured, it auto hooks.
        // Usually, to immediately render mapping, we must fetch the specific payslip!
        
        // Wait, the API creates the payslip in the backend via await payslipService.createPayslip(salary.id).
        // If we want instantly to fetch payslips:
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const payslipListRes = await fetch(`${API_URL}/payslip`);
        const pListJson = await payslipListRes.json();
        const createdPayslip = pListJson.data.find((p: any) => p.salaryId === salaryObj.id);
        
        setActivePayslip(createdPayslip);
      }
    } catch (err: any) {
      setErrors({ api: err.message || "Duplicate or failed to calculate salary." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer>
      {activePayslip && <PayslipModal payslip={activePayslip} onClose={() => setActivePayslip(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-800">Salary Details</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Enter monthly salary breakdown for an employee</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── LEFT PANEL: Summary ── */}
        {(() => {
          const basic       = Number(form.basicSalary) || 0;
          const workDays    = Number(form.workingDays) || 0;
          const workHours   = Number(form.workingHours) || 0;
          const otHrs       = Number(form.otHours) || 0;
          const incentive   = Number(form.incentive) || 0;
          const arrears     = Number(form.arrears) || 0;
          const tada        = Number(form.tada) || 0;
          const bonus       = Number(form.bonus) || 0;
          const profTax     = Number(form.professionalTax) || 0;
          const advTaken    = Number(form.advanceTaken) || 0;
          const addlAdv     = Number(form.additionalAdvance) || 0;
          const advDeducted = Number(form.advanceDeducted) || 0;
          const extraFine   = Number(form.extraFine) || 0;
          const emi         = Number(form.emi) || 0;
          const minusMinsRs = Number(form.minusMinutesRupees) || 0;

          const salaryPerDay  = workDays > 0 ? Math.round(basic / workDays) : 0;
          const salaryPerHour = workHours > 0 ? Math.round(basic / workHours) : 0;
          const otPay         = otHrs * salaryPerHour;
          const grossSalary   = basic + incentive + arrears + tada + bonus + otPay;
          const timePenalty   = minusMinsRs;
          const leavePenalty  = 0;
          const totalDeduction = profTax + advTaken + addlAdv + advDeducted + extraFine + emi + timePenalty + leavePenalty;

          return (
            <aside className="w-full lg:w-60 shrink-0 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Summary Previews</p>
              <SummaryRow label="Gross predicted" value={String(grossSalary)} />
              <div className="mt-3 rounded-lg bg-blue-600 px-3 py-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-100">Live Prediction Net</span>
                <span className="text-sm font-bold text-white">{grossSalary - totalDeduction}</span>
              </div>
              <ErrorMsg msg={errors.api} />
            </aside>
          );
        })()}

        {/* ── RIGHT PANEL: Form ── */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <Label text="Employees" required />
              <select name="employees" value={form.employees} onChange={handleChange}
                className={errors.employees ? selectErrCls : selectCls}>
                <option value="">Select employee</option>
                {employeesData.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
              <ErrorMsg msg={errors.employees} />
            </div>
            <div>
              <Label text="Leaves Taken" />
              <input name="leavesTaken" value={form.leavesTaken} onChange={handleChange}
                placeholder="1" className={inputCls} />
            </div>

            <div>
              <Label text="Month (1-12)" required />
              <select name="month" value={form.month} onChange={handleChange}
                className={errors.month ? selectErrCls : selectCls}>
                <option value="">Select month</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <ErrorMsg msg={errors.month} />
            </div>
            <div>
              <Label text="OT Hours" />
              <input name="otHours" value={form.otHours} onChange={handleChange}
                placeholder="0" className={inputCls} />
            </div>

            <div>
              <Label text="Year" required />
              <select name="year" value={form.year} onChange={handleChange}
                className={errors.year ? selectErrCls : selectCls}>
                <option value="">Select year</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <ErrorMsg msg={errors.year} />
            </div>
            <div>
              <Label text="Full Month Only Minus Minutes" />
              <input name="fullMonthMinusMinutes" value={form.fullMonthMinusMinutes} onChange={handleChange}
                placeholder="0" className={inputCls} />
            </div>

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
          </div>

          <div className="flex justify-center mt-8">
            <button
              type="submit"
              disabled={submitting}
              className="h-11 px-10 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-neutral-400 active:scale-[0.98] text-white text-sm font-semibold uppercase tracking-wide transition-all shadow-sm"
            >
              {submitting ? "Calculating..." : "Submit & Generate Payslip"}
            </button>
          </div>
        </form>

      </div>
    </PageContainer>
  );
}
