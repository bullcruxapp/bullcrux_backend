import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendWinnerEmail(to: string, winnerName: string, raffleTitle: string, productName: string, ticketNumber: number) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'BullCrux <ganador@bullcruxapp.com>',
        to,
        subject: `🏆 ¡Ganaste el sorteo de ${productName}!`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="font-size: 64px; margin-bottom: 16px;">🏆</div>
              <h1 style="color: #FFD700; font-size: 32px; margin: 0 0 8px;">¡Felicitaciones, ${winnerName}!</h1>
              <p style="color: #aaa; font-size: 16px; margin: 0;">Ganaste el sorteo de BullCrux</p>
            </div>
            <div style="background: #1a1a1a; border: 1px solid #FFD70044; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; color: #888; font-size: 13px; text-transform: uppercase;">Premio</p>
              <p style="margin: 0 0 20px; color: #fff; font-size: 20px; font-weight: 700;">${productName}</p>
              <p style="margin: 0 0 8px; color: #888; font-size: 13px; text-transform: uppercase;">Tu ticket ganador</p>
              <p style="margin: 0; color: #FFD700; font-size: 48px; font-weight: 900;">#${ticketNumber}</p>
            </div>
            <div style="background: #ABDA5322; border-left: 3px solid #ABDA53; padding: 16px; border-radius: 8px; margin-bottom: 32px;">
              <p style="margin: 0; color: #fff; font-size: 14px; line-height: 1.5;">
                <strong>Próximos pasos:</strong> En las próximas 48 horas nos vamos a contactar con vos para coordinar la entrega del premio. Respondé este email con tus datos de contacto y dirección de envío.
              </p>
            </div>
            <p style="text-align: center; color: #666; font-size: 12px; margin: 32px 0 0;">
              BullCrux · <a href="https://bullcruxapp.com" style="color: #ABDA53; text-decoration: none;">bullcruxapp.com</a>
            </p>
          </div>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error };
      }
  async sendTicketConfirmationEmail(to: string, userName: string, raffleTitle: string, productName: string, ticketNumbers: number[]) {
    try {
      const numbersHtml = ticketNumbers
        .map(n => `<span style="display:inline-block; background:#1a1a1a; border:1px solid #ABDA5344; border-radius:8px; padding:8px 16px; margin:4px; color:#ABDA53; font-size:20px; font-weight:900;">#${n}</span>`)
        .join('');

      const { data, error } = await this.resend.emails.send({
        from: 'BullCrux <sorteos@bullcruxapp.com>',
        to,
        subject: `🎟️ Ya estás participando en el sorteo de ${productName}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="font-size: 56px; margin-bottom: 16px;">🎟️</div>
              <h1 style="color: #fff; font-size: 26px; margin: 0 0 8px;">¡Listo, ${userName}!</h1>
              <p style="color: #aaa; font-size: 15px; margin: 0;">Tu participación en el sorteo quedó confirmada</p>
            </div>
            <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
              <p style="margin: 0 0 8px; color: #888; font-size: 13px; text-transform: uppercase;">Sorteo</p>
              <p style="margin: 0 0 20px; color: #fff; font-size: 20px; font-weight: 700;">${productName}</p>
              <p style="margin: 0 0 12px; color: #888; font-size: 13px; text-transform: uppercase;">
                ${ticketNumbers.length > 1 ? 'Tus números de participación' : 'Tu número de participación'}
              </p>
              <div>${numbersHtml}</div>
            </div>
            <p style="text-align: center; color: #666; font-size: 12px; margin: 32px 0 0;">
              Guardá este mail — si tu número sale sorteado, te vamos a contactar acá mismo.<br/>
              BullCrux · <a href="https://bullcruxapp.com" style="color: #ABDA53; text-decoration: none;">bullcruxapp.com</a>
            </p>
          </div>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (err) {
      console.error('Mail send error:', err);
      return { success: false, error: err };
    }
  }
}
