import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/lib/prisma.js', () => {
  const mockPrisma = {
    submission: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    game: {
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
import { listSubmissions, getSubmission, createSubmission, updateSubmissionStatus, deleteSubmission } from '../../src/controllers/submissions.controller.js';

function makeMockRes() {
  const res = {
    _status: 200, _body: null,
    status(code) { this._status = code; return this; },
    json(body) { this._body = body; return this; },
    send() { return this; },
  };
  return res;
}

describe('createSubmission', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 sem campos obrigatórios', async () => {
    const req = { body: { gameTitle: 'Test' } };
    const res = makeMockRes();
    await createSubmission(req, res);
    expect(res._status).toBe(400);
  });

  it('deve criar submissão com sucesso', async () => {
    const sub = { id: 's1', gameTitle: 'Test', contactEmail: 'a@b.com', reviewStatus: 'PENDING' };
    prisma.submission.create.mockResolvedValue(sub);
    const req = { body: { gameTitle: 'Test', description: 'Desc', contactEmail: 'a@b.com' } };
    const res = makeMockRes();
    await createSubmission(req, res);
    expect(res._status).toBe(201);
    expect(res._body.data).toMatchObject(sub);
  });
});

describe('updateSubmissionStatus', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 para status inválido', async () => {
    const req = { params: { id: 's1' }, body: { status: 'INVALID' } };
    const res = makeMockRes();
    await updateSubmissionStatus(req, res);
    expect(res._status).toBe(400);
  });

  it('deve atualizar status para APPROVED', async () => {
    const sub = { id: 's1', gameTitle: 'Test', description: 'Desc', reviewStatus: 'PENDING' };
    prisma.submission.findUnique.mockResolvedValue(sub);
    prisma.submission.update.mockResolvedValue({ ...sub, reviewStatus: 'APPROVED' });
    prisma.game.create.mockResolvedValue({});
    const req = { params: { id: 's1' }, body: { status: 'APPROVED' } };
    const res = makeMockRes();
    await updateSubmissionStatus(req, res);
    expect(res._body.reviewStatus).toBe('APPROVED');
  });

  it('deve retornar 404 se não encontrada', async () => {
    prisma.submission.findUnique.mockResolvedValue(null);
    const req = { params: { id: 'none' }, body: { status: 'APPROVED' } };
    const res = makeMockRes();
    await updateSubmissionStatus(req, res);
    expect(res._status).toBe(404);
  });
});

describe('deleteSubmission', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve deletar com sucesso', async () => {
    prisma.submission.delete.mockResolvedValue({});
    const req = { params: { id: 's1' } };
    const res = makeMockRes();
    await deleteSubmission(req, res);
    expect(res._status).toBe(204);
  });
});
