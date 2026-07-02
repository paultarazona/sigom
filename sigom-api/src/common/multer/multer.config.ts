import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const multerOptions = {
  storage: diskStorage({
    destination: join(process.cwd(), 'uploads'),
    filename: (_req, file, callback) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  fileFilter: (_req: any, file: Express.Multer.File, callback: any) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return callback(
        new BadRequestException({
          code: 'UNSUPPORTED_FILE_TYPE',
          message: `Tipo de archivo no permitido: ${file.mimetype}. Usar: ${ALLOWED_MIME_TYPES.join(', ')}.`,
        }),
        false,
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
};
