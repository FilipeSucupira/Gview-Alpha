const prisma = require('../lib/prisma');

const mockGames = [
  { id: '1', title: "Devil's Drizzle", slug: 'devils-drizzle', shortDescription: 'Plataformer 2D dark cute.', coverUrl: 'https://picsum.photos/seed/devils/300/400', status: 'FEATURED', genre: 'Plataformer 2D', studioName: 'Rainy Studio', demoUrl: 'https://example.com/demos/devils-drizzle' },
  { id: '2', title: 'Alien Strike', slug: 'alien-strike', shortDescription: 'Shooter retrô synthwave.', coverUrl: 'https://picsum.photos/seed/alien/300/400', status: 'FEATURED', genre: 'Shooter', studioName: 'NeonByte Games', demoUrl: 'https://example.com/demos/alien-strike' },
  { id: '3', title: 'Sunny Trails', slug: 'sunny-trails', shortDescription: 'Aventura tropical colorida.', coverUrl: 'https://picsum.photos/seed/sunny/300/400', status: 'AVAILABLE', genre: 'Aventura', studioName: 'Tropik Dev', demoUrl: 'https://example.com/demos/sunny-trails' },
  { id: '4', title: 'Alabaster Dawn', slug: 'alabaster-dawn', shortDescription: 'RPG aquarela profundo.', coverUrl: 'https://picsum.photos/seed/alabaster/300/400', status: 'COMING_SOON', genre: 'RPG', studioName: 'Chalk & Ember' },
  { id: '5', title: 'Scavland', slug: 'scavland', shortDescription: 'Horror atmosférico.', coverUrl: 'https://picsum.photos/seed/scavland/300/400', status: 'COMING_SOON', genre: 'Horror', studioName: 'DarkCell Studio' },
];

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function listGames(req, res) {
  const { status } = req.query;
  try {
    const where = status ? { status } : {};
    const games = await prisma.game.findMany({ where, orderBy: { createdAt: 'desc' } });
    if (games.length === 0) {
      const fallback = status ? mockGames.filter(g => g.status === status) : mockGames;
      return res.json({ data: fallback, total: fallback.length, source: 'mock' });
    }
    res.json({ data: games, total: games.length });
  } catch (err) {
    console.error('Erro ao buscar jogos:', err.message);
    const fallback = status ? mockGames.filter(g => g.status === status) : mockGames;
    res.json({ data: fallback, total: fallback.length, source: 'mock' });
  }
}

async function getGameBySlug(req, res) {
  try {
    const game = await prisma.game.findUnique({ where: { slug: req.params.slug } });
    if (!game) {
      const mock = mockGames.find(g => g.slug === req.params.slug);
      if (!mock) return res.status(404).json({ error: 'Jogo não encontrado' });
      return res.json({ ...mock, source: 'mock' });
    }
    res.json(game);
  } catch (err) {
    const mock = mockGames.find(g => g.slug === req.params.slug);
    if (!mock) return res.status(404).json({ error: 'Jogo não encontrado' });
    res.json({ ...mock, source: 'mock' });
  }
}

async function getGameById(req, res) {
  try {
    const game = await prisma.game.findUnique({ where: { id: req.params.id } });
    if (!game) return res.status(404).json({ error: 'Jogo não encontrado' });
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar jogo' });
  }
}

async function createGame(req, res) {
  const { title, shortDescription, fullDescription, coverUrl, trailerUrl, demoUrl, status, genre, studioName, launchWindow } = req.body;
  if (!title || !shortDescription) {
    return res.status(400).json({ error: 'Título e descrição curta são obrigatórios' });
  }
  try {
    const slug = generateSlug(title);
    const game = await prisma.game.create({
      data: { title, slug, shortDescription, fullDescription: fullDescription || null, coverUrl: coverUrl || null, trailerUrl: trailerUrl || null, demoUrl: demoUrl || null, status: status || 'AVAILABLE', genre: genre || null, studioName: studioName || null, launchWindow: launchWindow || null },
    });
    res.status(201).json(game);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Já existe um jogo com esse título' });
    res.status(500).json({ error: 'Erro interno ao criar jogo' });
  }
}

async function updateGame(req, res) {
  const { title, shortDescription, fullDescription, coverUrl, trailerUrl, demoUrl, status, genre, studioName, launchWindow } = req.body;
  try {
    const data = {};
    if (title) { data.title = title; data.slug = generateSlug(title); }
    if (shortDescription !== undefined) data.shortDescription = shortDescription;
    if (fullDescription !== undefined) data.fullDescription = fullDescription;
    if (coverUrl !== undefined) data.coverUrl = coverUrl;
    if (trailerUrl !== undefined) data.trailerUrl = trailerUrl;
    if (demoUrl !== undefined) data.demoUrl = demoUrl;
    if (status !== undefined) data.status = status;
    if (genre !== undefined) data.genre = genre;
    if (studioName !== undefined) data.studioName = studioName;
    if (launchWindow !== undefined) data.launchWindow = launchWindow;
    const game = await prisma.game.update({ where: { id: req.params.id }, data });
    res.json(game);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Jogo não encontrado' });
    if (err.code === 'P2002') return res.status(409).json({ error: 'Já existe um jogo com esse título' });
    res.status(500).json({ error: 'Erro interno ao atualizar jogo' });
  }
}

async function deleteGame(req, res) {
  try {
    await prisma.game.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Jogo não encontrado' });
    res.status(500).json({ error: 'Erro interno ao deletar jogo' });
  }
}

module.exports = { listGames, getGameBySlug, getGameById, createGame, updateGame, deleteGame, generateSlug };
