import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { UserModule } from './modules/user/user.module';
import { mailerConstants } from './constants';

@Module({
  imports: [AuthModule, DatabaseModule, UserModule,
    MailerModule.forRoot({
      transport: {
        host: "smtp.mailtrap.io",
        port: 2525,
        secure: false,
        auth: {
          user: mailerConstants.user,
          pass: mailerConstants.password,
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@localhost>',
      },
    }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
