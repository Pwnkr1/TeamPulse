import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { sendWeeklyRetroEmails } from '../services/scheduler';

export async function getInbox(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const messages = await prisma.inboxMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  const unreadCount = messages.filter((m) => !m.isRead).length;
  res.json({ messages, unreadCount });
}

export async function getMessage(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const msg = await prisma.inboxMessage.findFirst({
    where: { id: req.params.id, userId },
  });
  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }
  // Auto-mark as read
  if (!msg.isRead) {
    await prisma.inboxMessage.update({ where: { id: msg.id }, data: { isRead: true } });
  }
  res.json({ message: { ...msg, isRead: true } });
}

export async function markRead(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const msg = await prisma.inboxMessage.findFirst({
    where: { id: req.params.id, userId },
  });
  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }
  await prisma.inboxMessage.update({ where: { id: msg.id }, data: { isRead: true } });
  res.json({ ok: true });
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  await prisma.inboxMessage.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  res.json({ ok: true });
}

// Dev/test endpoint: trigger the weekly email job manually
export async function triggerRetroEmails(_req: Request, res: Response): Promise<void> {
  const result = await sendWeeklyRetroEmails();
  res.json({ ok: true, ...result });
}
