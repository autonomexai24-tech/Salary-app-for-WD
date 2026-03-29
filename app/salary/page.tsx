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

  const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/payslip/${payslip.id}/download`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-slate-50 w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-5 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex border rounded-lg items-center justify-center bg-blue-50 border-blue-100 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Salary Slip Preview</h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                {d.month} {d.year}
              </p>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Badge variant="outline" className="bg-white px-3 py-1.5 text-xs text-slate-700">
              <span className="text-slate-500 mr-2">Total Days</span>
              <span className="font-bold">{workingDays}</span>
            </Badge>
            <Badge variant="outline" className="bg-white px-3 py-1.5 text-xs text-slate-700">
              <span className="text-slate-500 mr-2">Present</span>
              <span className="font-bold text-green-600">{daysPresent}</span>
            </Badge>
            <Badge variant="outline" className="bg-white px-3 py-1.5 text-xs text-slate-700">
              <span className="text-slate-500 mr-2">Leaves</span>
              <span className="font-bold text-red-500">{s.leavesTaken || 0}</span>
            </Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* EMPLOYEE INFO */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-xs text-slate-500 uppercase tracking-wider">Employee Information</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-y-4 gap-x-6">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Full Name</p>
                <p className="text-sm font-semibold text-slate-900">{d.employeeName || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Employee ID</p>
                <p className="text-sm font-semibold text-slate-900">{d.employeeId ? `#${d.employeeId}` : "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Designation</p>
                <p className="text-sm font-semibold text-slate-900">{d.position || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Department</p>
                <p className="text-sm font-semibold text-slate-900">{d.department || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Email</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{d.email || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* FINANCIAL SUMMARY DASHBOARD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Gross Salary</p>
                <p className="text-xl font-bold text-slate-800">₹ {Number(displayGross).toLocaleString('en-IN')}</p>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Salary Breakdown</p>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Per Month</span>
                    <span className="font-semibold text-slate-700">₹ {Number(basicSalary).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Per Day</span>
                    <span className="font-semibold text-slate-700">₹ {perDay}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Per Hour</span>
                    <span className="font-semibold text-slate-700">₹ {perHour}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Total Deductions</p>
                <p className="text-xl font-bold text-red-500">₹ {Number(displayDeductionsStr).toLocaleString('en-IN')}</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50 shadow-sm">
              <CardContent className="p-5 flex flex-col justify-center h-full">
                <p className="text-xs font-bold text-green-700 mb-1 uppercase tracking-wider">Net Salary</p>
                <p className="text-3xl font-black text-green-600 drop-shadow-sm">₹ {Number(displayNetStr).toLocaleString('en-IN')}</p>
              </CardContent>
            </Card>
          </div>

          {/* EARNINGS & DEDUCTIONS TABLES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Earnings */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-slate-500" /> Earnings
                </h4>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="w-[60%] font-semibold text-slate-500 h-9">Description</TableHead>
                    <TableHead className="text-right font-semibold text-slate-500 h-9">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium py-2.5">Basic Salary</TableCell>
                    <TableCell className="text-right py-2.5">₹ {basicSalary}</TableCell>
                  </TableRow>
                  {Number(s.incentive) > 0 && <TableRow><TableCell className="font-medium py-2.5">Incentives</TableCell><TableCell className="text-right py-2.5">₹ {s.incentive}</TableCell></TableRow>}
                  {Number(s.taDa) > 0 && <TableRow><TableCell className="font-medium py-2.5">TA/DA</TableCell><TableCell className="text-right py-2.5">₹ {s.taDa}</TableCell></TableRow>}
                  {Number(s.arrears) > 0 && <TableRow><TableCell className="font-medium py-2.5">Arrears</TableCell><TableCell className="text-right py-2.5">₹ {s.arrears}</TableCell></TableRow>}
                  {Number(s.bonus) > 0 && <TableRow><TableCell className="font-medium py-2.5">Bonus</TableCell><TableCell className="text-right py-2.5">₹ {s.bonus}</TableCell></TableRow>}
                </TableBody>
              </Table>
              <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-600">Total Earnings</span>
                <span className="text-sm font-bold text-slate-900">₹ {Number(displayGross).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-500" /> Deductions
                </h4>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="w-[60%] font-semibold text-slate-500 h-9">Description</TableHead>
                    <TableHead className="text-right font-semibold text-slate-500 h-9">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Number(s.professionalTax) > 0 && <TableRow><TableCell className="font-medium py-2.5">Professional Tax</TableCell><TableCell className="text-right py-2.5 text-red-600">₹ {s.professionalTax}</TableCell></TableRow>}
                  {Number(s.advanceTaken) > 0 && <TableRow><TableCell className="font-medium py-2.5">Advance</TableCell><TableCell className="text-right py-2.5 text-red-600">₹ {s.advanceTaken}</TableCell></TableRow>}
                  {Number(s.advanceDeducted) > 0 && <TableRow><TableCell className="font-medium py-2.5">Advance Deducted</TableCell><TableCell className="text-right py-2.5 text-red-600">₹ {s.advanceDeducted}</TableCell></TableRow>}
                  {Number(s.extraFine) > 0 && <TableRow><TableCell className="font-medium py-2.5">Fine / Penalty</TableCell><TableCell className="text-right py-2.5 text-red-600">₹ {s.extraFine}</TableCell></TableRow>}
                  {Number(s.emi) > 0 && <TableRow><TableCell className="font-medium py-2.5">EMI</TableCell><TableCell className="text-right py-2.5 text-red-600">₹ {s.emi}</TableCell></TableRow>}
                  {Number(s.minusMinutes) > 0 && <TableRow><TableCell className="font-medium py-2.5">Time Penalty / Late Arrival</TableCell><TableCell className="text-right py-2.5 text-red-600">₹ {s.minusMinutes}</TableCell></TableRow>}
                  {totalDeductions === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="h-14 text-center text-slate-400 italic">No deductions applied</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-600">Total Deductions</span>
                <span className="text-sm font-bold text-red-600">₹ {Number(displayDeductionsStr).toLocaleString('en-IN')}</span>
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
        
        let createdPayslip = null;
        if (payslipListRes.ok) {
          const pListJson = await payslipListRes.json();
          const pArr = Array.isArray(pListJson.data) 
            ? pListJson.data 
            : (Array.isArray(pListJson) ? pListJson : []);
          
          createdPayslip = pArr.find((p: any) => p.salaryId === salaryObj.id);
        }
        
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
