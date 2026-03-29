const prisma = require("../utils/prisma");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");
const path = require("path");
const fs = require("fs");

// ─── Number to Words (Indian currency) ────────────────────────
function numberToWords(num) {
  if (num === 0) return "Zero Rupees Only";
  const isNegative = num < 0;
  num = Math.abs(Math.round(num));

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertChunk(n) {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convertChunk(n % 100) : "");
  }

  let result = "";
  if (num >= 10000000) { result += convertChunk(Math.floor(num / 10000000)) + " Crore "; num %= 10000000; }
  if (num >= 100000) { result += convertChunk(Math.floor(num / 100000)) + " Lakh "; num %= 100000; }
  if (num >= 1000) { result += convertChunk(Math.floor(num / 1000)) + " Thousand "; num %= 1000; }
  result += convertChunk(num);

  return (isNegative ? "Minus " : "") + result.trim() + " Rupees Only";
}

// ─── Create Payslip with FULL snapshot ────────────────────────
async function createPayslip(salaryId) {
  const salary = await prisma.salary.findUnique({
    where: { id: salaryId },
    include: {
      employee: {
        include: {
          department: true,
        },
      },
    },
  });

  if (!salary) {
    throw new Error("Salary not found for snapshot linkage");
  }

  // Capture Company settings
  let companyMeta = {
    name: "Web Dreams",
    address: "",
    email: "",
    phone: "",
    logoUrl: "",
  };
  const company = await prisma.company.findFirst();
  if (company) {
    companyMeta = {
      name: company.name || "Web Dreams",
      address: company.address || "",
      email: company.email || "",
      phone: company.phone || "",
      logoUrl: company.logoUrl || "",
    };
  }

  // Calculated rates
  const workingDays = salary.workingDays || 0;
  const workingHours = salary.workingHours || 0;
  const basicSalary = salary.basicSalary || 0;
  const salaryPerDay = workingDays > 0 ? basicSalary / workingDays : 0;
  const salaryPerHour = workingHours > 0 ? salaryPerDay / workingHours : 0;
  const daysPresent = workingDays - (salary.leavesTaken || 0);

  // FULL snapshot — contains ALL data the PDF and frontend preview need.
  // Uses BOTH structured keys (attendance, earnings, deductions) AND
  // a flat "salary" key for backward compatibility with old frontend code.
  const snapshot = {
    employeeName: `${salary.employee.firstName} ${salary.employee.lastName}`,
    employeeEmail: `${salary.employee.firstName.toLowerCase()}${salary.employee.lastName.toLowerCase()}@gmail.com`,
    employeePhone: salary.employee.phone || "",
    position: salary.employee.qualification || salary.employee.department?.name || "Employee",
    department: salary.employee.department?.name || "General",
    month: salary.month,
    year: salary.year,

    company: companyMeta,

    // ── Structured keys (new format) ──
    attendance: {
      workingDays,
      workingHours,
      leavesTaken: salary.leavesTaken || 0,
      daysPresent,
      otHours: salary.otHours || 0,
      paidLeaves: salary.leavesTaken || 0,
      minusMinutes: salary.minusMinutes || 0,
      salaryPerDay: Math.round(salaryPerDay * 100) / 100,
      salaryPerHour: Math.round(salaryPerHour * 100) / 100,
    },

    earnings: {
      basicSalary,
      incentive: salary.incentive || 0,
      taDa: salary.taDa || 0,
      bonus: salary.bonus || 0,
      arrears: salary.arrears || 0,
      otPay: salary.otPay || 0,
    },

    deductions: {
      professionalTax: salary.professionalTax || 0,
      advanceTaken: salary.advanceTaken || 0,
      advanceDeducted: salary.advanceDeducted || 0,
      extraFine: salary.extraFine || 0,
      leavePenalty: salary.leavePenalty || 0,
      timePenalty: salary.timePenalty || 0,
      emi: salary.emi || 0,
    },

    // ── Flat "salary" key (backward compat for any old code) ──
    salary: {
      basicSalary,
      incentive: salary.incentive || 0,
      bonus: salary.bonus || 0,
      taDa: salary.taDa || 0,
      arrears: salary.arrears || 0,
      otPay: salary.otPay || 0,
      professionalTax: salary.professionalTax || 0,
      advanceTaken: salary.advanceTaken || 0,
      additionalAdvance: 0,
      advanceDeducted: salary.advanceDeducted || 0,
      extraFine: salary.extraFine || 0,
      leavePenalty: salary.leavePenalty || 0,
      timePenalty: salary.timePenalty || 0,
      emi: salary.emi || 0,
      workingDays,
      workingHours,
      leavesTaken: salary.leavesTaken || 0,
      otHours: salary.otHours || 0,
      minusMinutes: salary.minusMinutes || 0,
    },

    totals: {
      gross: salary.grossSalary,
      deduction: salary.totalDeduction,
      net: salary.netSalary,
    },
  };

  const payslip = await prisma.payslip.upsert({
    where: { salaryId: salary.id },
    update: { month: salary.month, year: salary.year, data: snapshot },
    create: {
      employeeId: salary.employeeId,
      salaryId: salary.id,
      month: salary.month,
      year: salary.year,
      data: snapshot,
    },
  });

  return payslip;
}

