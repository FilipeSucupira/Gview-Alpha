import { afterAll } from 'vitest';

// Variáveis de ambiente para todos os testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'gview-secret-dev';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';

afterAll(() => {
  if (global.__realPrisma) {
    global.__prisma = global.__realPrisma;
  }
});
