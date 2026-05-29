const prisma = require('../lib/prisma');

async function getWishlist(req, res) {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.params.userId },
      include: { game: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: wishlist, total: wishlist.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao buscar wishlist' });
  }
}

async function addToWishlist(req, res) {
  const { gameId } = req.body;
  if (!gameId) return res.status(400).json({ error: 'gameId é obrigatório' });
  try {
    const entry = await prisma.wishlist.create({
      data: { userId: req.user.id, gameId },
      include: { game: true },
    });
    res.status(201).json(entry);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Jogo já está na sua wishlist' });
    if (err.code === 'P2003') return res.status(404).json({ error: 'Jogo não encontrado' });
    res.status(500).json({ error: 'Erro interno ao adicionar à wishlist' });
  }
}

async function removeFromWishlist(req, res) {
  try {
    await prisma.wishlist.delete({
      where: { userId_gameId: { userId: req.user.id, gameId: req.params.gameId } },
    });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Jogo não encontrado na sua wishlist' });
    res.status(500).json({ error: 'Erro interno ao remover da wishlist' });
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
