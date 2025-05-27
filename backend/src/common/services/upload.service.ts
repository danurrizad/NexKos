import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadDir = 'uploads';

  constructor() {
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, fileName);

    // Write file to disk
    await fs.promises.writeFile(filePath, file.buffer);

    // Return the file path relative to the uploads directory
    return fileName;
  }

  async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(this.uploadDir, fileName);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
}
