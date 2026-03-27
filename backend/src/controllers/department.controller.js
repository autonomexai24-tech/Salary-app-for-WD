const departmentService = require("../services/department.service");
const {
  departmentBodySchema,
  paginationSchema,
  uuidParamSchema,
} = require("../validations/department.validation");

/**
 * POST /api/departments
 */
async function create(req, res, next) {
  try {
    const data = departmentBodySchema.parse(req.body);
    const department = await departmentService.createDepartment(data);
    return res.status(201).json({ success: true, data: department });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/departments
 */
async function getAll(req, res, next) {
  try {
    const params = paginationSchema.parse(req.query);
    const result = await departmentService.getDepartments(params);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/departments/:id
 */
async function update(req, res, next) {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    const data = departmentBodySchema.parse(req.body);
    const department = await departmentService.updateDepartment(id, data);
    return res.status(200).json({ success: true, data: department });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/departments/:id
 */
async function remove(req, res, next) {
  try {
    const { id } = uuidParamSchema.parse(req.params);
    await departmentService.softDeleteDepartment(id);
    return res.status(200).json({ success: true, message: "Department deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getAll, update, remove };
