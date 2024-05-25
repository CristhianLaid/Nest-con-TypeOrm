import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { Auth, RawHeaders, RoleProtected, getUser } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  createUser(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  };

  @Post('signin')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  };

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @getUser() user: User
  ) {
    return this.authService.checkAuthStatus( user );
  }

  @Get('private')
  @UseGuards(AuthGuard(), UserRoleGuard)
  // @SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected(ValidRoles.admin)
  privateRoute(
    @getUser() user:User, 
    @getUser('email') email:string,
    @RawHeaders() rawHeaders: string[],
    ){
    return {
      ok: true,
      user,
      email,
      rawHeaders,
    }
  }

  @Get('private2')
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  privateRoute2(
    @getUser() user:User, 
    @getUser('email') email:string,
    @RawHeaders() rawHeaders: string[],
    ){
    return {
      ok: true,
      user,
      email,
      rawHeaders,
    }
    }
}
