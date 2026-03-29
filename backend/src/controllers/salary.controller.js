const salaryService = require("../services/salary.service");
const { createSalarySchema } = require("../validations/salary.validation");
const { paginationSchema } = require("../validations/department.validation");

async function createSalary(req, res, next) {
  try {
    const data = createSalarySchema.parse(req.body);
    const salary = await salaryService.createSalary(data);
    return res.status(201).json({ success: true, data: salary });
  } catch (err) {
    next(err);
  }
}

async function getSalaries(req, res, next) {
  try {
    const params = paginationSchema.parse(req.query);
    const result = await salaryService.getSalaries(params);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createSalary,
  getSalaries,
};
