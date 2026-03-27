const { Router } = require("express");
const departmentController = require("../controllers/department.controller");

const router = Router();

router.post("/", departmentController.create);
router.get("/", departmentController.getAll);
router.put("/:id", departmentController.update);
router.delete("/:id", departmentController.remove);

module.exports = router;
