import {
    Controller, Post, Param,
    UseInterceptors, UploadedFiles,
    BadRequestException
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express'; // 👈 FilesInterceptor (plural)
import { diskStorage } from 'multer';
import { extname } from 'path';
import { File as MulterFile } from 'multer';
import * as fs from 'fs';

@Controller('upload')
export class UploadController {

    @Post('post/:postId/images')
    @UseInterceptors(FilesInterceptor('files', 10, {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const postId = req.params.postId;
                const folder = `${process.env.UPLOAD_PATH}/posts/${postId}`;
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
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por imagen
    }))
    uploadImages(
        @Param('postId') postId: string,
        @UploadedFiles() files: MulterFile[]  // 👈 array de archivos
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No se recibieron imágenes');
        }

        const urls = files.map(file => ({
            filename: file.filename,
            url: `${process.env.BASE_URL}/uploads/posts/${postId}/${file.filename}`,
        }));

        return {
            postId,
            total: files.length,
            images: urls,
        };
    }
}