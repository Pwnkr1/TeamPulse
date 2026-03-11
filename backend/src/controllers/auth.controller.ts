import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  team: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function signToken(userId: string, role: string, email: string): string {
  return jwt.sign(
    { userId, role, email },
    process.env.JWT_SECRET ?? 'secret',
    { expiresIn: '30d' }
  );
}

// Registration now creates a RegistrationRequest (pending manager approval)
export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { name, email, password, team } = parsed.data;

  // Check if already a real user
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  // Check if there's already a pending/rejected request
  const existingReq = await prisma.registrationRequest.findUnique({ where: { email } });
  if (existingReq) {
    if (existingReq.status === 'pending') {
      res.status(409).json({ error: 'A registration request for this email is already pending approval.' });
      return;
    }
    if (existingReq.status === 'rejected') {
      res.status(403).json({ error: 'Your previous registration request was denied. Please contact your manager.' });
      return;
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.registrationRequest.create({
    data: { name, email, passwordHash, role: 'developer', team },
  });

  res.status(201).json({
    status: 'pending',
    message: 'Registration request submitted. Awaiting manager approval.',
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Check if they have a registration request
    const regReq = await prisma.registrationRequest.findUnique({ where: { email } });
    if (regReq?.status === 'pending') {
      res.status(403).json({ error: 'pending', message: 'Your account is pending manager approval.' });
      return;
    }
    if (regReq?.status === 'rejected') {
      res.status(403).json({ error: 'rejected', message: 'Your account request was denied by the manager.' });
      return;
    }
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signToken(user.id, user.role, user.email);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, name: true, email: true, role: true, avatar: true, team: true },
  });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
}
