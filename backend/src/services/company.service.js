const prisma = require("../utils/prisma");

/**
 * Get the singleton company record.
 */
async function getCompany() {
  const company = await prisma.company.findFirst({
    include: { employers: true },
  });
  return company;
}

/**
 * Upsert the company record (singleton pattern).
 * If a company already exists → update it.
 * If no company exists → create it.
 */
async function upsertCompany(data) {
  const existing = await prisma.company.findFirst();

  if (existing) {
    const updated = await prisma.company.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        logoUrl: data.logoUrl || null,
      },
      include: { employers: true },
    });
    return updated;
  }

  const created = await prisma.company.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      logoUrl: data.logoUrl || null,
    },
    include: { employers: true },
  });
  return created;
}

module.exports = {
  getCompany,
  upsertCompany,
};
