const prisma = require('../lib/prisma');

async function listUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
}

async function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['ADMIN', 'PLAYER', 'DEVELOPER'].includes(role)) {
    return res.status(400).json({ error: 'Role inválido. Deve ser ADMIN, PLAYER ou DEVELOPER.' });
  }

  // Prevenir que um administrador tire seu próprio admin
  if (req.user.id === id && role !== 'ADMIN') {
    return res.status(403).json({ error: 'Você não pode remover o cargo de administrador de si mesmo.' });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.status(500).json({ error: 'Erro ao atualizar o cargo do usuário' });
  }
}

module.exports = { listUsers, updateUserRole };
