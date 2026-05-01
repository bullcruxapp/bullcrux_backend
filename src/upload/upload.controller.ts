import {
    Controller, Post, Param, Delete,
    UseInterceptors, UploadedFiles,
    BadRequestException, NotFoundException
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { File as MulterFile } from 'multer';
import * as fs from 'fs';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {

    constructor(private readonly uploadService: UploadService) {}

    @Post('raffle/:raffleId/images')
    @UseInterceptors(FilesInterceptor('files', 10, {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const raffleId = req.params.raffleId;
                const folder = `${process.env.UPLOAD_PATH}/raffles/${raffleId}`;
                fs.mkdirSync(folder, { recursive: true });
                cb(null, folder);
            },
            filename: (req, file, cb) => {
                const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
                cb(null, `${unique}${extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                return cb(new BadRequestException('Solo se permiten imágenes'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    }))
    async uploadRaffleImages(
        @Param('raffleId') raffleId: string,
        @UploadedFiles() files: MulterFile[]
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No se recibieron imágenes');
        }

        const images = await this.uploadService.saveRaffleImages(raffleId, files);

        return {
            raffleId,
            total: images.length,
            images,
        };
    }

    @Delete('raffle/:raffleId/images/:imageId')
    async deleteRaffleImage(
        @Param('raffleId') raffleId: string,
        @Param('imageId') imageId: string,
    ) {
        await this.uploadService.deleteRaffleImage(raffleId, imageId);
        return { message: 'Imagen eliminada correctamente' };
    }
}