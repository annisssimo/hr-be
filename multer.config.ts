import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export const multerConfig = {
    storage: diskStorage({
        destination: './uploads', // Папка для сохранения файлов
        filename: (req, file, callback) => {
            const filename = `${uuidv4()}${path.extname(file.originalname)}`;
            callback(null, filename);
        },
    }),
};
