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
      return { success: true, data };
    } catch (err) {
      console.error('Mail send error:', err);
      return { success: false, error: err };
    }
  }

  async sendTicketConfirmationEmail(to: string, userName: string, raffleTitle: string, productName: string, ticketNumbers: number[], raffleId: string) {
    try {
      const numbersHtml = ticketNumbers
        .map(n => `<span style="display:inline-block; background:#101014; border:1px solid #85efac55; border-radius:10px; padding:10px 18px; margin:4px; color:#85efac; font-size:20px; font-weight:900; letter-spacing:0.5px;">#${String(n).padStart(4, '0')}</span>`)
        .join('');

      const raffleUrl = `https://bullcruxapp.com/productDetail/${raffleId}`;

      const { data, error } = await this.resend.emails.send({
        from: 'BullCrux <sorteos@bullcruxapp.com>',
        to,
        subject: `🎟️ Ya estás participando en el sorteo de ${productName}`,
        html: `
          <div style="font-family: -apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #101014; color: #fafafa; padding: 40px 24px;">
            <div style="text-align: center; margin-bottom: 8px;">
              <div style="width: 60px; height: 60px; background: rgba(133, 239, 172, 0.12); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 20px;">🎟️</div>
              <h1 style="color: #fafafa; font-size: 24px; font-weight: 800; margin: 0 0 8px; letter-spacing: -0.02em;">¡Listo, ${userName}!</h1>
              <p style="color: #a0a3a7; font-size: 14px; margin: 0;">Tu participación en el sorteo quedó confirmada</p>
            </div>

            <div style="background: #18181c; border: 1px solid #272a2d; border-radius: 16px; padding: 28px 24px; margin: 28px 0; text-align: center;">
              <p style="margin: 0 0 6px; color: #6b6e72; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">Sorteo</p>
              <p style="margin: 0 0 24px; color: #fafafa; font-size: 19px; font-weight: 800;">${productName}</p>

              <p style="margin: 0 0 12px; color: #6b6e72; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">
                ${ticketNumbers.length > 1 ? 'Tus números de participación' : 'Tu número de participación'}
              </p>
              <div style="margin-bottom: 24px;">${numbersHtml}</div>

              <a href="${raffleUrl}" style="display: inline-block; background: #85efac; color: #101014; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 28px; border-radius: 12px;">
                Ver mi sorteo →
              </a>
            </div>

            <p style="text-align: center; color: #6b6e72; font-size: 12px; margin: 32px 0 0; line-height: 1.6;">
              Guardá este mail — si tu número sale sorteado, te vamos a contactar acá mismo.<br/>
              BullCrux · <a href="https://bullcruxapp.com" style="color: #85efac; text-decoration: none;">bullcruxapp.com</a>
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