async function getPayslip(payslipId) {
  const payslip = await prisma.payslip.findUnique({ where: { id: payslipId } });
  if (!payslip) throw new Error("Payslip not found");
  return payslip;
}

// ─── Helper: Normalize payslip data (handles old AND new format) ───
function normalizePayslipData(rawData) {
  const d = rawData || {};
  const s = d.salary || {};

  // Attendance — prefer structured key, fall back to flat salary key
  const attendance = d.attendance || {};
  const att = {
    workingDays: attendance.workingDays ?? s.workingDays ?? 0,
    workingHours: attendance.workingHours ?? s.workingHours ?? 0,
    leavesTaken: attendance.leavesTaken ?? s.leavesTaken ?? 0,
    daysPresent: attendance.daysPresent ?? ((attendance.workingDays ?? s.workingDays ?? 0) - (attendance.leavesTaken ?? s.leavesTaken ?? 0)),
    otHours: attendance.otHours ?? s.otHours ?? 0,
    minusMinutes: attendance.minusMinutes ?? s.minusMinutes ?? 0,
    salaryPerDay: attendance.salaryPerDay ?? 0,
    salaryPerHour: attendance.salaryPerHour ?? 0,
  };

  // Recalculate rates if not present but data is available
  if (!att.salaryPerDay && att.workingDays > 0) {
    const basic = (d.earnings?.basicSalary ?? s.basicSalary ?? 0);
    att.salaryPerDay = Math.round((basic / att.workingDays) * 100) / 100;
    if (att.workingHours > 0) {
      att.salaryPerHour = Math.round((att.salaryPerDay / att.workingHours) * 100) / 100;
    }
  }

  // Earnings — prefer structured key, fall back to flat
  const earn = d.earnings || {};
  const earnings = {
    basicSalary: earn.basicSalary ?? s.basicSalary ?? 0,
    incentive: earn.incentive ?? s.incentive ?? 0,
    taDa: earn.taDa ?? s.taDa ?? 0,
    bonus: earn.bonus ?? s.bonus ?? 0,
    arrears: earn.arrears ?? s.arrears ?? 0,
    otPay: earn.otPay ?? s.otPay ?? 0,
  };

  // Deductions — prefer structured key, fall back to flat
  const ded = d.deductions || {};
  const deductions = {
    professionalTax: ded.professionalTax ?? s.professionalTax ?? 0,
    advanceTaken: ded.advanceTaken ?? s.advanceTaken ?? 0,
    advanceDeducted: ded.advanceDeducted ?? s.advanceDeducted ?? 0,
    extraFine: ded.extraFine ?? s.extraFine ?? 0,
    leavePenalty: ded.leavePenalty ?? s.leavePenalty ?? 0,
    timePenalty: ded.timePenalty ?? s.timePenalty ?? 0,
    emi: ded.emi ?? s.emi ?? 0,
  };

  return {
    employeeName: d.employeeName || "Unknown",
    employeeEmail: d.employeeEmail || "",
    employeePhone: d.employeePhone || "",
    position: d.position || "Employee",
    department: d.department || "",
    month: d.month,
    year: d.year,
    company: d.company || {},
    attendance: att,
    earnings,
    deductions,
    totals: d.totals || {},
  };
}

