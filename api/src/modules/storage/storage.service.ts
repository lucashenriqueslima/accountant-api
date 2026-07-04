import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, existsSync } from 'node:fs';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';

export type StorageDriver = 's3' | 'local';

export interface UploadInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  /// prefixo da chave (ex.: `clients/<id>`)
  keyPrefix: string;
}

export interface UploadResult {
  key: string;
  driver: StorageDriver;
  size: number;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket?: string;
  private readonly localRoot: string;
  private readonly apiPublicUrl: string;
  private s3Client?: S3Client;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('AWS_S3_BUCKET') || undefined;
    this.localRoot = resolve(process.cwd(), this.config.get<string>('STORAGE_LOCAL_DIR', 'storage'));
    this.apiPublicUrl = this.config.get<string>('API_PUBLIC_URL', 'http://localhost:3333');
  }

  /// 's3' quando há bucket configurado; caso contrário 'local' (dev).
  get driver(): StorageDriver {
    return this.bucket ? 's3' : 'local';
  }

  private get s3(): S3Client {
    if (!this.s3Client) {
      this.s3Client = new S3Client({ region: this.config.get('AWS_REGION', 'us-east-1') });
    }
    return this.s3Client;
  }

  private sanitize(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  async upload({ buffer, originalName, mimeType, keyPrefix }: UploadInput): Promise<UploadResult> {
    const key = `${keyPrefix}/${randomUUID()}-${this.sanitize(originalName)}`;

    if (this.driver === 's3') {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );
    } else {
      const fullPath = join(this.localRoot, key);
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, buffer);
    }

    this.logger.log(`Arquivo enviado (${this.driver}): ${key}`);
    return { key, driver: this.driver, size: buffer.length };
  }

  /// URL para acessar o arquivo: presigned (S3) ou rota pública /api/files (local).
  async getUrl(key: string, driver: StorageDriver): Promise<string> {
    if (driver === 's3') {
      return getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
        expiresIn: 3600,
      });
    }
    return `${this.apiPublicUrl}/api/files/${encodeURIComponent(key)}`;
  }

  /// Conteúdo do arquivo como Buffer — usado para anexar arquivos a e-mails.
  async getBuffer(key: string, driver: StorageDriver): Promise<Buffer> {
    if (driver === 's3') {
      const res = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      const bytes = await res.Body?.transformToByteArray();
      if (!bytes) throw new NotFoundException('Arquivo não encontrado');
      return Buffer.from(bytes);
    }
    const fullPath = this.resolveLocal(key);
    if (!existsSync(fullPath)) throw new NotFoundException('Arquivo não encontrado');
    return readFile(fullPath);
  }

  async remove(key: string, driver: StorageDriver): Promise<void> {
    if (driver === 's3') {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } else {
      const fullPath = this.resolveLocal(key);
      if (existsSync(fullPath)) await unlink(fullPath);
    }
  }

  /// Stream de um arquivo local (usado pelo FilesController). Protege contra path traversal.
  getLocalStream(key: string) {
    const fullPath = this.resolveLocal(key);
    if (!existsSync(fullPath)) throw new NotFoundException('Arquivo não encontrado');
    return createReadStream(fullPath);
  }

  private resolveLocal(key: string): string {
    const fullPath = resolve(this.localRoot, key);
    if (!fullPath.startsWith(this.localRoot)) {
      throw new NotFoundException('Caminho inválido');
    }
    return fullPath;
  }
}
