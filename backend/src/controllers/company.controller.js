const companyService = require("../services/company.service");
const { companyUpsertSchema } = require("../validations/company.validation");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for logo upload
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `company-logo-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
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

    // Build the public URL for the logo
    const logoUrl = `/api/uploads/${req.file.filename}`;

    // ONLY update the logoUrl field — don't touch name/email/phone/address
    const prisma = require("../utils/prisma");
    const existing = await prisma.company.findFirst();
    if (existing) {
      await prisma.company.update({
        where: { id: existing.id },
        data: { logoUrl },
      });
    } else {
      // No company exists yet — create a minimal record with just the logo
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
