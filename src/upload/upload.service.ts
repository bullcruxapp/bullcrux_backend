import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { File as MulterFile } from 'multer';
import * as fs from 'fs';

@Injectable()
export class UploadService {

    constructor(private readonly prisma: PrismaService) {}

    async saveRaffleImages(raffleId: string, files: MulterFile[]) {
        // Verificar que la raffle existe
        const raffle = await this.prisma.raffle.findUnique({
            where: { id: raffleId },
            include: { productImages: true },
        });

        if (!raffle) {
            // Limpiar archivos subidos si la raffle no existe
            files.forEach(file => fs.unlinkSync(file.path));
            throw new NotFoundException(`Raffle ${raffleId} no encontrada`);
        }

        const currentCount = raffle.productImages.length;

        const images = await this.prisma.$transaction(
            files.map((file, index) =>
                this.prisma.raffleImage.create({
                    data: {
                        url: `${process.env.BASE_URL}/uploads/raffles/${raffleId}/${file.filename}`,
                        order: currentCount + index,
                        raffleId,
                    },
                })
            )
        );

        return images;
    }

    async deleteRaffleImage(raffleId: string, imageId: string) {
        const image = await this.prisma.raffleImage.findFirst({
            where: { id: imageId, raffleId },
        });

        if (!image) {
            throw new NotFoundException('Imagen no encontrada');
        }

        // Eliminar archivo del disco
        const filename = image.url.split('/').pop();
        const filePath = `${process.env.UPLOAD_PATH}/raffles/${raffleId}/${filename}`;
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Eliminar de la base de datos
        await this.prisma.raffleImage.delete({ where: { id: imageId } });

        // Reordenar las imágenes restantes
        const remaining = await this.prisma.raffleImage.findMany({
            where: { raffleId },
            orderBy: { order: 'asc' },
        });

        await this.prisma.$transaction(
            remaining.map((img, index) =>
                this.prisma.raffleImage.update({
                    where: { id: img.id },
                    data: { order: index },
                })
            )
        );
    }
}