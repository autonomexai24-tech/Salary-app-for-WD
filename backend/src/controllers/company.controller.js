const companyService = require("../services/company.service");
const { companyUpsertSchema } = require("../validations/company.validation");
const multer = require("multer");

// Configure multer to store file in memory (not disk) for base64 conversion
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowed.test(file.originalname.split(".").pop().toLowerCase());
    const mime = allowed.test(file.mimetype.split("/")[1]);
    if (ext || mime) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

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

async function uploadLogo(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Convert file buffer to base64 data URL — stored directly in database
    const base64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "image/png";
    const logoUrl = `data:${mimeType};base64,${base64}`;

    // Save the base64 data URL directly in the company record
    const prisma = require("../utils/prisma");
    const existing = await prisma.company.findFirst();
    if (existing) {
      await prisma.company.update({
        where: { id: existing.id },
        data: { logoUrl },
      });
    } else {
      await prisma.company.create({
        data: { name: "Company", logoUrl },
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: { logoUrl },
      message: "Logo uploaded successfully" 
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCompany,
  upsertCompany,
  uploadLogo,
  uploadMiddleware: upload.single("logo"),
};
