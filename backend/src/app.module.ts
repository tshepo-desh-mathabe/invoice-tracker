import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientModule } from './client/client.module';
import { BankNameModule } from './bank_name/bank_name.module';
import { BankingDetailsModule } from './banking_details/banking_details.module';
import { PaymentMethodModule } from './payment_method/payment_method.module';
import { TransactionModule } from './transaction/transaction.module';
import { InvoiceModule } from './invoice/invoice.module';
import { InvoiceItemModule } from './invoice_item/invoice_item.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 3600, // 1 hour default TTL
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('Database Config:', {
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: !!config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          nodeEnv: config.get<string>('NODE_ENV'),
        });

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: parseInt(config.get<string>('DB_PORT', '5432')),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: config.get<string>('NODE_ENV') !== 'production',
          migrationsRun: config.get<string>('NODE_ENV') === 'production',
          migrations: ['dist/migrations/*{.js,.ts}'],
        };
      },
    }),

    ClientModule,
    BankNameModule,
    BankingDetailsModule,
    PaymentMethodModule,
    TransactionModule,
    InvoiceModule,
    InvoiceItemModule,
    ConfigurationModule,
  ],
})
export class AppModule {}
