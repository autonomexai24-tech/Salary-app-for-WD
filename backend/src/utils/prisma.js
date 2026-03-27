const { PrismaClient } = require("@prisma/client");

/** @type {PrismaClient} */
let prisma;

if (!global.__prisma) {
  global.__prisma = new PrismaClient();
}

prisma = global.__prisma;

module.exports = prisma;
