import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/lib/prisma.js', () => {
  const mockPrisma = {
    gameJam: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    gameJamEntry: {
      create: vi.fn(),
    },
  };
  global.__prisma = mockPrisma;
  return {
    ...mockPrisma,
    default: mockPrisma,
  };
});

import prisma from '../../src/lib/prisma.js';
import { listGameJams, getGameJam, createGameJam, updateGameJam, deleteGameJam, joinGameJam } from '../../src/controllers/gamejams.controller.js';

function makeMockRes() {
  const res = {
    _status: 200, _body: null,
    status(code) { this._status = code; return this; },
    json(body) { this._body = body; return this; },
    send() { return this; },
  };
  return res;
}

describe('listGameJams', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar lista de game jams', async () => {
    const jams = [{ id: 'j1', title: 'Jam 1' }];
    prisma.gameJam.findMany.mockResolvedValue(jams);
    const req = {};
    const res = makeMockRes();
    await listGameJams(req, res);
    expect(res._body).toEqual(jams);
  });
});

describe('createGameJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 sem campos obrigatórios', async () => {
    const req = { body: { title: 'Test' } };
    const res = makeMockRes();
    await createGameJam(req, res);
    expect(res._status).toBe(400);
  });

  it('deve criar jam com sucesso', async () => {
    const jam = { id: 'j1', title: 'Jam 2025' };
    prisma.gameJam.create.mockResolvedValue(jam);
    const req = { body: { title: 'Jam 2025', description: 'Desc', startDate: '2025-01-01', endDate: '2025-01-03', creatorId: 'u1' } };
    const res = makeMockRes();
    await createGameJam(req, res);
    expect(res._status).toBe(201);
  });
});

describe('updateGameJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 404 se não encontrada', async () => {
    prisma.gameJam.update.mockRejectedValue({ code: 'P2025' });
    const req = { params: { id: 'j1' }, body: { title: 'Novo' } };
    const res = makeMockRes();
    await updateGameJam(req, res);
    expect(res._status).toBe(404);
  });
});

describe('deleteGameJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve deletar jam com sucesso', async () => {
    prisma.gameJam.delete.mockResolvedValue({});
    const req = { params: { id: 'j1' } };
    const res = makeMockRes();
    await deleteGameJam(req, res);
    expect(res._status).toBe(204);
  });
});

describe('joinGameJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 sem gameId', async () => {
    const req = { params: { id: 'j1' }, body: {}, user: { id: 'u1' } };
    const res = makeMockRes();
    await joinGameJam(req, res);
    expect(res._status).toBe(400);
  });

  it('deve retornar 409 se já inscrito', async () => {
    prisma.gameJamEntry.create.mockRejectedValue({ code: 'P2002' });
    const req = { params: { id: 'j1' }, body: { gameId: 'g1' }, user: { id: 'u1' } };
    const res = makeMockRes();
    await joinGameJam(req, res);
    expect(res._status).toBe(409);
  });
});
