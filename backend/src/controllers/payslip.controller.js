const payslipService = require("../services/payslip.service");

async function createPayslip(req, res, next) {
  try {
    const { salaryId } = req.body;
    if (!salaryId) throw new Error("salaryId is required");
    const payslip = await payslipService.createPayslip(salaryId);
    return res.status(201).json({ success: true, data: payslip });
  } catch (err) {
    next(err);
  }
}

async function getPayslips(req, res, next) {
  try {
    const prisma = require("../utils/prisma");
    const payslips = await prisma.payslip.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ success: true, data: payslips });
  } catch (err) {
    next(err);
  }
}

async function downloadPdf(req, res, next) {
  try {
    const payslipId = req.params.id;
    const payslip = await payslipService.getPayslip(payslipId);

    // Strict HTTP stream bindings enabling safe file transmissions
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=payslip-${payslip.month}-${payslip.year}.pdf`
    );

    const pdfStream = await payslipService.generatePdfStream(payslip);

    // Pipe bytes immediately escaping memory bounds securely
    pdfStream.pipe(res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPayslip,
  getPayslips,
  downloadPdf,
};
