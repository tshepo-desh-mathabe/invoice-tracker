import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Pick env file dynamically
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
const envPath = path.resolve(__dirname, envFile);

config({ path: envPath });

console.log('Using DB config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  hasPassword: !!process.env.DB_PASSWORD,
});

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [path.join(__dirname, 'src/**/*.entity.ts')],
  migrations: [path.join(__dirname, 'src/migrations/*.ts')],
  synchronize: false,
  migrationsRun: process.env.NODE_ENV === 'production',
});
