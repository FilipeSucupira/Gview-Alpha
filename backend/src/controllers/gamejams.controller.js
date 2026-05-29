const prisma = require('../lib/prisma');

async function listGameJams(req, res) {
  try {
    const gameJams = await prisma.gameJam.findMany({
      include: {
        creator: { select: { name: true, email: true } },
        entries: { include: { game: true, developer: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(gameJams);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar Game Jams.' });
  }
}

async function getGameJam(req, res) {
  try {
    const gameJam = await prisma.gameJam.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { name: true, email: true } },
        entries: { include: { game: true, developer: { select: { name: true } } } },
      },
    });
    if (!gameJam) return res.status(404).json({ error: 'Game Jam não encontrada.' });
    res.json(gameJam);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar Game Jam.' });
  }
}

async function createGameJam(req, res) {
  const { title, description, theme, startDate, endDate, status, creatorId } = req.body;
  if (!title || !description || !startDate || !endDate || !creatorId) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }
  try {
    const gameJam = await prisma.gameJam.create({
      data: { title, description, theme, startDate: new Date(startDate), endDate: new Date(endDate), status: status || 'UPCOMING', creatorId },
    });
    res.status(201).json(gameJam);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar Game Jam.', detail: err.message });
  }
}

async function updateGameJam(req, res) {
  const { title, description, theme, startDate, endDate, status } = req.body;
  try {
    const gameJam = await prisma.gameJam.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(theme !== undefined && { theme }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status }),
      },
    });
    res.json(gameJam);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Game Jam não encontrada.' });
    res.status(500).json({ error: 'Erro ao atualizar Game Jam.', detail: err.message });
  }
}

async function deleteGameJam(req, res) {
  try {
    await prisma.gameJam.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Game Jam não encontrada.' });
    res.status(500).json({ error: 'Erro ao deletar Game Jam.', detail: err.message });
  }
}

async function joinGameJam(req, res) {
  const { gameId } = req.body;
  const jamId = req.params.id;
  if (!gameId) return res.status(400).json({ error: 'gameId é obrigatório.' });
  try {
    const entry = await prisma.gameJamEntry.create({
      data: { jamId, gameId, developerId: req.user.id },
    });
    res.status(201).json(entry);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Este jogo já está inscrito nesta Game Jam.' });
    res.status(500).json({ error: 'Erro ao inscrever na Game Jam.' });
  }
}

module.exports = { listGameJams, getGameJam, createGameJam, updateGameJam, deleteGameJam, joinGameJam };
