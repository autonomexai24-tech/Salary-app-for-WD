const express = require("express");
const router = express.Router();
const controller = require("../controllers/salary.controller");

router.post("/", controller.createSalary);
router.get("/", controller.getSalaries);

module.exports = router;
