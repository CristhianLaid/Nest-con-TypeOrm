import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ProductImage, Product } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger()

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) { };
  async create(createProductDto: CreateProductDto, user: User) {
    const { images = [], ...productDetails } = createProductDto;
    try {
      const product = this.productRepository.create({
        ...productDetails,
        user,
        images: images.map(image => this.productImageRepository.create({ url: image }))
      });
      
      await this.productRepository.save(product);
      return { ...product, images };
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, offset } = paginationDto;
    try {
      const productAll = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: { images: true }
      });
      return productAll;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: { images: true }
      });

      if (!product) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }

      return product;
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user:User) {
    const { images, ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({
      id,
      ...toUpdate
    });

    if (!product) throw new NotFoundException(`Product ${id} not found`);

    //QueryRUNNER
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // const productDB = this.findOne(id);
      // const updatedProduct = Object.assign(productDB, updateProductDto);

      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } })

        product.images = images.map(images => this.productImageRepository.create({ url: images }))
      };

      product.user = user;

      await queryRunner.manager.save(product)
      await queryRunner.commitTransaction()
      await queryRunner.release()

      return product;
    } catch (error) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()
      this.handleError(error);
    }
  }

  async remove(id: string) {
    try {
      this.findOne(id);
      return await this.productRepository.delete({ id });
    } catch (error) {
      this.handleError(error);
    }
  };

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('products');
    try {
      return await query
      .delete()
      .where({})
      .execute()
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.code === '23505') {
      const errorMessage = `No se puede actualizar el producto: el valor ya existe en la base de datos.`;
      this.logger.error(errorMessage);
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
    this.logger.error(error.message || error);
    throw new HttpException('Ha ocurrido un error interno.', HttpStatus.INTERNAL_SERVER_ERROR);

  }
}
