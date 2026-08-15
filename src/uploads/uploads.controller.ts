import { Controller, Post, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { createReadStream } from 'fs';
import { join } from 'path';
import type { Response } from 'express';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  @Post()
  @ApiOperation({ summary: 'Upload a single file (image or pdf)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return {
      filename: file.filename,
      path: `/api/v1/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Download or view an uploaded file' })
  getFile(@Param('filename') filename: string, @Res({ passthrough: true }) res: Response): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'uploads', filename));
    
    // Set appropriate headers based on file extension can be done here, 
    // but StreamableFile handles basic streaming.
    return new StreamableFile(file);
  }
}
