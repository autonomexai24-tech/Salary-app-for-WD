const companyService = require("../services/company.service");
const { companyUpsertSchema } = require("../validations/company.validation");

async function getCompany(req, res, next) {
  try {
    const company = await companyService.getCompany();
    if (!company) {
      return res.status(200).json({ success: true, data: null });
    }
    return res.status(200).json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
}

async function upsertCompany(req, res, next) {
  try {
    const data = companyUpsertSchema.parse(req.body);
    const company = await companyService.upsertCompany(data);
    return res.status(200).json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCompany,
  upsertCompany,
};
