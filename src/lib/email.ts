import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'HybridTradeAI <noreply@hybridtradeai.com>';

export type EmailTemplate = {
  subject: string;
  html: string;
};

export const TEMPLATES = {
  depositPending: (amount: number, currency: string, txId: string) => ({
    subject: `Deposit Initiated - ${currency} ${amount}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Deposit Initiated</h1>
        <p>Hello,</p>
        <p>We have received your request to deposit <strong>${amount} ${currency}</strong>.</p>
        <p>Transaction ID: <code style="background: #eee; padding: 4px;">${txId}</code></p>
        <p>Please complete the payment if you haven't already. Your wallet will be credited automatically once the network confirms the transaction.</p>
        <p>Best regards,<br/>The HybridTradeAI Team</p>
      </div>
    `
  }),
  depositConfirmed: (amount: number, currency: string, newBalance: number) => ({
    subject: `Deposit Confirmed - ${currency} ${amount}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #22c55e;">Deposit Successful!</h1>
        <p>Great news!</p>
        <p>Your deposit of <strong>${amount} ${currency}</strong> has been confirmed and credited to your wallet.</p>
        <p>Your new balance is: <strong>${newBalance} ${currency}</strong></p>
        <p>You can now invest in a plan to start earning ROI.</p>
        <div style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
        </div>
        <p>Best regards,<br/>The HybridTradeAI Team</p>
      </div>
    `
  }),
  withdrawalRequested: (amount: number, currency: string) => ({
    subject: `Withdrawal Requested - ${currency} ${amount}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">Withdrawal Pending</h1>
        <p>We have received your request to withdraw <strong>${amount} ${currency}</strong>.</p>
        <p>Our team is reviewing the request. Processing typically takes 24-48 hours.</p>
        <p>Best regards,<br/>The HybridTradeAI Team</p>
      </div>
    `
  })
};

export async function sendEmail(to: string, template: EmailTemplate) {
  if (!resend) {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${template.subject}`);
    return { success: true, id: 'mock-id' };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: template.subject,
      html: template.html,
    });
    return { success: true, id: data.data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
