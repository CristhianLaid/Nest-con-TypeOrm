import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { bcryptPlugin } from 'src/common/dto/plugin';

import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ){}

  async create(createAuthDto: CreateUserDto) {
    const { password, ...userData } = createAuthDto;
    try {
      const user = this.userRepository.create({
        ...userData,
        password: bcryptPlugin.hasSync(password)
      });

      await this.userRepository.save(user);
      delete user.password;
      return {...user, token: this.getJwtToken({id: user.id})};
    } catch (error) {
      this.handleDBError(error);
    }
  };

  async login(loginUserDto:LoginUserDto){
    const { email, password } = loginUserDto;
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        select: { email: true, password: true, id: true }
      })
      if (!user) throw new UnauthorizedException(`Credentials are not available {email}`);
      if( !bcryptPlugin.compareSync(password, user.password)) throw new UnauthorizedException('Credentials are not available {password}');
      return {...user, token: this.getJwtToken({id: user.id})};
    } catch (error) {
      this.handleDBError(error);
    }
  };

  private getJwtToken(payload: JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }

  async checkAuthStatus( user: User ){

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };

  }

  private handleDBError(error:any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail)
    }
    throw new InternalServerErrorException(error.message);
  };

}
