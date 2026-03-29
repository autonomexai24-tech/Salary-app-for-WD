const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding users...");

  const salt = await bcrypt.genSalt(10);

  // Employer user
  const employerPassword = await bcrypt.hash("pass123", salt);
  await prisma.user.upsert({
    where: { userId: "EMP-2024" },
    update: { password: employerPassword, name: "Employer User", role: "EMPLOYER" },
    create: {
      userId: "EMP-2024",
      password: employerPassword,
      name: "Employer User",
      role: "EMPLOYER",
    },
  });
  console.log("  ✅ Employer: EMP-2024 / pass123");

  // Admin user
  const adminPassword = await bcrypt.hash("admin@99", salt);
  await prisma.user.upsert({
    where: { userId: "ADM-ROOT" },
    update: { password: adminPassword, name: "Admin User", role: "ADMIN" },
    create: {
      userId: "ADM-ROOT",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });
  console.log("  ✅ Admin:    ADM-ROOT / admin@99");

  // Verify users exist
  const count = await prisma.user.count();
  console.log(`  📊 Total users in database: ${count}`);
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e.message || e);
    // Don't exit with code 1 — let the server start anyway
    // process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
