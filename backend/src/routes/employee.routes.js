const express = require("express");
const router = express.Router();
const controller = require("../controllers/employee.controller");

router.post("/", controller.createEmployee);
router.get("/", controller.getEmployees);
router.put("/:id", controller.updateEmployee);
router.delete("/:id", controller.deleteEmployee);

module.exports = router;
