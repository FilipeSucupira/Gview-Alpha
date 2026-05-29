import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/server.js';
import prisma from '../../src/lib/prisma.js';

const testEmail = `test_auth_${Date.now()}@test.com`;

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: 'test_auth_' } } });
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('deve registrar um novo usuário com sucesso', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User', email: testEmail, password: 'pass123'
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe(testEmail);
  });

  it('deve retornar 409 para e-mail duplicado', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User', email: testEmail, password: 'pass123'
    });
    expect(res.status).toBe(409);
  });

  it('deve retornar 400 sem campos obrigatórios', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'Test' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('deve fazer login com sucesso', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail, password: 'pass123'
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testEmail);
  });

  it('deve retornar 401 com senha errada', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail, password: 'wrongpass'
    });
    expect(res.status).toBe(401);
  });

  it('deve retornar 401 para e-mail não cadastrado', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nouser@test.com', password: 'pass'
    });
    expect(res.status).toBe(401);
  });

  it('deve retornar 400 sem campos obrigatórios', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: testEmail });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('deve retornar 401 sem token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('deve retornar dados do usuário autenticado', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testEmail, password: 'pass123'
    });
    const token = loginRes.body.token;
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
  });
});
