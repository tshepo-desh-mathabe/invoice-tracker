import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'app_config' })
export class Configuration {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ length: 50, unique: true })
    name: string;

    @Column({ length: 100 })
    value: string;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'NOW()' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'NOW()' })
    updatedAt: Date;

    @Column({ length: 50, name: 'updated_by' })
    updatedBy: string;
}
