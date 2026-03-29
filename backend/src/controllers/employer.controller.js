const employerService = require("../services/employer.service");
const { createEmployerSchema } = require("../validations/employer.validation");
const { paginationSchema, uuidParamSchema } = require("../validations/department.validation");

async function createEmployer(req, res, next) {
  try {
    const data = createEmployerSchema.parse(req.body);
    const employer = await employerService.createEmployer(data);
    return res.status(201).json({ success: true, data: employer });
  } catch (err) {
    next(err);
  }
}

async function getEmployers(req, res, next) {
  try {
    const params = paginationSchema.parse(req.query);
    const result = await employerService.getEmployers(params);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function updateEmployer(req, res, next) {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const data = createEmployerSchema.parse(req.body);
    const employer = await employerService.updateEmployer(id, data);
    return res.status(200).json({ success: true, data: employer });
  } catch (err) {
    next(err);
  }
}

async function deleteEmployer(req, res, next) {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const result = await employerService.deleteEmployer(id);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createEmployer,
  getEmployers,
  updateEmployer,
  deleteEmployer,
};
