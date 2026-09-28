import { Repository } from "typeorm";
import { RecyclingRecord as RecyclingRecordDomain } from "../../domain/RecyclingRecord";
import { RecyclingRecord as RecyclingRecordEntity } from "../entities/RecyclingRecord";
import { User } from "../entities/User";
import { RecyclingPoint } from "../entities/RecyclingPoint";
import { Medal } from "../entities/Medal";
import { UserMedal } from "../entities/UserMedal";
import { CreateRecordResult, RecyclingRecordPort } from "../../domain/port/RecyclingRecordPort";
import { AppDataSource, connectToDatabase } from "../config/data-base";

export class RecyclingRecordAdapter implements RecyclingRecordPort {
    // Métodos asíncronos para garantizar la conexión antes de obtener los repositorios
    private async getRecordRepository(): Promise<Repository<RecyclingRecordEntity>> {
        await connectToDatabase();
        return AppDataSource.getRepository(RecyclingRecordEntity);
    }

    private async getUserRepository(): Promise<Repository<User>> {
        await connectToDatabase();
        return AppDataSource.getRepository(User);
    }

    private async getPointRepository(): Promise<Repository<RecyclingPoint>> {
        await connectToDatabase();
        return AppDataSource.getRepository(RecyclingPoint);
    }

    private async getMedalRepository(): Promise<Repository<Medal>> {
        await connectToDatabase();
        return AppDataSource.getRepository(Medal);
    }

    private async getUserMedalRepository(): Promise<Repository<UserMedal>> {
        await connectToDatabase();
        return AppDataSource.getRepository(UserMedal);
    }

    private toDomain(entity: RecyclingRecordEntity): RecyclingRecordDomain {
        return {
            id: entity.id_record,
            userId: entity.user_id,
            pointId: entity.point_id,
            pointsEarned: entity.points_earned,
            recycledAt: entity.recycled_at,
            status: entity.status_record,
        };
    }

    private toEntity(domain: Omit<RecyclingRecordDomain, "id" | "recycledAt">): RecyclingRecordEntity {
        const entity = new RecyclingRecordEntity();
        entity.user_id = domain.userId;
        entity.point_id = domain.pointId;
        entity.points_earned = domain.pointsEarned;
        entity.status_record = domain.status;
        return entity;
    }

    async userExistsActive(userId: number): Promise<boolean> {
        try {
            const userRepo = await this.getUserRepository();
            const user = await userRepo.findOne({
                where: { id_user: userId, status_user: 1 },
            });
            return user !== null;
        } catch (error) {
            console.error("Error checking active user:", error);
            throw error;
        }
    }

    async pointExistsActive(pointId: number): Promise<boolean> {
        try {
            const pointRepo = await this.getPointRepository();
            const point = await pointRepo.findOne({
                where: { id_point: pointId, status_point: 1 },
            });
            return point !== null;
        } catch (error) {
            console.error("Error checking active point:", error);
            throw error;
        }
    }

    private async getUserTotalPoints(userId: number): Promise<number> {
        const recordRepo = await this.getRecordRepository();
        const records = await recordRepo.find({
            where: { user_id: userId, status_record: 1 },
        });
        return records.reduce((sum, record) => sum + record.points_earned, 0);
    }

    private async awardMedals(userId: number, totalPoints: number): Promise<string[]> {
        const medalRepo = await this.getMedalRepository();
        const userMedalRepo = await this.getUserMedalRepository();

        const medals = await medalRepo.find({ where: { status_medal: 1 } });
        const earnedNames: string[] = [];

        for (const medal of medals) {
            if (totalPoints < medal.points_required) continue;

            const alreadyHas = await userMedalRepo.findOne({
                where: { user_id: userId, medal_id: medal.id_medal },
            });
            if (alreadyHas) continue;

            const userMedal = new UserMedal();
            userMedal.user_id = userId;
            userMedal.medal_id = medal.id_medal;
            await userMedalRepo.save(userMedal);
            earnedNames.push(medal.name_medal);
        }

        return earnedNames;
    }

    async createRecord(record: Omit<RecyclingRecordDomain, "id" | "recycledAt">): Promise<CreateRecordResult> {
        try {
            const recordRepo = await this.getRecordRepository();
            const saved = await recordRepo.save(this.toEntity(record));
            const totalPoints = await this.getUserTotalPoints(record.userId);
            const newMedals = await this.awardMedals(record.userId, totalPoints);

            return {
                recordId: saved.id_record,
                totalPoints,
                newMedals,
            };
        } catch (error) {
            console.error("Error creating recycling record:", error);
            throw error;
        }
    }

    async updateRecord(id: number, record: Partial<RecyclingRecordDomain>): Promise<boolean> {
        try {
            const recordRepo = await this.getRecordRepository();
            const existing = await recordRepo.findOne({ where: { id_record: id } });
            if (!existing) return false;

            Object.assign(existing, {
                user_id: record.userId ?? existing.user_id,
                point_id: record.pointId ?? existing.point_id,
                points_earned: record.pointsEarned ?? existing.points_earned,
                status_record: record.status ?? existing.status_record,
            });

            await recordRepo.save(existing);
            return true;
        } catch (error) {
            console.error("Error updating recycling record:", error);
            throw error;
        }
    }

    async deleteRecord(id: number): Promise<boolean> {
        try {
            const recordRepo = await this.getRecordRepository();
            const existing = await recordRepo.findOne({ where: { id_record: id } });
            if (!existing) return false;
            Object.assign(existing, { status_record: 0 });
            await recordRepo.save(existing);
            return true;
        } catch (error) {
            console.error("Error deleting recycling record:", error);
            throw error;
        }
    }

    async getRecordById(id: number): Promise<RecyclingRecordDomain | null> {
        try {
            const recordRepo = await this.getRecordRepository();
            const record = await recordRepo.findOne({ where: { id_record: id } });
            return record ? this.toDomain(record) : null;
        } catch (error) {
            console.error("Error fetching recycling record by ID:", error);
            throw error;
        }
    }

    async getAllRecords(): Promise<RecyclingRecordDomain[]> {
        try {
            const recordRepo = await this.getRecordRepository();
            const records = await recordRepo.find({ where: { status_record: 1 } });
            return records.map((r) => this.toDomain(r));
        } catch (error) {
            console.error("Error fetching all recycling records:", error);
            throw error;
        }
    }

    async getRecordsByUserId(userId: number): Promise<RecyclingRecordDomain[]> {
        try {
            const recordRepo = await this.getRecordRepository();
            const records = await recordRepo.find({
                where: { user_id: userId, status_record: 1 },
            });
            return records.map((r) => this.toDomain(r));
        } catch (error) {
            console.error("Error fetching recycling records by user ID:", error);
            throw error;
        }
    }
}
