import { Connection } from 'mongoose';
import { FORGET_PASSWORDS, FORGET_PASSWORD_REPOSITORY, USERS, USER_REPOSITORY } from 'src/constants';
import { ForgetPasswordSchema, UserSchema } from './user.schema';

export const usersProviders = [
  {
    provide: USER_REPOSITORY,
    useFactory: (connection: Connection) => connection.model(USERS, UserSchema),
    inject: ['DATABASE_CONNECTION'],
  },
  {
    provide: FORGET_PASSWORD_REPOSITORY,
    useFactory: (connection: Connection) =>
      connection.model(FORGET_PASSWORDS, ForgetPasswordSchema),
    inject: ["DATABASE_CONNECTION"]
  }
];