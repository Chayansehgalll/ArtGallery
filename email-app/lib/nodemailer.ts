import nodemailer, { Transporter } from 'nodemailer'

/**
 * Singleton nodemailer transporter instance.
 * This ensures we only create one transporter instance for the entire application.
 */
class NodemailerSingleton {
  private static instance: Transporter | null = null

  private constructor() {}

  public static getInstance(): Transporter {
    if (!NodemailerSingleton.instance) {
      NodemailerSingleton.instance = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      })
    }

    return NodemailerSingleton.instance
  }
}

export const transporter = NodemailerSingleton.getInstance()
