const express = require("express");
const router = express.Router();
const controller = require("../controllers/payslip.controller");

router.post("/", controller.createPayslip);
router.get("/", controller.getPayslips);
router.get("/:id/download", controller.downloadPdf);

module.exports = router;
