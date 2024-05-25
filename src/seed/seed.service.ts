import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }
  async runSeed() {
    try {
      await this.deleteTables();
      const firstUser = await this.insertNewUsers();
      await this.insertNewProducts(firstUser);
      return { message: 'seed successfully' }
    } catch (error) {
      console.log(error);
    }
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    queryBuilder
      .delete()
      .where({})
      .execute();
  }

  private async insertNewProducts(firstUser: User) {
    await this.productsService.deleteAllProducts();
    const products = initialData.products;
    const insertPromise = [];
    products.map(product => {
      insertPromise.push(this.productsService.create(product, firstUser));
    })
    await Promise.all(insertPromise); //SIRVE PARA QUE EN EL FOREACH SE INSERTE TODOS LOS DATOS
    
    return true;
  }

  private async insertNewUsers() {
    const seedusers = initialData.users;
    const users: User[] = [];
    seedusers.forEach(user => {
      // const result = await this.userRepository.createQueryBuilder()
      //   .insert()
      //   .into(User)
      //   .values(user)
      //   .execute();
      // users.push(result.raw);
      users.push(
        this.userRepository.create(user)
      )
    })
    const dbUser = await this.userRepository.save(seedusers);
    return dbUser[0];
  }
}
