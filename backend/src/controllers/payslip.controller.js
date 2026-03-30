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
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const [payslips, total] = await Promise.all([
      prisma.payslip.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payslip.count(),
    ]);

    return res.status(200).json({
      success: true,
      data: payslips,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
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
