const prisma = require('../lib/prisma');

async function listCollections(req, res) {
  try {
    const userId = req.params.userId || req.user.id;
    const where = req.params.userId
      ? { userId, isPublic: true }
      : { userId: req.user.id };
    const collections = await prisma.collection.findMany({
      where,
      include: { items: { include: { game: { select: { id: true, title: true, coverUrl: true, slug: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: collections, total: collections.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar coleções.' });
  }
}

async function getCollection(req, res) {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true } },
        items: { include: { game: true } },
      },
    });
    if (!collection) return res.status(404).json({ error: 'Coleção não encontrada.' });
    if (!collection.isPublic && collection.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Coleção privada.' });
    }
    res.json(collection);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar coleção.' });
  }
}

async function createCollection(req, res) {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome da coleção é obrigatório.' });
  try {
    const collection = await prisma.collection.create({
      data: { userId: req.user.id, name, description: description || null, isPublic: false },
    });
    res.status(201).json(collection);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar coleção.' });
  }
}

async function updateCollection(req, res) {
  const { name, description } = req.body;
  try {
    const existing = await prisma.collection.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Coleção não encontrada.' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Você só pode editar suas próprias coleções.' });
    const collection = await prisma.collection.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        isPublic: false,
      },
    });
    res.json(collection);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar coleção.' });
  }
}

async function deleteCollection(req, res) {
  try {
    const existing = await prisma.collection.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Coleção não encontrada.' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Você só pode deletar suas próprias coleções.' });
    await prisma.collection.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar coleção.' });
  }
}

async function addGameToCollection(req, res) {
  const { gameId } = req.body;
  if (!gameId) return res.status(400).json({ error: 'gameId é obrigatório.' });
  try {
    const existing = await prisma.collection.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Coleção não encontrada.' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Acesso negado.' });
    const item = await prisma.collectionItem.create({ data: { collectionId: req.params.id, gameId } });
    res.status(201).json(item);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Jogo já está nesta coleção.' });
    if (err.code === 'P2003') return res.status(404).json({ error: 'Jogo não encontrado.' });
    res.status(500).json({ error: 'Erro ao adicionar jogo à coleção.' });
  }
}

async function removeGameFromCollection(req, res) {
  try {
    const existing = await prisma.collection.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Coleção não encontrada.' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Acesso negado.' });
    await prisma.collectionItem.delete({
      where: { collectionId_gameId: { collectionId: req.params.id, gameId: req.params.gameId } },
    });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Jogo não está nesta coleção.' });
    res.status(500).json({ error: 'Erro ao remover jogo da coleção.' });
  }
}

module.exports = { listCollections, getCollection, createCollection, updateCollection, deleteCollection, addGameToCollection, removeGameFromCollection };
