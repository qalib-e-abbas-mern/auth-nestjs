import { Module } from '@nestjs/common';
import { usersProviders } from '../user/users.provider';
import { databaseProviders } from './database.provider';


@Module({
    providers: [...databaseProviders,...usersProviders],
    exports: [...databaseProviders,...usersProviders]
})
export class DatabaseModule {}
