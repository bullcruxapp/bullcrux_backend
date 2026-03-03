import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { TransactionStatus } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async createPayment(@Body() productDetails: any) {
        const preference = await this.paymentsService.createPreference(productDetails);
        return preference;
    }

    @Get('success')
    async paymentSuccess(@Query('payment_id') paymentId: string) {
        const payment = await this.paymentsService.validatePayment(paymentId);

        console.log('Payment success:', payment);
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
    async webhook(
        @Query('type') type: string,
        @Query('data.id') dataId: string,
    ) {


        if( type === 'payment' ) {
            const payment = await this.paymentsService.validatePayment(dataId);

            if( payment.status.toUpperCase() === TransactionStatus.APPROVED ) {
                const externalReference = payment.external_reference;

                const updatedTransaction = await this.paymentsService.updateTransaction(externalReference, TransactionStatus.APPROVED);
                console.log('Updated transaction:', updatedTransaction);
                const userId = updatedTransaction.userId;
                const user = await this.paymentsService.grantCoinsToUser(userId, updatedTransaction.amount); // Otorgar 100 coins como ejemplo
                console.log('Updated user with coins:', user);

        }

        }

        return { received: true };
    }
}