import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule ,JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    DatabaseModule, 
    UserModule,
    PassportModule,
    JwtModule.register({
        secret: jwtConstants.secret,
        signOptions: { expiresIn: "365d" }
    })],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService,JwtModule]
})
export class AuthModule {}
