const express = require("express");
const router = express.Router();
const controller = require("../controllers/employer.controller");

router.post("/", controller.createEmployer);
router.get("/", controller.getEmployers);
router.delete("/:id", controller.deleteEmployer);

module.exports = router;
