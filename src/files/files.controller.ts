import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, fileName } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
    ) {}

  @Get('product/:imagePath')
  findProductImage(@Res() res: Response, @Param('imagePath') imagePath: string) {
    const path = this.filesService.getStaticImage(imagePath);
    return res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/products',
      filename: fileName
    })
  }))
  async uploadProductImage(@UploadedFile() file: Express.Multer.File){
    if ( !file ) throw new BadRequestException('Make sure that file is an image')
    const secureFile = `${this.configService.get('HOST_API')}/files/product/${file.filename}`
    return secureFile;
  }
}
