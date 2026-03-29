const prisma = require("../utils/prisma");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");

// ─── Number to Words (Indian currency) ────────────────────────
function numberToWords(num) {
  if (num === 0) return "Zero";
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

// ─── Stage 1: Create Payslip with FULL snapshot ───────────────
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

  // FULL snapshot — every field the PDF needs
  const snapshot = {
    employeeName: `${salary.employee.firstName} ${salary.employee.lastName}`,
    employeeEmail: `${salary.employee.firstName.toLowerCase()}${salary.employee.lastName.toLowerCase()}@gmail.com`,
    employeePhone: salary.employee.phone || "",
    position: salary.employee.qualification || salary.employee.department?.name || "Employee",
    department: salary.employee.department?.name || "General",
    month: salary.month,
    year: salary.year,

    company: companyMeta,

    // Attendance & Rates
    attendance: {
      workingDays,
      workingHours,
      leavesTaken: salary.leavesTaken || 0,
      daysPresent,
      otHours: salary.otHours || 0,
      minusMinutes: salary.minusMinutes || 0,
      salaryPerDay: Math.round(salaryPerDay * 100) / 100,
      salaryPerHour: Math.round(salaryPerHour * 100) / 100,
    },

    // Earnings breakdown
    earnings: {
      basicSalary,
      incentive: salary.incentive || 0,
      taDa: salary.taDa || 0,
      bonus: salary.bonus || 0,
      arrears: salary.arrears || 0,
      otPay: salary.otPay || 0,
    },

    // Deductions breakdown
    deductions: {
      professionalTax: salary.professionalTax || 0,
      advanceTaken: salary.advanceTaken || 0,
      advanceDeducted: salary.advanceDeducted || 0,
      extraFine: salary.extraFine || 0,
      leavePenalty: salary.leavePenalty || 0,
      timePenalty: salary.timePenalty || 0,
      emi: salary.emi || 0,
    },

    // Totals
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

// ─── Stage 2: Professional A4 Portrait PDF Generator ──────────
function generatePdfStream(payslipDataObj) {
  const doc = new PDFDocument({ margin: 40, size: "A4" }); // A4 Portrait
  const stream = new PassThrough();
  doc.pipe(stream);

  const d = payslipDataObj.data;
  const comp = d.company || {};
  const att = d.attendance || {};
  const earn = d.earnings || d.salary || {};
  const ded = d.deductions || {};
  const t = d.totals || {};

  const M = 40; // margin
  const W = doc.page.width - 2 * M; // content width (~515)
  const fmt = (v) => Math.round(Number(v) || 0).toLocaleString("en-IN");
  const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const monthName = MONTHS[parseInt(d.month) - 1] || d.month;

  let Y = M; // current Y cursor

  // ═══════════════════════════════════════════════════════════
  // SECTION 1: COMPANY HEADER BAND
  // ═══════════════════════════════════════════════════════════

  // Background band
  doc.rect(M, Y, W, 80).fill("#1a237e");

  // Logo placeholder (white box)
  doc.rect(M + 12, Y + 10, 60, 60).fill("#ffffff").stroke("#cccccc");
  doc.fontSize(7).fillColor("#999999").text("LOGO", M + 12, Y + 35, { width: 60, align: "center" });

  // Company name
  doc.fontSize(20).font("Helvetica-Bold").fillColor("#ffffff")
    .text(comp.name || "Web Dreams", M + 85, Y + 14, { width: 250 });

  // Tagline
  doc.fontSize(8).font("Helvetica-Oblique").fillColor("#b0bec5")
    .text("the WWW dream comes true...", M + 85, Y + 40);

  // Contact info
  const contactParts = [];
  if (comp.phone) contactParts.push(comp.phone);
  if (comp.email) contactParts.push(comp.email);
  if (contactParts.length > 0) {
    doc.fontSize(7).font("Helvetica").fillColor("#cfd8dc")
      .text(contactParts.join("  |  "), M + 85, Y + 54);
  }
  if (comp.address) {
    doc.fontSize(7).font("Helvetica").fillColor("#cfd8dc")
      .text(comp.address, M + 85, Y + 64);
  }

  // Right side: SALARY SLIP title + period
  doc.fontSize(16).font("Helvetica-Bold").fillColor("#ffffff")
    .text("SALARY SLIP", M + 350, Y + 14, { width: W - 362, align: "right" });
  doc.fontSize(10).font("Helvetica").fillColor("#b0bec5")
    .text(`${monthName} ${d.year}`, M + 350, Y + 36, { width: W - 362, align: "right" });

  Y += 88;
  doc.fillColor("#000000"); // Reset

  // ═══════════════════════════════════════════════════════════
  // SECTION 2: EMPLOYEE DETAILS
  // ═══════════════════════════════════════════════════════════

  doc.rect(M, Y, W, 20).fill("#e8eaf6");
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#283593")
    .text("EMPLOYEE DETAILS", M + 10, Y + 5);

  Y += 24;
  const halfW = W / 2;

  const drawInfoRow = (label, value, x, y, w) => {
    doc.fontSize(8).font("Helvetica-Bold").fillColor("#616161").text(label, x, y, { width: 100 });
    doc.font("Helvetica").fillColor("#212121").text(value || "—", x + 100, y, { width: w - 110 });
  };

  drawInfoRow("Employee Name:", d.employeeName, M + 10, Y, halfW);
  drawInfoRow("Position:", d.position, M + halfW + 10, Y, halfW);

  Y += 16;
  drawInfoRow("Email:", d.employeeEmail, M + 10, Y, halfW);
  drawInfoRow("Department:", d.department, M + halfW + 10, Y, halfW);

  Y += 16;
  drawInfoRow("Phone:", d.employeePhone, M + 10, Y, halfW);
  drawInfoRow("Pay Period:", `${monthName} ${d.year}`, M + halfW + 10, Y, halfW);

  Y += 22;

  // Thin separator line
  doc.moveTo(M, Y).lineTo(M + W, Y).strokeColor("#e0e0e0").stroke();
  Y += 6;

  // ═══════════════════════════════════════════════════════════
  // SECTION 3: ATTENDANCE & RATE CARD
  // ═══════════════════════════════════════════════════════════

  doc.rect(M, Y, W, 20).fill("#e8f5e9");
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#2e7d32")
    .text("ATTENDANCE & RATE CARD", M + 10, Y + 5);

  Y += 24;
  const quarterW = W / 4;

  const drawStatBox = (label, value, x, y) => {
    doc.fontSize(7).font("Helvetica").fillColor("#757575").text(label, x, y);
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#212121").text(String(value), x, y + 11);
  };

  drawStatBox("Working Days", att.workingDays || 0, M + 10, Y);
  drawStatBox("Working Hours", att.workingHours || 0, M + quarterW + 10, Y);
  drawStatBox("Leaves Taken", att.leavesTaken || 0, M + quarterW * 2 + 10, Y);
  drawStatBox("OT Hours", att.otHours || 0, M + quarterW * 3 + 10, Y);

  Y += 30;
  drawStatBox("Days Present", att.daysPresent || 0, M + 10, Y);
  drawStatBox("Salary / Day", `₹ ${fmt(att.salaryPerDay)}`, M + quarterW + 10, Y);
  drawStatBox("Salary / Hour", `₹ ${fmt(att.salaryPerHour)}`, M + quarterW * 2 + 10, Y);
  drawStatBox("Minus Minutes", att.minusMinutes || 0, M + quarterW * 3 + 10, Y);

  Y += 34;
  doc.moveTo(M, Y).lineTo(M + W, Y).strokeColor("#e0e0e0").stroke();
  Y += 6;

  // ═══════════════════════════════════════════════════════════
  // SECTION 4: EARNINGS & DEDUCTIONS (side by side)
  // ═══════════════════════════════════════════════════════════

  const tableLeftX = M;
  const tableRightX = M + halfW + 4;
  const tableW = halfW - 4;
  const tableStartY = Y;

  // ── Left: EARNINGS ──
  doc.rect(tableLeftX, Y, tableW, 20).fill("#e8f5e9");
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#2e7d32")
    .text("EARNINGS", tableLeftX + 10, Y + 5);
  doc.fontSize(8).font("Helvetica-Bold").fillColor("#2e7d32")
    .text("Amount (₹)", tableLeftX + 10, Y + 5, { width: tableW - 20, align: "right" });

  // ── Right: DEDUCTIONS ──
  doc.rect(tableRightX, Y, tableW, 20).fill("#ffebee");
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#c62828")
    .text("DEDUCTIONS", tableRightX + 10, Y + 5);
  doc.fontSize(8).font("Helvetica-Bold").fillColor("#c62828")
    .text("Amount (₹)", tableRightX + 10, Y + 5, { width: tableW - 20, align: "right" });

  Y += 24;

  const drawTableRow = (label, value, x, y, w, isAlt) => {
    if (isAlt) {
      doc.rect(x, y - 2, w, 16).fill("#f5f5f5");
    }
    doc.fontSize(8).font("Helvetica").fillColor("#424242").text(label, x + 10, y);
    doc.text(fmt(value), x + 10, y, { width: w - 20, align: "right" });
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
    ey += 16;
  });

  // Earnings total
  doc.moveTo(tableLeftX + 10, ey).lineTo(tableLeftX + tableW - 10, ey).strokeColor("#2e7d32").lineWidth(1).stroke();
  ey += 4;
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#2e7d32")
    .text("Total Earnings", tableLeftX + 10, ey);
  const totalEarnings = (earn.basicSalary || 0) + (earn.incentive || 0) + (earn.taDa || 0) + (earn.bonus || 0) + (earn.arrears || 0) + (earn.otPay || 0);
  doc.text(fmt(totalEarnings), tableLeftX + 10, ey, { width: tableW - 20, align: "right" });

  // Deductions rows
  const deductionItems = [
    ["Professional Tax", ded.professionalTax],
    ["Advance Taken", ded.advanceTaken],
    ["Advance Deducted", ded.advanceDeducted],
    ["Extra Fine / Late Fee", ded.extraFine],
    ["Leave Penalty", ded.leavePenalty],
    ["Time Penalty", ded.timePenalty],
    ["EMI", ded.emi],
  ];

  let dy = Y;
  deductionItems.forEach(([label, val], i) => {
    drawTableRow(label, val, tableRightX, dy, tableW, i % 2 === 1);
    dy += 16;
  });

  // Deductions total
  doc.moveTo(tableRightX + 10, dy).lineTo(tableRightX + tableW - 10, dy).strokeColor("#c62828").lineWidth(1).stroke();
  dy += 4;
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#c62828")
    .text("Total Deductions", tableRightX + 10, dy);
  doc.text(fmt(t.deduction), tableRightX + 10, dy, { width: tableW - 20, align: "right" });

  // Table borders
  const tableEndY = Math.max(ey, dy) + 20;
  doc.lineWidth(0.5).strokeColor("#bdbdbd");
  doc.rect(tableLeftX, tableStartY, tableW, tableEndY - tableStartY).stroke();
  doc.rect(tableRightX, tableStartY, tableW, tableEndY - tableStartY).stroke();

  Y = tableEndY + 8;

  // ═══════════════════════════════════════════════════════════
  // SECTION 5: SALARY SUMMARY BOX
  // ═══════════════════════════════════════════════════════════

  doc.rect(M, Y, W, 70).fill("#f5f5f5").stroke("#bdbdbd");

  doc.fontSize(9).font("Helvetica-Bold").fillColor("#283593")
    .text("SALARY SUMMARY", M + 10, Y + 8);

  const summaryX = M + 30;
  const summaryValX = M + 200;
  let sY = Y + 22;

  doc.fontSize(9).font("Helvetica").fillColor("#424242")
    .text("Gross Salary:", summaryX, sY);
  doc.font("Helvetica-Bold").text(`₹ ${fmt(t.gross)}`, summaryValX, sY);
  sY += 14;

  doc.font("Helvetica").fillColor("#c62828")
    .text("(-) Total Deductions:", summaryX, sY);
  doc.font("Helvetica-Bold").text(`₹ ${fmt(t.deduction)}`, summaryValX, sY);
  sY += 14;

  // Net salary highlight
  doc.rect(M + 15, sY - 2, W - 30, 20).fill("#1a237e");
  doc.fontSize(11).font("Helvetica-Bold").fillColor("#ffffff")
    .text("NET SALARY:", summaryX, sY + 2);
  doc.text(`₹ ${fmt(t.net)}/-`, summaryValX, sY + 2);

  Y += 78;

  // ═══════════════════════════════════════════════════════════
  // SECTION 6: AMOUNT IN WORDS
  // ═══════════════════════════════════════════════════════════

  doc.rect(M, Y, W, 22).fill("#fff8e1");
  doc.fontSize(8).font("Helvetica-Bold").fillColor("#f57f17")
    .text("In Words: ", M + 10, Y + 6, { continued: true })
    .font("Helvetica").fillColor("#424242").text(numberToWords(t.net || 0));

  Y += 28;

  // ═══════════════════════════════════════════════════════════
  // SECTION 7: SIGNATURE BLOCK + FOOTER
  // ═══════════════════════════════════════════════════════════

  const sigY = Y + 30;

  doc.fontSize(8).font("Helvetica").fillColor("#757575")
    .text("_________________________", M + 20, sigY)
    .text("_________________________", M + W - 180, sigY);

  doc.fontSize(8).font("Helvetica-Bold").fillColor("#424242")
    .text("Employee Signature", M + 30, sigY + 14)
    .text("Authorized Signatory", M + W - 170, sigY + 14);

  // Footer
  const footerY = doc.page.height - M - 30;
  doc.moveTo(M, footerY).lineTo(M + W, footerY).strokeColor("#e0e0e0").lineWidth(0.5).stroke();
  doc.fontSize(7).font("Helvetica-Oblique").fillColor("#9e9e9e")
    .text("This is a computer-generated payslip and does not require a physical signature.", M, footerY + 6, { width: W, align: "center" });
  if (comp.address) {
    doc.text(`${comp.name || ""} | ${comp.address}${comp.phone ? " | " + comp.phone : ""}`, M, footerY + 16, { width: W, align: "center" });
  }

  doc.end();
  return stream;
}

module.exports = {
  createPayslip,
  getPayslip,
  generatePdfStream,
};
