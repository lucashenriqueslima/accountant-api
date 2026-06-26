import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { StorageService } from './storage.service';

/// Serve arquivos do driver local (dev). Em produção (S3) usa-se URL presigned.
@ApiExcludeController()
@Controller('files')
export class FilesController {
  constructor(private readonly storage: StorageService) {}

  @Public()
  @Get(':key')
  download(@Param('key') key: string, @Res() res: Response) {
    const stream = this.storage.getLocalStream(decodeURIComponent(key));
    stream.pipe(res);
  }
}
