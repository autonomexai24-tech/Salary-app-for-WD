const employeeService = require("../services/employee.service");
const {
  createEmployeeSchema,
  paginationSchema,
  uuidParamSchema,
} = require("../validations/employee.validation");

async function createEmployee(req, res, next) {
  try {
    const data = createEmployeeSchema.parse(req.body);
    const employee = await employeeService.createEmployee(data);
    return res.status(201).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
}

async function getEmployees(req, res, next) {
  try {
    const params = paginationSchema.parse(req.query);
    const result = await employeeService.getEmployees(params);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function updateEmployee(req, res, next) {
  try {
    const { id } = uuidParamSchema.parse(req.params);

    // Using partial to make all fields optional on update, except id itself
    const data = createEmployeeSchema.partial().parse(req.body);
    
    const employee = await employeeService.updateEmployee(id, data);
    return res.status(200).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
}

async function deleteEmployee(req, res, next) {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    await employeeService.deleteEmployee(id);
    return res.status(200).json({ success: true, message: "Employee deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
};
