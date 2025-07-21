import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '45.82.72.96',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'spmarine_maria',
      password: process.env.DB_PASSWORD || 'P@ssw0rd12345',
      database: process.env.DB_NAME || 'spmarine_db',
      entities: [path.join(__dirname, '/../**/*.entity.{js,ts}')],
      // ssl: {
      //   // Enable SSL if required
      //   rejectUnauthorized: true, // Use this only for development
      // },
      extra: {
        // Additional MySQL driver options
        connectionLimit: 10,
      },
      retryAttempts: 5,
      retryDelay: 3000,
      connectTimeout: 30000,
    }),
  ],
  controllers: [],
  providers: [],
})
export class DatabaseModule {}
