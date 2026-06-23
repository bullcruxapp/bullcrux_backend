import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { TransactionStatus } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createPayment(@Req() req: any, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPreference(req.user.id, dto.raffleId, dto.quantity);
  }

  @Get('success')
  async paymentSuccess(@Query('payment_id') paymentId: string, @Query('external_reference') externalReference: string) {
    const payment = await this.paymentsService.validatePayment(paymentId);
    console.log('Payment success:', payment);
    if (payment.status === 'approved' && externalReference) {
      const result = await this.paymentsService.confirmPayment(externalReference);
      console.log('Pago confirmado:', result);
    }
    return payment;
  }

  @Get('pending')
  async paymentPending(@Query('payment_id') paymentId: string) {
    const payment = await this.paymentsService.validatePayment(paymentId);
    console.log('Payment pending:', payment);
    return payment;
  }

  @Get('failure')
  async paymentFailure(@Query('payment_id') paymentId: string) {
    const payment = await this.paymentsService.validatePayment(paymentId);
    console.log('Payment failure:', payment);
    return payment;
  }

  @Post('webhook')
  async webhook(@Query('type') type: string, @Query('data.id') dataId: string, @Body() body: any) {
    console.log('Webhook received:', JSON.stringify(body));
    const eventType = type || body?.type;
    const paymentId = dataId || body?.data?.id;

    if (eventType !== 'payment' || !paymentId) {
      return { received: true };
    }

    const payment = await this.paymentsService.validatePayment(paymentId);
    const externalReference = payment.external_reference;

    if (!externalReference) {
      console.warn('Webhook sin external_reference, se ignora');
      return { received: true };
    }

    switch (payment.status) {
      case 'approved': {
        const result = await this.paymentsService.confirmPayment(externalReference);
        console.log('Pago aprobado, tickets generados:', result);
        break;
      }
      case 'rejected':
        await this.paymentsService.markTransaction(externalReference, TransactionStatus.REJECTED);
        break;
      case 'cancelled':
        await this.paymentsService.markTransaction(externalReference, TransactionStatus.CANCELLED);
        break;
      default:
        break;
    }
    return { received: true };
  }
}
