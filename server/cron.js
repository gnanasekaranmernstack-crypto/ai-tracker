const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Tool = require('./models/Tool');
const User = require('./models/User');

const smtpConfig = {
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN || process.env.BREVO_SENDER_EMAIL,
    pass: process.env.BREVO_SMTP_KEY || process.env.BREVO_API_KEY,
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

const formatDateTime = (value) =>
  new Date(value).toLocaleString('en-US', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const buildStatusCard = ({ label, value, tone }) => `
  <td style="padding:6px;" valign="top">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${tone.border}; background:${tone.background}; border-radius:14px;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0 0 8px; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:${tone.label};">${label}</p>
          <p style="margin:0; font-size:16px; font-weight:700; color:#e5eefc; line-height:1.5;">${value}</p>
        </td>
      </tr>
    </table>
  </td>
`;

const buildAlertEmail = ({ user, tool, emailsArr, subject, intro, statusLabel, statusValue, accent }) => {
  const tones = {
    amber: { background: '#22170a', border: '#5c3b0b', label: '#fbbf24' },
    emerald: { background: '#0b1d16', border: '#14532d', label: '#34d399' },
    rose: { background: '#240b12', border: '#6b1128', label: '#fb7185' },
  };

  const tone = tones[accent] || tones.amber;

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f172a; padding:24px; font-family:Arial,sans-serif; color:#e2e8f0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px; background:#111827; border:1px solid #1f2937; border-radius:20px; overflow:hidden;">
            <tr>
              <td style="padding:24px 28px; background:linear-gradient(135deg, #312e81, #0f766e);">
                <p style="margin:0; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#cbd5e1;">AI Tool Tracker</p>
                <h2 style="margin:10px 0 0; font-size:28px; color:#ffffff;">${subject}</h2>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 16px; font-size:16px;">Hello ${user.name},</p>
                <p style="margin:0 0 24px; line-height:1.7; color:#cbd5e1;">${intro}</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                  <tr>
                    ${buildStatusCard({ label: 'Tool Name', value: tool.toolName, tone })}
                  </tr>
                  <tr>
                    ${buildStatusCard({ label: statusLabel, value: statusValue, tone })}
                  </tr>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #243042; border-radius:16px; background:#0b1220;">
                  <tr>
                    <td style="padding:20px;">
                      <p style="margin:0 0 12px; font-size:14px; font-weight:700; color:#ffffff;">Linked Email IDs</p>
                      <p style="margin:0 0 16px; line-height:1.7; color:#cbd5e1; word-break:break-word;">${emailsArr || 'No linked email IDs added yet.'}</p>
                      <p style="margin:0 0 6px; font-size:13px; color:#94a3b8;">Limit start date: ${formatDateTime(tool.startDate)}</p>
                      <p style="margin:0 0 6px; font-size:13px; color:#94a3b8;">Limit end date: ${formatDateTime(tool.endDate)}</p>
                      <p style="margin:0; font-size:13px; color:#94a3b8;">Renewal date: ${formatDateTime(tool.renewalDate)}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!smtpConfig.auth.user || !smtpConfig.auth.pass || !process.env.BREVO_SENDER_EMAIL) {
      console.error('Brevo SMTP is not configured. Set BREVO_SMTP_LOGIN, BREVO_SMTP_KEY, and BREVO_SENDER_EMAIL.');
      return false;
    }

    await transporter.sendMail({
      from: `"AI Tool Tracker" <${process.env.BREVO_SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to} - Subject: ${subject}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
    if (String(error.message || '').includes('535')) {
      console.error('Brevo SMTP authentication failed. Use BREVO_SMTP_LOGIN and BREVO_SMTP_KEY instead of the REST API key.');
    }
    return false;
  }
};

const processToolAlert = async ({ user, tool, now }) => {
  const emailsArr = tool.emails.map((email) => email.emailAddress).join(', ');
  const endDate = new Date(tool.endDate);
  const renewalDate = new Date(tool.renewalDate);

  const msUntilEnd = endDate.getTime() - now.getTime();
  const minutesUntilEnd = msUntilEnd / (1000 * 60);

  if (minutesUntilEnd > 0 && minutesUntilEnd <= 15 && !tool.notifiedExpireSoon) {
    const success = await sendEmail({
      to: user.notificationEmail,
      subject: `Alert: ${tool.toolName} limit expires soon`,
      html: buildAlertEmail({
        user,
        tool,
        emailsArr,
        subject: `${tool.toolName} limit expires soon`,
        intro: `Your tracked access window for ${tool.toolName} will end within the next hour. Review the linked email IDs below so you can renew or switch accounts in time.`,
        statusLabel: 'Status',
        statusValue: `Expiring before ${formatDateTime(endDate)}`,
        accent: 'amber',
      }),
    });

    if (success) {
      tool.notifiedExpireSoon = true;
      await tool.save();
    }
  }

  if (minutesUntilEnd <= 0 && minutesUntilEnd >= -15 && !tool.notifiedExpired) {
    const success = await sendEmail({
      to: user.notificationEmail,
      subject: `Limit reached: ${tool.toolName}`,
      html: buildAlertEmail({
        user,
        tool,
        emailsArr,
        subject: `${tool.toolName} limit reached`,
        intro: `The tracked usage limit for ${tool.toolName} has ended. This alert includes the linked email IDs and the scheduled renewal details for your records.`,
        statusLabel: 'Status',
        statusValue: `Limit reached at ${formatDateTime(endDate)}`,
        accent: 'rose',
      }),
    });

    if (success) {
      tool.notifiedExpired = true;
      await tool.save();
    }
  }

  const minutesFromRenewal = (now.getTime() - renewalDate.getTime()) / (1000 * 60);

  if (minutesFromRenewal >= 0 && minutesFromRenewal <= 15 && !tool.notifiedRenewal) {
    const success = await sendEmail({
      to: user.notificationEmail,
      subject: `Renewal available: ${tool.toolName}`,
      html: buildAlertEmail({
        user,
        tool,
        emailsArr,
        subject: `${tool.toolName} renewal is active`,
        intro: `Your renewal window for ${tool.toolName} is now active. You can use the linked email IDs below and verify the current renewal status before continuing.`,
        statusLabel: 'Renewal Status',
        statusValue: `Active from ${formatDateTime(renewalDate)}`,
        accent: 'emerald',
      }),
    });

    if (success) {
      tool.notifiedRenewal = true;
      await tool.save();
    }
  }
};

const runNotificationSweep = async () => {
  console.log('Running background cron job for tool alerts...');

  try {
    const users = await User.find({}).lean();
    const now = new Date();

    for (const user of users) {
      const tools = await Tool.find({ user: user._id }).populate('emails');

      for (const tool of tools) {
        await processToolAlert({ user, tool, now });
      }
    }
  } catch (error) {
    console.error('Error in cron job:', error.message);
  }
};

const setupCronJobs = () => {
  cron.schedule('* * * * *', runNotificationSweep, {
    timezone: 'Asia/Kolkata',
  });
};

module.exports = { setupCronJobs, runNotificationSweep };
