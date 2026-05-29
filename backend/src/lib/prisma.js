const { PrismaClient } = require('@prisma/client');

if (!global.__realPrisma) {
  global.__realPrisma = new PrismaClient();
}

if (!global.__prisma) {
  global.__prisma = global.__realPrisma;
}

const prismaProxy = new Proxy({}, {
  get(target, prop) {
    return global.__prisma[prop];
  },
  set(target, prop, value) {
    global.__prisma[prop] = value;
    return true;
  }
});

module.exports = prismaProxy;
