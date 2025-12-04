const { PrismaClient } = require('@prisma/client');

// Membuat instance Prisma Client
const prisma = new PrismaClient();

module.exports = prisma;