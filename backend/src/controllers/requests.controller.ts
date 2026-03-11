import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { sendEmail } from '../services/email';

export async function listRequests(_req: Request, res: Response): Promise<void> {
  const requests = await prisma.registrationRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json({ requests });
}

export async function approveRequest(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const regReq = await prisma.registrationRequest.findUnique({ where: { id } });
  if (!regReq) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  if (regReq.status !== 'pending') {
    res.status(409).json({ error: 'Request already reviewed' });
    return;
  }

  const avatar = regReq.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  // Create the actual user
  const user = await prisma.user.create({
    data: {
      name: regReq.name,
      email: regReq.email,
      passwordHash: regReq.passwordHash,
      role: regReq.role,
      team: regReq.team,
      avatar,
      status: 'active',
    },
  });

  // Mark request approved
  await prisma.registrationRequest.update({
    where: { id },
    data: { status: 'approved' },
  });

  // Send welcome inbox message
  await prisma.inboxMessage.create({
    data: {
      userId: user.id,
      subject: 'Welcome to TeamPulse — Account Approved',
      body: buildApprovalEmailHtml(user.name),
      fromName: 'TeamPulse',
      fromEmail: process.env.SMTP_FROM_EMAIL ?? 'noreply@teampulse.dev',
      type: 'approval',
    },
  });

  // Send email notification
  await sendEmail(
    user.email,
    'TeamPulse — Your Account Has Been Approved',
    buildApprovalEmailHtml(user.name)
  ).catch(() => {});

  res.json({ message: 'Request approved. User account created.', userId: user.id });
}

export async function rejectRequest(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { note } = req.body as { note?: string };

  const regReq = await prisma.registrationRequest.findUnique({ where: { id } });
  if (!regReq) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  if (regReq.status !== 'pending') {
    res.status(409).json({ error: 'Request already reviewed' });
    return;
  }

  await prisma.registrationRequest.update({
    where: { id },
    data: { status: 'rejected', reviewNote: note ?? null },
  });

  // Send rejection email if SMTP configured
  await sendEmail(
    regReq.email,
    'TeamPulse — Account Request Update',
    buildRejectionEmailHtml(regReq.name, note)
  ).catch(() => {});

  res.json({ message: 'Request rejected.' });
}

function buildApprovalEmailHtml(name: string): string {
  const appUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
  return `
<!DOCTYPE html><html><body style="background:#03060F;font-family:-apple-system,sans-serif;padding:32px">
<div style="max-width:480px;margin:0 auto;background:#0a1628;border:1px solid rgba(16,185,129,0.3);border-radius:16px;padding:32px">
  <div style="text-align:center;margin-bottom:24px">
    <div style="width:56px;height:56px;background:rgba(16,185,129,0.15);border:2px solid #10B981;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:24px">✅</div>
  </div>
  <h2 style="color:white;text-align:center;margin:0 0 8px">Account Approved!</h2>
  <p style="color:#94a3b8;text-align:center;font-size:14px;margin:0 0 24px">Hi <strong style="color:#34D399">${name}</strong>, your TeamPulse account has been approved by your manager.</p>
  <div style="text-align:center">
    <a href="${appUrl}/login" style="background:linear-gradient(135deg,#10B981,#34D399);color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">Sign In to TeamPulse →</a>
  </div>
</div>
</body></html>`;
}

function buildRejectionEmailHtml(name: string, note?: string): string {
  return `
<!DOCTYPE html><html><body style="background:#03060F;font-family:-apple-system,sans-serif;padding:32px">
<div style="max-width:480px;margin:0 auto;background:#0a1628;border:1px solid rgba(239,68,68,0.3);border-radius:16px;padding:32px">
  <h2 style="color:white;text-align:center;margin:0 0 12px">Account Request Update</h2>
  <p style="color:#94a3b8;font-size:14px">Hi <strong style="color:#e2e8f0">${name}</strong>, unfortunately your TeamPulse account request has not been approved at this time.</p>
  ${note ? `<p style="color:#94a3b8;font-size:14px">Note from manager: <em style="color:#cbd5e1">${note}</em></p>` : ''}
  <p style="color:#64748b;font-size:13px">Please contact your manager for more information.</p>
</div>
</body></html>`;
}
