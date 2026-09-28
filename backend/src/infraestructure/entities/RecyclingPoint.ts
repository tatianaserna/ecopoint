import 'reflect-metadata';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('recycling_points')
export class RecyclingPoint {
    @PrimaryGeneratedColumn()
    id_point!: number;

    @Column({ type: 'integer', nullable: true })
    material_id!: number | null;

    @Column({ type: 'varchar', length: 255 })
    name_point!: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    address_point!: string;

    @Column({ type: 'decimal', precision: 10, scale: 8 })
    latitude!: number;

    @Column({ type: 'decimal', precision: 11, scale: 8 })
    longitude!: number;

    @Column({ type: 'integer', default: 1 })
    status_point!: number;
}