// ─── Professional A4 Portrait PDF Generator ───────────────────
function generatePdfStream(payslipDataObj) {
  const doc = new PDFDocument({ margin: 40, size: "A4" }); // A4 Portrait
  const stream = new PassThrough();
  doc.pipe(stream);

  // Normalize data to handle BOTH old and new snapshot formats
  const d = normalizePayslipData(payslipDataObj.data);
  const comp = d.company;
  const att = d.attendance;
  const earn = d.earnings;
  const ded = d.deductions;
  const t = d.totals;

  const M = 40; // margin
  const W = doc.page.width - 2 * M; // content width (~515)
  const fmt = (v) => Math.round(Number(v) || 0).toLocaleString("en-IN");
  const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const monthName = MONTHS[parseInt(d.month) - 1] || d.month;

  let Y = M; // vertical cursor

  // ═══════════════════════════════════════════════════════════
  // SECTION 1: COMPANY HEADER BAND
  // ═══════════════════════════════════════════════════════════

  doc.rect(M, Y, W, 80).fill("#1a237e");

  // Logo — try to load actual image, else draw placeholder
  let logoRendered = false;
  if (comp.logoUrl) {
    try {
      const logoPath = path.join(__dirname, "../../uploads", path.basename(comp.logoUrl));
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, M + 12, Y + 10, { width: 55, height: 55, fit: [55, 55] });
        logoRendered = true;
      }
    } catch (e) { /* ignore — will show placeholder */ }
  }
  if (!logoRendered) {
    doc.rect(M + 12, Y + 10, 55, 55).fill("#ffffff").stroke("#cccccc");
    doc.fontSize(7).fillColor("#999999").text("LOGO", M + 12, Y + 33, { width: 55, align: "center" });
  }

  // Company name
  doc.fontSize(18).font("Helvetica-Bold").fillColor("#ffffff")
    .text(comp.name || "Web Dreams", M + 78, Y + 12, { width: 260 });

  // Tagline
  doc.fontSize(7).font("Helvetica-Oblique").fillColor("#b0bec5")
    .text("the WWW dream comes true...", M + 78, Y + 34);

  // Contact info
  const contactParts = [];
  if (comp.phone) contactParts.push(comp.phone);
  if (comp.email) contactParts.push(comp.email);
  if (contactParts.length > 0) {
    doc.fontSize(7).font("Helvetica").fillColor("#cfd8dc")
      .text(contactParts.join("  |  "), M + 78, Y + 48);
  }
  if (comp.address) {
    doc.fontSize(6.5).font("Helvetica").fillColor("#cfd8dc")
      .text(comp.address, M + 78, Y + 60, { width: 260 });
  }

  // Right side: SALARY SLIP title + period
  doc.fontSize(16).font("Helvetica-Bold").fillColor("#ffffff")
    .text("SALARY SLIP", M + 350, Y + 15, { width: W - 362, align: "right" });
  doc.fontSize(10).font("Helvetica").fillColor("#b0bec5")
    .text(`${monthName} ${d.year}`, M + 350, Y + 37, { width: W - 362, align: "right" });

  Y += 88;
  doc.fillColor("#000000");

  // ═══════════════════════════════════════════════════════════
  // SECTION 2: EMPLOYEE DETAILS
  // ═══════════════════════════════════════════════════════════

  doc.rect(M, Y, W, 18).fill("#e8eaf6");
  doc.fontSize(8).font("Helvetica-Bold").fillColor("#283593")
    .text("EMPLOYEE DETAILS", M + 10, Y + 4);

  Y += 22;
  const halfW = W / 2;

  const drawInfoRow = (label, value, x, y, w) => {
    doc.fontSize(7.5).font("Helvetica-Bold").fillColor("#616161").text(label, x, y, { width: 90 });
    doc.font("Helvetica").fillColor("#212121").text(String(value || "—"), x + 90, y, { width: w - 100 });
  };

  drawInfoRow("Employee Name:", d.employeeName, M + 10, Y, halfW);
  drawInfoRow("Position:", d.position, M + halfW + 10, Y, halfW);
  Y += 14;
  drawInfoRow("Email:", d.employeeEmail, M + 10, Y, halfW);
  drawInfoRow("Department:", d.department, M + halfW + 10, Y, halfW);
  Y += 14;
  drawInfoRow("Phone:", d.employeePhone, M + 10, Y, halfW);
  drawInfoRow("Pay Period:", `${monthName} ${d.year}`, M + halfW + 10, Y, halfW);

  Y += 20;
  doc.moveTo(M, Y).lineTo(M + W, Y).strokeColor("#e0e0e0").lineWidth(0.5).stroke();
  Y += 4;

  // ═══════════════════════════════════════════════════════════
  // SECTION 3: ATTENDANCE & RATE CARD
  // ═══════════════════════════════════════════════════════════

  doc.rect(M, Y, W, 18).fill("#e8f5e9");
  doc.fontSize(8).font("Helvetica-Bold").fillColor("#2e7d32")
    .text("ATTENDANCE & RATE CARD", M + 10, Y + 4);

  Y += 22;
  const quarterW = W / 4;

  const drawStatBox = (label, value, x, y) => {
    doc.fontSize(6.5).font("Helvetica").fillColor("#757575").text(label, x, y);
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#212121").text(String(value), x, y + 10);
  };

  drawStatBox("Working Days", att.workingDays, M + 10, Y);
  drawStatBox("Working Hours", att.workingHours, M + quarterW + 10, Y);
  drawStatBox("Leaves Taken", att.leavesTaken, M + quarterW * 2 + 10, Y);
  drawStatBox("OT Hours", att.otHours, M + quarterW * 3 + 10, Y);

  Y += 26;
  drawStatBox("Days Present", att.daysPresent, M + 10, Y);
  drawStatBox("Salary / Day", `Rs ${fmt(att.salaryPerDay)}`, M + quarterW + 10, Y);
  drawStatBox("Salary / Hour", `Rs ${fmt(att.salaryPerHour)}`, M + quarterW * 2 + 10, Y);
  drawStatBox("Minus Minutes", att.minusMinutes, M + quarterW * 3 + 10, Y);

  Y += 30;
  doc.moveTo(M, Y).lineTo(M + W, Y).strokeColor("#e0e0e0").lineWidth(0.5).stroke();
  Y += 4;

  // ═══════════════════════════════════════════════════════════
  // SECTION 4: EARNINGS & DEDUCTIONS (side by side)
  // ═══════════════════════════════════════════════════════════

  const tableLeftX = M;
  const tableRightX = M + halfW + 3;
  const tableW = halfW - 3;
  const tableStartY = Y;

  // Left header: EARNINGS
  doc.rect(tableLeftX, Y, tableW, 18).fill("#e8f5e9");
  doc.fontSize(8).font("Helvetica-Bold").fillColor("#2e7d32")
    .text("EARNINGS", tableLeftX + 8, Y + 4);
  doc.fontSize(7).font("Helvetica-Bold").fillColor("#2e7d32")
    .text("Amount (Rs)", tableLeftX + 8, Y + 4, { width: tableW - 16, align: "right" });

  // Right header: DEDUCTIONS
  doc.rect(tableRightX, Y, tableW, 18).fill("#ffebee");
  doc.fontSize(8).font("Helvetica-Bold").fillColor("#c62828")
    .text("DEDUCTIONS", tableRightX + 8, Y + 4);
  doc.fontSize(7).font("Helvetica-Bold").fillColor("#c62828")
    .text("Amount (Rs)", tableRightX + 8, Y + 4, { width: tableW - 16, align: "right" });

  Y += 20;

  const drawTableRow = (label, value, x, y, w, isAlt) => {
    if (isAlt) {
      doc.rect(x, y - 2, w, 15).fill("#f5f5f5");
    }
    doc.fontSize(7.5).font("Helvetica").fillColor("#424242").text(label, x + 8, y);
    doc.text(fmt(value), x + 8, y, { width: w - 16, align: "right" });
  };

  // Earnings rows
  const earningsItems = [
    ["Basic Salary", earn.basicSalary],
    ["Incentive", earn.incentive],
    ["TA / DA", earn.taDa],
    ["Bonus", earn.bonus],
    ["Arrears", earn.arrears],
    ["OT Pay", earn.otPay],
  ];

  let ey = Y;
  earningsItems.forEach(([label, val], i) => {
    drawTableRow(label, val, tableLeftX, ey, tableW, i % 2 === 1);
    ey += 15;
  });

  // Earnings total line
  doc.moveTo(tableLeftX + 8, ey).lineTo(tableLeftX + tableW - 8, ey).strokeColor("#2e7d32").lineWidth(0.8).stroke();
  ey += 3;
  const totalEarnings = (earn.basicSalary || 0) + (earn.incentive || 0) + (earn.taDa || 0) + (earn.bonus || 0) + (earn.arrears || 0) + (earn.otPay || 0);
  doc.fontSize(8).font("Helvetica-Bold").fillColor("#2e7d32")
    .text("Total Earnings", tableLeftX + 8, ey);
  doc.text(fmt(totalEarnings), tableLeftX + 8, ey, { width: tableW - 16, align: "right" });

  // Deductions rows
  const deductionItems = [
    ["Professional Tax", ded.professionalTax],
    ["Advance Taken", ded.advanceTaken],
    ["Advance Deducted", ded.advanceDeducted],
    ["Extra Fine / Late", ded.extraFine],
    ["Leave Penalty", ded.leavePenalty],
    ["Time Penalty", ded.timePenalty],
    ["EMI", ded.emi],
  ];

  let dy = Y;
  deductionItems.forEach(([label, val], i) => {
    drawTableRow(label, val, tableRightX, dy, tableW, i % 2 === 1);
    dy += 15;
  });

  // Deductions total line
  doc.moveTo(tableRightX + 8, dy).lineTo(tableRightX + tableW - 8, dy).strokeColor("#c62828").lineWidth(0.8).stroke();
  dy += 3;
  doc.fontSize(8).font("Helvetica-Bold").fillColor("#c62828")
    .text("Total Deductions", tableRightX + 8, dy);
  doc.text(fmt(t.deduction), tableRightX + 8, dy, { width: tableW - 16, align: "right" });

  // Table border outlines
  const tableEndY = Math.max(ey, dy) + 18;
  doc.lineWidth(0.5).strokeColor("#bdbdbd");
  doc.rect(tableLeftX, tableStartY, tableW, tableEndY - tableStartY).stroke();
  doc.rect(tableRightX, tableStartY, tableW, tableEndY - tableStartY).stroke();

  Y = tableEndY + 6;

  // ═══════════════════════════════════════════════════════════
  // SECTION 5: SALARY SUMMARY BOX
  // ═══════════════════════════════════════════════════════════

  doc.rect(M, Y, W, 65).fill("#f5f5f5").stroke("#bdbdbd");

  doc.fontSize(8).font("Helvetica-Bold").fillColor("#283593")
    .text("SALARY SUMMARY", M + 10, Y + 6);

  const summaryLabelX = M + 25;
  const summaryValX = M + 280;
  let sY = Y + 20;

  doc.fontSize(9).font("Helvetica").fillColor("#424242")
    .text("Gross Salary:", summaryLabelX, sY);
  doc.font("Helvetica-Bold").text(`Rs ${fmt(t.gross)}`, summaryValX, sY, { width: W - summaryValX + M - 20, align: "right" });
  sY += 13;

  doc.font("Helvetica").fillColor("#c62828")
    .text("(-) Total Deductions:", summaryLabelX, sY);
  doc.font("Helvetica-Bold").text(`Rs ${fmt(t.deduction)}`, summaryValX, sY, { width: W - summaryValX + M - 20, align: "right" });
  sY += 13;

  // Net salary highlight bar
  doc.rect(M + 12, sY - 2, W - 24, 18).fill("#1a237e");
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#ffffff")
    .text("NET SALARY:", summaryLabelX, sY + 1);
  doc.text(`Rs ${fmt(t.net)}/-`, summaryValX, sY + 1, { width: W - summaryValX + M - 20, align: "right" });

  Y += 72;

  // ═══════════════════════════════════════════════════════════
  // SECTION 6: AMOUNT IN WORDS
  // ═══════════════════════════════════════════════════════════

  doc.rect(M, Y, W, 20).fill("#fff8e1");
  doc.fontSize(7.5).font("Helvetica-Bold").fillColor("#f57f17")
    .text("In Words: ", M + 10, Y + 5, { continued: true })
    .font("Helvetica").fillColor("#424242").text(numberToWords(t.net || 0));

  Y += 26;

  // ═══════════════════════════════════════════════════════════
  // SECTION 7: SIGNATURE BLOCK + FOOTER
  // ═══════════════════════════════════════════════════════════

  const sigY = Y + 25;

  doc.fontSize(8).font("Helvetica").fillColor("#757575")
    .text("_________________________", M + 20, sigY)
    .text("_________________________", M + W - 180, sigY);

  doc.fontSize(8).font("Helvetica-Bold").fillColor("#424242")
    .text("Employee Signature", M + 30, sigY + 14)
    .text("Authorized Signatory", M + W - 170, sigY + 14);

  // Footer
  const footerY = doc.page.height - M - 28;
  doc.moveTo(M, footerY).lineTo(M + W, footerY).strokeColor("#e0e0e0").lineWidth(0.5).stroke();
  doc.fontSize(6.5).font("Helvetica-Oblique").fillColor("#9e9e9e")
    .text("This is a computer-generated payslip and does not require a physical signature.", M, footerY + 5, { width: W, align: "center" });
  if (comp.address) {
    doc.text(`${comp.name || ""} | ${comp.address}${comp.phone ? " | " + comp.phone : ""}`, M, footerY + 14, { width: W, align: "center" });
  }

  doc.end();
  return stream;
}

module.exports = {
  createPayslip,
  getPayslip,
  generatePdfStream,
  normalizePayslipData,
};
