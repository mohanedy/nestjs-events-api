import { Event } from '../events/event.entity';
import * as process from 'process';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { registerAs } from '@nestjs/config';
import { Attendee } from '../events/attendee.entity';
import { Profile } from '../auth/profile.entity';
import { User } from '../auth/user.entity';

export default registerAs(
  'orm.config',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Event, Attendee, Profile, User],
    synchronize: true,
  }),
);
