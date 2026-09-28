import { Repository } from "typeorm";
import { Medal as MedalDomain } from "../../domain/Medal";
import { Medal as MedalEntity } from "../entities/Medal";
import { MedalPort } from "../../domain/port/MedalPort";
import { AppDataSource, connectToDatabase } from "../config/data-base";

export class MedalAdapter implements MedalPort {
    // Método asíncrono que garantiza la conexión antes de obtener el repositorio
    private async getRepository(): Promise<Repository<MedalEntity>> {
        await connectToDatabase();
        return AppDataSource.getRepository(MedalEntity);
    }

    private toDomain(entity: MedalEntity): MedalDomain {
        return {
            id: entity.id_medal,
            name: entity.name_medal,
            pointsRequired: entity.points_required,
            status: entity.status_medal,
        };
    }

    private toEntity(domain: Omit<MedalDomain, "id">): MedalEntity {
        const entity = new MedalEntity();
        entity.name_medal = domain.name;
        entity.points_required = domain.pointsRequired;
        entity.status_medal = domain.status;
        return entity;
    }

    async createMedal(medal: Omit<MedalDomain, "id">): Promise<number> {
        try {
            const repo = await this.getRepository();
            const saved = await repo.save(this.toEntity(medal));
            return saved.id_medal;
        } catch (error) {
            console.error("Error creating medal:", error);
            throw error;
        }
    }

    async updateMedal(id: number, medal: Partial<MedalDomain>): Promise<boolean> {
        try {
            const repo = await this.getRepository();
            const existing = await repo.findOne({ where: { id_medal: id } });
            if (!existing) return false;

            Object.assign(existing, {
                name_medal: medal.name ?? existing.name_medal,
                points_required: medal.pointsRequired ?? existing.points_required,
                status_medal: medal.status ?? existing.status_medal,
            });

            await repo.save(existing);
            return true;
        } catch (error) {
            console.error("Error updating medal:", error);
            throw error;
        }
    }

    async deleteMedal(id: number): Promise<boolean> {
        try {
            const repo = await this.getRepository();
            const existing = await repo.findOne({ where: { id_medal: id } });
            if (!existing) return false;
            Object.assign(existing, { status_medal: 0 });
            await repo.save(existing);
            return true;
        } catch (error) {
            console.error("Error deleting medal:", error);
            throw error;
        }
    }

    async getMedalById(id: number): Promise<MedalDomain | null> {
        try {
            const repo = await this.getRepository();
            const medal = await repo.findOne({ where: { id_medal: id } });
            return medal ? this.toDomain(medal) : null;
        } catch (error) {
            console.error("Error fetching medal by ID:", error);
            throw error;
        }
    }

    async getMedalByName(name: string): Promise<MedalDomain | null> {
        try {
            const repo = await this.getRepository();
            const medal = await repo.findOne({ where: { name_medal: name } });
            return medal ? this.toDomain(medal) : null;
        } catch (error) {
            console.error("Error fetching medal by name:", error);
            throw error;
        }
    }

    async getAllMedals(): Promise<MedalDomain[]> {
        try {
            const repo = await this.getRepository();
            const medals = await repo.find({ where: { status_medal: 1 } });
            return medals.map((m) => this.toDomain(m));
        } catch (error) {
            console.error("Error fetching all medals:", error);
            throw error;
        }
    }
}
