"use client";

import { useState, useEffect } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { getEmployees, createSalary } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download, FileText, CalendarDays, CreditCard, Banknote } from "lucide-react";

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
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
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

/* ── Payslip Modal ── */
function PayslipModal({ payslip, onClose }: { payslip: any; onClose: () => void }) {
  if (!payslip) return null;

  const d = payslip.data || payslip;
  const s = d.salary || {};
  const t = d.totals || {};

  const basicSalary = Number(s.basicSalary) || 0;
  const workingDays = Number(s.workingDays) || 26;
  const workingHours = Number(s.workingHours) || (workingDays * 8);

  const perDay = workingDays > 0 ? (basicSalary / workingDays).toFixed(2) : "0.00";
  const perHour = workingHours > 0 ? (basicSalary / workingHours).toFixed(2) : "0.00";

  const totalEarnings = (
    basicSalary +
    (Number(s.incentive) || 0) +
    (Number(s.taDa) || 0) +
    (Number(s.arrears) || 0) +
    (Number(s.bonus) || 0) +
    (Number(s.otHours) * (basicSalary / Math.max(1, workingHours))) || 0
  );

  const totalDeductions = (
    (Number(s.professionalTax) || 0) +
    (Number(s.advanceTaken) || 0) +
    (Number(s.advanceDeducted) || 0) +
    (Number(s.extraFine) || 0) +
    (Number(s.emi) || 0) +
    (Number(s.minusMinutes) || 0)
  );

  const displayEarnings = Number(totalEarnings).toFixed(0);
  const displayGross = t.gross ? String(t.gross).replace(/[^\d.]/g, '') : displayEarnings;
  const displayDeductionsStr = t.deduction ? String(t.deduction).replace(/[^\d.]/g, '') : Number(totalDeductions).toFixed(0);
  
  const computedNet = Number(displayGross) - Number(displayDeductionsStr);
  const displayNetStr = t.net ? String(t.net).replace(/[^\d.]/g, '') : String(computedNet);

  const daysPresent = workingDays - (Number(s.leavesTaken) || 0);

  // Build download URL — ensure /api prefix is always present (mirrors lib/api.ts logic)
  let dlBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
  if (!dlBase.endsWith("/api")) {
    dlBase += "/api";
  }
  const downloadUrl = `${dlBase}/payslip/${payslip.id}/download`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-slate-50 w-full max-w-6xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex border rounded-lg items-center justify-center bg-blue-50 border-blue-100 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Payslip Generated Preview</h2>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-slate-100/50">
          
          {/* THE PHYSICAL PAYSLIP MOCK */}
          <div className="min-w-[1000px] border border-slate-300 bg-white p-8 shadow-sm mx-auto">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-900">Employee Name:<span className="font-normal ml-1">{d.employeeName}</span></p>
                <p className="text-sm font-bold text-slate-900">Employee ID:<span className="font-normal ml-1">{d.employeeEmail || `${(d.employeeName || "").replace(/\s+/g,"")}@gmail.com`}</span></p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-900">Position:<span className="font-normal ml-1">{d.position}</span></p>
                <p className="text-sm font-bold text-slate-900">Payslip For:<span className="font-normal ml-1">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(d.month)-1] || d.month} / {d.year}
                </span></p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-black text-orange-500 tracking-tight">{d.company?.name || "Web Dreams"}</h2>
                <p className="text-xs italic text-slate-500 font-medium">the WWW dream comes true...</p>
              </div>
            </div>

            {/* Main Table */}
            <table className="w-full border-collapse border border-slate-300 text-xs mb-4">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="border-r border-slate-300 p-2 text-left font-semibold text-green-700">Basic</th>
                  <th className="border-r border-slate-300 p-2 text-left font-semibold text-green-700">Incentives</th>
                  <th className="border-r border-slate-300 p-2 text-left font-semibold text-green-700">Bonus</th>
                  <th className="border-r border-slate-300 p-2 text-left font-semibold text-green-700">TA/DA</th>
                  <th className="border-r border-slate-300 p-2 text-left font-semibold text-green-700">Arrears</th>
                  <th className="border-r border-slate-300 p-2 text-left font-semibold text-red-700">Prof.tax</th>
                  <th className="border-r border-slate-300 p-2 text-left font-semibold text-red-700">Adv. pay</th>
                  <th className="border-r border-slate-300 p-2 text-left font-semibold text-red-700">Addition. adv</th>
                  <th className="border-r border-slate-300 p-2 text-left font-semibold text-red-700">Adv deducted</th>
                  <th className="border-r border-slate-300 p-2 text-left font-semibold text-red-700">Extra fine</th>
                  <th className="border-r border-slate-300 p-2 text-left font-semibold text-red-700">Leave penalty</th>
                  <th className="p-2 text-left font-semibold text-red-700">Time penalty</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r border-slate-300 p-2 font-medium">{Math.round(s.basicSalary || 0)}</td>
                  <td className="border-r border-slate-300 p-2 font-medium">{Math.round(s.incentive || 0)}</td>
                  <td className="border-r border-slate-300 p-2 font-medium">{Math.round(s.bonus || 0)}</td>
                  <td className="border-r border-slate-300 p-2 font-medium">{Math.round(s.taDa || 0)}</td>
                  <td className="border-r border-slate-300 p-2 font-medium">{Math.round(s.arrears || 0)}</td>
                  <td className="border-r border-slate-300 p-2 font-medium">{Math.round(s.professionalTax || 0)}</td>
                  <td className="border-r border-slate-300 p-2 font-medium">{Math.round(s.advanceTaken || 0)}</td>
                  <td className="border-r border-slate-300 p-2 font-medium">{Math.round(s.additionalAdvance || 0)}</td>
                  <td className="border-r border-slate-300 p-2 font-medium">{Math.round(s.advanceDeducted || 0)}</td>
                  <td className="border-r border-slate-300 p-2 font-medium">{Math.round(s.extraFine || 0)}</td>
                  <td className="border-r border-slate-300 p-2 font-medium">{Math.round(s.leavePenalty || 0)}</td>
                  <td className="p-2 font-medium">{Math.round(s.timePenalty || 0)}</td>
                </tr>
              </tbody>
            </table>

            {/* Totals & Signature */}
            <div className="flex justify-between items-start mt-6">
              <div className="flex gap-10">
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Gross</p>
                  <p className="text-sm font-medium">{Math.round(t.gross || 0)}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Deduction</p>
                  <p className="text-sm font-medium">{Math.round(t.deduction || 0)}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Net salary</p>
                  <p className="text-sm font-medium">{Math.round(t.net || 0)}/-</p>
                </div>
              </div>
              
              <div className="text-center mt-2">
                <p className="text-sm font-bold text-slate-800 mb-8">signature of proprietor</p>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  {d.company?.address || "#51-B, Behind Mahaveer school, Bailappanavar nagar, Hubli-29"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER & ACTIONS */}
        <div className="border-t border-slate-200 bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Alert className="border-amber-200 bg-amber-50 text-amber-800 p-3 sm:w-auto w-full py-2 flex items-center pt-2 pb-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
            <AlertDescription className="text-xs font-medium">
              Once generated, this payslip snapshot will be permanent.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
              Back to Edit
            </Button>
            <Button className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-sm" asChild>
              <a href={downloadUrl} target="_blank" download>
                <Download className="w-4 h-4 mr-2" />
                Generate & Download PDF
              </a>
            </Button>
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
        // Handle possible nested structures from the backend API, if it wraps inside .data
        const arr = Array.isArray(res.data) 
          ? res.data 
          : (Array.isArray(res.data?.data) ? res.data.data : []);
        setEmployeesData(arr);
      } catch (err) {
        console.error("Failed loading employees", err);
      }
    }
    load();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    
    setForm((p) => {
      const nextForm = { ...p, [name]: value };
      
      // Auto-populate numeric fields from the employee definition
      if (name === "employees") {
        const selected = employeesData.find((emp) => emp.id === value);
        if (selected) {
          nextForm.basicSalary = String(selected.salary || 0);
          nextForm.professionalTax = String(selected.professionalTax || 0);
        }
      }
      return nextForm;
    });

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
      const res: any = await createSalary(form);
      if (res.success) {
        const salaryObj = res.data;
        
        // Build base URL consistently — mirror the logic in lib/api.ts
        let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
        if (!baseUrl.endsWith("/api")) {
          baseUrl += "/api";
        }
        
        const payslipListRes = await fetch(`${baseUrl}/payslip`);
        
        let createdPayslip = null;
        if (payslipListRes.ok) {
          const pListJson = await payslipListRes.json();
          const pArr = Array.isArray(pListJson.data) 
            ? pListJson.data 
            : (Array.isArray(pListJson) ? pListJson : []);
          
          createdPayslip = pArr.find((p: any) => p.salaryId === salaryObj.id);
        }
        
        setActivePayslip(createdPayslip);
      } else {
        setErrors({ api: res.message || "Failed to generate payslip." });
      }
    } catch (err: any) {
      setErrors({ api: err.message || "Failed to calculate salary." });
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
          const workHours   = Number(form.workingHours) || 8; // fallback to 8 hr/day standard
          const otHrs       = Number(form.otHours) || 0;
          const incentive   = Number(form.incentive) || 0;
          const arrears     = Number(form.arrears) || 0;
          const tada        = Number(form.tada) || 0;
          const bonus       = Number(form.bonus) || 0;
          const profTax     = Number(form.professionalTax) || 0;
          const advDeducted = Number(form.advanceDeducted) || 0;
          const extraFine   = Number(form.extraFine) || 0;
          const emi         = Number(form.emi) || 0;
          const minusMinsRs = Number(form.minusMinutesRupees) || 0; // Interpreted as late minutes
          const leavesTaken = Number(form.leavesTaken) || 0;

          // MIRROR BACKEND CALCULATIONS EXACTLY
          const salaryPerDay  = workDays > 0 ? basic / workDays : 0;
          const salaryPerHour = workHours > 0 ? salaryPerDay / workHours : 0;
          const otPay         = otHrs * salaryPerHour;
          
          const grossSalary   = basic + incentive + bonus + tada + arrears + otPay;
          
          const leavePenalty  = leavesTaken * salaryPerDay;
          const timePenalty   = (minusMinsRs / 60) * salaryPerHour;
          const finePenalty   = extraFine + timePenalty + leavePenalty;
          
          const totalDeduction = profTax + advDeducted + extraFine + leavePenalty + timePenalty + emi;
          const netSalary = grossSalary - totalDeduction;

          const fmt = (n: number) => Math.round(n);

          return (
            <aside className="w-full lg:w-72 shrink-0 rounded-xl border border-neutral-200 bg-neutral-50 p-5 sticky top-6">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Summary Previews</p>
              
              <div className="space-y-3 mb-6 text-sm font-semibold">
                <div className="flex justify-between text-blue-800">
                  <span>Gross Salary:</span>
                  <span>₹ {fmt(grossSalary)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Salary per Month:</span>
                  <span>₹ {fmt(basic)}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Salary per Day:</span>
                  <span>₹ {fmt(salaryPerDay)}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Salary per Hour:</span>
                  <span>₹ {fmt(salaryPerHour)}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>OT pay:</span>
                  <span>₹ {fmt(otPay)}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Time penalty:</span>
                  <span>₹ {fmt(timePenalty)}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Leave penalty:</span>
                  <span>₹ {fmt(leavePenalty)}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Fine Penalty:</span>
                  <span>₹ {fmt(finePenalty)}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-3 text-blue-800">
                  <span>Total Deduction:</span>
                  <span>₹ {fmt(totalDeduction)}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-300 mt-2 pt-3 text-green-700 text-lg">
                  <span>Net Salary:</span>
                  <span>₹ {fmt(netSalary)}</span>
                </div>
              </div>

              <button
                form="salary-form"
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-neutral-400 active:scale-[0.98] text-white text-sm font-bold uppercase tracking-wide transition-all shadow-sm flex items-center justify-center mt-2"
              >
                {submitting ? "Calculating..." : "Submit & Generate Payslip"}
              </button>
              <ErrorMsg msg={errors.api} />
            </aside>
          );
        })()}

        {/* ── RIGHT PANEL: Form ── */}
        <form id="salary-form" onSubmit={handleSubmit} noValidate className="flex-1 w-full">
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
                {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
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

        </form>

      </div>
    </PageContainer>
  );
}
