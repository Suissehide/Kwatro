import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { createTransport, type Transporter } from 'nodemailer'
import { loadEnv } from '../config/env'
import type { Prisma } from '../generated/prisma/client'
import { JobsService } from '../jobs/jobs.service'

const MAIL_JOB = 'mail'

/** E-mail en HTML seul (gabarit dans mail.layout.ts). */
export type MailContent = { to: string; subject: string; html: string }

/**
 * E-mails transactionnels par SMTP : Mailpit en local (http://localhost:8025), Resend en production
 * (`SMTP_URL=smtps://resend:<clé API>@smtp.resend.com:465`). Envoi par la file pg-boss : nouvel essai
 * si le serveur ne répond pas, et rien ne part si la transaction appelante échoue.
 */
@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name)
  private readonly env = loadEnv()
  private readonly smtpUrl =
    this.env.SMTP_URL ?? (this.env.NODE_ENV === 'production' ? null : 'smtp://localhost:1025')
  private readonly transport: Transporter | null = this.smtpUrl
    ? createTransport(this.smtpUrl)
    : null

  constructor(private readonly jobs: JobsService) {}

  async onModuleInit() {
    await this.jobs.handle<MailContent>(MAIL_JOB, (mail) => this.deliver(mail))
  }

  /** Avec `tx`, l'e-mail ne part que si la transaction est validée. */
  send(mail: MailContent, tx?: Prisma.TransactionClient) {
    return this.jobs.send(MAIL_JOB, mail, {}, tx)
  }

  private async deliver(mail: MailContent) {
    if (!this.transport) {
      this.logger.warn(`SMTP_URL absent : e-mail « ${mail.subject} » non envoyé`)
      return
    }
    await this.transport.sendMail({ from: this.env.MAIL_FROM, ...mail })
  }
}
