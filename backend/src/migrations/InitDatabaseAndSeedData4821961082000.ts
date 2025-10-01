import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDatabaseAndSeedData4821961082000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert seed data for bank_names if not exists
    await queryRunner.query(`
      INSERT INTO bank_name (name, branch_code)
      VALUES 
        ('FNB', '9012'),
        ('Capitec', '7827'),
        ('Nedbank', '6542'),
        ('Tymebank', '2245'),
        ('Discovery Bank', '5656'),
        ('SBSA', '9823')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert seed data for payment_methods if not exists
    await queryRunner.query(`
      INSERT INTO payment_method (name)
      VALUES 
          ('EFT'),
          ('CASH'),
          ('CREDIT CARD'),
          ('DEBIT CARD'),
          ('CREDIT')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert system configs
    await queryRunner.query(`
    INSERT INTO app_config (name, value, active, updated_by, created_at, updated_at)
    VALUES
      ('trx.percentage.vat', '0.15', true, 'admin', NOW(), NOW()),
      ('trx.percentage.bank.charges', '0.02', true, 'admin', NOW(), NOW()),
      ('trx.expiry.days', '5', true, 'admin', NOW(), NOW())
    ON CONFLICT (name) DO NOTHING;
  `);

    // Dev only testing data!
    if (process.env.NODE_ENV === 'development') {
      // Insert banking details for FNB and Capitec
      await queryRunner.query(`
        INSERT INTO bank_account (account_number, bank_name_id)
        VALUES
          ('1234567890', (SELECT id FROM bank_name WHERE name='FNB')),
          ('9876543210', (SELECT id FROM bank_name WHERE name='Capitec'))
        ON CONFLICT (account_number) DO NOTHING;
      `);

      // Insert 2 clients and link to their banking details
      await queryRunner.query(`
        INSERT INTO client (full_name, email, phone_number, bank_account_id)
        VALUES
          ('John Doe', 'john.doe@example.com', '+27123456789', (SELECT id FROM bank_account WHERE account_number='1234567890')),
          ('Jane Smith', 'jane.smith@example.com', '+27987654321', (SELECT id FROM bank_account WHERE account_number='9876543210'))
        ON CONFLICT (email) DO NOTHING;
      `);
    }
    
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Optionally delete only the seeded data
    await queryRunner.query(`
      DELETE FROM payment_method
      WHERE name IN ('EFT', 'CASH', 'CREDIT CARD', 'DEBIT CARD', 'CREDIT');
    `);

    await queryRunner.query(`
      DELETE FROM bank_name
      WHERE name IN ('FNB', 'Capitec', 'Nedbank', 'Tymebank', 'Discovery Bank', 'SBSA');
    `);
  }
}
