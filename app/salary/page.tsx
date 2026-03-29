"use client";

import { useState, useEffect } from "react";
import PageContainer from "@/components/layout/PageContainer";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { getEmployees, createSalary } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download } from "lucide-react";

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
  const comp = d.company || {};
  const s = d.salary || {}; // flat legacy key

  // ── Backward-compatible attendance: prefer structured, fall back to flat ──
  const rawAtt = d.attendance || {};
  const att = {
    workingDays: rawAtt.workingDays ?? s.workingDays ?? 0,
    workingHours: rawAtt.workingHours ?? s.workingHours ?? 0,
    leavesTaken: rawAtt.leavesTaken ?? s.leavesTaken ?? 0,
    daysPresent: rawAtt.daysPresent ?? ((rawAtt.workingDays ?? s.workingDays ?? 0) - (rawAtt.leavesTaken ?? s.leavesTaken ?? 0)),
    otHours: rawAtt.otHours ?? s.otHours ?? 0,
    minusMinutes: rawAtt.minusMinutes ?? s.minusMinutes ?? 0,
    salaryPerDay: rawAtt.salaryPerDay ?? (s.workingDays ? (s.basicSalary || 0) / s.workingDays : 0),
    salaryPerHour: rawAtt.salaryPerHour ?? 0,
  };
  // Recalculate per-hour if not in snapshot
  if (!att.salaryPerHour && att.salaryPerDay && att.workingHours) {
    att.salaryPerHour = att.salaryPerDay / att.workingHours;
  }

  // ── Backward-compatible earnings ──
  const rawEarn = d.earnings || {};
  const earn = {
    basicSalary: rawEarn.basicSalary ?? s.basicSalary ?? 0,
    incentive: rawEarn.incentive ?? s.incentive ?? 0,
    taDa: rawEarn.taDa ?? s.taDa ?? 0,
    bonus: rawEarn.bonus ?? s.bonus ?? 0,
    arrears: rawEarn.arrears ?? s.arrears ?? 0,
    otPay: rawEarn.otPay ?? s.otPay ?? 0,
  };

  // ── Backward-compatible deductions ──
  const rawDed = d.deductions || {};
  const ded = {
    professionalTax: rawDed.professionalTax ?? s.professionalTax ?? 0,
    advanceTaken: rawDed.advanceTaken ?? s.advanceTaken ?? 0,
    advanceDeducted: rawDed.advanceDeducted ?? s.advanceDeducted ?? 0,
    extraFine: rawDed.extraFine ?? s.extraFine ?? 0,
    leavePenalty: rawDed.leavePenalty ?? s.leavePenalty ?? 0,
    timePenalty: rawDed.timePenalty ?? s.timePenalty ?? 0,
    emi: rawDed.emi ?? s.emi ?? 0,
  };

  const t = d.totals || {};

  const fmt = (v: any) => Math.round(Number(v) || 0).toLocaleString("en-IN");
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthName = MONTHS[parseInt(d.month) - 1] || d.month;

  // Download URL
  let dlBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
  if (!dlBase.endsWith("/api")) dlBase += "/api";
  const downloadUrl = `${dlBase}/payslip/${payslip.id}/download`;

  // Earnings items
  const earningsItems = [
    { label: "Basic Salary", value: earn.basicSalary },
    { label: "Incentive", value: earn.incentive },
    { label: "TA / DA", value: earn.taDa },
    { label: "Bonus", value: earn.bonus },
    { label: "Arrears", value: earn.arrears },
    { label: "OT Pay", value: earn.otPay },
  ];
  const totalEarn = earningsItems.reduce((sum, i) => sum + (Number(i.value) || 0), 0);

  // Deduction items
  const deductionItems = [
    { label: "Professional Tax", value: ded.professionalTax },
    { label: "Advance Taken", value: ded.advanceTaken },
    { label: "Advance Deducted", value: ded.advanceDeducted },
    { label: "Extra Fine / Late", value: ded.extraFine },
    { label: "Leave Penalty", value: ded.leavePenalty },
    { label: "Time Penalty", value: ded.timePenalty },
    { label: "EMI", value: ded.emi },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">

        {/* ── Scroll area for the payslip preview ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ═══ SECTION 1: COMPANY HEADER BAND ═══ */}
          <div className="bg-indigo-900 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {comp.logoUrl ? (
                <img
                  src={(() => {
                    if (comp.logoUrl.startsWith('http')) return comp.logoUrl;
                    let base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
                    if (base.endsWith('/api')) base = base.slice(0, -4);
                    return `${base}${comp.logoUrl}`;
                  })()}
                  alt="Logo"
                  className="w-14 h-14 rounded-lg object-contain bg-white border border-gray-200"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center text-[10px] text-gray-400 font-bold border border-gray-200">
                  LOGO
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">{comp.name || "Web Dreams"}</h2>
                <p className="text-xs text-blue-200 italic">the WWW dream comes true...</p>
                {(comp.phone || comp.email) && (
                  <p className="text-[10px] text-blue-300 mt-0.5">
                    {[comp.phone, comp.email].filter(Boolean).join("  |  ")}
                  </p>
                )}
                {comp.address && <p className="text-[10px] text-blue-300">{comp.address}</p>}
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-bold text-white tracking-wide">SALARY SLIP</h3>
              <p className="text-sm text-blue-200">{monthName} {d.year}</p>
            </div>
          </div>

          <div className="px-6 py-4 space-y-4">

            {/* ═══ SECTION 2: EMPLOYEE DETAILS ═══ */}
            <div>
              <div className="bg-indigo-50 px-3 py-1.5 rounded-t -mx-0">
                <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Employee Details</h4>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 py-3 text-sm">
                <div><span className="text-gray-500 text-xs font-medium">Employee Name:</span> <span className="font-semibold text-gray-900">{d.employeeName}</span></div>
                <div><span className="text-gray-500 text-xs font-medium">Position:</span> <span className="font-semibold text-gray-900">{d.position}</span></div>
                <div><span className="text-gray-500 text-xs font-medium">Email:</span> <span className="font-semibold text-gray-900">{d.employeeEmail || "—"}</span></div>
                <div><span className="text-gray-500 text-xs font-medium">Department:</span> <span className="font-semibold text-gray-900">{d.department || "—"}</span></div>
                <div><span className="text-gray-500 text-xs font-medium">Phone:</span> <span className="font-semibold text-gray-900">{d.employeePhone || "—"}</span></div>
                <div><span className="text-gray-500 text-xs font-medium">Pay Period:</span> <span className="font-semibold text-gray-900">{monthName} {d.year}</span></div>
              </div>
            </div>

            {/* ═══ SECTION 3: ATTENDANCE & RATE CARD ═══ */}
            <div>
              <div className="bg-green-50 px-3 py-1.5 rounded-t">
                <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider">Attendance & Rate Card</h4>
              </div>
              <div className="grid grid-cols-4 gap-3 py-3">
                {[
                  { label: "Working Days", value: att.workingDays ?? "—" },
                  { label: "Working Hours", value: att.workingHours ?? "—" },
                  { label: "Leaves Taken", value: att.leavesTaken ?? "—" },
                  { label: "OT Hours", value: att.otHours ?? "—" },
                  { label: "Days Present", value: att.daysPresent ?? "—" },
                  { label: "Salary / Day", value: `₹ ${fmt(att.salaryPerDay)}` },
                  { label: "Salary / Hour", value: `₹ ${fmt(att.salaryPerHour)}` },
                  { label: "Minus Minutes", value: att.minusMinutes ?? "—" },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-gray-500 font-medium">{item.label}</p>
                    <p className="text-sm font-bold text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ SECTION 4: EARNINGS & DEDUCTIONS ═══ */}
            <div className="grid grid-cols-2 gap-4">
              {/* Earnings */}
              <div className="border border-green-200 rounded-lg overflow-hidden">
                <div className="bg-green-50 px-3 py-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-green-800 uppercase">Earnings</span>
                  <span className="text-xs font-bold text-green-800">Amount (₹)</span>
                </div>
                {earningsItems.map((item, i) => (
                  <div key={i} className={`flex justify-between px-3 py-1.5 text-xs ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-semibold text-gray-900">{fmt(item.value)}</span>
                  </div>
                ))}
                <div className="border-t border-green-200 bg-green-50 px-3 py-2 flex justify-between">
                  <span className="text-xs font-bold text-green-800">Total Earnings</span>
                  <span className="text-xs font-bold text-green-800">{fmt(totalEarn)}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-red-200 rounded-lg overflow-hidden">
                <div className="bg-red-50 px-3 py-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-red-800 uppercase">Deductions</span>
                  <span className="text-xs font-bold text-red-800">Amount (₹)</span>
                </div>
                {deductionItems.map((item, i) => (
                  <div key={i} className={`flex justify-between px-3 py-1.5 text-xs ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-semibold text-gray-900">{fmt(item.value)}</span>
                  </div>
                ))}
                <div className="border-t border-red-200 bg-red-50 px-3 py-2 flex justify-between">
                  <span className="text-xs font-bold text-red-800">Total Deductions</span>
                  <span className="text-xs font-bold text-red-800">{fmt(t.deduction)}</span>
                </div>
              </div>
            </div>

            {/* ═══ SECTION 5: SALARY SUMMARY ═══ */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-xs font-bold text-indigo-800 uppercase mb-3">Salary Summary</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross Salary:</span>
                  <span className="font-bold text-gray-800">₹ {fmt(t.gross)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>(-) Total Deductions:</span>
                  <span className="font-bold">₹ {fmt(t.deduction)}</span>
                </div>
                <div className="bg-indigo-900 text-white rounded-lg px-4 py-2.5 flex justify-between items-center mt-2">
                  <span className="font-bold text-sm">NET SALARY:</span>
                  <span className="font-black text-lg">₹ {fmt(t.net)}/-</span>
                </div>
              </div>
            </div>

            {/* ═══ SECTION 6 & 7: SIGNATURES ═══ */}
            <div className="flex justify-between items-end pt-6 pb-2">
              <div className="text-center">
                <div className="w-40 border-b border-gray-400 mb-1" />
                <p className="text-xs font-semibold text-gray-600">Employee Signature</p>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-gray-400 mb-1" />
                <p className="text-xs font-semibold text-gray-600">Authorized Signatory</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 italic text-center">
              This is a computer-generated payslip and does not require a physical signature.
            </p>
          </div>
        </div>

        {/* ═══ FOOTER ACTION BAR ═══ */}
        <div className="border-t border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
          <Alert className="border-amber-200 bg-amber-50 text-amber-800 p-2 py-1.5 flex items-center">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 mr-1.5" />
            <AlertDescription className="text-[11px] font-medium">
              This payslip snapshot is permanent once generated.
            </AlertDescription>
          </Alert>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Back to Edit
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
              <a href={downloadUrl} target="_blank" download>
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download PDF
              </a>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function SalaryPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <SalaryPageContent />
    </ProtectedRoute>
  );
}

function SalaryPageContent() {
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

        // The backend now returns payslip (singular) with the salary response.
        // Use it directly instead of a separate GET /payslip call (avoids stale data).
        let createdPayslip = null;
        if (salaryObj.payslip) {
          createdPayslip = salaryObj.payslip;
        } else {
          // Fallback: fetch payslip list if backend didn't include it
          let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
          if (!baseUrl.endsWith("/api")) baseUrl += "/api";
          const payslipListRes = await fetch(`${baseUrl}/payslip`);
          if (payslipListRes.ok) {
            const pListJson = await payslipListRes.json();
            const pArr = Array.isArray(pListJson.data) ? pListJson.data : (Array.isArray(pListJson) ? pListJson : []);
            createdPayslip = pArr.find((p: any) => p.salaryId === salaryObj.id);
          }
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
