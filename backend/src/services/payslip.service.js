const prisma = require("../utils/prisma");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");

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

  // Capture active Company settings at creation point for permanent snapshot
  let companyMeta = { name: "Web Dreams", address: "#51-B, Behind Mahaveer school, Bailappanavar nagar, Hubli-29", email: "", logoUrl: "" };
  const company = await prisma.company.findFirst();
  if (company) {
    companyMeta = {
      name: company.name,
      address: company.address || companyMeta.address,
      email: company.email || "",
      logoUrl: company.logoUrl || "",
    };
  }

  // Strict Immutability Rule: Data is extracted identically without independent math sequences.
  const snapshot = {
    employeeName: `${salary.employee.firstName} ${salary.employee.lastName}`,
    employeeEmail: `${salary.employee.firstName.toLowerCase()}${salary.employee.lastName.toLowerCase() || ""}@gmail.com`, // mock email as per image 3
    position: salary.employee.qualification || salary.employee.department?.name || "Employee",
    month: salary.month,
    year: salary.year,

    company: companyMeta,

    salary: {
      basicSalary: salary.basicSalary,
      incentive: salary.incentive || 0,
      bonus: salary.bonus || 0,
      taDa: salary.taDa || 0,
      arrears: salary.arrears || 0,
      professionalTax: salary.professionalTax || 0,
      advanceTaken: salary.advanceTaken || 0,
      additionalAdvance: salary.additionalAdvance || 0,
      advanceDeducted: salary.advanceDeducted || 0,
      extraFine: salary.extraFine || 0,
      leavePenalty: salary.leavePenalty || 0,
      timePenalty: salary.timePenalty || 0,
    },
    totals: {
      gross: salary.grossSalary,
      deduction: salary.totalDeduction,
      net: salary.netSalary,
    },
  };

  const payslip = await prisma.payslip.upsert({
    where: { salaryId: salary.id },
    update: {
      month: salary.month,
      year: salary.year,
      data: snapshot,
    },
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
  const payslip = await prisma.payslip.findUnique({
    where: { id: payslipId },
  });
  if (!payslip) throw new Error("Payslip not found");
  return payslip;
}

function generatePdfStream(payslipDataObj) {
  // Use Landscape for wide table formatting (like Image 3)
  const doc = new PDFDocument({ margin: 40, layout: "landscape", size: "A4" });
  const stream = new PassThrough();

  doc.pipe(stream);

  const d = payslipDataObj.data;
  const comp = d.company || {};

  // Draw Header Border rectangle
  const startX = 40;
  const startY = 40;
  const width = doc.page.width - 80;
  const height = doc.page.height - 80;
  
  doc.rect(startX, startY, width, height).stroke("#000000"); // Main border

  // --- HEADER SECTION ---
  doc.fontSize(10).font("Helvetica-Bold").text(`Employee Name: `, startX + 15, startY + 20, { continued: true })
     .font("Helvetica").text(d.employeeName);
  
  doc.font("Helvetica-Bold").text(`Employee ID: `, startX + 15, startY + 40, { continued: true })
     .font("Helvetica").text(d.employeeEmail || `${d.employeeName.replace(/\s+/g,"")}@gmail.com`);

  doc.font("Helvetica-Bold").text(`Position: `, startX + 300, startY + 20, { continued: true })
     .font("Helvetica").text(d.position);
  
  // Format Month array
  const mNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "AUG", "Sept", "Oct", "Nov", "Dec"];
  const mStr = mNames[parseInt(d.month)-1] || d.month;
  doc.font("Helvetica-Bold").text(`Payslip For: `, startX + 300, startY + 40, { continued: true })
     .font("Helvetica").text(`${mStr} / ${d.year}`);

  // Company details on right
  doc.fontSize(16).font("Helvetica-Bold").fillColor("#e67e22").text(comp.name || "Web Dreams", startX + 550, startY + 20, { align: "right", width: width - 565 });
  doc.fontSize(8).font("Helvetica-Oblique").fillColor("#555555").text("the WWW dream comes true...", startX + 550, startY + 40, { align: "right", width: width - 565 });

  doc.fillColor("#000000"); // Reset color

  // --- TABLE SECTION ---
  const tableY = startY + 80;
  doc.rect(startX, tableY, width, 40).stroke(); // Header row line
  
  // Draw Columns (12 columns)
  const s = d.salary;
  const cols = [
    { label: "Basic", val: s.basicSalary, color: "#16a085" },
    { label: "Incentives", val: s.incentive, color: "#16a085" },
    { label: "Bonus", val: s.bonus, color: "#16a085" },
    { label: "TA/DA", val: s.taDa, color: "#16a085" },
    { label: "Arrears", val: s.arrears, color: "#16a085" },
    { label: "Prof.tax", val: s.professionalTax, color: "#c0392b" },
    { label: "Adv. pay", val: s.advanceTaken, color: "#c0392b" },
    { label: "Addition. adv", val: s.additionalAdvance, color: "#c0392b" },
    { label: "Adv. deducted", val: s.advanceDeducted, color: "#c0392b" },
    { label: "Extra fine", val: s.extraFine, color: "#c0392b" },
    { label: "Leave penalty", val: s.leavePenalty, color: "#c0392b" },
    { label: "Time penalty", val: s.timePenalty, color: "#c0392b" },
  ];

  const colWidth = width / cols.length;
  
  // Draw Headers & Values & Vertical Lines
  cols.forEach((col, i) => {
    const x = startX + (i * colWidth);
    if (i > 0) {
      doc.moveTo(x, tableY).lineTo(x, doc.page.height - 200).stroke(); // vertical line downwards
    }
    // Column Header
    doc.fontSize(9).font("Helvetica").fillColor(col.color).text(col.label, x + 5, tableY + 5, { width: colWidth - 10, align: "left" });
    // Column Value
    doc.fillColor("#000000").text(Math.round(col.val).toString(), x + 5, tableY + 25, { width: colWidth - 10, align: "left" });
  });

  doc.rect(startX, tableY + 40, width, 0).stroke(); // Line separating header and values

  // --- SECONDARY TOTALS ROW ---
  const totalsY = tableY + 60;
  doc.fontSize(10).font("Helvetica-Bold").text("Gross", startX + 10, totalsY);
  doc.text("Deduction", startX + 70, totalsY);
  doc.text("Net salary", startX + 150, totalsY);

  const t = d.totals;
  const fmt = (v) => Math.round(v).toString();
  doc.font("Helvetica").text(fmt(t.gross), startX + 10, totalsY + 20);
  doc.text(fmt(t.deduction), startX + 70, totalsY + 20);
  doc.text(fmt(t.net) + "/-", startX + 150, totalsY + 20);

  // --- SIGNATURE & ADDRESS ---
  doc.font("Helvetica-Bold").text("signature of proprietor", startX + 450, totalsY, { align: "center" });
  
  doc.font("Helvetica").fontSize(9).text(comp.address || "", startX + 400, totalsY + 50, { width: 300, align: "center" });

  doc.end();
  return stream;
}

module.exports = {
  createPayslip,
  getPayslip,
  generatePdfStream,
};
