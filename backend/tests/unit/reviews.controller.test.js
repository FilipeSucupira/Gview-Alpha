import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/lib/prisma.js', () => {
  const mockPrisma = {
    review: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  global.__prisma = mockPrisma;
  return {
    ...mockPrisma,
    default: mockPrisma,
  };
});

import prisma from '../../src/lib/prisma.js';
import { getReviewsByGame, createReview, updateReview, deleteReview } from '../../src/controllers/reviews.controller.js';

function makeMockRes() {
  const res = {
    _status: 200, _body: null,
    status(code) { this._status = code; return this; },
    json(body) { this._body = body; return this; },
    send() { return this; },
  };
  return res;
}

describe('getReviewsByGame', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar reviews de um jogo', async () => {
    const reviews = [{ id: '1', rating: 5, comment: 'Ótimo!' }];
    prisma.review.findMany.mockResolvedValue(reviews);
    const req = { params: { gameId: 'game-1' } };
    const res = makeMockRes();
    await getReviewsByGame(req, res);
    expect(res._body.data).toEqual(reviews);
    expect(res._body.total).toBe(1);
  });
});

describe('createReview', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 sem gameId', async () => {
    const req = { body: { rating: 5 }, user: { id: 'user-1' } };
    const res = makeMockRes();
    await createReview(req, res);
    expect(res._status).toBe(400);
  });

  it('deve retornar 400 para rating inválido', async () => {
    const req = { body: { gameId: 'g1', rating: 10 }, user: { id: 'user-1' } };
    const res = makeMockRes();
    await createReview(req, res);
    expect(res._status).toBe(400);
  });

  it('deve retornar 400 para rating < 1', async () => {
    const req = { body: { gameId: 'g1', rating: 0 }, user: { id: 'user-1' } };
    const res = makeMockRes();
    await createReview(req, res);
    expect(res._status).toBe(400);
  });

  it('deve criar review com sucesso', async () => {
    const review = { id: 'r1', rating: 4, gameId: 'g1', userId: 'user-1' };
    prisma.review.create.mockResolvedValue(review);
    const req = { body: { gameId: 'g1', rating: 4, comment: 'Bom' }, user: { id: 'user-1' } };
    const res = makeMockRes();
    await createReview(req, res);
    expect(res._status).toBe(201);
  });

  it('deve retornar 409 se já avaliou o jogo', async () => {
    prisma.review.create.mockRejectedValue({ code: 'P2002' });
    const req = { body: { gameId: 'g1', rating: 4 }, user: { id: 'user-1' } };
    const res = makeMockRes();
    await createReview(req, res);
    expect(res._status).toBe(409);
  });
});

describe('updateReview', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 404 se review não encontrada', async () => {
    prisma.review.findUnique.mockResolvedValue(null);
    const req = { params: { id: 'r1' }, body: { rating: 3 }, user: { id: 'user-1' } };
    const res = makeMockRes();
    await updateReview(req, res);
    expect(res._status).toBe(404);
  });

  it('deve retornar 403 se não é o dono', async () => {
    prisma.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'other-user' });
    const req = { params: { id: 'r1' }, body: { rating: 3 }, user: { id: 'user-1' } };
    const res = makeMockRes();
    await updateReview(req, res);
    expect(res._status).toBe(403);
  });
});

describe('deleteReview', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 403 se não é o dono', async () => {
    prisma.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'other' });
    const req = { params: { id: 'r1' }, user: { id: 'user-1' } };
    const res = makeMockRes();
    await deleteReview(req, res);
    expect(res._status).toBe(403);
  });

  it('deve deletar com sucesso', async () => {
    prisma.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'user-1' });
    prisma.review.delete.mockResolvedValue({});
    const req = { params: { id: 'r1' }, user: { id: 'user-1' } };
    const res = makeMockRes();
    await deleteReview(req, res);
    expect(res._status).toBe(204);
  });
});
