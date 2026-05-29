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
    expect(res._body).toEqual([{ id: 'j1', title: 'Jam 1', status: 'ACTIVE' }]);
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

  it('deve retornar 404 se game jam nao existir', async () => {
    prisma.gameJam.findUnique.mockResolvedValue(null);
    const req = { params: { id: 'j1' }, body: { gameId: 'g1' }, user: { id: 'u1' } };
    const res = makeMockRes();
    await joinGameJam(req, res);
    expect(res._status).toBe(404);
    expect(res._body.error).toBe('Game Jam não encontrada.');
  });

  it('deve retornar 400 se a game jam ainda nao comecou', async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    prisma.gameJam.findUnique.mockResolvedValue({ id: 'j1', startDate: tomorrow, endDate: nextWeek });

    const req = { params: { id: 'j1' }, body: { gameId: 'g1' }, user: { id: 'u1' } };
    const res = makeMockRes();
    await joinGameJam(req, res);
    expect(res._status).toBe(400);
    expect(res._body.error).toBe('A Game Jam ainda não começou.');
  });

  it('deve retornar 400 se a game jam ja terminou', async () => {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    prisma.gameJam.findUnique.mockResolvedValue({ id: 'j1', startDate: lastWeek, endDate: yesterday });

    const req = { params: { id: 'j1' }, body: { gameId: 'g1' }, user: { id: 'u1' } };
    const res = makeMockRes();
    await joinGameJam(req, res);
    expect(res._status).toBe(400);
    expect(res._body.error).toBe('A Game Jam já terminou.');
  });

  it('deve retornar 409 se ja inscrito', async () => {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    prisma.gameJam.findUnique.mockResolvedValue({ id: 'j1', startDate: lastWeek, endDate: nextWeek });
    prisma.gameJamEntry.create.mockRejectedValue({ code: 'P2002' });

    const req = { params: { id: 'j1' }, body: { gameId: 'g1' }, user: { id: 'u1' } };
    const res = makeMockRes();
    await joinGameJam(req, res);
    expect(res._status).toBe(409);
  });

  it('deve se inscrever na game jam com sucesso no prazo correto', async () => {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const entry = { id: 'e1', jamId: 'j1', gameId: 'g1', developerId: 'u1' };

    prisma.gameJam.findUnique.mockResolvedValue({ id: 'j1', startDate: lastWeek, endDate: nextWeek });
    prisma.gameJamEntry.create.mockResolvedValue(entry);

    const req = { params: { id: 'j1' }, body: { gameId: 'g1' }, user: { id: 'u1' } };
    const res = makeMockRes();
    await joinGameJam(req, res);
    expect(res._status).toBe(201);
    expect(res._body).toEqual(entry);
  });
});
