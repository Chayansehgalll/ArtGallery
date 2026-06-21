import { transporter } from './nodemailer'
import type { Attachment } from 'nodemailer/lib/mailer'

export interface EmailOptions {
  to: string
  subject: string
  body: string
  isHtml?: boolean
  attachments?: Attachment[]
}

/**
 * Send email using the singleton nodemailer transporter.
 * This function reuses the same transporter instance across all email sends.
 */
export async function sendEmail({ to, subject, body, isHtml = true, attachments }: EmailOptions) {
  try {
    const mailOptions = {
      from: `"Email Service" <${process.env.MAIL_USER}>`,
      to,
      subject,
      ...(isHtml ? { html: body } : { text: body }),
      ...(attachments && attachments.length > 0 ? { attachments } : {}),
    }

    const info = await transporter.sendMail(mailOptions)
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
    }
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send email')
  }
}
