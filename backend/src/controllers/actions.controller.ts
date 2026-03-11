import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

export async function getActions(req: Request, res: Response): Promise<void> {
  const actions = await prisma.actionItem.findMany({
    orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
    include: { assignee: { select: { name: true, avatar: true } } },
  });
  res.json({ actions });
}

const updateSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
});

export async function updateAction(req: Request, res: Response): Promise<void> {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const action = await prisma.actionItem.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  res.json({ action });
}
