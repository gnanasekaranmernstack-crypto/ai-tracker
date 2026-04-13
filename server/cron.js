const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Tool = require('./models/Tool');
const User = require('./models/User');
const moment = require('moment');

const smtpConfig = {
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SENDER_EMAIL,
    pass: process.env.BREVO_API_KEY
  }
};

const transporter = nodemailer.createTransport(smtpConfig);

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"AI Tool Tracker <${process.env.BREVO_SENDER_EMAIL}>"`,
      to,
      subject,
      html
    });
    console.log(`Email sent to ${to} - Subject: ${subject}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

const setupCronJobs = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('Running background cron job for tool expiration checking...');
        try {
            const users = await User.find({});
            for (const user of users) {
                const tools = await Tool.find({ user: user._id }).populate('emails');
                const now = new Date();

                for (const tool of tools) {
                    const emailsArr = tool.emails.map(e => e.emailAddress).join(', ');
                    
                    // 1. Check expiration within 1 hour
                    const msUntilEnd = new Date(tool.endDate).getTime() - now.getTime();
                    const hoursUntilEnd = msUntilEnd / (1000 * 60 * 60);

                    if (hoursUntilEnd > 0 && hoursUntilEnd <= 1 && !tool.notifiedExpireSoon) {
                        await sendEmail(
                            user.notificationEmail,
                            `Action Required: ${tool.toolName} limit expiring in 1 hour`,
                            `<h3>Hello ${user.name},</h3><p>Your free limit for <b>${tool.toolName}</b> is expiring in less than an hour.</p><p>Accounts used: ${emailsArr || 'None specific'}</p>`
                        );
                        tool.notifiedExpireSoon = true;
                        await tool.save();
                    }

                    // 2. Check exactly expired
                    if (hoursUntilEnd <= 0 && !tool.notifiedExpired) {
                        await sendEmail(
                            user.notificationEmail,
                            `Notice: ${tool.toolName} limit reached`,
                            `<h3>Hello ${user.name},</h3><p>Your free limit for <b>${tool.toolName}</b> has ended.</p><p>Accounts used: ${emailsArr || 'None specific'}</p>`
                        );
                        tool.notifiedExpired = true;
                        await tool.save();
                    }

                    // 3. Check renewal reached
                    const msFromRenewal = now.getTime() - new Date(tool.renewalDate).getTime();
                    const hoursFromRenewal = msFromRenewal / (1000 * 60 * 60);

                    if (hoursFromRenewal >= 0 && hoursFromRenewal <= 24 && !tool.notifiedRenewal) {
                        await sendEmail(
                            user.notificationEmail,
                            `Renewal Available: ${tool.toolName}`,
                            `<h3>Hello ${user.name},</h3><p>Your free limit for <b>${tool.toolName}</b> has been renewed and is ready to use again.</p><p>Accounts used: ${emailsArr || 'None specific'}</p>`
                        );
                        tool.notifiedRenewal = true;
                        // Assuming tool is manually updated with new dates after renewal.
                        await tool.save();
                    }
                }
            }
        } catch (error) {
            console.error('Error in cron job:', error);
        }
    });
};

module.exports = { setupCronJobs };
