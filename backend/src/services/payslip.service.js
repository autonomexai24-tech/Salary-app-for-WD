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

  // Strict Immutability Rule: Data is extracted identically without independent math sequences.
  const snapshot = {
    employeeName: `${salary.employee.firstName} ${salary.employee.lastName}`,
    email: "", // Not tracked in physical schema natively yet
    position: salary.employee.qualification || salary.employee.department?.name || "Employee",
    month: salary.month,
    year: salary.year,

    salary: {
      basicSalary: salary.basicSalary,
      incentive: salary.incentive || 0,
      bonus: salary.bonus || 0,
      taDa: salary.taDa || 0,
      arrears: salary.arrears || 0,
      professionalTax: salary.professionalTax || 0,
      advanceTaken: salary.advanceTaken || 0,
      advanceDeducted: salary.advanceDeducted || 0,
    },
    totals: {
      gross: salary.grossSalary,
      deduction: salary.totalDeduction,
      net: salary.netSalary,
    },
  };

  const payslip = await prisma.payslip.create({
    data: {
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
  const doc = new PDFDocument({ margin: 50 });
  const stream = new PassThrough();

  doc.pipe(stream);

  // Secure Header UI
  doc.fontSize(22).font("Helvetica-Bold").text("PAYSLIP", { align: "center" });
  doc.moveDown();

  const d = payslipDataObj.data;

  // Employee Identity Meta Data block natively generated
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(`Employee Name: `, { continued: true })
    .font("Helvetica")
    .text(d.employeeName);

  doc
    .font("Helvetica-Bold")
    .text(`Position: `, { continued: true })
    .font("Helvetica")
    .text(d.position);

  doc
    .font("Helvetica-Bold")
    .text(`Period: `, { continued: true })
    .font("Helvetica")
    .text(`${d.month} / ${d.year}`);

  doc.moveDown(2);

  const drawRow = (label, value) => {
    doc.font("Helvetica").text(label, { continued: true }).text(`   Rs. ${value}`);
  };

  doc.fontSize(16).font("Helvetica-Bold").text("Salary Breakdown", { underline: true });
  doc.moveDown(0.5);

  const s = d.salary;
  doc.fontSize(12);
  drawRow("Basic Salary:", s.basicSalary);
  drawRow("Incentives:", s.incentive);
  drawRow("Bonus:", s.bonus);
  drawRow("TA/DA:", s.taDa);
  drawRow("Arrears:", s.arrears);
  drawRow("Professional Tax:", s.professionalTax);
  drawRow("Advance Taken:", s.advanceTaken);
  drawRow("Advance Deducted:", s.advanceDeducted);

  doc.moveDown(2);

  doc.fontSize(16).font("Helvetica-Bold").text("Totals computation", { underline: true });
  doc.moveDown(0.5);

  const t = d.totals;
  doc.fontSize(14).font("Helvetica");
  drawRow("Gross Salary:", t.gross);
  drawRow("Total Deductions:", t.deduction);

  doc.moveDown(1);
  doc.fontSize(18).font("Helvetica-Bold").text(`Net Transfer: Rs. ${t.net}`);

  doc.end();
  return stream;
}

module.exports = {
  createPayslip,
  getPayslip,
  generatePdfStream,
};
