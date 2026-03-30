import { Injectable } from '@nestjs/common';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { Payment, Preference } from 'mercadopago';
import { mpClient } from 'src/mercadopago.config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentsService{

    constructor(private prisma: PrismaService) {}

    async createPreference(productDetails?:any) {
        const preference = new Preference(mpClient);

        const transaction = await this.prisma.transaction.create({
            data: {
                userId: productDetails?.userId || 'default-user-id',
                type: TransactionType.DEPOSIT,
                amount: productDetails?.price || 1,
                description: productDetails?.title || 'Plan Premium',
                status: TransactionStatus.PENDING,
            }
        });

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: productDetails?.id || 'prod-001',
                        title: productDetails?.title || 'Plan Premium',
                        quantity: 1,
                        unit_price: productDetails?.price || 1,
                        currency_id: 'ARS',
                    },
                ],
                back_urls: {
                    success: process.env.URL_FRONTEND + '/cartera',
                    failure: process.env.URL_FRONTEND + '/payments/failure',
                    pending: process.env.URL_FRONTEND + '/payments/pending',
                },
                auto_return: 'approved',
                notification_url: process.env.URL_BACKEND + '/payments/webhook',
                external_reference: transaction.id,
                expires: true,
                expiration_date_from: new Date().toISOString(),
                expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expira en 24 horas
            },
        });

        return result;
    }


    async validatePayment(paymentId: string) {
        const payment = new Payment(mpClient);
        const result = await payment.get({ id: paymentId });

        return result;
    }


    async updateTransaction(transactionId: string, status: TransactionStatus) {
        return this.prisma.transaction.update({
            where: { id: transactionId },
            data: { status },
        });
    }


    async grantCoinsToUser(userId: string, coins: number) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { balanceCoins: { increment: coins } },
        });
    }

}