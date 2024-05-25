import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
    getStaticImage(imagePath:string) {
        const path = join(__dirname, '../../static/products', imagePath);
        
        if ( !existsSync(path) ) throw new BadRequestException(`No product found with ${imagePath} `);
        
        return path;
    };
};
