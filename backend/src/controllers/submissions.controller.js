const prisma = require('../lib/prisma');

async function listSubmissions(req, res) {
  try {
    const submissions = await prisma.submission.findMany({
      where: {
        reviewStatus: {
          not: 'APPROVED'
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ data: submissions, total: submissions.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao buscar submissões' });
  }
}

async function getSubmission(req, res) {
  try {
    const submission = await prisma.submission.findUnique({ where: { id: req.params.id } });
    if (!submission) return res.status(404).json({ error: 'Submissão não encontrada' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar submissão' });
  }
}

async function createSubmission(req, res) {
  const { gameTitle, projectUrl, description, launchPlans, targetPlatforms, launchDateRange, demoLink, nextFestParticipation, heardAbout, additionalInfo, contactRole, contactEmail, studioName, attachmentUrl } = req.body;
  if (!gameTitle || !description || !contactEmail) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes: gameTitle, description, contactEmail' });
  }
  try {
    const submission = await prisma.submission.create({
      data: { gameTitle, projectUrl: projectUrl || null, description, launchPlans: launchPlans || null, targetPlatforms: targetPlatforms || null, launchDateRange: launchDateRange || null, demoLink: demoLink || null, nextFestParticipation: nextFestParticipation || false, heardAbout: heardAbout || null, additionalInfo: additionalInfo || null, contactRole: contactRole || null, contactEmail, studioName: studioName || null, attachmentUrl: attachmentUrl || null },
    });
    res.status(201).json({ message: 'Submissão recebida com sucesso!', data: submission });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao criar submissão' });
  }
}

async function updateSubmissionStatus(req, res) {
  const { status } = req.body;
  if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
    return res.status(400).json({ error: 'Status deve ser APPROVED, REJECTED ou PENDING' });
  }
  try {
    const existingSubmission = await prisma.submission.findUnique({ where: { id: req.params.id } });
    if (!existingSubmission) return res.status(404).json({ error: 'Submissão não encontrada' });

    const submission = await prisma.submission.update({ where: { id: req.params.id }, data: { reviewStatus: status } });

    // Transform into a Game/Demo if APPROVED
    if (status === 'APPROVED' && existingSubmission.reviewStatus !== 'APPROVED') {
      const baseSlug = submission.gameTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      await prisma.game.create({
        data: {
          title: submission.gameTitle,
          slug,
          shortDescription: submission.description.substring(0, 150) || 'Sem descrição curta.',
          fullDescription: submission.description,
          coverUrl: submission.attachmentUrl || null,
          demoUrl: submission.demoLink || submission.projectUrl || null,
          studioName: submission.studioName || null,
          launchWindow: submission.launchDateRange || null,
          status: 'AVAILABLE'
        }
      });
    }

    res.json(submission);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Submissão não encontrada' });
    res.status(500).json({ error: 'Erro interno ao atualizar status' });
  }
}

async function updateSubmission(req, res) {
  const { gameTitle, description, contactEmail, studioName, reviewStatus } = req.body;
  try {
    const data = {};
    if (gameTitle) data.gameTitle = gameTitle;
    if (description) data.description = description;
    if (contactEmail) data.contactEmail = contactEmail;
    if (studioName !== undefined) data.studioName = studioName;
    if (reviewStatus) data.reviewStatus = reviewStatus;
    const submission = await prisma.submission.update({ where: { id: req.params.id }, data });
    res.json(submission);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Submissão não encontrada' });
    res.status(500).json({ error: 'Erro ao atualizar submissão' });
  }
}

async function deleteSubmission(req, res) {
  try {
    await prisma.submission.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Submissão não encontrada' });
    res.status(500).json({ error: 'Erro interno ao deletar submissão' });
  }
}

module.exports = { listSubmissions, getSubmission, createSubmission, updateSubmissionStatus, updateSubmission, deleteSubmission };
