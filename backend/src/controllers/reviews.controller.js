const prisma = require('../lib/prisma');

async function getReviewsByGame(req, res) {
  try {
    const reviews = await prisma.review.findMany({
      where: { gameId: req.params.gameId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: reviews, total: reviews.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao buscar reviews' });
  }
}

async function createReview(req, res) {
  const { gameId, rating, comment } = req.body;
  if (!gameId || !rating) return res.status(400).json({ error: 'gameId e rating são obrigatórios' });
  const ratingNum = parseInt(rating, 10);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'Rating deve ser um número entre 1 e 5' });
  }
  try {
    const review = await prisma.review.create({
      data: { userId: req.user.id, gameId, rating: ratingNum, comment: comment || null },
      include: { user: { select: { id: true, name: true } } },
    });
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Você já avaliou este jogo' });
    if (err.code === 'P2003') return res.status(404).json({ error: 'Jogo não encontrado' });
    res.status(500).json({ error: 'Erro interno ao criar review' });
  }
}

async function updateReview(req, res) {
  const { rating, comment } = req.body;
  try {
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Review não encontrada' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Você só pode editar suas próprias reviews' });
    const data = {};
    if (rating !== undefined) {
      const ratingNum = parseInt(rating, 10);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ error: 'Rating deve ser um número entre 1 e 5' });
      }
      data.rating = ratingNum;
    }
    if (comment !== undefined) data.comment = comment;
    const review = await prisma.review.update({
      where: { id: req.params.id }, data,
      include: { user: { select: { id: true, name: true } } },
    });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao atualizar review' });
  }
}

async function deleteReview(req, res) {
  try {
    const existing = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Review não encontrada' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Você só pode deletar suas próprias reviews' });
    await prisma.review.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao deletar review' });
  }
}

async function getReviewsByUser(req, res) {
  try {
    const userId = req.params.userId || req.user?.id;
    if (!userId) return res.status(400).json({ error: 'userId é obrigatório' });
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: { game: { select: { id: true, title: true, coverUrl: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: reviews, total: reviews.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao buscar reviews do usuário' });
  }
}

module.exports = { getReviewsByGame, createReview, updateReview, deleteReview, getReviewsByUser };
