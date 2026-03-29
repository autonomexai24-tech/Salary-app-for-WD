const express = require("express");
const router = express.Router();
const controller = require("../controllers/company.controller");

router.get("/", controller.getCompany);
router.post("/", controller.upsertCompany);
router.post("/logo", controller.uploadMiddleware, controller.uploadLogo);

module.exports = router;
