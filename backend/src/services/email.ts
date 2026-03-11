import nodemailer from 'nodemailer';

function createTransporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('[Email] SMTP not configured — skipping send to', to);
    return;
  }
  const from = `"${process.env.SMTP_FROM_NAME ?? 'TeamPulse'}" <${process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER}>`;
  await transporter.sendMail({ from, to, subject, html });
  console.log('[Email] Sent to', to, '—', subject);
}

export function buildRetroEmailHtml(params: {
  developerName: string;
  managerName: string;
  weekLabel: string;
  actions: { title: string; priority: string; dueDate: Date | null; category: string | null }[];
  pendingSurveys: { title: string; deadline: Date; category: string }[];
  appUrl: string;
}): string {
  const { developerName, managerName, weekLabel, actions, pendingSurveys, appUrl } = params;

  const priorityColor = (p: string) =>
    p === 'high' ? '#EF4444' : p === 'medium' ? '#F59E0B' : '#10B981';

  const actionRows = actions.length
    ? actions.map(a => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #1e2a3a;color:#e2e8f0;font-size:13px">${a.title}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #1e2a3a;text-align:center">
            <span style="background:${priorityColor(a.priority)}22;color:${priorityColor(a.priority)};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase">${a.priority}</span>
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #1e2a3a;color:#94a3b8;font-size:12px;text-align:center">${a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
        </tr>`).join('')
    : `<tr><td colspan="3" style="padding:16px;color:#64748b;text-align:center;font-size:13px">No open action items — great work! 🎉</td></tr>`;

  const surveyRows = pendingSurveys.length
    ? pendingSurveys.map(s => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #1e2a3a;color:#e2e8f0;font-size:13px">${s.title}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #1e2a3a;color:#94a3b8;font-size:12px;text-align:center">${new Date(s.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
        </tr>`).join('')
    : `<tr><td colspan="2" style="padding:16px;color:#64748b;text-align:center;font-size:13px">No pending surveys — all caught up! ✅</td></tr>`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#03060F;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0d1f3a,#121c33);border:1px solid rgba(139,92,246,0.3);border-radius:16px;padding:28px 32px;margin-bottom:20px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <div style="background:linear-gradient(135deg,#8B5CF6,#A78BFA);width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;color:white;font-size:13px">TP</div>
        <span style="color:white;font-weight:700;font-size:16px">TeamPulse</span>
      </div>
      <h1 style="margin:0 0 6px;color:white;font-size:20px;font-weight:700">Weekly Retrospective</h1>
      <p style="margin:0;color:#8B5CF6;font-size:13px">${weekLabel}</p>
    </div>

    <!-- Greeting -->
    <div style="background:#0a1628;border:1px solid #1e2a3a;border-radius:12px;padding:20px 24px;margin-bottom:20px">
      <p style="margin:0;color:#e2e8f0;font-size:15px">Hi <strong style="color:#A78BFA">${developerName}</strong>,</p>
      <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;line-height:1.6">Here is your weekly retrospective summary from <strong>${managerName}</strong>. Please review your open action items and complete any pending surveys before the next sprint.</p>
    </div>

    <!-- Action Items -->
    <div style="background:#0a1628;border:1px solid #1e2a3a;border-radius:12px;margin-bottom:20px;overflow:hidden">
      <div style="padding:16px 20px;border-bottom:1px solid #1e2a3a;display:flex;align-items:center;gap:8px">
        <span style="color:#8B5CF6;font-size:16px">⚡</span>
        <p style="margin:0;color:white;font-weight:600;font-size:14px">Open Action Items</p>
        <span style="margin-left:auto;background:rgba(139,92,246,0.15);color:#A78BFA;border:1px solid rgba(139,92,246,0.3);padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600">${actions.length} open</span>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#0d1826">
            <th style="padding:10px 14px;text-align:left;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Title</th>
            <th style="padding:10px 14px;text-align:center;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Priority</th>
            <th style="padding:10px 14px;text-align:center;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Due</th>
          </tr>
        </thead>
        <tbody>${actionRows}</tbody>
      </table>
    </div>

    <!-- Pending Surveys -->
    <div style="background:#0a1628;border:1px solid #1e2a3a;border-radius:12px;margin-bottom:20px;overflow:hidden">
      <div style="padding:16px 20px;border-bottom:1px solid #1e2a3a;display:flex;align-items:center;gap:8px">
        <span style="color:#06B6D4;font-size:16px">📋</span>
        <p style="margin:0;color:white;font-weight:600;font-size:14px">Pending Surveys</p>
        <span style="margin-left:auto;background:rgba(6,182,212,0.1);color:#06B6D4;border:1px solid rgba(6,182,212,0.25);padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600">${pendingSurveys.length} pending</span>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#0d1826">
            <th style="padding:10px 14px;text-align:left;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Survey</th>
            <th style="padding:10px 14px;text-align:center;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Deadline</th>
          </tr>
        </thead>
        <tbody>${surveyRows}</tbody>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:20px">
      <a href="${appUrl}/developer" style="display:inline-block;background:linear-gradient(135deg,#8B5CF6,#A78BFA);color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;box-shadow:0 0 20px rgba(139,92,246,0.4)">Open TeamPulse Dashboard →</a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:16px">
      <p style="margin:0;color:#334155;font-size:12px">Sent by <strong style="color:#475569">${managerName}</strong> via TeamPulse &nbsp;·&nbsp; <a href="${appUrl}" style="color:#475569;text-decoration:none">teampulse.app</a></p>
    </div>

  </div>
</body>
</html>`;
}
